/**
 * ElasticRoomOrchestrator
 *
 * Permanent anchors never collapse. Overflow shards instantiate the
 * same venue template (Voltron auditorium copies) and may:
 *   WARMING → ACTIVE → DRAINING → COLLAPSED
 *
 * New arrivals fill healthy existing capacity first.
 * Underfilled overflows stop receiving new people (DRAINING) so they
 * empty naturally. They collapse only at zero occupancy.
 * Live users are not teleported (migration policy: never unless necessary
 * and never without a committed destination — Anti-Gravity finishes planner).
 *
 * Bots never count as occupancy.
 */

import {
  getAllAnchors,
  getAnchorBySlug,
  isAnchorSlug,
  type AnchorRoomDefinition,
} from "@/lib/live/AnchorRoomRegistry";
import {
  getVenueOccupancy,
  listAllOccupancies,
  type VenueOccupancy,
} from "@/lib/live/audienceRuntimeEngine";
import {
  getActiveSessions,
  endLiveSession,
  type LiveSession,
} from "@/lib/broadcast/globalLiveSessionStore";
import { removeSessionNow } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";
import { prisma } from "@/lib/prisma";
import {
  AUDIENCE_MIGRATION_POLICY,
  ELASTIC_SHARD_THRESHOLDS,
  MIGRATION_COMMIT_RULE,
  type AttendeeMeshIdentity,
  type MigrationCommitState,
  type ShardLifecycle,
  type VenueMeshAddress,
} from "@/lib/venues/VenuePlatformContract";
import { auditoriumMeshAddress, formatVenueMeshAddress } from "@/lib/venues/VenueMeshAddress";
import {
  activateVenueSceneInstance,
  drainVenueSceneInstance,
  requestVenueSceneInstance,
  releaseVenueSceneInstance,
} from "@/lib/venues/VenueSceneFactory";

export type OverflowRoom = {
  id: string;
  parentAnchorSlug: string;
  slug: string;
  title: string;
  templateId: string;
  createdAt: number;
  route: string;
  lifecycle: ShardLifecycle;
  auditoriumIndex: number;
  meshAddress: VenueMeshAddress;
  meshKey: string;
  drainingSince: number | null;
  underutilizedSince: number | null;
  expandReadySince: number | null;
  sceneInstanceId: string | null;
};

const overflowRooms = new Map<string, OverflowRoom>();
let overflowCounter = 0;
const lastExpandAt = new Map<string, number>();
const lastCollapseAt = new Map<string, number>();
const durablePlacements = new Map<string, AttendeePlacementRecord>();
const destinationReservations = new Map<string, DestinationReservation>();

export type RoomCapacityReport = {
  anchorSlug: string;
  realHumans: number;
  capacity: number;
  overflowThreshold: number;
  thresholdCount: number;
  needsOverflow: boolean;
  existingOverflowCount: number;
  activeShardCount: number;
  drainingShardCount: number;
};

export type OrchestratorAuditEvent = {
  ts: number;
  kind:
    | "overflow_created"
    | "overflow_closed"
    | "capacity_checked"
    | "anchor_restored"
    | "shard_draining"
    | "shard_reactivated"
    | "compaction_skipped";
  anchorSlug: string;
  detail: string;
};

const auditLog: OrchestratorAuditEvent[] = [];
const MAX_AUDIT = 500;

function audit(kind: OrchestratorAuditEvent["kind"], anchorSlug: string, detail: string): void {
  auditLog.push({ ts: Date.now(), kind, anchorSlug, detail });
  if (auditLog.length > MAX_AUDIT) auditLog.shift();
}

export type AttendeePlacementRecord = AttendeeMeshIdentity & {
  userId: string;
  slug: string;
  meshKey: string;
};

export type DestinationReservation = {
  userId: string;
  destSlug: string;
  destSeatId: string;
  destSectionOrZone: string;
  destMeshKey: string;
  reservedAt: number;
};

export type CompactionRecommendation = {
  userId: string;
  from: AttendeePlacementRecord;
  toSlug: string;
  toMeshKey: string;
  committed: false;
  state: "RECOMMENDED";
  rule: typeof MIGRATION_COMMIT_RULE;
};

export type PlacementCommitResult = {
  committed: boolean;
  state: MigrationCommitState;
  placement: AttendeePlacementRecord;
  reason: string;
};

export function getAudienceMigrationPolicy() {
  return AUDIENCE_MIGRATION_POLICY;
}

export function getMigrationCommitRule() {
  return MIGRATION_COMMIT_RULE;
}

export function getAttendeePlacement(userId: string): AttendeePlacementRecord | undefined {
  return durablePlacements.get(userId);
}

export async function syncOverflowRoomToDb(overflow: OverflowRoom): Promise<boolean> {
  try {
    const anchor = getAnchorBySlug(overflow.parentAnchorSlug);
    const maxCapacity = anchor?.maximumHumans ?? 40;
    await prisma.room.upsert({
      where: { id: overflow.id },
      create: {
        id: overflow.id,
        name: overflow.title,
        type: "LOUNGE",
        status: overflow.lifecycle === "COLLAPSED" ? "CLOSED" : "LIVE",
        ownerId: null,
        maxCapacity,
      },
      update: {
        status: overflow.lifecycle === "COLLAPSED" ? "CLOSED" : "LIVE",
        maxCapacity,
        name: overflow.title,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function closeOverflowInDb(overflowId: string): Promise<boolean> {
  try {
    await prisma.room.updateMany({
      where: { id: overflowId },
      data: { status: "CLOSED" },
    });
    return true;
  } catch {
    return false;
  }
}

export async function readRealOccupancyFromDb(roomId: string): Promise<number> {
  try {
    const activeThreshold = new Date(Date.now() - 30_000);
    const count = await prisma.roomPresence.count({
      where: {
        roomId,
        connected: true,
        lastSeenAt: { gt: activeThreshold },
      },
    });
    return count;
  } catch {
    return readRealOccupancy(roomId);
  }
}

export function resolveAnchor(slug: string): AnchorRoomDefinition {
  const anchor = getAnchorBySlug(slug);
  if (!anchor) throw new Error(`[ElasticRoomOrchestrator] Unknown anchor slug: ${slug}`);
  return anchor;
}

export function readRealOccupancy(venueSlug: string): number {
  const occ: VenueOccupancy = getVenueOccupancy(venueSlug);
  return occ.members.filter((m) => m.active && m.role !== "bot").length;
}

export function evaluateCapacity(anchorSlug: string): RoomCapacityReport {
  const anchor = resolveAnchor(anchorSlug);
  const realHumans = readRealOccupancy(anchorSlug);
  const thresholdCount = Math.ceil((anchor.overflowThreshold / 100) * anchor.maximumHumans);
  const siblings = getOverflowRoomsForAnchor(anchorSlug);
  const existingOverflowCount = siblings.length;
  const activeShardCount = siblings.filter((s) => s.lifecycle === "ACTIVE" || s.lifecycle === "WARMING").length;
  const drainingShardCount = siblings.filter((s) => s.lifecycle === "DRAINING").length;

  return {
    anchorSlug,
    realHumans,
    capacity: anchor.maximumHumans,
    overflowThreshold: anchor.overflowThreshold,
    thresholdCount,
    needsOverflow: realHumans >= thresholdCount,
    existingOverflowCount,
    activeShardCount,
    drainingShardCount,
  };
}

function nextAuditoriumIndex(anchorSlug: string): number {
  const existing = getOverflowRoomsForAnchor(anchorSlug).map((o) => o.auditoriumIndex);
  return existing.length === 0 ? 2 : Math.max(...existing) + 1;
}

export function createOverflow(anchorSlug: string): OverflowRoom {
  const anchor = resolveAnchor(anchorSlug);
  overflowCounter += 1;
  const auditoriumIndex = nextAuditoriumIndex(anchorSlug);
  const id = `overflow-${anchorSlug}-${overflowCounter}`;
  const slug = `${anchorSlug}-overflow-${overflowCounter}`;
  const meshAddress = auditoriumMeshAddress({
    eventId: `event-${anchorSlug}`,
    venueType: anchor.category.toLowerCase().replace(/_/g, "-"),
    clusterId: "main-bowl",
    auditoriumIndex,
  });
  const scene = requestVenueSceneInstance({
    templateId: anchor.overflowTemplateId,
    environmentVariant: "auditorium",
    shardAddress: meshAddress,
    roomId: slug,
    canonicalVenueDefinition: { templateId: anchor.overflowTemplateId, liveSlug: anchorSlug },
    appearance: {
      baseTierSkinId: "BASE_FREE",
      purchasedSkinId: null,
      seasonalVariantId: null,
      structureUnchanged: true,
    },
  });
  activateVenueSceneInstance(scene.id);
  lastExpandAt.set(anchorSlug, Date.now());

  const overflow: OverflowRoom = {
    id,
    parentAnchorSlug: anchorSlug,
    slug,
    title: `${anchor.title} · Auditorium ${auditoriumIndex}`,
    templateId: anchor.overflowTemplateId,
    createdAt: Date.now(),
    route: `${anchor.route}-overflow-${overflowCounter}`,
    lifecycle: "ACTIVE",
    auditoriumIndex,
    meshAddress,
    meshKey: formatVenueMeshAddress(meshAddress),
    drainingSince: null,
    underutilizedSince: null,
    expandReadySince: null,
    sceneInstanceId: scene.id,
  };
  overflowRooms.set(id, overflow);
  void syncOverflowRoomToDb(overflow).catch(() => {});
  audit("overflow_created", anchorSlug, `Created ${overflow.title} (${slug}) mesh ${overflow.meshKey} scene ${scene.id}`);
  return overflow;
}

function shardsAtHardCap(anchorSlug: string, capacity: number): boolean {
  const siblings = assignableOverflows(anchorSlug);
  const anchorFull = readRealOccupancy(anchorSlug) >= capacity;
  if (!anchorFull) return false;
  if (siblings.length === 0) return true;
  return siblings.every((o) => readRealOccupancy(o.slug) >= capacity);
}

function canExpand(anchorSlug: string, capacity: number): boolean {
  if (shardsAtHardCap(anchorSlug, capacity)) return true;
  const last = lastExpandAt.get(anchorSlug) ?? 0;
  const lastClose = lastCollapseAt.get(anchorSlug) ?? 0;
  const now = Date.now();
  if (now - last < ELASTIC_SHARD_THRESHOLDS.expandCooldownMs) return false;
  if (now - lastClose < ELASTIC_SHARD_THRESHOLDS.expandCooldownMs) return false;
  return true;
}

function assignableOverflows(anchorSlug: string): OverflowRoom[] {
  return getOverflowRoomsForAnchor(anchorSlug).filter(
    (o) => o.lifecycle === "ACTIVE" || o.lifecycle === "WARMING",
  );
}

export function assignParticipant(anchorSlug: string): {
  slug: string;
  isOverflow: boolean;
  meshKey: string | null;
  parentAnchorSlug: string;
} {
  const report = evaluateCapacity(anchorSlug);
  const anchor = resolveAnchor(anchorSlug);

  const anchorSpare = readRealOccupancy(anchorSlug) < anchor.maximumHumans;
  if (anchorSpare && !report.needsOverflow) {
    return { slug: anchorSlug, isOverflow: false, meshKey: null, parentAnchorSlug: anchorSlug };
  }

  for (const overflow of assignableOverflows(anchorSlug)) {
    const overflowReal = readRealOccupancy(overflow.slug);
    if (overflowReal < anchor.maximumHumans) {
      return {
        slug: overflow.slug,
        isOverflow: true,
        meshKey: overflow.meshKey,
        parentAnchorSlug: anchorSlug,
      };
    }
  }

  if (anchorSpare) {
    return { slug: anchorSlug, isOverflow: false, meshKey: null, parentAnchorSlug: anchorSlug };
  }

  if (!canExpand(anchorSlug, anchor.maximumHumans)) {
    return { slug: anchorSlug, isOverflow: false, meshKey: null, parentAnchorSlug: anchorSlug };
  }

  const newOverflow = createOverflow(anchorSlug);
  return {
    slug: newOverflow.slug,
    isOverflow: true,
    meshKey: newOverflow.meshKey,
    parentAnchorSlug: anchorSlug,
  };
}

export function getOverflowBySlug(slug: string): OverflowRoom | undefined {
  return getAllOverflowRooms().find((o) => o.slug === slug);
}

/**
 * Join target for an audience POST. Draining shards take no new people.
 * Occupants already inside stay until they leave.
 */
export function resolveJoinTarget(requestedSlug: string): {
  slug: string;
  isOverflow: boolean;
  meshKey: string | null;
  parentAnchorSlug: string | null;
} {
  if (isAnchorSlug(requestedSlug)) {
    return assignParticipant(requestedSlug);
  }

  const overflow = getOverflowBySlug(requestedSlug);
  if (!overflow) {
    return { slug: requestedSlug, isOverflow: false, meshKey: null, parentAnchorSlug: null };
  }

  if (overflow.lifecycle === "DRAINING") {
    return assignParticipant(overflow.parentAnchorSlug);
  }

  return {
    slug: overflow.slug,
    isOverflow: true,
    meshKey: overflow.meshKey,
    parentAnchorSlug: overflow.parentAnchorSlug,
  };
}

export function findOccupancySlugForUser(userId: string, preferredSlug: string): string {
  const preferred = getVenueOccupancy(preferredSlug);
  if (preferred.members.some((m) => m.userId === userId && m.active)) return preferredSlug;

  for (const slug of getSiblingSlugs(preferredSlug)) {
    const occ = getVenueOccupancy(slug);
    if (occ.members.some((m) => m.userId === userId && m.active)) return occ.venueSlug;
  }

  const anywhere = listAllOccupancies().find((o) =>
    o.members.some((m) => m.userId === userId && m.active),
  );
  return anywhere?.venueSlug ?? preferredSlug;
}

function getSiblingSlugs(slug: string): string[] {
  if (isAnchorSlug(slug)) {
    return [slug, ...getOverflowRoomsForAnchor(slug).map((o) => o.slug)];
  }
  const overflow = getOverflowBySlug(slug);
  if (overflow) {
    return [overflow.parentAnchorSlug, ...getOverflowRoomsForAnchor(overflow.parentAnchorSlug).map((o) => o.slug)];
  }
  return [slug];
}

/** Collapse only at zero occupancy. Occupied rooms are never destroyed. */
export function closeOverflow(overflowId: string): { ok: boolean; reason?: string } {
  const overflow = overflowRooms.get(overflowId);
  if (!overflow) return { ok: false, reason: "not_found" };

  const live = readRealOccupancy(overflow.slug);
  if (live > 0) {
    audit("compaction_skipped", overflow.parentAnchorSlug, `Refused collapse of ${overflow.slug} with ${live} humans`);
    return { ok: false, reason: "occupied" };
  }

  const sessions = getActiveSessions();
  const session = sessions.find((s) => s.roomId === overflow.slug);
  if (session) {
    endLiveSession(session.userId);
    void removeSessionNow(session.userId).catch(() => {});
  }

  overflow.lifecycle = "COLLAPSED";
  lastCollapseAt.set(overflow.parentAnchorSlug, Date.now());
  if (overflow.sceneInstanceId) {
    releaseVenueSceneInstance(overflow.sceneInstanceId);
  }
  overflowRooms.delete(overflowId);
  void closeOverflowInDb(overflowId).catch(() => {});
  audit("overflow_closed", overflow.parentAnchorSlug, `Collapsed empty ${overflow.slug}`);
  return { ok: true };
}

function updateShardLifecycle(overflow: OverflowRoom, now: number): void {
  const anchor = getAnchorBySlug(overflow.parentAnchorSlug);
  const cap = anchor?.maximumHumans ?? 1;
  const humans = readRealOccupancy(overflow.slug);
  const ratio = humans / Math.max(1, cap);
  const { collapseBelowRatio, collapseDwellMs } = ELASTIC_SHARD_THRESHOLDS;

  if (humans === 0) {
    closeOverflow(overflow.id);
    return;
  }

  if (overflow.lifecycle === "DRAINING") {
    if (ratio >= collapseBelowRatio) {
      overflow.lifecycle = "ACTIVE";
      overflow.drainingSince = null;
      overflow.underutilizedSince = null;
      if (overflow.sceneInstanceId) activateVenueSceneInstance(overflow.sceneInstanceId);
      audit("shard_reactivated", overflow.parentAnchorSlug, `${overflow.slug} returned to ACTIVE`);
    }
    return;
  }

  if (ratio < collapseBelowRatio) {
    if (overflow.underutilizedSince == null) overflow.underutilizedSince = now;
    const dwell = now - overflow.underutilizedSince;
    const siblings = assignableOverflows(overflow.parentAnchorSlug).filter((s) => s.id !== overflow.id);
    const anchorSpare = readRealOccupancy(overflow.parentAnchorSlug) < (anchor?.maximumHumans ?? 0);
    const canDrain = siblings.length > 0 || anchorSpare;
    if (canDrain && dwell >= collapseDwellMs) {
      overflow.lifecycle = "DRAINING";
      overflow.drainingSince = now;
      if (overflow.sceneInstanceId) drainVenueSceneInstance(overflow.sceneInstanceId);
      audit("shard_draining", overflow.parentAnchorSlug, `${overflow.slug} DRAINING — no new arrivals; occupants stay`);
    }
  } else {
    overflow.underutilizedSince = null;
  }
}

/** Right-size overflow shards. Never compact permanent anchors. Never teleport occupants. */
export function rebalanceParticipants(): {
  collapsed: string[];
  draining: string[];
  skippedOccupied: string[];
} {
  const collapsed: string[] = [];
  const draining: string[] = [];
  const skippedOccupied: string[] = [];
  const now = Date.now();
  const snapshot = [...overflowRooms.values()];

  for (const overflow of snapshot) {
    const before = overflow.lifecycle;
    updateShardLifecycle(overflow, now);
    if (!overflowRooms.has(overflow.id)) {
      collapsed.push(overflow.slug);
      continue;
    }
    if (overflow.lifecycle === "DRAINING" && before !== "DRAINING") draining.push(overflow.slug);
  }

  return { collapsed, draining, skippedOccupied };
}

/**
 * Recommend-only. Does not move anyone.
 * Occupants on DRAINING shards could compact into the parent/sibling if spare exists.
 */
export function recommendCompactionMoves(anchorSlug: string): CompactionRecommendation[] {
  const anchor = getAnchorBySlug(anchorSlug);
  if (!anchor) return [];
  const destSlug = readRealOccupancy(anchorSlug) < anchor.maximumHumans ? anchorSlug : null;
  if (!destSlug) return [];
  const destMeshKey = formatVenueMeshAddress(
    auditoriumMeshAddress({
      eventId: `event-${anchorSlug}`,
      venueType: anchor.category.toLowerCase().replace(/_/g, "-"),
      clusterId: "main-bowl",
      auditoriumIndex: 1,
    }),
  );

  const recs: CompactionRecommendation[] = [];
  for (const overflow of getOverflowRoomsForAnchor(anchorSlug).filter((o) => o.lifecycle === "DRAINING")) {
    const occ = getVenueOccupancy(overflow.slug);
    for (const member of occ.members.filter((m) => m.active && m.role !== "bot")) {
      const from = durablePlacements.get(member.userId) ?? {
        userId: member.userId,
        slug: overflow.slug,
        meshKey: overflow.meshKey,
        eventId: overflow.meshAddress.eventId,
        meshId: overflow.meshAddress.meshId,
        environmentId: overflow.meshAddress.environmentId,
        clusterId: overflow.meshAddress.clusterId ?? "main-bowl",
        auditoriumId: overflow.meshAddress.auditoriumId ?? overflow.slug,
        sectionOrZone: member.seatId ?? "UNASSIGNED",
        seatId: member.seatId ?? "UNASSIGNED",
      };
      recs.push({
        userId: member.userId,
        from,
        toSlug: destSlug,
        toMeshKey: destMeshKey,
        committed: false,
        state: "RECOMMENDED",
        rule: MIGRATION_COMMIT_RULE,
      });
    }
  }
  return recs;
}

export function rememberAttendeePlacement(input: {
  userId: string;
  slug: string;
  seatId: string;
  sectionOrZone?: string;
  meshKey: string | null;
  parentAnchorSlug: string | null;
}): AttendeePlacementRecord {
  const overflow = getOverflowBySlug(input.slug);
  const addr = overflow?.meshAddress;
  const parent = input.parentAnchorSlug ?? overflow?.parentAnchorSlug ?? input.slug;
  const record: AttendeePlacementRecord = {
    userId: input.userId,
    slug: input.slug,
    meshKey: input.meshKey ?? overflow?.meshKey ?? `event-${parent}`,
    eventId: addr?.eventId ?? `event-${parent}`,
    meshId: addr?.meshId ?? "anchor-mesh",
    environmentId: addr?.environmentId ?? "auditorium",
    clusterId: addr?.clusterId ?? "main-bowl",
    auditoriumId: addr?.auditoriumId ?? "A01",
    sectionOrZone: input.sectionOrZone ?? input.seatId,
    seatId: input.seatId,
  };
  durablePlacements.set(input.userId, record);
  return record;
}

export function forgetAttendeePlacement(userId: string): void {
  durablePlacements.delete(userId);
  destinationReservations.delete(userId);
}

export function reserveDestinationForUser(input: {
  userId: string;
  destSlug: string;
  destSeatId: string;
  destSectionOrZone?: string;
}): { reserved: boolean; reason: string } {
  const destLive = readRealOccupancy(input.destSlug);
  const overflow = getOverflowBySlug(input.destSlug);
  const destAnchorSlug = overflow?.parentAnchorSlug ?? input.destSlug;
  let cap = 40;
  try {
    cap = resolveAnchor(destAnchorSlug).maximumHumans;
  } catch {
    /* dest may be anchor */
  }
  if (isAnchorSlug(input.destSlug)) {
    cap = resolveAnchor(input.destSlug).maximumHumans;
  }
  if (destLive >= cap) {
    return { reserved: false, reason: "destination_at_capacity" };
  }
  const destMeshKey =
    overflow?.meshKey ??
    formatVenueMeshAddress(
      auditoriumMeshAddress({
        eventId: `event-${destAnchorSlug}`,
        venueType: "venue",
        clusterId: "main-bowl",
        auditoriumIndex: 1,
      }),
    );
  destinationReservations.set(input.userId, {
    userId: input.userId,
    destSlug: input.destSlug,
    destSeatId: input.destSeatId,
    destSectionOrZone: input.destSectionOrZone ?? input.destSeatId,
    destMeshKey,
    reservedAt: Date.now(),
  });
  return { reserved: true, reason: "reserved" };
}

/**
 * Commit rule: original placement stays until reservation exists AND this write succeeds.
 * Orchestrator never teleports from rebalanceParticipants — callers must commit explicitly.
 */
export function commitPlacementMigration(userId: string): PlacementCommitResult {
  const original = durablePlacements.get(userId);
  if (!original) {
    return {
      committed: false,
      state: "FAILED_ORIGINAL_KEPT",
      placement: {
        userId,
        slug: "unknown",
        meshKey: "",
        eventId: "",
        meshId: "",
        environmentId: "",
        clusterId: "",
        auditoriumId: "",
        sectionOrZone: "",
        seatId: "",
      },
      reason: "no_original_placement",
    };
  }
  const reservation = destinationReservations.get(userId);
  if (!reservation) {
    return {
      committed: false,
      state: "FAILED_ORIGINAL_KEPT",
      placement: original,
      reason: "destination_not_reserved",
    };
  }
  const destLive = readRealOccupancy(reservation.destSlug);
  let cap = 40;
  try {
    const destOverflow = getOverflowBySlug(reservation.destSlug);
    const destAnchor = destOverflow?.parentAnchorSlug ?? reservation.destSlug;
    cap = resolveAnchor(destAnchor).maximumHumans;
  } catch {
    /* keep default cap */
  }
  if (destLive >= cap) {
    destinationReservations.delete(userId);
    return {
      committed: false,
      state: "FAILED_ORIGINAL_KEPT",
      placement: original,
      reason: "destination_lost_capacity",
    };
  }

  const committed: AttendeePlacementRecord = {
    ...original,
    slug: reservation.destSlug,
    meshKey: reservation.destMeshKey,
    auditoriumId: getOverflowBySlug(reservation.destSlug)?.meshAddress.auditoriumId ?? original.auditoriumId,
    sectionOrZone: reservation.destSectionOrZone,
    seatId: reservation.destSeatId,
  };
  durablePlacements.set(userId, committed);
  destinationReservations.delete(userId);
  return {
    committed: true,
    state: "COMMITTED",
    placement: committed,
    reason: "reserved_and_durable_updated",
  };
}

export function restoreAnchorAvailability(anchorSlug: string): void {
  if (!isAnchorSlug(anchorSlug)) return;
  audit("anchor_restored", anchorSlug, "Anchor returned to RECRUITING state");
}

export function publishDiscoveryState(): {
  anchors: AnchorRoomDefinition[];
  overflows: OverflowRoom[];
  liveSessions: LiveSession[];
} {
  return {
    anchors: getAllAnchors(),
    overflows: getAllOverflowRooms(),
    liveSessions: getActiveSessions(),
  };
}

export function getOverflowRoomsForAnchor(anchorSlug: string): OverflowRoom[] {
  return Array.from(overflowRooms.values()).filter(
    (r) => r.parentAnchorSlug === anchorSlug && r.lifecycle !== "COLLAPSED",
  );
}

export function getAllOverflowRooms(): OverflowRoom[] {
  return Array.from(overflowRooms.values()).filter((r) => r.lifecycle !== "COLLAPSED");
}

export function getRecentAuditEvents(limit = 50): OrchestratorAuditEvent[] {
  return auditLog.slice(-limit).reverse();
}

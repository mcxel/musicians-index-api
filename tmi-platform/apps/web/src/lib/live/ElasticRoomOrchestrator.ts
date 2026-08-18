/**
 * ElasticRoomOrchestrator
 *
 * Manages the relationship between permanent anchor rooms and dynamically
 * created overflow rooms. Overflow rooms are spawned when an anchor reaches
 * its capacity threshold and torn down when activity ends.
 *
 * Bots never count as real-human occupancy for lifecycle decisions.
 */

import {
  getAllAnchors,
  getAnchorBySlug,
  isAnchorSlug,
  type AnchorRoomDefinition,
} from "@/lib/live/AnchorRoomRegistry";
import {
  getVenueOccupancy,
  type VenueOccupancy,
} from "@/lib/live/audienceRuntimeEngine";
import {
  getActiveSessions,
  endLiveSession,
  type LiveSession,
} from "@/lib/broadcast/globalLiveSessionStore";
import { removeSessionNow } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";

// ── Overflow room tracking ────────────────────────────────────────────────────

export type OverflowRoom = {
  id: string;
  parentAnchorSlug: string;
  slug: string;
  title: string;
  templateId: string;
  createdAt: number;
  route: string;
  meshKey?: string;
  meshAddress?: any;
  sceneInstanceId?: string;
  lifecycle?: string;
};

// Process-local overflow registry (durable persistence can be added later via DB)
const overflowRooms = new Map<string, OverflowRoom>();
let overflowCounter = 0;

// ── Public types ──────────────────────────────────────────────────────────────

export type RoomCapacityReport = {
  anchorSlug: string;
  realHumans: number;
  capacity: number;
  overflowThreshold: number;
  thresholdCount: number;
  needsOverflow: boolean;
  existingOverflowCount: number;
  activeShardCount: number;
};

export type OrchestratorAuditEvent = {
  ts: number;
  kind: "overflow_created" | "overflow_closed" | "capacity_checked" | "anchor_restored";
  anchorSlug: string;
  detail: string;
};

import { prisma } from "@/lib/prisma";

const auditLog: OrchestratorAuditEvent[] = [];
const MAX_AUDIT = 500;

function audit(kind: OrchestratorAuditEvent["kind"], anchorSlug: string, detail: string): void {
  auditLog.push({ ts: Date.now(), kind, anchorSlug, detail });
  if (auditLog.length > MAX_AUDIT) auditLog.shift();
}

export async function syncOverflowRoomToDb(overflow: OverflowRoom): Promise<boolean> {
  try {
    await prisma.room.upsert({
      where: { id: overflow.id },
      create: {
        id: overflow.id,
        name: overflow.title,
        type: "LOUNGE",
        status: "LIVE",
        ownerId: null,
        maxCapacity: 40,
      },
      update: {
        status: "LIVE",
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

// ── Core operations ───────────────────────────────────────────────────────────

/** Returns the anchor definition or throws if slug is not a known anchor. */
export function resolveAnchor(slug: string): AnchorRoomDefinition {
  const anchor = getAnchorBySlug(slug);
  if (!anchor) throw new Error(`[ElasticRoomOrchestrator] Unknown anchor slug: ${slug}`);
  return anchor;
}

/** Real human count for a venue — bots excluded. */
export function readRealOccupancy(venueSlug: string): number {
  const occ: VenueOccupancy = getVenueOccupancy(venueSlug);
  return occ.members.filter((m) => m.active && m.role !== "bot").length;
}

/** Evaluate whether this anchor is at or approaching capacity. */
export function evaluateCapacity(anchorSlug: string): RoomCapacityReport {
  const anchor = resolveAnchor(anchorSlug);
  const realHumans = readRealOccupancy(anchorSlug);
  const thresholdCount = Math.ceil((anchor.overflowThreshold / 100) * anchor.maximumHumans);
  const existingOverflowCount = getOverflowRoomsForAnchor(anchorSlug).length;

  return {
    anchorSlug,
    realHumans,
    capacity: anchor.maximumHumans,
    overflowThreshold: anchor.overflowThreshold,
    thresholdCount,
    needsOverflow: realHumans >= thresholdCount,
    existingOverflowCount,
    activeShardCount: 1 + existingOverflowCount,
  };
}

/** Spin up an overflow room for an anchor that has hit its capacity threshold. */
export function createOverflow(anchorSlug: string): OverflowRoom {
  const anchor = resolveAnchor(anchorSlug);
  overflowCounter += 1;
  const id = `overflow-${anchorSlug}-${overflowCounter}`;
  const slug = `${anchorSlug}-overflow-${overflowCounter}`;
  const overflow: OverflowRoom = {
    id,
    parentAnchorSlug: anchorSlug,
    slug,
    title: `${anchor.title} — Room ${overflowCounter + 1}`,
    templateId: anchor.overflowTemplateId,
    createdAt: Date.now(),
    route: `${anchor.route}-${overflowCounter + 1}`,
  };
  overflowRooms.set(id, overflow);
  void syncOverflowRoomToDb(overflow).catch(() => {});
  audit("overflow_created", anchorSlug, `Created overflow room ${slug}`);
  return overflow;
}

/**
 * Assign a participant to the best available room for a given anchor.
 * Returns the slug (anchor or overflow) they should join.
 */
export function assignParticipant(anchorSlug: string): { slug: string; isOverflow: boolean } {
  const report = evaluateCapacity(anchorSlug);

  if (!report.needsOverflow) {
    return { slug: anchorSlug, isOverflow: false };
  }

  // Find an overflow room with capacity
  const anchor = resolveAnchor(anchorSlug);
  for (const overflow of overflowRooms.values()) {
    if (overflow.parentAnchorSlug !== anchorSlug) continue;
    const overflowReal = readRealOccupancy(overflow.slug);
    if (overflowReal < anchor.maximumHumans) {
      return { slug: overflow.slug, isOverflow: true };
    }
  }

  // All overflow rooms full too — create another
  const newOverflow = createOverflow(anchorSlug);
  return { slug: newOverflow.slug, isOverflow: true };
}

/** Close an overflow room when it's empty. */
export function closeOverflow(overflowId: string): { ok: boolean } {
  const overflow = overflowRooms.get(overflowId);
  if (!overflow) return { ok: false };

  // End any live session attached to this overflow slug
  const sessions = getActiveSessions();
  const session = sessions.find((s) => s.roomId === overflow.slug);
  if (session) {
    endLiveSession(session.userId);
    void removeSessionNow(session.userId).catch(() => {});
  }

  overflowRooms.delete(overflowId);
  void closeOverflowInDb(overflowId).catch(() => {});
  audit("overflow_closed", overflow.parentAnchorSlug, `Closed overflow room ${overflow.slug}`);
  return { ok: true };
}

/** Rebalance: close overflow rooms that have no real humans remaining. */
export function rebalanceParticipants(): void {
  for (const [id, overflow] of overflowRooms) {
    const realHumans = readRealOccupancy(overflow.slug);
    if (realHumans === 0) {
      closeOverflow(id);
    }
  }
}

/**
 * Called when a live session for an anchor ends.
 * Anchor itself is never deleted — it returns to RECRUITING state.
 */
export function restoreAnchorAvailability(anchorSlug: string): void {
  if (!isAnchorSlug(anchorSlug)) return;
  audit("anchor_restored", anchorSlug, "Anchor returned to RECRUITING state");
  // No-op for discovery: anchor is always returned by getAllAnchors()
  // The lobby wall shows it in RECRUITING/READY state automatically when no live session exists.
}

/** Publish the current discovery state — all anchors + overflow rooms + live sessions. */
export function publishDiscoveryState(): {
  anchors: AnchorRoomDefinition[];
  overflows: OverflowRoom[];
  liveSessions: LiveSession[];
} {
  return {
    anchors: getAllAnchors(),
    overflows: Array.from(overflowRooms.values()),
    liveSessions: getActiveSessions(),
  };
}

// ── Read helpers ──────────────────────────────────────────────────────────────

export function getOverflowRoomsForAnchor(anchorSlug: string): OverflowRoom[] {
  return Array.from(overflowRooms.values()).filter(
    (r) => r.parentAnchorSlug === anchorSlug
  );
}

export function getAllOverflowRooms(): OverflowRoom[] {
  return Array.from(overflowRooms.values());
}

export function getOverflowBySlug(slug: string): OverflowRoom | undefined {
  return Array.from(overflowRooms.values()).find((r) => r.slug === slug);
}

export function getAudienceMigrationPolicy() {
  return { policy: 'elastic_mesh', autoRebalance: true };
}

export function getMigrationCommitRule() {
  return { rule: 'commit_on_shard_boundary', threshold: 0.85 };
}

const userPlacementDetails = new Map<string, { userId: string; slug: string; seatId?: string; meshKey?: string | null; parentAnchorSlug?: string }>();

export function resolveJoinTarget(slug: string): { slug: string; targetSlug: string; isOverflow: boolean } {
  return { slug, targetSlug: slug, isOverflow: false };
}

export function rememberAttendeePlacement(placement: string | { userId: string; slug: string; seatId?: string; meshKey?: string | null; parentAnchorSlug?: string }, targetSlug?: string): void {
  if (typeof placement === "string") {
    userPlacementDetails.set(placement, { userId: placement, slug: targetSlug || "battle-thunder-dome" });
  } else {
    userPlacementDetails.set(placement.userId, placement);
  }
}

export function reserveDestinationForUser(req: string | { userId: string; destSlug: string; destSeatId?: string; destSectionOrZone?: string }, targetSlug?: string): { reserved: boolean; committed?: boolean; seatId?: string } {
  const userId = typeof req === "string" ? req : req.userId;
  const slug = typeof req === "string" ? targetSlug || "battle-thunder-dome" : req.destSlug;
  userPlacementDetails.set(userId, { userId, slug, seatId: typeof req === "object" ? req.destSeatId : undefined });
  return { reserved: true, committed: true, seatId: typeof req === "object" ? req.destSeatId : `seat-${userId}` };
}

export function commitPlacementMigration(userId: string, targetSlug?: string): { committed: boolean; userId: string; slug: string; seatId: string } {
  const existing = userPlacementDetails.get(userId);
  const finalSlug = targetSlug || existing?.slug || "battle-thunder-dome";
  const seatId = existing?.seatId || `seat-${userId}`;
  userPlacementDetails.set(userId, { userId, slug: finalSlug, seatId });
  return { committed: true, userId, slug: finalSlug, seatId };
}

export function getAttendeePlacement(userId: string): { userId: string; slug: string; seatId?: string } | undefined {
  return userPlacementDetails.get(userId);
}

export function getRecentAuditEvents(limit = 50): OrchestratorAuditEvent[] {
  return auditLog.slice(-limit).reverse();
}

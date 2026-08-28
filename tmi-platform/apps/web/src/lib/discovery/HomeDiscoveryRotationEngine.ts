/**
 * HomeDiscoveryRotationEngine — Home 1 canonical live-discovery orbit rotation.
 * DiscoveryBus / publishLiveRoom is the sole live-orbit source (Rule 20).
 * Uses HOME_BROADCAST_ROTATION_MS from BroadcastRotationEngine (13s Marcel lock).
 */

import { TIMING } from "@/lib/motion/timingRegistry";
import { DiscoveryBus } from "./DiscoveryBus";
import {
  filterForHomepageSurface,
  type HomepageDiscoverySurface,
} from "./homepageDiscoveryFilters";
import {
  LIVE_DISCOVERY_CATEGORY_LABELS,
  type LiveDiscoveryCategory,
  type LiveDiscoveryRecord,
} from "./LiveDiscoveryRecord";
import { discoveryToLobbyRoom } from "./discoveryToLobbyRoom";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import { isPerformerLobbyRecord } from "@/lib/lobby/liveLobbyWallLaw";
import { isShowsOrReleaseDiscoveryCategory } from "@/lib/events/ScheduledEventRegistry";

export const HOME_BROADCAST_ROTATION_MS = TIMING.broadcastDeckRotation;

/** Factual room states rendered on Home 1 orbit cards (Rule 20). */
export type HomeOrbitRoomState =
  | "OPEN"
  | "LIVE"
  | "SCHEDULED"
  | "FULL"
  | "RESTRICTED"
  | "MAINTENANCE";

/** Observability event ids — factual console logs only. */
export const HOME_DISCOVERY_LOG = {
  FETCHED: "HOME_DISCOVERY_FETCHED",
  ROTATION_ADVANCED: "HOME_ROTATION_ADVANCED",
  ROOM_SELECTED: "HOME_ROOM_SELECTED",
  EXACT_JOIN_REQUESTED: "HOME_EXACT_JOIN_REQUESTED",
  EMPTY: "HOME_DISCOVERY_EMPTY",
  STALE_RECORD: "HOME_DISCOVERY_STALE_RECORD",
} as const;

export interface HomeOrbitDiscoveryCard {
  roomId: string;
  experienceType: string;
  discoveryCategory: LiveDiscoveryCategory;
  liveSessionId: string;
  exactJoinTarget: string;
  roomState: HomeOrbitRoomState;
  participantCount: number;
  isSystemAutomated: boolean;
  title: string;
  hostName: string;
  posterUrl: string | null;
  accentColor: string;
  record: LiveDiscoveryRecord;
}

const HOME1_ORBIT_SURFACE: HomepageDiscoverySurface = "home1_orbit";

const INELIGIBLE_STATES = new Set<HomeOrbitRoomState>(["MAINTENANCE"]);

function lobbyTypeToExperience(type: ReturnType<typeof discoveryToLobbyRoom>["type"]): string {
  if (type === "performer-lobby") return "PERFORMER_LOBBY";
  if (type === "lounge") return "LOUNGE_SIDE_ROOM";
  if (type === "battle") return "BATTLE";
  if (type === "cypher" || type === "mini-cypher") return "CIPHER";
  if (type === "challenge") return "CHALLENGE";
  if (type === "game") return "GAME";
  if (type === "dance") return "MAIN_AUDITORIUM";
  if (type === "concert") return "MAIN_AUDITORIUM";
  return "MAIN_AUDITORIUM";
}

export function resolveHomeOrbitRoomState(record: LiveDiscoveryRecord): HomeOrbitRoomState {
  if (record.joinGate === "invite" || record.visibility === "invite" || record.visibility === "private") {
    return "RESTRICTED";
  }
  if (record.recruiting && !record.isLive) return "SCHEDULED";
  if (record.recruiting && record.isLive) return "OPEN";
  if (record.isLive && record.humanViewerCount > 0) return "LIVE";
  if (record.isAnchor || record.isNewEmpty || record.humanViewerCount === 0) return "OPEN";
  if (record.isLive) return "LIVE";
  return "SCHEDULED";
}

export function filterHomeOrbitEligibleRecords(
  records: readonly LiveDiscoveryRecord[],
): LiveDiscoveryRecord[] {
  const pool = filterForHomepageSurface(records, HOME1_ORBIT_SURFACE);
  return pool.filter((r) => {
    if (!r.isLive) return false;
    const state = resolveHomeOrbitRoomState(r);
    if (INELIGIBLE_STATES.has(state)) return false;
    // Zero-user OPEN permanent/system rooms remain eligible (step 6).
    if (state === "OPEN" || state === "LIVE" || state === "SCHEDULED" || state === "RESTRICTED") {
      return true;
    }
    return false;
  });
}

/** Rule 11 freshness — LIVE occupancy first, then recency, then anchors. */
export function sortHomeOrbitPool(records: readonly LiveDiscoveryRecord[]): LiveDiscoveryRecord[] {
  return [...records].sort((a, b) => {
    const liveA = a.humanViewerCount > 0 ? 1 : 0;
    const liveB = b.humanViewerCount > 0 ? 1 : 0;
    if (liveB !== liveA) return liveB - liveA;
    const anchorA = a.isAnchor ? 1 : 0;
    const anchorB = b.isAnchor ? 1 : 0;
    if (anchorB !== anchorA) return anchorB - anchorA;
    return b.startedAt - a.startedAt;
  });
}

function resolveExactJoinTarget(record: LiveDiscoveryRecord): string {
  const lobbyRoom = discoveryToLobbyRoom(record);
  const dest = resolveLobbyDestination({
    roomId: record.roomId,
    kind: lobbyRoom.type === "mini-cypher" ? "cypher" : lobbyRoom.type,
    href: lobbyRoom.href,
  });
  return dest.href;
}

export function discoveryRecordToHomeOrbitCard(record: LiveDiscoveryRecord): HomeOrbitDiscoveryCard {
  const lobbyRoom = discoveryToLobbyRoom(record);
  const exactJoinTarget = resolveExactJoinTarget(record);
  const discoveryCategory = record.category;
  let experienceType = record.experienceId ?? lobbyTypeToExperience(lobbyRoom.type);
  if (isPerformerLobbyRecord(record)) experienceType = "PERFORMER_LOBBY";
  if (isShowsOrReleaseDiscoveryCategory(record.category)) experienceType = "MAIN_AUDITORIUM";

  return {
    roomId: record.roomId,
    experienceType,
    discoveryCategory,
    liveSessionId: record.roomId,
    exactJoinTarget,
    roomState: resolveHomeOrbitRoomState(record),
    participantCount: Math.max(0, record.humanViewerCount),
    isSystemAutomated: Boolean(record.isAnchor),
    title: record.title,
    hostName: record.hostName,
    posterUrl: record.posterUrl ?? record.previewUrl,
    accentColor: record.accentColor,
    record,
  };
}

/**
 * Deterministic rotation window — stable ordering, no adjacent duplicate roomIds
 * when the pool is larger than visible slots.
 */
export function pickHomeOrbitRotationSlots(
  records: readonly LiveDiscoveryRecord[],
  slotCount: number,
  rotationOffset = 0,
): HomeOrbitDiscoveryCard[] {
  const pool = sortHomeOrbitPool(filterHomeOrbitEligibleRecords(records));
  const n = Math.max(1, Math.min(slotCount, 12));
  if (pool.length === 0) {
    logHomeDiscovery(HOME_DISCOVERY_LOG.EMPTY, { slotCount: n });
    return [];
  }

  const cards: HomeOrbitDiscoveryCard[] = [];
  const used = new Set<string>();
  let cursor = rotationOffset % pool.length;
  let guard = 0;

  while (cards.length < n && guard < pool.length * 3) {
    const rec = pool[cursor % pool.length]!;
    cursor++;
    guard++;
    if (used.has(rec.roomId)) continue;
    if (cards.length > 0 && cards[cards.length - 1]!.roomId === rec.roomId) continue;
    used.add(rec.roomId);
    const card = discoveryRecordToHomeOrbitCard(rec);
    cards.push(card);
    logHomeDiscovery(HOME_DISCOVERY_LOG.ROOM_SELECTED, {
      roomId: card.roomId,
      state: card.roomState,
      participants: card.participantCount,
    });
  }

  return cards;
}

/** Stale-record protection — re-read bus before join (step 11). */
export function verifyHomeOrbitRecordEligible(
  record: LiveDiscoveryRecord,
): LiveDiscoveryRecord | null {
  const fresh = DiscoveryBus.getById(record.roomId);
  if (!fresh || !fresh.isLive) {
    logHomeDiscovery(HOME_DISCOVERY_LOG.STALE_RECORD, { roomId: record.roomId });
    return null;
  }
  const stillEligible = filterHomeOrbitEligibleRecords([fresh]);
  if (stillEligible.length === 0) {
    logHomeDiscovery(HOME_DISCOVERY_LOG.STALE_RECORD, { roomId: record.roomId, reason: "filtered" });
    return null;
  }
  return fresh;
}

export function logHomeDiscovery(
  event: (typeof HOME_DISCOVERY_LOG)[keyof typeof HOME_DISCOVERY_LOG],
  detail?: Record<string, unknown>,
): void {
  if (typeof console !== "undefined" && console.info) {
    console.info(`[${event}]`, detail ?? {});
  }
}

export function logHomeDiscoveryFetched(count: number): void {
  logHomeDiscovery(HOME_DISCOVERY_LOG.FETCHED, { eligibleCount: count });
}

export function logHomeRotationAdvanced(offset: number): void {
  logHomeDiscovery(HOME_DISCOVERY_LOG.ROTATION_ADVANCED, {
    rotationOffset: offset,
    intervalMs: HOME_BROADCAST_ROTATION_MS,
  });
}

export function logHomeExactJoinRequested(card: HomeOrbitDiscoveryCard): void {
  logHomeDiscovery(HOME_DISCOVERY_LOG.EXACT_JOIN_REQUESTED, {
    roomId: card.roomId,
    liveSessionId: card.liveSessionId,
    exactJoinTarget: card.exactJoinTarget,
    experienceType: card.experienceType,
    category: card.discoveryCategory,
  });
}

export function categoryLabel(category: LiveDiscoveryCategory): string {
  return LIVE_DISCOVERY_CATEGORY_LABELS[category] ?? category;
}

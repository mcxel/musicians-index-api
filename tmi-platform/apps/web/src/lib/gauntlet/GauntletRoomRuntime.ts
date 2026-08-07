/**
 * GauntletRoomRuntime — persistent Musical Gauntlet destination.
 * Run end ≠ room end. Room class PERSISTENT_GAUNTLET.
 * Feature-gated: GAUNTLET_ENABLED / GAUNTLET_ENTRY_ENABLED.
 * Idle featured-style rotation (lock when waiting queue > 0).
 */

import { isEnabled } from "@/config/feature.flags";
import type { GauntletVenueSkinId } from "@/lib/gauntlet/GauntletVenueManifest";
import { getDefaultGauntletVenueSkin } from "@/lib/gauntlet/GauntletVenueManifest";
import {
  GAUNTLET_IDLE_ROTATION_POOL,
  buildGauntletOpenCallCopy,
  getGauntletDefinitionByStyle,
} from "@/lib/gauntlet/GauntletDefinition";
import {
  nextStyleInPool,
  type PerformerStyleSlot,
} from "@/lib/competition/PerformerStyleSlots";

export type GauntletRoomClass =
  | "PERSISTENT_GAUNTLET"
  | "TEMPORARY_BATTLE"
  | "PERMANENT_ANCHOR";

export type GauntletParticipantRole =
  | "SPECTATOR"
  | "WAITING_COMPETITOR"
  | "ACTIVE_COMPETITOR";

const IDLE_ROTATE_MS = 15 * 60 * 1000;

export type GauntletRoomState = {
  roomId: string;
  roomClass: GauntletRoomClass;
  venueSkinId: GauntletVenueSkinId;
  currentRunId: string | null;
  paused: boolean;
  entryOpen: boolean;
  spectatorCount: number;
  waitingCount: number;
  activeCount: number;
  /** Idle-rotating featured performer style (locked when queue forming). */
  featuredStyle: PerformerStyleSlot;
  categoryLocked: boolean;
  lastRotatedAtMs: number;
  createdAt: number;
  updatedAt: number;
};

export type GauntletParticipant = {
  userId: string;
  displayName: string;
  role: GauntletParticipantRole;
  eliminated: boolean;
  /** Eliminated leftovers may fight on the secondary side stage. */
  sideBattleEligible: boolean;
  joinedAt: number;
};

const rooms = new Map<string, GauntletRoomState>();
const participants = new Map<string, Map<string, GauntletParticipant>>();

export function isGauntletEnabled(): boolean {
  return isEnabled("GAUNTLET_ENABLED");
}

export function isGauntletDiscoveryEnabled(): boolean {
  return isEnabled("GAUNTLET_ENABLED") && isEnabled("GAUNTLET_DISCOVERY_ENABLED");
}

export function isGauntletEntryEnabled(): boolean {
  return isEnabled("GAUNTLET_ENABLED") && isEnabled("GAUNTLET_ENTRY_ENABLED");
}

function maybeRotateGauntletStyle(room: GauntletRoomState, now = Date.now()): void {
  if (room.categoryLocked || room.waitingCount > 0 || room.currentRunId) return;
  if (now - room.lastRotatedAtMs < IDLE_ROTATE_MS) return;
  room.featuredStyle = nextStyleInPool(GAUNTLET_IDLE_ROTATION_POOL, room.featuredStyle);
  room.lastRotatedAtMs = now;
  room.updatedAt = now;
}

export function getOrCreateGauntletRoom(roomId: string): GauntletRoomState | null {
  if (!isGauntletEnabled()) return null;
  const existing = rooms.get(roomId);
  if (existing) {
    maybeRotateGauntletStyle(existing);
    return existing;
  }
  const now = Date.now();
  const room: GauntletRoomState = {
    roomId,
    roomClass: "PERSISTENT_GAUNTLET",
    venueSkinId: getDefaultGauntletVenueSkin().id,
    currentRunId: null,
    paused: false,
    entryOpen: isGauntletEntryEnabled(),
    spectatorCount: 0,
    waitingCount: 0,
    activeCount: 0,
    featuredStyle: GAUNTLET_IDLE_ROTATION_POOL[0] ?? "open_genre",
    categoryLocked: false,
    lastRotatedAtMs: now,
    createdAt: now,
    updatedAt: now,
  };
  rooms.set(roomId, room);
  participants.set(roomId, new Map());
  return room;
}

export function getGauntletRoom(roomId: string): GauntletRoomState | null {
  const room = rooms.get(roomId) ?? null;
  if (room) maybeRotateGauntletStyle(room);
  return room;
}

/** Honest open-call status for wall cards. */
export function getGauntletStatusLine(roomId: string): string {
  const room = getGauntletRoom(roomId);
  if (!room) return "Gauntlet unavailable";
  const def = getGauntletDefinitionByStyle(room.featuredStyle);
  return buildGauntletOpenCallCopy({
    styleSlot: room.featuredStyle,
    needsCompetitors: def?.needsCompetitors ?? 8,
    openCallRole: def?.openCallRole,
    waitingCount: room.waitingCount,
    locked: room.categoryLocked || room.waitingCount > 0,
    runLive: Boolean(room.currentRunId),
  });
}

export function listGauntletRooms(): GauntletRoomState[] {
  if (!isGauntletDiscoveryEnabled()) return [];
  return [...rooms.values()];
}

export function setGauntletVenueSkin(
  roomId: string,
  venueSkinId: GauntletVenueSkinId,
): GauntletRoomState | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.venueSkinId = venueSkinId;
  room.updatedAt = Date.now();
  return room;
}

export function setGauntletPaused(roomId: string, paused: boolean): GauntletRoomState | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.paused = paused;
  room.updatedAt = Date.now();
  return room;
}

export function setGauntletCurrentRun(
  roomId: string,
  runId: string | null,
): GauntletRoomState | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.currentRunId = runId;
  room.updatedAt = Date.now();
  return room;
}

export function joinGauntletRoom(input: {
  roomId: string;
  userId: string;
  displayName: string;
  asCompetitor?: boolean;
}): { ok: boolean; participant?: GauntletParticipant; reason?: string } {
  if (!isGauntletEnabled()) return { ok: false, reason: "gauntlet-disabled" };
  const room = getOrCreateGauntletRoom(input.roomId);
  if (!room) return { ok: false, reason: "gauntlet-disabled" };
  if (input.asCompetitor && !isGauntletEntryEnabled()) {
    return { ok: false, reason: "gauntlet-entry-disabled" };
  }
  const map = participants.get(input.roomId)!;
  const existing = map.get(input.userId);
  if (existing) return { ok: true, participant: existing };

  const role: GauntletParticipantRole =
    input.asCompetitor && room.entryOpen ? "WAITING_COMPETITOR" : "SPECTATOR";
  const participant: GauntletParticipant = {
    userId: input.userId,
    displayName: input.displayName,
    role,
    eliminated: false,
    sideBattleEligible: false,
    joinedAt: Date.now(),
  };
  map.set(input.userId, participant);
  recount(input.roomId);
  if (role === "WAITING_COMPETITOR") {
    const roomAfter = rooms.get(input.roomId);
    if (roomAfter) {
      roomAfter.categoryLocked = true;
      roomAfter.updatedAt = Date.now();
    }
  }
  return { ok: true, participant };
}

/** One life — eliminated competitors become spectators but stay in venue. */
export function eliminateToSpectator(
  roomId: string,
  userId: string,
): GauntletParticipant | null {
  return eliminateToSpectatorWithSideBattle(roomId, userId);
}

/** Eliminate → SPECTATOR + SIDE_BATTLE_ELIGIBLE (secondary stage only). */
export function eliminateToSpectatorWithSideBattle(
  roomId: string,
  userId: string,
): GauntletParticipant | null {
  const map = participants.get(roomId);
  if (!map) return null;
  const p = map.get(userId);
  if (!p) return null;
  p.eliminated = true;
  p.role = "SPECTATOR";
  p.sideBattleEligible = true;
  recount(roomId);
  return p;
}

export function promoteToActive(roomId: string, userId: string): GauntletParticipant | null {
  const map = participants.get(roomId);
  if (!map) return null;
  const p = map.get(userId);
  if (!p || p.eliminated) return null;
  p.role = "ACTIVE_COMPETITOR";
  recount(roomId);
  return p;
}

export function listGauntletParticipants(roomId: string): GauntletParticipant[] {
  return [...(participants.get(roomId)?.values() ?? [])];
}

function recount(roomId: string) {
  const room = rooms.get(roomId);
  const map = participants.get(roomId);
  if (!room || !map) return;
  let spectatorCount = 0;
  let waitingCount = 0;
  let activeCount = 0;
  for (const p of map.values()) {
    if (p.role === "SPECTATOR") spectatorCount += 1;
    else if (p.role === "WAITING_COMPETITOR") waitingCount += 1;
    else activeCount += 1;
  }
  room.spectatorCount = spectatorCount;
  room.waitingCount = waitingCount;
  room.activeCount = activeCount;
  if (waitingCount > 0 || room.currentRunId) {
    room.categoryLocked = true;
  } else if (!room.currentRunId && waitingCount === 0) {
    room.categoryLocked = false;
  }
  room.updatedAt = Date.now();
}

/** Ensure a canonical discovery room exists when flags allow. */
export function ensureCanonicalGauntletRoom(): GauntletRoomState | null {
  if (!isGauntletDiscoveryEnabled()) return null;
  return getOrCreateGauntletRoom("gauntlet-main");
}

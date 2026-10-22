import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";
import { joinAudience, leaveAudience } from "@/lib/live/audienceRuntimeEngine";
import { recordMomentumSample, getCrowdMomentum } from "@/lib/live/crowdMomentumEngine";
import { emitLobbyOccupancy, emitLobbyHeat, emitLobbyReactionBurst } from "@/lib/lobby/lobbyLiveBillboardFeed";
import { defaultClock, type RoomClock } from "./RoomClock";
import { getCanonicalRoomSlug } from "@/lib/world/WorldRuntime";

let _clock: RoomClock = defaultClock;
export function setRoomClock(c: RoomClock): void { _clock = c; }

// ─── Types ───────────────────────────────────────────────────────────────────

export type RoomPopulationSnapshot = {
  roomId: ChatRoomId;
  audienceCount: number;
  performerCount: number;
  hostCount: number;
  sponsorCount: number;
  lurkerCount: number;
  reactionRate: number;   // reactions per 10 seconds
  heatLevel: number;      // 0–100
  queueDepth: number;     // waiting to join
};

export type RoomHeatEventType = "reaction" | "queue_join" | "battle" | "voting" | "tip";

type RoomPopulationState = {
  snapshot: RoomPopulationSnapshot;
  syntheticUserIds: string[];
  lastTickMs: number;
};

/** Honest empty baseline — Rule 20 / Rule 38: never seed fabricated audience. */
function emptyStats(roomId: ChatRoomId): RoomPopulationSnapshot {
  return {
    roomId,
    audienceCount: 0,
    performerCount: 0,
    hostCount: 0,
    sponsorCount: 0,
    lurkerCount: 0,
    reactionRate: 0,
    heatLevel: 0,
    queueDepth: 0,
  };
}

// Heat deltas per event type (real events only)
const HEAT_DELTA: Record<RoomHeatEventType, number> = {
  reaction:   8,
  queue_join: 2,
  battle:     20,
  voting:     10,
  tip:        5,
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const registry = new Map<ChatRoomId, RoomPopulationState>();

function getOrInit(rawRoomId: ChatRoomId): RoomPopulationState {
  const roomId = getCanonicalRoomSlug(rawRoomId) as ChatRoomId;
  if (!registry.has(roomId)) {
    registry.set(roomId, {
      snapshot: emptyStats(roomId),
      syntheticUserIds: [],
      lastTickMs: _clock.now(),
    });
  }
  return registry.get(roomId)!;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Read current population snapshot for a room.
 * Safe to call from render — returns last computed state, does not mutate.
 */
export function getRoomPopulation(roomId: ChatRoomId): RoomPopulationSnapshot {
  return { ...getOrInit(roomId).snapshot };
}

/**
 * Advance one tick for a room.
 * Rule 38 / Rule 20: no sine-drift invented audience. Only decay heat from real events
 * and re-emit truthful occupancy (may be zero).
 */
export function tickPopulation(rawRoomId: ChatRoomId): RoomPopulationSnapshot {
  const state = getOrInit(rawRoomId);
  const s = state.snapshot;
  const roomId = s.roomId;

  // Heat decays toward 0 when no new events — never invent fill
  if (s.heatLevel > 0) {
    const decayRate = 2 + (s.heatLevel > 70 ? 2 : s.heatLevel > 40 ? 1 : 0);
    s.heatLevel = clamp(s.heatLevel - decayRate, 0, 100);
  }
  s.reactionRate = clamp(Math.round(s.heatLevel * 0.6), 0, 100);

  state.lastTickMs = _clock.now();

  recordMomentumSample(roomId, s.reactionRate, clamp(s.heatLevel, 0, 100), clamp(s.heatLevel, 0, 100));

  const total = s.audienceCount + s.performerCount + s.hostCount + s.sponsorCount;
  emitLobbyOccupancy(roomId, total);
  emitLobbyHeat(roomId, s.heatLevel);
  if (s.reactionRate > 20) {
    emitLobbyReactionBurst(roomId, s.reactionRate);
  }

  return { ...s };
}

/**
 * Register a heat-generating event for a room (reaction burst, queue join, battle, voting, tip).
 * Bumps heatLevel immediately, emits to live feed.
 */
export function recordRoomHeatEvent(rawRoomId: ChatRoomId, eventType: RoomHeatEventType): void {
  const state = getOrInit(rawRoomId);
  const s = state.snapshot;
  const roomId = s.roomId;
  s.heatLevel = clamp(s.heatLevel + HEAT_DELTA[eventType], 0, 100);
  if (eventType === "queue_join") s.queueDepth = clamp(s.queueDepth + 1, 0, 999);
  emitLobbyHeat(roomId, s.heatLevel);
  if (eventType === "reaction") emitLobbyReactionBurst(roomId, s.reactionRate + HEAT_DELTA.reaction);
}

/**
 * Inject synthetic audience members (bots) into the room.
 * Dev/bot-fill path only — does not invent baseline before callers invoke this.
 */
export function injectSyntheticAudience(rawRoomId: ChatRoomId, count: number = 10): void {
  const state = getOrInit(rawRoomId);
  const s = state.snapshot;
  const roomId = s.roomId;

  for (let i = 0; i < count; i++) {
    const userId = `syn-${roomId}-${state.syntheticUserIds.length + i}`;
    state.syntheticUserIds.push(userId);
    joinAudience(roomId, {
      userId,
      displayName: `Bot-${userId.slice(-4)}`,
      role: "bot",
      seatId: null,
    });
  }

  s.audienceCount = clamp(s.audienceCount + count, 0, 99_999);
  s.lurkerCount = clamp(s.lurkerCount + Math.round(count * 0.3), 0, s.audienceCount);
  s.heatLevel = clamp(s.heatLevel + Math.round(count * 0.5), 0, 100);

  emitLobbyOccupancy(roomId, s.audienceCount + s.performerCount + s.hostCount + s.sponsorCount);
  emitLobbyHeat(roomId, s.heatLevel);
}

/**
 * Remove synthetic audience members from the room.
 * Unregisters from AudienceRuntimeEngine.
 */
export function removeSyntheticAudience(rawRoomId: ChatRoomId, count: number = 10): void {
  const state = getOrInit(rawRoomId);
  const s = state.snapshot;
  const roomId = s.roomId;

  const toRemove = state.syntheticUserIds.splice(0, count);
  for (const userId of toRemove) {
    leaveAudience(roomId, userId);
  }

  s.audienceCount = clamp(s.audienceCount - toRemove.length, 0, 99_999);
  s.lurkerCount = clamp(s.lurkerCount - Math.round(toRemove.length * 0.3), 0, s.audienceCount);

  emitLobbyOccupancy(roomId, s.audienceCount + s.performerCount + s.hostCount + s.sponsorCount);
}

/**
 * Returns a full momentum snapshot from CrowdMomentumEngine for the room.
 * Useful for camera-reaction sync and observatory displays.
 */
export function getRoomMomentum(rawRoomId: ChatRoomId) {
  const roomId = getCanonicalRoomSlug(rawRoomId) as ChatRoomId;
  return getCrowdMomentum(roomId);
}

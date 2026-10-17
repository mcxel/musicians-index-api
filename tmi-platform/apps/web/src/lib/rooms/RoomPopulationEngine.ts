import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";
import { recordMomentumSample, getCrowdMomentum } from "@/lib/live/crowdMomentumEngine";
import { emitLobbyHeat, emitLobbyOccupancy, emitLobbyReactionBurst } from "@/lib/lobby/lobbyLiveBillboardFeed";
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
  lastTickMs: number;
};

// ─── Baseline seeds (deterministic) ──────────────────────────────────────────

const BASELINE: Record<ChatRoomId, Omit<RoomPopulationSnapshot, "roomId">> = {
  "monthly-idol":       { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "monday-night-stage": { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "deal-or-feud":       { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "name-that-tune":     { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "circle-squares":     { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "cypher-arena":       { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "world-concert":      { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "battle-arena":       { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "challenge-arena":    { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "vip-lounge":         { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
  "venue-room":         { audienceCount: 0, performerCount: 0, hostCount: 0, sponsorCount: 0, lurkerCount: 0, reactionRate: 0, heatLevel: 0, queueDepth: 0 },
};

// Heat deltas per event type
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
    const baseStats = BASELINE[roomId] || BASELINE["venue-room"];
    registry.set(roomId, {
      snapshot: { roomId, ...baseStats },
      lastTickMs: _clock.now(),
    });
  }
  return registry.get(roomId)!;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
 * Advance one simulation tick for a room.
 * - Never invents audience, performers, queue, reactions, or heat
 * - Decays only heat already raised by a real room event
 * - Records a momentum sample in CrowdMomentumEngine
 * - Emits occupancy + heat events to LobbyLiveBillboardFeed (overflow/shard bridge)
 */
export function tickPopulation(rawRoomId: ChatRoomId): RoomPopulationSnapshot {
  const state = getOrInit(rawRoomId);
  const s = state.snapshot;
  const roomId = s.roomId;
  const decayRate = s.heatLevel > 70 ? 4 : s.heatLevel > 40 ? 3 : 2;
  s.heatLevel = clamp(s.heatLevel - decayRate, 0, 100);
  s.reactionRate = Math.max(0, s.reactionRate - 1);

  state.lastTickMs = _clock.now();

  // Feed crowd momentum engine
  recordMomentumSample(roomId, s.reactionRate, clamp(s.heatLevel, 0, 100), clamp(s.heatLevel, 0, 100));

  // Emit to lobby live feed — this is the overflow / shard bridge
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
  s.heatLevel = clamp(s.heatLevel + HEAT_DELTA[eventType], 5, 100);
  if (eventType === "queue_join") s.queueDepth = clamp(s.queueDepth + 1, 0, 999);
  emitLobbyHeat(roomId, s.heatLevel);
  if (eventType === "reaction") emitLobbyReactionBurst(roomId, s.reactionRate + HEAT_DELTA.reaction);
}

/**
 * Legacy synthetic-population entry retained for compatibility but intentionally
 * disabled: no bot may make a closed room appear occupied or active.
 */
export function injectSyntheticAudience(rawRoomId: ChatRoomId, count: number = 10): void {
  void rawRoomId;
  void count;
}

/**
 * Remove synthetic audience members from the room.
 * Unregisters from AudienceRuntimeEngine.
 */
export function removeSyntheticAudience(rawRoomId: ChatRoomId, count: number = 10): void {
  void rawRoomId;
  void count;
}

/**
 * Returns a full momentum snapshot from CrowdMomentumEngine for the room.
 * Useful for camera-reaction sync and observatory displays.
 */
export function getRoomMomentum(rawRoomId: ChatRoomId) {
  const roomId = getCanonicalRoomSlug(rawRoomId) as ChatRoomId;
  return getCrowdMomentum(roomId);
}

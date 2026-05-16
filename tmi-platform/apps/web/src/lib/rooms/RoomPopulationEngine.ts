import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";
import { joinAudience, leaveAudience } from "@/lib/live/audienceRuntimeEngine";
import { recordMomentumSample, getCrowdMomentum } from "@/lib/live/crowdMomentumEngine";
import { emitLobbyOccupancy, emitLobbyHeat, emitLobbyReactionBurst } from "@/lib/lobby/lobbyLiveBillboardFeed";
import { defaultClock, type RoomClock } from "./RoomClock";

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

// ─── Baseline seeds (deterministic) ──────────────────────────────────────────

const BASELINE: Record<ChatRoomId, Omit<RoomPopulationSnapshot, "roomId">> = {
  "monthly-idol":      { audienceCount: 420, performerCount: 6, hostCount: 2, sponsorCount: 2, lurkerCount: 85,  reactionRate: 38, heatLevel: 62, queueDepth: 14 },
  "monday-night-stage":{ audienceCount: 310, performerCount: 8, hostCount: 1, sponsorCount: 1, lurkerCount: 72,  reactionRate: 28, heatLevel: 48, queueDepth: 8  },
  "deal-or-feud":      { audienceCount: 190, performerCount: 4, hostCount: 2, sponsorCount: 3, lurkerCount: 45,  reactionRate: 18, heatLevel: 35, queueDepth: 5  },
  "name-that-tune":    { audienceCount: 155, performerCount: 3, hostCount: 2, sponsorCount: 1, lurkerCount: 38,  reactionRate: 15, heatLevel: 28, queueDepth: 3  },
  "circle-squares":    { audienceCount: 120, performerCount: 4, hostCount: 1, sponsorCount: 0, lurkerCount: 28,  reactionRate: 12, heatLevel: 22, queueDepth: 2  },
  "cypher-arena":      { audienceCount: 280, performerCount: 6, hostCount: 1, sponsorCount: 1, lurkerCount: 60,  reactionRate: 32, heatLevel: 55, queueDepth: 10 },
  "venue-room":        { audienceCount:  85, performerCount: 2, hostCount: 1, sponsorCount: 0, lurkerCount: 20,  reactionRate:  8, heatLevel: 15, queueDepth: 1  },
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

function getOrInit(roomId: ChatRoomId): RoomPopulationState {
  if (!registry.has(roomId)) {
    registry.set(roomId, {
      snapshot: { roomId, ...BASELINE[roomId] },
      syntheticUserIds: [],
      lastTickMs: _clock.now(),
    });
  }
  return registry.get(roomId)!;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Small deterministic drift: oscillates ±amplitude on a sine-like curve seeded by time + roomId */
function drift(seed: number, amplitude: number, periodMs: number): number {
  const phase = (_clock.now() % periodMs) / periodMs;
  const angle = phase * 2 * Math.PI + seed;
  return Math.round(Math.sin(angle) * amplitude);
}

function roomSeed(roomId: ChatRoomId): number {
  let h = 0;
  for (let i = 0; i < roomId.length; i++) h = (h * 31 + roomId.charCodeAt(i)) >>> 0;
  return h;
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
 * - Applies deterministic micro-drift to audience/queue counts
 * - Decays heatLevel toward its floor
 * - Records a momentum sample in CrowdMomentumEngine
 * - Emits occupancy + heat events to LobbyLiveBillboardFeed (overflow/shard bridge)
 */
export function tickPopulation(roomId: ChatRoomId): RoomPopulationSnapshot {
  const state = getOrInit(roomId);
  const s = state.snapshot;
  const seed = roomSeed(roomId);

  const base = BASELINE[roomId];

  // Audience drifts ±5% of baseline around its current value
  const audienceDrift = drift(seed, Math.ceil(base.audienceCount * 0.05), 60_000);
  s.audienceCount = clamp(s.audienceCount + audienceDrift, Math.ceil(base.audienceCount * 0.7), Math.ceil(base.audienceCount * 1.3));

  // Queue depth drains as audience grows, refills slowly
  const queueDrift = drift(seed + 1, 2, 45_000);
  s.queueDepth = clamp(s.queueDepth + queueDrift, 0, Math.ceil(base.queueDepth * 2));

  // Lurker fraction is ~20% of audience, drifts ±3
  s.lurkerCount = clamp(Math.round(s.audienceCount * 0.2) + drift(seed + 2, 3, 90_000), 0, s.audienceCount);

  // Reaction rate tracks heat loosely, drifts ±3
  s.reactionRate = clamp(Math.round(s.heatLevel * 0.6) + drift(seed + 3, 3, 30_000), 0, 100);

  // Heat decays 2–4 per tick, floors at 5
  const decayRate = 2 + (s.heatLevel > 70 ? 2 : s.heatLevel > 40 ? 1 : 0);
  s.heatLevel = clamp(s.heatLevel - decayRate, 5, 100);

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
export function recordRoomHeatEvent(roomId: ChatRoomId, eventType: RoomHeatEventType): void {
  const state = getOrInit(roomId);
  const s = state.snapshot;
  s.heatLevel = clamp(s.heatLevel + HEAT_DELTA[eventType], 5, 100);
  if (eventType === "queue_join") s.queueDepth = clamp(s.queueDepth + 1, 0, 999);
  emitLobbyHeat(roomId, s.heatLevel);
  if (eventType === "reaction") emitLobbyReactionBurst(roomId, s.reactionRate + HEAT_DELTA.reaction);
}

/**
 * Inject synthetic audience members (bots) into the room.
 * Registers each bot with AudienceRuntimeEngine so occupancy counts stay consistent.
 */
export function injectSyntheticAudience(roomId: ChatRoomId, count: number = 10): void {
  const state = getOrInit(roomId);
  const s = state.snapshot;

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
  s.heatLevel = clamp(s.heatLevel + Math.round(count * 0.5), 5, 100);

  emitLobbyOccupancy(roomId, s.audienceCount + s.performerCount + s.hostCount + s.sponsorCount);
  emitLobbyHeat(roomId, s.heatLevel);
}

/**
 * Remove synthetic audience members from the room.
 * Unregisters from AudienceRuntimeEngine.
 */
export function removeSyntheticAudience(roomId: ChatRoomId, count: number = 10): void {
  const state = getOrInit(roomId);
  const s = state.snapshot;

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
export function getRoomMomentum(roomId: ChatRoomId) {
  return getCrowdMomentum(roomId);
}

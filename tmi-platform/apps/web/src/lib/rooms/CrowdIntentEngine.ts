import type { ChatRoomId, RoomChatMessage, RoomRuntimeState } from "@/lib/chat/RoomChatEngine";
import { recordRoomHeatEvent, type RoomHeatEventType } from "@/lib/rooms/RoomPopulationEngine";
import { recordMomentumSample } from "@/lib/live/crowdMomentumEngine";
import { defaultClock } from "@/lib/rooms/RoomClock";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CrowdIntentType =
  | "hype"
  | "boo"
  | "vote"
  | "ask"
  | "tip"
  | "promote"
  | "react"
  | "challenge"
  | "request"
  | "encore"
  | "question";

export type CrowdArchetype =
  | "superfan"
  | "critic"
  | "lurker"
  | "hypebot"
  | "casual"
  | "sponsorRep";

export type CrowdIntentEvent = {
  id: string;
  roomId: ChatRoomId;
  userId: string;
  intent: CrowdIntentType;
  strength: number;       // 0–100
  sourceMessageId?: string;
  timestampMs: number;
};

export type IntentContext = {
  heatLevel: number;      // 0–100 from RoomPopulationEngine
  roomState: RoomRuntimeState;
};

export type IntentSummary = {
  roomId: ChatRoomId;
  dominantIntent: CrowdIntentType;
  distribution: Record<CrowdIntentType, number>;
  hypeScore: number;       // 0–100
  booScore: number;        // 0–100
  engagementScore: number; // 0–100
  windowMs: number;
};

// ─── Keyword map ──────────────────────────────────────────────────────────────

const KEYWORD_MAP: Record<CrowdIntentType, string[]> = {
  hype:        ["🔥", "fire", "hype", "yay", "wild", "omg", "goat", "banger", "heat", "hard", "slaps", "go", "let's go", "turn up", "lit", "cold"],
  boo:         ["boo", "trash", "nah", "weak", "bad", "boring", "mid", "wack", "cap", "no", "skip", "stop"],
  vote:        ["vote", "choose", "pick", "select", "best", "win", "winner", "who should", "i pick", "my vote"],
  ask:         ["?", "how", "what", "when", "where", "why", "explain", "tell me", "can you", "does"],
  tip:         ["tip", "$", "💰", "money", "cash", "coin", "support", "pay", "thanks", "appreciate"],
  promote:     ["check out", "follow", "link", "buy", "visit", "swipe", "click", "shop", "promo", "discount"],
  challenge:   ["challenge", "battle", "vs", "dare", "smoke", "murk", "clap back", "1v1", "drop", "who's better", "come on stage"],
  react:       [],
  request:     ["play", "sing", "do", "request", "can you play", "do that song", "give us", "drop that", "play that"],
  encore:      ["again", "encore", "one more", "repeat", "replay", "do it again", "more", "keep going", "don't stop"],
  question:    ["question", "asking", "curious", "wondering", "want to know", "can i ask", "quick question", "real talk"],
};

const REACTION_INTENT: Record<NonNullable<RoomChatMessage["reaction"]>, CrowdIntentType> = {
  yay:  "hype",
  fire: "hype",
  hype: "hype",
  boo:  "boo",
};

// ─── Internal state ───────────────────────────────────────────────────────────

const EVENT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const intentRegistry = new Map<ChatRoomId, CrowdIntentEvent[]>();
let _counter = 0;

const ARCHETYPE_INTENT_MULTIPLIER: Record<CrowdArchetype, Partial<Record<CrowdIntentType, number>>> = {
  superfan: { hype: 1.25, encore: 1.25, tip: 1.15, vote: 1.1 },
  critic: { boo: 1.35, ask: 1.1, question: 1.15 },
  lurker: { react: 0.7, ask: 0.7, vote: 0.75, question: 0.75 },
  hypebot: { hype: 1.4, react: 1.25, promote: 1.15 },
  casual: { react: 1.0 },
  sponsorRep: { promote: 1.4, tip: 1.1, vote: 1.05 },
};

function getOrInitLog(roomId: ChatRoomId): CrowdIntentEvent[] {
  if (!intentRegistry.has(roomId)) intentRegistry.set(roomId, []);
  return intentRegistry.get(roomId)!;
}

function nextId(roomId: ChatRoomId): string {
  return `intent-${roomId}-${++_counter}`;
}

function pruneWindow(log: CrowdIntentEvent[], now: number): void {
  const cutoff = now - EVENT_WINDOW_MS;
  let i = 0;
  while (i < log.length && log[i].timestampMs < cutoff) i++;
  if (i > 0) log.splice(0, i);
}

// ─── Classification ───────────────────────────────────────────────────────────

function scoreText(text: string): Record<CrowdIntentType, number> {
  const lower = text.toLowerCase();
  const scores: Record<CrowdIntentType, number> = {
    hype: 0, boo: 0, vote: 0, ask: 0, tip: 0, promote: 0, challenge: 0, react: 0,
    request: 0, encore: 0, question: 0,
  };
  for (const [intent, keywords] of Object.entries(KEYWORD_MAP) as [CrowdIntentType, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[intent] += 10;
    }
  }
  return scores;
}

/**
 * Classify the dominant intent of a chat message given the current room context.
 * Pure function — no side effects, deterministic.
 */
export function classifyIntent(message: RoomChatMessage, context: IntentContext): CrowdIntentType {
  // Reaction field is a direct signal
  if (message.reaction && REACTION_INTENT[message.reaction]) {
    return REACTION_INTENT[message.reaction];
  }

  // Sponsor role strongly biases toward promote
  if (message.role === "sponsor") return "promote";

  const scores = scoreText(message.text);

  // Performer + challenge keywords → challenge
  if (message.role === "performer" && scores.challenge > 0) return "challenge";

  // Find highest scoring intent (excluding "react" which is the fallback)
  let best: CrowdIntentType = "react";
  let bestScore = 0;
  for (const [intent, score] of Object.entries(scores) as [CrowdIntentType, number][]) {
    if (intent !== "react" && score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  // During LIVE_SHOW at high heat, ambiguous messages lean hype
  if (best === "react" && context.roomState === "LIVE_SHOW" && context.heatLevel > 60) {
    return "hype";
  }

  return best;
}

/**
 * Compute strength (0–100) for a classified intent.
 * Factors: keyword density, heat context, reaction presence.
 */
export function computeIntentStrength(
  message: RoomChatMessage,
  intent: CrowdIntentType,
  context: IntentContext,
): number {
  const scores = scoreText(message.text);
  const keywordStrength = Math.min(40, scores[intent]);
  const heatBonus = Math.round(context.heatLevel * 0.3);
  const reactionBonus = message.reaction ? 15 : 0;
  return Math.min(100, keywordStrength + heatBonus + reactionBonus);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Classify a message and push the resulting intent event into the room log.
 * Returns the recorded event.
 */
export function recordIntentFromMessage(
  message: RoomChatMessage,
  context: IntentContext,
): CrowdIntentEvent {
  const intent = classifyIntent(message, context);
  const strength = computeIntentStrength(message, intent, context);
  const now = message.timestampMs;

  const event: CrowdIntentEvent = {
    id: nextId(message.roomId),
    roomId: message.roomId,
    userId: message.userId,
    intent,
    strength,
    sourceMessageId: message.id,
    timestampMs: now,
  };

  const log = getOrInitLog(message.roomId);
  pruneWindow(log, now);
  log.push(event);

  return event;
}

/**
 * Push a raw intent event without a source message (for system events, bot triggers, etc.).
 */
export function pushIntentEvent(
  roomId: ChatRoomId,
  userId: string,
  intent: CrowdIntentType,
  strength: number,
  now: number,
): CrowdIntentEvent {
  const event: CrowdIntentEvent = {
    id: nextId(roomId),
    roomId,
    userId,
    intent,
    strength: Math.min(100, Math.max(0, strength)),
    timestampMs: now,
  };

  const log = getOrInitLog(roomId);
  pruneWindow(log, now);
  log.push(event);

  return event;
}

/**
 * Returns recent intent events for a room, newest last.
 */
export function getRecentIntents(roomId: ChatRoomId, limit: number = 50): CrowdIntentEvent[] {
  const log = getOrInitLog(roomId);
  return log.slice(-limit);
}

/**
 * Aggregates the last EVENT_WINDOW_MS of intent events into a summary.
 * Useful for camera-reaction sync, observatory dashboards, and bubble placement weighting.
 */
export function getIntentSummary(roomId: ChatRoomId, now: number): IntentSummary {
  const log = getOrInitLog(roomId);
  pruneWindow(log, now);

  const distribution: Record<CrowdIntentType, number> = {
    hype: 0, boo: 0, vote: 0, ask: 0, tip: 0, promote: 0, react: 0, challenge: 0,
    request: 0, encore: 0, question: 0,
  };

  for (const ev of log) distribution[ev.intent]++;

  const total = log.length || 1;

  let dominantIntent: CrowdIntentType = "react";
  let dominantCount = 0;
  for (const [intent, count] of Object.entries(distribution) as [CrowdIntentType, number][]) {
    if (count > dominantCount) { dominantCount = count; dominantIntent = intent; }
  }

  const hypeScore = Math.round((distribution.hype / total) * 100);
  const booScore = Math.round((distribution.boo / total) * 100);
  const engagementScore = Math.round(
    ((distribution.hype + distribution.vote + distribution.tip + distribution.challenge + distribution.react
      + distribution.request + distribution.encore + distribution.question) / total) * 100,
  );

  return {
    roomId,
    dominantIntent,
    distribution,
    hypeScore,
    booScore,
    engagementScore,
    windowMs: EVENT_WINDOW_MS,
  };
}

// ─── Intent → RoomPopulation bridge ──────────────────────────────────────────

const INTENT_HEAT_MAP: Partial<Record<CrowdIntentType, RoomHeatEventType>> = {
  hype:        "reaction",
  react:       "reaction",
  encore:      "reaction",
  challenge:   "battle",
  vote:        "voting",
  tip:         "tip",
  request:     "queue_join",
  question:    "queue_join",
};

/**
 * Apply a classified intent to the room's population + momentum state.
 * Maps CrowdIntentType to RoomHeatEventType and fires both population and momentum updates.
 */
export function applyIntentToRoom(roomId: ChatRoomId, intent: CrowdIntentType, strength: number): void {
  const heatEventType = INTENT_HEAT_MAP[intent];
  if (heatEventType) {
    recordRoomHeatEvent(roomId, heatEventType);
  }
  // strength-weighted hype signal fed into momentum engine
  const hypeLevel = Math.min(100, Math.round(strength * 0.8));
  const reactionRate = Math.min(100, Math.round(strength * 0.6));
  recordMomentumSample(roomId, reactionRate, strength, hypeLevel);
}

/**
 * Clear the intent log for a room (post-show cleanup, state reset).
 */
export function clearIntentLog(roomId: ChatRoomId): void {
  intentRegistry.set(roomId, []);
}

/**
 * Intent weighting helper for crowd archetypes.
 */
export function getIntentWeight(intent: CrowdIntentType, archetype: CrowdArchetype = "casual"): number {
  const byArchetype = ARCHETYPE_INTENT_MULTIPLIER[archetype];
  return byArchetype[intent] ?? 1;
}

/**
 * Generate an intent for a room from an optional source message.
 * Deterministic wrapper around existing classifiers.
 */
export function generateIntent(
  roomId: ChatRoomId,
  context: IntentContext,
  sourceMessage?: RoomChatMessage,
): CrowdIntentType {
  if (sourceMessage) {
    return classifyIntent(sourceMessage, context);
  }

  // Fallback generation based on state (no invented randomness)
  if (context.heatLevel >= 80) return "hype";
  if (context.roomState === "LIVE_SHOW" && context.heatLevel >= 60) return "challenge";
  if (context.heatLevel <= 20) return "ask";
  return "react";
}

/**
 * Resolve side-effects of intent into population + momentum.
 */
export function resolveIntentImpact(
  roomId: ChatRoomId,
  intent: CrowdIntentType,
  strength: number,
  archetype: CrowdArchetype = "casual",
): { intent: CrowdIntentType; weightedStrength: number } {
  const weight = getIntentWeight(intent, archetype);
  const weightedStrength = Math.min(100, Math.max(0, Math.round(strength * weight)));
  applyIntentToRoom(roomId, intent, weightedStrength);
  return { intent, weightedStrength };
}

/**
 * Emit intent event and apply impact in a single call.
 */
export function emitIntent(
  roomId: ChatRoomId,
  userId: string,
  intent: CrowdIntentType,
  strength: number,
  archetype: CrowdArchetype = "casual",
  now: number = defaultClock.now(),
): CrowdIntentEvent {
  const { weightedStrength } = resolveIntentImpact(roomId, intent, strength, archetype);
  return pushIntentEvent(roomId, userId, intent, weightedStrength, now);
}

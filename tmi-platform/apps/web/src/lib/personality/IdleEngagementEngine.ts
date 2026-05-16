/**
 * IdleEngagementEngine
 * Fires idle-fill behaviors when crowd energy drops below a threshold.
 * Prevents dead air — Julius and hosts always have something to say.
 */

import { getEnergyState } from "@/lib/personality/AudienceEnergyEngine";
import { selectBehavior } from "@/lib/personality/BehaviorVariationEngine";
import { recallMemories, storeMemory } from "@/lib/personality/PersonalityMemoryEngine";

export type IdleStrategy =
  | "callback-prompt"
  | "crowd-challenge"
  | "trivia-drop"
  | "hype-reminder"
  | "tip-incentive"
  | "vote-prompt"
  | "fan-shoutout"
  | "silence-break";

export interface IdleFillEvent {
  eventId: string;
  entityId: string;
  roomId: string;
  strategy: IdleStrategy;
  text: string;
  triggeredAt: number;
  energyAtTrigger: number;
}

type IdleListener = (event: IdleFillEvent) => void;

const IDLE_ENERGY_THRESHOLD = 0.3;
const MIN_INTERVAL_MS = 12_000;

const idleLog = new Map<string, IdleFillEvent[]>();
const lastFireAt = new Map<string, number>();
const idleListeners = new Map<string, Set<IdleListener>>();
const idleTimers = new Map<string, ReturnType<typeof setInterval>>();

const STRATEGY_TEXTS: Record<IdleStrategy, string[]> = {
  "callback-prompt":  ["Remember when [performer] went crazy? That could happen again RIGHT NOW!", "The crowd came alive last time — let's do it again!"],
  "crowd-challenge":  ["I dare you to make some NOISE in the next 10 seconds!", "Prove to me you're awake — REACT!"],
  "trivia-drop":      ["Quick — who was the last winner of the Battle Cypher? First correct answer gets a shoutout!"],
  "hype-reminder":    ["We are LIVE right now — this is TMI, baby!", "The night is not over — we are just getting STARTED!"],
  "tip-incentive":    ["Every tip sends this performer to the NEXT level — let's see those sparks fly!", "Show some love — tip now and get into the TOP FAN leaderboard!"],
  "vote-prompt":      ["Your vote shapes the night — USE IT!", "Votes are OPEN — who's getting the crown?"],
  "fan-shoutout":     ["Big love to everyone holding down the lobby right now!", "You showed up tonight — that MEANS something!"],
  "silence-break":    ["Is this thing on?! Let me hear you!", "...too quiet. Too. Quiet. Fix that."],
};

function pickStrategy(energyScore: number, roomId: string): IdleStrategy {
  if (energyScore < 0.1) return "silence-break";
  if (energyScore < 0.2) return "crowd-challenge";
  const strategies: IdleStrategy[] = ["hype-reminder", "tip-incentive", "vote-prompt", "fan-shoutout", "callback-prompt"];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

function pickText(strategy: IdleStrategy): string {
  const options = STRATEGY_TEXTS[strategy];
  return options[Math.floor(Math.random() * options.length)];
}

function notify(entityId: string, event: IdleFillEvent): void {
  idleListeners.get(entityId)?.forEach(l => l(event));
}

function maybeFireIdle(entityId: string, roomId: string): void {
  const energy = getEnergyState(roomId);
  if (!energy || energy.normalizedScore >= IDLE_ENERGY_THRESHOLD) return;

  const now = Date.now();
  const last = lastFireAt.get(entityId) ?? 0;
  if (now - last < MIN_INTERVAL_MS) return;

  // Check behavior pool for idle-fill
  const behaviorSelection = selectBehavior(entityId, "idle-fill");
  const strategy = pickStrategy(energy.normalizedScore, roomId);
  const text = behaviorSelection?.selected.text ?? pickText(strategy);

  const eventId = `idle_${entityId}_${now}`;
  const event: IdleFillEvent = {
    eventId, entityId, roomId, strategy, text,
    triggeredAt: now,
    energyAtTrigger: energy.normalizedScore,
  };

  const log = idleLog.get(entityId) ?? [];
  idleLog.set(entityId, [...log.slice(-49), event]);

  lastFireAt.set(entityId, now);
  notify(entityId, event);

  // Store as callback memory if good moment
  if (energy.normalizedScore < 0.15) {
    storeMemory(entityId, "callback-opportunity", `Fired ${strategy} at energy=${energy.normalizedScore.toFixed(2)}`, {
      emotionalWeight: 0.3,
      ttlMs: 30 * 60 * 1000,
    });
  }
}

export function startIdleEngine(entityId: string, roomId: string, intervalMs = 8000): () => void {
  if (idleTimers.has(entityId)) {
    clearInterval(idleTimers.get(entityId));
  }

  const timer = setInterval(() => maybeFireIdle(entityId, roomId), intervalMs);
  idleTimers.set(entityId, timer);

  return () => {
    clearInterval(timer);
    idleTimers.delete(entityId);
  };
}

export function stopIdleEngine(entityId: string): void {
  const timer = idleTimers.get(entityId);
  if (timer) { clearInterval(timer); idleTimers.delete(entityId); }
}

export function forceIdleFill(entityId: string, roomId: string, strategy?: IdleStrategy): IdleFillEvent {
  const energy = getEnergyState(roomId);
  const energyScore = energy?.normalizedScore ?? 0;
  const chosenStrategy = strategy ?? pickStrategy(energyScore, roomId);
  const text = pickText(chosenStrategy);
  const now = Date.now();

  const eventId = `idle_forced_${entityId}_${now}`;
  const event: IdleFillEvent = {
    eventId, entityId, roomId,
    strategy: chosenStrategy, text,
    triggeredAt: now, energyAtTrigger: energyScore,
  };

  const log = idleLog.get(entityId) ?? [];
  idleLog.set(entityId, [...log.slice(-49), event]);
  lastFireAt.set(entityId, now);
  notify(entityId, event);
  return event;
}

export function subscribeToIdleEngine(entityId: string, listener: IdleListener): () => void {
  if (!idleListeners.has(entityId)) idleListeners.set(entityId, new Set());
  idleListeners.get(entityId)!.add(listener);
  return () => idleListeners.get(entityId)?.delete(listener);
}

export function getIdleLog(entityId: string): IdleFillEvent[] {
  return idleLog.get(entityId) ?? [];
}

export function getIdleStats(): { totalEntities: number; totalEvents: number; activeEngines: number } {
  let totalEvents = 0;
  for (const log of idleLog.values()) totalEvents += log.length;
  return { totalEntities: idleLog.size, totalEvents, activeEngines: idleTimers.size };
}

/**
 * HostEscalationLogic
 * Determines when hosts should escalate delivery — louder, faster, more dramatic —
 * based on crowd energy, consecutive peak ticks, and event triggers.
 */

import { getEnergyState, type EnergyTier } from "@/lib/personality/AudienceEnergyEngine";
import { recallMemories } from "@/lib/personality/PersonalityMemoryEngine";
import { selectBehavior } from "@/lib/personality/BehaviorVariationEngine";

export type EscalationLevel = "baseline" | "elevated" | "intense" | "climax" | "cooldown";

export interface EscalationTrigger {
  triggerId: string;
  entityId: string;
  roomId: string;
  level: EscalationLevel;
  reason: string;
  suggestedLine: string | null;
  autoAdvance: boolean;
  triggeredAt: number;
  expiresAt: number;
}

type EscalationListener = (trigger: EscalationTrigger) => void;

const TIER_TO_LEVEL: Record<EnergyTier, EscalationLevel> = {
  "flat":     "baseline",
  "low":      "baseline",
  "building": "elevated",
  "peak":     "intense",
  "overflow": "climax",
};

const ESCALATION_DURATION_MS: Record<EscalationLevel, number> = {
  "baseline":  10_000,
  "elevated":  8_000,
  "intense":   6_000,
  "climax":    5_000,
  "cooldown":  15_000,
};

const activeTriggers = new Map<string, EscalationTrigger>();  // entityId → trigger
const escalationListeners = new Map<string, Set<EscalationListener>>();

function notify(entityId: string, trigger: EscalationTrigger): void {
  escalationListeners.get(entityId)?.forEach(l => l(trigger));
}

function buildReason(level: EscalationLevel, tier: EnergyTier, peakTicks: number): string {
  if (level === "climax") return `Energy overflow — ${peakTicks} consecutive peak ticks`;
  if (level === "intense") return `Crowd at peak — sustained energy`;
  if (level === "elevated") return `Crowd building from ${tier}`;
  if (level === "cooldown") return `Post-peak cooldown`;
  return `Baseline energy — ${tier}`;
}

export function evaluateEscalation(entityId: string, roomId: string): EscalationTrigger | null {
  const energy = getEnergyState(roomId);
  if (!energy) return null;

  const level = TIER_TO_LEVEL[energy.tier];
  const existing = activeTriggers.get(entityId);

  // Cooldown after climax
  if (existing?.level === "climax" && level !== "climax") {
    const cooldown = createEscalation(entityId, roomId, "cooldown", "Post-climax cooldown", null, false);
    return cooldown;
  }

  // Only escalate if level has changed or expired
  if (existing && existing.level === level && Date.now() < existing.expiresAt) {
    return existing;
  }

  // Select a line from behavior pool for this level
  const energyMap: Record<EscalationLevel, "low" | "mid" | "high" | "explosive"> = {
    baseline: "low", elevated: "mid", intense: "high", climax: "explosive", cooldown: "low",
  };

  const selection = selectBehavior(entityId, "hype-call", energyMap[level]);
  const suggestedLine = selection?.selected.text ?? null;

  // Pull a memory callback if climaxing
  let reason = buildReason(level, energy.tier, energy.consecutivePeakTicks);
  if (level === "climax") {
    const memories = recallMemories(entityId, "climax", { limit: 1, categories: ["callback-opportunity", "victory"] });
    if (memories.recalled.length > 0) {
      reason += ` — callback: "${memories.recalled[0].summary}"`;
    }
  }

  return createEscalation(entityId, roomId, level, reason, suggestedLine, level !== "baseline");
}

function createEscalation(
  entityId: string,
  roomId: string,
  level: EscalationLevel,
  reason: string,
  suggestedLine: string | null,
  autoAdvance: boolean
): EscalationTrigger {
  const triggerId = `esc_${entityId}_${level}_${Date.now()}`;
  const trigger: EscalationTrigger = {
    triggerId, entityId, roomId, level, reason, suggestedLine, autoAdvance,
    triggeredAt: Date.now(),
    expiresAt: Date.now() + ESCALATION_DURATION_MS[level],
  };
  activeTriggers.set(entityId, trigger);
  notify(entityId, trigger);
  return trigger;
}

export function forceEscalation(
  entityId: string,
  roomId: string,
  level: EscalationLevel,
  reason: string
): EscalationTrigger {
  return createEscalation(entityId, roomId, level, reason, null, true);
}

export function getActiveEscalation(entityId: string): EscalationTrigger | null {
  const trigger = activeTriggers.get(entityId);
  if (!trigger) return null;
  if (Date.now() > trigger.expiresAt) {
    activeTriggers.delete(entityId);
    return null;
  }
  return trigger;
}

export function subscribeToEscalation(entityId: string, listener: EscalationListener): () => void {
  if (!escalationListeners.has(entityId)) escalationListeners.set(entityId, new Set());
  escalationListeners.get(entityId)!.add(listener);
  return () => escalationListeners.get(entityId)?.delete(listener);
}

export function getAllActiveEscalations(): EscalationTrigger[] {
  const now = Date.now();
  return [...activeTriggers.values()].filter(t => t.expiresAt > now);
}

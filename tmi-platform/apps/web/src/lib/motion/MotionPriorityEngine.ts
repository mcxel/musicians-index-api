/**
 * MotionPriorityEngine
 * Prevents motion budget overload by enforcing animation priorities.
 * Low-priority elements are frozen when high-priority ones are active.
 */

import { setMotionState, getMotionByOwner, type MotionTarget, type MotionState } from "@/lib/motion/UniversalMotionRuntime";

export type MotionPriorityTier = "critical" | "high" | "medium" | "low" | "ambient";

export interface MotionBudgetConfig {
  maxCritical: number;
  maxHigh: number;
  maxMedium: number;
  maxLow: number;
  maxAmbient: number;
}

export interface PriorityRegistration {
  elementId: string;
  ownerId: string;
  target: MotionTarget;
  tier: MotionPriorityTier;
  registeredAt: number;
  active: boolean;
}

const TARGET_TIER_DEFAULTS: Record<MotionTarget, MotionPriorityTier> = {
  "portrait":          "high",
  "card":              "medium",
  "hud-module":        "high",
  "billboard":         "medium",
  "button":            "low",
  "reaction-particle": "ambient",
  "venue-surface":     "medium",
  "stage-element":     "high",
  "overlay":           "critical",
  "seat-indicator":    "ambient",
};

const DEFAULT_BUDGET: MotionBudgetConfig = {
  maxCritical: 5,
  maxHigh: 15,
  maxMedium: 30,
  maxLow: 50,
  maxAmbient: 100,
};

const priorityRegistry = new Map<string, PriorityRegistration>();
let budgetConfig = { ...DEFAULT_BUDGET };

function countActive(tier: MotionPriorityTier): number {
  return [...priorityRegistry.values()].filter(r => r.tier === tier && r.active).length;
}

export function setBudgetConfig(config: Partial<MotionBudgetConfig>): void {
  budgetConfig = { ...budgetConfig, ...config };
}

export function registerWithPriority(
  elementId: string,
  ownerId: string,
  target: MotionTarget,
  tier?: MotionPriorityTier
): PriorityRegistration {
  const resolvedTier = tier ?? TARGET_TIER_DEFAULTS[target];

  const BUDGET_MAP: Record<MotionPriorityTier, number> = {
    critical: budgetConfig.maxCritical,
    high:     budgetConfig.maxHigh,
    medium:   budgetConfig.maxMedium,
    low:      budgetConfig.maxLow,
    ambient:  budgetConfig.maxAmbient,
  };

  const atCapacity = countActive(resolvedTier) >= BUDGET_MAP[resolvedTier];
  const reg: PriorityRegistration = {
    elementId, ownerId, target, tier: resolvedTier,
    registeredAt: Date.now(),
    active: !atCapacity,
  };

  priorityRegistry.set(elementId, reg);

  if (atCapacity) {
    setMotionState(elementId, "frozen");
  }

  return reg;
}

export function activatePriority(elementId: string): boolean {
  const reg = priorityRegistry.get(elementId);
  if (!reg) return false;

  const BUDGET_MAP: Record<MotionPriorityTier, number> = {
    critical: budgetConfig.maxCritical,
    high:     budgetConfig.maxHigh,
    medium:   budgetConfig.maxMedium,
    low:      budgetConfig.maxLow,
    ambient:  budgetConfig.maxAmbient,
  };

  if (countActive(reg.tier) >= BUDGET_MAP[reg.tier]) {
    // Evict oldest low-priority in same tier
    const oldest = [...priorityRegistry.values()]
      .filter(r => r.tier === reg.tier && r.active)
      .sort((a, b) => a.registeredAt - b.registeredAt)[0];
    if (oldest) {
      priorityRegistry.set(oldest.elementId, { ...oldest, active: false });
      setMotionState(oldest.elementId, "frozen");
    }
  }

  priorityRegistry.set(elementId, { ...reg, active: true });
  setMotionState(elementId, "idle");
  return true;
}

export function deactivatePriority(elementId: string): void {
  const reg = priorityRegistry.get(elementId);
  if (!reg) return;
  priorityRegistry.set(elementId, { ...reg, active: false });
}

export function escalatePriority(elementId: string, newTier: MotionPriorityTier): void {
  const reg = priorityRegistry.get(elementId);
  if (!reg) return;
  priorityRegistry.set(elementId, { ...reg, tier: newTier });
}

export function getPriorityRegistration(elementId: string): PriorityRegistration | null {
  return priorityRegistry.get(elementId) ?? null;
}

export function freezeLowPriority(): number {
  let frozen = 0;
  const now = Date.now();
  for (const [id, reg] of priorityRegistry) {
    if ((reg.tier === "low" || reg.tier === "ambient") && reg.active) {
      priorityRegistry.set(id, { ...reg, active: false });
      setMotionState(id, "frozen");
      frozen++;
    }
  }
  return frozen;
}

export function restoreAllPriority(): void {
  for (const [id, reg] of priorityRegistry) {
    if (!reg.active) {
      priorityRegistry.set(id, { ...reg, active: true });
      setMotionState(id, "idle");
    }
  }
}

export function getPriorityStats(): Record<MotionPriorityTier, { active: number; frozen: number }> {
  const tiers: MotionPriorityTier[] = ["critical", "high", "medium", "low", "ambient"];
  const result = {} as Record<MotionPriorityTier, { active: number; frozen: number }>;
  for (const tier of tiers) {
    const all = [...priorityRegistry.values()].filter(r => r.tier === tier);
    result[tier] = { active: all.filter(r => r.active).length, frozen: all.filter(r => !r.active).length };
  }
  return result;
}

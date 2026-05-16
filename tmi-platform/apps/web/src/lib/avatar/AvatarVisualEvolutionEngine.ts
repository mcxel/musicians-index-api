/**
 * AvatarVisualEvolutionEngine
 * Manages safe, observable visual mutations for avatar instances.
 * Every change has a fallback. Every mutation is logged. No hidden updates.
 */

export type VisualEvolutionTier = "base" | "developed" | "refined" | "signature" | "iconic";

export interface VisualEvolutionState {
  avatarId: string;
  tier: VisualEvolutionTier;
  glowIntensityMultiplier: number;   // 1.0 = base, max 2.0
  expressionRange: number;           // 1–5 (number of unlocked expressions)
  motionFluidity: number;            // 0.5–1.5 (animation smoothness scalar)
  auraColor: string | null;          // null = not yet unlocked
  crownEligible: boolean;
  lastEvolved: number;
  evolutionLog: VisualEvolutionEvent[];
  fallbackTier: VisualEvolutionTier;
}

export interface VisualEvolutionEvent {
  timestamp: number;
  field: string;
  previousValue: unknown;
  newValue: unknown;
  triggerReason: string;
  adminVisible: boolean;
}

const MAX_LOG = 100;
const evolutionStore = new Map<string, VisualEvolutionState>();

const TIER_THRESHOLDS: Record<VisualEvolutionTier, number> = {
  base:      0,
  developed: 300,
  refined:   700,
  signature: 1400,
  iconic:    2500,
};

export function getVisualEvolutionState(avatarId: string): VisualEvolutionState {
  const existing = evolutionStore.get(avatarId);
  if (existing) return existing;
  const fresh: VisualEvolutionState = {
    avatarId,
    tier: "base",
    glowIntensityMultiplier: 1.0,
    expressionRange: 3,
    motionFluidity: 0.8,
    auraColor: null,
    crownEligible: false,
    lastEvolved: 0,
    evolutionLog: [],
    fallbackTier: "base",
  };
  evolutionStore.set(avatarId, fresh);
  return fresh;
}

export function evolveVisualFromXP(
  avatarId: string,
  totalXP: number,
  triggerReason: string
): VisualEvolutionState {
  const state = getVisualEvolutionState(avatarId);
  const events: VisualEvolutionEvent[] = [];

  let tier: VisualEvolutionTier = "base";
  for (const [t, threshold] of Object.entries(TIER_THRESHOLDS) as [VisualEvolutionTier, number][]) {
    if (totalXP >= threshold) tier = t;
  }

  const tierOrder: VisualEvolutionTier[] = ["base", "developed", "refined", "signature", "iconic"];
  const tierIdx = tierOrder.indexOf(tier);
  const newGlow = Math.min(2.0, 1.0 + tierIdx * 0.25);
  const newExpressions = Math.min(5, 3 + tierIdx);
  const newFluidity = Math.min(1.5, 0.8 + tierIdx * 0.15);
  const auraColors = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#00FF88"];
  const newAura = tierIdx >= 2 ? auraColors[tierIdx % auraColors.length] : state.auraColor;
  const crownEligible = tier === "iconic";

  function logChange(field: string, prev: unknown, next: unknown): void {
    if (prev === next) return;
    events.push({ timestamp: Date.now(), field, previousValue: prev, newValue: next, triggerReason, adminVisible: true });
  }

  logChange("tier", state.tier, tier);
  logChange("glowIntensityMultiplier", state.glowIntensityMultiplier, newGlow);
  logChange("expressionRange", state.expressionRange, newExpressions);
  logChange("motionFluidity", state.motionFluidity, newFluidity);
  logChange("auraColor", state.auraColor, newAura);
  logChange("crownEligible", state.crownEligible, crownEligible);

  const next: VisualEvolutionState = {
    ...state,
    tier,
    glowIntensityMultiplier: newGlow,
    expressionRange: newExpressions,
    motionFluidity: newFluidity,
    auraColor: newAura,
    crownEligible,
    lastEvolved: events.length > 0 ? Date.now() : state.lastEvolved,
    evolutionLog: [...events, ...state.evolutionLog].slice(0, MAX_LOG),
    fallbackTier: state.tier,
  };

  evolutionStore.set(avatarId, next);
  return next;
}

export function rollbackVisualEvolution(avatarId: string): VisualEvolutionState {
  const state = getVisualEvolutionState(avatarId);
  const rolledBack: VisualEvolutionState = {
    ...state,
    tier: state.fallbackTier,
    evolutionLog: [
      { timestamp: Date.now(), field: "tier", previousValue: state.tier, newValue: state.fallbackTier, triggerReason: "admin_rollback", adminVisible: true },
      ...state.evolutionLog,
    ].slice(0, MAX_LOG),
  };
  evolutionStore.set(avatarId, rolledBack);
  return rolledBack;
}

export function getAllEvolutionStates(): VisualEvolutionState[] {
  return [...evolutionStore.values()];
}

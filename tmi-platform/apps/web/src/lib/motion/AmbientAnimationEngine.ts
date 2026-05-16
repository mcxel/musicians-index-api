/**
 * AmbientAnimationEngine
 * Manages low-priority background animations: breathing cards, idle portraits,
 * floating particles, and environmental pulse effects.
 * Automatically yields to higher-priority motion events.
 */

import { registerMotionElement, setMotionState, getMotionStats } from "@/lib/motion/UniversalMotionRuntime";

export type AmbientPattern =
  | "slow-breathe"
  | "float-up"
  | "float-down"
  | "gentle-sway"
  | "color-shift"
  | "sparkle"
  | "particle-drift"
  | "edge-glow"
  | "ripple"
  | "none";

export interface AmbientAnimation {
  animationId: string;
  elementId: string;
  pattern: AmbientPattern;
  intensity: number;
  cycleDurationMs: number;
  phaseOffsetMs: number;
  active: boolean;
  registeredAt: number;
}

const PATTERN_DURATION_MS: Record<AmbientPattern, number> = {
  "slow-breathe":  4000,
  "float-up":      6000,
  "float-down":    6000,
  "gentle-sway":   5000,
  "color-shift":   8000,
  "sparkle":       2000,
  "particle-drift":3000,
  "edge-glow":     4000,
  "ripple":        3000,
  "none":          0,
};

const YIELD_THRESHOLD = 0.75;  // freeze ambient when energy > this

const ambientAnimations = new Map<string, AmbientAnimation>();
let globalEnergyLevel = 0;

export function registerAmbient(
  elementId: string,
  pattern: AmbientPattern,
  opts: {
    intensity?: number;
    phaseOffsetMs?: number;
    ownerId?: string;
  } = {}
): AmbientAnimation {
  const animationId = `ambient_${elementId}_${Date.now()}`;
  const cycleDurationMs = PATTERN_DURATION_MS[pattern] || 4000;

  registerMotionElement(elementId, opts.ownerId ?? elementId, "overlay", {
    initialState: "idle",
    intensity: opts.intensity ?? 0.3,
    energyReactive: false,
    loopDurationMs: cycleDurationMs,
  });

  const animation: AmbientAnimation = {
    animationId,
    elementId,
    pattern,
    intensity: opts.intensity ?? 0.3,
    cycleDurationMs,
    phaseOffsetMs: opts.phaseOffsetMs ?? Math.random() * cycleDurationMs,
    active: globalEnergyLevel <= YIELD_THRESHOLD,
    registeredAt: Date.now(),
  };

  ambientAnimations.set(elementId, animation);

  if (animation.active) {
    setMotionState(elementId, "breathing");
  } else {
    setMotionState(elementId, "frozen");
  }

  return animation;
}

export function updateGlobalEnergy(energyNormalized: number): void {
  globalEnergyLevel = energyNormalized;
  const shouldYield = energyNormalized > YIELD_THRESHOLD;

  for (const [elementId, anim] of ambientAnimations) {
    if (shouldYield && anim.active) {
      ambientAnimations.set(elementId, { ...anim, active: false });
      setMotionState(elementId, "frozen");
    } else if (!shouldYield && !anim.active) {
      ambientAnimations.set(elementId, { ...anim, active: true });
      setMotionState(elementId, "breathing");
    }
  }
}

export function setAmbientPattern(elementId: string, pattern: AmbientPattern): AmbientAnimation | null {
  const anim = ambientAnimations.get(elementId);
  if (!anim) return null;
  const updated: AmbientAnimation = {
    ...anim,
    pattern,
    cycleDurationMs: PATTERN_DURATION_MS[pattern] || anim.cycleDurationMs,
  };
  ambientAnimations.set(elementId, updated);
  return updated;
}

export function pauseAmbient(elementId: string): void {
  const anim = ambientAnimations.get(elementId);
  if (!anim) return;
  ambientAnimations.set(elementId, { ...anim, active: false });
  setMotionState(elementId, "frozen");
}

export function resumeAmbient(elementId: string): void {
  const anim = ambientAnimations.get(elementId);
  if (!anim || globalEnergyLevel > YIELD_THRESHOLD) return;
  ambientAnimations.set(elementId, { ...anim, active: true });
  setMotionState(elementId, "breathing");
}

export function unregisterAmbient(elementId: string): void {
  ambientAnimations.delete(elementId);
}

export function getAmbientAnimation(elementId: string): AmbientAnimation | null {
  return ambientAnimations.get(elementId) ?? null;
}

export function getAllAmbientAnimations(): AmbientAnimation[] {
  return [...ambientAnimations.values()];
}

export function getAmbientStats(): {
  total: number;
  active: number;
  frozen: number;
  byPattern: Record<string, number>;
  motionRuntimeTotal: number;
} {
  let active = 0, frozen = 0;
  const byPattern: Record<string, number> = {};
  for (const anim of ambientAnimations.values()) {
    if (anim.active) active++; else frozen++;
    byPattern[anim.pattern] = (byPattern[anim.pattern] ?? 0) + 1;
  }
  return {
    total: ambientAnimations.size,
    active,
    frozen,
    byPattern,
    motionRuntimeTotal: getMotionStats().totalRegistered,
  };
}

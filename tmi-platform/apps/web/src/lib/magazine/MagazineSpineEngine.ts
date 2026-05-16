// ─── MAGAZINE SPINE ENGINE ────────────────────────────────────────────────────
// Models the physical spine of the magazine — flex, crease, glow, and breathing
// motion. Consumed by HomeMagazineShell.tsx and MagazineShellTransition.tsx
// to drive CSS transform values and animation hints.
// ─────────────────────────────────────────────────────────────────────────────

import type { MagShellState } from "@/lib/magazine/MagazineShellState";

// ─── SPINE CONSTANTS ─────────────────────────────────────────────────────────

/** Physical width of the spine in pixels (matches HomeMagazineShell SPINE_W) */
export const SPINE_WIDTH_PX = 42;

/** Perspective value used for all 3D transforms (matches HomeMagazineShell) */
export const PERSPECTIVE_PX = 1800;

// ─── SPINE FLEX STATE ────────────────────────────────────────────────────────

export type SpineBreathPhase = "idle" | "inhale" | "peak" | "exhale";

export interface SpineFlexState {
  /** 0 = fully closed, 1 = fully open */
  openness: number;
  /** Physical page-pressure bow depth (0–1) */
  crease: number;
  /** Spine glow intensity (0–1) */
  glowIntensity: number;
  /** Breathing phase for idle closed-state animation */
  breathPhase: SpineBreathPhase;
  /** CSS color for the spine gradient based on openness */
  spineGradient: string;
  /** Suggested easing curve for the current state */
  easing: string;
  /** Suggested transition duration (ms) for openness changes */
  transitionMs: number;
}

// ─── SPINE GRADIENT FACTORY ───────────────────────────────────────────────────

function buildSpineGradient(openness: number): string {
  // Interpolate between cyan-fuchsia (closed) and fuchsia-violet (open)
  if (openness < 0.5) {
    return "linear-gradient(to bottom, #00FFFF44, #FF2DAA33, #FFD70022, #00FFFF44)";
  }
  return "linear-gradient(to bottom, #FF2DAA44, #AA2DFF33, #00FFFF22, #FF2DAA44)";
}

// ─── STATE → FLEX MODEL ───────────────────────────────────────────────────────

export function deriveSpineFlexState(state: MagShellState): SpineFlexState {
  switch (state) {
    case "MAG_CLOSED":
      return {
        openness: 0,
        crease: 0.12,
        glowIntensity: 0.25,
        breathPhase: "idle",
        spineGradient: buildSpineGradient(0),
        easing: "cubic-bezier(.22,.8,.2,1)",
        transitionMs: 300,
      };

    case "MAG_OPENING":
      return {
        openness: 0.5,
        crease: 0.8,
        glowIntensity: 0.9,
        breathPhase: "peak",
        spineGradient: buildSpineGradient(0.5),
        easing: "cubic-bezier(.22,.8,.2,1)",
        transitionMs: 900,
      };

    case "MAG_OPEN":
      return {
        openness: 1,
        crease: 0.55,
        glowIntensity: 0.6,
        breathPhase: "idle",
        spineGradient: buildSpineGradient(1),
        easing: "cubic-bezier(.22,.8,.2,1)",
        transitionMs: 300,
      };

    case "MAG_TURNING":
      return {
        openness: 1,
        crease: 0.92,
        glowIntensity: 1.0,
        breathPhase: "peak",
        spineGradient: buildSpineGradient(1),
        easing: "cubic-bezier(.3,.9,.2,1)",
        transitionMs: 520,
      };

    case "MAG_CLOSING":
      return {
        openness: 0.5,
        crease: 0.7,
        glowIntensity: 0.5,
        breathPhase: "exhale",
        spineGradient: buildSpineGradient(0.5),
        easing: "cubic-bezier(.22,.8,.2,1)",
        transitionMs: 700,
      };
  }
}

// ─── BREATHING ANIMATION MODEL ────────────────────────────────────────────────
// Used to drive a 3-phase idle breathing animation in MAG_CLOSED state.
// Consumers map phase → CSS animation keyframe or transform value.

export interface SpineBreathCycle {
  durationMs: number;
  scaleRange: [number, number];
  glowRange: [number, number];
  phases: Array<{ phase: SpineBreathPhase; durationMs: number }>;
}

export const SPINE_BREATH_CYCLE: SpineBreathCycle = {
  durationMs: 3200,
  scaleRange: [0.98, 1.015],
  glowRange: [0.18, 0.42],
  phases: [
    { phase: "idle",   durationMs: 800  },
    { phase: "inhale", durationMs: 1000 },
    { phase: "peak",   durationMs: 400  },
    { phase: "exhale", durationMs: 1000 },
  ],
};

// ─── SPINE SHADOW MODEL ───────────────────────────────────────────────────────
// Produces CSS boxShadow string for the spine depth illusion at a given openness.

export function getSpineShadow(openness: number): string {
  const depth = Math.round(openness * 38);
  const spread = Math.round(openness * 16);
  return (
    `0 ${depth}px ${depth * 2}px rgba(0,0,0,${0.5 + openness * 0.35}),` +
    `0 0 0 1px rgba(255,255,255,${0.04 + openness * 0.03}),` +
    `0 0 ${spread}px rgba(0,255,255,${0.02 + openness * 0.04})`
  );
}

// ─── PAGE PRESSURE BOW ───────────────────────────────────────────────────────
// Returns CSS background for a convex page-bow highlight at a given crease depth.

export function getPageBowGradient(crease: number): string {
  const alpha = (0.02 + crease * 0.05).toFixed(3);
  return `radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,255,255,${alpha}), transparent 70%)`;
}

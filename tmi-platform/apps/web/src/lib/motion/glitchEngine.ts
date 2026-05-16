"use client";

import { prefersReducedMotion } from "./reducedMotionGuard";
import { TIMING } from "./timingRegistry";

export type GlitchIntensity = "subtle" | "medium" | "heavy" | "signal-interrupt";

interface GlitchOptions {
  intensity?: GlitchIntensity;
  durationMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

const INTENSITY_MAP: Record<GlitchIntensity, string[]> = {
  subtle: ["tmi-glitch-flicker"],
  medium: ["tmi-glitch-flicker", "tmi-rgb-shift"],
  heavy: ["tmi-glitch-flicker", "tmi-rgb-shift", "tmi-signal-noise"],
  "signal-interrupt": ["tmi-glitch-flicker", "tmi-rgb-shift", "tmi-signal-noise", "tmi-scanline-burst"],
};

/**
 * Applies a timed glitch effect to a DOM element.
 * Fully click-safe — only visual CSS classes are toggled.
 */
export function applyGlitch(
  element: HTMLElement | null,
  options: GlitchOptions = {}
): void {
  if (!element || prefersReducedMotion()) return;

  const intensity = options.intensity ?? "medium";
  const duration = options.durationMs ?? TIMING.glitchBurst;
  const classes = INTENSITY_MAP[intensity];

  options.onStart?.();
  classes.forEach((cls) => element.classList.add(cls));

  window.setTimeout(() => {
    classes.forEach((cls) => element.classList.remove(cls));
    options.onEnd?.();
  }, duration);
}

/**
 * Schedules a random flicker at irregular intervals.
 * Returns a cleanup function — call it in useEffect cleanup.
 */
export function randomFlicker(
  element: HTMLElement | null,
  minIntervalMs = 3000,
  maxIntervalMs = 8000
): () => void {
  if (!element || prefersReducedMotion()) return () => {};

  let id: ReturnType<typeof setTimeout>;

  const schedule = () => {
    const delay = minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
    id = setTimeout(() => {
      applyGlitch(element, { intensity: "subtle", durationMs: TIMING.glitchFlicker });
      schedule();
    }, delay);
  };

  schedule();
  return () => clearTimeout(id);
}

/**
 * Generates a color-shift filter string for inline CSS.
 */
export function colorShiftFilter(hueRotateDeg = 12): string {
  if (prefersReducedMotion()) return "none";
  return `hue-rotate(${hueRotateDeg}deg) saturate(1.3) brightness(1.05)`;
}

/**
 * Generates a signal-interrupt scanline overlay CSS variables object.
 */
export function scanlineOverlay(): React.CSSProperties {
  if (prefersReducedMotion()) return {};
  return {
    backgroundImage:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,255,255,0.03) 2px, rgba(0,0,0,0) 3px)",
    backgroundSize: "100% 3px",
    animation: "tmi-scanline-drift 8s linear infinite",
  };
}

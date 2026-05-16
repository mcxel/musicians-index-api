/**
 * CINEMATION PRESETS
 * Named cinematic effect presets used by motion components.
 * Import these instead of hardcoding keyframe names or easing strings.
 */

import { TIMING } from "./timingRegistry";

export interface CSSAnimationPreset {
  animationName: string;
  duration: string;
  timingFunction: string;
  iterationCount: string | number;
  fillMode?: string;
  delay?: string;
}

export const CINEPRESETS = {
  scanlineDrift: {
    animationName: "tmi-scanline-drift",
    duration: `${TIMING.scanlineCycle}ms`,
    timingFunction: "linear",
    iterationCount: "infinite",
  },

  glitchFlicker: {
    animationName: "tmi-glitch-flicker",
    duration: `${TIMING.glitchFlicker}ms`,
    timingFunction: "steps(4, end)",
    iterationCount: 1,
    fillMode: "both",
  },

  rgbShift: {
    animationName: "tmi-rgb-shift",
    duration: `${TIMING.glitchBurst}ms`,
    timingFunction: "ease-in-out",
    iterationCount: 1,
    fillMode: "both",
  },

  starburst: {
    animationName: "tmi-starburst",
    duration: `${TIMING.starburstDuration}ms`,
    timingFunction: "cubic-bezier(0.22,1,0.36,1)",
    iterationCount: 1,
    fillMode: "both",
  },

  livePulse: {
    animationName: "tmi-live-pulse",
    duration: "1800ms",
    timingFunction: "ease-in-out",
    iterationCount: "infinite",
  },

  heartbeat: {
    animationName: "tmi-heartbeat",
    duration: `${TIMING.heartbeat}ms`,
    timingFunction: "ease-in-out",
    iterationCount: "infinite",
  },

  warningPulse: {
    animationName: "tmi-warning-pulse",
    duration: `${TIMING.warningPulse}ms`,
    timingFunction: "ease-in-out",
    iterationCount: "infinite",
  },

  criticalFlash: {
    animationName: "tmi-critical-flash",
    duration: `${TIMING.criticalFlash}ms`,
    timingFunction: "steps(2, end)",
    iterationCount: 5,
    fillMode: "both",
  },

  counterTick: {
    animationName: "tmi-counter-tick",
    duration: `${TIMING.counterTick}ms`,
    timingFunction: "ease-out",
    iterationCount: 1,
    fillMode: "both",
  },

  magazineFlip: {
    animationName: "tmi-magazine-flip",
    duration: `${TIMING.pageFlip}ms`,
    timingFunction: "cubic-bezier(0.4,0,0.2,1)",
    iterationCount: 1,
    fillMode: "both",
  },

  summonBurst: {
    animationName: "tmi-summon-burst",
    duration: "520ms",
    timingFunction: "cubic-bezier(0.22,1,0.36,1)",
    iterationCount: 1,
    fillMode: "both",
  },

  securitySweep: {
    animationName: "tmi-security-sweep",
    duration: "2400ms",
    timingFunction: "ease-in-out",
    iterationCount: "infinite",
  },
} satisfies Record<string, CSSAnimationPreset>;

export type CinematonPresetKey = keyof typeof CINEPRESETS;

export function toCSSAnimation(preset: CSSAnimationPreset): string {
  return [
    `${preset.animationName}`,
    preset.duration,
    preset.timingFunction,
    preset.delay ?? "0ms",
    preset.fillMode ?? "none",
    String(preset.iterationCount),
  ].join(" ");
}

/**
 * MOTION REGISTRY
 * Maps each page/surface to its permitted motion families and timing rules.
 * Every animation component reads this before firing — no unregistered animations.
 */

import { TIMING, TimingKey } from "./timingRegistry";

export type MotionFamily =
  | "homepage-orbit"
  | "homepage-rotation"
  | "starburst"
  | "magazine-flip"
  | "admin-monitor"
  | "admin-live-feed"
  | "admin-hud"
  | "sponsor-takeover"
  | "billboard-preview"
  | "game-reveal"
  | "lobby-entry"
  | "presence-counter"
  | "glitch-overlay"
  | "scanlines"
  | "route-transition";

export interface MotionRule {
  families: MotionFamily[];
  timingOverrides?: Partial<Record<TimingKey, number>>;
  reducedFallback?: MotionFamily[];
  glitchAllowed: boolean;
  heavy: boolean; // true = skip when low-power mode
}

const REGISTRY: Record<string, MotionRule> = {
  "home/1": {
    families: ["homepage-orbit", "homepage-rotation", "starburst", "glitch-overlay", "scanlines"],
    glitchAllowed: true,
    heavy: true,
    reducedFallback: ["homepage-rotation"],
  },
  "home/2": {
    families: ["homepage-rotation", "starburst", "scanlines", "glitch-overlay"],
    glitchAllowed: true,
    heavy: true,
    reducedFallback: ["homepage-rotation"],
  },
  "home/3": {
    families: ["homepage-rotation", "presence-counter", "billboard-preview", "scanlines"],
    glitchAllowed: false,
    heavy: false,
  },
  "home/4": {
    families: ["homepage-rotation", "starburst", "presence-counter"],
    glitchAllowed: false,
    heavy: false,
  },
  "home/5": {
    families: ["homepage-rotation", "billboard-preview", "sponsor-takeover", "scanlines"],
    glitchAllowed: true,
    heavy: false,
    reducedFallback: ["homepage-rotation"],
  },
  magazine: {
    families: ["magazine-flip", "scanlines"],
    glitchAllowed: false,
    heavy: false,
  },
  admin: {
    families: ["admin-monitor", "admin-live-feed", "admin-hud", "glitch-overlay", "scanlines"],
    glitchAllowed: true,
    heavy: false,
    reducedFallback: ["admin-monitor"],
  },
  "admin/live-feed": {
    families: ["admin-live-feed", "admin-hud"],
    glitchAllowed: false,
    heavy: false,
  },
  sponsors: {
    families: ["sponsor-takeover", "billboard-preview", "glitch-overlay"],
    glitchAllowed: true,
    heavy: false,
  },
  lobbies: {
    families: ["lobby-entry", "presence-counter", "billboard-preview"],
    glitchAllowed: false,
    heavy: false,
  },
  billboards: {
    families: ["billboard-preview", "sponsor-takeover", "scanlines"],
    glitchAllowed: true,
    heavy: false,
    reducedFallback: ["billboard-preview"],
  },
  games: {
    families: ["game-reveal", "presence-counter", "glitch-overlay"],
    glitchAllowed: true,
    heavy: false,
  },
  default: {
    families: ["route-transition"],
    glitchAllowed: false,
    heavy: false,
  },
};

export function getMotionRule(pageKey: string): MotionRule {
  return REGISTRY[pageKey] ?? REGISTRY.default;
}

export function isMotionAllowed(pageKey: string, family: MotionFamily): boolean {
  const rule = getMotionRule(pageKey);
  return rule.families.includes(family);
}

export const ALL_MOTION_FAMILIES = Object.values(REGISTRY)
  .flatMap((r) => r.families)
  .filter((v, i, a) => a.indexOf(v) === i);

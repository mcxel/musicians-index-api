/**
 * Crown Animation Engine
 * Motion variants, timing, and rotation logic for the Weekly Crown system.
 */
import type { Variants } from "framer-motion";

// --- Motion Variants ---

export const crownFloatVariant: Variants = {
  idle: {
    y: 0,
    filter: "drop-shadow(0 0 8px #FFD700)",
  },
  float: {
    y: [0, -5, 0],
    filter: [
      "drop-shadow(0 0 8px #FFD700)",
      "drop-shadow(0 0 22px #FFD700)",
      "drop-shadow(0 0 8px #FFD700)",
    ],
    transition: {
      duration: 2.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const crownGlowVariant: Variants = {
  idle: { opacity: 0.4 },
  pulse: {
    opacity: [0.4, 1, 0.4],
    scale: [1, 1.08, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const winnerSlideVariant: Variants = {
  enter: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: 14, transition: { duration: 0.3 } },
};

export const genreBadgeVariant: Variants = {
  enter: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
};

// --- Rotation Schedules ---

export const GENRE_ROTATION_MS = 2000;
export const WINNER_ROTATION_MS = 6000;

/**
 * Returns the next index in a circular list.
 */
export function nextIndex(current: number, length: number): number {
  return (current + 1) % length;
}

/**
 * Crown tier colors for rank badges.
 */
export const CROWN_TIER_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

export function getCrownColor(rank: number): string {
  return CROWN_TIER_COLORS[rank] ?? "rgba(0,255,255,0.5)";
}

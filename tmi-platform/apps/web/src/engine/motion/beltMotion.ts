/**
 * Motion Engine — Global animation presets for belt components.
 * Import these variants to keep animation language consistent across all sections.
 */
import type { Variants, Transition } from "framer-motion";

// ─── Belt entrance ───────────────────────────────────────────────────────────

export const beltEntranceVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export const beltExitVariant: Variants = {
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

// ─── Stagger container ────────────────────────────────────────────────────────

export const staggerContainerVariant: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

export const staggerChildVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ─── Card interactions ────────────────────────────────────────────────────────

export const cardHoverProps = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.18, ease: "easeOut" } as Transition,
};

export const cardGlowHover = (color: string) => ({
  whileHover: {
    y: -4,
    boxShadow: `0 8px 30px ${color}30`,
  },
  transition: { duration: 0.18 } as Transition,
});

// ─── Slide transitions ────────────────────────────────────────────────────────

export const slideInFromLeftVariant: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.25 } },
};

export const slideInFromRightVariant: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
};

// ─── Marquee / scroll ─────────────────────────────────────────────────────────

export const marqueeAnimation = (durationSec = 20) => ({
  animate: { x: ["0%", "-50%"] },
  transition: { duration: durationSec, repeat: Infinity, ease: "linear" as const },
});

// ─── Neon pulse ──────────────────────────────────────────────────────────────

export const neonPulseVariant = (color: string): Variants => ({
  idle: { opacity: 1 },
  pulse: {
    opacity: [1, 0.5, 1],
    textShadow: [
      `0 0 8px ${color}`,
      `0 0 24px ${color}, 0 0 48px ${color}`,
      `0 0 8px ${color}`,
    ],
    transition: { duration: 2, repeat: Infinity },
  },
});

// ─── Live badge pulse ─────────────────────────────────────────────────────────

export const liveDotVariant: Variants = {
  pulse: {
    scale: [1, 2.2, 1],
    opacity: [0.7, 0, 0.7],
    transition: { duration: 1.4, repeat: Infinity },
  },
};

// ─── Page transition ──────────────────────────────────────────────────────────

export const pageTransitionVariant: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

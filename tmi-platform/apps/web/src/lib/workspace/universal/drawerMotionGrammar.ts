/**
 * Shared Hub drawer motion grammar — one vocabulary for Lobby, Cast, and
 * every other bottom-drawer workspace. Consumers must not invent one-off
 * height/opacity animations per tool.
 *
 * Motions are presentation only — never remount WebRTC / media sessions.
 */

import type { Transition, Variants } from "framer-motion";

export const DRAWER_EASE = [0.22, 1, 0.36, 1] as const;

export const DRAWER_TRANSITION: Transition = {
  duration: 0.32,
  ease: DRAWER_EASE,
};

export const REDUCED_MOTION_TRANSITION: Transition = {
  duration: 0.01,
};

/** DRAWER_IN / DRAWER_OUT — host shell open/close. */
export const DRAWER_SHELL_VARIANTS: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
};

/** PANEL_SCALE_FADE — content swap inside an already-open drawer. */
export const PANEL_SCALE_FADE_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.985, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.99, y: -6 },
};

/** CHILD_PUSH — nested workspace opens on top of stack. */
export const CHILD_PUSH_VARIANTS: Variants = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

/** CHILD_POP — reverse of CHILD_PUSH (RETURN_RESTORE child). */
export const CHILD_POP_VARIANTS: Variants = {
  initial: { opacity: 0, x: -18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 28 },
};

/** EXPAND_TO_FOCUS / COLLAPSE_FROM_FOCUS — Lobby/Cast height focus. */
export const EXPAND_FOCUS_TRANSITION: Transition = {
  duration: 0.35,
  ease: DRAWER_EASE,
};

/** MOBILE_BOTTOM_DRAWER — Stage Deck WORK surface. */
export const MOBILE_BOTTOM_DRAWER_VARIANTS: Variants = {
  initial: { opacity: 0, y: "8%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "6%" },
};

export type DrawerMotionKind =
  | "DRAWER_IN"
  | "DRAWER_OUT"
  | "PANEL_SCALE_FADE"
  | "CHILD_PUSH"
  | "CHILD_POP"
  | "EXPAND_TO_FOCUS"
  | "COLLAPSE_FROM_FOCUS"
  | "MOBILE_BOTTOM_DRAWER"
  | "RETURN_RESTORE";

export function resolveDrawerContentVariants(
  kind: "PANEL_SCALE_FADE" | "CHILD_PUSH" | "CHILD_POP" | "RETURN_RESTORE",
): Variants {
  if (kind === "CHILD_PUSH") return CHILD_PUSH_VARIANTS;
  if (kind === "CHILD_POP" || kind === "RETURN_RESTORE") return CHILD_POP_VARIANTS;
  return PANEL_SCALE_FADE_VARIANTS;
}

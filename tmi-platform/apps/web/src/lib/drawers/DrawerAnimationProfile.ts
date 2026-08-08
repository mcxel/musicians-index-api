/**
 * DrawerAnimationProfile — per-drawer-type motion personality.
 *
 * Universal Drawer Base owns shell chrome only.
 * Animation belongs to the drawer TYPE (vinyl_flip, hologram, …), not the shell.
 * Scales via ThemeEngine transitionStyle / motionSpeed → MotionProfile preference.
 */

import type { Transition, Variants } from "framer-motion";
import type { ThemeTokens } from "@/lib/design/ThemeEngine";

/**
 * Canonical open height for UniversalDrawerBase shells.
 * Tall enough to claim unused space under the sheet (closer to dock / screen
 * bottom) while leaving a thin top chrome band — not full 100vh.
 */
export const DRAWER_OPEN_HEIGHT = "min(94vh, 1080px)";

/** User/theme motion preference (maps from ThemeEngine.transitionStyle). */
export type MotionProfilePreference = "Minimal" | "Standard" | "Cinematic";

export type DrawerAnimationId =
  | "vinyl_flip"
  | "hologram"
  | "mechanical"
  | "memory_scatter"
  | "command_lift"
  | "orbit"
  | "portal"
  | "fold";

export interface DrawerAnimationProfile {
  id: DrawerAnimationId;
  label: string;
  /** Shell enter/exit (height or y-based bottom drawer). */
  shell: Variants;
  /** Content swap inside an already-open shell. */
  content: Variants;
  transition: Transition;
}

export function resolveMotionProfile(theme?: Pick<ThemeTokens, "transitionStyle"> | null): MotionProfilePreference {
  const style = theme?.transitionStyle ?? "smooth";
  if (style === "minimal") return "Minimal";
  if (style === "dramatic") return "Cinematic";
  return "Standard";
}

function speedMul(theme?: Pick<ThemeTokens, "motionSpeed"> | null): number {
  const s = theme?.motionSpeed ?? 1;
  return s > 0 ? 1 / s : 1;
}

function profileScale(
  base: DrawerAnimationProfile,
  preference: MotionProfilePreference,
  theme?: Pick<ThemeTokens, "motionSpeed"> | null,
): DrawerAnimationProfile {
  const mul = speedMul(theme);
  if (preference === "Minimal") {
    return {
      ...base,
      shell: {
        initial: { height: 0, opacity: 0.92 },
        animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1 },
        exit: { height: 0, opacity: 0 },
      },
      content: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      transition: { duration: 0.18 * mul, ease: "easeOut" },
    };
  }
  if (preference === "Cinematic") {
    return {
      ...base,
      transition: {
        ...base.transition,
        ...(typeof base.transition === "object" && "duration" in (base.transition as object)
          ? { duration: ((base.transition as { duration?: number }).duration ?? 0.4) * 1.25 * mul }
          : { type: "spring", stiffness: 280, damping: 22, mass: 1.1 }),
      },
    };
  }
  // Standard — mild speed scale from theme
  if (base.transition && typeof base.transition === "object" && "type" in base.transition && base.transition.type === "spring") {
    const spring = base.transition as { type: "spring"; stiffness?: number; damping?: number; mass?: number };
    return {
      ...base,
      transition: {
        type: "spring",
        stiffness: (spring.stiffness ?? 400) / Math.max(mul, 0.5),
        damping: spring.damping ?? 32,
        mass: spring.mass ?? 0.8,
      },
    };
  }
  return base;
}

const PROFILES: Record<DrawerAnimationId, DrawerAnimationProfile> = {
  vinyl_flip: {
    id: "vinyl_flip",
    label: "Vinyl Flip",
    shell: {
      initial: { height: 0, opacity: 0.7, rotateX: 28 },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1, rotateX: 0 },
      exit: { height: 0, opacity: 0, rotateX: -18 },
    },
    content: {
      initial: { rotateY: -55, opacity: 0, scale: 0.92 },
      animate: { rotateY: 0, opacity: 1, scale: 1 },
      exit: { rotateY: 45, opacity: 0, scale: 0.94 },
    },
    transition: { type: "spring", stiffness: 380, damping: 28, mass: 0.85 },
  },
  hologram: {
    id: "hologram",
    label: "Hologram",
    shell: {
      initial: { height: 0, opacity: 0, filter: "blur(8px)" },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1, filter: "blur(0px)" },
      exit: { height: 0, opacity: 0, filter: "blur(6px)" },
    },
    content: {
      initial: { y: 12, opacity: 0, scale: 1.04 },
      animate: { y: 0, opacity: 1, scale: 1 },
      exit: { y: -8, opacity: 0, scale: 0.98 },
    },
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  mechanical: {
    id: "mechanical",
    label: "Mechanical",
    shell: {
      initial: { height: 0, opacity: 0.9, y: 24 },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1, y: 0 },
      exit: { height: 0, opacity: 0.85, y: 20 },
    },
    content: {
      initial: { y: 40, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 28, opacity: 0 },
    },
    transition: { type: "tween", duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  },
  memory_scatter: {
    id: "memory_scatter",
    label: "Memory Scatter",
    shell: {
      initial: { height: 0, opacity: 0.5, scale: 0.96 },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1, scale: 1 },
      exit: { height: 0, opacity: 0, scale: 0.94 },
    },
    content: {
      initial: { opacity: 0, scale: 0.86, x: -18, rotate: -3 },
      animate: { opacity: 1, scale: 1, x: 0, rotate: 0 },
      exit: { opacity: 0, scale: 0.9, x: 22, rotate: 2 },
    },
    transition: { type: "spring", stiffness: 320, damping: 24, mass: 0.9 },
  },
  command_lift: {
    id: "command_lift",
    label: "Command Lift",
    shell: {
      initial: { height: 0, opacity: 0.85 },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1 },
      exit: { height: 0, opacity: 0 },
    },
    content: {
      initial: { y: 32, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
    },
    transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.7 },
  },
  orbit: {
    id: "orbit",
    label: "Orbit",
    shell: {
      initial: { height: 0, opacity: 0.6, scale: 0.92 },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1, scale: 1 },
      exit: { height: 0, opacity: 0, scale: 0.95 },
    },
    content: {
      initial: { opacity: 0, rotate: -8, scale: 0.9 },
      animate: { opacity: 1, rotate: 0, scale: 1 },
      exit: { opacity: 0, rotate: 6, scale: 0.94 },
    },
    transition: { type: "spring", stiffness: 360, damping: 26, mass: 0.95 },
  },
  portal: {
    id: "portal",
    label: "Portal",
    shell: {
      initial: { height: 0, opacity: 0, scaleY: 0.4 },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1, scaleY: 1 },
      exit: { height: 0, opacity: 0, scaleY: 0.5 },
    },
    content: {
      initial: { scale: 0.7, opacity: 0, filter: "brightness(1.6)" },
      animate: { scale: 1, opacity: 1, filter: "brightness(1)" },
      exit: { scale: 1.08, opacity: 0, filter: "brightness(0.6)" },
    },
    transition: { type: "spring", stiffness: 300, damping: 22, mass: 1 },
  },
  fold: {
    id: "fold",
    label: "Fold",
    shell: {
      initial: { height: 0, opacity: 0.8, rotateX: 55 },
      animate: { height: DRAWER_OPEN_HEIGHT, opacity: 1, rotateX: 0 },
      exit: { height: 0, opacity: 0, rotateX: 40 },
    },
    content: {
      initial: { y: -16, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 12, opacity: 0 },
    },
    transition: { type: "spring", stiffness: 420, damping: 30, mass: 0.75 },
  },
};

/** Fixed overlay drawers (e.g. FanAvatarLobbyDrawer) — same personality, y% instead of height. */
export function overlayShellVariants(profile: DrawerAnimationProfile): Variants {
  return {
    initial: { y: "100%", opacity: 0.85 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  };
}

export function getDrawerAnimationProfile(
  id: DrawerAnimationId,
  theme?: Pick<ThemeTokens, "transitionStyle" | "motionSpeed"> | null,
): DrawerAnimationProfile {
  const base = PROFILES[id] ?? PROFILES.command_lift;
  return profileScale(base, resolveMotionProfile(theme), theme);
}

export function listDrawerAnimationProfiles(): DrawerAnimationProfile[] {
  return Object.values(PROFILES);
}

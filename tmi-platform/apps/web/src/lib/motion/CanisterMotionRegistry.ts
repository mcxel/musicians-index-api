/**
 * CanisterMotionRegistry
 *
 * Assigns a unique open/close animation variant to each canister type.
 * The goal: every canister feels different when it opens — no monotony.
 *
 * Used by CanisterShell.tsx for Closed → Peek → Expanded transitions.
 * Framer-motion variants are defined here as data; CanisterShell renders them.
 */

import type { Variants } from 'framer-motion';

// ─── The eight canonical canister animation styles ────────────────────────────

export type CanisterMotionStyle =
  | 'SlideLeft'     // slides in from right edge
  | 'SlideRight'    // slides in from left edge
  | 'LiftUp'        // rises from below
  | 'DropDown'      // drops from above
  | 'NeonFade'      // fades in with neon glow burst
  | 'StageReveal'   // spotlight sweeps from center outward
  | 'MagazineFlip'  // 3D page flip (Y-axis rotation)
  | 'GlassExpand';  // glass morphism scale+blur expand from icon position

// ─── Framer Motion variant sets per style ────────────────────────────────────

export const CANISTER_MOTION_VARIANTS: Record<CanisterMotionStyle, Variants> = {
  SlideLeft: {
    hidden:  { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 32 } },
    exit:    { x: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
  },
  SlideRight: {
    hidden:  { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 32 } },
    exit:    { x: '-100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
  },
  LiftUp: {
    hidden:  { y: '40px', opacity: 0, scale: 0.97 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 360, damping: 28 } },
    exit:    { y: '40px', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
  },
  DropDown: {
    hidden:  { y: '-40px', opacity: 0, scale: 0.97 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 360, damping: 28 } },
    exit:    { y: '-40px', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
  },
  NeonFade: {
    hidden:  { opacity: 0, scale: 0.92, filter: 'brightness(2) blur(8px)' },
    visible: {
      opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)',
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    exit:    { opacity: 0, scale: 0.96, filter: 'brightness(1.5) blur(4px)', transition: { duration: 0.18 } },
  },
  StageReveal: {
    hidden:  { opacity: 0, scale: 0.6, filter: 'brightness(3) blur(12px)' },
    visible: {
      opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)',
      transition: { type: 'spring', stiffness: 240, damping: 22 },
    },
    exit:    { opacity: 0, scale: 0.8, transition: { duration: 0.22, ease: 'easeIn' } },
  },
  MagazineFlip: {
    hidden:  { rotateY: -90, opacity: 0, transformPerspective: 1200 },
    visible: {
      rotateY: 0, opacity: 1,
      transition: { type: 'spring', stiffness: 280, damping: 30 },
    },
    exit:    { rotateY: 90, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
  },
  GlassExpand: {
    hidden:  { scale: 0.4, opacity: 0, filter: 'blur(20px) saturate(0)' },
    visible: {
      scale: 1, opacity: 1, filter: 'blur(0px) saturate(1)',
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    exit:    { scale: 0.6, opacity: 0, filter: 'blur(8px)', transition: { duration: 0.2 } },
  },
};

// ─── Canister type → motion style mapping ────────────────────────────────────

export type CanisterType =
  | 'playlist'
  | 'memory-wall'
  | 'booking'
  | 'messaging'
  | 'store'
  | 'avatar'
  | 'avatar-workspace'
  | 'inventory'
  | 'public-lobby'
  | 'private-lobby'
  | 'live-lobby-wall'
  | 'activity'
  | 'rewards'
  | 'radio'
  | 'discovery';

const CANISTER_MOTION_MAP: Record<CanisterType, CanisterMotionStyle> = {
  'playlist':        'LiftUp',       // music rises from below
  'memory-wall':     'MagazineFlip', // flips open like a magazine page
  'booking':         'DropDown',     // calendar drops from above
  'messaging':       'SlideLeft',    // DMs slide in from right
  'store':           'SlideRight',   // store slides in from left
  'avatar':          'GlassExpand',  // avatar materializes from icon
  'avatar-workspace':'GlassExpand',  // wardrobe expands from icon
  'inventory':       'SlideRight',   // inventory drawer from left
  'public-lobby':    'StageReveal',  // spotlight sweeps open
  'private-lobby':   'NeonFade',     // private feels like stepping through neon curtain
  'live-lobby-wall': 'NeonFade',     // broadcast wall fades in
  'activity':        'LiftUp',       // activity feed rises
  'rewards':         'StageReveal',  // rewards revealed under spotlight
  'radio':           'LiftUp',       // radio station rises from below
  'discovery':       'MagazineFlip', // discovery flips open like editorial
};

export function getCanisterMotionStyle(type: CanisterType): CanisterMotionStyle {
  return CANISTER_MOTION_MAP[type];
}

export function getCanisterVariants(type: CanisterType): Variants {
  const style = getCanisterMotionStyle(type);
  return CANISTER_MOTION_VARIANTS[style];
}

// Peek state gets a lighter version — partial reveal only
export function getPeekVariants(type: CanisterType): Variants {
  const style = getCanisterMotionStyle(type);
  switch (style) {
    case 'SlideLeft':  return { hidden: { x: '80%', opacity: 0 }, visible: { x: '0%', opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 30 } }, exit: { x: '80%', opacity: 0 } };
    case 'SlideRight': return { hidden: { x: '-80%', opacity: 0 }, visible: { x: '0%', opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 30 } }, exit: { x: '-80%', opacity: 0 } };
    case 'LiftUp':
    case 'DropDown':   return { hidden: { y: '20px', opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } }, exit: { y: '20px', opacity: 0 } };
    default:           return { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } }, exit: { opacity: 0 } };
  }
}

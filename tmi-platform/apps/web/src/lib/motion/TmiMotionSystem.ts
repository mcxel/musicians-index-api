import type { Variants } from 'framer-motion';

export type MotionPreset = {
  initial: Record<string, string | number>;
  animate: Record<string, string | number>;
  exit: Record<string, string | number>;
  transition: {
    type?: 'spring' | 'tween';
    stiffness?: number;
    damping?: number;
    mass?: number;
    duration?: number;
    ease?: string;
  };
  transformOrigin?: string;
  className?: string;
};

function spring(stiffness = 300, damping = 25, mass = 0.9) {
  return { type: 'spring' as const, stiffness, damping, mass };
}

export const TmiMotionSystem: Record<string, MotionPreset> = {
  panelSlideLeft: {
    initial: { x: -36, opacity: 0, filter: 'blur(10px)' },
    animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { x: -24, opacity: 0, filter: 'blur(8px)' },
    transition: spring(),
    transformOrigin: 'left center',
  },
  panelSlideRight: {
    initial: { x: 36, opacity: 0, filter: 'blur(10px)' },
    animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { x: 24, opacity: 0, filter: 'blur(8px)' },
    transition: spring(),
    transformOrigin: 'right center',
  },
  panelSlideUp: {
    initial: { y: 32, opacity: 0, filter: 'blur(8px)' },
    animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { y: 24, opacity: 0, filter: 'blur(8px)' },
    transition: spring(290, 24),
    transformOrigin: 'center bottom',
  },
  panelSlideDown: {
    initial: { y: -24, opacity: 0, filter: 'blur(8px)' },
    animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { y: -18, opacity: 0, filter: 'blur(8px)' },
    transition: spring(290, 24),
    transformOrigin: 'center top',
  },
  panelPop: {
    initial: { opacity: 0, scale: 0.94, filter: 'blur(8px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
    transition: spring(310, 22),
    transformOrigin: 'center center',
  },
  panelDrawerPull: {
    initial: { x: 40, opacity: 0, rotateY: -6, filter: 'blur(10px)' },
    animate: { x: 0, opacity: 1, rotateY: 0, filter: 'blur(0px)' },
    exit: { x: 26, opacity: 0, rotateY: -4, filter: 'blur(8px)' },
    transition: spring(320, 24),
    transformOrigin: 'right center',
  },
  panelPhotoDrawer: {
    initial: { x: 48, opacity: 0, rotateZ: 0.75, rotateY: -8, filter: 'blur(12px)' },
    animate: { x: 0, opacity: 1, rotateZ: 0, rotateY: 0, filter: 'blur(0px)' },
    exit: { x: 34, opacity: 0, rotateZ: -0.6, rotateY: -6, filter: 'blur(10px)' },
    transition: spring(330, 24),
    transformOrigin: 'right center',
  },
  panelPlaylistPull: {
    initial: { x: -38, opacity: 0, rotateY: 6, filter: 'blur(10px)' },
    animate: { x: 0, opacity: 1, rotateY: 0, filter: 'blur(0px)' },
    exit: { x: -26, opacity: 0, rotateY: 4, filter: 'blur(8px)' },
    transition: spring(320, 24),
    transformOrigin: 'left center',
  },
  lobbyWallReveal: {
    initial: { opacity: 0, scale: 0.965, y: 14, filter: 'blur(12px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.975, y: 10, filter: 'blur(10px)' },
    transition: spring(300, 23),
    transformOrigin: 'center bottom',
  },
  heroSwap: {
    initial: { opacity: 0.84, filter: 'brightness(0.8) blur(4px)' },
    animate: { opacity: 1, filter: 'brightness(1) blur(0px)' },
    exit: { opacity: 0.82, filter: 'brightness(0.75) blur(4px)' },
    transition: { type: 'tween', duration: 0.28, ease: 'easeOut' },
  },
  notificationDrop: {
    initial: { y: -18, opacity: 0, scale: 0.98 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -12, opacity: 0, scale: 0.985 },
    transition: spring(340, 23),
    transformOrigin: 'center top',
  },
  successBurst: {
    initial: { scale: 0.94, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.98, opacity: 0 },
    transition: spring(360, 20),
  },
  errorShake: {
    initial: { x: -4, opacity: 0.92 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 2, opacity: 0.92 },
    transition: { type: 'tween', duration: 0.16, ease: 'easeInOut' },
  },
  magneticHover: {
    initial: { y: 0, scale: 1 },
    animate: { y: -1.5, scale: 1.02 },
    exit: { y: 0, scale: 1 },
    transition: spring(360, 18),
  },
  softPress: {
    initial: { scale: 1 },
    animate: { scale: 0.98 },
    exit: { scale: 1 },
    transition: { type: 'tween', duration: 0.12, ease: 'easeOut' },
  },
  roomJoinTransition: {
    initial: { opacity: 0, scale: 0.985, filter: 'blur(8px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(6px)' },
    transition: { type: 'tween', duration: 0.34, ease: 'easeOut' },
  },
  roomLeaveTransition: {
    initial: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    animate: { opacity: 0.94, scale: 0.992, filter: 'blur(2px)' },
    exit: { opacity: 0, scale: 0.985, filter: 'blur(8px)' },
    transition: { type: 'tween', duration: 0.3, ease: 'easeInOut' },
  },
};

export function presetToVariants(preset: MotionPreset): Variants {
  return {
    initial: preset.initial,
    animate: preset.animate,
    exit: preset.exit,
  };
}

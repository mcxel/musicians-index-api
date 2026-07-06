"use client";

import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TmiMotionSystem, presetToVariants } from '@/lib/motion/TmiMotionSystem';

export type TmiMotionPanelType =
  | 'memoryWall'
  | 'playlist'
  | 'inventory'
  | 'lobbyWall'
  | 'settings'
  | 'messages'
  | 'store'
  | 'camera'
  | 'rewards';

export type TmiMotionPanelProps = {
  motionType: TmiMotionPanelType;
  side?: 'left' | 'right' | 'bottom' | 'center';
  children: ReactNode;
  className?: string;
  isVisible?: boolean;
};

function getPreset(type: TmiMotionPanelType) {
  switch (type) {
    case 'memoryWall':
      return TmiMotionSystem.panelPhotoDrawer;
    case 'playlist':
      return TmiMotionSystem.panelPlaylistPull;
    case 'inventory':
      return TmiMotionSystem.panelPop;
    case 'lobbyWall':
      return TmiMotionSystem.lobbyWallReveal;
    case 'settings':
      return TmiMotionSystem.panelSlideDown;
    case 'messages':
      return TmiMotionSystem.panelDrawerPull;
    case 'store':
      return TmiMotionSystem.panelSlideUp;
    case 'camera':
      return TmiMotionSystem.panelSlideLeft;
    case 'rewards':
      return TmiMotionSystem.panelPop;
    default:
      return TmiMotionSystem.panelPop;
  }
}

function sideToOrigin(side: 'left' | 'right' | 'bottom' | 'center') {
  if (side === 'left') return 'left center';
  if (side === 'right') return 'right center';
  if (side === 'bottom') return 'center bottom';
  return 'center center';
}

export function TmiMotionPanel({
  motionType,
  side = 'center',
  children,
  className,
  isVisible = true,
}: TmiMotionPanelProps) {
  const reduceMotion = useReducedMotion();
  const preset = getPreset(motionType);
  const variants = presetToVariants(preset);
  const transition = reduceMotion ? { duration: 0.01 } : preset.transition;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isVisible ? (
        <motion.div
          key={motionType}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={transition}
          style={{
            transformOrigin: preset.transformOrigin ?? sideToOrigin(side),
            borderRadius: 16,
            border: '1px solid rgba(170, 45, 255, 0.5)',
            background:
              'linear-gradient(140deg, rgba(10, 10, 24, 0.92), rgba(8, 9, 24, 0.85))',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 42px rgba(0,0,0,0.52), 0 0 28px rgba(170,45,255,0.16)',
            backdropFilter: 'blur(18px)',
            overflow: 'hidden',
          }}
          className={className}
          data-motion-type={motionType}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default TmiMotionPanel;

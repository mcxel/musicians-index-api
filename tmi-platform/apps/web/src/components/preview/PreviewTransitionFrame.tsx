'use client';
// PreviewTransitionFrame.tsx — Animated wrapper that handles open/close transitions
// Per ANIMATION_AND_MOTION_SYSTEM: slide-in 300ms ease-out, slide-out 250ms ease-in
// Copilot wires: useSharedPreview().isOpen state
// Proof: transition animates correctly per ANIMATION_AND_MOTION_SYSTEM specs
import { ReactNode } from 'react';
export function PreviewTransitionFrame({ isOpen, children }: { isOpen: boolean; children: ReactNode }) {
  return (
    <div
      className={`tmi-preview-transition ${isOpen ? 'tmi-preview-transition--open' : 'tmi-preview-transition--closed'}`}
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  );
}

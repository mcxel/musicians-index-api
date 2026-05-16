'use client';
// PreviewDockSlot.tsx — The docking region where preview window attaches
// Follows ADAPTIVE_PREVIEW_LAYOUT_ENGINE: never over performer face/stage center
// Copilot wires: usePreviewDock(roomType, layoutMode) — returns dock position
// Proof: preview dock slot is always visible and not over performer face
import { ReactNode } from 'react';
export function PreviewDockSlot({ position = 'right', children }: { position?: 'left'|'right'|'bottom'; children?: ReactNode }) {
  return (
    <div className={`tmi-preview-dock tmi-preview-dock--${position}`} data-slot="preview-dock">
      {children}
    </div>
  );
}

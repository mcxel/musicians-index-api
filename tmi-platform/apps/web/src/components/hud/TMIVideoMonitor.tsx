"use client";

/**
 * Legacy floating ADMIN CAM / GO LIVE box — intentionally inert.
 *
 * Pass 8 / Two-Deck: never permanently occupy layout. Admin Cam opens on-demand
 * via CanonOverseerShell OverlayHost (camera / center gem) -> LiveCameraPreview.
 * Performer GO LIVE uses Launch Dock / executeInstantGoLive (nav + MasterControlDock).
 * Call sites may still import this component; they must get no floating UI.
 */
export interface TMIVideoMonitorProps {
  label?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | string;
}

export default function TMIVideoMonitor(_props?: TMIVideoMonitorProps) {
  return null;
}

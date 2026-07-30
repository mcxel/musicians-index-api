"use client";

/**
 * LEGACY DEAD — permanent green ADMIN CAM / GO LIVE floater.
 *
 * Do not mount. Admin Cam = OverseerFlightDeck OverlayHost only (center gem / 📷).
 * Performer GO LIVE = Launch Dock / nav — never this component.
 * Kept as a null stub so any leftover import cannot resurrect the floater.
 */
export interface TMIVideoMonitorProps {
  label?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | string;
}

export default function TMIVideoMonitor(_props?: TMIVideoMonitorProps) {
  return null;
}

"use client";

/**
 * MobileMonitorYield — wraps a monitor slot.
 *
 * When the mobile quick panel is open and this monitor is the yielded one,
 * the wrapper collapses via CSS only. The inner DOM (video element, Daily.co
 * headless call, UniversalVenueRenderer) stays fully mounted — no WebRTC
 * restart, no audio restart, no room-state loss.
 *
 * Implementation detail: we use `max-height + overflow: hidden` rather than
 * `display: none` because display:none would suspend media pipelines.
 */

import React from "react";
import type { MonitorSide } from "@/lib/hud/mobileQuickPanelRuntime";
import { useMobileQuickPanelRuntime } from "@/lib/hud/mobileQuickPanelRuntime";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";

interface MobileMonitorYieldProps {
  monitorId: MonitorSide;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function MobileMonitorYield({
  monitorId,
  children,
  className,
  style,
}: MobileMonitorYieldProps) {
  const isMobile = useMobileQuickPanelRuntime((s) => s.isMobile);
  const activeMonitor = useMobileQuickPanelRuntime((s) => s.activeMonitor);
  const activePanel = useCompactQuickPanelStore((s) => s.activePanel);

  // Also yield when a local panel (magazine / artist-id) is open
  const panelOpen = activePanel !== null;

  const shouldYield = isMobile && panelOpen && monitorId !== activeMonitor;

  return (
    <div
      className={className}
      aria-hidden={shouldYield || undefined}
      style={{
        ...style,
        // CSS collapse — content clipped but DOM and media pipelines stay alive
        maxHeight: shouldYield ? 0 : "60vh",
        overflow: "hidden",
        opacity: shouldYield ? 0 : 1,
        pointerEvents: shouldYield ? "none" : style?.pointerEvents,
        transition: [
          "max-height 220ms cubic-bezier(0.4,0,0.2,1)",
          "opacity 180ms ease",
        ].join(", "),
        willChange: "max-height, opacity",
      }}
    >
      {children}
    </div>
  );
}

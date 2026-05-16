"use client";

/**
 * ADMIN MOTION HUD
 * Renders live status bar with animated event ticker, heartbeat, and alert flash.
 * Mounted inside admin layout — all data-testid selectors preserved.
 */

import { useEffect, useRef, useState } from "react";
import { TIMING } from "@/lib/motion/timingRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

interface HUDEvent {
  id: string;
  message: string;
  level: "info" | "warning" | "critical" | "resolved";
  timestamp: number;
}

interface AdminMotionHUDProps {
  events?: HUDEvent[];
}

const DEMO_EVENTS: HUDEvent[] = [
  { id: "e1", message: "Route /admin loaded — all sections healthy", level: "info", timestamp: Date.now() },
  { id: "e2", message: "Sponsor pipeline: prime-wave → lobby → billboard → game  ✓", level: "resolved", timestamp: Date.now() - 2000 },
  { id: "e3", message: "Live presence: 847 active sessions", level: "info", timestamp: Date.now() - 4000 },
];

const LEVEL_COLORS: Record<HUDEvent["level"], string> = {
  info: "#a5f3fc",
  warning: "#fde68a",
  critical: "#fca5a5",
  resolved: "#86efac",
};

export default function AdminMotionHUD({ events = DEMO_EVENTS }: AdminMotionHUDProps) {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (events.length < 2 || reduced) return;
    const id = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % events.length);
        setVisible(true);
      }, TIMING.fast);
    }, 4000);
    return () => clearInterval(id);
  }, [events.length, reduced]);

  const current = events[index];

  // Flash on critical
  useEffect(() => {
    if (current?.level !== "critical" || reduced) return;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), TIMING.criticalFlash * 5);
    return () => window.clearTimeout(t);
  }, [current?.id, reduced]);

  return (
    <div
      data-testid="admin-motion-hud"
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9000,
        pointerEvents: "none",
        maxWidth: 640,
        width: "90%",
      }}
    >
      <div
        style={{
          background: flash ? "rgba(220,38,38,0.85)" : "rgba(2,6,23,0.88)",
          border: `1px solid ${LEVEL_COLORS[current?.level ?? "info"]}44`,
          borderRadius: 8,
          padding: "6px 14px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          transition: `background ${TIMING.fast}ms ease, opacity ${TIMING.fast}ms ease`,
          opacity: visible ? 1 : 0,
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: LEVEL_COLORS[current?.level ?? "info"],
            flexShrink: 0,
            animation: reduced ? undefined : `tmi-live-pulse ${TIMING.warningPulse}ms ease-in-out infinite`,
          }}
        />
        <span style={{ fontSize: 11, color: LEVEL_COLORS[current?.level ?? "info"], letterSpacing: "0.04em", flex: 1 }}>
          {current?.message ?? "System nominal"}
        </span>
        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.6)", flexShrink: 0 }}>
          {new Date(current?.timestamp ?? Date.now()).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

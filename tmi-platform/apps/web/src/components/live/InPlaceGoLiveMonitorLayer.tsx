"use client";

import type { ReactNode } from "react";
import { monitorSlotKey, type MonitorTarget } from "@/lib/personal-media";
import GoLiveMediaTransition from "@/components/live/GoLiveMediaTransition";

/**
 * In-monitor host for Go Live bodies.
 * Canonical starburst mounts HERE (media region only) via GoLiveMediaTransition.
 */
export default function InPlaceGoLiveMonitorLayer({
  target,
  children,
  showTransition = true,
}: {
  target: MonitorTarget;
  children: ReactNode;
  /** Monitor B (venue) shows the canonical starburst during media transition. */
  showTransition?: boolean;
}) {
  return (
    <div
      data-in-place-go-live-monitor={target.monitorId}
      data-monitor-slot={monitorSlotKey(target)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
      {showTransition ? <GoLiveMediaTransition accentColor="#00FFFF" /> : null}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { monitorSlotKey, type MonitorTarget } from "@/lib/personal-media";

/**
 * In-monitor host for Go Live bodies.
 * Broadcaster path: NO starfield / Welcome / Wave takeover — camera + venue
 * mount via CommandCenterMediaStack (HubMonitorCameraPlayer / HubMonitorVenuePlayer).
 */
export default function InPlaceGoLiveMonitorLayer({
  target,
  children,
}: {
  target: MonitorTarget;
  children: ReactNode;
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
    </div>
  );
}

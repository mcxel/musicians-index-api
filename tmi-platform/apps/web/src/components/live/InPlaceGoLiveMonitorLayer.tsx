"use client";

import type { ReactNode } from "react";
import StarfieldWarpEntry from "@/components/live/StarfieldWarpEntry";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { monitorSlotKey, type MonitorTarget } from "@/lib/personal-media";

/**
 * In-monitor overlay: starfield warp ONLY inside the assigned player node.
 * Live camera / venue bodies mount via CommandCenterMediaStack — not here.
 */
export default function InPlaceGoLiveMonitorLayer({
  target,
  children,
}: {
  target: MonitorTarget;
  children: ReactNode;
}) {
  const assigned = useGoLiveTransition((s) => s.assignedMonitor);
  const inPlace = useGoLiveTransition((s) => s.inPlace);
  const isActive = useGoLiveTransition((s) => s.isActive);
  const isAssigned = monitorSlotKey(assigned) === monitorSlotKey(target);
  const showWarp = isAssigned && isActive && Boolean(inPlace?.roomId);

  return (
    <div
      data-in-place-go-live-monitor={target.monitorId}
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
      {showWarp ? <StarfieldWarpEntry /> : null}
    </div>
  );
}

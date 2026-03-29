"use client";

import React from "react";
import { useRoomWatchdog } from "@/components/watchdog/RoomWatchdogProvider";

function healthToneClass(healthState: string) {
  if (healthState === "healthy") return "border-emerald-400/40 text-emerald-300";
  if (healthState === "warning") return "border-amber-400/40 text-amber-300";
  if (healthState === "degraded") return "border-orange-400/40 text-orange-300";
  return "border-rose-400/40 text-rose-300";
}

export default function RoomWatchdogBadge() {
  const { healthState, signals } = useRoomWatchdog();

  const summary = [
    signals.queueValid ? "Q✓" : "Q✕",
    signals.turnValid ? "T✓" : "T✕",
    signals.previewOpenTooLong ? "P⚠" : "P✓",
  ].join(" · ");

  return (
    <div className={`pointer-events-none fixed top-4 right-4 z-[75] rounded border bg-black/70 px-2 py-1 text-[11px] backdrop-blur ${healthToneClass(healthState)}`}>
      WD: {healthState.toUpperCase()} ({summary})
    </div>
  );
}

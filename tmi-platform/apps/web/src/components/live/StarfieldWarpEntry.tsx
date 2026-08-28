"use client";

/**
 * LEGACY — StarfieldWarpEntry (VERSION A).
 * Retired from production GO LIVE path. Reports LEGACY-STARBURST-001 if mounted.
 * Cannibalized into GoLiveMediaTransition (in-monitor canonical).
 */

import { useEffect } from "react";
import { useMediaTransitionDirector } from "@/lib/live/MediaTransitionDirector";

/** @deprecated Use GoLiveMediaTransition inside InPlaceGoLiveMonitorLayer. */
export default function StarfieldWarpEntry() {
  const reportLegacy = useMediaTransitionDirector((s) => s.reportLegacyGlobalMount);

  useEffect(() => {
    reportLegacy("StarfieldWarpEntry");
  }, [reportLegacy]);

  if (process.env.NODE_ENV === "development") {
    return (
      <div
        data-legacy-starburst="StarfieldWarpEntry"
        aria-hidden
        style={{ display: "none" }}
      />
    );
  }
  return null;
}

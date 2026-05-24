"use client";

// Mount once in any live room layout to activate all passive overlays.
// Provides: ClosureOverlay, MomentFeedOverlay, XPFlashOverlay
// Also warms up AmbientAudioEngine so memory card dwell audio is ready.
// Does NOT include ShowmanshipCommandCenter (performer-only) or SeatUpgradeUI (fan-only).

import { useEffect } from "react";
import ClosureOverlay from "@/components/showmanship/ClosureOverlay";
import MomentFeedOverlay from "@/components/showmanship/MomentFeedOverlay";
import XPFlashOverlay from "@/components/showmanship/XPFlashOverlay";
import { getAmbientAudioEngine } from "@/lib/audio/AmbientAudioEngine";

export default function ShowmanshipProvider() {
  useEffect(() => {
    // Warm up the singleton — AudioContext resumes on first user gesture internally
    getAmbientAudioEngine();
  }, []);

  return (
    <>
      <ClosureOverlay />
      <MomentFeedOverlay />
      <XPFlashOverlay />
    </>
  );
}

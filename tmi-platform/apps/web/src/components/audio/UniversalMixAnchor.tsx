"use client";

import CompactAudioMixer from "@/components/audio/CompactAudioMixer";
import { useMixPresence } from "@/components/audio/useAudibleExperiencePresence";

/**
 * One MIX launcher for audible experiences that are outside the command bed
 * and outside a role shell that already owns the slot.
 */
export default function UniversalMixAnchor() {
  const presence = useMixPresence();
  if (!presence.audible || presence.mixSlot) return null;
  return (
    <div
      data-universal-mix-anchor="1"
      style={{
        position: "fixed",
        right: 12,
        bottom: 16,
        zIndex: 70,
        maxWidth: "calc(100vw - 24px)",
      }}
    >
      <CompactAudioMixer showMonitorMasters={presence.monitors} />
    </div>
  );
}

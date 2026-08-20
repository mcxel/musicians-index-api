"use client";

/**
 * WorldDancePartyExperience — canonical world-dance-party module (Branch B).
 * Configures EosArenaEventShell for full-body dance floor mode.
 * Official Friday pool overlay wired via WorldDancePartyNowPlayingOverlay.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import WorldDancePartyNowPlayingOverlay from "@/components/dance/WorldDancePartyNowPlayingOverlay";

export interface WorldDancePartyExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function WorldDancePartyExperience({
  roomId = "world-dance-party",
  venueId,
}: WorldDancePartyExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;

  if (manifest.experience.id !== "world-dance-party") {
    return (
      <div style={{ padding: 16, color: "#00E5FF", fontSize: 12 }}>
        WorldDancePartyExperience requires experience id &quot;world-dance-party&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "min(80vh, 720px)" }}>
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "world-dance-party",
          mode: "audience",
          liveState: "live",
        }}
      />
      <WorldDancePartyNowPlayingOverlay />
    </div>
  );
}

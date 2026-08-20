"use client";

/**
 * WorldDancePartyExperience — canonical world-dance-party module (Branch B).
 * Configures EosArenaEventShell for full-body dance floor mode.
 * Official Friday pool overlay wired via WorldDancePartyNowPlayingOverlay.
 * Default outdoor festival amphitheater (selectable indoor neon-club).
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import WorldDancePartyNowPlayingOverlay from "@/components/dance/WorldDancePartyNowPlayingOverlay";
import { resolveFlagshipVenueAtmosphere } from "@/lib/events/FlagshipVenueAtmosphere";

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
  const atmosphere = resolveFlagshipVenueAtmosphere({ experience: "world-dance-party" });

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
          venueEnvironment: atmosphere.environment,
          venueSkinId: atmosphere.skinId,
        }}
      />
      <WorldDancePartyNowPlayingOverlay />
    </div>
  );
}

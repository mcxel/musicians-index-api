"use client";

/**
 * SlowJamsExperience — Sunday Slow Jams Stream & Win lounge (Rule 21/25).
 * Soft energy personality + Under the Stars outdoor default.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import SlowJamsNowPlayingOverlay from "@/components/radio/SlowJamsNowPlayingOverlay";
import { resolveFlagshipVenueAtmosphere } from "@/lib/events/FlagshipVenueAtmosphere";

export interface SlowJamsExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function SlowJamsExperience({
  roomId = "slow-jams",
  venueId,
}: SlowJamsExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;
  const atmosphere = resolveFlagshipVenueAtmosphere({ experience: "slow-jams" });

  if (manifest.experience.id !== "slow-jams" && manifest.experience.id !== "sunday-slow-jams") {
    return (
      <div style={{ padding: 16, color: "#AA2DFF", fontSize: 12 }}>
        SlowJamsExperience requires experience id &quot;slow-jams&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "min(80vh, 720px)" }}>
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "slow-jams",
          mode: "audience",
          liveState: "live",
          venueEnvironment: atmosphere.environment,
          venueSkinId: atmosphere.skinId,
        }}
      />
      <SlowJamsNowPlayingOverlay />
    </div>
  );
}

"use client";

/**
 * ChallengeExperience — canonical challenge module (Phase 4 Pass 4.4).
 * Configures EosArenaEventShell; no duplicate challenge logic here.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface ChallengeExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function ChallengeExperience({
  roomId = "challenge-arena",
  venueId,
}: ChallengeExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;

  if (manifest.experience.id !== "challenge") {
    return (
      <div style={{ padding: 16, color: "#00E5FF", fontSize: 12 }}>
        ChallengeExperience requires experience id &quot;challenge&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <EosArenaEventShell
      config={{
        roomId: resolvedRoom,
        eventType: "challenge",
        mode: "audience",
        liveState: "live",
      }}
    />
  );
}

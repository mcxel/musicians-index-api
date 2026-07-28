"use client";

/**
 * BattleExperience — canonical competition module (Phase 4 Pass 4.2).
 * Configures EosArenaEventShell; no duplicate battle logic here.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface BattleExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function BattleExperience({
  roomId = "thunder-dome",
  venueId,
}: BattleExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;

  if (manifest.experience.id !== "battle") {
    return (
      <div style={{ padding: 16, color: "#FF2DAA", fontSize: 12 }}>
        BattleExperience requires experience id &quot;battle&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <EosArenaEventShell
      config={{
        roomId: resolvedRoom,
        eventType: "battle",
        mode: "audience",
        liveState: "live",
      }}
    />
  );
}

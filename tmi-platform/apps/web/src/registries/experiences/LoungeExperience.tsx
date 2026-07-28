"use client";

/**
 * LoungeExperience — canonical VIP video lounge module (Branch A).
 * Configures EosArenaEventShell for presence-based lounge mode.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface LoungeExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function LoungeExperience({
  roomId = "vip-lounge",
  venueId,
}: LoungeExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;

  if (manifest.experience.id !== "lounge") {
    return (
      <div style={{ padding: 16, color: "#AA2DFF", fontSize: 12 }}>
        LoungeExperience requires experience id &quot;lounge&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <EosArenaEventShell
      config={{
        roomId: resolvedRoom,
        eventType: "lounge",
        mode: "audience",
        liveState: "live",
      }}
    />
  );
}

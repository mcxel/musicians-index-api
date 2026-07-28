"use client";

/**
 * DealOrFeudExperience — canonical deal-or-feud module (Phase 4 Pass 4.6).
 * Configures EosArenaEventShell; no duplicate game-show logic here.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface DealOrFeudExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function DealOrFeudExperience({
  roomId = "deal-vs-feud",
  venueId,
}: DealOrFeudExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;

  if (manifest.experience.id !== "deal-or-feud") {
    return (
      <div style={{ padding: 16, color: "#FF2DAA", fontSize: 12 }}>
        DealOrFeudExperience requires experience id &quot;deal-or-feud&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <EosArenaEventShell
      config={{
        roomId: resolvedRoom,
        eventType: "deal-or-feud",
        mode: "audience",
        liveState: "live",
      }}
    />
  );
}

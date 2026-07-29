"use client";

/**
 * Vocal Improv experiences — Jazz Scat + Gibberish (Phase 4.7).
 * Same ArenaEventShell pattern as BattleExperience; widgets from StageLoader manifest.
 * No pitch ML runtime — scoring profiles are data-only via featureFlags.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface VocalImprovExperienceProps {
  roomId?: string;
  venueId?: string;
}

function VocalImprovShell({
  expectedId,
  defaultRoomId,
  roomId,
  venueId,
}: VocalImprovExperienceProps & { expectedId: string; defaultRoomId: string }) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId
    ? `${roomId ?? defaultRoomId}-${venueId}`
    : roomId ?? defaultRoomId;

  if (manifest.experience.id !== expectedId) {
    return (
      <div style={{ padding: 16, color: "#FF2DAA", fontSize: 12 }}>
        Experience requires id &quot;{expectedId}&quot;, got {manifest.experience.id}
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

/** Jazz Scat Battle — vocal improv mode JAZZ_SCAT */
export default function JazzScatBattleExperience(props: VocalImprovExperienceProps) {
  return (
    <VocalImprovShell
      {...props}
      expectedId="jazz-scat-battle"
      defaultRoomId="jazz-scat"
    />
  );
}

/** Gibberish Battle — vocal improv mode GIBBERISH */
export function GibberishBattleExperience(props: VocalImprovExperienceProps) {
  return (
    <VocalImprovShell
      {...props}
      expectedId="gibberish-battle"
      defaultRoomId="gibberish"
    />
  );
}

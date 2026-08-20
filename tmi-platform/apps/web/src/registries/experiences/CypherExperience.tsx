"use client";

/**
 * CypherExperience — canonical cypher module (Phase 4 Pass 4.3).
 * Configures EosArenaEventShell; runtime via CypherRuntimeProvider.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { CypherRuntimeProvider } from "@/components/eos/CypherRuntimeContext";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface CypherExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function CypherExperience({
  roomId = "cypher-circle",
  venueId,
}: CypherExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;
  const flags = manifest.experience.featureFlags ?? [];
  const cypherKing = flags.some((f) => {
    const x = f.toLowerCase();
    return x.includes("cypher_king") || x.includes("cypher-king") || x === "cypherking";
  });

  if (manifest.experience.id !== "cypher") {
    return (
      <div style={{ padding: 16, color: "#AA2DFF", fontSize: 12 }}>
        CypherExperience requires experience id &quot;cypher&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <CypherRuntimeProvider roomId={resolvedRoom} sessionGenre="Hip-Hop" cypherKing={cypherKing}>
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "cypher",
          mode: "audience",
          liveState: "live",
        }}
      />
    </CypherRuntimeProvider>
  );
}

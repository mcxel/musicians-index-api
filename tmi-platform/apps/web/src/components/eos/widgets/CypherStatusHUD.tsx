"use client";

import CompetitionHUD from "@/components/competition/presentation/CompetitionHUD";
import { useCypherRuntime } from "@/components/eos/CypherRuntimeContext";

export default function CypherStatusHUD({ roomId }: { roomId: string }) {
  const runtime = useCypherRuntime();
  const roundLabel = runtime?.activePerformer
    ? `${runtime.activePerformer.displayName} · ${runtime.elapsedSeconds}s`
    : runtime?.queue.length
      ? `${runtime.queue.filter((e) => e.status === "waiting").length} waiting`
      : null;

  return (
    <CompetitionHUD format="CYPHER" roomId={roomId} roundLabel={roundLabel} />
  );
}

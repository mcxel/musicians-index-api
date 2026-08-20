"use client";

import CompetitionTimer from "@/components/competition/presentation/CompetitionTimer";
import { useCypherRuntime } from "@/components/eos/CypherRuntimeContext";

export default function CypherRoundTimer() {
  const runtime = useCypherRuntime();

  if (!runtime?.isRoundRunning) return null;

  const remainingSeconds = Math.max(0, runtime.roundDurationSeconds - runtime.elapsedSeconds);
  return (
    <CompetitionTimer format="CYPHER" remainingSeconds={remainingSeconds} />
  );
}

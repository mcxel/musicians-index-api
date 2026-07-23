"use client";

import { useActiveCompetitionTheme } from "@/lib/competition/ThemeRegistry";
import type { CompetitionFormat, CompetitionPhase } from "./competitionPresentation.types";

interface CompetitionRoundBannerProps {
  format: CompetitionFormat;
  phase: CompetitionPhase;
  roundLabel?: string | null;
}

const PHASE_COPY: Record<CompetitionPhase, string> = {
  PREPARING: "PREPARING",
  WAITING: "WAITING FOR COMPETITORS",
  LIVE: "LIVE",
  RESULTS: "RESULTS",
};

// Extracted from CompetitionAudienceViewport's round/format masthead text
// treatment. Falls back to an honest phase label rather than a fabricated
// round number when the runtime hasn't supplied one yet.
export default function CompetitionRoundBanner({ format, phase, roundLabel }: CompetitionRoundBannerProps) {
  const theme = useActiveCompetitionTheme(format);

  return (
    <div
      style={{
        fontFamily: theme.typography.heading,
        color: theme.colors.text,
      }}
      className="text-xl md:text-2xl font-black italic tracking-wide text-center"
    >
      {roundLabel ?? PHASE_COPY[phase]}
    </div>
  );
}

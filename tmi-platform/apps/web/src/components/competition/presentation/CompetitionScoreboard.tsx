"use client";

import { useActiveCompetitionTheme } from "@/lib/competition/ThemeRegistry";
import type { CompetitionFormat, CompetitionParticipantView } from "./competitionPresentation.types";

interface CompetitionScoreboardProps {
  format: CompetitionFormat;
  leftParticipant?: CompetitionParticipantView | null;
  rightParticipant?: CompetitionParticipantView | null;
}

// Extracted from CompetitionAudienceViewport's "PTS" score badge treatment.
// Renders "Score pending" per side rather than a fabricated 0 when a
// participant or their score isn't known yet.
export default function CompetitionScoreboard({
  format,
  leftParticipant,
  rightParticipant,
}: CompetitionScoreboardProps) {
  const theme = useActiveCompetitionTheme(format);

  const badge = (participant: CompetitionParticipantView | null | undefined, color: string) => (
    <span
      style={{ background: `${color}15`, borderColor: `${color}33`, color }}
      className="px-2.5 py-0.5 border font-mono text-[11px] font-bold rounded"
    >
      {participant?.score != null ? `${participant.score} PTS` : "Score pending"}
    </span>
  );

  return (
    <div className="flex items-center gap-4">
      {badge(leftParticipant, theme.colors.leftFrame)}
      <span className="text-white/30 text-xs font-bold">VS</span>
      {badge(rightParticipant, theme.colors.rightFrame)}
    </div>
  );
}

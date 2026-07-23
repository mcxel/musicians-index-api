"use client";

import { useActiveCompetitionTheme } from "@/lib/competition/ThemeRegistry";
import type {
  CompetitionFormat,
  CompetitionParticipantView,
  CompetitionPhase,
} from "./competitionPresentation.types";

interface CompetitionResultsOverlayProps {
  format: CompetitionFormat;
  phase: CompetitionPhase;
  leftParticipant?: CompetitionParticipantView | null;
  rightParticipant?: CompetitionParticipantView | null;
  winnerParticipantId?: string | null;
}

// No winner/results treatment existed anywhere in CompetitionAudienceViewport
// to extract - this is new, minimal, and deliberately renders nothing unless
// phase is RESULTS and a real winner id was supplied (no "TBD" placeholder).
export default function CompetitionResultsOverlay({
  format,
  phase,
  leftParticipant,
  rightParticipant,
  winnerParticipantId,
}: CompetitionResultsOverlayProps) {
  const theme = useActiveCompetitionTheme(format);

  if (phase !== "RESULTS" || !winnerParticipantId) return null;

  const winner =
    leftParticipant?.id === winnerParticipantId
      ? leftParticipant
      : rightParticipant?.id === winnerParticipantId
        ? rightParticipant
        : null;

  if (!winner) return null;

  return (
    <div
      style={{ borderColor: theme.colors.leftFrame, boxShadow: `0 0 40px ${theme.colors.glowLeft}` }}
      className="flex flex-col items-center gap-2 px-8 py-6 rounded-3xl bg-black/85 backdrop-blur-xl border-2"
    >
      <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
        Winner
      </span>
      <span
        style={{ fontFamily: theme.typography.heading, color: theme.colors.leftFrame }}
        className="text-2xl font-black italic"
      >
        {winner.displayName}
      </span>
    </div>
  );
}

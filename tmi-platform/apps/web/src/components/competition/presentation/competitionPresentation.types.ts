import type { CompetitionFormat } from "@/lib/competition/ThemeRegistry";

export type { CompetitionFormat };

export type CompetitionPhase = "PREPARING" | "WAITING" | "LIVE" | "RESULTS";

export interface CompetitionParticipantView {
  id: string;
  displayName: string;
  handle?: string | null;
  imageUrl?: string | null;
  score?: number | null;
}

// Every field here is optional/nullable on purpose - these components render
// honest pending/empty states (Rule 20) rather than inventing plausible
// values when the real production runtime hasn't supplied data yet.
export interface CompetitionPresentationState {
  format: CompetitionFormat;
  phase: CompetitionPhase;
  roomId: string;
  roundLabel?: string | null;
  remainingSeconds?: number | null;
  leftParticipant?: CompetitionParticipantView | null;
  rightParticipant?: CompetitionParticipantView | null;
  crowdEnergy?: number | null;
  winnerParticipantId?: string | null;
}

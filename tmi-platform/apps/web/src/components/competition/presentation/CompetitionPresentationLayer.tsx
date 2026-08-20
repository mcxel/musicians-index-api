"use client";

import CompetitionHUD from "./CompetitionHUD";
import CompetitionVSOverlay from "./CompetitionVSOverlay";
import CompetitionRoundBanner from "./CompetitionRoundBanner";
import CompetitionTimer from "./CompetitionTimer";
import CompetitionScoreboard from "./CompetitionScoreboard";
import CompetitionCrowdMeter from "./CompetitionCrowdMeter";
import CompetitionResultsOverlay from "./CompetitionResultsOverlay";
import AudienceReactionBar from "@/components/live/AudienceReactionBar";
import type { CompetitionPresentationState } from "./competitionPresentation.types";
import type { ExperiencePersonality } from "@/lib/live/ExperiencePersonality";
import {
  allowsVsUi,
  allowsWinnerUi,
  resolveExperiencePersonality,
} from "@/lib/live/ExperiencePersonality";

type CompetitionPresentationLayerProps = CompetitionPresentationState & {
  /** Shell personality — gates VS / winner overlays (Cypher ≠ Battle). */
  personality?: ExperiencePersonality | null;
};

// Pure visual composition over the real venue runtime. Owns no room state,
// makes no network/WebRTC calls, and never blocks interaction with the
// underlying video/venue layer it sits on top of - only AudienceReactionBar
// (the real, already-wired reaction system) restores pointer-events.
export default function CompetitionPresentationLayer({
  format,
  phase,
  roomId,
  roundLabel,
  remainingSeconds,
  leftParticipant,
  rightParticipant,
  crowdEnergy,
  winnerParticipantId,
  personality: personalityProp,
}: CompetitionPresentationLayerProps) {
  const personality =
    personalityProp ?? resolveExperiencePersonality({ format, eventType: format.toLowerCase() });
  const showVs = allowsVsUi(personality);
  const showWinner = allowsWinnerUi(personality);
  const showScoreboard = personality.competitionMode !== "NONE" || showWinner;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col justify-between p-4"
      style={{ pointerEvents: "none" }}
    >
      <div className="flex flex-col gap-2">
        <CompetitionHUD format={format} roomId={roomId} roundLabel={roundLabel} />
        {showVs ? (
          <CompetitionVSOverlay
            format={format}
            leftParticipant={leftParticipant}
            rightParticipant={rightParticipant}
          />
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-3">
        {showWinner ? (
          <CompetitionResultsOverlay
            format={format}
            phase={phase}
            leftParticipant={leftParticipant}
            rightParticipant={rightParticipant}
            winnerParticipantId={winnerParticipantId}
          />
        ) : null}
        <CompetitionRoundBanner format={format} phase={phase} roundLabel={roundLabel} />
        <div className="flex items-center gap-4">
          <CompetitionTimer format={format} remainingSeconds={remainingSeconds} />
          {showScoreboard ? (
            <CompetitionScoreboard
              format={format}
              leftParticipant={leftParticipant}
              rightParticipant={rightParticipant}
            />
          ) : null}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <CompetitionCrowdMeter format={format} crowdEnergy={crowdEnergy} />
        <div style={{ pointerEvents: "auto" }}>
          <AudienceReactionBar roomId={roomId} />
        </div>
      </div>
    </div>
  );
}

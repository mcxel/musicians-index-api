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
}: CompetitionPresentationState) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col justify-between p-4"
      style={{ pointerEvents: "none" }}
    >
      <div className="flex flex-col gap-2">
        <CompetitionHUD format={format} roomId={roomId} roundLabel={roundLabel} />
        <CompetitionVSOverlay
          format={format}
          leftParticipant={leftParticipant}
          rightParticipant={rightParticipant}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <CompetitionResultsOverlay
          format={format}
          phase={phase}
          leftParticipant={leftParticipant}
          rightParticipant={rightParticipant}
          winnerParticipantId={winnerParticipantId}
        />
        <CompetitionRoundBanner format={format} phase={phase} roundLabel={roundLabel} />
        <div className="flex items-center gap-4">
          <CompetitionTimer format={format} remainingSeconds={remainingSeconds} />
          <CompetitionScoreboard
            format={format}
            leftParticipant={leftParticipant}
            rightParticipant={rightParticipant}
          />
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

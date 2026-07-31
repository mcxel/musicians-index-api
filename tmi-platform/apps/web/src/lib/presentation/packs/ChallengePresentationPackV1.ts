/**
 * Challenge Presentation Pack v1 — brief → attempt → judge → result.
 * Event-driven like Battle Pack. No fabricated scores.
 */

import type { ShowPackDefinition, ShowPackPhase } from "../ShowPackTypes";
import type { PresentationSemanticEvent } from "../PresentationEvents";

export type ChallengePackPhaseId =
  | "BRIEF"
  | "ATTEMPT"
  | "JUDGE"
  | "RESULT";

export const CHALLENGE_PRESENTATION_PACK_V1: ShowPackDefinition = {
  packId: "challenge-presentation-v1",
  name: "Challenge Presentation Pack v1",
  description:
    "Television grammar for challenges: brief → attempt → judge → result. Event-driven.",
  category: "CHALLENGE",
  grammar: ["BRIEF", "ATTEMPT", "JUDGE", "RESULT"],
  phases: {
    BRIEF: {
      phaseId: "BRIEF",
      label: "Challenge Brief",
      triggerEvent: "CHALLENGE_START",
      previewHoldMs: 1600,
      surfaces: [
        {
          surfaceId: "surface.round-banner",
          type: "ROUND_BANNER",
          anchorId: "TOP",
          layer: "OVERLAYS",
          label: "CHALLENGE",
        },
        {
          surfaceId: "surface.lower-third",
          type: "LOWER_THIRD",
          anchorId: "BOTTOM",
          layer: "OVERLAYS",
          label: "Brief lower third",
        },
      ],
      cameraCue: { mode: "FIXED", caption: "HOST / BRIEF" },
      lightingCue: "AMBER_FOCUS",
    },
    ATTEMPT: {
      phaseId: "ATTEMPT",
      label: "Attempt",
      triggerEvent: "PERFORMANCE_START",
      previewHoldMs: 2000,
      surfaces: [
        {
          surfaceId: "surface.performer-frame",
          type: "PERFORMER_FRAME",
          anchorId: "CENTER",
          layer: "PERFORMER",
          label: "Challenger frame",
        },
        {
          surfaceId: "surface.camera-cue",
          type: "CAMERA_CUE",
          anchorId: "TOP_LEFT",
          layer: "OVERLAYS",
          label: "Attempt cam",
        },
      ],
      cameraCue: { mode: "FOLLOW", caption: "CURRENT PERFORMER 85%" },
      soundCue: "TIMER_TICK",
    },
    JUDGE: {
      phaseId: "JUDGE",
      label: "Judging",
      triggerEvent: "VOTING_OPEN",
      previewHoldMs: 1600,
      surfaces: [
        {
          surfaceId: "surface.voting-panel",
          type: "VOTING_PANEL",
          anchorId: "BOTTOM",
          layer: "OVERLAYS",
          label: "JUDGING",
        },
        {
          surfaceId: "surface.score-panel",
          type: "SCORE_PANEL",
          anchorId: "TOP_RIGHT",
          layer: "OVERLAYS",
          label: "Score panel (awaiting real tallies)",
        },
      ],
      cameraCue: { mode: "ORBIT", caption: "JUDGE / CROWD" },
    },
    RESULT: {
      phaseId: "RESULT",
      label: "Result",
      triggerEvent: "WINNER_DECLARED",
      previewHoldMs: 2000,
      surfaces: [
        {
          surfaceId: "surface.winner-panel",
          type: "WINNER_PANEL",
          anchorId: "CENTER",
          layer: "OVERLAYS",
          label: "RESULT",
        },
      ],
      cameraCue: { mode: "CINEMATIC_FLY_IN", caption: "RESULT FOCUS" },
      fxCue: "RESULT_FLASH",
      crowdCue: "RESULT_REACT",
    },
  } as Record<ChallengePackPhaseId, ShowPackPhase>,
  eventMap: {
    CHALLENGE_START: "BRIEF",
    BATTLE_START: "BRIEF",
    BATTLE_INTRO: "BRIEF",
    PERFORMER_TURN: "ATTEMPT",
    PERFORMANCE_START: "ATTEMPT",
    VOTING_OPEN: "JUDGE",
    VOTING_CLOSE: "JUDGE",
    WINNER_DECLARED: "RESULT",
    ROUND_COMPLETE: "RESULT",
    SHOW_IDLE: "BRIEF",
  },
};

export function resolveChallengePhaseFromEvent(
  event: PresentationSemanticEvent
): ShowPackPhase | null {
  const phaseId = CHALLENGE_PRESENTATION_PACK_V1.eventMap[event];
  if (!phaseId) return null;
  return CHALLENGE_PRESENTATION_PACK_V1.phases[phaseId] ?? null;
}

export function getChallengePackPreviewTimeline(): ShowPackPhase[] {
  return CHALLENGE_PRESENTATION_PACK_V1.grammar.map(
    (id) => CHALLENGE_PRESENTATION_PACK_V1.phases[id]!
  );
}

/**
 * Battle Presentation Pack v1 — intro → vs → performance → voting → winner.
 * Driven by semantic events; pages must not hardcode this grammar.
 *
 * Rule 20: package data is real structure (phases, surfaces, cues). Preview
 * never fabricates battle scores — only shows package timeline facts.
 */

import type { MonitorAnchorZoneId } from "../MonitorAnchorZones";
import type { PresentationLayerId } from "../LayerStack";
import type { PresentationSemanticEvent } from "../PresentationEvents";
import type { ScreenSurfaceType } from "../ScreenSurfaceRegistry";

export type BattlePackPhaseId =
  | "INTRO"
  | "VS"
  | "PERFORMANCE"
  | "VOTING"
  | "WINNER";

export interface BattlePackSurfaceCue {
  surfaceId: string;
  type: ScreenSurfaceType;
  anchorId: MonitorAnchorZoneId;
  layer: PresentationLayerId;
  label: string;
}

export interface BattlePackCameraCue {
  mode: "FIXED" | "FOLLOW" | "ORBIT" | "CINEMATIC_FLY_IN";
  caption: string;
}

export interface BattlePackPhase {
  phaseId: BattlePackPhaseId;
  label: string;
  /** Semantic event that activates this phase */
  triggerEvent: PresentationSemanticEvent;
  /** Suggested hold when auto-previewing the package timeline */
  previewHoldMs: number;
  surfaces: BattlePackSurfaceCue[];
  cameraCue: BattlePackCameraCue;
  /** Maps into PresentationPackageRegistry timeline package when present */
  legacyPackageId?: string;
}

export interface BattlePresentationPackV1 {
  packId: "battle-presentation-v1";
  name: string;
  description: string;
  category: "BATTLE";
  grammar: BattlePackPhaseId[];
  phases: Record<BattlePackPhaseId, BattlePackPhase>;
  /** Event → phase resolution table */
  eventMap: Partial<Record<PresentationSemanticEvent, BattlePackPhaseId>>;
}

export const BATTLE_PRESENTATION_PACK_V1: BattlePresentationPackV1 = {
  packId: "battle-presentation-v1",
  name: "Battle Presentation Pack v1",
  description:
    "Television grammar for battles: intro → vs → performance → voting → winner. Event-driven, not page-hardcoded.",
  category: "BATTLE",
  grammar: ["INTRO", "VS", "PERFORMANCE", "VOTING", "WINNER"],
  phases: {
    INTRO: {
      phaseId: "INTRO",
      label: "Battle Intro",
      triggerEvent: "BATTLE_INTRO",
      previewHoldMs: 1600,
      surfaces: [
        {
          surfaceId: "surface.round-banner",
          type: "ROUND_BANNER",
          anchorId: "TOP",
          layer: "OVERLAYS",
          label: "BATTLE INTRO",
        },
        {
          surfaceId: "surface.battle-frame",
          type: "BATTLE_FRAME",
          anchorId: "SAFE_AREA",
          layer: "UNDERLAY",
          label: "Battle underlay",
        },
        {
          surfaceId: "surface.camera-cue",
          type: "CAMERA_CUE",
          anchorId: "TOP_LEFT",
          layer: "OVERLAYS",
          label: "Wide establish",
        },
      ],
      cameraCue: { mode: "FIXED", caption: "WIDE ESTABLISH" },
    },
    VS: {
      phaseId: "VS",
      label: "VS Reveal",
      triggerEvent: "VS_REVEAL",
      previewHoldMs: 1800,
      surfaces: [
        {
          surfaceId: "surface.vs-badge",
          type: "VS_BADGE",
          anchorId: "CENTER",
          layer: "TRANSITIONS",
          label: "VS",
        },
        {
          surfaceId: "surface.lower-third",
          type: "LOWER_THIRD",
          anchorId: "BOTTOM",
          layer: "OVERLAYS",
          label: "Competitor lower third",
        },
      ],
      cameraCue: { mode: "CINEMATIC_FLY_IN", caption: "SPLIT / VS" },
    },
    PERFORMANCE: {
      phaseId: "PERFORMANCE",
      label: "Performer Turn",
      triggerEvent: "PERFORMER_TURN",
      previewHoldMs: 2000,
      surfaces: [
        {
          surfaceId: "surface.performer-frame",
          type: "PERFORMER_FRAME",
          anchorId: "CENTER",
          layer: "PERFORMER",
          label: "Active performer frame",
        },
        {
          surfaceId: "surface.round-banner",
          type: "ROUND_BANNER",
          anchorId: "TOP",
          layer: "OVERLAYS",
          label: "NOW PERFORMING",
        },
      ],
      cameraCue: { mode: "FOLLOW", caption: "ACTIVE PERFORMER" },
    },
    VOTING: {
      phaseId: "VOTING",
      label: "Voting Open",
      triggerEvent: "VOTING_OPEN",
      previewHoldMs: 1800,
      surfaces: [
        {
          surfaceId: "surface.voting-panel",
          type: "VOTING_PANEL",
          anchorId: "BOTTOM",
          layer: "OVERLAYS",
          label: "VOTING OPEN",
        },
        {
          surfaceId: "surface.score-panel",
          type: "SCORE_PANEL",
          anchorId: "TOP",
          layer: "OVERLAYS",
          label: "Score panel (awaiting real tallies)",
        },
      ],
      cameraCue: { mode: "ORBIT", caption: "AUDIENCE / VOTE" },
    },
    WINNER: {
      phaseId: "WINNER",
      label: "Winner Declared",
      triggerEvent: "WINNER_DECLARED",
      previewHoldMs: 2200,
      legacyPackageId: "battle-winner-gold",
      surfaces: [
        {
          surfaceId: "surface.winner-panel",
          type: "WINNER_PANEL",
          anchorId: "CENTER",
          layer: "OVERLAYS",
          label: "WINNER",
        },
        {
          surfaceId: "surface.sponsor-panel",
          type: "SPONSOR_PANEL",
          anchorId: "BOTTOM_RIGHT",
          layer: "OVERLAYS",
          label: "Sponsor lower-right",
        },
      ],
      cameraCue: { mode: "CINEMATIC_FLY_IN", caption: "WINNER FOCUS" },
    },
  },
  eventMap: {
    BATTLE_START: "INTRO",
    BATTLE_INTRO: "INTRO",
    VS_REVEAL: "VS",
    PERFORMER_TURN: "PERFORMANCE",
    PERFORMANCE_START: "PERFORMANCE",
    VOTING_OPEN: "VOTING",
    VOTING_CLOSE: "VOTING",
    WINNER_DECLARED: "WINNER",
    ROUND_COMPLETE: "WINNER",
    SHOW_IDLE: "INTRO",
  },
};

export function resolveBattlePhaseFromEvent(
  event: PresentationSemanticEvent
): BattlePackPhase | null {
  const phaseId = BATTLE_PRESENTATION_PACK_V1.eventMap[event];
  if (!phaseId) return null;
  return BATTLE_PRESENTATION_PACK_V1.phases[phaseId];
}

/** Ordered preview timeline — package facts only, no fabricated scores. */
export function getBattlePackPreviewTimeline(): BattlePackPhase[] {
  return BATTLE_PRESENTATION_PACK_V1.grammar.map(
    (id) => BATTLE_PRESENTATION_PACK_V1.phases[id]
  );
}

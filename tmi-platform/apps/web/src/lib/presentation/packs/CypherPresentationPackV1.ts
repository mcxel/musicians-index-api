/**
 * Cypher Presentation Pack v1 — circle establish → handoff → verse → pass → close.
 * Event-driven like Battle Pack. No fabricated scores.
 */

import type { ShowPackDefinition, ShowPackPhase } from "../ShowPackTypes";
import type { PresentationSemanticEvent } from "../PresentationEvents";

export type CypherPackPhaseId =
  | "CIRCLE"
  | "HANDOFF"
  | "VERSE"
  | "PASS"
  | "CLOSE";

export const CYPHER_PRESENTATION_PACK_V1: ShowPackDefinition = {
  packId: "cypher-presentation-v1",
  name: "Cypher Presentation Pack v1",
  description:
    "Television grammar for cyphers: circle → handoff → verse → pass → close. Event-driven.",
  category: "CYPHER",
  grammar: ["CIRCLE", "HANDOFF", "VERSE", "PASS", "CLOSE"],
  phases: {
    CIRCLE: {
      phaseId: "CIRCLE",
      label: "Cypher Circle",
      triggerEvent: "CYPHER_START",
      previewHoldMs: 1600,
      surfaces: [
        {
          surfaceId: "surface.cypher-frame",
          type: "BATTLE_FRAME",
          anchorId: "SAFE_AREA",
          layer: "UNDERLAY",
          label: "Circle underlay",
        },
        {
          surfaceId: "surface.round-banner",
          type: "ROUND_BANNER",
          anchorId: "TOP",
          layer: "OVERLAYS",
          label: "CYPHER LIVE",
        },
      ],
      cameraCue: { mode: "ORBIT", caption: "CIRCLE ESTABLISH" },
      lightingCue: "CYAN_RING",
      crowdCue: "CIRCLE_ENERGY",
    },
    HANDOFF: {
      phaseId: "HANDOFF",
      label: "Verse Handoff",
      triggerEvent: "PERFORMER_TURN",
      previewHoldMs: 1400,
      surfaces: [
        {
          surfaceId: "surface.performer-frame",
          type: "PERFORMER_FRAME",
          anchorId: "CENTER",
          layer: "PERFORMER",
          label: "Next up frame",
        },
        {
          surfaceId: "surface.lower-third",
          type: "LOWER_THIRD",
          anchorId: "BOTTOM",
          layer: "OVERLAYS",
          label: "Handoff lower third",
        },
      ],
      cameraCue: { mode: "FOLLOW", caption: "HANDOFF PUSH" },
      lightingCue: "SPOT_SWEEP",
    },
    VERSE: {
      phaseId: "VERSE",
      label: "Active Verse",
      triggerEvent: "PERFORMANCE_START",
      previewHoldMs: 2000,
      surfaces: [
        {
          surfaceId: "surface.performer-frame",
          type: "PERFORMER_FRAME",
          anchorId: "CENTER",
          layer: "PERFORMER",
          label: "Active MC",
        },
        {
          surfaceId: "surface.camera-cue",
          type: "CAMERA_CUE",
          anchorId: "TOP_LEFT",
          layer: "OVERLAYS",
          label: "Active performer",
        },
      ],
      cameraCue: { mode: "FOLLOW", caption: "ACTIVE PERFORMER 75%" },
      soundCue: "BEAT_LOCK",
    },
    PASS: {
      phaseId: "PASS",
      label: "Pass the Mic",
      triggerEvent: "ROUND_COMPLETE",
      previewHoldMs: 1200,
      surfaces: [
        {
          surfaceId: "surface.round-banner",
          type: "ROUND_BANNER",
          anchorId: "TOP",
          layer: "TRANSITIONS",
          label: "PASS",
        },
      ],
      cameraCue: { mode: "ORBIT", caption: "CROWD / CIRCLE" },
      crowdCue: "PASS_CHEER",
    },
    CLOSE: {
      phaseId: "CLOSE",
      label: "Cypher Close",
      triggerEvent: "SHOW_IDLE",
      previewHoldMs: 1400,
      surfaces: [
        {
          surfaceId: "surface.round-banner",
          type: "ROUND_BANNER",
          anchorId: "TOP",
          layer: "OVERLAYS",
          label: "CYPHER COMPLETE",
        },
      ],
      cameraCue: { mode: "FIXED", caption: "WIDE OUT" },
      lightingCue: "DIM_OUT",
    },
  } as Record<CypherPackPhaseId, ShowPackPhase>,
  eventMap: {
    CYPHER_START: "CIRCLE",
    BATTLE_START: "CIRCLE",
    PERFORMER_TURN: "HANDOFF",
    PERFORMANCE_START: "VERSE",
    ROUND_COMPLETE: "PASS",
    SHOW_IDLE: "CLOSE",
    WINNER_DECLARED: "CLOSE",
  },
};

export function resolveCypherPhaseFromEvent(
  event: PresentationSemanticEvent
): ShowPackPhase | null {
  const phaseId = CYPHER_PRESENTATION_PACK_V1.eventMap[event];
  if (!phaseId) return null;
  return CYPHER_PRESENTATION_PACK_V1.phases[phaseId] ?? null;
}

export function getCypherPackPreviewTimeline(): ShowPackPhase[] {
  return CYPHER_PRESENTATION_PACK_V1.grammar.map(
    (id) => CYPHER_PRESENTATION_PACK_V1.phases[id]!
  );
}

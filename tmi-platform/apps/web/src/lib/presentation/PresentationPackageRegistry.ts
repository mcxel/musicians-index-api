/**
 * PresentationPackageRegistry — Declarative Show & Event Presentation Packages.
 * Provides pre-configured, certified production packages for:
 *  - Battle Champions
 *  - Cypher Starters
 *  - Monthly Idol Winners
 *  - Tournament Finals
 *  - World Release Parties
 *  - Record Deal Announcements
 */

import type { SpatialAnchorId, OverlayType } from "./PresentationDirector";
import { BATTLE_PRESENTATION_PACK_V1 } from "./packs/BattlePresentationPackV1";
import { CYPHER_PRESENTATION_PACK_V1 } from "./packs/CypherPresentationPackV1";
import { CHALLENGE_PRESENTATION_PACK_V1 } from "./packs/ChallengePresentationPackV1";
import type { ShowPackDefinition } from "./ShowPackTypes";

export interface TimelineAction {
  offsetMs: number;
  type: "CAMERA" | "LIGHTING" | "OVERLAY" | "PARTICLES" | "AUDIO" | "SPONSOR" | "CROWD";
  anchorId?: SpatialAnchorId;
  overlayType?: OverlayType;
  command?: string;
  data?: Record<string, unknown>;
}

export interface PresentationPackage {
  packageId: string;
  name: string;
  description: string;
  category: "BATTLE" | "CYPHER" | "CHALLENGE" | "CONCERT" | "LOUNGE" | "AWARD" | "MAGAZINE";
  totalDurationMs: number;
  timeline: TimelineAction[];
  /** Optional link to structured Show Package (Battle Pack v1 grammar) */
  showPackId?: string;
}

/** Flatten Battle Pack v1 grammar into a previewable timeline package (structure only). */
function buildBattlePackV1TimelinePackage(): PresentationPackage {
  let offset = 0;
  const timeline: TimelineAction[] = [];
  for (const phaseId of BATTLE_PRESENTATION_PACK_V1.grammar) {
    const phase = BATTLE_PRESENTATION_PACK_V1.phases[phaseId];
    timeline.push({
      offsetMs: offset,
      type: "OVERLAY",
      overlayType:
        phase.phaseId === "WINNER"
          ? "WINNER_CROWN_BANNER"
          : phase.phaseId === "VS"
            ? "BATTLE_VERSUS_BADGE"
            : phase.phaseId === "VOTING"
              ? "SCOREBOARD_HUD"
              : "NEON_PERFORMER_FRAME",
      anchorId: phase.phaseId === "WINNER" ? "winner-focus-center" : "battle-score-top",
      command: phase.triggerEvent,
      data: {
        phaseId: phase.phaseId,
        label: phase.label,
        surfaces: phase.surfaces.map((s) => s.surfaceId),
        cameraCaption: phase.cameraCue.caption,
        scores: null,
      },
    });
    timeline.push({
      offsetMs: offset + 100,
      type: "CAMERA",
      command: phase.cameraCue.mode,
      anchorId: phase.phaseId === "WINNER" ? "winner-focus-center" : "performer-primary",
    });
    offset += phase.previewHoldMs;
  }
  return {
    packageId: "battle-presentation-v1",
    name: BATTLE_PRESENTATION_PACK_V1.name,
    description: BATTLE_PRESENTATION_PACK_V1.description,
    category: "BATTLE",
    totalDurationMs: offset,
    showPackId: BATTLE_PRESENTATION_PACK_V1.packId,
    timeline,
  };
}

function buildShowPackTimelinePackage(pack: ShowPackDefinition): PresentationPackage {
  let offset = 0;
  const timeline: TimelineAction[] = [];
  for (const phaseId of pack.grammar) {
    const phase = pack.phases[phaseId];
    if (!phase) continue;
    timeline.push({
      offsetMs: offset,
      type: "OVERLAY",
      overlayType:
        phase.phaseId === "WINNER" || phase.phaseId === "RESULT"
          ? "WINNER_CROWN_BANNER"
          : phase.phaseId === "VS"
            ? "BATTLE_VERSUS_BADGE"
            : phase.phaseId === "VOTING" || phase.phaseId === "JUDGE"
              ? "SCOREBOARD_HUD"
              : "NEON_PERFORMER_FRAME",
      anchorId:
        phase.phaseId === "WINNER" || phase.phaseId === "RESULT"
          ? "winner-focus-center"
          : "battle-score-top",
      command: phase.triggerEvent,
      data: {
        phaseId: phase.phaseId,
        label: phase.label,
        surfaces: phase.surfaces.map((s) => s.surfaceId),
        cameraCaption: phase.cameraCue.caption,
        scores: null,
      },
    });
    timeline.push({
      offsetMs: offset + 100,
      type: "CAMERA",
      command: phase.cameraCue.mode,
      anchorId:
        phase.phaseId === "WINNER" || phase.phaseId === "RESULT"
          ? "winner-focus-center"
          : "performer-primary",
    });
    offset += phase.previewHoldMs;
  }
  const category: PresentationPackage["category"] =
    pack.category === "CYPHER"
      ? "CYPHER"
      : pack.category === "CHALLENGE"
        ? "CHALLENGE"
        : pack.category === "BATTLE"
          ? "BATTLE"
          : "LOUNGE";
  return {
    packageId: pack.packId,
    name: pack.name,
    description: pack.description,
    category,
    totalDurationMs: offset,
    showPackId: pack.packId,
    timeline,
  };
}

export const PRESENTATION_PACKAGE_REGISTRY: Record<string, PresentationPackage> = {
  "battle-presentation-v1": buildBattlePackV1TimelinePackage(),
  "cypher-presentation-v1": buildShowPackTimelinePackage(CYPHER_PRESENTATION_PACK_V1),
  "challenge-presentation-v1": buildShowPackTimelinePackage(CHALLENGE_PRESENTATION_PACK_V1),

  "battle-winner-gold": {
    packageId: "battle-winner-gold",
    name: "Battle Champion Gold Victory",
    description: "Gold lighting, fireworks, winner banner, and camera orbit sequence.",
    category: "BATTLE",
    totalDurationMs: 6500,
    timeline: [
      { offsetMs: 0, type: "LIGHTING", command: "GOLD_SPOTLIGHT_LOCK" },
      { offsetMs: 200, type: "PARTICLES", command: "SPARKS_AND_CONFETTI_BURST" },
      {
        offsetMs: 400,
        type: "OVERLAY",
        overlayType: "WINNER_CROWN_BANNER",
        anchorId: "winner-focus-center",
      },
      {
        offsetMs: 700,
        type: "CAMERA",
        command: "CINEMATIC_ORBIT",
        anchorId: "winner-focus-center",
      },
      { offsetMs: 1200, type: "AUDIO", command: "VICTORY_FANFARE_STEM" },
      {
        offsetMs: 2500,
        type: "SPONSOR",
        overlayType: "SPONSOR_LOWER_THIRD",
        anchorId: "stage-billboard-left",
      },
    ],
  },

  "cypher-turn-start": {
    packageId: "cypher-turn-start",
    name: "Cypher Verse Handoff Spotlight",
    description: "Camera push, spotlight transition, and performer frame lock-on.",
    category: "CYPHER",
    totalDurationMs: 4000,
    timeline: [
      {
        offsetMs: 0,
        type: "CAMERA",
        command: "PUSH_TO_PERFORMER",
        anchorId: "performer-primary",
      },
      { offsetMs: 200, type: "LIGHTING", command: "CYAN_NEON_SWEEP" },
      {
        offsetMs: 400,
        type: "OVERLAY",
        overlayType: "NEON_PERFORMER_FRAME",
        anchorId: "performer-primary",
      },
      { offsetMs: 800, type: "AUDIO", command: "BEAT_WAVEFORM_TRIGGER" },
    ],
  },

  "monthly-idol-winner": {
    packageId: "monthly-idol-winner",
    name: "Monthly Idol Crown Ceremony",
    description: "Full arena illumination, crown banner, and applause burst.",
    category: "AWARD",
    totalDurationMs: 8000,
    timeline: [
      { offsetMs: 0, type: "LIGHTING", command: "ARENA_FULL_BEAM" },
      { offsetMs: 300, type: "PARTICLES", command: "GOLDEN_RAIN" },
      {
        offsetMs: 600,
        type: "OVERLAY",
        overlayType: "WINNER_CROWN_BANNER",
        anchorId: "winner-focus-center",
      },
      {
        offsetMs: 1000,
        type: "CAMERA",
        command: "FLY_IN_FULL_STAGE",
        anchorId: "winner-focus-center",
      },
      { offsetMs: 1500, type: "CROWD", command: "MAX_CHEER_REACTION" },
    ],
  },
};

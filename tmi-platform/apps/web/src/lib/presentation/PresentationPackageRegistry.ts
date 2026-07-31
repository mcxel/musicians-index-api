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
  category: "BATTLE" | "CYPHER" | "CONCERT" | "LOUNGE" | "AWARD" | "MAGAZINE";
  totalDurationMs: number;
  timeline: TimelineAction[];
}

export const PRESENTATION_PACKAGE_REGISTRY: Record<string, PresentationPackage> = {
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

/**
 * CrowdLibrary.ts — Audience state, animations, and reaction behaviors.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface CrowdBehaviorAsset extends ProductionAssetDefinition {
  behaviorType: "CHEER" | "CLAP" | "STAND" | "SIT" | "DANCE" | "WAVE" | "FLASHLIGHTS" | "CHANT";
  intensity: number;
  durationMs: number;
}

export const CrowdLibrary = new ProductionAssetRegistry<CrowdBehaviorAsset>();

CrowdLibrary.register({
  id: "crowd-standing-ovation",
  version: "1.0.0",
  category: "CELEBRATION",
  compatibleRuntimes: ["battle", "cypher", "concert"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  behaviorType: "STAND",
  intensity: 1.0,
  durationMs: 8000,
});

CrowdLibrary.register({
  id: "crowd-attentive-listen",
  version: "1.0.0",
  category: "COMPETITION",
  compatibleRuntimes: ["battle", "cypher", "playlist-lounge"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  behaviorType: "SIT",
  intensity: 0.4,
  durationMs: 30000,
});

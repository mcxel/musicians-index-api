/**
 * LightingLibrary.ts — Lighting presets for venue, mood, and genre blending.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface LightingPresetAsset extends ProductionAssetDefinition {
  presetName: "ARENA" | "CONCERT" | "COFFEEHOUSE" | "GARAGE" | "ROOFTOP" | "STUDIO" | "PENTHOUSE" | "GOLD_CELEBRATION";
  primaryColor: string;
  secondaryColor: string;
  intensity: number;
  spotlightSpeed: number;
}

export const LightingLibrary = new ProductionAssetRegistry<LightingPresetAsset>();

LightingLibrary.register({
  id: "light-arena-neon-clash",
  version: "1.0.0",
  category: "ARENA",
  compatibleRuntimes: ["battle", "cypher"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  presetName: "ARENA",
  primaryColor: "#00FFFF",
  secondaryColor: "#FF2DAA",
  intensity: 2.2,
  spotlightSpeed: 1.5,
});

LightingLibrary.register({
  id: "light-gold-celebration",
  version: "1.0.0",
  category: "CELEBRATION",
  compatibleRuntimes: ["battle", "cypher", "concert"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  presetName: "GOLD_CELEBRATION",
  primaryColor: "#FFD700",
  secondaryColor: "#FFA500",
  intensity: 3.0,
  spotlightSpeed: 0.8,
});

/**
 * FXLibrary.ts — Particle emitters, sparks, confetti, and environmental FX presets.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface FXPresetAsset extends ProductionAssetDefinition {
  fxType: "CONFETTI" | "SPARKS" | "SMOKE" | "LASERS" | "BEAT_PULSE" | "EMOJI_RAIN";
  maxParticles: number;
  durationMs: number;
  colorPalette: string[];
}

export const FXLibrary = new ProductionAssetRegistry<FXPresetAsset>();

FXLibrary.register({
  id: "fx-winner-confetti-gold",
  version: "1.0.0",
  category: "CELEBRATION",
  compatibleRuntimes: ["battle", "cypher", "concert"],
  qualityTiers: ["medium", "high", "ultra"],
  accessibilityFallback: "fx-reduced-motion-sparkle",
  certificationStatus: "CERTIFIED",
  fxType: "CONFETTI",
  maxParticles: 250,
  durationMs: 6000,
  colorPalette: ["#FFD700", "#FFF8DC", "#DAA520", "#00FFFF"],
});

FXLibrary.register({
  id: "fx-beat-laser-beams",
  version: "1.0.0",
  category: "MUSIC",
  compatibleRuntimes: ["concert", "world-dance-party"],
  qualityTiers: ["high", "ultra"],
  accessibilityFallback: "fx-static-glow",
  certificationStatus: "CERTIFIED",
  fxType: "LASERS",
  maxParticles: 80,
  durationMs: 12000,
  colorPalette: ["#00FFFF", "#FF00FF", "#00FF00"],
});

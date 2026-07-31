/**
 * SoundLibrary.ts — Presentation audio cues, UI stingers, and broadcast sound profiles.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface SoundCueAsset extends ProductionAssetDefinition {
  cueType: "UI_CLICK" | "ROUND_START" | "VICTORY_STINGER" | "CROWD_CHEER" | "COUNTDOWN_BEEP" | "SPONSOR_JINGLE";
  audioUrl?: string;
  defaultVolume: number;
}

export const SoundLibrary = new ProductionAssetRegistry<SoundCueAsset>();

SoundLibrary.register({
  id: "sound-round-start-horn",
  version: "1.0.0",
  category: "COMPETITION",
  compatibleRuntimes: ["battle", "cypher"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  accessibilityFallback: "caption-round-start",
  certificationStatus: "CERTIFIED",
  cueType: "ROUND_START",
  audioUrl: "/sounds/round_start.mp3",
  defaultVolume: 0.85,
});

SoundLibrary.register({
  id: "sound-victory-fanfare",
  version: "1.0.0",
  category: "CELEBRATION",
  compatibleRuntimes: ["battle", "cypher", "concert"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  accessibilityFallback: "caption-winner-fanfare",
  certificationStatus: "CERTIFIED",
  cueType: "VICTORY_STINGER",
  audioUrl: "/sounds/victory_fanfare.mp3",
  defaultVolume: 0.9,
});

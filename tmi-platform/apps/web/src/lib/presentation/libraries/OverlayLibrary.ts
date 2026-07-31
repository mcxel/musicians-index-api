/**
 * OverlayLibrary.ts — Reusable broadcast lower-thirds, score bugs, and HUD cards.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface BroadcastOverlayAsset extends ProductionAssetDefinition {
  overlayType:
    | "NEON_PERFORMER_FRAME"
    | "BATTLE_VERSUS_BADGE"
    | "SCOREBOARD_HUD"
    | "WINNER_CROWN_BANNER"
    | "SPONSOR_LOWER_THIRD"
    | "PLAYLIST_VISUALIZER_OVERLAY";
  targetAnchorId: string;
  defaultOpacity: number;
  defaultScale: number;
}

export const OverlayLibrary = new ProductionAssetRegistry<BroadcastOverlayAsset>();

OverlayLibrary.register({
  id: "overlay-neon-battle-frame",
  version: "1.0.0",
  category: "COMPETITION",
  compatibleRuntimes: ["battle", "cypher"],
  requiredAnchors: ["performer-primary"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  accessibilityFallback: "high-contrast-border",
  certificationStatus: "CERTIFIED",
  overlayType: "NEON_PERFORMER_FRAME",
  targetAnchorId: "performer-primary",
  defaultOpacity: 1.0,
  defaultScale: 1.0,
});

OverlayLibrary.register({
  id: "overlay-winner-crown-banner",
  version: "1.0.0",
  category: "CELEBRATION",
  compatibleRuntimes: ["battle", "cypher", "concert"],
  requiredAnchors: ["winner-focus-center"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  accessibilityFallback: "text-winner-alert",
  certificationStatus: "CERTIFIED",
  overlayType: "WINNER_CROWN_BANNER",
  targetAnchorId: "winner-focus-center",
  defaultOpacity: 1.0,
  defaultScale: 1.25,
});

OverlayLibrary.register({
  id: "overlay-sponsor-lower-third",
  version: "1.0.0",
  category: "COMMERCE",
  compatibleRuntimes: ["*"],
  requiredAnchors: ["stage-billboard-left"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  overlayType: "SPONSOR_LOWER_THIRD",
  targetAnchorId: "stage-billboard-left",
  defaultOpacity: 0.9,
  defaultScale: 1.0,
});

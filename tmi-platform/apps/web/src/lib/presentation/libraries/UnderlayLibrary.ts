/**
 * UnderlayLibrary.ts — Venue floor graphics, beat-reactive rings, and stage projections.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface VenueUnderlayAsset extends ProductionAssetDefinition {
  underlayType: "BEAT_REACTIVE_FLOOR_RING" | "DANCE_FLOOR_GRID" | "SPOTLIGHT_CIRCLE" | "STAGE_BRANDING_PROJECTION";
  targetAnchorId: string;
  colorHex: string;
}

export const UnderlayLibrary = new ProductionAssetRegistry<VenueUnderlayAsset>();

UnderlayLibrary.register({
  id: "underlay-beat-ring-pulse",
  version: "1.0.0",
  category: "STAGE",
  compatibleRuntimes: ["battle", "cypher", "concert", "world-dance-party"],
  requiredAnchors: ["floor-projection-center"],
  qualityTiers: ["medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  underlayType: "BEAT_REACTIVE_FLOOR_RING",
  targetAnchorId: "floor-projection-center",
  colorHex: "#00FFFF",
});

UnderlayLibrary.register({
  id: "underlay-gold-winner-podium",
  version: "1.0.0",
  category: "CELEBRATION",
  compatibleRuntimes: ["battle", "cypher"],
  requiredAnchors: ["winner-focus-center"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  underlayType: "SPOTLIGHT_CIRCLE",
  targetAnchorId: "winner-focus-center",
  colorHex: "#FFD700",
});

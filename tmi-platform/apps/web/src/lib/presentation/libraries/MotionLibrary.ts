/**
 * MotionLibrary.ts — Reusable animation presets for drawer transitions and broadcast wipes.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface MotionPresetAsset extends ProductionAssetDefinition {
  motionType: "ORBIT" | "VINYL_FLIP" | "SCATTER" | "PORTAL" | "HOLOGRAM" | "FOLD" | "MAGNET" | "CAMERA_WIPE";
  durationMs: number;
  easing: string;
}

export const MotionLibrary = new ProductionAssetRegistry<MotionPresetAsset>();

MotionLibrary.register({
  id: "motion-portal-wipe",
  version: "1.0.0",
  category: "BROADCAST",
  compatibleRuntimes: ["*"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  accessibilityFallback: "motion-fade",
  certificationStatus: "CERTIFIED",
  motionType: "PORTAL",
  durationMs: 450,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
});

MotionLibrary.register({
  id: "motion-hologram-fold",
  version: "1.0.0",
  category: "DRAWER",
  compatibleRuntimes: ["*"],
  qualityTiers: ["medium", "high", "ultra"],
  accessibilityFallback: "motion-slide-up",
  certificationStatus: "CERTIFIED",
  motionType: "HOLOGRAM",
  durationMs: 350,
  easing: "easeOutQuad",
});

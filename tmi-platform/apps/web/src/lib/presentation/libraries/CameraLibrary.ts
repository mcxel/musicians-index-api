/**
 * CameraLibrary.ts — Reusable camera behaviors & movement definitions.
 */

import { ProductionAssetDefinition, ProductionAssetRegistry } from "./types";

export interface CameraBehaviorAsset extends ProductionAssetDefinition {
  mode: "FOLLOW" | "ORBIT" | "FIXED" | "CINEMATIC_FLY_IN" | "REPLAY";
  targetAnchorId: string;
  defaultFov: number;
  transitionDurationMs: number;
  easingCurve: string;
}

export const CameraLibrary = new ProductionAssetRegistry<CameraBehaviorAsset>();

// Register certified camera behaviors
CameraLibrary.register({
  id: "cam-performer-primary-focus",
  version: "1.0.0",
  category: "PERFORMER",
  compatibleRuntimes: ["battle", "cypher", "concert", "challenge"],
  requiredAnchors: ["performer-primary"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  mode: "FOLLOW",
  targetAnchorId: "performer-primary",
  defaultFov: 45,
  transitionDurationMs: 800,
  easingCurve: "easeInOutQuad",
});

CameraLibrary.register({
  id: "cam-winner-celebration-flyin",
  version: "1.0.0",
  category: "CELEBRATION",
  compatibleRuntimes: ["battle", "cypher", "concert"],
  requiredAnchors: ["winner-focus-center"],
  qualityTiers: ["medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  mode: "CINEMATIC_FLY_IN",
  targetAnchorId: "winner-focus-center",
  defaultFov: 38,
  transitionDurationMs: 2000,
  easingCurve: "cubic-bezier(0.25, 1, 0.5, 1)",
});

CameraLibrary.register({
  id: "cam-lounge-orbit",
  version: "1.0.0",
  category: "ROOM",
  compatibleRuntimes: ["fan-lobby", "playlist-lounge", "world-dance-party"],
  requiredAnchors: ["lounge-center-screen"],
  qualityTiers: ["low", "medium", "high", "ultra"],
  certificationStatus: "CERTIFIED",
  mode: "ORBIT",
  targetAnchorId: "lounge-center-screen",
  defaultFov: 50,
  transitionDurationMs: 1200,
  easingCurve: "linear",
});

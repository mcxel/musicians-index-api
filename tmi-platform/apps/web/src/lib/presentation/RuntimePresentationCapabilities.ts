/**
 * RuntimePresentationCapabilities.ts
 * Certified capability manifest for every runtime in TMI.
 * Used by Presentation Asset Compiler and Directors to validate presentation commands.
 */

export interface RuntimePresentationCapabilities {
  runtimeType: string;
  anchors: string[];
  surfaces: string[];
  cameras: string[];
  supportsWorldSpaceOverlays: boolean;
  supportsCrowd: boolean;
  supportsReplay: boolean;
  supportsSpatialAudio: boolean;
  supportsDualMonitors: boolean;
}

export const CERTIFIED_RUNTIME_CAPABILITIES: Record<string, RuntimePresentationCapabilities> = {
  battle: {
    runtimeType: "battle",
    anchors: ["performer-primary", "performer-secondary", "judge-anchor", "battle-score-top", "winner-focus-center"],
    surfaces: ["main-stage-screen", "hud-overlay-surface", "judge-monitor", "score-board"],
    cameras: ["performer-primary", "performer-secondary", "split-screen-clash", "winner-focus-center"],
    supportsWorldSpaceOverlays: true,
    supportsCrowd: true,
    supportsReplay: true,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
  cypher: {
    runtimeType: "cypher",
    anchors: ["performer-primary", "host-anchor", "audience-row-1", "floor-projection-center"],
    surfaces: ["main-stage-screen", "queue-card-surface"],
    cameras: ["performer-primary", "host-anchor", "circle-overview"],
    supportsWorldSpaceOverlays: true,
    supportsCrowd: true,
    supportsReplay: true,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
  challenge: {
    runtimeType: "challenge",
    anchors: ["performer-primary", "battle-score-top"],
    surfaces: ["main-stage-screen", "hud-overlay-surface"],
    cameras: ["performer-primary", "fixed-overhead"],
    supportsWorldSpaceOverlays: false,
    supportsCrowd: false,
    supportsReplay: true,
    supportsSpatialAudio: false,
    supportsDualMonitors: true,
  },
  concert: {
    runtimeType: "concert",
    anchors: ["performer-primary", "stage-billboard-left", "audience-row-1", "floor-projection-center"],
    surfaces: ["main-stage-screen", "arena-billboard", "floor-grid"],
    cameras: ["performer-primary", "cinematic-fly-in", "crowd-sweep"],
    supportsWorldSpaceOverlays: true,
    supportsCrowd: true,
    supportsReplay: true,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
  "fan-lobby": {
    runtimeType: "fan-lobby",
    anchors: ["avatar-head-top", "avatar-shoulder-left", "lounge-center-screen"],
    surfaces: ["lounge-main-panel", "avatar-head-socket"],
    cameras: ["orbit-room", "avatar-focus"],
    supportsWorldSpaceOverlays: true,
    supportsCrowd: true,
    supportsReplay: false,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
  "playlist-lounge": {
    runtimeType: "playlist-lounge",
    anchors: ["lounge-center-screen", "stage-billboard-left"],
    surfaces: ["lounge-main-panel", "playlist-wall"],
    cameras: ["orbit-room", "screen-focus"],
    supportsWorldSpaceOverlays: true,
    supportsCrowd: true,
    supportsReplay: false,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
  "world-dance-party": {
    runtimeType: "world-dance-party",
    anchors: ["performer-primary", "floor-projection-center", "audience-row-1"],
    surfaces: ["dj-booth-screen", "floor-laser-grid"],
    cameras: ["dj-overview", "dance-floor-sweep"],
    supportsWorldSpaceOverlays: true,
    supportsCrowd: true,
    supportsReplay: false,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
  "stream-and-win": {
    runtimeType: "stream-and-win",
    anchors: ["battle-score-top", "stage-billboard-left"],
    surfaces: ["radio-visualizer", "score-board"],
    cameras: ["fixed-studio"],
    supportsWorldSpaceOverlays: false,
    supportsCrowd: true,
    supportsReplay: false,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
  "video-shuffle": {
    runtimeType: "video-shuffle",
    anchors: ["lounge-center-screen"],
    surfaces: ["shuffle-main-monitor"],
    cameras: ["screen-focus"],
    supportsWorldSpaceOverlays: false,
    supportsCrowd: false,
    supportsReplay: false,
    supportsSpatialAudio: true,
    supportsDualMonitors: true,
  },
};

export function getRuntimeCapabilities(runtimeType: string): RuntimePresentationCapabilities {
  return (
    CERTIFIED_RUNTIME_CAPABILITIES[runtimeType.toLowerCase()] ?? {
      runtimeType,
      anchors: ["performer-primary"],
      surfaces: ["main-stage-screen"],
      cameras: ["performer-primary"],
      supportsWorldSpaceOverlays: false,
      supportsCrowd: false,
      supportsReplay: false,
      supportsSpatialAudio: false,
      supportsDualMonitors: true,
    }
  );
}

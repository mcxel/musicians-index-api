/**
 * Screen Surface Registry — typed production surfaces attached to monitor anchors.
 *
 * trackingMode:
 *   SCREEN_SPACE  — relative to MonitorAnchorZones (supported now)
 *   PERSON_ATTACH — stub for future CV/person tracking (no fake landmarks)
 */

import type { MonitorAnchorZoneId } from "./MonitorAnchorZones";
import type { PresentationLayerId } from "./LayerStack";

export type ScreenSurfaceType =
  | "PERFORMER_FRAME"
  | "BATTLE_FRAME"
  | "SCORE_PANEL"
  | "WINNER_PANEL"
  | "LOWER_THIRD"
  | "SPONSOR_PANEL"
  | "VS_BADGE"
  | "ROUND_BANNER"
  | "VOTING_PANEL"
  | "CAMERA_CUE"
  | "CRITICAL_ALERT";

export type SurfaceTrackingMode = "SCREEN_SPACE" | "PERSON_ATTACH";

export interface ScreenSurfaceDefinition {
  surfaceId: string;
  type: ScreenSurfaceType;
  label: string;
  /** Prefer MonitorAnchorZoneId for SCREEN_SPACE surfaces */
  anchorId: MonitorAnchorZoneId;
  trackingMode: SurfaceTrackingMode;
  layer: PresentationLayerId;
  /** PERSON_ATTACH stub only — never invent CV landmarks */
  personAttachStub?: {
    socketHint: "HEAD_TOP" | "SHOULDER_LEFT" | "SHOULDER_RIGHT" | "CHEST";
    note: "STUB — no computer-vision binding in this pass";
  };
}

const SURFACES: Record<string, ScreenSurfaceDefinition> = {
  "surface.performer-frame": {
    surfaceId: "surface.performer-frame",
    type: "PERFORMER_FRAME",
    label: "Performer neon frame",
    anchorId: "CENTER",
    trackingMode: "SCREEN_SPACE",
    layer: "PERFORMER",
  },
  "surface.battle-frame": {
    surfaceId: "surface.battle-frame",
    type: "BATTLE_FRAME",
    label: "Battle split frame",
    anchorId: "SAFE_AREA",
    trackingMode: "SCREEN_SPACE",
    layer: "UNDERLAY",
  },
  "surface.score-panel": {
    surfaceId: "surface.score-panel",
    type: "SCORE_PANEL",
    label: "Score panel",
    anchorId: "TOP",
    trackingMode: "SCREEN_SPACE",
    layer: "OVERLAYS",
  },
  "surface.winner-panel": {
    surfaceId: "surface.winner-panel",
    type: "WINNER_PANEL",
    label: "Winner reveal panel",
    anchorId: "CENTER",
    trackingMode: "SCREEN_SPACE",
    layer: "OVERLAYS",
  },
  "surface.lower-third": {
    surfaceId: "surface.lower-third",
    type: "LOWER_THIRD",
    label: "Lower third",
    anchorId: "BOTTOM",
    trackingMode: "SCREEN_SPACE",
    layer: "OVERLAYS",
  },
  "surface.sponsor-panel": {
    surfaceId: "surface.sponsor-panel",
    type: "SPONSOR_PANEL",
    label: "Sponsor panel",
    anchorId: "BOTTOM_RIGHT",
    trackingMode: "SCREEN_SPACE",
    layer: "OVERLAYS",
  },
  "surface.vs-badge": {
    surfaceId: "surface.vs-badge",
    type: "VS_BADGE",
    label: "VS badge",
    anchorId: "CENTER",
    trackingMode: "SCREEN_SPACE",
    layer: "TRANSITIONS",
  },
  "surface.round-banner": {
    surfaceId: "surface.round-banner",
    type: "ROUND_BANNER",
    label: "Round banner",
    anchorId: "TOP",
    trackingMode: "SCREEN_SPACE",
    layer: "OVERLAYS",
  },
  "surface.voting-panel": {
    surfaceId: "surface.voting-panel",
    type: "VOTING_PANEL",
    label: "Voting open panel",
    anchorId: "BOTTOM",
    trackingMode: "SCREEN_SPACE",
    layer: "OVERLAYS",
  },
  "surface.camera-cue": {
    surfaceId: "surface.camera-cue",
    type: "CAMERA_CUE",
    label: "Director camera cue chip",
    anchorId: "TOP_LEFT",
    trackingMode: "SCREEN_SPACE",
    layer: "OVERLAYS",
  },
  "surface.critical-alert": {
    surfaceId: "surface.critical-alert",
    type: "CRITICAL_ALERT",
    label: "Critical alert band",
    anchorId: "TOP",
    trackingMode: "SCREEN_SPACE",
    layer: "CRITICAL_ALERTS",
  },
  /** Stub only — easy registration without fake CV */
  "surface.person-nameplate-stub": {
    surfaceId: "surface.person-nameplate-stub",
    type: "LOWER_THIRD",
    label: "Person-attach nameplate (stub)",
    anchorId: "BOTTOM",
    trackingMode: "PERSON_ATTACH",
    layer: "OVERLAYS",
    personAttachStub: {
      socketHint: "HEAD_TOP",
      note: "STUB — no computer-vision binding in this pass",
    },
  },
};

export function getScreenSurface(surfaceId: string): ScreenSurfaceDefinition | undefined {
  return SURFACES[surfaceId];
}

export function listScreenSurfaces(): ScreenSurfaceDefinition[] {
  return Object.values(SURFACES);
}

export function listScreenSurfacesByType(type: ScreenSurfaceType): ScreenSurfaceDefinition[] {
  return Object.values(SURFACES).filter((s) => s.type === type);
}

export function listScreenSpaceSurfaces(): ScreenSurfaceDefinition[] {
  return Object.values(SURFACES).filter((s) => s.trackingMode === "SCREEN_SPACE");
}

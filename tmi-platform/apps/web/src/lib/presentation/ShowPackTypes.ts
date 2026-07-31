/**
 * Shared show-pack phase types — Battle / Cypher / Challenge packs share shape.
 * ShowPackageDirector remains the resolver; packs are data only.
 */

import type { MonitorAnchorZoneId } from "./MonitorAnchorZones";
import type { PresentationLayerId } from "./LayerStack";
import type { PresentationSemanticEvent } from "./PresentationEvents";
import type { ScreenSurfaceType } from "./ScreenSurfaceRegistry";

export type ShowPackCategory = "BATTLE" | "CYPHER" | "CHALLENGE" | "CONCERT" | "LOBBY";

export interface ShowPackSurfaceCue {
  surfaceId: string;
  type: ScreenSurfaceType;
  anchorId: MonitorAnchorZoneId;
  layer: PresentationLayerId;
  label: string;
}

export interface ShowPackCameraCue {
  mode: "FIXED" | "FOLLOW" | "ORBIT" | "CINEMATIC_FLY_IN";
  caption: string;
}

export interface ShowPackPhase {
  phaseId: string;
  label: string;
  triggerEvent: PresentationSemanticEvent;
  previewHoldMs: number;
  surfaces: ShowPackSurfaceCue[];
  cameraCue: ShowPackCameraCue;
  legacyPackageId?: string;
  lightingCue?: string;
  fxCue?: string;
  soundCue?: string;
  crowdCue?: string;
}

export interface ShowPackDefinition {
  packId: string;
  name: string;
  description: string;
  category: ShowPackCategory;
  grammar: string[];
  phases: Record<string, ShowPackPhase>;
  eventMap: Partial<Record<PresentationSemanticEvent, string>>;
}

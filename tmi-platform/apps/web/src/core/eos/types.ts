/**
 * TMI Experience Operating System (EOS) — Core Contracts
 * Phase 1 Foundation. Registry-first: experiences compose from registered IDs.
 */

import type { VenueType } from "@/lib/venues/VenueAssetRegistry";

/** Canonical experience categories aligned with blueprint folders. */
export type ExperienceCategory =
  | "BATTLE"
  | "CHALLENGE"
  | "CYPHER"
  | "LOUNGE"
  | "DANCE_PARTY"
  | "FAN_LOBBY"
  | "GAME_SHOW"
  | "STAGE_SHOW"
  /** Weekly flagship live showcase — performers, audience reactions, discovery. Not a competition. */
  | "LIVE_SHOWCASE"
  | "CONCERT"
  | "LISTENING"
  | "TEST";

export type AvatarMode =
  | "interactive"   // full-body avatars (World Dance Party, seated crowd)
  | "presence_frame" // video-window lounge frames — no walking feet
  | "static"        // seated/static audience only
  | "none";

export type NetworkMode = "WebRTC" | "RTMP" | "Socket";

export type EosRole = "fan" | "performer" | "admin";

export interface ExperiencePermissions {
  fan: boolean;
  performer: boolean;
  admin: boolean;
}

/**
 * Contract every experience module must satisfy before StageLoader mounts it.
 * venueId maps to VenueType in VenueAssetRegistry (Rule 8 — no duplicate sources).
 */
export interface ExperienceDefinition {
  id: string;
  title: string;
  category: ExperienceCategory;
  /** VenueType key — resolved via AssetRegistry / VenueAssetRegistry */
  venueId: VenueType;
  environmentId: string;
  lightingId: string;
  cameraPackId: string;
  audienceId: string;
  avatarMode: AvatarMode;
  widgetIds: string[];
  overlayIds: string[];
  animationPackId: string;
  themeId?: string;
  networkMode: NetworkMode;
  permissions: ExperiencePermissions;
  featureFlags: string[];
  /** Semantic version for contract evolution */
  version: string;
  /** Canonical route when entering this experience from Explore / HQ */
  entryRoute: string;
}

export type VenueLayout =
  | "arena"
  | "theater"
  | "lounge"
  | "dance_floor"
  | "circle_pit"
  | "game_show"
  | "studio";

export interface SpatialAnchor {
  id: string;
  type: "PERFORMER" | "AVATAR_SEAT" | "VIDEO_SURFACE" | "BILLBOARD" | "CAMERA";
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  seatLabel?: string;
  isOccupied?: boolean;
}

export interface SpatialVideoSurface {
  id: string;
  surfaceType: "SCREEN_MAIN" | "FLOATING_PANEL" | "AVATAR_SOCKET" | "BILLBOARD";
  anchorId: string;
  width: number;
  height: number;
  meshName?: string;
}

export interface LightingProfile {
  ambientColor: string;
  ambientIntensity: number;
  directionalColor?: string;
  directionalPosition?: [number, number, number];
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
}

/** EOS venue definition — bridges VenueAssetRegistry geometry and 360 3D spatial engines. */
export interface VenueDefinition {
  id: string;
  venueType: VenueType;
  displayName: string;
  layout: VenueLayout;
  assetIds: string[];
  glbAssetUrl?: string;
  spatialAnchors?: SpatialAnchor[];
  videoSurfaces?: SpatialVideoSurface[];
  lightingProfile?: LightingProfile;
  enable360Camera?: boolean;
}


export interface WidgetDefinition {
  id: string;
  displayName: string;
  layer: "hud" | "overlay" | "panel" | "ambient";
  /** Existing component module path (assembly reference — not imported at registry load) */
  componentPath?: string;
  requiredForCategories?: ExperienceCategory[];
}

export interface CameraPackDefinition {
  id: string;
  displayName: string;
  roomType: string;
  shotWeights: Record<string, number>;
}

export interface AnimationPackDefinition {
  id: string;
  displayName: string;
  transitions: string[];
}

export interface RuntimeManifest {
  experience: ExperienceDefinition;
  venue: VenueDefinition;
  role: EosRole;
  widgets: WidgetDefinition[];
  cameraPack: CameraPackDefinition;
  animationPack: AnimationPackDefinition;
}

export type EosLifecycleState =
  | "BOOT"
  | "LOAD_REGISTRIES"
  | "VALIDATE"
  | "LOAD_ASSETS"
  | "INITIALIZE_SERVICES"
  | "INITIALIZE_RUNTIME"
  | "READY"
  | "RUNNING"
  | "CRITICAL_FAILURE";

export interface EosValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

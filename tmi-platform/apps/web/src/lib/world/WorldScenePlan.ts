/**
 * WorldScenePlan — deterministic scene output from AutonomousWorldDirector.
 * Context-driven (LiveSession + room metadata), NOT prompt-dependent.
 *
 * Status lock 2026-08-23:
 *   🟢 CODE WIRED · 🟢 TYPECHECK CLEAN · 🟢 MONITOR B PATH CONNECTED
 *   🟡 DEPLOYMENT TO BE VERIFIED · ⏳ PHYSICAL CERT OPEN
 *   ⏳ PRODUCTION GEOMETRY OPEN · ⏳ NAVMESH/COLLISION OPEN
 * Do NOT set CERTIFIED until physical run order PASSes on device.
 */

import type { VenueEnvironmentKind } from "@/lib/venues/EventVenueEnvironment";
import type { CanonicalWorldZone } from "@/lib/live/canonicalWorldViewport";
import type { VenueIndex } from "@/components/live/AudienceScene";

/** Honest certification — CODE WIRED; remains OPEN until physical cert PASSes. */
export type WorldDirectorCertStatus = "OPEN" | "PREVIEW_WIRED" | "CERTIFIED";

/** Locked OPEN — wiring complete; physical cert / production geometry still open. */
export const WORLD_DIRECTOR_CERT_STATUS: WorldDirectorCertStatus = "OPEN";

export const WORLD_DIRECTOR_GAPS = [
  "Physical cert OPEN — PC preview → PC GO LIVE → Phone GO LIVE → 2nd account → store proof",
  "Deployment to be verified (deployed SHA ≠ claimed wiring until /api/version match)",
  "Photoreal GLB / navmesh / collision — PRODUCTION GEOMETRY OPEN (do not fake)",
  "LOD downgrade pipeline — blocked until after base physical cert + production GLB",
  "Progressive stadium fill — blocked until after LOD (GO LIVE stays empty-first / real-only)",
  "Face-scan AvatarRuntime — not built (Rule 18 scope honesty)",
] as const;

export type WorldScenePlanSource = "go-live" | "preview" | "session-resume";

export interface VenueProfileSlice {
  venueType: string | null;
  skinId: string | null;
  venueIndex: VenueIndex;
  label: string;
  usesDanceFloor: boolean;
  resolutionSource: string;
}

export interface SeatLayoutSlice {
  engine: "audienceRuntimeEngine" | "SeatingMeshEngine";
  venueIndex: VenueIndex;
  capacity: number;
  layout: "theater" | "standing" | "festival" | "lawn" | "lounge";
}

export interface MaterialProfileSlice {
  tierSkinId: string;
  skinId: string | null;
  structureUnchanged: true;
}

export interface LightingProfileSlice {
  presetId: string;
  ambientEnergy: number;
  copyTone: "hype" | "chill" | "neutral";
}

export interface CrowdPolicySlice {
  /** Real humans only on GO LIVE — bots never count as viewers (Rule 20). */
  allowBotFill: boolean;
  maxBotFillRatio: number;
  progressiveStadiumFill: boolean;
  /** True only in /venue/preview TEST mode — always labeled TEST. */
  testOccupancy: boolean;
  testOccupancyRatio: number | null;
  testCapacity: number | null;
  testLabel: string | null;
  fanAvatarsOnly: true;
}

export interface AnimationPolicySlice {
  stageEffect: string;
  autoLightingFromEnergy: boolean;
}

export interface MotionPolicySlice {
  broadcastRoomType: string;
  defaultCameraAngle: string;
  autoRotate: boolean;
}

export interface LodPolicySlice {
  /**
   * Preferred presentation LOD hint from DeviceQualityGovernor.
   * Physical mesh downgrade pipeline remains OPEN until production GLB + cert.
   */
  level: "full" | "simplified" | "billboard";
  status: "OPEN";
  /** LIGHT | STANDARD | ULTRA — presentation cost only. */
  deviceQualityTier?: "LIGHT" | "STANDARD" | "ULTRA";
  /** Degraded mode ladder hint (constitution). */
  degradedMode?:
    | "ULTRA_3D"
    | "STANDARD_3D"
    | "LIGHTWEIGHT"
    | "VIDEO_ONLY"
    | "AUDIO_ONLY";
  note: string;
}

/**
 * Native immersive view modes for World Director → UVR.
 * Primary triad: FREE_ROAM_3D | PANORAMA_180 | SPHERICAL_360.
 * PANORAMA_360 is a locked alias of SPHERICAL_360 (VenuePreviewCertification).
 */
export type WorldViewMode =
  | "FREE_ROAM_3D"
  | "PANORAMA_180"
  | "SPHERICAL_360"
  | "PANORAMA_360";

export type WorldViewModeCanonical = "FREE_ROAM_3D" | "PANORAMA_180" | "SPHERICAL_360";

export function canonicalizeWorldViewMode(mode: WorldViewMode): WorldViewModeCanonical {
  if (mode === "PANORAMA_360") return "SPHERICAL_360";
  return mode;
}

/**
 * Coordinate authority: WorldScenePlan.spatialMap.
 * Runtime values are stable **engine units**. Tools display feet / sq ft.
 * Until MEASURED_GLB, engine unit ↔ display ft is 1:1 (see GameRuntimeConstitution).
 * Field name `units: "ft"` is the display label for tools — not a second coordinate system.
 */
export type SpatialUnits = "ft";

/** Origin-relative rectangle on the venue floor plate (engine units; display as ft). */
export interface SpatialRectFt {
  x: number;
  y: number;
  width: number;
  depth: number;
}

export interface SpatialZoneFt {
  id: string;
  kind: "seating" | "standing" | "vip" | "dance" | "stage" | "aisle";
  bounds: SpatialRectFt;
  /** Optional SeatingMeshEngine grid when seating kind. */
  meshRows?: number;
  meshCols?: number;
}

/**
 * Canonical world coordinate surface — seats, standing, stage, avatar anchors.
 * Engine units are authoritative; widthFt/depthFt/areaSqFt are display fields for tools.
 * Registry-derived until measured GLB exists (geometryStatus).
 */
export interface VenueSpatialMap {
  units: SpatialUnits;
  /** Stage-front center looking into house (+y into audience, +z up). Engine units. */
  origin: { x: number; y: number; z: number };
  /** Display helpers — same numeric values as engine units at 1:1 until MEASURED_GLB. */
  floor: { widthFt: number; depthFt: number; areaSqFt: number };
  stage: SpatialRectFt;
  seatZones: SpatialZoneFt[];
  standingZones: SpatialZoneFt[];
  capacity: number;
  seatTiers: 1 | 2 | 3;
  audienceLayout: string;
  /** REGISTRY_ESTIMATE until production GLB/navmesh measured — never claim PASS. */
  geometryStatus: "REGISTRY_ESTIMATE" | "MEASURED_GLB";
}

export interface WorldScenePlan {
  planId: string;
  roomId: string;
  eventType: string;
  genre: string | null;
  environment: VenueEnvironmentKind | null;
  capacity: number;
  venueProfile: VenueProfileSlice;
  seatLayout: SeatLayoutSlice;
  materialProfile: MaterialProfileSlice;
  lightingProfile: LightingProfileSlice;
  crowdPolicy: CrowdPolicySlice;
  animationPolicy: AnimationPolicySlice;
  motionPolicy: MotionPolicySlice;
  lodPolicy: LodPolicySlice;
  /** Immersive view mode — context-selected; not a prompt UI. */
  viewMode: WorldViewMode;
  /** Square-feet coordinate space for the venue scene. */
  spatialMap: VenueSpatialMap;
  canonicalZone: CanonicalWorldZone;
  sceneInstanceId: string | null;
  certification: WorldDirectorCertStatus;
  source: WorldScenePlanSource;
  builtAt: number;
}

/** Props slice consumed by UniversalVenueRenderer / ArenaEventShell. */
export interface WorldSceneRenderProps {
  roomId: string;
  venueIndex: VenueIndex;
  venueEnvironment: VenueEnvironmentKind | null;
  venueSkinId: string | null;
  instantEmptyStage: boolean;
  forceStadiumFill: boolean;
  suppressAvatars: boolean;
  isPreview: boolean;
  forcedOccupancyRatio: number | null;
  previewCapacity: number | undefined;
  canonicalZone: CanonicalWorldZone;
  viewMode: WorldViewMode;
  spatialMap: VenueSpatialMap;
}

export function worldScenePlanToRenderProps(plan: WorldScenePlan): WorldSceneRenderProps {
  return {
    roomId: plan.roomId,
    venueIndex: plan.venueProfile.venueIndex,
    venueEnvironment: plan.environment,
    venueSkinId: plan.materialProfile.skinId,
    instantEmptyStage: plan.source === "go-live" && !plan.crowdPolicy.testOccupancy,
    forceStadiumFill:
      plan.crowdPolicy.progressiveStadiumFill && !plan.crowdPolicy.testOccupancy,
    suppressAvatars: plan.seatLayout.layout === "lounge",
    isPreview: plan.crowdPolicy.testOccupancy,
    forcedOccupancyRatio: plan.crowdPolicy.testOccupancyRatio,
    previewCapacity: plan.crowdPolicy.testCapacity ?? undefined,
    canonicalZone: plan.canonicalZone,
    viewMode: plan.viewMode,
    spatialMap: plan.spatialMap,
  };
}

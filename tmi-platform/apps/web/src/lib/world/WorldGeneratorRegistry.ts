/**
 * WorldGeneratorRegistry — capability registry for AutonomousWorldDirector.
 * Each generator delegates to an EXISTING engine; no parallel V2 systems.
 */

import type { VenueEnvironmentKind } from "@/lib/venues/EventVenueEnvironment";
import { resolveEventVenueEnvironment, normalizeEventVenueKind } from "@/lib/venues/EventVenueEnvironment";
import { resolveRoomVenueRuntime } from "@/lib/venues/resolveRoomVenueRuntime";
import { getVenueAsset, type VenueType } from "@/lib/venues/VenueAssetRegistry";
import { getVenueRuntime } from "@/lib/venue/tmiVenueRuntimeEngine";
import { resolveBaseVenueSkin } from "@/lib/venues/TierBaseVenueSkin";
import { requestVenueSceneInstance } from "@/lib/venues/VenueSceneFactory";
import { auditoriumMeshAddress } from "@/lib/venues/VenueMeshAddress";
import { crowdLayoutForEnvironment } from "@/lib/venues/VenuePreviewCertification";
import {
  STAGE_LIGHTING_PRESETS,
  type StageLightingPreset,
} from "@/lib/live/StageDirectorEngine";
import type { RoomType } from "@/lib/live/BroadcastDirectorEngine";
import type {
  MaterialProfileSlice,
  LightingProfileSlice,
  SeatLayoutSlice,
  VenueProfileSlice,
  AnimationPolicySlice,
  MotionPolicySlice,
  LodPolicySlice,
  WorldViewMode,
  VenueSpatialMap,
  SpatialZoneFt,
} from "@/lib/world/WorldScenePlan";
import { canonicalizeWorldViewMode } from "@/lib/world/WorldScenePlan";
import { getLodPolicyHint } from "@/lib/runtime/DeviceQualityGovernor";
import type { CanonicalWorldZone } from "@/lib/live/canonicalWorldViewport";
import { CANONICAL_WORLD_ZONE, isLoungeRoomId } from "@/lib/live/canonicalWorldViewport";
import type { VenueIndex } from "@/components/live/AudienceScene";
import type { VenueGeometry } from "@/lib/venues/VenueAssetRegistry";

export type WorldGeneratorId =
  | "scene"
  | "environment"
  | "venue-profile"
  | "seating"
  | "material"
  | "lighting"
  | "animation"
  | "motion"
  | "lod"
  | "view-mode"
  | "spatial-map";

export interface WorldGeneratorContext {
  roomId: string;
  eventType: string;
  category?: string | null;
  genre?: string | null;
  environment?: VenueEnvironmentKind | null;
  venueSkinId?: string | null;
  performerTier?: string;
  canonicalZone?: CanonicalWorldZone;
  isPreview?: boolean;
  /** Preview / test override only — GO LIVE never prompts for this. */
  viewMode?: WorldViewMode | null;
}

export interface SceneGeneratorResult {
  sceneInstanceId: string;
}

export interface EnvironmentGeneratorResult {
  environment: VenueEnvironmentKind | null;
  skinId: string | null;
  venueIndex: VenueIndex;
  ambientEnergy: number;
  copyTone: "hype" | "chill" | "neutral";
  label: string;
}

function mapTierToUserTier(tier?: string): Parameters<typeof resolveBaseVenueSkin>[0] {
  const t = (tier ?? "FREE").toUpperCase();
  if (t === "DIAMOND") return "DIAMOND";
  if (t === "PLATINUM") return "PLATINUM";
  if (t === "GOLD") return "GOLD";
  if (t === "SILVER") return "SILVER";
  if (t === "RUBY" || t === "BRONZE") return "RUBY";
  if (t === "PRO") return "PRO";
  return "FREE";
}

function eventTypeToBroadcastRoomType(eventType: string): RoomType {
  const e = eventType.toLowerCase();
  if (e.includes("battle")) return "BATTLE";
  if (e.includes("cypher")) return "CYPHER";
  if (e.includes("challenge")) return "CHALLENGE";
  if (e.includes("dance")) return "DANCE_PARTY";
  if (e.includes("lounge") || e.includes("fan")) return "FAN_LOBBY";
  return "PERFORMER_LIVE";
}

function pickLightingPreset(eventType: string, ambientEnergy: number): StageLightingPreset {
  const e = eventType.toLowerCase();
  if (e.includes("slow-jam") || e.includes("lounge")) {
    return STAGE_LIGHTING_PRESETS["audience-glow"] ?? STAGE_LIGHTING_PRESETS["purple-wash"]!;
  }
  if (ambientEnergy >= 0.75) {
    return STAGE_LIGHTING_PRESETS["concert-red"] ?? STAGE_LIGHTING_PRESETS["purple-wash"]!;
  }
  return STAGE_LIGHTING_PRESETS["purple-wash"]!;
}

/** Scene — VenueSceneFactory metadata composer (no GLB construction). */
export function runSceneGenerator(ctx: WorldGeneratorContext): SceneGeneratorResult {
  const venueResolved = resolveRoomVenueRuntime({
    roomId: ctx.roomId,
    categoryHint: ctx.category,
  });
  const templateId = venueResolved.venueType ?? "concert";
  const tierSkin = resolveBaseVenueSkin(mapTierToUserTier(ctx.performerTier));
  const instance = requestVenueSceneInstance({
    templateId,
    environmentVariant: ctx.environment === "outdoor" ? "outdoor" : "interior",
    shardAddress: auditoriumMeshAddress({
      eventId: ctx.roomId,
      venueType: templateId,
      clusterId: "primary",
      auditoriumIndex: 0,
    }),
    appearance: {
      baseTierSkinId: tierSkin.id,
      purchasedSkinId: ctx.venueSkinId ?? null,
      seasonalVariantId: null,
      structureUnchanged: true,
    },
    canonicalVenueDefinition: { templateId, liveSlug: ctx.roomId },
    roomId: ctx.roomId,
  });
  return { sceneInstanceId: instance.id };
}

/** Environment — EventVenueEnvironment indoor/outdoor resolution. */
export function runEnvironmentGenerator(ctx: WorldGeneratorContext): EnvironmentGeneratorResult {
  const kind = normalizeEventVenueKind(ctx.eventType) ?? ctx.eventType;
  const resolution = resolveEventVenueEnvironment({
    kind,
    environment: ctx.environment,
    skinId: ctx.venueSkinId,
  });
  return {
    environment: resolution.environment,
    skinId: resolution.skinId,
    venueIndex: resolution.venueIndex as VenueIndex,
    ambientEnergy: resolution.ambientEnergy,
    copyTone: resolution.copyTone,
    label: resolution.label,
  };
}

/** Venue profile — VenueAssetRegistry + resolveRoomVenueRuntime. */
export function runVenueProfileGenerator(
  ctx: WorldGeneratorContext,
  env: EnvironmentGeneratorResult,
): VenueProfileSlice {
  const resolved = resolveRoomVenueRuntime({
    roomId: ctx.roomId,
    categoryHint: ctx.category,
  });
  const venueType = resolved.venueType;
  const asset = venueType ? getVenueAsset(venueType) : null;
  const usesDanceFloor =
    venueType === "world-dance-party" || ctx.eventType.toLowerCase().includes("dance-party");
  return {
    venueType,
    skinId: env.skinId,
    venueIndex: (resolved.venueIndex ?? env.venueIndex) as VenueIndex,
    label: asset?.label ?? "TMI Stage",
    usesDanceFloor,
    resolutionSource: resolved.source,
  };
}

/** Seating — audienceRuntimeEngine primary; SeatingMeshEngine for preview mesh. */
export function runSeatingGenerator(
  ctx: WorldGeneratorContext,
  env: EnvironmentGeneratorResult,
  venueProfile: VenueProfileSlice,
): SeatLayoutSlice {
  const venueType = venueProfile.venueType;
  const asset = venueType ? getVenueAsset(venueType as VenueType) : null;
  const capacity = asset?.geometry.displayCapacity ?? 1000;
  const layout = isLoungeRoomId(ctx.roomId)
    ? "lounge"
    : crowdLayoutForEnvironment(env.environment, ctx.eventType);
  return {
    engine: ctx.isPreview ? "SeatingMeshEngine" : "audienceRuntimeEngine",
    venueIndex: venueProfile.venueIndex,
    capacity,
    layout,
  };
}

/** Material — TierBaseVenueSkin appearance only (geometry unchanged). */
export function runMaterialGenerator(ctx: WorldGeneratorContext): MaterialProfileSlice {
  const tierSkin = resolveBaseVenueSkin(mapTierToUserTier(ctx.performerTier));
  return {
    tierSkinId: tierSkin.id,
    skinId: ctx.venueSkinId ?? null,
    structureUnchanged: true,
  };
}

/** Lighting — StageDirectorEngine presets + tmiVenueRuntimeEngine config. */
export function runLightingGenerator(
  ctx: WorldGeneratorContext,
  env: EnvironmentGeneratorResult,
): LightingProfileSlice {
  getVenueRuntime(ctx.roomId);
  const preset = pickLightingPreset(ctx.eventType, env.ambientEnergy);
  return {
    presetId: preset.id,
    ambientEnergy: env.ambientEnergy,
    copyTone: env.copyTone,
  };
}

/** Animation — StageDirectorEngine effect channel (metadata only until physical cert). */
export function runAnimationGenerator(env: EnvironmentGeneratorResult): AnimationPolicySlice {
  return {
    stageEffect: env.copyTone === "chill" ? "crowd-glow" : "none",
    autoLightingFromEnergy: true,
  };
}

/** Motion — BroadcastDirectorEngine room-type mapping (camera policy metadata). */
export function runMotionGenerator(ctx: WorldGeneratorContext): MotionPolicySlice {
  const roomType = eventTypeToBroadcastRoomType(ctx.eventType);
  return {
    broadcastRoomType: roomType,
    defaultCameraAngle: roomType === "DANCE_PARTY" ? "DanceFloorView" : "StageView",
    autoRotate: false,
  };
}

/** LOD — DeviceQualityGovernor hint; physical mesh downgrade still OPEN. */
export function runLodGenerator(): LodPolicySlice {
  const hint = getLodPolicyHint();
  return {
    level: hint.lodLevelHint,
    status: "OPEN",
    deviceQualityTier: hint.preferredTier,
    degradedMode: hint.degradedMode,
    note:
      "LOD hint from DeviceQualityGovernor — physical pipeline (full → simplified → billboard) OPEN until GLB + cert",
  };
}

/**
 * View mode — context-driven from LiveSession / venue profile (no prompt UI).
 * Prefer FREE_ROAM_3D; outdoor → PANORAMA_180; lounge/fan-lobby → SPHERICAL_360.
 */
export function runViewModeGenerator(
  ctx: WorldGeneratorContext,
  env: EnvironmentGeneratorResult,
  venueProfile: VenueProfileSlice,
): WorldViewMode {
  if (ctx.viewMode) return canonicalizeWorldViewMode(ctx.viewMode);
  const vt = (venueProfile.venueType ?? "").toLowerCase();
  const et = ctx.eventType.toLowerCase();
  if (
    isLoungeRoomId(ctx.roomId) ||
    vt === "lounge" ||
    vt === "fan-lobby" ||
    et.includes("lounge") ||
    et.includes("fan-lobby")
  ) {
    return "SPHERICAL_360";
  }
  if (env.environment === "outdoor" || vt.includes("outdoor") || et.includes("festival")) {
    return "PANORAMA_180";
  }
  return "FREE_ROAM_3D";
}

/** Sq-ft per person heuristic by audience layout — registry estimate only. */
function sqFtPerPerson(layout: VenueGeometry["audienceLayout"] | string): number {
  switch (layout) {
    case "lounge-tables":
      return 15;
    case "theater-rows":
      return 8;
    case "stadium-bowl":
      return 6;
    case "circle-pit":
      return 5;
    case "floor-standing":
      return 4;
    default:
      return 7;
  }
}

/**
 * Spatial map — square-feet floor plate from VenueAssetRegistry capacity/geometry.
 * Not measured GLB coords (geometryStatus = REGISTRY_ESTIMATE until Gate 3).
 */
export function runSpatialMapGenerator(
  venueProfile: VenueProfileSlice,
  seatLayout: SeatLayoutSlice,
  env: EnvironmentGeneratorResult,
): VenueSpatialMap {
  const venueType = venueProfile.venueType;
  const asset = venueType ? getVenueAsset(venueType as VenueType) : null;
  const geometry = asset?.geometry;
  const capacity = seatLayout.capacity || geometry?.displayCapacity || 1000;
  const layout = geometry?.audienceLayout ?? "theater-rows";
  const seatTiers = geometry?.seatTiers ?? 1;
  const outdoorBoost = env.environment === "outdoor" ? 1.15 : 1;
  const areaSqFt = Math.max(400, Math.round(capacity * sqFtPerPerson(layout) * outdoorBoost));
  // Aspect ~ 1.4 width : 1 depth (house wider than deep) for bowls; tighter for lounges.
  const aspect = layout === "lounge-tables" || layout === "circle-pit" ? 1.1 : 1.4;
  const depthFt = Math.round(Math.sqrt(areaSqFt / aspect));
  const widthFt = Math.round(areaSqFt / Math.max(1, depthFt));
  const stageDepth = Math.max(12, Math.round(depthFt * 0.12));
  const stageWidth = Math.max(20, Math.round(widthFt * (geometry?.hasElevatedStage ? 0.55 : 0.4)));
  const stage: SpatialZoneFt = {
    id: "stage",
    kind: "stage",
    bounds: {
      x: -stageWidth / 2,
      y: -stageDepth,
      width: stageWidth,
      depth: stageDepth,
    },
  };

  const houseDepth = Math.max(20, depthFt - stageDepth);
  const seatDepth = Math.round(houseDepth * (seatLayout.layout === "standing" || seatLayout.layout === "festival" ? 0.45 : 0.7));
  const standDepth = houseDepth - seatDepth;
  const meshRows = Math.max(4, Math.min(40, Math.round(Math.sqrt(capacity / 8))));
  const meshCols = Math.max(6, Math.min(60, Math.round(capacity / meshRows)));

  const seatZones: SpatialZoneFt[] = [
    {
      id: "house-seating",
      kind: seatLayout.layout === "lounge" ? "vip" : "seating",
      bounds: {
        x: -widthFt / 2,
        y: 0,
        width: widthFt,
        depth: seatDepth,
      },
      meshRows,
      meshCols,
    },
  ];
  if (geometry?.hasVipSection) {
    seatZones.push({
      id: "vip-front",
      kind: "vip",
      bounds: {
        x: -widthFt * 0.2,
        y: 0,
        width: widthFt * 0.4,
        depth: Math.min(24, seatDepth * 0.2),
      },
      meshRows: Math.max(2, Math.round(meshRows * 0.15)),
      meshCols: Math.max(4, Math.round(meshCols * 0.4)),
    });
  }

  const standingZones: SpatialZoneFt[] = [];
  if (
    seatLayout.layout === "standing" ||
    seatLayout.layout === "festival" ||
    venueProfile.usesDanceFloor ||
    layout === "floor-standing" ||
    layout === "circle-pit"
  ) {
    standingZones.push({
      id: venueProfile.usesDanceFloor ? "dance-floor" : "standing-pit",
      kind: venueProfile.usesDanceFloor ? "dance" : "standing",
      bounds: {
        x: -widthFt / 2,
        y: seatDepth,
        width: widthFt,
        depth: Math.max(12, standDepth),
      },
    });
  } else if (standDepth > 8) {
    standingZones.push({
      id: "rear-standing",
      kind: "standing",
      bounds: {
        x: -widthFt / 2,
        y: seatDepth,
        width: widthFt,
        depth: standDepth,
      },
    });
  }

  return {
    units: "ft",
    origin: { x: 0, y: 0, z: 0 },
    floor: { widthFt, depthFt, areaSqFt: widthFt * depthFt },
    stage: stage.bounds,
    seatZones,
    standingZones,
    capacity,
    seatTiers,
    audienceLayout: layout,
    geometryStatus: "REGISTRY_ESTIMATE",
  };
}

export function resolveCanonicalZone(ctx: WorldGeneratorContext): CanonicalWorldZone {
  if (ctx.canonicalZone) return ctx.canonicalZone;
  if (isLoungeRoomId(ctx.roomId)) return CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM;
  if (ctx.eventType.toLowerCase().includes("battle")) {
    return CANONICAL_WORLD_ZONE.BATTLE_ARENA;
  }
  if (ctx.eventType.toLowerCase().includes("cypher")) {
    return CANONICAL_WORLD_ZONE.CIPHER_ROOM;
  }
  if (ctx.eventType.toLowerCase().includes("challenge")) {
    return CANONICAL_WORLD_ZONE.CHALLENGE_ROOM;
  }
  return CANONICAL_WORLD_ZONE.BOH;
}

export const WORLD_GENERATOR_REGISTRY: Record<
  WorldGeneratorId,
  { label: string; engine: string }
> = {
  scene: { label: "Scene", engine: "VenueSceneFactory" },
  environment: { label: "Environment", engine: "EventVenueEnvironment" },
  "venue-profile": { label: "Venue Profile", engine: "VenueAssetRegistry" },
  seating: { label: "Seating", engine: "audienceRuntimeEngine" },
  material: { label: "Material", engine: "TierBaseVenueSkin" },
  lighting: { label: "Lighting", engine: "StageDirectorEngine" },
  animation: { label: "Animation", engine: "StageDirectorEngine" },
  motion: { label: "Motion", engine: "BroadcastDirectorEngine" },
  lod: { label: "LOD", engine: "OPEN — not built" },
  "view-mode": { label: "View Mode", engine: "LiveSession + VenueProfile" },
  "spatial-map": { label: "Spatial Map (sq ft)", engine: "VenueAssetRegistry geometry" },
};

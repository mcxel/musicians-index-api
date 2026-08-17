/**
 * Thin adapter over the EXISTING TMI scene stack.
 * Not a second generator. Does not invent feet, GLBs, or world xyz.
 *
 * Observed path (audit, not a replacement):
 *   VenueAssetRegistry + resolveRoomVenueRuntime
 *     → UniversalVenueRenderer
 *       → AudienceScene (2D canvas crowd) + ambient video
 *   Supporting: tmiVenueRuntimeEngine (lighting/env config),
 *   composeVenueScene (metadata record), camera360.engine (yaw/pitch state).
 *   SpatialVenueRuntime PlaneGeometry(30,20) is unlabeled Three.js units.
 *   VenueRuntimeShell useGLTF('/models/venue-stage.glb') — 0 production GLBs in tree.
 *   lib/runtimes/VenueRuntime.ts invents seat xyz — this adapter does not call it.
 */

import { composeVenueScene } from "@/lib/ai-visuals/VenueSceneEngine";
import { getVenueRuntime } from "@/lib/venue/tmiVenueRuntimeEngine";
import { resolveRoomVenueRuntime } from "@/lib/venues/resolveRoomVenueRuntime";
import { getVenueAsset, slugToVenueType } from "@/lib/venues/VenueAssetRegistry";
import { getVenueTemplate } from "@/lib/venues/VenueTemplateRegistry";
import { formatVenueMeshAddress } from "@/lib/venues/VenueMeshAddress";
import { resolveBaseVenueSkin } from "@/lib/venues/TierBaseVenueSkin";
import {
  SEMANTIC_ANCHOR_CLASS_IDS,
  VENUE_AUTHORITIES,
  VENUE_PLATFORM_LAWS,
  type GeometryProvenance,
  type SceneInstanceLifecycle,
  type SceneRuntimeBudget,
  type SemanticAnchorContract,
  type VenueEnvironmentSlot,
  type VenueMeshAddress,
} from "@/lib/venues/VenuePlatformContract";

export type VenueSceneAppearance = {
  baseTierSkinId: string;
  purchasedSkinId: string | null;
  seasonalVariantId: string | null;
  structureUnchanged: true;
};

export type VenueSceneFactoryRequest = {
  templateId: string;
  environmentVariant: VenueEnvironmentSlot["kind"];
  shardAddress: VenueMeshAddress;
  appearance: VenueSceneAppearance;
  canonicalVenueDefinition?: { templateId: string; liveSlug: string | null };
  roomId?: string;
};

export type VenueSceneInstance = {
  id: string;
  templateId: string;
  roomId: string;
  meshKey: string;
  meshAddress: VenueMeshAddress;
  environmentVariant: VenueEnvironmentSlot["kind"];
  appearance: VenueSceneAppearance;
  lifecycle: SceneInstanceLifecycle;
  geometryStatus: GeometryProvenance;
  glbAssetUrl: null;
  worldXyz: null;
  navMeshId: null;
  semanticAnchors: SemanticAnchorContract[];
  budget: SceneRuntimeBudget;
  existingEntryPoints: {
    renderer: "UniversalVenueRenderer";
    crowdCanvas: "AudienceScene";
    assetRegistry: "VenueAssetRegistry";
    metadataComposer: "composeVenueScene";
    lightingConfig: "getVenueRuntime";
  };
  constructedGeometry: false;
  createdAt: number;
};

const UNKNOWN_BUDGET: SceneRuntimeBudget = {
  gpu: "UNKNOWN",
  memory: "UNKNOWN",
  network: "UNKNOWN",
  avatar: "UNKNOWN",
  rtc: "UNKNOWN",
  recommendedHumanOccupancy: null,
};

export const SCENE_FACTORY_AUDIT = {
  entryPoint: "UniversalVenueRenderer ← AudienceScene + VenueAssetRegistry",
  emitsRealWorldGeometry: false,
  emitsGlbGltf: false,
  productionGlbCount: 0,
  interiorExteriorCampus: "MISSING — environment slots exist as identifiers only",
  stableWorldAnchors: false,
  skinsAffectStructure: false,
  camera360: "engines/world/camera360.engine.ts — yaw/pitch/zoom state, not a renderer",
  multiInstance: "AudienceScene is a React canvas per mount; no GPU scene cache exists",
  destroyRecreate: "React unmount. GPU resource teardown is NOT_WIRED.",
  singletonAssumptions: "SpatialVenueRuntime and VenueRuntimeShell are per-component mounts, not a shared scene server",
  unlabeledPlaneGeometry: "SpatialVenueRuntime PlaneGeometry(30, 20) — LEGACY_UNVERIFIED units, not feet",
  missingGlbPath: "/models/venue-stage.glb referenced by VenueRuntimeShell — file not in tree",
  parallelGeneratorForbidden: true,
} as const;

function semanticAnchors(): SemanticAnchorContract[] {
  return SEMANTIC_ANCHOR_CLASS_IDS.map((classId) => ({
    classId,
    position: null,
    rotation: null,
    geometryStatus: "MISSING",
  }));
}

const instances = new Map<string, VenueSceneInstance>();
const cache = new Map<string, VenueSceneInstance>();
let seq = 0;

function cacheKey(req: VenueSceneFactoryRequest): string {
  return [
    req.templateId,
    req.environmentVariant,
    formatVenueMeshAddress(req.shardAddress),
    req.appearance.baseTierSkinId,
    req.appearance.purchasedSkinId ?? "",
    req.appearance.seasonalVariantId ?? "",
  ].join("|");
}

/**
 * Orchestrator-facing request. Never constructs PlaneGeometry / GLB / navmesh.
 * Calls existing metadata composers only, then records MISSING geometry.
 */
export function requestVenueSceneInstance(req: VenueSceneFactoryRequest): VenueSceneInstance {
  const key = cacheKey(req);
  const cached = cache.get(key);
  if (cached) {
    cached.lifecycle = "ACTIVE";
    instances.set(cached.id, cached);
    cache.delete(key);
    return cached;
  }

  const template = getVenueTemplate(req.templateId);
  const liveSlug = req.canonicalVenueDefinition?.liveSlug ?? template?.liveSlug ?? req.roomId ?? req.templateId;
  const venueType = slugToVenueType(liveSlug);
  if (venueType) {
    getVenueAsset(venueType);
    resolveRoomVenueRuntime({ roomId: liveSlug });
  }
  resolveBaseVenueSkin("FREE");
  getVenueRuntime(liveSlug);
  composeVenueScene({
    sceneId: `scene-${++seq}`,
    venueId: liveSlug,
    sceneType: "arena",
    lightingProfile: req.appearance.baseTierSkinId,
    stagePreset: req.environmentVariant,
    crowdDensity: 0,
    assetSlots: [],
  });

  const instance: VenueSceneInstance = {
    id: `scene-inst-${seq}`,
    templateId: req.templateId,
    roomId: liveSlug,
    meshKey: formatVenueMeshAddress(req.shardAddress),
    meshAddress: req.shardAddress,
    environmentVariant: req.environmentVariant,
    appearance: { ...req.appearance, structureUnchanged: true },
    lifecycle: "ACTIVE",
    geometryStatus: "MISSING",
    glbAssetUrl: null,
    worldXyz: null,
    navMeshId: null,
    semanticAnchors: semanticAnchors(),
    budget: { ...UNKNOWN_BUDGET },
    existingEntryPoints: {
      renderer: "UniversalVenueRenderer",
      crowdCanvas: "AudienceScene",
      assetRegistry: "VenueAssetRegistry",
      metadataComposer: "composeVenueScene",
      lightingConfig: "getVenueRuntime",
    },
    constructedGeometry: false,
    createdAt: Date.now(),
  };
  instances.set(instance.id, instance);
  return instance;
}

/** Cache/release types only. Does not claim GPU teardown. */
export function releaseVenueSceneInstance(instanceId: string): {
  ok: boolean;
  gpuTeardown: false;
  lifecycle: SceneInstanceLifecycle | "not_found";
} {
  const inst = instances.get(instanceId);
  if (!inst) return { ok: false, gpuTeardown: false, lifecycle: "not_found" };
  inst.lifecycle = "CACHED";
  instances.delete(instanceId);
  cache.set(
    cacheKey({
      templateId: inst.templateId,
      environmentVariant: inst.environmentVariant,
      shardAddress: inst.meshAddress,
      appearance: inst.appearance,
      roomId: inst.roomId,
    }),
    inst,
  );
  return { ok: true, gpuTeardown: false, lifecycle: "CACHED" };
}

export function getVenueSceneInstance(id: string): VenueSceneInstance | undefined {
  return instances.get(id) ?? [...cache.values()].find((i) => i.id === id);
}

export function getSceneFactorySnapshot() {
  return {
    laws: {
      existingSceneFactory: VENUE_PLATFORM_LAWS.existingSceneFactory,
      rightSizedCapacity: VENUE_PLATFORM_LAWS.rightSizedCapacity,
      threeAuthorities: VENUE_PLATFORM_LAWS.threeAuthorities,
    },
    authorities: VENUE_AUTHORITIES,
    audit: SCENE_FACTORY_AUDIT,
    semanticAnchors: semanticAnchors(),
    budget: UNKNOWN_BUDGET,
    cacheLifecycle: ["WARMING", "ACTIVE", "DRAINING", "COLLAPSED", "CACHED", "RELEASED"] as const,
    liveInstanceCount: instances.size,
    cachedInstanceCount: cache.size,
  };
}

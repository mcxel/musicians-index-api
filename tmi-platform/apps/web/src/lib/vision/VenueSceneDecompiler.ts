/**
 * VenueSceneDecompiler
 * Decomposes a vision-scanned venue scene into a set of named, registerable
 * surface zones, stage elements, and crowd segments.
 * Output feeds VenueStateEngine and BillboardRegistry.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { addDependency } from "@/lib/registry/HydrationDependencyGraph";
import type { VisionScanOutput, DetectedEntity } from "@/lib/vision/VisionMetadataOrchestrator";

export type VenueSurfaceZone =
  | "main-stage"
  | "b-stage"
  | "crowd-floor"
  | "vip-section"
  | "balcony"
  | "bar-area"
  | "entrance"
  | "billboard-wall"
  | "side-screen"
  | "ceiling-rig"
  | "backstage-corridor"
  | "photo-pit"
  | "unknown-zone";

export interface DecompiledSurface {
  surfaceId: string;
  zone: VenueSurfaceZone;
  assetId: string;
  boundingBox: { x: number; y: number; w: number; h: number };
  confidence: number;
  hasMotion: boolean;
  billboardCapable: boolean;
  crowdDensityEstimate: number;
  registeredAt: number;
}

export interface VenueSceneDecompileResult {
  jobId: string;
  venueId: string;
  surfaces: DecompiledSurface[];
  dominantZones: VenueSurfaceZone[];
  estimatedCrowdTotal: number;
  hasLiveStage: boolean;
  errors: string[];
  decompiledAt: number;
}

const DECOMPILER_PRIORITY = 3;
const DECOMPILER_TTL_MS = 30_000;

const sceneLog = new Map<string, VenueSceneDecompileResult>();

function classifyZone(entity: DetectedEntity, output: VisionScanOutput): VenueSurfaceZone {
  const cls = entity.entityClass;
  const attrs = entity.attributes;

  if (cls === "stage-element") {
    const position = String(attrs["stagePosition"] ?? "");
    if (position === "main") return "main-stage";
    if (position === "b-stage") return "b-stage";
    if (position === "ceiling") return "ceiling-rig";
    return "main-stage";
  }

  if (cls === "billboard") return "billboard-wall";
  if (cls === "magazine-panel") return "side-screen";

  if (cls === "crowd") {
    const section = String(attrs["section"] ?? "");
    if (section === "vip") return "vip-section";
    if (section === "balcony") return "balcony";
    if (section === "bar") return "bar-area";
    return "crowd-floor";
  }

  if (cls === "venue") {
    const area = String(attrs["area"] ?? "");
    if (area === "entrance") return "entrance";
    if (area === "backstage") return "backstage-corridor";
    if (area === "photo-pit") return "photo-pit";
    return "unknown-zone";
  }

  return "unknown-zone";
}

function estimateCrowdDensity(entity: DetectedEntity): number {
  if (entity.entityClass !== "crowd") return 0;
  const density = entity.attributes["densityScore"];
  if (typeof density === "number") return Math.min(1, Math.max(0, density));
  const personCount = entity.attributes["personCount"];
  if (typeof personCount === "number") return Math.min(1, personCount / 200);
  return entity.confidence * 0.5;
}

function decompileEntity(
  entity: DetectedEntity,
  output: VisionScanOutput,
  index: number,
  parentAssetId: string
): DecompiledSurface | null {
  const validClasses = new Set(["venue", "stage-element", "billboard", "magazine-panel", "crowd"]);
  if (!validClasses.has(entity.entityClass)) return null;

  const zone = classifyZone(entity, output);
  const surfaceId = `surface_${zone}_${output.jobId}_${index}`;
  const assetId = `venue_surface_${surfaceId}`;

  const billboardCapable = zone === "billboard-wall" || zone === "side-screen" || zone === "main-stage";
  const crowdDensityEstimate = estimateCrowdDensity(entity);

  registerAsset(assetId, "venue-surface", output.entityId, {
    generatorId: "VenueSceneDecompiler",
    metadata: {
      zone,
      boundingBox: entity.boundingBox,
      confidence: entity.confidence,
      billboardCapable,
      crowdDensityEstimate,
    },
    tags: ["venue-surface", zone, "vision-detected"],
  });

  const claim = claimAuthority(assetId, "VenueSceneDecompiler", "generator", {
    exclusive: false,
    priority: DECOMPILER_PRIORITY,
    ttlMs: DECOMPILER_TTL_MS,
  });

  if (claim.granted) {
    setHydrationStatus(assetId, "hydrating");

    recordLineage(assetId, "vision-scan", "VenueSceneDecompiler", {
      parentAssetId,
      transforms: ["segment"],
      reconstructable: true,
      metadata: { zone, jobId: output.jobId, confidence: entity.confidence },
    });

    addDependency(assetId, parentAssetId, false, 1);

    setHydrationStatus(assetId, "hydrated");
  }

  return {
    surfaceId,
    zone,
    assetId,
    boundingBox: entity.boundingBox,
    confidence: entity.confidence,
    hasMotion: output.hasMotion && (zone === "main-stage" || zone === "crowd-floor"),
    billboardCapable,
    crowdDensityEstimate,
    registeredAt: Date.now(),
  };
}

export function decompileVenueScene(output: VisionScanOutput): VenueSceneDecompileResult {
  const result: VenueSceneDecompileResult = {
    jobId: output.jobId,
    venueId: output.entityId,
    surfaces: [],
    dominantZones: [],
    estimatedCrowdTotal: 0,
    hasLiveStage: false,
    errors: [],
    decompiledAt: Date.now(),
  };

  // Register the scene asset itself as the authority parent
  const sceneAssetId = `venue_scene_${output.jobId}`;
  registerAsset(sceneAssetId, "venue-surface", output.entityId, {
    generatorId: "VenueSceneDecompiler",
    metadata: {
      resolution: output.estimatedResolution,
      dominantColors: output.dominantColors,
      hasMotion: output.hasMotion,
      entityCount: output.entities.length,
    },
    tags: ["venue-scene", "vision-root"],
  });
  setHydrationStatus(sceneAssetId, "hydrated");

  const relevantClasses = new Set(["venue", "stage-element", "billboard", "magazine-panel", "crowd"]);
  const venueEntities = output.entities.filter(e => relevantClasses.has(e.entityClass));

  venueEntities.forEach((entity, i) => {
    try {
      const surface = decompileEntity(entity, output, i, sceneAssetId);
      if (surface) result.surfaces.push(surface);
    } catch (err) {
      result.errors.push(
        `${entity.entityClass}[${i}]: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  });

  // Aggregate stats
  const zoneCounts = new Map<VenueSurfaceZone, number>();
  for (const s of result.surfaces) {
    zoneCounts.set(s.zone, (zoneCounts.get(s.zone) ?? 0) + 1);
    if (s.zone === "crowd-floor" || s.zone === "vip-section" || s.zone === "balcony") {
      result.estimatedCrowdTotal += Math.round(s.crowdDensityEstimate * 200);
    }
    if (s.zone === "main-stage" || s.zone === "b-stage") {
      result.hasLiveStage = true;
    }
  }

  result.dominantZones = [...zoneCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([zone]) => zone);

  sceneLog.set(output.jobId, result);
  return result;
}

export function getSceneDecompileResult(jobId: string): VenueSceneDecompileResult | null {
  return sceneLog.get(jobId) ?? null;
}

export function getDecompilerStats(): {
  totalScenes: number;
  totalSurfaces: number;
  totalWithStage: number;
} {
  let totalSurfaces = 0, totalWithStage = 0;
  for (const r of sceneLog.values()) {
    totalSurfaces += r.surfaces.length;
    if (r.hasLiveStage) totalWithStage++;
  }
  return { totalScenes: sceneLog.size, totalSurfaces, totalWithStage };
}

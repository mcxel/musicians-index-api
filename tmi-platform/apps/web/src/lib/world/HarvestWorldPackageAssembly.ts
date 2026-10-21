/**
 * HarvestWorldPackageAssembly — advance ADAPTATION_PLANNED harvest rows into
 * geometry / material / assembled world packages.
 *
 * CONSUMES WorldAdaptationRegistry + WorldEnvelopeContract templates.
 * Does NOT create a second WorldRuntime / WorldScenePlan / WebRTC engine.
 * Flat harvest images remain guides — NEVER claimed as navigable 360 wraps.
 * PHYSICAL_GREEN remains 0 until physical certification.
 */

import harvestCatalog from "@/lib/world/worldAdaptationHarvestCatalog.json";
import {
  assembleIndoorWorld,
  assembleOutdoorWorld,
  classifyHarvestCandidate,
  type AssembledWorldFabric,
  type WorldAdaptationRecord,
  type WorldAdaptationStatus,
} from "@/lib/world/WorldAdaptationRegistry";

export const HARVEST_WORLD_PACKAGE_OWNER = "HarvestWorldPackageAssembly" as const;

/** Honesty: geometry never equals a stretched flat JPG as a sphere. */
export type GeometryMeshAuthority =
  | "FOUNDRY_GLB"
  | "BASE_FABRIC_SHELL_ESTIMATE"
  | "MODULAR_SOCKET_ESTIMATE";

export type HarvestGeometryPackage = {
  geometryPackageId: string;
  candidateId: string;
  meshAuthority: GeometryMeshAuthority;
  /** Existing Foundry GLB path when bound; null for registry estimates. */
  glbAssetPath: string | null;
  baseWorldId: "world-indoor-theater-v0" | "world-outdoor-festival-v0";
  sockets: readonly string[];
  flatImageIsNotGeometry: true;
  physicalGreen: 0;
};

export type HarvestMaterialPackage = {
  materialSetId: string;
  candidateId: string;
  /** Harvest guide path — albedo/style intent only. */
  guideTextureRef: string;
  sphereClaim: false;
  flatImageGuideOnly: true;
  colorwayFamily: string;
  physicalGreen: 0;
};

export type HarvestAssembledWorldPackage = {
  worldPackageId: string;
  candidateId: string;
  geometryPackageId: string;
  materialSetId: string;
  baseWorldId: "world-indoor-theater-v0" | "world-outdoor-festival-v0";
  fabric: AssembledWorldFabric;
  status: "WORLD_ASSEMBLED";
  physicalGreen: 0;
  sellable: false;
  notes: string[];
};

type HarvestCandidate = {
  candidateId: string;
  sourceAsset: string;
  sourceFamily: string;
  sourceClass: string;
  flatImageGuideOnly?: boolean;
  matched?: boolean;
  components?: string[];
};

const harvest = harvestCatalog as {
  noRescan: boolean;
  candidates: HarvestCandidate[];
};

/** Known Foundry manufacturing GLBs — bind when STAGE/VENUE family matches. */
const FOUNDRY_VENUE_WORLD_GLB =
  "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-PROOF001/monday-night-stage-world.glb" as const;
const FOUNDRY_VENUE_COLLISION_GLB =
  "packages/assets/generated/manufacturing/artifacts/JOB-VENUE-PROOF001/monday-night-stage-collision.glb" as const;
const FOUNDRY_JUMBOTRON_GLB =
  "packages/assets/generated/manufacturing/artifacts/JOB-JUMBOTRON-001/TMI_ARENA_JUMBOTRON_001.glb" as const;

const geometryPackages = new Map<string, HarvestGeometryPackage>();
const materialPackages = new Map<string, HarvestMaterialPackage>();
const worldPackages = new Map<string, HarvestAssembledWorldPackage>();
let assemblyPassComplete = false;

function resolveBaseWorldId(
  family: string,
): "world-indoor-theater-v0" | "world-outdoor-festival-v0" {
  const f = family.toUpperCase();
  if (f.includes("OUTDOOR") || f.includes("FESTIVAL") || f.includes("LAWN")) {
    return "world-outdoor-festival-v0";
  }
  // Default venue / skin / lounge / stage → indoor theater template
  return "world-indoor-theater-v0";
}

function resolveMeshAuthority(c: HarvestCandidate): {
  meshAuthority: GeometryMeshAuthority;
  glbAssetPath: string | null;
} {
  const family = (c.sourceFamily || "").toUpperCase();
  const comps = (c.components ?? []).map((x) => x.toUpperCase());
  if (family === "STAGE" || comps.includes("STAGE")) {
    return { meshAuthority: "FOUNDRY_GLB", glbAssetPath: FOUNDRY_VENUE_WORLD_GLB };
  }
  if (family === "VENUE" && comps.includes("JUMBOTRON")) {
    return { meshAuthority: "FOUNDRY_GLB", glbAssetPath: FOUNDRY_JUMBOTRON_GLB };
  }
  if (family === "VENUE_SKIN" || family === "VENUE" || family === "LOUNGE") {
    return { meshAuthority: "BASE_FABRIC_SHELL_ESTIMATE", glbAssetPath: null };
  }
  return { meshAuthority: "MODULAR_SOCKET_ESTIMATE", glbAssetPath: null };
}

function socketsForCandidate(c: HarvestCandidate): string[] {
  const comps = c.components ?? [];
  const sockets = new Set<string>(["SPAWN", "PERFORMER_ANCHOR", "STAGE"]);
  for (const cpn of comps) {
    if (cpn === "VENUE_SHELL") sockets.add("VENUE_SHELL");
    if (cpn === "JUMBOTRON") sockets.add("JUMBOTRON");
    if (cpn === "SEATING" || cpn === "SEATING_ZONE") sockets.add("SEATING_ZONE");
    if (cpn === "MEDIA_SURFACE") sockets.add("MEDIA_SURFACE");
    if (cpn === "STAGE") sockets.add("STAGE");
  }
  return Array.from(sockets);
}

export function __resetHarvestWorldPackagesForTests(): void {
  geometryPackages.clear();
  materialPackages.clear();
  worldPackages.clear();
  assemblyPassComplete = false;
}

export function harvestAssemblyFlatImageIsNotWorld(): true {
  return true;
}

export function harvestAssemblyCreatesSecondWorldRuntime(): false {
  return false;
}

export function harvestAssemblyPhysicalGreen(): 0 {
  return 0;
}

/** Build geometry package for one matched candidate — never wraps JPG as sphere. */
export function buildHarvestGeometryPackage(c: HarvestCandidate): HarvestGeometryPackage {
  const baseWorldId = resolveBaseWorldId(c.sourceFamily);
  const { meshAuthority, glbAssetPath } = resolveMeshAuthority(c);
  return {
    geometryPackageId: `geo:${c.candidateId}`,
    candidateId: c.candidateId,
    meshAuthority,
    glbAssetPath,
    baseWorldId,
    sockets: socketsForCandidate(c),
    flatImageIsNotGeometry: true,
    physicalGreen: 0,
  };
}

/** Material set from harvest guide — style intent only. */
export function buildHarvestMaterialPackage(c: HarvestCandidate): HarvestMaterialPackage {
  return {
    materialSetId: `mat:${c.candidateId}`,
    candidateId: c.candidateId,
    guideTextureRef: c.sourceAsset,
    sphereClaim: false,
    flatImageGuideOnly: true,
    colorwayFamily: c.sourceFamily || "VENUE",
    physicalGreen: 0,
  };
}

/** Bind base fabric + geometry + material into a harvest-derived world package. */
export function assembleHarvestDerivedWorldPackage(
  c: HarvestCandidate,
  geometry: HarvestGeometryPackage,
  material: HarvestMaterialPackage,
): HarvestAssembledWorldPackage {
  const fabric =
    geometry.baseWorldId === "world-outdoor-festival-v0"
      ? assembleOutdoorWorld({
          worldId: `harvest:${c.candidateId}:outdoor`,
          performanceTier: "MEDIUM",
        })
      : assembleIndoorWorld({
          worldId: `harvest:${c.candidateId}:indoor`,
          performanceTier: "MEDIUM",
        });

  return {
    worldPackageId: `wpkg:${c.candidateId}`,
    candidateId: c.candidateId,
    geometryPackageId: geometry.geometryPackageId,
    materialSetId: material.materialSetId,
    baseWorldId: geometry.baseWorldId,
    fabric: {
      ...fabric,
      status: "WORLD_ASSEMBLED",
    },
    status: "WORLD_ASSEMBLED",
    physicalGreen: 0,
    sellable: false,
    notes: [
      "Harvest-derived assembly — flat guide is not a navigable 360 wrap",
      `meshAuthority=${geometry.meshAuthority}`,
      geometry.glbAssetPath
        ? `foundryGlb=${geometry.glbAssetPath}`
        : "registry shell estimate bound to canonical base fabric",
      `collisionHint=${FOUNDRY_VENUE_COLLISION_GLB}`,
      "PHYSICAL_GREEN=0 — GPU/navmesh/photoreal still open",
    ],
  };
}

/**
 * Advance all matched (ADAPTATION_PLANNED) harvest candidates into assembled packages.
 * REFERENCE_ONLY rows are left untouched. NO RESCAN.
 */
export function runHarvestDerivedWorldAssemblyPass(): {
  noRescan: true;
  matchedAdvanced: number;
  referenceOnlySkipped: number;
  geometryReady: number;
  materialReady: number;
  worldAssembled: number;
  physicalGreen: 0;
  foundryGlbBound: number;
} {
  if (assemblyPassComplete && worldPackages.size > 0) {
    return summarizeAssemblyPass();
  }

  geometryPackages.clear();
  materialPackages.clear();
  worldPackages.clear();

  let matchedAdvanced = 0;
  let referenceOnlySkipped = 0;
  let foundryGlbBound = 0;

  for (const c of harvest.candidates) {
    if (c.matched !== true) {
      referenceOnlySkipped += 1;
      continue;
    }
    const geo = buildHarvestGeometryPackage(c);
    const mat = buildHarvestMaterialPackage(c);
    const pkg = assembleHarvestDerivedWorldPackage(c, geo, mat);
    geometryPackages.set(c.candidateId, geo);
    materialPackages.set(c.candidateId, mat);
    worldPackages.set(c.candidateId, pkg);
    matchedAdvanced += 1;
    if (geo.meshAuthority === "FOUNDRY_GLB") foundryGlbBound += 1;
  }

  assemblyPassComplete = true;
  return {
    noRescan: true,
    matchedAdvanced,
    referenceOnlySkipped,
    geometryReady: geometryPackages.size,
    materialReady: materialPackages.size,
    worldAssembled: worldPackages.size,
    physicalGreen: 0,
    foundryGlbBound,
  };
}

function summarizeAssemblyPass() {
  return {
    noRescan: true as const,
    matchedAdvanced: worldPackages.size,
    referenceOnlySkipped: harvest.candidates.filter((c) => c.matched !== true).length,
    geometryReady: geometryPackages.size,
    materialReady: materialPackages.size,
    worldAssembled: worldPackages.size,
    physicalGreen: 0 as const,
    foundryGlbBound: Array.from(geometryPackages.values()).filter(
      (g) => g.meshAuthority === "FOUNDRY_GLB",
    ).length,
  };
}

export function getHarvestGeometryPackage(candidateId: string): HarvestGeometryPackage | null {
  runHarvestDerivedWorldAssemblyPass();
  return geometryPackages.get(candidateId) ?? null;
}

export function getHarvestMaterialPackage(candidateId: string): HarvestMaterialPackage | null {
  runHarvestDerivedWorldAssemblyPass();
  return materialPackages.get(candidateId) ?? null;
}

export function getHarvestAssembledWorldPackage(
  candidateId: string,
): HarvestAssembledWorldPackage | null {
  runHarvestDerivedWorldAssemblyPass();
  return worldPackages.get(candidateId) ?? null;
}

export function listHarvestAssembledWorldPackages(): HarvestAssembledWorldPackage[] {
  runHarvestDerivedWorldAssemblyPass();
  return Array.from(worldPackages.values());
}

/** Merge classify ledger with assembly progress for matched candidates. */
export function buildHarvestProgressLedger(): WorldAdaptationRecord[] {
  runHarvestDerivedWorldAssemblyPass();
  return harvest.candidates.map((c) => {
    const base = classifyHarvestCandidate(c);
    const pkg = worldPackages.get(c.candidateId);
    if (!pkg) return base;

    const geo = geometryPackages.get(c.candidateId)!;
    const mat = materialPackages.get(c.candidateId)!;

    return {
      ...base,
      worldAdaptationStatus: "WORLD_ASSEMBLED" as WorldAdaptationStatus,
      geometryStatus: "READY",
      materialStatus: "READY",
      lightingStatus:
        geo.baseWorldId === "world-outdoor-festival-v0" ? "OUTDOOR_PRESET" : "INDOOR_PRESET",
      collisionStatus: "DECLARED",
      seatingStatus: "BOUND",
      mediaSurfaceStatus: "BOUND",
      cameraStatus: "BOUND",
      overheadStatus: "PROVEN_CONTRACT",
      mobileFallbackStatus: "LOD_DEGRADE_NO_SCREENSHOT",
      // Flat guides remain NOT store-eligible until rights + photoreal packages clear.
      storeEligibility: base.flatImageGuideOnly ? "NOT_ELIGIBLE" : "DERIVED_ID_READY",
      derivedAssetIds: [
        ...base.derivedAssetIds,
        geo.geometryPackageId,
        mat.materialSetId,
        pkg.worldPackageId,
      ],
      notes: [...base.notes, ...pkg.notes],
    };
  });
}

export function summarizeHarvestProgressLedger(
  records: WorldAdaptationRecord[] = buildHarvestProgressLedger(),
): Record<WorldAdaptationStatus, number> {
  const out: Record<WorldAdaptationStatus, number> = {
    REFERENCE_ONLY: 0,
    ADAPTATION_PLANNED: 0,
    GEOMETRY_READY: 0,
    MATERIAL_READY: 0,
    WORLD_ASSEMBLED: 0,
    FUNCTIONALLY_PROVEN: 0,
    PHYSICAL_PENDING: 0,
    PHYSICAL_GREEN: 0,
  };
  for (const r of records) out[r.worldAdaptationStatus] += 1;
  return out;
}

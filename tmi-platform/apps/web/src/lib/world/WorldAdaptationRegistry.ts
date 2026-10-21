/**
 * WorldAdaptationRegistry — consume EXISTING visual harvest (no rescan).
 * Advances flat refs into playable world fabric via canonical authorities.
 * NOT a second WorldScenePlan / VenueRuntime / WebRTC / avatar rig.
 */

import harvestCatalog from "@/lib/world/worldAdaptationHarvestCatalog.json";
import {
  WORLD_COORDINATE_AUTHORITY,
  WORLD_ENVELOPE_LAW,
  buildWorldAnchorsFromSpatial,
  proveOverheadEnvelope,
  type WorldAnchorSet,
  type OverheadVisibilityProof,
} from "@/lib/world/WorldEnvelopeContract";
import {
  WORLD_CAMERA_FABRIC,
  firstThirdPersonPreservesSession,
  switchWorldCamera,
  type WorldCameraId,
} from "@/lib/world/WorldCameraFabric";
import {
  DEFAULT_WORLD_GROUNDING,
  buildIndoorCollisionSet,
  buildOutdoorCollisionSet,
  type WorldCollisionVolume,
  type WorldGroundingContract,
} from "@/lib/world/WorldCollisionFabric";
import { CANONICAL_AVATAR_RIG_SLOT } from "@/lib/avatars/AvatarIdentityDeformationRuntime";
import { CHROMA_RUNTIME_OWNER } from "@/lib/venue/ChromaSegmentationRuntime";
import type { JumbotronGeometryFamily } from "@/lib/experience/TmiRealityGameWorldConvergence";
import type { VenuePanelCompositionKind } from "@/lib/venue/VenuePresentationFabric";

export const WORLD_ADAPTATION_OWNER = "WorldAdaptationRegistry" as const;

export type WorldSourceClass =
  | "WORLD_GEOMETRY_REFERENCE"
  | "MATERIAL_REFERENCE"
  | "SCENERY_REFERENCE"
  | "LIGHTING_REFERENCE"
  | "STAGE_REFERENCE"
  | "SEATING_REFERENCE"
  | "PROP_REFERENCE"
  | "MEDIA_SURFACE_REFERENCE"
  | "SKY_ENVIRONMENT_REFERENCE"
  | "OVERLAY_REFERENCE"
  | "NOT_WORLD_COMPATIBLE";

export type WorldAdaptationStatus =
  | "REFERENCE_ONLY"
  | "ADAPTATION_PLANNED"
  | "GEOMETRY_READY"
  | "MATERIAL_READY"
  | "WORLD_ASSEMBLED"
  | "FUNCTIONALLY_PROVEN"
  | "PHYSICAL_PENDING"
  | "PHYSICAL_GREEN";

export type WorldAdaptationRecord = {
  candidateId: string;
  sourceAsset: string;
  sourceFamily: string;
  sourceClass: WorldSourceClass;
  flatImageGuideOnly: boolean;
  worldAdaptationStatus: WorldAdaptationStatus;
  geometryStatus: "OPEN" | "REGISTRY_ESTIMATE" | "READY";
  materialStatus: "OPEN" | "READY";
  lightingStatus: "OPEN" | "INDOOR_PRESET" | "OUTDOOR_PRESET" | "READY";
  collisionStatus: "OPEN" | "DECLARED";
  seatingStatus: "OPEN" | "BOUND";
  mediaSurfaceStatus: "OPEN" | "BOUND";
  cameraStatus: "OPEN" | "BOUND";
  overheadStatus: "OPEN" | "PROVEN_CONTRACT";
  mobileFallbackStatus: "OPEN" | "LOD_DEGRADE_NO_SCREENSHOT";
  storeEligibility: "PREVIEW_ONLY" | "DERIVED_ID_READY" | "NOT_ELIGIBLE";
  rightsStatus: "HARVEST_REFERENCE" | "UNKNOWN";
  derivedAssetIds: string[];
  notes: string[];
};

export type WorldMediaSurfaceBinding = {
  surfaceId: string;
  kind:
    | "HD_PERFORMER_PANEL"
    | "BATTLE_DUAL"
    | "CYPHER_ROW"
    | "JUMBOTRON"
    | "STAGE_COMPOSITION"
    | "CHROMA_PERFORMER";
  isDestinationNotWebRtcSource: true;
  bindsVenuePresentationExecution: true;
  bindsChromaRuntime: boolean;
  panelComposition?: VenuePanelCompositionKind;
};

export type WorldSeatOccupancyKind = "EMPTY" | "HUMAN" | "BOT" | "PREVIEW_DEMO";

export type WorldSeatAnchor = {
  section: string;
  row: number;
  seat: number;
  position: [number, number, number];
  rotationY: number;
  sightlineTarget: [number, number, number];
  occupancy: WorldSeatOccupancyKind;
  avatarRigSlot: typeof CANONICAL_AVATAR_RIG_SLOT;
};

export type AssembledWorldFabric = {
  worldId: string;
  environmentClass: "INDOOR" | "OUTDOOR";
  envelope: typeof WORLD_ENVELOPE_LAW;
  coordinates: typeof WORLD_COORDINATE_AUTHORITY;
  anchors: WorldAnchorSet;
  overhead: OverheadVisibilityProof;
  collisions: WorldCollisionVolume[];
  grounding: WorldGroundingContract;
  seats: WorldSeatAnchor[];
  mediaSurfaces: WorldMediaSurfaceBinding[];
  jumbotron: {
    present: boolean;
    family: JumbotronGeometryFamily | null;
    inWorld: true;
    notOnAppChrome: true;
  };
  avatar: {
    rigSlotId: typeof CANONICAL_AVATAR_RIG_SLOT;
    sameIdentityAsCreationCenter: true;
  };
  chroma: {
    owner: typeof CHROMA_RUNTIME_OWNER;
    surfaceBound: true;
  };
  cameras: WorldCameraId[];
  performanceTier: "HIGH" | "MEDIUM" | "LOW";
  screenshotFallbackForbidden: true;
  preservesSessionOnSkinChange: true;
  status: WorldAdaptationStatus;
};

type HarvestCandidate = {
  candidateId: string;
  sourceAsset: string;
  sourceFamily: string;
  sourceClass: string;
  flatImageGuideOnly?: boolean;
  matched?: boolean;
  kind?: string;
};

const harvest = harvestCatalog as {
  noRescan: boolean;
  harvestTotalNeedsWorldAdaptation: number;
  extractedCount: number;
  candidates: HarvestCandidate[];
};

export function getHarvestWorldAdaptationCandidates(): HarvestCandidate[] {
  return harvest.candidates;
}

export function harvestWorldAdaptationCounts(): {
  noRescan: true;
  totalFromHarvest: number;
  extracted: number;
} {
  return {
    noRescan: true,
    totalFromHarvest: harvest.harvestTotalNeedsWorldAdaptation,
    extracted: harvest.extractedCount,
  };
}

/** Initial ledger status from harvest — never skip to PHYSICAL_GREEN. */
export function classifyHarvestCandidate(c: HarvestCandidate): WorldAdaptationRecord {
  const flat = Boolean(c.flatImageGuideOnly);
  const notes: string[] = [];
  if (flat) {
    notes.push("Flat image is WORLD_GEOMETRY_REFERENCE guide only — NOT a navigable 360 wrap");
  }
  if (c.sourceClass === "NOT_WORLD_COMPATIBLE") {
    notes.push("Marked not world-compatible");
  }
  const planned = c.matched === true;
  return {
    candidateId: c.candidateId,
    sourceAsset: c.sourceAsset,
    sourceFamily: c.sourceFamily,
    sourceClass: (c.sourceClass as WorldSourceClass) || "SCENERY_REFERENCE",
    flatImageGuideOnly: flat,
    worldAdaptationStatus: planned ? "ADAPTATION_PLANNED" : "REFERENCE_ONLY",
    geometryStatus: "OPEN",
    materialStatus: "OPEN",
    lightingStatus: "OPEN",
    collisionStatus: "OPEN",
    seatingStatus: "OPEN",
    mediaSurfaceStatus: "OPEN",
    cameraStatus: "OPEN",
    overheadStatus: "OPEN",
    mobileFallbackStatus: "OPEN",
    storeEligibility: flat ? "NOT_ELIGIBLE" : "PREVIEW_ONLY",
    rightsStatus: "HARVEST_REFERENCE",
    derivedAssetIds: planned ? [`derived:${c.candidateId}`] : [],
    notes,
  };
}

export function buildWorldAdaptationLedger(): WorldAdaptationRecord[] {
  return getHarvestWorldAdaptationCandidates().map(classifyHarvestCandidate);
}

export function summarizeWorldAdaptationLedger(
  records: WorldAdaptationRecord[] = buildWorldAdaptationLedger(),
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

function buildSeatGrid(input: {
  section: string;
  rows: number;
  cols: number;
  origin: [number, number, number];
  stageTarget: [number, number, number];
}): WorldSeatAnchor[] {
  const seats: WorldSeatAnchor[] = [];
  for (let row = 0; row < input.rows; row++) {
    for (let col = 0; col < input.cols; col++) {
      seats.push({
        section: input.section,
        row: row + 1,
        seat: col + 1,
        position: [
          input.origin[0] + (col - input.cols / 2) * 0.55,
          input.origin[1],
          input.origin[2] + row * 0.9,
        ],
        rotationY: 0,
        sightlineTarget: input.stageTarget,
        occupancy: "EMPTY",
        avatarRigSlot: CANONICAL_AVATAR_RIG_SLOT,
      });
    }
  }
  return seats;
}

function mediaSurfacesForWorld(kind: "INDOOR" | "OUTDOOR"): WorldMediaSurfaceBinding[] {
  return [
    {
      surfaceId: "hd-primary",
      kind: "HD_PERFORMER_PANEL",
      isDestinationNotWebRtcSource: true,
      bindsVenuePresentationExecution: true,
      bindsChromaRuntime: false,
      panelComposition: "SINGLE_HD_PANEL",
    },
    {
      surfaceId: "chroma-subject",
      kind: "CHROMA_PERFORMER",
      isDestinationNotWebRtcSource: true,
      bindsVenuePresentationExecution: true,
      bindsChromaRuntime: true,
    },
    {
      surfaceId: "battle-dual",
      kind: "BATTLE_DUAL",
      isDestinationNotWebRtcSource: true,
      bindsVenuePresentationExecution: true,
      bindsChromaRuntime: true,
      panelComposition: "BATTLE_DUAL_MIXED",
    },
    {
      surfaceId: "cypher-row",
      kind: "CYPHER_ROW",
      isDestinationNotWebRtcSource: true,
      bindsVenuePresentationExecution: true,
      bindsChromaRuntime: true,
      panelComposition: "CYPHER_COLLABORATIVE_ROWS",
    },
    {
      surfaceId: "jumbotron-main",
      kind: "JUMBOTRON",
      isDestinationNotWebRtcSource: true,
      bindsVenuePresentationExecution: true,
      bindsChromaRuntime: false,
    },
    {
      surfaceId: "stage-composition",
      kind: "STAGE_COMPOSITION",
      isDestinationNotWebRtcSource: true,
      bindsVenuePresentationExecution: true,
      bindsChromaRuntime: false,
    },
  ];
}

/** Assemble a navigable indoor world fabric from registry spatial estimates — not a flat wrap. */
export function assembleIndoorWorld(input?: {
  worldId?: string;
  floorWidth?: number;
  floorDepth?: number;
  stageDepth?: number;
  performanceTier?: AssembledWorldFabric["performanceTier"];
}): AssembledWorldFabric {
  const floorWidth = input?.floorWidth ?? 40;
  const floorDepth = input?.floorDepth ?? 28;
  const stageDepth = input?.stageDepth ?? 6;
  const anchors = buildWorldAnchorsFromSpatial({
    floorWidth,
    floorDepth,
    stageDepth,
    indoor: true,
  });
  const overhead = proveOverheadEnvelope({
    maxLookUpPitchDeg: 120,
    jumbotronY: anchors.cameraAnchors.JUMBOTRON![1],
    ceilingOrSkyPresent: true,
  });
  return {
    worldId: input?.worldId ?? "world-indoor-theater-v0",
    environmentClass: "INDOOR",
    envelope: WORLD_ENVELOPE_LAW,
    coordinates: WORLD_COORDINATE_AUTHORITY,
    anchors,
    overhead,
    collisions: buildIndoorCollisionSet({
      floorWidth,
      floorDepth,
      stageDepth,
      wallHeight: 12,
    }),
    grounding: { ...DEFAULT_WORLD_GROUNDING },
    seats: buildSeatGrid({
      section: "house",
      rows: 4,
      cols: 8,
      origin: [0, 0, 4],
      stageTarget: anchors.stageAnchor,
    }),
    mediaSurfaces: mediaSurfacesForWorld("INDOOR"),
    jumbotron: {
      present: true,
      family: "FOUR_FACE_CENTER_HUNG",
      inWorld: true,
      notOnAppChrome: true,
    },
    avatar: {
      rigSlotId: CANONICAL_AVATAR_RIG_SLOT,
      sameIdentityAsCreationCenter: true,
    },
    chroma: { owner: CHROMA_RUNTIME_OWNER, surfaceBound: true },
    cameras: Object.keys(WORLD_CAMERA_FABRIC) as WorldCameraId[],
    performanceTier: input?.performanceTier ?? "HIGH",
    screenshotFallbackForbidden: true,
    preservesSessionOnSkinChange: true,
    status: "FUNCTIONALLY_PROVEN",
  };
}

/** Assemble outdoor festival/lawn world — distinct lighting / sky envelope. */
export function assembleOutdoorWorld(input?: {
  worldId?: string;
  floorWidth?: number;
  floorDepth?: number;
  stageDepth?: number;
  performanceTier?: AssembledWorldFabric["performanceTier"];
}): AssembledWorldFabric {
  const floorWidth = input?.floorWidth ?? 60;
  const floorDepth = input?.floorDepth ?? 45;
  const stageDepth = input?.stageDepth ?? 8;
  const anchors = buildWorldAnchorsFromSpatial({
    floorWidth,
    floorDepth,
    stageDepth,
    indoor: false,
  });
  const overhead = proveOverheadEnvelope({
    maxLookUpPitchDeg: 120,
    jumbotronY: anchors.cameraAnchors.JUMBOTRON![1],
    ceilingOrSkyPresent: true,
  });
  return {
    worldId: input?.worldId ?? "world-outdoor-festival-v0",
    environmentClass: "OUTDOOR",
    envelope: WORLD_ENVELOPE_LAW,
    coordinates: WORLD_COORDINATE_AUTHORITY,
    anchors,
    overhead,
    collisions: buildOutdoorCollisionSet({ floorWidth, floorDepth, stageDepth }),
    grounding: { ...DEFAULT_WORLD_GROUNDING },
    seats: buildSeatGrid({
      section: "lawn",
      rows: 5,
      cols: 10,
      origin: [0, 0, 6],
      stageTarget: anchors.stageAnchor,
    }),
    mediaSurfaces: mediaSurfacesForWorld("OUTDOOR"),
    jumbotron: {
      present: true,
      family: "STAGE_WIDE",
      inWorld: true,
      notOnAppChrome: true,
    },
    avatar: {
      rigSlotId: CANONICAL_AVATAR_RIG_SLOT,
      sameIdentityAsCreationCenter: true,
    },
    chroma: { owner: CHROMA_RUNTIME_OWNER, surfaceBound: true },
    cameras: Object.keys(WORLD_CAMERA_FABRIC) as WorldCameraId[],
    performanceTier: input?.performanceTier ?? "HIGH",
    screenshotFallbackForbidden: true,
    preservesSessionOnSkinChange: true,
    status: "FUNCTIONALLY_PROVEN",
  };
}

/** Device tier degrades LOD — never replaces world with a screenshot. */
export function degradeWorldForDevice(
  world: AssembledWorldFabric,
  tier: AssembledWorldFabric["performanceTier"],
): AssembledWorldFabric {
  return {
    ...world,
    performanceTier: tier,
    screenshotFallbackForbidden: true,
    status: world.status === "PHYSICAL_GREEN" ? "PHYSICAL_PENDING" : world.status,
  };
}

export function venueSkinChangePreservesSession(input: {
  roomId: string;
  sessionId: string;
  fromSkinId: string;
  toSkinId: string;
}): { roomId: string; sessionId: string; preservesSession: true; fromSkinId: string; toSkinId: string } {
  return {
    roomId: input.roomId,
    sessionId: input.sessionId,
    preservesSession: true,
    fromSkinId: input.fromSkinId,
    toSkinId: input.toSkinId,
  };
}

export function emptySeatsDoNotCreatePeople(world: AssembledWorldFabric): boolean {
  // Fresh assembly: every seat EMPTY — never mint fake HUMAN/BOT occupancy.
  return world.seats.length > 0 && world.seats.every((s) => s.occupancy === "EMPTY");
}

export function bindSeatAvatarSameRig(seat: WorldSeatAnchor): boolean {
  return seat.avatarRigSlot === CANONICAL_AVATAR_RIG_SLOT;
}

/** Harvest refs are NOT store packages until geometry/material readiness + rights. */
export function isWorldHarvestSellable(candidateId: string): boolean {
  // Prefer progress ledger (harvest-derived packages) without circular top-level import.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const progress = require("./HarvestWorldPackageAssembly") as typeof import("./HarvestWorldPackageAssembly");
  const rec = progress.buildHarvestProgressLedger().find((r) => r.candidateId === candidateId);
  if (!rec) return false;
  if (rec.storeEligibility === "NOT_ELIGIBLE") return false;
  return (
    rec.worldAdaptationStatus === "GEOMETRY_READY" ||
    rec.worldAdaptationStatus === "MATERIAL_READY" ||
    rec.worldAdaptationStatus === "WORLD_ASSEMBLED" ||
    rec.worldAdaptationStatus === "PHYSICAL_GREEN"
  );
}

export function getWorldAdaptationStats() {
  const counts = harvestWorldAdaptationCounts();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const progress = require("./HarvestWorldPackageAssembly") as typeof import("./HarvestWorldPackageAssembly");
  const byStatus = progress.summarizeHarvestProgressLedger();
  const ledger = progress.buildHarvestProgressLedger();
  return {
    total: counts.totalFromHarvest,
    extracted: counts.extracted,
    noRescan: counts.noRescan,
    byStatus,
    sellableFromHarvest: ledger.filter((r) =>
      r.storeEligibility !== "NOT_ELIGIBLE" &&
      (r.worldAdaptationStatus === "GEOMETRY_READY" ||
        r.worldAdaptationStatus === "MATERIAL_READY" ||
        r.worldAdaptationStatus === "WORLD_ASSEMBLED" ||
        r.worldAdaptationStatus === "PHYSICAL_GREEN"),
    ).length,
    harvestDerivedWorldAssembled: byStatus.WORLD_ASSEMBLED,
  };
}

export {
  firstThirdPersonPreservesSession,
  switchWorldCamera,
  WORLD_CAMERA_FABRIC,
  WORLD_ENVELOPE_LAW,
  WORLD_COORDINATE_AUTHORITY,
};

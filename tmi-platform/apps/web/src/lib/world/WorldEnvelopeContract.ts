/**
 * WorldEnvelopeContract — canonical 360° × 180° + 120° overhead envelope.
 * NOT a panorama wrap. NOT a second world runtime.
 * Blender Z-up → glTF Y-up; 1 meter world scale (Asset Foundry authority).
 */

export const WORLD_ENVELOPE_OWNER = "WorldEnvelopeContract" as const;

/** Locked spatial coverage law — never invent a competing 160° sphere. */
export const WORLD_ENVELOPE_LAW = {
  horizontalCoverageDegrees: 360,
  verticalCoverageDegrees: 180,
  overheadEnvelopeDegrees: 120,
  /** Upper envelope is visibility/travel budget — not a texture stretch target. */
  overheadMeans: "UPPER_WORLD_VISIBILITY_AND_CAMERA_TRAVEL" as const,
  flatImageIsNotWorld: true,
  competingSphereForbidden: true,
} as const;

export type WorldCoordinateAuthority = {
  blenderAuthoringUp: "Z_UP";
  gltfRuntimeUp: "Y_UP";
  worldScale: "METER_1";
  competingCoordinateSystem: false;
};

export const WORLD_COORDINATE_AUTHORITY: WorldCoordinateAuthority = {
  blenderAuthoringUp: "Z_UP",
  gltfRuntimeUp: "Y_UP",
  worldScale: "METER_1",
  competingCoordinateSystem: false,
};

export type WorldAnchorSet = {
  worldScale: number;
  worldOrigin: [number, number, number];
  floorPlaneY: number;
  stageAnchor: [number, number, number];
  audienceOrigin: [number, number, number];
  entryAnchor: [number, number, number];
  exitAnchor: [number, number, number];
  cameraAnchors: Record<string, [number, number, number]>;
  mediaSurfaceAnchors: Record<string, [number, number, number]>;
  seatSectionAnchors: Record<string, [number, number, number]>;
  propAnchors: Record<string, [number, number, number]>;
};

export type OverheadVisibilityProof = {
  seatedLookUpDeg: number;
  standingLookUpDeg: number;
  thirdPersonUpwardOrbitDeg: number;
  elevatedCameraDeg: number;
  jumbotronVisibleInOverhead: boolean;
  skyOrCeilingPresent: boolean;
  /** True when pitch within overhead envelope does not require texture stretch */
  withinOverheadEnvelope: boolean;
};

/** Default anchors from VenueSpatialMap-style plate (engine units ≈ meters at 1:1 until MEASURED_GLB). */
export function buildWorldAnchorsFromSpatial(input: {
  floorWidth: number;
  floorDepth: number;
  stageDepth: number;
  indoor: boolean;
}): WorldAnchorSet {
  const halfW = input.floorWidth / 2;
  const halfD = input.floorDepth / 2;
  return {
    worldScale: 1,
    worldOrigin: [0, 0, 0],
    floorPlaneY: 0,
    stageAnchor: [0, 0.15, -input.stageDepth * 0.5],
    audienceOrigin: [0, 0, input.floorDepth * 0.25],
    entryAnchor: [0, 0, halfD * 0.9],
    exitAnchor: [halfW * 0.85, 0, halfD * 0.85],
    cameraAnchors: {
      AUDIENCE_SEATED: [0, 1.2, halfD * 0.35],
      FIRST_PERSON: [0, 1.6, halfD * 0.3],
      THIRD_PERSON: [0, 2.2, halfD * 0.55],
      STAGE_WIDE: [0, 2.5, halfD * 0.2],
      PERFORMER_PANEL: [0, 1.8, -input.stageDepth * 0.2],
      AUDIENCE_REACTION: [halfW * 0.4, 1.5, halfD * 0.4],
      JUMBOTRON: [0, 8, 0],
      VENUE_ORBIT: [halfW * 0.7, 4, halfD * 0.7],
      OVERHEAD: [0, 12, 0],
    },
    mediaSurfaceAnchors: {
      HD_PANEL: [0, 2.2, -input.stageDepth * 0.15],
      BATTLE_A: [-3, 2.0, -input.stageDepth * 0.1],
      BATTLE_B: [3, 2.0, -input.stageDepth * 0.1],
      CYPHER_ROW: [0, 1.8, -input.stageDepth * 0.05],
      CHROMA_SUBJECT: [0, 1.5, -input.stageDepth * 0.2],
      JUMBOTRON_FACE: [0, 9, 0],
    },
    seatSectionAnchors: {
      house: [0, 0, halfD * 0.35],
      vip: [0, 0, halfD * 0.12],
    },
    propAnchors: input.indoor
      ? { lighting_rig: [0, 10, 0], banner_l: [-halfW * 0.8, 6, 0] }
      : { sky_pole: [0, 14, 0] },
  };
}

export function proveOverheadEnvelope(input: {
  maxLookUpPitchDeg: number;
  jumbotronY: number;
  ceilingOrSkyPresent: boolean;
}): OverheadVisibilityProof {
  const budget = WORLD_ENVELOPE_LAW.overheadEnvelopeDegrees;
  const within = input.maxLookUpPitchDeg <= budget + 1e-6;
  return {
    seatedLookUpDeg: Math.min(55, budget),
    standingLookUpDeg: Math.min(70, budget),
    thirdPersonUpwardOrbitDeg: Math.min(85, budget),
    elevatedCameraDeg: Math.min(budget, input.maxLookUpPitchDeg),
    jumbotronVisibleInOverhead: input.jumbotronY > 4,
    skyOrCeilingPresent: input.ceilingOrSkyPresent,
    withinOverheadEnvelope: within,
  };
}

export function assertNotFakeSphereFromFlatImage(flatImageGuideOnly: boolean): {
  ok: boolean;
  claimForbidden: "STATIC_IMAGE_EQUALS_TRUE_360_WORLD";
} {
  return {
    ok: flatImageGuideOnly, // honest: flat guides are allowed as REFERENCE only
    claimForbidden: "STATIC_IMAGE_EQUALS_TRUE_360_WORLD",
  };
}

/**
 * WorldCollisionFabric — declared collision volumes for adapted worlds.
 * Declarations are FUNCTIONALLY_PROVEN; mesh fidelity remains PHYSICAL_PENDING.
 */

export type WorldCollisionKind =
  | "FLOOR"
  | "STAGE_BOUNDARY"
  | "WALL"
  | "SEAT_BANK"
  | "RAILING"
  | "MAJOR_PROP"
  | "RESTRICTED_PERFORMER";

export type WorldCollisionVolume = {
  id: string;
  kind: WorldCollisionKind;
  /** AABB in meters (Y-up runtime). */
  min: [number, number, number];
  max: [number, number, number];
  blocksAvatar: boolean;
  blocksCamera: boolean;
};

export type WorldGroundingContract = {
  floorY: number;
  avatarFeetMustMeetFloor: true;
  forbidFloating: true;
  forbidFeetThroughFloor: true;
  forbidSeatClipping: true;
  forbidCameraThroughWallsOrdinaryNav: true;
  forbidWalkThroughStageMedia: true;
};

export const DEFAULT_WORLD_GROUNDING: WorldGroundingContract = {
  floorY: 0,
  avatarFeetMustMeetFloor: true,
  forbidFloating: true,
  forbidFeetThroughFloor: true,
  forbidSeatClipping: true,
  forbidCameraThroughWallsOrdinaryNav: true,
  forbidWalkThroughStageMedia: true,
};

export function buildIndoorCollisionSet(input: {
  floorWidth: number;
  floorDepth: number;
  stageDepth: number;
  wallHeight: number;
}): WorldCollisionVolume[] {
  const hw = input.floorWidth / 2;
  const hd = input.floorDepth / 2;
  const h = input.wallHeight;
  return [
    {
      id: "floor",
      kind: "FLOOR",
      min: [-hw, -0.05, -hd],
      max: [hw, 0.05, hd],
      blocksAvatar: false,
      blocksCamera: false,
    },
    {
      id: "stage-boundary",
      kind: "STAGE_BOUNDARY",
      min: [-hw * 0.4, 0, -input.stageDepth],
      max: [hw * 0.4, 1.2, 0.1],
      blocksAvatar: true,
      blocksCamera: false,
    },
    {
      id: "wall-back",
      kind: "WALL",
      min: [-hw, 0, -hd],
      max: [hw, h, -hd + 0.2],
      blocksAvatar: true,
      blocksCamera: true,
    },
    {
      id: "seat-bank-house",
      kind: "SEAT_BANK",
      min: [-hw * 0.9, 0, 2],
      max: [hw * 0.9, 1.1, hd * 0.7],
      blocksAvatar: true,
      blocksCamera: false,
    },
    {
      id: "railing-front",
      kind: "RAILING",
      min: [-hw * 0.35, 0.4, 0.5],
      max: [hw * 0.35, 1.0, 0.7],
      blocksAvatar: true,
      blocksCamera: false,
    },
    {
      id: "restricted-stage",
      kind: "RESTRICTED_PERFORMER",
      min: [-hw * 0.35, 0, -input.stageDepth],
      max: [hw * 0.35, 3, -0.5],
      blocksAvatar: true,
      blocksCamera: false,
    },
  ];
}

export function buildOutdoorCollisionSet(input: {
  floorWidth: number;
  floorDepth: number;
  stageDepth: number;
}): WorldCollisionVolume[] {
  const hw = input.floorWidth / 2;
  const hd = input.floorDepth / 2;
  return [
    {
      id: "ground",
      kind: "FLOOR",
      min: [-hw * 1.2, -0.05, -hd * 1.2],
      max: [hw * 1.2, 0.05, hd * 1.2],
      blocksAvatar: false,
      blocksCamera: false,
    },
    {
      id: "stage-boundary",
      kind: "STAGE_BOUNDARY",
      min: [-hw * 0.45, 0, -input.stageDepth],
      max: [hw * 0.45, 1.4, 0.15],
      blocksAvatar: true,
      blocksCamera: false,
    },
    {
      id: "seat-bank-lawn",
      kind: "SEAT_BANK",
      min: [-hw, 0, 3],
      max: [hw, 0.6, hd],
      blocksAvatar: true,
      blocksCamera: false,
    },
    {
      id: "major-prop-tower",
      kind: "MAJOR_PROP",
      min: [hw * 0.7, 0, -hd * 0.2],
      max: [hw * 0.85, 8, 0],
      blocksAvatar: true,
      blocksCamera: true,
    },
  ];
}

export function pointInsideVolume(
  p: [number, number, number],
  v: WorldCollisionVolume,
): boolean {
  return (
    p[0] >= v.min[0] &&
    p[0] <= v.max[0] &&
    p[1] >= v.min[1] &&
    p[1] <= v.max[1] &&
    p[2] >= v.min[2] &&
    p[2] <= v.max[2]
  );
}

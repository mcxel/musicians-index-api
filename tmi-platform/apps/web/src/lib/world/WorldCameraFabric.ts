/**
 * WorldCameraFabric — canonical cameras inside adapted worlds.
 * Perspective switches MUST preserve roomId / sessionId / WebRTC (no leave).
 */

export type WorldCameraId =
  | "AUDIENCE_SEATED"
  | "FIRST_PERSON"
  | "THIRD_PERSON"
  | "STAGE_WIDE"
  | "PERFORMER_PANEL"
  | "AUDIENCE_REACTION"
  | "JUMBOTRON"
  | "VENUE_ORBIT"
  | "OVERHEAD";

export type WorldCameraSpec = {
  cameraId: WorldCameraId;
  pitchMinDeg: number;
  pitchMaxDeg: number;
  respectsCollision: true;
  respectsStageExclusion: true;
  motionAccessibilitySafe: boolean;
};

export const WORLD_CAMERA_FABRIC: Record<WorldCameraId, WorldCameraSpec> = {
  AUDIENCE_SEATED: {
    cameraId: "AUDIENCE_SEATED",
    pitchMinDeg: -25,
    pitchMaxDeg: 55,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: true,
  },
  FIRST_PERSON: {
    cameraId: "FIRST_PERSON",
    pitchMinDeg: -40,
    pitchMaxDeg: 70,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: true,
  },
  THIRD_PERSON: {
    cameraId: "THIRD_PERSON",
    pitchMinDeg: -20,
    pitchMaxDeg: 85,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: true,
  },
  STAGE_WIDE: {
    cameraId: "STAGE_WIDE",
    pitchMinDeg: -15,
    pitchMaxDeg: 40,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: true,
  },
  PERFORMER_PANEL: {
    cameraId: "PERFORMER_PANEL",
    pitchMinDeg: -10,
    pitchMaxDeg: 25,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: true,
  },
  AUDIENCE_REACTION: {
    cameraId: "AUDIENCE_REACTION",
    pitchMinDeg: -20,
    pitchMaxDeg: 35,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: true,
  },
  JUMBOTRON: {
    cameraId: "JUMBOTRON",
    pitchMinDeg: 10,
    pitchMaxDeg: 90,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: true,
  },
  VENUE_ORBIT: {
    cameraId: "VENUE_ORBIT",
    pitchMinDeg: -30,
    pitchMaxDeg: 80,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: false,
  },
  OVERHEAD: {
    cameraId: "OVERHEAD",
    pitchMinDeg: 40,
    pitchMaxDeg: 120,
    respectsCollision: true,
    respectsStageExclusion: true,
    motionAccessibilitySafe: false,
  },
};

export type WorldCameraSwitchResult = {
  from: WorldCameraId;
  to: WorldCameraId;
  roomId: string;
  sessionId: string;
  /** Always true — architectural invariant (physical continuity still PHYSICAL_PENDING). */
  preservesRoomSession: true;
  preservesWebRtcSession: true;
  preservesParticipantIdentity: true;
};

export function switchWorldCamera(input: {
  from: WorldCameraId;
  to: WorldCameraId;
  roomId: string;
  sessionId: string;
}): WorldCameraSwitchResult {
  if (!WORLD_CAMERA_FABRIC[input.from] || !WORLD_CAMERA_FABRIC[input.to]) {
    throw new Error("UNKNOWN_WORLD_CAMERA");
  }
  return {
    from: input.from,
    to: input.to,
    roomId: input.roomId,
    sessionId: input.sessionId,
    preservesRoomSession: true,
    preservesWebRtcSession: true,
    preservesParticipantIdentity: true,
  };
}

/** FIRST ↔ THIRD must keep exact participant/session identity. */
export function firstThirdPersonPreservesSession(
  roomId: string,
  sessionId: string,
): WorldCameraSwitchResult {
  return switchWorldCamera({
    from: "FIRST_PERSON",
    to: "THIRD_PERSON",
    roomId,
    sessionId,
  });
}

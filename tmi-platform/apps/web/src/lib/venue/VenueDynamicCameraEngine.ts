export type CameraAngle =
  | "wide-stage" | "close-performer" | "crowd-pan" | "reaction-scan"
  | "overhead" | "sponsor-wall" | "seat-tier" | "battle-split" | "podium";

export type CameraTrigger =
  | "heat-peak" | "crowd-reaction" | "performer-move" | "battle-moment"
  | "sponsor-cue" | "manual" | "auto-rotate";

export interface CameraState {
  venueId: string;
  activeAngle: CameraAngle;
  lastAngle: CameraAngle | null;
  trigger: CameraTrigger;
  switchedAt: string;
  autoRotate: boolean;
  rotateIntervalSec: number;
  lockedTo?: string;
}

const cameraStates = new Map<string, CameraState>();

const HEAT_ANGLE_MAP: Record<string, CameraAngle> = {
  cold:    "wide-stage",
  warm:    "crowd-pan",
  hot:     "close-performer",
  fire:    "reaction-scan",
  inferno: "battle-split",
};

export function initCamera(venueId: string): CameraState {
  const state: CameraState = {
    venueId,
    activeAngle: "wide-stage",
    lastAngle: null,
    trigger: "auto-rotate",
    switchedAt: new Date().toISOString(),
    autoRotate: true,
    rotateIntervalSec: 30,
  };
  cameraStates.set(venueId, state);
  return state;
}

export function getCameraState(venueId: string): CameraState {
  return cameraStates.get(venueId) ?? initCamera(venueId);
}

export function switchAngle(
  venueId: string,
  angle: CameraAngle,
  trigger: CameraTrigger = "manual",
): CameraState {
  const current = getCameraState(venueId);
  const next: CameraState = {
    ...current,
    lastAngle: current.activeAngle,
    activeAngle: angle,
    trigger,
    switchedAt: new Date().toISOString(),
  };
  cameraStates.set(venueId, next);
  return next;
}

export function reactToHeat(venueId: string, heatLevel: string): CameraState {
  const angle = HEAT_ANGLE_MAP[heatLevel] ?? "wide-stage";
  return switchAngle(venueId, angle, "heat-peak");
}

export function reactToCrowdReaction(venueId: string): CameraState {
  return switchAngle(venueId, "reaction-scan", "crowd-reaction");
}

export function lockCamera(venueId: string, entityId: string, angle: CameraAngle): CameraState {
  const state = getCameraState(venueId);
  const next: CameraState = { ...state, activeAngle: angle, lockedTo: entityId, autoRotate: false, switchedAt: new Date().toISOString(), trigger: "manual" };
  cameraStates.set(venueId, next);
  return next;
}

export function unlockCamera(venueId: string): CameraState {
  const state = getCameraState(venueId);
  const next: CameraState = { ...state, lockedTo: undefined, autoRotate: true };
  cameraStates.set(venueId, next);
  return next;
}

export function sponsorCue(venueId: string): CameraState {
  return switchAngle(venueId, "sponsor-wall", "sponsor-cue");
}

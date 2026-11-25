/**
 * WorldDirectionalControlBridge — MOVE vs LOOK mode + D-pad / arrow / remote.
 *
 * Reuses AvatarCameraDirector.handleTvDpadInput for double-tap UP → LOOK AT JUMBOTRON.
 * Caller (InputControlMapper) gates MENU/TEXT/CHECKOUT before invoking.
 *
 * Long-press OK/Select toggles MOVE ↔ LOOK on five-button remotes.
 * Short press = INTERACT.
 */

import { AvatarCameraDirector } from "@/lib/avatar/AvatarCameraDirector";

export type WorldLocomotionMode = "MOVE" | "LOOK";

export type WorldMoveCommand =
  | "FORWARD"
  | "BACKWARD"
  | "LEFT"
  | "RIGHT"
  | "INTERACT"
  | "NONE";

type BridgeState = {
  locomotion: WorldLocomotionMode;
  lastOkDownAt: number | null;
  longPressFired: boolean;
  camera: AvatarCameraDirector | null;
  onMove: ((cmd: WorldMoveCommand) => void) | null;
};

const LONG_PRESS_MS = 450;

const state: BridgeState = {
  locomotion: "MOVE",
  lastOkDownAt: null,
  longPressFired: false,
  camera: null,
  onMove: null,
};

let fallbackCamera: AvatarCameraDirector | null = null;

function resolveCamera(): AvatarCameraDirector {
  if (state.camera) return state.camera;
  if (!fallbackCamera) fallbackCamera = new AvatarCameraDirector();
  return fallbackCamera;
}

export function bindWorldCameraDirector(camera: AvatarCameraDirector | null): void {
  state.camera = camera;
}

export function bindWorldMoveHandler(handler: ((cmd: WorldMoveCommand) => void) | null): void {
  state.onMove = handler;
}

export function getWorldLocomotionMode(): WorldLocomotionMode {
  return state.locomotion;
}

export function setWorldLocomotionMode(mode: WorldLocomotionMode): void {
  state.locomotion = mode;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:world:locomotion-mode", { detail: { mode } }),
    );
  }
}

export function toggleWorldLocomotionMode(): WorldLocomotionMode {
  const next = state.locomotion === "MOVE" ? "LOOK" : "MOVE";
  setWorldLocomotionMode(next);
  return next;
}

/**
 * Route a directional press. Caller must skip when menus capture input.
 */
export function handleWorldDirectional(
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT",
  nowMs = Date.now(),
): { consumed: boolean; action: string } {
  if (state.locomotion === "LOOK") {
    const result = resolveCamera().handleTvDpadInput(direction, nowMs);
    return { consumed: true, action: result.actionTaken };
  }

  const cmd: WorldMoveCommand =
    direction === "UP"
      ? "FORWARD"
      : direction === "DOWN"
        ? "BACKWARD"
        : direction === "LEFT"
          ? "LEFT"
          : "RIGHT";
  state.onMove?.(cmd);
  return { consumed: true, action: `MOVE_${cmd}` };
}

/** Short OK → interact. Long OK → toggle MOVE/LOOK. */
export function handleWorldOkPointer(phase: "down" | "up", nowMs = Date.now()): {
  action: "INTERACT" | "TOGGLE_LOOK" | "NONE";
} {
  if (phase === "down") {
    state.lastOkDownAt = nowMs;
    state.longPressFired = false;
    return { action: "NONE" };
  }

  const started = state.lastOkDownAt;
  state.lastOkDownAt = null;
  if (started == null) return { action: "NONE" };
  const held = nowMs - started;
  if (held >= LONG_PRESS_MS || state.longPressFired) {
    if (!state.longPressFired) toggleWorldLocomotionMode();
    state.longPressFired = false;
    return { action: "TOGGLE_LOOK" };
  }
  state.onMove?.("INTERACT");
  return { action: "INTERACT" };
}

/** Poll during OK hold for long-press toggle without waiting for release. */
export function pollWorldOkLongPress(nowMs = Date.now()): boolean {
  if (state.lastOkDownAt == null || state.longPressFired) return false;
  if (nowMs - state.lastOkDownAt >= LONG_PRESS_MS) {
    state.longPressFired = true;
    toggleWorldLocomotionMode();
    return true;
  }
  return false;
}

export const WORLD_OK_LONG_PRESS_MS = LONG_PRESS_MS;

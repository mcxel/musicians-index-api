export type AudienceCameraMode = "panoramic" | "row-scan" | "seat-focus" | "reaction-burst" | "vip-spotlight";

export interface AudienceCameraFrame {
  roomId: string;
  mode: AudienceCameraMode;
  focusRow?: number;
  focusSeatId?: string;
  zoomLevel: number;
  timestamp: string;
}

export interface AudienceCameraState {
  roomId: string;
  currentMode: AudienceCameraMode;
  frame: AudienceCameraFrame;
  autoScanning: boolean;
  scanIntervalSec: number;
  lastSwitchAt: string;
}

const runtimes = new Map<string, AudienceCameraState>();

export function initAudienceCamera(roomId: string): AudienceCameraState {
  const frame: AudienceCameraFrame = {
    roomId,
    mode: "panoramic",
    zoomLevel: 1,
    timestamp: new Date().toISOString(),
  };
  const state: AudienceCameraState = {
    roomId,
    currentMode: "panoramic",
    frame,
    autoScanning: true,
    scanIntervalSec: 15,
    lastSwitchAt: new Date().toISOString(),
  };
  runtimes.set(roomId, state);
  return state;
}

export function getAudienceCameraState(roomId: string): AudienceCameraState {
  return runtimes.get(roomId) ?? initAudienceCamera(roomId);
}

export function switchAudienceMode(
  roomId: string,
  mode: AudienceCameraMode,
  opts: { focusRow?: number; focusSeatId?: string; zoomLevel?: number } = {},
): AudienceCameraState {
  const state = getAudienceCameraState(roomId);
  const frame: AudienceCameraFrame = {
    roomId,
    mode,
    focusRow: opts.focusRow,
    focusSeatId: opts.focusSeatId,
    zoomLevel: opts.zoomLevel ?? 1,
    timestamp: new Date().toISOString(),
  };
  const next: AudienceCameraState = { ...state, currentMode: mode, frame, lastSwitchAt: new Date().toISOString() };
  runtimes.set(roomId, next);
  return next;
}

export function scanRow(roomId: string, row: number): AudienceCameraState {
  return switchAudienceMode(roomId, "row-scan", { focusRow: row, zoomLevel: 1.4 });
}

export function focusSeat(roomId: string, seatId: string): AudienceCameraState {
  return switchAudienceMode(roomId, "seat-focus", { focusSeatId: seatId, zoomLevel: 2 });
}

export function triggerReactionBurst(roomId: string): AudienceCameraState {
  return switchAudienceMode(roomId, "reaction-burst", { zoomLevel: 0.8 });
}

export function spotlightVip(roomId: string, seatId: string): AudienceCameraState {
  return switchAudienceMode(roomId, "vip-spotlight", { focusSeatId: seatId, zoomLevel: 1.8 });
}

export function setAutoScanning(roomId: string, enabled: boolean, intervalSec = 15): AudienceCameraState {
  const state = getAudienceCameraState(roomId);
  const next: AudienceCameraState = { ...state, autoScanning: enabled, scanIntervalSec: intervalSec };
  runtimes.set(roomId, next);
  return next;
}

export type RoomUnderlay =
  | "stellar-drift"
  | "neon-pulse"
  | "solid-vibe"
  | "gradient-flow"
  | "green-screen-virtual";

export type RoomOverlay =
  | "none"
  | "holographic-rain"
  | "spotlight-flares"
  | "scanlines"
  | "crowd-sparks";

export type RoomTransition = "fade" | "slide" | "scale" | "flip";
export type RoomShaderQuality = "low" | "medium" | "high";

export interface RoomVibeState {
  underlay: RoomUnderlay;
  overlay: RoomOverlay;
  strobeIntensity: number;
  transitionMode: RoomTransition;
  spotlightMode: boolean;
  shaderQuality: RoomShaderQuality;
  updatedAt: number;
  updatedBy?: string;
}

const DEFAULT_VIBE: RoomVibeState = {
  underlay: "neon-pulse",
  overlay: "none",
  strobeIntensity: 35,
  transitionMode: "fade",
  spotlightMode: false,
  shaderQuality: "medium",
  updatedAt: Date.now(),
};

const vibeStore = new Map<string, RoomVibeState>();

function clampStrobe(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sanitizePatch(patch: Partial<RoomVibeState>): Partial<RoomVibeState> {
  const next: Partial<RoomVibeState> = { ...patch };
  if (typeof patch.strobeIntensity === "number") {
    next.strobeIntensity = clampStrobe(patch.strobeIntensity);
  }
  return next;
}

export function getRoomVibe(roomId: string): RoomVibeState {
  return vibeStore.get(roomId) ?? DEFAULT_VIBE;
}

export function setRoomVibe(
  roomId: string,
  patch: Partial<RoomVibeState>,
  actor?: string,
): RoomVibeState {
  const existing = getRoomVibe(roomId);
  const safePatch = sanitizePatch(patch);
  const next: RoomVibeState = {
    ...existing,
    ...safePatch,
    updatedAt: Date.now(),
    updatedBy: actor ?? existing.updatedBy,
  };
  vibeStore.set(roomId, next);
  return next;
}

export function getRoomVibeHeat(vibe: RoomVibeState): number {
  const overlayBoost = vibe.overlay === "none" ? 0 : 10;
  const spotlightBoost = vibe.spotlightMode ? 12 : 0;
  const qualityBoost = vibe.shaderQuality === "high" ? 8 : vibe.shaderQuality === "medium" ? 4 : 0;
  return Math.max(0, Math.min(100, Math.round(vibe.strobeIntensity + overlayBoost + spotlightBoost + qualityBoost)));
}

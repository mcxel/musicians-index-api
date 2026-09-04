/**
 * Media transition + legacy starburst health/error families.
 * Wired into MediaTransitionDirector — presentation only, never room authority.
 */

export const LEGACY_STARBURST_CODES = {
  /** Global body/fixed overlay mount detected (StarfieldWarpEntry / SeatArrival fixed). */
  GLOBAL_BODY_MOUNT: "LEGACY-STARBURST-001",
  /** Duplicate starburst instance while launch in progress. */
  DUPLICATE_INSTANCE: "LEGACY-STARBURST-002",
  /** Legacy activate() on goLiveTransitionStore warp path. */
  LEGACY_WARP_ACTIVATE: "LEGACY-STARBURST-003",
} as const;

export const TRANSITION_CODES = {
  /** GO LIVE pressed before authorization gate passed. */
  UNAUTHORIZED: "TRANSITION-001",
  /** Starburst requested before roomId/liveSessionId resolved. */
  ROOM_UNRESOLVED: "TRANSITION-002",
  /** Starburst requested before media transition ready signal. */
  MEDIA_NOT_READY: "TRANSITION-003",
  /** Launch failed — starburst cancelled. */
  LAUNCH_FAILED: "TRANSITION-004",
  /** Active instance count exceeded 1 during launch. */
  DUPLICATE_SEQUENCE: "TRANSITION-005",
  /** Reduced-motion tier forced minimal/no burst. */
  REDUCED_MOTION: "TRANSITION-006",
  /** Starburst still active after venue+Hud ready (stuck overlay). */
  STUCK_OVERLAY: "TRANSITION-007",
} as const;

export type LegacyStarburstCode =
  (typeof LEGACY_STARBURST_CODES)[keyof typeof LEGACY_STARBURST_CODES];
export type TransitionCode = (typeof TRANSITION_CODES)[keyof typeof TRANSITION_CODES];
export type MediaTransitionHealthCode = LegacyStarburstCode | TransitionCode;

export interface MediaTransitionHealthEvent {
  code: MediaTransitionHealthCode;
  message: string;
  at: number;
  roomId?: string | null;
}

const recentEvents: MediaTransitionHealthEvent[] = [];
const MAX_EVENTS = 32;

export function recordMediaTransitionHealth(
  code: MediaTransitionHealthCode,
  message: string,
  roomId?: string | null,
): void {
  const evt: MediaTransitionHealthEvent = {
    code,
    message,
    at: Date.now(),
    roomId: roomId ?? null,
  };
  recentEvents.unshift(evt);
  if (recentEvents.length > MAX_EVENTS) recentEvents.pop();
  if (process.env.NODE_ENV === "development") {
    console.warn(`[MediaTransitionHealth] ${code}: ${message}`);
  }
}

export function getMediaTransitionHealthEvents(): MediaTransitionHealthEvent[] {
  return [...recentEvents];
}

export function clearMediaTransitionHealthEvents(): void {
  recentEvents.length = 0;
}

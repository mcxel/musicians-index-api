/**
 * PERMANENT LIVING LOBBY WALL LAW (locked).
 *
 * OVERRIDE: Do not intentionally pause/freeze visible live tiles to save bandwidth.
 * Cost control uses low-bitrate continuous preview + composed-motion fallback —
 * never a static LIVE thumbnail gallery.
 *
 * GPS → VENUES → /rooms
 * LOBBY WALL → TAP MOVING PREVIEW → EXACT ROOM → MEDIA PLAYER 1 (or next free if call protected)
 */

export const LIVING_LOBBY_WALL_LAW_ID = "LIVING_LOBBY_WALL_V1" as const;

export const LIVING_LOBBY_WALL_LAWS = [
  "VISIBLE_LIVE_TILES_ALWAYS_MOVE",
  "NO_STATIC_LIVE_THUMBNAILS",
  "MUTED_PREVIEWS_OK_FROZEN_PREVIEWS_NOT",
  "REAL_LIVE_SOURCE_ONLY",
  "TAP_ROUTES_EXACT_ROOM_TO_PLAYER",
  "PROTECTED_CALLS_PRESERVED",
  "BROWSE_DOES_NOT_INTERRUPT_WATCH",
  "JOIN_EXISTING_ROOM_NO_DUPLICATE",
] as const;

/** Button / GPS label — exact copy. */
export const LOBBY_WALL_BUTTON_LABEL = "LOBBY WALL" as const;

/** Canonical GPS venues entry into the room authority. */
export const GPS_VENUES_HREF = "/rooms" as const;

/**
 * Visible + live tiles must never resolve to a frozen presentation.
 * quality "off" is only legal when the tile is not visible or not live.
 */
export function livingWallAllowsQualityOff(input: {
  visible: boolean;
  isLive: boolean;
}): boolean {
  return !(input.visible && input.isLive);
}

/** Honest feed modes that satisfy "moving" for a healthy live tile. */
export const LIVING_WALL_MOVING_FEED_MODES = [
  "webrtc-preview",
  "composed-motion",
] as const;

export function isLivingWallMovingFeedMode(mode: string): boolean {
  return (LIVING_WALL_MOVING_FEED_MODES as readonly string[]).includes(mode);
}

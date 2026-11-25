/**
 * LIVE_LOBBY_WALL — first production Quality Contract (AWR).
 * Non-degradable P0 behaviors are enforced in room/discovery runtimes, not here.
 * This contract caps presentation cost for wall previews.
 */

import type { AwrQualityContractId, DevicePresentationTier } from "../types";

export const LIVE_LOBBY_WALL_CONTRACT_ID: AwrQualityContractId = "LIVE_LOBBY_WALL";

/** P0 must never be reduced by AWR (documented for operators / certification). */
export const LIVE_LOBBY_WALL_NON_DEGRADABLE_P0 = [
  "roomIdentity",
  "genuineLiveStatus",
  "exactRoomEntry",
  "responsiveInput",
  "competitionSessionState",
  "participantIdentity",
  "identityIsolationUnderLoad",
] as const;

export type LiveLobbyWallPreviewQuality = "off" | "thumb" | "low" | "medium";

/**
 * Living Lobby Wall: more simultaneous low-bitrate movers on-device.
 * Full-quality interactive sessions still happen only after room entry.
 */
export function maxVisibleLowPreviewsForDevice(tier: DevicePresentationTier): number {
  if (tier === "low") return 6;
  if (tier === "medium") return 10;
  return 16;
}

/**
 * Focused tile may take the interactive Daily receive bind.
 * Other visible live tiles keep moving via URL preview / composed-motion —
 * never freeze to a static LIVE photo.
 */
export const LIVE_LOBBY_WALL_MAX_WEBRTC_BINDS = 1;

export const LIVE_LOBBY_WALL_MAX_MEDIUM_QUALITY_TILES = 1;

/** Permanent product law — visible healthy live tiles move continuously. */
export const LIVE_LOBBY_WALL_VISIBLE_TILES_MUST_MOVE = true;

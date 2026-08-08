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

export function maxVisibleLowPreviewsForDevice(tier: DevicePresentationTier): number {
  if (tier === "low") return 2;
  if (tier === "medium") return 4;
  return 6;
}

/** Singleton Daily receive-only bind — matches LobbyPreviewBindRuntime. */
export const LIVE_LOBBY_WALL_MAX_WEBRTC_BINDS = 1;

export const LIVE_LOBBY_WALL_MAX_MEDIUM_QUALITY_TILES = 1;

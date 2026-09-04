/**
 * Performer Lobby Personality — NO AVATARS, free-roaming WebRTC video panels only.
 *
 * PERFORMER LOBBY ≠ FAN LOBBY. Same Canonical3DRoomRuntime mill, different presentation.
 * Skin ≠ WebRTC transport — panel/room skin change must not reconnect.
 */

import { CANONICAL_WORLD_ZONE, type CanonicalWorldGate3Status } from "./canonicalWorldViewport";
import type { PerformerLobbyMode } from "./performerLobbyModes";
import { PERFORMER_LOBBY_MODES } from "./performerLobbyModes";

export type PerformerPanelSkinId =
  | "DEFAULT_MONITOR"
  | "GLASS_LUXURY"
  | "GOLD_FRAME"
  | "PLATINUM_FRAME"
  | "DIAMOND_FRAME"
  | "STUDIO_MONITOR"
  | "RETRO_CRT"
  | "STAGE_SPEAKER";

/** Default panel skin — always available, never blocks join. */
export const DEFAULT_PERFORMER_PANEL_SKIN: PerformerPanelSkinId = "DEFAULT_MONITOR";

/** Cosmetic panel skins mapped to venue-skin catalog IDs (VenueSkinCommerce). */
export const PERFORMER_PANEL_SKIN_TO_VENUE_SKIN: Partial<Record<PerformerPanelSkinId, string>> = {
  GLASS_LUXURY: "luxury-lounge",
  GOLD_FRAME: "neon-club",
  PLATINUM_FRAME: "tv-studio",
  DIAMOND_FRAME: "concert-hall",
  STUDIO_MONITOR: "warehouse",
  RETRO_CRT: "street-corner",
  STAGE_SPEAKER: "underground-battle",
};

export const PERFORMER_LOBBY_PERSONALITY = {
  id: "PERFORMER_LOBBY" as const,
  zone: CANONICAL_WORLD_ZONE.PERFORMER_LOBBY,
  allowsAvatars: false,
  allowsAvatarSeating: false,
  allowsBotCrowdFill: false,
  videoPanelsPrimary: true,
  webrtcOptionalPanel: false,
  freeRoam: true,
  locomotionSource: "PerformerSpatialPresence floor-tap without avatar meshes",
  audienceSceneForbidden: true,
  joinCreatesPanel: true,
  leaveRemovesPanelAndUnsubscribes: true,
  nearLargerPanelStrongerVoice: true,
  personalSpaceCollision: true,
  chassisSkinDoesNotRestartWebrtc: true,
  roomModes: PERFORMER_LOBBY_MODES,
  defaultMode: "SOCIAL" as PerformerLobbyMode,
  defaultPanelSkin: DEFAULT_PERFORMER_PANEL_SKIN,
  gate3PhysicalWorld: "OPEN" as CanonicalWorldGate3Status,
  collisionMeshCertified: false,
  photorealMesh: false,
  /** Private rooms do not publish to LiveLobbyWallHost mosaic. */
  privateSessionsHiddenFromWall: true,
  /** Genre rooms — data in CanonicalGenreRegistry.ts (one engine). */
  genreRoomEngine: "CanonicalGenreRegistry.ts",
} as const;

export type {
  CanonicalGenreRoomDefinition,
  CanonicalGenreId,
  GenreRoomDefinition,
  PerformerGenreId,
} from "./CanonicalGenreRegistry";
export {
  CANONICAL_GENRE_IDS,
  CANONICAL_GENRE_ROOM_REGISTRY,
  BASELINE_GENRE_LOBBY_ROOM_IDS,
  FAN_GENRE_ROOM_REGISTRY,
  PERFORMER_GENRE_ROOM_REGISTRY,
  PERFORMER_GENRE_IDS,
  listGenreRoomDefinitions,
  getGenreRoomDefinition,
  getGenreRoomByRoomId,
  shouldPublishPerformerLobbyToWall,
  PERFORMER_LOBBY_PRIVATE_MODES,
} from "./CanonicalGenreRegistry";

export type PerformerLobbyPersonalityId = typeof PERFORMER_LOBBY_PERSONALITY.id;

/**
 * Panel skin entitlement — cosmetic only. Unpaid users keep DEFAULT_MONITOR.
 * Full async purchase check: VenueSkinCommerce.hasVenueSkinAccess (server).
 */
export function resolvePerformerPanelSkin(
  requested: PerformerPanelSkinId | string | null | undefined,
  entitledSkins?: readonly string[] | null,
): PerformerPanelSkinId {
  const skin = (requested ?? DEFAULT_PERFORMER_PANEL_SKIN) as PerformerPanelSkinId;
  if (skin === DEFAULT_PERFORMER_PANEL_SKIN) return skin;
  const venueSkinId = PERFORMER_PANEL_SKIN_TO_VENUE_SKIN[skin];
  if (!venueSkinId) return DEFAULT_PERFORMER_PANEL_SKIN;
  if (!entitledSkins || entitledSkins.length === 0) return DEFAULT_PERFORMER_PANEL_SKIN;
  return entitledSkins.includes(venueSkinId) || entitledSkins.includes(skin) ? skin : DEFAULT_PERFORMER_PANEL_SKIN;
}

/**
 * Canonical3DRoomRuntime — ONE mill, personality-driven presentation.
 *
 * FanLobbyPersonality: avatar + optional WebRTC panel.
 * PerformerLobbyPersonality: NO avatars, free-roam WebRTC video panels only.
 *
 * Same `/live/rooms/[id]` + UniversalVenueRenderer mill for all personalities.
 * Skin ≠ WebRTC transport — panel/room skin change must not reconnect.
 */

import { FAN_LOBBY_PERSONALITY } from "./FanLobbyPersonality";
import { PERFORMER_LOBBY_PERSONALITY } from "./PerformerLobbyPersonality";

export { FAN_LOBBY_PERSONALITY, PERFORMER_LOBBY_PERSONALITY };
import {
  CANONICAL_WORLD_ZONE,
  isLoungeZone,
  isPerformerLobbyZone,
  type CanonicalWorldZone,
} from "./canonicalWorldViewport";
import type { ExperienceClass } from "./ExperienceRoomRegistry";
import { getGenreRoomByRoomId } from "./CanonicalGenreRegistry";

export type RoomPersonalityId = "FAN_LOBBY" | "LOUNGE_VIDEO" | "PERFORMER_LOBBY" | "AUDITORIUM";

export interface RoomPersonalityLaw {
  id: RoomPersonalityId;
  allowsAvatars: boolean;
  videoPanelsPrimary: boolean;
  suppressAudienceScene: boolean;
  suppressBotCrowdFill: boolean;
  freeRoam: boolean;
  chassisSkinDoesNotRestartWebrtc: boolean;
}

const LOUNGE_VIDEO_PERSONALITY: RoomPersonalityLaw = {
  id: "LOUNGE_VIDEO",
  allowsAvatars: false,
  videoPanelsPrimary: true,
  suppressAudienceScene: true,
  suppressBotCrowdFill: true,
  freeRoam: true,
  chassisSkinDoesNotRestartWebrtc: true,
};

const AUDITORIUM_PERSONALITY: RoomPersonalityLaw = {
  id: "AUDITORIUM",
  allowsAvatars: true,
  videoPanelsPrimary: false,
  suppressAudienceScene: false,
  suppressBotCrowdFill: false,
  freeRoam: false,
  chassisSkinDoesNotRestartWebrtc: true,
};

export function isFanAvatarGenreRoomId(roomId?: string | null): boolean {
  const slug = (roomId ?? "").trim().toLowerCase();
  if (!slug) return false;
  const genreDef = getGenreRoomByRoomId(slug);
  if (genreDef?.side === "FAN") return true;
  return slug.startsWith("fan-avatar-lobby-");
}

export function isPerformerLobbyRoomId(roomId?: string | null): boolean {
  const slug = (roomId ?? "").trim().toLowerCase();
  if (!slug) return false;
  const genreDef = getGenreRoomByRoomId(slug);
  if (genreDef?.side === "PERFORMER") return true;
  if (slug === "performer-lobby" || slug === "performer-lobby-global") return true;
  if (slug.startsWith("performer-lobby-") || slug.startsWith("perf-lobby-")) return true;
  if (slug.startsWith("collab-")) return true;
  return false;
}

export function resolveRoomPersonality(input?: {
  zone?: CanonicalWorldZone | string | null;
  experienceClass?: ExperienceClass | null;
  roomId?: string | null;
  suppressAvatars?: boolean;
}): RoomPersonalityLaw {
  if (input?.suppressAvatars || isLoungeZone(input?.zone)) {
    return LOUNGE_VIDEO_PERSONALITY;
  }
  if (
    isPerformerLobbyZone(input?.zone) ||
    input?.experienceClass === "PERFORMER_LOBBY" ||
    isPerformerLobbyRoomId(input?.roomId)
  ) {
    return {
      id: "PERFORMER_LOBBY",
      allowsAvatars: PERFORMER_LOBBY_PERSONALITY.allowsAvatars,
      videoPanelsPrimary: PERFORMER_LOBBY_PERSONALITY.videoPanelsPrimary,
      suppressAudienceScene: PERFORMER_LOBBY_PERSONALITY.audienceSceneForbidden,
      suppressBotCrowdFill: !PERFORMER_LOBBY_PERSONALITY.allowsBotCrowdFill,
      freeRoam: PERFORMER_LOBBY_PERSONALITY.freeRoam,
      chassisSkinDoesNotRestartWebrtc: PERFORMER_LOBBY_PERSONALITY.chassisSkinDoesNotRestartWebrtc,
    };
  }
  if (
    input?.zone === CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY ||
    input?.experienceClass === "FAN_AVATAR_LOBBY" ||
    isFanAvatarGenreRoomId(input?.roomId)
  ) {
    return {
      id: "FAN_LOBBY",
      allowsAvatars: FAN_LOBBY_PERSONALITY.allowsAvatars,
      videoPanelsPrimary: FAN_LOBBY_PERSONALITY.videoPanelsPrimary,
      suppressAudienceScene: !FAN_LOBBY_PERSONALITY.audienceSceneRequired,
      suppressBotCrowdFill: false,
      freeRoam: FAN_LOBBY_PERSONALITY.freeRoam,
      chassisSkinDoesNotRestartWebrtc: FAN_LOBBY_PERSONALITY.chassisSkinDoesNotRestartWebrtc,
    };
  }
  return AUDITORIUM_PERSONALITY;
}

export function isVideoPanelZone(zone?: CanonicalWorldZone | string | null): boolean {
  return isLoungeZone(zone) || isPerformerLobbyZone(zone);
}


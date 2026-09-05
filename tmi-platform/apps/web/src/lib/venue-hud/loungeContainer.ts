/**
 * Canonical lounge container — do not invent /lounge/[id] or LoungeV2.
 * Social lounge already lives in the live-room renderer (hallway side-room).
 */

import {
  getAnchorBySlug,
} from "../live/AnchorRoomRegistry";
import { resolveLobbyDestination } from "../lobby/DestinationResolver";
import {
  CANONICAL_WORLD_VIEW_LAW,
  CANONICAL_WORLD_ZONE,
  isLoungeRoomId,
  isLoungeZone,
  isPerformerLobbyZone,
  loungeSideRoomEntryHref,
  performerLobbyEntryHref,
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
  type CanonicalWorldZone,
} from "../live/canonicalWorldViewport";
import { getGenreRoomByRoomId } from "../live/CanonicalGenreRegistry";

/** Local slug check — avoids Canonical3DRoomRuntime import cycle with LiveSurfaceCard. */
function isPerformerLobbyRoomId(roomId?: string | null): boolean {
  const slug = (roomId ?? "").trim().toLowerCase();
  if (!slug) return false;
  const genreDef = getGenreRoomByRoomId(slug);
  if (genreDef?.side === "PERFORMER") return true;
  if (slug === "performer-lobby" || slug === "performer-lobby-global") return true;
  if (slug.startsWith("performer-lobby-") || slug.startsWith("perf-lobby-")) return true;
  if (slug.startsWith("collab-")) return true;
  return false;
}
import {
  canJoinDatingExperience,
  type DatingAccessDecision,
  type DatingExperienceSubject,
} from "../trustSafety/DatingExperiencePolicy";
import { resolveCanonicalHudFamily, type ExperienceType } from "./TMIExperienceHudRuntime";

export const CANONICAL_LOUNGE_CONTAINER = {
  routePattern: "/live/rooms/[id]",
  exampleSlug: "lounge-playlist",
  exampleRoute: "/live/rooms/lounge-playlist",
  renderer: "UniversalVenueRenderer",
  hud: "TMIInteractiveLoungeHud",
  monitors: "LiveRoomMonitorShareStack",
  zone: CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM,
  loungeAllowsAvatars: CANONICAL_WORLD_VIEW_LAW.loungeAllowsAvatars,
} as const;

export function experienceTypeForRoom(roomId: string): ExperienceType {
  const slug = roomId.trim().toLowerCase();
  const anchor = getAnchorBySlug(slug);
  if (anchor?.category === "LOUNGE") return "LOUNGE";
  if (isLoungeRoomId(slug)) return "LOUNGE";
  return "LIVE";
}

export function loungeHudMountsForRoom(roomId: string): boolean {
  return resolveCanonicalHudFamily(experienceTypeForRoom(roomId)) === "LOUNGE_HUD";
}

/** True when this experience is a connected lounge side-room (roomId or zone). */
export function isLoungeExperience(
  roomId: string,
  zone?: CanonicalWorldZone | string | null,
): boolean {
  if (isPerformerLobbyZone(zone) || isPerformerLobbyExperience(roomId, zone)) return false;
  return isLoungeZone(zone) || loungeHudMountsForRoom(roomId);
}

/** Performer rehearsal/backroom — video panels only, NO avatars. */
export function isPerformerLobbyExperience(
  roomId: string,
  zone?: CanonicalWorldZone | string | null,
): boolean {
  return isPerformerLobbyZone(zone) || isPerformerLobbyRoomId(roomId);
}

export function loungeAllowsAvatars(
  roomId: string,
  zone?: CanonicalWorldZone | string | null,
): boolean {
  if (isLoungeExperience(roomId, zone)) return false;
  if (isPerformerLobbyExperience(roomId, zone)) return false;
  return true;
}

/**
 * Dating lounge join still goes through canAccessDatingExperience (21+).
 * Non-dating lounges pass through with NOT_DATING.
 */
export function loungeDatingAccess(
  user: DatingExperienceSubject | null | undefined,
  roomId: string,
): DatingAccessDecision {
  return canJoinDatingExperience(user, roomId);
}

/** Mixed-genre / playlist / radio / conversation sessions — LOUNGE_SIDE_ROOM, not avatar lobby. */
export function isPlaylistLoungeDiscovery(input: {
  category?: string | null;
  anchorFamily?: string | null;
  streamCategory?: string | null;
  roomId?: string | null;
}): boolean {
  const cat = (input.category ?? "").toLowerCase();
  const family = (input.anchorFamily ?? "").toLowerCase();
  const stream = (input.streamCategory ?? "").toLowerCase();
  const roomId = (input.roomId ?? "").toLowerCase();
  if (family === "playlist_lounge" || family === "conversation_lounge") return true;
  if (cat === "listening" || cat === "lounges") return true;
  if (stream === "lounge" || stream === "listening" || stream === "radio") return true;
  return isLoungeRoomId(roomId);
}

/** Performer lobby join — video panels, zone=PERFORMER_LOBBY, no avatars. */
export function resolvePerformerLobbyJoinHref(
  roomId: string,
  opts?: { from?: string; privacy?: string },
): string {
  const from = opts?.from ?? "performer-lobby-wall";
  return resolveLobbyDestination({
    roomId,
    kind: "performer-lobby",
    href: performerLobbyEntryHref(roomId, { from, privacy: opts?.privacy }),
  }).href;
}

/** Public performer lobbies only — private sessions do not publish. */
export function isPublicPerformerLobbyDiscovery(input: {
  visibility?: string | null;
  anchorFamily?: string | null;
  category?: string | null;
  roomId?: string | null;
}): boolean {
  const vis = (input.visibility ?? "public").toLowerCase();
  if (vis === "private" || vis === "invite") return false;
  const family = (input.anchorFamily ?? "").toLowerCase();
  const cat = (input.category ?? "").toLowerCase();
  if (family === "performer_lobby" || family === "performer-lobby") return true;
  if (cat === "performer_lobbies") return true;
  return isPerformerLobbyRoomId(input.roomId);
}

/** Canonical join href — video panels, zone=LOUNGE_SIDE_ROOM, no avatars. */
export function resolvePlaylistLoungeJoinHref(
  roomId: string,
  opts?: { from?: string },
): string {
  const from = opts?.from ?? "profile";
  const slug = roomId.trim().toLowerCase();
  const millId =
    slug.includes("conversation") || slug === "lounge-conversation"
      ? "lounge-conversation"
      : slug.includes("playlist") ||
          slug.includes("listening") ||
          slug === "stream-win-main" ||
          slug === "stream-win"
        ? SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID
        : roomId;
  return resolveLobbyDestination({
    roomId: millId,
    kind: "lounge",
    href: loungeSideRoomEntryHref(millId, { from }),
  }).href;
}

/**
 * Map LiveDiscoveryRecord → LobbyRoom for Brady-Bunch walls (quick + full).
 */

import type { LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";
import {
  LIVE_DISCOVERY_CATEGORY_LABELS,
  type LiveDiscoveryCategory,
  type LiveDiscoveryRecord,
} from "@/lib/discovery/LiveDiscoveryRecord";
import { isPerformerLobbyRecord } from "@/lib/lobby/liveLobbyWallLaw";
import { resolvePerformerLobbyJoinHref } from "@/lib/venue-hud/loungeContainer";
import { getGenreRoomByRoomId, resolveGenreLobbyJoinHref } from "@/lib/live/CanonicalGenreRegistry";

function categoryToLobbyType(category: LiveDiscoveryCategory): LobbyRoom["type"] {
  if (category === "battles") return "battle";
  if (category === "cyphers") return "cypher";
  if (category === "challenges") return "challenge";
  if (category === "games") return "game";
  if (category === "dance") return "dance";
  if (category === "concerts") return "concert";
  if (category === "lounges" || category === "fan_lobbies" || category === "listening") return "lounge";
  return "live";
}

function eventKindNoun(type: LobbyRoom["type"]): string {
  if (type === "cypher" || type === "mini-cypher") return "Cypher";
  if (type === "battle") return "Battle";
  if (type === "challenge") return "Challenge";
  if (type === "gauntlet") return "Gauntlet";
  if (type === "game") return "Game";
  if (type === "dance") return "Dance";
  if (type === "concert") return "Show";
  if (type === "lounge" || type === "performer-lobby") return "Lobby";
  return "Live";
}

function fallbackCastOverlay(r: LiveDiscoveryRecord, type: LobbyRoom["type"]): string {
  const genre = (
    getGenreRoomByRoomId(r.roomId)?.label ??
    r.featuredCategory?.replace(/_/g, " ") ??
    LIVE_DISCOVERY_CATEGORY_LABELS[r.category]
  ).trim();
  const kind = eventKindNoun(type);
  if (type === "cypher" || type === "mini-cypher") {
    return r.recruiting
      ? `LOOKING FOR PERFORMERS · ${genre} Cypher`
      : `LIVE · ${genre} Cypher`;
  }
  if (r.recruiting) return `LOOKING FOR PERFORMERS · ${genre} ${kind}`;
  if (!r.isLive) return `STARTING SOON · ${genre} ${kind}`;
  return `LIVE · ${genre} ${kind}`;
}

export function discoveryToLobbyRoom(r: LiveDiscoveryRecord): LobbyRoom {
  const primary = r.category;
  const performerLobby = isPerformerLobbyRecord(r);
  const genreDef = getGenreRoomByRoomId(r.roomId);
  const fanGenreLobby = genreDef?.side === "FAN";
  const type: LobbyRoom["type"] = performerLobby
    ? "performer-lobby"
    : categoryToLobbyType(primary);
  const recruiting = r.recruiting === true;
  return {
    id: r.roomId,
    name: r.title,
    performerName: sanitizeWallHostLabel(r.hostName, { hostUserId: r.hostUserId }),
    hostUserId: r.hostUserId,
    type,
    href: performerLobby
      ? resolvePerformerLobbyJoinHref(r.roomId)
      : fanGenreLobby
        ? resolveGenreLobbyJoinHref(r.roomId)
        : r.joinRoute,
    viewerCount: Math.max(0, r.humanViewerCount),
    status: recruiting ? "recruiting" : r.isLive ? "live" : "starting",
    genre: genreDef?.label ?? r.featuredCategory?.replace(/_/g, " ") ?? LIVE_DISCOVERY_CATEGORY_LABELS[primary],
    countryCode: r.countryCode,
    previewUrl: r.previewUrl,
    overlayLine: r.castOverlay?.trim() || fallbackCastOverlay(r, type),
  };
}

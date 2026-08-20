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

export function discoveryToLobbyRoom(r: LiveDiscoveryRecord): LobbyRoom {
  const primary = r.category;
  const performerLobby = isPerformerLobbyRecord(r);
  const genreDef = getGenreRoomByRoomId(r.roomId);
  const fanGenreLobby = genreDef?.side === "FAN";
  return {
    id: r.roomId,
    name: r.title,
    performerName: sanitizeWallHostLabel(r.hostName, { hostUserId: r.hostUserId }),
    hostUserId: r.hostUserId,
    type: performerLobby ? "performer-lobby" : categoryToLobbyType(primary),
    href: performerLobby
      ? resolvePerformerLobbyJoinHref(r.roomId)
      : fanGenreLobby
        ? resolveGenreLobbyJoinHref(r.roomId)
        : r.joinRoute,
    viewerCount: Math.max(0, r.humanViewerCount),
    status: r.isLive ? "live" : "starting",
    genre: genreDef?.label ?? r.featuredCategory?.replace(/_/g, " ") ?? LIVE_DISCOVERY_CATEGORY_LABELS[primary],
    countryCode: r.countryCode,
    previewUrl: r.previewUrl,
  };
}

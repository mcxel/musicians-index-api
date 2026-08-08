/**
 * Map LiveDiscoveryRecord → LobbyRoom for Brady-Bunch walls (quick + full).
 */

import type { LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import {
  LIVE_DISCOVERY_CATEGORY_LABELS,
  type LiveDiscoveryCategory,
  type LiveDiscoveryRecord,
} from "@/lib/discovery/LiveDiscoveryRecord";

function categoryToLobbyType(category: LiveDiscoveryCategory): LobbyRoom["type"] {
  if (category === "battles") return "battle";
  if (category === "cyphers") return "cypher";
  if (category === "challenges") return "challenge";
  if (category === "games") return "game";
  if (category === "dance") return "dance";
  if (category === "concerts") return "concert";
  if (category === "lounges" || category === "fan_lobbies") return "lounge";
  return "live";
}

export function discoveryToLobbyRoom(r: LiveDiscoveryRecord): LobbyRoom {
  const primary = r.category;
  return {
    id: r.roomId,
    name: r.title,
    performerName: r.hostName,
    type: categoryToLobbyType(primary),
    href: r.joinRoute,
    viewerCount: Math.max(0, r.humanViewerCount),
    status: r.isLive ? "live" : "starting",
    genre: LIVE_DISCOVERY_CATEGORY_LABELS[primary],
    previewUrl: r.previewUrl,
  };
}

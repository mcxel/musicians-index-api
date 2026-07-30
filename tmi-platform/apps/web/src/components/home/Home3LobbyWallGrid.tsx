/**
 * Home3LobbyWallGrid — LEGACY wrapper.
 * Lobby A/B/C filler faces removed. Mosaic comes from DiscoveryBus.
 */

"use client";

import HomeLiveLobbyWall from "@/components/discovery/HomeLiveLobbyWall";

export default function Home3LobbyWallGrid() {
  return <HomeLiveLobbyWall surface="home3_mosaic" maxTiles={12} />;
}

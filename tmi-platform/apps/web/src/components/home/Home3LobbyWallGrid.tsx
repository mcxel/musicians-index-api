/**
 * Home3LobbyWallGrid — LEGACY wrapper.
 * Lobby A/B/C filler faces removed. Mosaic comes from DiscoveryBus.
 *
 * Confirmed zero production importers as of 2026-08-12. Superseded by
 * LiveLobbyWallGrid.tsx, the canonical full-page Live Lobby Wall.
 */

"use client";

import HomeLiveLobbyWall from "@/components/discovery/HomeLiveLobbyWall";

export default function Home3LobbyWallGrid() {
  return <HomeLiveLobbyWall surface="home3_mosaic" maxTiles={12} />;
}

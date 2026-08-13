/**
 * LiveLobbyWall — homepage/artifact quick wall backed by DiscoveryBus.
 * LEGACY emoji Lobby A/B/C grid removed (Rule 20).
 *
 * Confirmed zero reachable production importers as of 2026-08-12 (only
 * consumer is an artifact mockup not wired to the real /home/2 route).
 * Superseded by LiveLobbyWallGrid.tsx, the canonical full-page Live Lobby Wall.
 */

"use client";

import HomeLiveLobbyWall from "@/components/discovery/HomeLiveLobbyWall";

export default function LiveLobbyWall() {
  return (
    <HomeLiveLobbyWall
      surface="home3_mosaic"
      maxTiles={4}
      title="LIVE LOBBY WALL"
      style={{ padding: 0, maxWidth: "none" }}
    />
  );
}

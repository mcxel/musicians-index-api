/**
 * LiveLobbyWall — homepage/artifact quick wall backed by DiscoveryBus.
 * LEGACY emoji Lobby A/B/C grid removed (Rule 20).
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

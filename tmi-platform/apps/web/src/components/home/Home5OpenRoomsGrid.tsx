/**
 * Home5OpenRoomsGrid — LEGACY wrapper.
 * Fake ROOMS seed removed. Arena tiles come from DiscoveryBus via HomeLiveLobbyWall.
 */

"use client";

import HomeLiveLobbyWall from "@/components/discovery/HomeLiveLobbyWall";

export default function Home5OpenRoomsGrid() {
  return <HomeLiveLobbyWall surface="home5_arena" maxTiles={12} />;
}

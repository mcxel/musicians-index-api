'use client';

/**
 * /live/lobby-wall — All Live Stations wall.
 * LiveLobbyWallHost + DiscoveryBus (canonical registry feed, Rule 20).
 * Category tabs: Battles | Challenges | Cyphers | Lounges (in-shell switch).
 * Fan/Band avatar lobby search via RoleGate (Rule 26).
 */

import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallHost from '@/components/live/LiveLobbyWallHost';

export default function AllLiveLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallHost
        title="All Live Stations"
        accentColor="#00FF88"
        typeLabel="ALL LIVE"
        variant="page"
        defaultCategory="lives"
        showGenreLobbyTabs
        enableMobileRoam
      />
    </>
  );
}

'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

/**
 * PDF mapping:
 * - Main Preview (big left)
 * - Lobby Grid (right)
 * - Join Random Room CTA
 */
export default function LiveWorldBelt() {
  return (
    <HomeBelt
      type="live"
      title="Live World Belt"
      subtitle="Preview Lobby, Room Grid, and Join Flow"
      badge="Now Live"
      id="live-world-belt"
    >
      <HomeGrid>
        <HomeCard variant="liveHero" span={6} title="Main Preview" scanlines>
          <HomeOverlay type="live" position="topLeft" />
          <p>Main stage preview with active host and live audience stats.</p>
        </HomeCard>

        <HomeCard variant="lobbyGrid" span={6} title="Lobby Grid">
          <HomeOverlay type="watch" position="topRight" />
          <p>Real-time room tiles with availability and watcher count.</p>
        </HomeCard>

        <HomeCard variant="cta" span={12} title="Join Random Room">
          <HomeOverlay type="join" position="topRight" />
          <p>One-tap matchmaking into active rooms and cypher sessions.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}

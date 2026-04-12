'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

/**
 * PDF mapping:
 * - Big host card
 * - Game grid
 * - Join CTA
 */
export default function GameBelt() {
  return (
    <HomeBelt
      type="game"
      title="Game Belt"
      subtitle="Game Night, Name That Tune, Deal or Feud"
      badge="Arcade"
      id="game-belt"
    >
      <HomeGrid>
        <HomeCard variant="gameHero" span={6} title="Game Host" scanlines>
          <HomeOverlay type="live" position="topLeft" />
          <p>Live host panel with countdown and round control.</p>
        </HomeCard>

        <HomeCard variant="gameGrid" span={6} title="Game Grid">
          <HomeOverlay type="hot" position="topRight" />
          <p>Interactive board for Name That Tune and Deal or Feud.</p>
        </HomeCard>

        <HomeCard variant="cta" span={12} title="Join Game Room">
          <HomeOverlay type="join" position="topRight" />
          <p>Queue into active game rooms and voting arenas.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}

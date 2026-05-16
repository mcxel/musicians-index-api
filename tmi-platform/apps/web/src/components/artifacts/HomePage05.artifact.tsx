'use client';
import { useEffect } from 'react';

/**
 * HomePage05.artifact.tsx
 * Home 5 — Competition + Contest Economy Layer
 * Layered magazine artifact wrapping Home5BattleCypherSurface.
 *
 * Layer 0: Magazine shell (orange/fuchsia spine — battle color)
 * Layer 1: Battle poster background (/tmi-curated/home5.png)
 * Layer 2: Battle fire streaks, fuchsia glow
 * Layer 3: Fire sparks
 * Layer 4: Home5BattleCypherSurface (battles, cyphers, contests, Monday Night Stage)
 * Layer 5: Battle round labels, prize numbers
 * Layer 6: Trophy + fire artifacts
 * Layer 7: "Battle Live" / "Weekly Cypher" floating text
 */

import Home5BattleCypherSurface from '@/components/home/Home5BattleCypherSurface';
import HomepageOverlayA from '@/components/layers/HomepageOverlayA';
import HomepageOverlayB from '@/components/layers/HomepageOverlayB';
import HomepageOverlayC from '@/components/layers/HomepageOverlayC';
import HomepageUnderlayA from '@/components/layers/HomepageUnderlayA';
import HomepageUnderlayB from '@/components/layers/HomepageUnderlayB';
import MagazinePageShell from '@/components/layers/MagazinePageShell';
import { ensureHomeEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';

export default function HomePage05Artifact() {
  useEffect(() => {
    ensureHomeEconomyRuntime('/home/5');
  }, []);

  return (
    <MagazinePageShell
      bgImage="/tmi-curated/home5.png"
      bgColor="#060408"
      accent="#FF6B35"
      underlayA={<HomepageUnderlayA variant="battle" />}
      underlayB={<HomepageUnderlayB variant="fire-sparks" />}
      overlayA={
        <HomepageOverlayA
          labels={[
            {
              text: 'Battle',
              x: '2%',
              y: '22%',
              color: '#FF6B35',
              fontSize: 80,
              opacity: 0.05,
              fontFamily: 'headline',
            },
            {
              text: 'Round 01',
              x: '88%',
              y: '4%',
              color: '#FF6B35',
              fontSize: 11,
              opacity: 0.45,
              fontFamily: 'tech',
            },
            {
              text: 'Competition',
              x: '1.5%',
              y: '88%',
              color: '#FF2DAA',
              fontSize: 10,
              opacity: 0.4,
              fontFamily: 'tech',
              rotate: -90,
            },
            {
              text: 'vs',
              x: '3%',
              y: '40%',
              color: '#FF6B35',
              fontSize: 22,
              opacity: 0.25,
              fontFamily: 'headline',
            },
          ]}
        />
      }
      overlayB={
        <HomepageOverlayB
          items={[
            { type: 'trophy', x: '90%', y: '8%', size: 30, color: '#FFD700', opacity: 0.55 },
            { type: 'fire', x: '2%', y: '10%', size: 24, color: '#FF6B35', opacity: 0.45 },
            { type: 'fire', x: '93%', y: '62%', size: 20, color: '#FF2DAA', opacity: 0.35 },
            { type: 'star', x: '3%', y: '65%', size: 18, color: '#FFD700', opacity: 0.3 },
          ]}
        />
      }
      overlayC={
        <HomepageOverlayC
          items={[
            {
              text: 'Battle Live',
              x: '87%',
              y: '82%',
              color: '#FF6B35',
              fontSize: 10,
              pulse: true,
              badge: true,
            },
            {
              text: 'Weekly Cypher',
              x: '2%',
              y: '15%',
              color: '#AA2DFF',
              fontSize: 10,
              badge: true,
            },
            {
              text: 'Monday Night Stage',
              x: '2%',
              y: '20%',
              color: '#00FFFF',
              fontSize: 9,
              pulse: true,
              badge: true,
            },
          ]}
        />
      }
    >
      <Home5BattleCypherSurface />
    </MagazinePageShell>
  );
}

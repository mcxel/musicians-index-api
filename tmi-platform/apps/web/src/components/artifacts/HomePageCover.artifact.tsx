'use client';
import { useEffect } from 'react';

/**
 * HomePageCover.artifact.tsx
 * Home 1 — Crown World
 * Layered magazine artifact wrapping Home1DiscoverySurface.
 *
 * Layer 0: Magazine shell (cyan spine, deep shadow)
 * Layer 1: Home1 cover art background (/tmi-curated/home1.jpg)
 * Layer 2: Ambient glow — cyan/fuchsia orbs
 * Layer 3: Confetti drift particles
 * Layer 4: Home1DiscoverySurface (crown engine + ranking + nav)
 * Layer 5: Ranking numerals overlay
 * Layer 6: Crown badge + star artifacts
 * Layer 7: "Voting Live" / "Crown Updating" floating text
 */

import Home1DiscoverySurface from '@/components/home/Home1DiscoverySurface';
import HomepageOverlayA from '@/components/layers/HomepageOverlayA';
import HomepageOverlayB from '@/components/layers/HomepageOverlayB';
import HomepageOverlayC from '@/components/layers/HomepageOverlayC';
import HomepageUnderlayA from '@/components/layers/HomepageUnderlayA';
import HomepageUnderlayB from '@/components/layers/HomepageUnderlayB';
import MagazinePageShell from '@/components/layers/MagazinePageShell';
import { ensureHomeEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';

export default function HomePageCoverArtifact() {
  useEffect(() => {
    ensureHomeEconomyRuntime('/home/1');
  }, []);

  return (
    <MagazinePageShell
      bgImage="/tmi-curated/home1.jpg"
      bgColor="#050510"
      accent="#00FFFF"
      underlayA={<HomepageUnderlayA variant="cyan-fuchsia" />}
      underlayB={<HomepageUnderlayB variant="confetti" />}
      overlayA={
        <HomepageOverlayA
          labels={[
            {
              text: '#1',
              x: '2%',
              y: '22%',
              color: '#FFD700',
              fontSize: 80,
              opacity: 0.06,
              fontFamily: 'headline',
            },
            {
              text: 'Issue #47',
              x: '88%',
              y: '4%',
              color: '#00FFFF',
              fontSize: 11,
              opacity: 0.5,
              fontFamily: 'tech',
            },
            {
              text: 'Crown Series',
              x: '1.5%',
              y: '88%',
              color: '#FF2DAA',
              fontSize: 11,
              opacity: 0.5,
              fontFamily: 'tech',
              rotate: -90,
            },
          ]}
        />
      }
      overlayB={
        <HomepageOverlayB
          items={[
            { type: 'crown', x: '91%', y: '10%', size: 32, color: '#FFD700', opacity: 0.6 },
            { type: 'star', x: '3%', y: '12%', size: 20, color: '#FFD700', opacity: 0.45 },
            { type: 'star', x: '94%', y: '55%', size: 16, color: '#FF2DAA', opacity: 0.35 },
            { type: 'star', x: '1%', y: '60%', size: 18, color: '#00FFFF', opacity: 0.3 },
          ]}
        />
      }
      overlayC={
        <HomepageOverlayC
          items={[
            {
              text: 'Voting Live',
              x: '88%',
              y: '82%',
              color: '#FF2DAA',
              fontSize: 10,
              pulse: true,
              badge: true,
            },
            {
              text: 'Crown Updating',
              x: '1.5%',
              y: '15%',
              color: '#FFD700',
              fontSize: 10,
              pulse: true,
              badge: true,
            },
          ]}
        />
      }
    >
      <Home1DiscoverySurface />
    </MagazinePageShell>
  );
}

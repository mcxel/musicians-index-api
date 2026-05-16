'use client';
import { useEffect } from 'react';

/**
 * HomePage03.artifact.tsx
 * Home 3 — Live World
 * Layered magazine artifact wrapping Home3LiveWorldSurface.
 *
 * Layer 0: Magazine shell (green spine — live color)
 * Layer 1: Live venue background (/tmi-curated/venue-10.jpg)
 * Layer 2: Live world ambient — green orbs, streaming beams
 * Layer 3: Orb drift particles
 * Layer 4: Home3LiveWorldSurface (rooms, lobby wall, live activity)
 * Layer 5: Room numerals, occupancy labels
 * Layer 6: Live badge artifact
 * Layer 7: "Live Now" / "00 Active" floating text
 */

import Home3LiveWorldSurface from '@/components/home/Home3LiveWorldSurface';
import HomepageOverlayA from '@/components/layers/HomepageOverlayA';
import HomepageOverlayB from '@/components/layers/HomepageOverlayB';
import HomepageOverlayC from '@/components/layers/HomepageOverlayC';
import HomepageUnderlayA from '@/components/layers/HomepageUnderlayA';
import HomepageUnderlayB from '@/components/layers/HomepageUnderlayB';
import MagazinePageShell from '@/components/layers/MagazinePageShell';
import { ensureHomeEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';

export default function HomePage03Artifact() {
  useEffect(() => {
    ensureHomeEconomyRuntime('/home/3');
  }, []);

  return (
    <MagazinePageShell
      bgImage="/tmi-curated/venue-10.jpg"
      bgColor="#040e08"
      accent="#00FF88"
      underlayA={<HomepageUnderlayA variant="live-world" />}
      underlayB={<HomepageUnderlayB variant="orbs" />}
      overlayA={
        <HomepageOverlayA
          labels={[
            {
              text: 'Live',
              x: '2%',
              y: '22%',
              color: '#00FF88',
              fontSize: 80,
              opacity: 0.05,
              fontFamily: 'headline',
            },
            {
              text: 'Room 001',
              x: '89%',
              y: '4%',
              color: '#00FF88',
              fontSize: 11,
              opacity: 0.45,
              fontFamily: 'tech',
            },
            {
              text: 'Live World',
              x: '1.5%',
              y: '88%',
              color: '#00FFFF',
              fontSize: 10,
              opacity: 0.4,
              fontFamily: 'tech',
              rotate: -90,
            },
            {
              text: '●',
              x: '3%',
              y: '38%',
              color: '#00FF88',
              fontSize: 18,
              opacity: 0.35,
              fontFamily: 'headline',
            },
          ]}
        />
      }
      overlayB={
        <HomepageOverlayB
          items={[
            { type: 'star', x: '2%', y: '10%', size: 18, color: '#00FF88', opacity: 0.4 },
            { type: 'star', x: '92%', y: '52%', size: 16, color: '#00FFFF', opacity: 0.35 },
          ]}
        />
      }
      overlayC={
        <HomepageOverlayC
          items={[
            {
              text: 'Live Now',
              x: '89%',
              y: '82%',
              color: '#00FF88',
              fontSize: 10,
              pulse: true,
              badge: true,
            },
            {
              text: 'Rooms Active',
              x: '2%',
              y: '15%',
              color: '#00FFFF',
              fontSize: 10,
              pulse: true,
              badge: true,
            },
          ]}
        />
      }
    >
      <Home3LiveWorldSurface />
    </MagazinePageShell>
  );
}

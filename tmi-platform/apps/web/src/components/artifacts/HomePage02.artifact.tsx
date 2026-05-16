'use client';
import { useEffect } from 'react';

/**
 * HomePage02.artifact.tsx
 * Home 2 — Editorial / News Desk
 * Layered magazine artifact wrapping Home2NewsDeskSurface.
 *
 * Layer 0: Magazine shell (fuchsia spine)
 * Layer 1: Editorial board background (/tmi-curated/mag-35.jpg)
 * Layer 2: Editorial ambient sparks — fuchsia/gold
 * Layer 3: Spark particles
 * Layer 4: Home2NewsDeskSurface (news cards, interviews)
 * Layer 5: Issue labels, "TMI #47" numerals, genre labels
 * Layer 6: Featured badge artifact
 * Layer 7: "This Week" / "Feature Story" floating text
 */

import Home2NewsDeskSurface from '@/components/home/Home2NewsDeskSurface';
import HomepageOverlayA from '@/components/layers/HomepageOverlayA';
import HomepageOverlayB from '@/components/layers/HomepageOverlayB';
import HomepageOverlayC from '@/components/layers/HomepageOverlayC';
import HomepageUnderlayA from '@/components/layers/HomepageUnderlayA';
import HomepageUnderlayB from '@/components/layers/HomepageUnderlayB';
import MagazinePageShell from '@/components/layers/MagazinePageShell';
import { ensureHomeEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';

export default function HomePage02Artifact() {
  useEffect(() => {
    ensureHomeEconomyRuntime('/home/2');
  }, []);

  return (
    <MagazinePageShell
      bgImage="/tmi-curated/mag-35.jpg"
      bgColor="#060410"
      accent="#FF2DAA"
      underlayA={<HomepageUnderlayA variant="editorial" />}
      underlayB={<HomepageUnderlayB variant="sparks" />}
      overlayA={
        <HomepageOverlayA
          labels={[
            {
              text: 'Editorial',
              x: '2%',
              y: '22%',
              color: '#FF2DAA',
              fontSize: 72,
              opacity: 0.05,
              fontFamily: 'headline',
            },
            {
              text: 'TMI #47',
              x: '89%',
              y: '4%',
              color: '#FF2DAA',
              fontSize: 11,
              opacity: 0.5,
              fontFamily: 'tech',
            },
            {
              text: 'Music News',
              x: '1.5%',
              y: '88%',
              color: '#FFD700',
              fontSize: 10,
              opacity: 0.45,
              fontFamily: 'tech',
              rotate: -90,
            },
            {
              text: 'EXCLUSIVE',
              x: '3%',
              y: '34%',
              color: '#FFD700',
              fontSize: 9,
              opacity: 0.4,
              fontFamily: 'tech',
            },
          ]}
        />
      }
      overlayB={
        <HomepageOverlayB
          items={[
            { type: 'featured-badge', x: '60%', y: '4%', size: 16, color: '#FF2DAA', opacity: 0.5 },
            { type: 'star', x: '3%', y: '10%', size: 20, color: '#FFD700', opacity: 0.4 },
            { type: 'star', x: '91%', y: '55%', size: 16, color: '#FF2DAA', opacity: 0.3 },
          ]}
        />
      }
      overlayC={
        <HomepageOverlayC
          items={[
            { text: 'This Week', x: '89%', y: '82%', color: '#FF2DAA', fontSize: 10, badge: true },
            {
              text: 'Feature Story',
              x: '2%',
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
      <Home2NewsDeskSurface />
    </MagazinePageShell>
  );
}

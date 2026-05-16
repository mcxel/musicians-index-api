'use client';
import { useEffect } from 'react';

/**
 * HomePage04.artifact.tsx
 * Home 4 — Sponsor Marketplace
 * Layered magazine artifact wrapping Home4SponsorSurface.
 *
 * Layer 0: Magazine shell (gold spine — premium color)
 * Layer 1: Sponsor marketplace background (/tmi-curated/venue-22.jpg)
 * Layer 2: Gold ambient glow — sponsor premium feel
 * Layer 3: Gold dust shimmer
 * Layer 4: Home4SponsorSurface (inventory, analytics, deals)
 * Layer 5: Placement labels, "Inventory", campaign numbers
 * Layer 6: Featured sponsor badge
 * Layer 7: "New Deals" / "Inventory Live" floating text
 */

import Home4SponsorSurface from '@/components/home/Home4SponsorSurface';
import HomepageOverlayA from '@/components/layers/HomepageOverlayA';
import HomepageOverlayB from '@/components/layers/HomepageOverlayB';
import HomepageOverlayC from '@/components/layers/HomepageOverlayC';
import HomepageUnderlayA from '@/components/layers/HomepageUnderlayA';
import HomepageUnderlayB from '@/components/layers/HomepageUnderlayB';
import MagazinePageShell from '@/components/layers/MagazinePageShell';
import { ensureHomeEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';

export default function HomePage04Artifact() {
  useEffect(() => {
    ensureHomeEconomyRuntime('/home/4');
  }, []);

  return (
    <MagazinePageShell
      bgImage="/tmi-curated/venue-22.jpg"
      bgColor="#070608"
      accent="#FFD700"
      underlayA={<HomepageUnderlayA variant="sponsor" />}
      underlayB={<HomepageUnderlayB variant="gold-dust" />}
      overlayA={
        <HomepageOverlayA
          labels={[
            {
              text: 'Sponsor',
              x: '2%',
              y: '22%',
              color: '#FFD700',
              fontSize: 64,
              opacity: 0.05,
              fontFamily: 'headline',
            },
            {
              text: 'Marketplace',
              x: '76%',
              y: '4%',
              color: '#FFD700',
              fontSize: 11,
              opacity: 0.45,
              fontFamily: 'tech',
            },
            {
              text: 'Ad Inventory',
              x: '1.5%',
              y: '88%',
              color: '#FF6B35',
              fontSize: 10,
              opacity: 0.4,
              fontFamily: 'tech',
              rotate: -90,
            },
            {
              text: 'Premium',
              x: '3%',
              y: '36%',
              color: '#FFD700',
              fontSize: 9,
              opacity: 0.35,
              fontFamily: 'tech',
            },
          ]}
        />
      }
      overlayB={
        <HomepageOverlayB
          items={[
            { type: 'featured-badge', x: '56%', y: '4%', size: 16, color: '#FFD700', opacity: 0.5 },
            { type: 'star', x: '2%', y: '10%', size: 22, color: '#FFD700', opacity: 0.45 },
            { type: 'star', x: '91%', y: '60%', size: 18, color: '#FF6B35', opacity: 0.35 },
          ]}
        />
      }
      overlayC={
        <HomepageOverlayC
          items={[
            {
              text: 'New Deals',
              x: '88%',
              y: '82%',
              color: '#FFD700',
              fontSize: 10,
              pulse: true,
              badge: true,
            },
            {
              text: 'Inventory Live',
              x: '2%',
              y: '15%',
              color: '#FF6B35',
              fontSize: 10,
              badge: true,
            },
          ]}
        />
      }
    >
      <Home4SponsorSurface />
    </MagazinePageShell>
  );
}

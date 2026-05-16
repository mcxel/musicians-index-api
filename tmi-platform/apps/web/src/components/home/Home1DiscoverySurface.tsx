'use client';
import { useEffect, useState } from 'react';
import Home1CoverCompressionLayer from './Home1CoverCompressionLayer';
import Home1Top10DoubleSpreaded from './Home1Top10DoubleSpreaded';
import Home1EditorialBelt from './Home1EditorialBelt';
import Home1DiscoveryBelt from './Home1DiscoveryBelt';
import Home1PlatformBelt from './Home1PlatformBelt';
import Home1MagazineCoverHero from './Home1MagazineCoverHero';
import Home1CrownWinnerModule from './Home1CrownWinnerModule';
import GlobalTopNavRail from './GlobalTopNavRail';
import BreakingNewsTicker from './BreakingNewsTicker';
import SponsorTickerRail from './SponsorTickerRail';
import Home1CrownDensityRail from './Home1CrownDensityRail';
import TmiPaperNoise from '@/components/underlays/TmiPaperNoise';
import TmiGridFog from '@/components/underlays/TmiGridFog';
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import { VisualAutoFillRuntime } from '@/lib/ai-visuals/VisualAutoFillRuntime';
import "@/styles/tmiTypography.css";

export default function Home1DiscoverySurface() {
  enforceRouteOwnership('/home/1');

  const [heroImageRef, setHeroImageRef] = useState<string | null>(null);

  useEffect(() => {
    const existing = getVisualSlot('home-1-hero')?.images?.[0] ?? null;
    if (existing) {
      setHeroImageRef(existing);
      return;
    }

    const result = VisualAutoFillRuntime.ensureHomepageHeroVisual('/home/1');
    if (result.imageRef) {
      setHeroImageRef(result.imageRef);
    }
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, rgba(255,45,170,0.15), transparent 40%), radial-gradient(circle at 90% 80%, rgba(0,255,255,0.15), transparent 40%), #050510',
        color: '#fff',
        paddingBottom: 80,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Global underlays */}
      <TmiPaperNoise opacity={0.018} />
      <TmiGridFog color="#00FFFF" opacity={0.018} gridSize={60} />

      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <Home1CrownDensityRail />

      {/* Live Top 10 crown engine */}
      <Home1MagazineCoverHero heroImageRef={heroImageRef} />

      {/* Crown winner module */}
      <Home1CrownWinnerModule />

      {/* Top 10 double spread */}
      <Home1Top10DoubleSpreaded />

      {/* Quick entry rail (secondary) */}
      <Home1CoverCompressionLayer />

      {/* Editorial belt */}
      <Home1EditorialBelt />

      {/* Discovery belt */}
      <Home1DiscoveryBelt />

      {/* Platform belt */}
      <Home1PlatformBelt />
    </main>
  );
}

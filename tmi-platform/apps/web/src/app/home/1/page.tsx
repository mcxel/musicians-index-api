import React from 'react';
import Home1CoverPage from '@/components/home/Home1CoverPage';
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import { sortPerformersByFreshness } from '@/lib/content/ContentFreshness';
import { PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry';

// Rule 12: No Empty Inventory — derive sponsor rail from registry, not hardcoded strings
const RAIL_ZONES = [
  'home-1-sp-0','home-1-sp-1','home-1-sp-2','home-1-sp-3',
  'home-1-sp-4','home-1-sp-5','home-1-sp-6','home-1-sp-7',
];

function buildSponsorEntry(zone: string) {
  const slot = getAdSlotForZone(zone);
  if (slot.type === 'paid' && slot.sponsor) {
    return { id: zone, name: slot.sponsor.name, tagline: slot.sponsor.tagline };
  }
  if (slot.type === 'platform' && slot.platformPromo) {
    return { id: zone, name: slot.platformPromo.headline, tagline: slot.platformPromo.ctaLabel };
  }
  return { id: zone, name: 'ADVERTISE ON TMI', tagline: 'Reach live audiences · from $25' };
}

export default function Home1Route() {
  // Rule 11: Content Freshness — LIVE → RECENT → POPULAR → ARCHIVE
  const liveFirstPerformers = sortPerformersByFreshness(PERFORMER_REGISTRY);
  const liveCount = liveFirstPerformers.filter(p => p.isLive).length;
  const sponsors = RAIL_ZONES.map(buildSponsorEntry);

  return (
    <>
      <SponsorRail sponsors={sponsors} zone="home-1-top" />
      <Home1CoverPage />
      <EventReel zone="home-1" />

      {/* Rule 6: Discovery Rails — no dead ends */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>
        <DiscoveryRail type="performers" label={`🔴 ${liveCount} ARTISTS LIVE NOW`} accentColor="#E63000" />
        <DiscoveryRail type="articles" label="📰 MAGAZINE" accentColor="#FF2DAA" />
        <DiscoveryRail type="games" label="🎮 BATTLES & GAMES" accentColor="#AA2DFF" />
        <DiscoveryRail type="sponsors" label="💼 SPONSORS" accentColor="#FFD700" />
      </div>
    </>
  );
}

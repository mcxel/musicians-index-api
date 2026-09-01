import React from 'react';
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";
import Home1CoverPage from '@/components/home/Home1CoverPage';
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import ShowsReleasesMarquee from '@/components/events/ShowsReleasesMarquee';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import { sortPerformersByFreshness } from '@/lib/content/ContentFreshness';
import { PERFORMER_REGISTRY, type PerformerIdentity } from '@/lib/performers/PerformerRegistry';
import { getActiveSessionsDurable } from '@/lib/broadcast/GlobalLiveSessionRegistry.server';
import type { LiveSession } from '@/lib/broadcast/globalLiveSessionStore';
import { resolveSameOriginApiAbsolute } from '@/lib/runtime/canonicalEndpointResolver';

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
  if (slot.type === 'adnetwork') {
    return { id: zone, name: 'AD NETWORK', tagline: 'Google AdSense inventory' };
  }
  return { id: zone, name: 'ADVERTISE ON TMI', tagline: 'Reach live audiences · from $25' };
}

async function fetchPerformersWithRealAvatars(): Promise<PerformerIdentity[]> {
  try {
    // Same-origin Next API only — never NEXT_PUBLIC_API_URL → localhost:3002
    const h = await headers();
    const url = resolveSameOriginApiAbsolute('/api/performers', {
      host: h.get('x-forwarded-host') ?? h.get('host'),
      proto: h.get('x-forwarded-proto'),
    });
    const res = await fetch(url, {
      cache: 'no-store', // Always fresh for avatar propagation
    });
    if (!res.ok) throw new Error('Failed to fetch performers');
    const data = await res.json() as { performers?: PerformerIdentity[] };
    return data.performers || PERFORMER_REGISTRY;
  } catch (error) {
    // Fallback to hardcoded registry if API fails
    console.warn('Failed to fetch dynamic performers, using registry fallback:', error);
    return PERFORMER_REGISTRY;
  }
}

async function enrichPerformersWithRealLiveness(performers: PerformerIdentity[]): Promise<PerformerIdentity[]> {
  const noLiveness = performers.map(p => ({ ...p, isLive: false }));
  try {
    const liveSessions = await Promise.race([
      getActiveSessionsDurable(),
      new Promise<LiveSession[]>((resolve) => setTimeout(() => resolve([]), 3500)),
    ]);
    const liveUserIds = new Set(liveSessions.map((s: LiveSession) => s.userId));
    return performers.map(p => ({ ...p, isLive: liveUserIds.has(p.id) }));
  } catch {
    return noLiveness;
  }
}

export default async function Home1Route() {
  // P0 Avatar Certification: Fetch performers with real avatar data from Prisma
  const performers = await fetchPerformersWithRealAvatars();

  // A1: Merge real liveness from durable GlobalLiveSessionRegistry (DB-backed)
  const enrichedPerformers = await enrichPerformersWithRealLiveness(performers);

  // Rule 11: Content Freshness — LIVE → RECENT → POPULAR → ARCHIVE
  const liveFirstPerformers = sortPerformersByFreshness(enrichedPerformers);
  const liveCount = liveFirstPerformers.filter(p => p.isLive).length;
  const sponsors = RAIL_ZONES.map(buildSponsorEntry);

  return (
    <>
      <SponsorRail sponsors={sponsors} zone="home-1-top" />
      <Home1CoverPage />
      <ShowsReleasesMarquee zone="home-1" />
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

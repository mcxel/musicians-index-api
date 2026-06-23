import type { Metadata } from 'next';
import Home3LiveWorldSurface from "@/components/home/Home3LiveWorldSurface";
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import { sortPerformersByFreshness } from '@/lib/content/ContentFreshness';
import { PERFORMER_REGISTRY, type PerformerIdentity } from '@/lib/performers/PerformerRegistry';
import { getActiveSessions } from '@/lib/broadcast/GlobalLiveSessionRegistry';

export const metadata: Metadata = {
  title: "Live World — Active Rooms, Events & Live Shows",
  description: "Watch live music rooms, join events, and interact with performers in real time on The Musician's Index. The live venue world is open now.",
  openGraph: {
    title: "Live Music Rooms & Events | The Musician's Index",
    description: "Join active live rooms, watch performers, tip your favorites, and experience the live venue world in real time.",
    url: "https://themusiciansindex.com/home/3",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "TMI Live World" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Music Rooms | TMI Magazine",
    description: "Join active live rooms, watch performers, and experience the live venue world in real time.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
};

// Rule 12: No Empty Inventory
function buildSponsorEntry(zone: string) {
  const slot = getAdSlotForZone(zone);
  if (slot.type === 'paid' && slot.sponsor) return { id: zone, name: slot.sponsor.name, tagline: slot.sponsor.tagline };
  if (slot.type === 'platform' && slot.platformPromo) return { id: zone, name: slot.platformPromo.headline, tagline: slot.platformPromo.ctaLabel };
  return { id: zone, name: 'ADVERTISE ON TMI', tagline: 'Reach live audiences · from $25' };
}

function enrichPerformersWithRealLiveness(performers: PerformerIdentity[]): PerformerIdentity[] {
  const liveSessions = getActiveSessions();
  const liveUserIds = new Set(liveSessions.map(s => s.userId));
  return performers.map(p => ({
    ...p,
    isLive: liveUserIds.has(p.id),
  }));
}

export default function Home3Page() {
  // Rule 11: Content Freshness — live rooms first (LIVE > RECENT > POPULAR > ARCHIVE)
  // A1: Merge real liveness from GlobalLiveSessionRegistry (not stale registry.isLive)
  const enrichedPerformers = enrichPerformersWithRealLiveness(PERFORMER_REGISTRY);
  const liveFirstPerformers = sortPerformersByFreshness(enrichedPerformers);
  const liveCount = liveFirstPerformers.filter(p => p.isLive).length;

  const sponsors = ['home-3-sp-0','home-3-sp-1','home-3-sp-2','home-3-sp-3',
                    'home-3-sp-4','home-3-sp-5','home-3-sp-6','home-3-sp-7'].map(buildSponsorEntry);

  return (
    <>
      <SponsorRail sponsors={sponsors} zone="home-3-top" />
      <Home3LiveWorldSurface />
      <EventReel zone="home-3" />

      {/* Rule 6: Discovery Rails — Live World keeps users in the live ecosystem */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>
        <DiscoveryRail type="liveRooms" label={`🔴 ${liveCount} LIVE — JOIN NOW`} accentColor="#E63000" />
        <DiscoveryRail type="performers" label="🎤 ALL ARTISTS" accentColor="#00E5FF" />
        <DiscoveryRail type="games" label="⚔️ BATTLES & CYPHERS" accentColor="#AA2DFF" />
        <DiscoveryRail type="venues" label="🏟️ VENUES" accentColor="#FF6B35" />
      </div>
    </>
  );
}

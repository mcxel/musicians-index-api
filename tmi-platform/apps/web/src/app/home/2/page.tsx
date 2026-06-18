import type { Metadata } from 'next';
import Home2NewsDeskSurface from "@/components/home/Home2NewsDeskSurface";
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import { sortArticlesByFreshness } from '@/lib/content/ContentFreshness';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

export const metadata: Metadata = {
  title: "News Desk — Music News, Interviews & Studio Recaps",
  description: "Breaking music news, exclusive artist interviews, studio recaps, and genre discovery on The Musician's Index Magazine.",
  openGraph: {
    title: "Music News & Interviews | The Musician's Index",
    description: "Breaking music news, exclusive artist interviews, studio recaps, and discovery. Your editorial home for the scene.",
    url: "https://themusiciansindex.com/home/2",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "TMI News Desk" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music News & Interviews | TMI Magazine",
    description: "Breaking music news, exclusive artist interviews, studio recaps, and discovery.",
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

export default function Home2Page() {
  // Rule 11: Content Freshness — breaking news first, then recent, then popular, then archive
  const freshArticles = sortArticlesByFreshness(MAGAZINE_ISSUE_1);
  const breakingCount = freshArticles.filter(a => {
    const age = Date.now() - new Date(a.publishedAt).getTime();
    return age < 48 * 60 * 60 * 1000;
  }).length;

  const sponsors = ['home-2-sp-0','home-2-sp-1','home-2-sp-2','home-2-sp-3',
                    'home-2-sp-4','home-2-sp-5','home-2-sp-6','home-2-sp-7'].map(buildSponsorEntry);

  return (
    <>
      <SponsorRail sponsors={sponsors} zone="home-2-top" />
      <Home2NewsDeskSurface />
      <EventReel zone="home-2" />

      {/* Rule 6: Discovery Rails — Magazine surface keeps users in the content graph */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>
        <DiscoveryRail type="articles" label={breakingCount > 0 ? `🔥 ${breakingCount} BREAKING STORIES` : '📰 LATEST STORIES'} accentColor="#FF2DAA" />
        <DiscoveryRail type="performers" label="🎤 FEATURED ARTISTS" accentColor="#00E5FF" />
        <DiscoveryRail type="liveRooms" label="🎥 LIVE NOW" accentColor="#E63000" />
        <DiscoveryRail type="sponsors" label="💼 PARTNERS" accentColor="#FFD700" />
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import Home1CoverPage from '@/components/home/Home1CoverPage';
import TmiMagazineOrbitalUnderlay from '@/components/home/TmiMagazineOrbitalUnderlay';
import WorldLobbySection from '@/components/home/WorldLobbySection';
import BillboardContentFeed from '@/components/media/BillboardContentFeed';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';

export const metadata: Metadata = {
  title: "The Musician's Index — Live Music Platform",
  description: "The Musician's Index is a live interactive music platform where artists battle, fans vote, venues broadcast, and music discovery happens in real time.",
  openGraph: {
    title: "The Musician's Index | Your Stage. Be Original.",
    description: "Live battles, cyphers, shows, artist discovery, and fan engagement — all on one platform. The scene is live right now.",
    url: "https://themusiciansindex.com/home/1",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "The Musician's Index — Live Music Platform" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Musician's Index | Your Stage. Be Original.",
    description: "Live battles, cyphers, shows, artist discovery, and fan engagement — all on one platform.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
};

export default function Home1Page() {
  return (
    <>
      {/* 1. Magazine header — masthead, badges, challenge banner, action buttons */}
      <Home1CoverPage />

      {/* 2. Orbital + Tabloid Underlay — scrolling editorial panels + live crown wheel */}
      <TmiMagazineOrbitalUnderlay />

      {/* Slot A — horizontal banner between orbital and venue lobby */}
      <div style={{ padding: "10px 16px", background: "rgba(5,5,16,0.98)" }}>
        <UnifiedAdSlot venue="home-1" slotKey="homepageBanner" format="horizontal" accentColor="#00FFFF" />
      </div>

      {/* 3. Live World — all active venues, hero presence, revenue hooks */}
      <WorldLobbySection />

      {/* Slot B — rectangle mid-page between lobby and content feed */}
      <div style={{ padding: "10px 16px", background: "rgba(5,5,16,0.98)" }}>
        <UnifiedAdSlot venue="home-1" slotKey="homepageMid" format="rectangle" accentColor="#FF2DAA" />
      </div>

      {/* 4. Content feed — Live Now / Recent Uploads / Trending / Battles / Cyphers */}
      <section className="relative w-full py-12 px-4 sm:px-8 bg-[#050510] z-20">
        <div className="max-w-6xl mx-auto">
          <BillboardContentFeed defaultTab="live" maxItems={6} accentColor="#00FFFF" />
        </div>
      </section>
    </>
  );
}

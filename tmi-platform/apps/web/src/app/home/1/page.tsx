import type { Metadata } from 'next';
import Home1CoverPage from '@/components/home/Home1CoverPage';
import TmiMagazineOrbitalUnderlay from '@/components/home/TmiMagazineOrbitalUnderlay';
import WorldLobbySection from '@/components/home/WorldLobbySection';

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
      {/* 1. Magazine identity — masthead, editorial belt, stories, crown tiles */}
      <Home1CoverPage />
      {/* 2. Orbital + Tabloid Underlay — full-screen scrolling panels + orbit wheel */}
      <TmiMagazineOrbitalUnderlay />
      {/* 3. Live World — all active venues, billboard, revenue hooks */}
      <WorldLobbySection />
    </>
  );
}

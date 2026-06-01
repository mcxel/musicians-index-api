import type { Metadata } from 'next';
import Home1CoverPage from '@/components/home/Home1CoverPage';
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
      {/* Magazine identity — featured stories, artists, discovery */}
      <Home1CoverPage />
      {/* Live World — all active venues, billboard, revenue hooks */}
      <WorldLobbySection />
    </>
  );
}

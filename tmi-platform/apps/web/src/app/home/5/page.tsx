import type { Metadata } from 'next';
import Home5BattleCypherSurface from "@/components/home/Home5BattleCypherSurface";
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';

const SEED_SPONSORS = [
  { id: 'amplify',   name: 'AMPLIFY RECORDS',     tagline: 'Platinum Partner' },
  { id: 'beatlab',   name: 'BEATLAB STUDIOS',      tagline: 'Gold Partner'    },
  { id: 'velocity',  name: 'VELOCITY AUDIO',       tagline: 'Gold Partner'    },
  { id: 'nova',      name: 'NOVA MEDIA GROUP',     tagline: 'Silver Partner'  },
  { id: 'crown',     name: 'CROWN & CO.',          tagline: ''                },
  { id: 'frequency', name: 'FREQUENCY LABS',       tagline: ''                },
  { id: 'vault',     name: 'THE VAULT COLLECTIVE', tagline: ''                },
  { id: 'sonic',     name: 'SONIC AXIS',           tagline: ''                },
];

export const metadata: Metadata = {
  title: "CBC Arena — Battles, Challenges & Cyphers",
  description: "Enter the TMI battle arena. Watch live 1v1 rap battles, join cyphers, challenge opponents, and vote for champions. Weekly belts. Monthly trophies. Yearly crowns.",
  openGraph: {
    title: "Live Music Battles & Cyphers | The Musician's Index",
    description: "1v1 battles, open cyphers, song challenges, and fan-voted championships. The arena is live. Enter now.",
    url: "https://themusiciansindex.com/home/5",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "TMI CBC Battle Arena" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Music Battles | TMI Magazine",
    description: "1v1 battles, open cyphers, and fan-voted championships. The arena is live.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
};

export default function Home5Page() {
  return (
    <>
      <SponsorRail sponsors={SEED_SPONSORS} zone="home-5-top" />
      <Home5BattleCypherSurface />
      <EventReel zone="home-5" />
    </>
  );
}

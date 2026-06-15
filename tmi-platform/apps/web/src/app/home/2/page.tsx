import type { Metadata } from 'next';
import Home2NewsDeskSurface from "@/components/home/Home2NewsDeskSurface";
import SponsorRail from '@/components/sponsors/SponsorRail';

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

export default function Home2Page() {
  return (
    <>
      <SponsorRail sponsors={SEED_SPONSORS} zone="home-2-top" />
      <Home2NewsDeskSurface />
    </>
  );
}

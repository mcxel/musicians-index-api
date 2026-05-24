import type { Metadata } from 'next';
import Home3LiveWorldSurface from "@/components/home/Home3LiveWorldSurface";

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

export default function Home3Page() {
  return <Home3LiveWorldSurface />;
}

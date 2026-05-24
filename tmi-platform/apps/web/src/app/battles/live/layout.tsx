import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Live Battles — CBC Arena",
  description: "Watch and vote in live 1v1 music battles right now on The Musician's Index. Active arenas, real-time fan voting, predictions, and winner ceremonies.",
  openGraph: {
    title: "Live Music Battles | The Musician's Index",
    description: "Watch live 1v1 battles, vote in real time, place predictions, and witness winner ceremonies. The arena is hot.",
    url: "https://themusiciansindex.com/battles/live",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "TMI Live Battle Arena" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Music Battles | TMI",
    description: "Watch live 1v1 battles, vote in real time, place predictions. The arena is hot.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
};

export default function BattlesLiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

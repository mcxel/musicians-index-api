import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Battle Rankings — TMI Power Table",
  description: "The definitive TMI battle rankings. Top fighters, win/loss records, XP leaders, prize earnings, and championship standings for Season 2026.",
  openGraph: {
    title: "TMI Battle Rankings — Season 2026",
    description: "Who's on top? Full power table with wins, losses, streaks, prize pools, and live championship standings. Updated after every battle.",
    url: "https://themusiciansindex.com/battles/rankings",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "TMI Battle Rankings" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TMI Battle Rankings | Season 2026",
    description: "Who's on top? Full power table — wins, losses, streaks, prize pools, championship standings.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
};

export default function BattlesRankingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import AudioProvider from '@/components/AudioProvider';
import { NextAuthProvider } from '@/components/NextAuthProvider';
import { OriginalityNote } from '@/components/layout/OriginalityNote';
import { PresenceHeartbeat } from '@/components/layout/PresenceHeartbeat';
import { MagazineNavSystem } from '@/components/tmi/nav/MagazineNavSystem';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://themusiciansindex.com'),
  title: "The Musician’s Index Magazine — 80s Neon Music Universe",
  description:
    "The Musician’s Index Magazine (TMI): articles, streaming rooms, fan economy, and creator tools. Explore Stream And Win Radio, The Law Bubble, Thunder World, Hot Screens, Mini Ace, WillDoIt, Rent-A-Charge, Need A Charge, Berntout Perductions, Big Kazhdog, and B.J.M Beats.",
  keywords:
    [
      // Core umbrella + magazine
      "berntoutglobal",
      "berntoutglobal xxl",
      "the musician's index",
      "the musicians index",
      "tmi magazine",
      "music magazine",
      "80s neon magazine",
      "artist promotion",
      "music streaming rooms",
      "fan economy",
      "music platform",

      // Products to index (NO Boardroom)
      "hot screens",
      "hotscreens",
      "the mini ace",
      "mini ace",
      "thunder world",
      "stream and win radio",
      "streamwin",
      "danika's law",
      "willdoit",
      "rent a charge",
      "rent-a-charge",
      "need a charge",
      "the law bubble",
      "law bubble",

      // Berntout Perductions + spelling for search
      "berntout perductions",
      "berntout productions",

      // Artists / labels
      "big kazhdog",
      "b.j.m beats",
      "bjm beats",
    ].join(", "),
  alternates: {
    canonical: "https://themusiciansindex.com",
  },
  openGraph: {
    title: "The Musician’s Index Magazine — BerntoutGlobal XXL",
    description:
      "TMI Magazine + creator universe: Stream And Win Radio, The Law Bubble, Thunder World, Hot Screens, Mini Ace, WillDoIt, Rent-A-Charge, Need A Charge, Berntout Perductions, Big Kazhdog, B.J.M Beats.",
    url: "https://themusiciansindex.com",
    siteName: "BerntoutGlobal XXL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Musician’s Index Magazine — BerntoutGlobal XXL",
    description:
      "TMI Magazine + creator universe: Stream And Win Radio, The Law Bubble, Thunder World, Hot Screens, Mini Ace, WillDoIt, Rent-A-Charge, Need A Charge, Berntout Perductions, Big Kazhdog, B.J.M Beats.",
  },
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body>
        {/* Scanline Overlay */}
        <div className="scanlines" />
        
        <NextAuthProvider>
          <PresenceHeartbeat />
          <MagazineNavSystem />
          <AudioProvider>
            {children}
            <OriginalityNote />
          </AudioProvider>
        </NextAuthProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}

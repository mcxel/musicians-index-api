import type { Metadata } from 'next';
import './globals.css';
import AudioProvider from '@/components/AudioProvider';
import { NextAuthProvider } from '@/components/NextAuthProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://berntoutglobal.com'),
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
    canonical: "https://berntoutglobal.com",
  },
  openGraph: {
    title: "The Musician’s Index Magazine — BerntoutGlobal XXL",
    description:
      "TMI Magazine + creator universe: Stream And Win Radio, The Law Bubble, Thunder World, Hot Screens, Mini Ace, WillDoIt, Rent-A-Charge, Need A Charge, Berntout Perductions, Big Kazhdog, B.J.M Beats.",
    url: "https://berntoutglobal.com",
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
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Scanline Overlay */}
        <div className="scanlines" />
        
        <NextAuthProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

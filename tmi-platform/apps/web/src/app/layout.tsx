import type { Metadata } from "next";
import AppProviders from "@/components/providers";
import "./globals.css";
import "@/styles/tmiTypography.css";
import "@/styles/tmi/globals.css";
import { TmiSessionProvider } from "@/hooks/SessionContext";
import GamificationHUD from "@/components/hud/GamificationHUD";

export const metadata: Metadata = {
  title: {
    default: "The Musician's Index Magazine | Official Live Music Platform",
    template: "%s | The Musician's Index Magazine",
  },
  description: "The Musician's Index Magazine is a live interactive music platform where artists, performers, and fans connect, compete, and perform in real time through shows, battles, cyphers, and ranked music discovery.",
  metadataBase: new URL("https://themusiciansindex.com"),
  keywords: [
    "The Musician's Index", "TMI", "live music platform", "music battles",
    "artist ranking", "hip hop battles", "music competition", "live cypher",
    "artist discovery", "music magazine", "online music venue",
    "live music shows", "music competitions", "performers", "fans",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "https://themusiciansindex.com" },
  authors: [{ name: "The Musician's Index Magazine" }],
  creator: "The Musician's Index",
  publisher: "BernoutGlobal",
  openGraph: {
    title: "The Musician's Index Magazine",
    description: "The Musician's Index Magazine — a live interactive platform where artists, performers, and fans connect through music, shows, competitions, and real-time audience experiences.",
    siteName: "The Musician's Index",
    url: "https://themusiciansindex.com",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Musician's Index Magazine — Live Music Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Musician's Index Magazine",
    description: "Live music platform for artists, performers, and fans.",
    images: ["/og-image.jpg"],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://themusiciansindex.com/#website",
      "name": "The Musician's Index",
      "url": "https://themusiciansindex.com",
      "description": "The Musician's Index Magazine — a live interactive platform where artists, performers, and fans connect through music, shows, competitions, and real-time audience experiences.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://themusiciansindex.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://themusiciansindex.com/#organization",
      "name": "The Musician's Index",
      "alternateName": ["TMI", "The Musicians Index"],
      "url": "https://themusiciansindex.com",
      "description": "Live music competition platform for artists, fans, battles, cyphers, and ranked music discovery.",
      "founder": { "@type": "Person", "name": "Marcel Dickens" },
      "logo": {
        "@type": "ImageObject",
        "url": "https://themusiciansindex.com/og-image.jpg",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* Visually hidden — gives Google the primary H1 for indexing */}
        <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
          The Musician&apos;s Index Magazine — Live music platform for artists, performers, and fans.
        </h1>
        <AppProviders>
          <TmiSessionProvider>
            {children}
            <GamificationHUD />
          </TmiSessionProvider>
        </AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import AppProviders from "@/components/providers";
import "./globals.css";
import "@/styles/tmiTypography.css";
import "@/styles/tmi/globals.css";
import { TmiSessionProvider } from "@/hooks/SessionContext";

export const metadata: Metadata = {
  title: "The Musician's Index",
  description: "Join live music rooms, connect with artists, and perform in real time. The live arena where music is made, ranked, and rewarded.",
  metadataBase: new URL("https://themusiciansindex.com"),
  keywords: [
    "The Musician's Index", "TMI", "live music platform", "music battles",
    "artist ranking", "hip hop battles", "music competition", "live cypher",
    "artist discovery", "music magazine", "online music venue",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://themusiciansindex.com" },
  openGraph: {
    title: "The Musician's Index — Live Music World",
    description: "Join live music rooms, connect with artists, and perform in real time.",
    siteName: "The Musician's Index",
    url: "https://themusiciansindex.com",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Musician's Index — Live Music World",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Musician's Index — Live Music World",
    description: "Join live music rooms, connect with artists, and perform in real time.",
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
      "description": "Live music competition and artist discovery platform",
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
        <AppProviders>
          <TmiSessionProvider>
            {children}
          </TmiSessionProvider>
        </AppProviders>
      </body>
    </html>
  );
}

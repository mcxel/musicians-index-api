import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import FullAppShell from "@/components/layout/FullAppShell";
import { CANONICAL_RELEASE_MANIFEST } from "@/lib/system/TmiReleaseMigrationAuthority";
import { isAuthCriticalPath } from "@/lib/auth/isAuthCriticalPath";
import "./globals.css";
import "@/styles/tmiTypography.css";
import "@/styles/tmi/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "The Musician's Index Magazine | Official Live Music Platform",
    template: "%s | The Musician's Index Magazine",
  },
  description:
    "The Musician's Index Magazine is a live interactive music platform where artists, performers, and fans connect, compete, and perform in real time through shows, battles, cyphers, and ranked music discovery.",
  metadataBase: new URL("https://themusiciansindex.com"),
  keywords: [
    "The Musician's Index",
    "TMI",
    "live music platform",
    "music battles",
    "artist ranking",
    "hip hop battles",
    "music competition",
    "live cypher",
    "artist discovery",
    "music magazine",
    "online music venue",
    "live music shows",
    "music competitions",
    "performers",
    "fans",
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
    description:
      "The Musician's Index Magazine — a live interactive platform where artists, performers, and fans connect through music, shows, competitions, and real-time audience experiences.",
    siteName: "The Musician's Index",
    url: "https://themusiciansindex.com",
    type: "website",
    images: [
      {
        url: "https://themusiciansindex.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Musician's Index Magazine — Live Music Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@TMImagazine",
    creator: "@TMImagazine",
    title: "The Musician's Index Magazine",
    description: "Live music platform for artists, performers, and fans.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
  other: {
    "google-adsense-account": "ca-pub-4088577529436039",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "The Musician's Index Magazine",
      url: "https://themusiciansindex.com",
      description:
        "Live interactive music platform for artists, performers, and fans.",
    },
  ],
};

const ENABLE_AD_NETWORK_SCRIPTS =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_ENABLE_AD_NETWORK_SCRIPTS === "1";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get("x-pathname") ?? "";
  const authCritical = isAuthCriticalPath(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="tmi-release-id" content={CANONICAL_RELEASE_MANIFEST.releaseId} />
        <meta name="tmi-ui-schema" content={String(CANONICAL_RELEASE_MANIFEST.uiSchemaVersion)} />
        <meta name="tmi-cache-schema" content={String(CANONICAL_RELEASE_MANIFEST.cacheSchemaVersion)} />
        {/* BidVertiser verification */}
        {/* Bidvertiser2104976 */}
      </head>
      <body
        className="tmi-obsidian-cinematic overflow-x-hidden"
        data-build-sha={process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev"}
        data-auth-critical={authCritical ? "1" : "0"}
        data-tmi-release={CANONICAL_RELEASE_MANIFEST.releaseId}
        suppressHydrationWarning
      >
        <div
          id="bv-verify"
          dangerouslySetInnerHTML={{ __html: "<!-- Bidvertiser2104976 -->" }}
          style={{
            display: "none",
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
          }}
        />
        {process.env.NEXT_PUBLIC_MEDIANET_CID && (
          <Script
            id="medianet-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window._mNDetails = { loadStarted: true }; window._mNHandle = { queue: [] };`,
            }}
          />
        )}
        {process.env.NEXT_PUBLIC_AMAZON_PUB_ID && (
          <Script
            id="amazon-aps"
            strategy="afterInteractive"
            src="https://c.amazon-adsystem.com/aax2/apstag.js"
            onLoad={() => {
              const pubId = process.env.NEXT_PUBLIC_AMAZON_PUB_ID;
              if (!pubId) return;
              try {
                (window as any).apstag?.init({ pubID: pubId, adServer: "googletag" });
              } catch {}
            }}
          />
        )}
        {ENABLE_AD_NETWORK_SCRIPTS && process.env.NEXT_PUBLIC_INFOLINKS_WSID && (
          <>
            <Script id="infolinks-config" strategy="afterInteractive">
              {`
                var infolinks_pid = 3445854;
                var infolinks_wsid = ${process.env.NEXT_PUBLIC_INFOLINKS_WSID};
              `}
            </Script>
            <Script
              id="infolinks-main"
              strategy="afterInteractive"
              src="//resources.infolinks.com/js/infolinks_main.js"
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <h1
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          The Musician&apos;s Index Magazine — Live music platform for artists,
          performers, and fans.
        </h1>
        {authCritical ? children : <FullAppShell>{children}</FullAppShell>}
      </body>
    </html>
  );
}

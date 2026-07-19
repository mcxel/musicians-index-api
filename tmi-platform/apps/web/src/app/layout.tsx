import type { Metadata, Viewport } from "next";
import Script from "next/script";
import AppProviders from "@/components/providers";
import "./globals.css";
import "@/styles/tmiTypography.css";
import "@/styles/tmi/globals.css";
import HudRuntimeProvider from "@/components/hud/HudRuntimeProvider";
import { TmiSessionProvider } from "@/hooks/SessionContext";
import GamificationHUD from "@/components/hud/GamificationHUD";
import LiveSyncProvider from "@/components/media/LiveSyncProvider";
import FirstRunExperienceOverlay from "@/components/onboarding/FirstRunExperienceOverlay";
import TMIGlobalHUD from "@/components/hud/TMIGlobalHUD";
import BotRuntimeProvider from "@/components/providers/BotRuntimeProvider";
import BotProvider from "@/components/providers/BotProvider";
import ChevronNavigation from "@/components/navigation/ChevronNavigation";
import TMIGlobalNav from "@/components/system/TMIGlobalNav";
import { NavigationLock } from "@/components/navigation/NavigationLock";
import NavigationRuntime from "@/components/navigation/NavigationRuntime";
import NavigationRail from "@/components/nav/NavigationRail";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import { PWARegistration } from "@/components/mobile/PWARegistration";
import VoiceDirector from "@/components/hud/VoiceDirector";
import BetaModeBanner from "@/components/launch/BetaModeBanner";
import BetaStatusChip from "@/components/launch/BetaStatusChip";
import LiveFeedbackPanel from "@/components/feedback/LiveFeedbackPanel";
import { MonitorRuntimeProvider } from "@/components/monitor/MonitorRuntimeContext";
import MonitorRuntime from "@/components/monitor/MonitorRuntime";
import PlatformFooter from "@/components/layout/PlatformFooter";
import DiscoverySidePanel from "@/components/discovery/DiscoverySidePanel";
import { WatchSessionProvider } from "@/lib/presence/WatchSessionContext";
import PersistentMiniPlayer from "@/components/presence/PersistentMiniPlayer";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

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

const ENABLE_AD_NETWORK_SCRIPTS =
  process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_AD_NETWORK_SCRIPTS === "1";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* BidVertiser verification */}
        {/* Bidvertiser2104976 */}
        {ENABLE_AD_NETWORK_SCRIPTS && (
          <Script
            id="google-adsense"
            strategy="beforeInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4088577529436039"
            crossOrigin="anonymous"
          />
        )}
        {/* Media.net — Yahoo/Bing contextual ads */}
        {process.env.NEXT_PUBLIC_MEDIANET_CID && (
          <Script
            id="medianet-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window._mNDetails = { loadStarted: true }; window._mNHandle = { queue: [] };`,
            }}
          />
        )}
        {/* Amazon Publisher Services (APS) */}
        {process.env.NEXT_PUBLIC_AMAZON_PUB_ID && (
          <Script
            id="amazon-aps"
            strategy="afterInteractive"
            src="https://c.amazon-adsystem.com/aax2/apstag.js"
            onLoad={() => {
              const pubId = process.env.NEXT_PUBLIC_AMAZON_PUB_ID;
              if (!pubId) return;
              try {
                (window as any).apstag?.init({ pubID: pubId, adServer: 'googletag' });
              } catch {}
            }}
          />
        )}
        {/* Infolinks ad network global script */}
        {ENABLE_AD_NETWORK_SCRIPTS && (
          <>
            <Script id="infolinks-config" strategy="afterInteractive">
              {`
                var infolinks_pid = 3445854;
                var infolinks_wsid = 0;
              `}
            </Script>
            <Script
              id="infolinks-main"
              strategy="afterInteractive"
              src="//resources.infolinks.com/js/infolinks_main.js"
            />
          </>
        )}
      </head>
      <body className="tmi-obsidian-cinematic overflow-x-hidden">
        {/* BidVertiser site verification rendered as real HTML comment in page source */}
        <div id="bv-verify" dangerouslySetInnerHTML={{ __html: '<!-- Bidvertiser2104976 -->' }} style={{ display: 'none', position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
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
            <MonitorRuntimeProvider>
            <HudRuntimeProvider>
            <WatchSessionProvider>
              <PWARegistration />
              <BetaModeBanner />
              <BetaStatusChip />
              <BotProvider>
                {children}
                <PlatformFooter />
              </BotProvider>
              <PWAInstallPrompt />
              <NavigationRail />
              <TMIGlobalNav />
              <ChevronNavigation />
              <NavigationRuntime />
              <NavigationLock />
              <GamificationHUD />
              <LiveSyncProvider />
              <FirstRunExperienceOverlay />
              <TMIGlobalHUD />
              <BotRuntimeProvider />
              <VoiceDirector />
              <LiveFeedbackPanel />
              <MonitorRuntime />
              <DiscoverySidePanel />
              <PersistentMiniPlayer />
            </WatchSessionProvider>
            </HudRuntimeProvider>
            </MonitorRuntimeProvider>
          </TmiSessionProvider>
        </AppProviders>
      </body>
    </html>
  );
}

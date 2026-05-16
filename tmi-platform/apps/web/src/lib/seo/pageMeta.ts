import type { Metadata } from "next";

const BASE = {
  siteName: "The Musician's Index — TMI",
  baseUrl: "https://tmi.music",
  ogImage: "/og-default.png",
};

export function makeMeta(title: string, description: string, path: string): Metadata {
  return {
    title: `${title} | TMI`,
    description,
    openGraph: {
      title: `${title} | TMI`,
      description,
      type: "website",
      siteName: BASE.siteName,
      url: `${BASE.baseUrl}${path}`,
      images: [{ url: BASE.ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | TMI`,
      description,
    },
  };
}

export const PAGE_META: Record<string, Metadata> = {
  waitlist:        makeMeta("Join the Waitlist",            "Get early access to The Musician's Index — the ultimate platform for artists, fans, and the music industry.",  "/waitlist"),
  spotlight:       makeMeta("Artist Spotlight Packages",   "Get your music seen. Purchase a spotlight placement on the TMI homepage, magazine, and social feeds.",          "/spotlight"),
  gift:            makeMeta("Gift a Subscription",         "Give the gift of TMI — send a Pro or VIP subscription to any artist or fan in your life.",                     "/gift"),
  invite:          makeMeta("Invite Friends to TMI",       "Share your referral link and earn XP bonuses when your friends join The Musician's Index.",                    "/invite"),
  "go-live":       makeMeta("TMI Is Now Live",             "The Musician's Index is open. Create your profile, explore rooms, and start building your music career.",      "/go-live"),
  "beat-marketplace": makeMeta("Beat Marketplace",         "Buy and sell professional beat licenses on TMI. Producers earn 90% of every sale.",                          "/beat-marketplace"),
  "live-schedule": makeMeta("Live Schedule",               "See what's coming up on TMI — live rooms, cypher battles, Monday Stage events, and more.",                    "/live-schedule"),
  "hall-of-fame":  makeMeta("Hall of Fame",                "The most decorated artists and fans in TMI history. Crown holders, contest winners, and platform legends.",   "/hall-of-fame"),
};

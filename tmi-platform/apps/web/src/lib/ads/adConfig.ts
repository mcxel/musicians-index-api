/**
 * TMI AdSense configuration — single source for publisher id + slot env wiring.
 *
 * ENV (Vercel):
 *   NEXT_PUBLIC_ADSENSE_CLIENT_ID / NEXT_PUBLIC_ADSENSE_PUB_ID  → ca-pub-…
 *   NEXT_PUBLIC_ADSENSE_SLOT_*                                 → numeric slot ids
 *
 * Never ship placeholder ca-pub-tmi-platform or fake 1234567890 slot IDs.
 * Empty slot string = not configured yet (ENV/ops) — do not invent inventory.
 */

export const ADSENSE_PUBLISHER_ID_DEFAULT = "ca-pub-4088577529436039";

export function getAdSensePublisherId(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_ADSENSE_PUB_ID?.trim() ||
    "";
  if (fromEnv && fromEnv.startsWith("ca-pub-") && !fromEnv.includes("tmi-platform")) {
    return fromEnv;
  }
  return ADSENSE_PUBLISHER_ID_DEFAULT;
}

/** @deprecated use getAdSensePublisherId() — kept for existing imports */
export const ADSENSE_PUBLISHER_ID = getAdSensePublisherId();

export type AdPlacement =
  | "leaderboard"
  | "sidebar"
  | "in-content"
  | "footer-banner"
  | "mobile-banner";

export type UserTier = "diamond" | "gold" | "pro" | "free" | "unknown";

export interface AdSlotConfig {
  slotId: string;
  placement: AdPlacement;
  width: number;
  height: number;
  label: string;
  envKey: string;
}

const FAKE_SLOT_IDS = new Set([
  "1234567890",
  "2345678901",
  "3456789012",
  "4567890123",
  "5678901234",
  "4100011001",
  "4100011002",
  "4100011003",
  "4100011004",
  "4100011005",
  "4100011006",
]);

function envSlot(key: string): string {
  const v = process.env[key]?.trim() ?? "";
  if (!v || FAKE_SLOT_IDS.has(v)) return "";
  return v;
}

/** Named placements used by AdSenseSlot / UnifiedAdSlot */
export const ADSENSE_SLOT_ENV: Record<string, string> = {
  homepageBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_BANNER"),
  homepageMid: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_MID"),
  dashboardSidebar: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD_SIDEBAR"),
  dashboardBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD_BANNER"),
  dashboardMid: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD_MID"),
  liveLobbyBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_LIVE_LOBBY_BANNER"),
  articleInline: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE"),
  magazineLeaderboard: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_LEADERBOARD"),
  magazineInline: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_INLINE"),
  magazineArticleEnd: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_ARTICLE_END"),
  gameShowBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_GAME_SHOW_BANNER"),
  gameShowInterstitial: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_GAME_SHOW_INTERSTITIAL"),
  showSidebar: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_SHOW_SIDEBAR"),
  roomLeaderboard: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_ROOM_LEADERBOARD"),
  roomBetweenSegments: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_ROOM_BETWEEN_SEGMENTS"),
  sponsorFallback: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_SPONSOR_FALLBACK"),
  arenaBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_ARENA_BANNER"),
  arenaInterstitial: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_ARENA_INTERSTITIAL"),
  battleBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_BATTLE_BANNER"),
  battleInterstitial: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_BATTLE_INTERSTITIAL"),
  cypherBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_CYPHER_BANNER"),
  concertBanner: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_CONCERT_BANNER"),
  concertSidebar: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_CONCERT_SIDEBAR"),
  leaderboard: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD"),
  sidebar: envSlot("NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR"),
  "in-content": envSlot("NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT"),
  "footer-banner": envSlot("NEXT_PUBLIC_ADSENSE_SLOT_FOOTER_BANNER"),
  "mobile-banner": envSlot("NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_BANNER"),
};

export const AD_SLOTS: Record<AdPlacement, AdSlotConfig> = {
  leaderboard: {
    slotId: ADSENSE_SLOT_ENV.leaderboard || ADSENSE_SLOT_ENV.homepageBanner || "",
    placement: "leaderboard",
    width: 728,
    height: 90,
    label: "Leaderboard 728×90",
    envKey: "NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD | HOMEPAGE_BANNER",
  },
  sidebar: {
    slotId: ADSENSE_SLOT_ENV.sidebar || ADSENSE_SLOT_ENV.dashboardSidebar || "",
    placement: "sidebar",
    width: 300,
    height: 250,
    label: "Sidebar 300×250",
    envKey: "NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR | DASHBOARD_SIDEBAR",
  },
  "in-content": {
    slotId: ADSENSE_SLOT_ENV["in-content"] || ADSENSE_SLOT_ENV.articleInline || "",
    placement: "in-content",
    width: 320,
    height: 100,
    label: "In-Content 320×100",
    envKey: "NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT | ARTICLE_INLINE",
  },
  "footer-banner": {
    slotId: ADSENSE_SLOT_ENV["footer-banner"] || ADSENSE_SLOT_ENV.magazineArticleEnd || "",
    placement: "footer-banner",
    width: 468,
    height: 60,
    label: "Footer Banner 468×60",
    envKey: "NEXT_PUBLIC_ADSENSE_SLOT_FOOTER_BANNER",
  },
  "mobile-banner": {
    slotId: ADSENSE_SLOT_ENV["mobile-banner"] || "",
    placement: "mobile-banner",
    width: 320,
    height: 50,
    label: "Mobile Sticky 320×50",
    envKey: "NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_BANNER",
  },
};

/** True when at least one real AdSense slot id is configured in ENV. */
export function hasAnyAdSenseSlotConfigured(): boolean {
  return Object.values(ADSENSE_SLOT_ENV).some((id) => Boolean(id));
}

export function getAdSenseSlotId(key: string): string {
  return ADSENSE_SLOT_ENV[key] ?? "";
}

/**
 * Zone → whether AdSense inventory is available (Rule 12 tier 3).
 * Matches UnifiedAdSlot venue+slotKey conventions and common zone prefixes.
 */
export function zoneHasAdSenseInventory(zone: string): boolean {
  if (!hasAnyAdSenseSlotConfigured()) return false;
  const z = zone.toLowerCase();
  const keys = Object.keys(ADSENSE_SLOT_ENV);
  for (const key of keys) {
    if (!ADSENSE_SLOT_ENV[key]) continue;
    if (z.includes(key.toLowerCase())) return true;
  }
  // Broad surfaces that use shared homepage/magazine slots
  if (
    z.startsWith("home-") ||
    z.startsWith("magazine") ||
    z.startsWith("live-") ||
    z.startsWith("room-") ||
    z.startsWith("performer") ||
    z.startsWith("dashboard") ||
    z.includes("article")
  ) {
    return Boolean(
      ADSENSE_SLOT_ENV.homepageBanner ||
        ADSENSE_SLOT_ENV.homepageMid ||
        ADSENSE_SLOT_ENV.articleInline ||
        ADSENSE_SLOT_ENV.magazineLeaderboard ||
        ADSENSE_SLOT_ENV.liveLobbyBanner ||
        ADSENSE_SLOT_ENV.sponsorFallback,
    );
  }
  return false;
}

export function shouldShowAd(tier: UserTier, placement: AdPlacement): boolean {
  if (tier === "diamond") return false;
  if (tier === "gold") return placement === "sidebar" || placement === "leaderboard";
  if (tier === "pro") return placement === "leaderboard" || placement === "sidebar" || placement === "in-content";
  return true;
}

export function inContentAdCount(tier: UserTier): number {
  if (tier === "diamond" || tier === "gold") return 0;
  if (tier === "pro") return 1;
  return 3;
}

export const AD_CONSENT_STORAGE_KEY = "tmi_ad_consent";
export type AdConsentValue = "accepted" | "declined";

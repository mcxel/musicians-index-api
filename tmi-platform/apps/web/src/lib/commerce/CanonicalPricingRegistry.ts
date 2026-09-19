/**
 * CanonicalPricingRegistry — single ledger binding STRIPE_PRODUCTS → placements/runtimes.
 * Does NOT invent a second price table: every priceCents/priceId comes from products.ts.
 * Sync status: MAPPED (real Stripe price_1*) | STRIPE_SYNC_PENDING | PRICE_WITHOUT_PLACEMENT.
 */

import { sortOffersLowestPriceFirst } from "./PriceSortAuthority";
import {
  STRIPE_PRODUCTS,
  isRealPriceId,
  type StripeProductKey,
  type SubscriptionAccountType,
  getSubscriptionOffersLowestFirst,
} from "../stripe/products";

/** PLATFORM_AD eats member ad allowance; PERFORMANCE_NATIVE (Jumbotron/Curtain/Ribbon) does not. */
export type AdMonetizationKind = "PLATFORM_AD" | "PERFORMANCE_NATIVE";

export type PricingCatalogFamily =
  | "MEMBERSHIP"
  | "ONE_TIME_PLATFORM_AD"
  | "MAGAZINE"
  | "JUMBOTRON"
  | "CURTAIN"
  | "RIBBON"
  | "ONE_TIME_BOOST"
  | "RECURRING_AD"
  | "SPONSOR"
  | "OTHER";

export type StripeSyncStatus =
  | "MAPPED"
  | "STRIPE_SYNC_PENDING"
  | "PRICE_WITHOUT_PLACEMENT";

export type CurtainServeGate =
  | "NEVER_INTERRUPT_ACTIVE_PERFORMANCE"
  | "NOT_APPLICABLE";

export interface CanonicalPricingEntry {
  catalogId: string;
  stripeProductKey: StripeProductKey;
  family: PricingCatalogFamily;
  monetizationKind: AdMonetizationKind | null;
  /** Only PLATFORM_AD is true. PERFORMANCE_NATIVE + membership + boosts = false. */
  countsAgainstMemberAdAllowance: boolean;
  priceCents: number;
  priceId: string;
  name: string;
  interval: "one_time" | "day" | "week" | "month" | null;
  /** AdPlacementRegistry slotIds and/or runtime module ids that consume this SKU. */
  placementBindings: string[];
  runtimeBindings: string[];
  curtainGate: CurtainServeGate;
  syncStatus: StripeSyncStatus;
}

function intervalOf(key: StripeProductKey): CanonicalPricingEntry["interval"] {
  const p = STRIPE_PRODUCTS[key];
  if (!("interval" in p) || p.interval == null) return "one_time";
  return p.interval as CanonicalPricingEntry["interval"];
}

function entry(
  catalogId: string,
  stripeProductKey: StripeProductKey,
  family: PricingCatalogFamily,
  monetizationKind: AdMonetizationKind | null,
  countsAgainstMemberAdAllowance: boolean,
  placementBindings: string[],
  runtimeBindings: string[],
  curtainGate: CurtainServeGate = "NOT_APPLICABLE",
): CanonicalPricingEntry {
  const product = STRIPE_PRODUCTS[stripeProductKey];
  const priceId = product.priceId;
  const hasPlacement = placementBindings.length > 0 || runtimeBindings.length > 0;
  let syncStatus: StripeSyncStatus;
  if (!hasPlacement) {
    syncStatus = "PRICE_WITHOUT_PLACEMENT";
  } else if (isRealPriceId(priceId)) {
    syncStatus = "MAPPED";
  } else {
    syncStatus = "STRIPE_SYNC_PENDING";
  }
  return {
    catalogId,
    stripeProductKey,
    family,
    monetizationKind,
    countsAgainstMemberAdAllowance,
    priceCents: product.price,
    priceId,
    name: product.name,
    interval: intervalOf(stripeProductKey),
    placementBindings,
    runtimeBindings,
    curtainGate,
    syncStatus,
  };
}

/**
 * Membership PLATFORM_AD load — only PLATFORM_AD inventory.
 * FREE 100% … DIAMOND 5%. PERFORMANCE_NATIVE never uses this ladder.
 */
export const MEMBER_PLATFORM_AD_LOAD_PERCENT: Record<string, number> = {
  FREE: 100,
  PRO: 80,
  RUBY: 60,
  SILVER: 40,
  GOLD: 25,
  PLATINUM: 15,
  DIAMOND: 5,
};

export function getPlatformAdLoadPercent(tier: string): number {
  const key = tier.trim().toUpperCase();
  return MEMBER_PLATFORM_AD_LOAD_PERCENT[key] ?? MEMBER_PLATFORM_AD_LOAD_PERCENT.FREE;
}

/** Stage / director states where curtain commercials may serve. LIVE performance = blocked. */
const CURTAIN_AD_ALLOWED_STATES = new Set([
  "INTERMISSION",
  "COMMERCIAL_BREAK",
  "PRE_SHOW",
  "POST_SHOW",
  "CLOSED",
  "CLOSING",
  "OPENING",
  "COUNTDOWN",
  "HOLD",
  "PAUSING",
  "RESUMING",
  "EXTENDED_INTERMISSION",
]);

const CURTAIN_AD_BLOCKED_STATES = new Set([
  "LIVE",
  "OPEN",
  "ACTIVE",
  "PERFORMING",
  "ON_STAGE",
]);

/**
 * Curtain ads NEVER interrupt active performance.
 * Returns false for LIVE / OPEN / active stage states.
 */
export function canServeCurtainAd(state: string | null | undefined): boolean {
  if (!state) return false;
  const normalized = state.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (CURTAIN_AD_BLOCKED_STATES.has(normalized)) return false;
  if (CURTAIN_AD_ALLOWED_STATES.has(normalized)) return true;
  // Unknown state → deny (fail closed for active-show safety)
  return false;
}

export function countsAgainstMemberAdAllowance(
  monetizationKind: AdMonetizationKind | null,
): boolean {
  return monetizationKind === "PLATFORM_AD";
}

/** Canonical ledger — prices always read from STRIPE_PRODUCTS. */
export const CANONICAL_PRICING_REGISTRY: readonly CanonicalPricingEntry[] = [
  // Membership ladder (canonical amounts only — no invented membership prices)
  entry("membership.fan.pro", "FAN_PRO_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.fan.ruby", "FAN_RUBY_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.fan.silver", "FAN_SILVER_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.fan.gold", "FAN_GOLD_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.fan.platinum", "FAN_PLATINUM_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.fan.diamond", "FAN_DIAMOND_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.fan.family", "FAN_FAMILY_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.performer.pro", "PERFORMER_PRO_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.performer.ruby", "PERFORMER_RUBY_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.performer.silver", "PERFORMER_SILVER_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.performer.gold", "PERFORMER_GOLD_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.performer.platinum", "PERFORMER_PLATINUM_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.performer.diamond", "PERFORMER_DIAMOND_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),
  entry("membership.performer.band", "PERFORMER_BAND_MONTHLY", "MEMBERSHIP", null, false, [], ["SubscriptionPlanEngine", "pricing-page"], "NOT_APPLICABLE"),

  // Advertising entry $0.99/day (public ad honor — lowest valid first)
  entry("ad.platform.entry_day_099", "AD_ENTRY_DAY_099", "ONE_TIME_PLATFORM_AD", "PLATFORM_AD", true, ["home-banner", "fan-cc-bottom"], ["AdPlacementRegistry", "AdvertisingEntryPresentation"], "NOT_APPLICABLE"),

  // Low-friction PLATFORM_AD ($2.99–$29.99)
  entry("ad.platform.micro", "AD_MICRO_SPOT", "ONE_TIME_PLATFORM_AD", "PLATFORM_AD", true, ["home-banner", "fan-cc-bottom"], ["AdPlacementRegistry", "SponsorRegistry.getAdSlotForZone"], "NOT_APPLICABLE"),
  entry("ad.platform.day", "AD_DAY_SPOT", "ONE_TIME_PLATFORM_AD", "PLATFORM_AD", true, ["home-banner", "fan-cc-bottom", "performer-cc-bottom"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),
  entry("ad.platform.week", "AD_WEEK_SPOT", "ONE_TIME_PLATFORM_AD", "PLATFORM_AD", true, ["home-banner", "magazine-leaderboard"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),
  entry("ad.platform.feature", "AD_FEATURE_SPOT", "ONE_TIME_PLATFORM_AD", "PLATFORM_AD", true, ["home-banner"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),
  entry("ad.platform.premium", "AD_PREMIUM_SPOT", "ONE_TIME_PLATFORM_AD", "PLATFORM_AD", true, ["home-banner"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),

  // Magazine (low-friction OT + existing issue placement)
  entry("ad.magazine.strip", "MAGAZINE_STRIP_OT", "MAGAZINE", "PLATFORM_AD", true, ["magazine-leaderboard"], ["AdPlacementRegistry", "AdPricingEngine"], "NOT_APPLICABLE"),
  entry("ad.magazine.half", "MAGAZINE_HALF_OT", "MAGAZINE", "PLATFORM_AD", true, ["magazine-leaderboard"], ["AdPlacementRegistry", "AdPricingEngine"], "NOT_APPLICABLE"),
  entry("ad.magazine.full", "MAGAZINE_FULL_OT", "MAGAZINE", "PLATFORM_AD", true, ["magazine-leaderboard"], ["AdPlacementRegistry", "AdPricingEngine"], "NOT_APPLICABLE"),
  entry("ad.magazine.issue", "AD_MAGAZINE", "MAGAZINE", "PLATFORM_AD", true, ["magazine-leaderboard"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),

  // Jumbotron / Curtain / Ribbon — PERFORMANCE_NATIVE
  entry("ad.jumbotron.face_day", "JUMBOTRON_FACE_DAY", "JUMBOTRON", "PERFORMANCE_NATIVE", false, ["jumbotron-face"], ["JumbotronAdContracts", "AutomatedJumbotronDirector"], "NOT_APPLICABLE"),
  entry("ad.jumbotron.intermission", "JUMBOTRON_INTERMISSION", "JUMBOTRON", "PERFORMANCE_NATIVE", false, ["jumbotron-face"], ["JumbotronAdContracts.INTERMISSION_TAKEOVER", "JumbotronCurtainIntermissionDirector"], "NEVER_INTERRUPT_ACTIVE_PERFORMANCE"),
  entry("ad.curtain.intermission", "CURTAIN_INTERMISSION_SPOT", "CURTAIN", "PERFORMANCE_NATIVE", false, ["curtain-ad-rail"], ["VenueCurtainDirector", "CurtainRuntimeManager.resolveCurtainAdCampaign"], "NEVER_INTERRUPT_ACTIVE_PERFORMANCE"),
  entry("ad.ribbon.day", "RIBBON_SPONSOR_DAY", "RIBBON", "PERFORMANCE_NATIVE", false, ["header-sponsor-ribbon", "media-underlay-ribbon"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),

  // Existing one-time boosts
  entry("boost.lobby_wall", "LOBBY_WALL_BOOST_24H", "ONE_TIME_BOOST", null, false, [], ["LobbyWallBoostEngine"], "NOT_APPLICABLE"),
  entry("boost.discovery.spark", "DISCOVERY_BOOST_SPARK", "ONE_TIME_BOOST", null, false, [], ["DiscoveryBoostEngine"], "NOT_APPLICABLE"),
  entry("boost.discovery.pulse", "DISCOVERY_BOOST_PULSE", "ONE_TIME_BOOST", null, false, [], ["DiscoveryBoostEngine"], "NOT_APPLICABLE"),
  entry("boost.discovery.wave", "DISCOVERY_BOOST_WAVE", "ONE_TIME_BOOST", null, false, [], ["DiscoveryBoostEngine"], "NOT_APPLICABLE"),
  entry("boost.discovery.blast", "DISCOVERY_BOOST_BLAST", "ONE_TIME_BOOST", null, false, [], ["DiscoveryBoostEngine"], "NOT_APPLICABLE"),
  entry("boost.artist", "ARTIST_BOOST", "ONE_TIME_BOOST", null, false, [], ["DiscoveryBoostEngine"], "NOT_APPLICABLE"),
  entry("boost.spotlight", "ARTIST_SPOTLIGHT", "ONE_TIME_BOOST", null, false, ["home-banner"], ["SponsorRegistry"], "NOT_APPLICABLE"),
  entry("boost.beat_featured", "BEAT_FEATURED", "ONE_TIME_BOOST", null, false, [], ["BeatStoreEngine"], "NOT_APPLICABLE"),

  // Recurring ad plans (existing)
  entry("ad.recurring.billboard", "AD_BILLBOARD_WEEKLY", "RECURRING_AD", "PLATFORM_AD", true, ["home-banner"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),
  entry("ad.recurring.banner", "AD_BANNER_MONTHLY", "RECURRING_AD", "PLATFORM_AD", true, ["home-banner"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),
  entry("ad.recurring.ticker", "AD_TICKER_MONTHLY", "RECURRING_AD", "PLATFORM_AD", true, ["home-banner"], ["AdPlacementRegistry"], "NOT_APPLICABLE"),
  entry("ad.recurring.video", "AD_VIDEO_WEEKLY", "RECURRING_AD", "PLATFORM_AD", true, [], ["AdPlacementRegistry"], "NOT_APPLICABLE"),
  entry("ad.package.starter", "AD_PACKAGE_STARTER", "RECURRING_AD", "PLATFORM_AD", true, ["home-banner", "magazine-leaderboard"], ["advertiser/payments"], "NOT_APPLICABLE"),
  entry("ad.package.pro", "AD_PACKAGE_PRO", "RECURRING_AD", "PLATFORM_AD", true, ["home-banner", "magazine-leaderboard"], ["advertiser/payments"], "NOT_APPLICABLE"),
  entry("ad.package.premium", "AD_PACKAGE_PREMIUM", "RECURRING_AD", "PLATFORM_AD", true, ["home-banner", "magazine-leaderboard", "curtain-ad-rail"], ["advertiser/payments"], "NOT_APPLICABLE"),

  // Sponsor placements (existing)
  entry("sponsor.homepage", "SPONSOR_HOMEPAGE_BANNER", "SPONSOR", "PLATFORM_AD", true, ["home-banner"], ["SponsorRegistry"], "NOT_APPLICABLE"),
  entry("sponsor.room", "SPONSOR_ROOM_NAMING", "SPONSOR", "PERFORMANCE_NATIVE", false, [], ["SponsorRegistry"], "NOT_APPLICABLE"),
  entry("sponsor.contest", "SPONSOR_CONTEST", "SPONSOR", "PERFORMANCE_NATIVE", false, [], ["SponsorRegistry"], "NOT_APPLICABLE"),
  entry("sponsor.article", "SPONSOR_ARTICLE_PLACEMENT", "SPONSOR", "PLATFORM_AD", true, ["magazine-leaderboard"], ["SponsorRegistry"], "NOT_APPLICABLE"),
  entry("sponsor.battle", "SPONSOR_BATTLE", "SPONSOR", "PERFORMANCE_NATIVE", false, [], ["SponsorRegistry"], "NOT_APPLICABLE"),
  entry("sponsor.championship", "SPONSOR_CHAMPIONSHIP", "SPONSOR", "PERFORMANCE_NATIVE", false, [], ["SponsorRegistry"], "NOT_APPLICABLE"),
];

export function getCanonicalPricingEntry(catalogId: string): CanonicalPricingEntry | undefined {
  return CANONICAL_PRICING_REGISTRY.find((e) => e.catalogId === catalogId);
}

export function getCanonicalPricingByStripeKey(
  key: StripeProductKey,
): CanonicalPricingEntry | undefined {
  return CANONICAL_PRICING_REGISTRY.find((e) => e.stripeProductKey === key);
}

export function listCanonicalPricingByFamily(
  family: PricingCatalogFamily,
): CanonicalPricingEntry[] {
  return sortOffersLowestPriceFirst(
    CANONICAL_PRICING_REGISTRY.filter((e) => e.family === family).map((e) => ({
      ...e,
      id: e.catalogId,
      priceCents: e.priceCents,
    })),
  );
}

/** All catalog offers lowest-price-first (shared sort law). */
export function listCanonicalPricingLowestFirst(
  filter?: (e: CanonicalPricingEntry) => boolean,
): CanonicalPricingEntry[] {
  const pool = filter
    ? CANONICAL_PRICING_REGISTRY.filter(filter)
    : [...CANONICAL_PRICING_REGISTRY];
  return sortOffersLowestPriceFirst(
    pool.map((e) => ({ ...e, id: e.catalogId, priceCents: e.priceCents })),
  );
}

export function listMembershipOffersLowestFirst(accountType: SubscriptionAccountType) {
  return getSubscriptionOffersLowestFirst(accountType);
}

export function listSyncPendingEntries(): CanonicalPricingEntry[] {
  return CANONICAL_PRICING_REGISTRY.filter((e) => e.syncStatus === "STRIPE_SYNC_PENDING");
}

export function listPriceWithoutPlacement(): CanonicalPricingEntry[] {
  return CANONICAL_PRICING_REGISTRY.filter((e) => e.syncStatus === "PRICE_WITHOUT_PLACEMENT");
}

export function buildPricingSyncLedger(): {
  mapped: CanonicalPricingEntry[];
  stripeSyncPending: CanonicalPricingEntry[];
  priceWithoutPlacement: CanonicalPricingEntry[];
  reusedRealPriceIds: string[];
  pendingCatalogIds: string[];
} {
  const mapped = CANONICAL_PRICING_REGISTRY.filter((e) => e.syncStatus === "MAPPED");
  const stripeSyncPending = listSyncPendingEntries();
  const priceWithoutPlacement = listPriceWithoutPlacement();
  return {
    mapped,
    stripeSyncPending,
    priceWithoutPlacement,
    reusedRealPriceIds: mapped.map((e) => e.priceId),
    pendingCatalogIds: stripeSyncPending.map((e) => e.catalogId),
  };
}

export const CanonicalPricingRegistry = {
  CANONICAL_PRICING_REGISTRY,
  MEMBER_PLATFORM_AD_LOAD_PERCENT,
  getPlatformAdLoadPercent,
  canServeCurtainAd,
  countsAgainstMemberAdAllowance,
  listCanonicalPricingLowestFirst,
  listMembershipOffersLowestFirst,
  buildPricingSyncLedger,
};

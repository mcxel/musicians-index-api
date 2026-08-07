// ─── Types ────────────────────────────────────────────────────────────────────

export type RevenueParty =
  | "platform"
  | "artist"
  | "performer"
  | "venue"
  | "sponsor"
  | "big_ace"; // Marcel / TMI founder allocation (not used on creator-commerce paths)

export type RevenueSplitConfig = {
  platform:   number;  // basis points (2500 = 25%)
  artist:     number;
  performer:  number;
  venue:      number;
  sponsor:    number;
  big_ace:    number;
};

export type RevenueSplitResult = {
  grossCents:   number;
  taxCents:     number;
  netCents:     number;  // gross - tax, this is what gets split
  splits: Record<RevenueParty, { bps: number; cents: number; display: string }>;
  totalSplitCents: number;
  unallocatedCents: number;
};

/** Canon membership tiers for creator-commerce fee ladder (never Bronze). */
export type CommerceMembershipTier =
  | "FREE"
  | "PRO"
  | "RUBY"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

/**
 * Locked even ladder (2% steps) — platform fee on creator commerce
 * (beats, tips, NFT primary, track/merch-style seller products).
 * Seller/producer gets 100% − platformFee. Big Ace = 0.
 */
export const CREATOR_COMMERCE_PLATFORM_FEE_BPS: Record<CommerceMembershipTier, number> = {
  FREE: 2000,      // 20%
  PRO: 1800,       // 18%
  RUBY: 1600,      // 16%
  SILVER: 1400,    // 14%
  GOLD: 1200,      // 12%
  PLATINUM: 1000,  // 10%
  DIAMOND: 800,    // 8%
};

export const CREATOR_COMMERCE_PRESETS = [
  "beat",
  "tip",
  "nft",
  "single",
  "album",
  "playlist_artifact",
  "meet_greet",
  "shoutout",
  "quick_video_chat",
  "backstage_pass",
  "fan_club",
  "merch",
  "store",
] as const;

export type CreatorCommercePreset = (typeof CREATOR_COMMERCE_PRESETS)[number];

export function normalizeCommerceTier(tier?: string | null): CommerceMembershipTier {
  const t = (tier ?? "FREE").toUpperCase().replace(/\s+/g, "_");
  if (t in CREATOR_COMMERCE_PLATFORM_FEE_BPS) {
    return t as CommerceMembershipTier;
  }
  return "FREE";
}

/** platformFee = rate(tier); sellerAmount = 100% − platformFee; big_ace = 0 */
export function creatorCommerceSplitConfig(tier?: string | null): RevenueSplitConfig {
  const platform = CREATOR_COMMERCE_PLATFORM_FEE_BPS[normalizeCommerceTier(tier)];
  return {
    platform,
    artist: 10_000 - platform,
    performer: 0,
    venue: 0,
    sponsor: 0,
    big_ace: 0,
  };
}

export function describeCreatorCommerceFee(tier?: string | null): string {
  const cfg = creatorCommerceSplitConfig(tier);
  const t = normalizeCommerceTier(tier);
  return `Creator commerce (${t}) — platform ${cfg.platform / 100}% · seller ${cfg.artist / 100}% · big_ace 0%`;
}

export function isCreatorCommercePreset(presetKey: string): boolean {
  return (CREATOR_COMMERCE_PRESETS as readonly string[]).includes(presetKey);
}

// ─── Split presets ────────────────────────────────────────────────────────────

/** FREE-tier defaults for creator paths; prefer creatorCommerceSplitConfig(sellerTier) at settlement. */
const FREE_CREATOR = creatorCommerceSplitConfig("FREE");

export const SPLIT_PRESETS: Record<string, RevenueSplitConfig> = {
  subscription: {
    platform: 7500, artist: 0, performer: 0, venue: 0, sponsor: 0, big_ace: 2500,
  },
  /** Creator commerce — seller tier fee; FREE default 20/80; Big Ace 0 */
  tip: { ...FREE_CREATOR },
  ticket: {
    platform: 2000, artist: 3000, performer: 0, venue: 4000, sponsor: 0, big_ace: 1000,
  },
  /** Creator commerce — seller (producer) tier fee; FREE default 20/80; Big Ace 0 */
  beat: { ...FREE_CREATOR },
  /** Creator commerce — seller tier fee; FREE default 20/80; Big Ace 0 */
  nft: { ...FREE_CREATOR },
  ad: {
    platform: 3000, artist: 0, performer: 0, venue: 2000, sponsor: 0, big_ace: 5000,
  },
  booking: {
    platform: 1500, artist: 5000, performer: 0, venue: 2500, sponsor: 0, big_ace: 1000,
  },
  /** Track commerce — seller tier fee ladder (Big Ace 0) */
  single: { ...FREE_CREATOR },
  album: { ...FREE_CREATOR },
  playlist_artifact: { ...FREE_CREATOR },
  meet_greet: { ...FREE_CREATOR },
  shoutout: { ...FREE_CREATOR },
  quick_video_chat: { ...FREE_CREATOR },
  backstage_pass: { ...FREE_CREATOR },
  fan_club: { ...FREE_CREATOR },
  /** Creator merch / store items — seller tier fee; Big Ace 0 */
  merch: { ...FREE_CREATOR },
  store: { ...FREE_CREATOR },
};

/**
 * Canonical track pricing — Rule 19 track commerce.
 * Store prices (what fans pay) vs artist payout (what artists receive).
 * All values in cents.
 */
export const TRACK_PRICING = {
  /** Minimum single price fans pay in the store */
  SINGLE_STORE_MIN_CENTS: 99,
  /** Standard single store price (what shows in the UI) */
  SINGLE_STORE_DEFAULT_CENTS: 129,
  /** Artist payout per single sold (guaranteed floor) */
  SINGLE_ARTIST_PAYOUT_CENTS: 99,
  /** TMI gross margin on a standard $1.29 single before Stripe fees */
  SINGLE_TMI_MARGIN_CENTS: 30,
  /** Minimum album/EP price */
  ALBUM_STORE_MIN_CENTS: 499,
  /** Standard album store price */
  ALBUM_STORE_DEFAULT_CENTS: 999,
} as const;

export type TrackProductType = "single" | "album" | "playlist_artifact";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function calculateRevenueSplit(
  grossCents: number,
  taxCents: number,
  config: RevenueSplitConfig,
): RevenueSplitResult {
  const netCents = grossCents - taxCents;
  const parties: RevenueParty[] = ["platform", "artist", "performer", "venue", "sponsor", "big_ace"];

  const splits = {} as RevenueSplitResult["splits"];
  let totalSplitCents = 0;

  for (const party of parties) {
    const bps = config[party];
    const cents = Math.floor((netCents * bps) / 10_000);
    totalSplitCents += cents;
    splits[party] = { bps, cents, display: centsToDollarStr(cents) };
  }

  return {
    grossCents,
    taxCents,
    netCents,
    splits,
    totalSplitCents,
    unallocatedCents: netCents - totalSplitCents,
  };
}

export function calculateRevenueSplitByPreset(
  presetKey: string,
  grossCents: number,
  taxCents: number,
  sellerTier?: string | null,
): RevenueSplitResult {
  const config = isCreatorCommercePreset(presetKey)
    ? creatorCommerceSplitConfig(sellerTier)
    : (SPLIT_PRESETS[presetKey] ?? SPLIT_PRESETS.subscription);
  return calculateRevenueSplit(grossCents, taxCents, config);
}

export function calculateCreatorCommerceSplit(
  grossCents: number,
  taxCents: number,
  sellerTier?: string | null,
): RevenueSplitResult {
  return calculateRevenueSplit(grossCents, taxCents, creatorCommerceSplitConfig(sellerTier));
}

export function getPartyPayout(
  presetKey: string,
  grossCents: number,
  taxCents: number,
  party: RevenueParty,
  sellerTier?: string | null,
): number {
  return calculateRevenueSplitByPreset(presetKey, grossCents, taxCents, sellerTier).splits[party].cents;
}

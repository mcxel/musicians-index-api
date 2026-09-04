// ─── Types ────────────────────────────────────────────────────────────────────

import { listSeasonPassOffers } from "@/lib/season/SeasonPassCatalog";
import { getSubscriptionProduct, type SubscriptionTierKey } from "@/lib/stripe/products";

export type AccountType = "artist" | "performer" | "fan";

export type SubscriptionTier = "free" | "pro" | "RUBY" | "silver" | "gold" | "platinum" | "diamond";

export type TierPrice = {
  tier: SubscriptionTier;
  usdCents: number;         // base price in cents (pre-tax)
  usdDisplay: string;       // "$2.99"
  annualUsdCents?: number;
  annualUsdDisplay?: string;
};

export type TierBenefits = {
  tier: SubscriptionTier;
  accountType: AccountType;
  profileImages: number;
  uploadLimitMb: number;
  liveRooms: boolean;
  tipsEnabled: boolean;
  nftSelling: boolean;
  beatSelling: boolean;
  bookingEligible: boolean;
  articlePage: boolean;
  meetGreetSlots: number;
  voteMultiplier: number;
  bonusPoints: number;
  earlyTicketAccess: boolean;
  exclusiveGiveaways: boolean;
  gamePerks: boolean;
  privateFeeds: boolean;
};

// ─── Price tables ─────────────────────────────────────────────────────────────
// Confirmed correct (Lane A "Option A", migration landed 2026-09-01): PRO is a
// real, separate tier below RUBY — Performer $2.99/Fan $4.99 — matching the
// numbers below. @/lib/stripe/products.ts and tierMapping.ts now have real
// Stripe test-mode prices for both PRO and a properly-priced RUBY ($7.99/
// $9.99); the original RUBY price IDs (created at the PRO amount) remain
// mapped to RUBY in tierMapping.ts as legacy-only reconciliation entries
// (verified 0 real subscriptions referenced them before the migration).
// Live-mode price creation and the SILVER+ tiers' own migration (if any is
// ever needed) are not part of this pass — see project memory.
// Fan:      Free $0 / Pro $4.99 / RUBY $9.99 / Silver $14.99 / Gold $24.99 / Platinum $39.99 / Diamond $49.99
// Performer: Free $0 / Pro $2.99 / RUBY $7.99 / Silver $14.99 / Gold $29.99 / Platinum $39.99 / Diamond $69.99

const CREATOR_PRICES: Record<SubscriptionTier, { cents: number; display: string }> = {
  free:     { cents:    0, display: "$0.00"  },
  pro:      { cents:  299, display: "$2.99"  },
  RUBY:   { cents:  799, display: "$7.99"  },
  silver:   { cents: 1499, display: "$14.99" },
  gold:     { cents: 2999, display: "$29.99" },
  platinum: { cents: 3999, display: "$39.99" },
  diamond:  { cents: 6999, display: "$69.99" },
};

const FAN_PRICES: Record<SubscriptionTier, { cents: number; display: string }> = {
  free:     { cents:    0, display: "$0.00"  },
  pro:      { cents:  499, display: "$4.99"  },
  RUBY:   { cents:  999, display: "$9.99"  },
  silver:   { cents: 1499, display: "$14.99" },
  gold:     { cents: 2499, display: "$24.99" },
  platinum: { cents: 3999, display: "$39.99" },
  diamond:  { cents: 4999, display: "$49.99" },
};

// Season Pass pricing — delegated to SeasonPassCatalog (TMI-owned, separate from membership).
// Kept as a thin alias so membership code never invents pass prices.
export const SEASON_PASS_PRICES = Object.fromEntries(
  listSeasonPassOffers({ includeUnavailable: true }).map((o) => [
    o.id,
    { cents: o.priceCents, display: o.priceDisplay },
  ]),
) as Record<string, { cents: number; display: string }>;
export type SeasonPassTier = keyof typeof SEASON_PASS_PRICES;

function priceTable(accountType: AccountType) {
  return accountType === "fan" ? FAN_PRICES : CREATOR_PRICES;
}

// Bridges this file's lowercase (legacy) tier keys to products.ts's canonical
// uppercase SubscriptionTierKey — "artist" is treated as "performer" pricing,
// matching priceTable()'s existing fan/non-fan split.
const CANONICAL_TIER_KEY: Record<Exclude<SubscriptionTier, "free">, SubscriptionTierKey> = {
  pro: "PRO", RUBY: "RUBY", silver: "SILVER", gold: "GOLD", platinum: "PLATINUM", diamond: "DIAMOND",
};

// ─── Tier order ───────────────────────────────────────────────────────────────

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "RUBY", "silver", "gold", "platinum", "diamond"];

// ─── Public API ───────────────────────────────────────────────────────────────

// Real Stripe price ID for a tier — same source getTierPrice() reads for the
// amount, so the checkout link and the displayed price can never disagree.
export function getTierPriceId(accountType: AccountType, tier: SubscriptionTier): string | null {
  if (tier === "free") return null;
  const product = getSubscriptionProduct(accountType === "fan" ? "fan" : "performer", CANONICAL_TIER_KEY[tier]);
  return product.priceId;
}

export function getTierPrice(accountType: AccountType, tier: SubscriptionTier): TierPrice {
  // PRO and RUBY are read straight from the canonical Stripe product catalog
  // (products.ts) so the displayed price can never drift from what checkout
  // actually charges — this is the exact bug class Lane A A5 (2026-09-01)
  // fixed. SILVER/GOLD/PLATINUM/DIAMOND still read the local table below:
  // products.ts's cents for those tiers were found to disagree substantially
  // with these (e.g. Performer Gold $9.99 there vs $29.99 here) during this
  // same pass — a real, separate, unresolved pricing question flagged for
  // Marcel rather than silently resolved by picking one source.
  const entryCents = (tier === "pro" || tier === "RUBY")
    ? getSubscriptionProduct(accountType === "fan" ? "fan" : "performer", CANONICAL_TIER_KEY[tier]).price
    : priceTable(accountType)[tier].cents;

  const result: TierPrice = {
    tier,
    usdCents: entryCents,
    usdDisplay: `$${(entryCents / 100).toFixed(2)}`,
  };

  if (tier === "pro") {
    const annualCents = Math.round(entryCents * 10);  // 2 months free
    result.annualUsdCents = annualCents;
    result.annualUsdDisplay = `$${(annualCents / 100).toFixed(2)}/yr`;
  }

  return result;
}

export function getAllTierPrices(accountType: AccountType): TierPrice[] {
  return TIER_ORDER.map(t => getTierPrice(accountType, t));
}

export function getTierBenefits(accountType: AccountType, tier: SubscriptionTier): TierBenefits {
  const isCreator = accountType !== "fan";
  const tierIndex = TIER_ORDER.indexOf(tier);

  if (isCreator) {
    return {
      tier,
      accountType,
      profileImages:      [1, 3, 6, 8, 10, 15, 20][tierIndex]!,
      uploadLimitMb:      [100, 500, 1000, 1500, 2000, 5000, 10000][tierIndex]!,
      liveRooms:          tierIndex >= 1,
      tipsEnabled:        tierIndex >= 1,
      nftSelling:         tierIndex >= 1,
      beatSelling:        tierIndex >= 1,
      bookingEligible:    tierIndex >= 1,
      articlePage:        tierIndex >= 1,
      meetGreetSlots:     [0, 2, 5, 7, 10, 20, 50][tierIndex]!,
      voteMultiplier:     [1, 1.2, 1.5, 1.8, 2, 3, 5][tierIndex]!,
      bonusPoints:        [0, 5, 10, 15, 20, 40, 100][tierIndex]!,
      earlyTicketAccess:  tierIndex >= 2,
      exclusiveGiveaways: tierIndex >= 2,
      gamePerks:          tierIndex >= 4, // gold+
      privateFeeds:       tierIndex >= 1,
    };
  }

  return {
    tier,
    accountType,
    profileImages:      [1, 10, 20, 25, 30, 50, 100][tierIndex]!,
    uploadLimitMb:      [50, 200, 500, 700, 1000, 2000, 5000][tierIndex]!,
    liveRooms:          true,
    tipsEnabled:        tierIndex >= 1,
    nftSelling:         false,
    beatSelling:        false,
    bookingEligible:    false,
    articlePage:        false,
    meetGreetSlots:     [0, 3, 8, 12, 15, 30, 100][tierIndex]!,
    voteMultiplier:     [1, 1.5, 2, 2.5, 3, 5, 10][tierIndex]!,
    bonusPoints:        [0, 10, 25, 35, 50, 100, 250][tierIndex]!,
    earlyTicketAccess:  tierIndex >= 1,
    exclusiveGiveaways: tierIndex >= 1,
    gamePerks:          tierIndex >= 1,
    privateFeeds:       tierIndex >= 1,
  };
}

export function getTierUploadLimits(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierBenefits(accountType, tier).uploadLimitMb;
}

export function getTierImageLimits(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierBenefits(accountType, tier).profileImages;
}

export function getTierMeetingLimits(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierBenefits(accountType, tier).meetGreetSlots;
}

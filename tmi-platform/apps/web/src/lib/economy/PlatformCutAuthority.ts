/**
 * PlatformCutAuthority — canonical TMI 18% cut for GENERAL SELLER COMMERCE only.
 *
 * THREE COMMISSION FAMILIES (owner-locked):
 *  1. GENERAL SELLER COMMERCE → 18% (this module)
 *  2. VENUE / PROMOTER TICKETS → 13% (VenuePromoterTicketCutAuthority)
 *  3. WORLD CONCERT TICKETS → performer membership tier rate (WorldConcertTierRateAuthority)
 *
 * Do NOT use this module for World Concert or Venue/Promoter ticket quotes.
 */

export const TMI_PLATFORM_CUT_PERCENT = 18 as const;
export const TMI_PLATFORM_CUT_BPS = 1800 as const;
export const TMI_SELLER_SIDE_PERCENT = 82 as const;
export const TMI_SELLER_SIDE_BPS = 8200 as const;
export const PLATFORM_CUT_POLICY_ID = "tmi-platform-cut-v1-18" as const;

/** Categories that take the flat 18% facilitation cut — World Concert excluded. */
export type PlatformCutCategory =
  | "BOOKING"
  | "MUSIC_SALE"
  | "MARKETPLACE_SELLER"
  | "PERFORMER_MERCHANDISE"
  | "YOPHO_CREATOR_COMMERCE"
  | "CREATOR_DIGITAL_COMMERCE"
  | "TICKET_ADD_ON"
  | "OTHER_SELLER_TRANSACTION";

export type DirectTmiRevenueCategory =
  | "MEMBERSHIP_SUBSCRIPTION"
  | "ADVERTISING"
  | "SPONSORSHIP"
  | "MAGAZINE_ADVERTISING"
  | "JUMBOTRON_PLACEMENT"
  | "VIDEO_SHUFFLE_PROMOTION"
  | "STREAM_WIN_SPONSORSHIP"
  | "BOOST_PROMOTION"
  | "TMI_OWNED_MARKETPLACE_SALE";

export type MoneyConceptClass =
  | "TMI_PLATFORM_CUT"
  | "WORLD_CONCERT_TIER_RATE"
  | "VENUE_PROMOTER_TICKET_CUT"
  | "DIRECT_TMI_REVENUE"
  | "PAYMENT_PROCESSING"
  | "ROYALTY"
  | "OWNERSHIP_SPLIT"
  | "PRODUCER_ARTIST_SPLIT"
  | "PARTNER_DISTRIBUTION"
  | "TAX"
  | "SERVICE_FEE"
  | "OTHER";

export type EconomyAuditDisposition =
  | "MATCHES_18_PERCENT"
  | "MATCHES_13_PERCENT"
  | "MATCHES_WORLD_CONCERT_TIER_LADDER"
  | "LEGITIMATE_EXPLICIT_OVERRIDE"
  | "STALE_CONFLICT"
  | "OWNER_VALUE_REQUIRED"
  | "NOT_PLATFORM_CUT";

export type PlatformCutBreakdown = {
  policyId: typeof PLATFORM_CUT_POLICY_ID;
  category: PlatformCutCategory;
  gmvCents: number;
  platformCutPercent: typeof TMI_PLATFORM_CUT_PERCENT;
  platformCutCents: number;
  sellerSidePercent: typeof TMI_SELLER_SIDE_PERCENT;
  sellerSideCents: number;
  attributionKey?: string;
};

export function isPlatformCutCategory(c: string): c is PlatformCutCategory {
  return (
    c === "BOOKING" ||
    c === "MUSIC_SALE" ||
    c === "MARKETPLACE_SELLER" ||
    c === "PERFORMER_MERCHANDISE" ||
    c === "YOPHO_CREATOR_COMMERCE" ||
    c === "CREATOR_DIGITAL_COMMERCE" ||
    c === "TICKET_ADD_ON" ||
    c === "OTHER_SELLER_TRANSACTION"
  );
}

/** Reject mistaken World Concert / venue ticket routing into flat 18%. */
export function assertNotWorldConcertOrVenueTicketCategory(category: string): void {
  if (
    category === "WORLD_CONCERT_TICKET" ||
    category === "PHYSICAL_EVENT_TICKET" ||
    category === "VENUE_TICKET" ||
    category === "PROMOTER_TICKET"
  ) {
    throw new Error(
      `MISCLASSIFIED_CUT: ${category} must not use PlatformCutAuthority 18%. Use WorldConcertTierRateAuthority or VenuePromoterTicketCutAuthority.`,
    );
  }
}

export function splitPlatformCut(input: {
  gmvCents: number;
  category: PlatformCutCategory;
  attributionKey?: string;
}): PlatformCutBreakdown {
  assertNotWorldConcertOrVenueTicketCategory(input.category);
  const gmvCents = Math.max(0, Math.round(input.gmvCents));
  const platformCutCents = Math.floor((gmvCents * TMI_PLATFORM_CUT_BPS) / 10_000);
  return {
    policyId: PLATFORM_CUT_POLICY_ID,
    category: input.category,
    gmvCents,
    platformCutPercent: TMI_PLATFORM_CUT_PERCENT,
    platformCutCents,
    sellerSidePercent: TMI_SELLER_SIDE_PERCENT,
    sellerSideCents: gmvCents - platformCutCents,
    attributionKey: input.attributionKey,
  };
}

export function quoteBookingCut(bookingGmvCents: number): PlatformCutBreakdown {
  return splitPlatformCut({ gmvCents: bookingGmvCents, category: "BOOKING" });
}

/**
 * @deprecated World Concert must use quoteWorldConcertTierCut — never flat 18%.
 * Throws if called so regressions fail loudly at source.
 */
export function quoteWorldConcertTicketCut(_fanPaysCents: number): never {
  throw new Error(
    "WORLD_CONCERT_FLAT_18_FORBIDDEN: use quoteWorldConcertTierCut(fanPaysCents, performerTier) from WorldConcertTierRateAuthority",
  );
}

/**
 * @deprecated Physical venue/promoter tickets use 13% VenuePromoterTicketCutAuthority.
 */
export function quotePhysicalEventTicketCut(_fanPaysCents: number): never {
  throw new Error(
    "PHYSICAL_TICKET_FLAT_18_FORBIDDEN: use quoteVenuePromoterTicketCut from VenuePromoterTicketCutAuthority (13%)",
  );
}

export function sumPlatformCutsWithoutDoubleCharge(
  rows: readonly PlatformCutBreakdown[],
): {
  uniqueTransactionCount: number;
  totalGmvCents: number;
  tmiPlatformCutCents: number;
  sellerSideCents: number;
} {
  const seen = new Set<string>();
  let totalGmvCents = 0;
  let tmiPlatformCutCents = 0;
  let sellerSideCents = 0;
  let uniqueTransactionCount = 0;

  for (const row of rows) {
    const key =
      row.attributionKey ??
      `${row.category}:${row.gmvCents}:${row.platformCutCents}:${uniqueTransactionCount}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueTransactionCount += 1;
    totalGmvCents += row.gmvCents;
    tmiPlatformCutCents += row.platformCutCents;
    sellerSideCents += row.sellerSideCents;
  }

  return { uniqueTransactionCount, totalGmvCents, tmiPlatformCutCents, sellerSideCents };
}

export const PLATFORM_CUT_CATEGORIES: readonly PlatformCutCategory[] = [
  "BOOKING",
  "MUSIC_SALE",
  "MARKETPLACE_SELLER",
  "PERFORMER_MERCHANDISE",
  "YOPHO_CREATOR_COMMERCE",
  "CREATOR_DIGITAL_COMMERCE",
  "TICKET_ADD_ON",
  "OTHER_SELLER_TRANSACTION",
] as const;

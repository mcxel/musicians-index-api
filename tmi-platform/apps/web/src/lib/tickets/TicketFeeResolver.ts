/**
 * TicketFeePolicy — ONE canonical fixed-fee ladder (not a percentage).
 * Seller sets face price; buyer total = seller price + TMI fee (+ optional tax).
 * Host payout = seller face price (fee is platform-only).
 */

export type EventVenueSize = "micro" | "small" | "mid" | "large" | "major";

/** Canonical policy id — referenced on ticket drafts / checkout metadata. */
export const TICKET_FEE_POLICY_ID = "tmi-ticket-fee-v1" as const;

export type TicketFeeBand = {
  name: string;
  minPriceCents: number;
  maxPriceCents: number | null;
  feeCents: number;
};

/**
 * Fixed ladder by seller face price.
 * Floor $0.75 · Cap $9.99 — never a hidden % of ticket price.
 */
export const TICKET_FEE_PRICE_BANDS: TicketFeeBand[] = [
  { name: "micro", minPriceCents: 0, maxPriceCents: 499, feeCents: 75 },
  { name: "entry", minPriceCents: 500, maxPriceCents: 999, feeCents: 99 },
  { name: "standard", minPriceCents: 1000, maxPriceCents: 1999, feeCents: 149 },
  { name: "mid", minPriceCents: 2000, maxPriceCents: 3999, feeCents: 199 },
  { name: "upper", minPriceCents: 4000, maxPriceCents: 7499, feeCents: 299 },
  { name: "premium", minPriceCents: 7500, maxPriceCents: 12499, feeCents: 499 },
  { name: "high", minPriceCents: 12500, maxPriceCents: 24999, feeCents: 699 },
  { name: "cap", minPriceCents: 25000, maxPriceCents: null, feeCents: 999 },
];

export type TicketFeePolicy = {
  id: typeof TICKET_FEE_POLICY_ID;
  minimumFeeCents: number;
  maximumFeeCents: number;
  bands: TicketFeeBand[];
  currency: "USD";
};

export const CANONICAL_TICKET_FEE_POLICY: TicketFeePolicy = {
  id: TICKET_FEE_POLICY_ID,
  minimumFeeCents: 75,
  maximumFeeCents: 999,
  bands: TICKET_FEE_PRICE_BANDS,
  currency: "USD",
};

/** @deprecated Use TICKET_FEE_PRICE_BANDS — kept for type aliases that referenced volume tiers. */
export type TicketFeeTier = {
  name: TicketFeeBand["name"];
  minVolume: number;
  maxVolume: number | null;
  platformFeeCentsPerTicket: number;
};

export type TicketFeeResolution = {
  feePolicyId: typeof TICKET_FEE_POLICY_ID;
  tier: string;
  platformFeeCentsPerTicket: number;
  taxRateBps: number;
  taxCentsPerTicket: number;
  /** Seller face price (what the event owner receives per ticket). */
  hostPayoutCentsPerTicket: number;
  /** sellerPrice + platformFee + tax */
  buyerTotalCentsPerTicket: number;
  sellerPriceCents: number;
};

export type TicketSaleSplit = {
  feePolicyId: typeof TICKET_FEE_POLICY_ID;
  quantity: number;
  baseSubtotalCents: number;
  platformFeeSubtotalCents: number;
  taxSubtotalCents: number;
  buyerTotalCents: number;
  hostPayoutCents: number;
};

function clampFee(feeCents: number): number {
  return Math.min(
    CANONICAL_TICKET_FEE_POLICY.maximumFeeCents,
    Math.max(CANONICAL_TICKET_FEE_POLICY.minimumFeeCents, Math.round(feeCents)),
  );
}

export function resolveFeeBand(sellerPriceCents: number): TicketFeeBand {
  const price = Math.max(0, Math.round(sellerPriceCents));
  const band = TICKET_FEE_PRICE_BANDS.find((b) => {
    const inMin = price >= b.minPriceCents;
    const inMax = b.maxPriceCents === null || price <= b.maxPriceCents;
    return inMin && inMax;
  });
  return band ?? TICKET_FEE_PRICE_BANDS[TICKET_FEE_PRICE_BANDS.length - 1];
}

export function getTicketFeePolicy(): TicketFeePolicy {
  return CANONICAL_TICKET_FEE_POLICY;
}

/**
 * Resolve platform fee from seller face price (authoritative).
 * `ticketVolume` / `venueSize` are ignored for fee amount (price-band only).
 */
export function resolveTicketFee(input: {
  baseTicketPriceCents: number;
  ticketVolume?: number;
  eventCategory?: string;
  venueSize?: EventVenueSize;
  taxRateBps?: number;
}): TicketFeeResolution {
  void input.ticketVolume;
  void input.eventCategory;
  void input.venueSize;

  const sellerPriceCents = Math.max(0, Math.round(input.baseTicketPriceCents));
  const band = resolveFeeBand(sellerPriceCents);
  const platformFeeCentsPerTicket = clampFee(band.feeCents);
  const taxRateBps = input.taxRateBps ?? 0;
  const taxCentsPerTicket =
    taxRateBps > 0 ? Math.round((sellerPriceCents * taxRateBps) / 10000) : 0;
  const hostPayoutCentsPerTicket = sellerPriceCents;
  const buyerTotalCentsPerTicket =
    sellerPriceCents + platformFeeCentsPerTicket + taxCentsPerTicket;

  return {
    feePolicyId: TICKET_FEE_POLICY_ID,
    tier: band.name,
    platformFeeCentsPerTicket,
    taxRateBps,
    taxCentsPerTicket,
    hostPayoutCentsPerTicket,
    buyerTotalCentsPerTicket,
    sellerPriceCents,
  };
}

export function buildTicketSaleSplit(input: {
  baseTicketPriceCents: number;
  quantity: number;
  ticketVolume?: number;
  venueSize?: EventVenueSize;
  eventCategory?: string;
  taxRateBps?: number;
}): TicketSaleSplit {
  const fee = resolveTicketFee({
    baseTicketPriceCents: input.baseTicketPriceCents,
    ticketVolume: input.ticketVolume,
    eventCategory: input.eventCategory,
    venueSize: input.venueSize,
    taxRateBps: input.taxRateBps,
  });

  const qty = Math.max(1, Math.floor(input.quantity));
  const baseSubtotalCents = fee.sellerPriceCents * qty;
  const platformFeeSubtotalCents = fee.platformFeeCentsPerTicket * qty;
  const taxSubtotalCents = fee.taxCentsPerTicket * qty;

  return {
    feePolicyId: TICKET_FEE_POLICY_ID,
    quantity: qty,
    baseSubtotalCents,
    platformFeeSubtotalCents,
    taxSubtotalCents,
    buyerTotalCents: baseSubtotalCents + platformFeeSubtotalCents + taxSubtotalCents,
    hostPayoutCents: baseSubtotalCents,
  };
}

/** Transparent breakdown for Review & Publish / checkout UI. */
export function formatTicketFeeBreakdown(sellerPriceCents: number): {
  sellerPriceLabel: string;
  feeLabel: string;
  buyerTotalLabel: string;
  payoutLabel: string;
  fee: TicketFeeResolution;
} {
  const fee = resolveTicketFee({ baseTicketPriceCents: sellerPriceCents });
  const dollars = (c: number) => `$${(c / 100).toFixed(2)}`;
  return {
    sellerPriceLabel: dollars(fee.sellerPriceCents),
    feeLabel: dollars(fee.platformFeeCentsPerTicket),
    buyerTotalLabel: dollars(fee.buyerTotalCentsPerTicket),
    payoutLabel: dollars(fee.hostPayoutCentsPerTicket),
    fee,
  };
}

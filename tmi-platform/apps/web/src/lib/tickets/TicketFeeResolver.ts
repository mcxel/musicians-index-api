/**
 * TicketFeeResolver
 * Low platform fee ladder + automated split resolver.
 * Inputs: ticket volume, event category, venue size.
 * Outputs: platform fee, host payout, tax amount, buyer total.
 */

export type EventVenueSize = "micro" | "small" | "mid" | "large" | "major";

export type TicketFeeTier = {
  name: "micro" | "small" | "mid" | "large" | "major";
  minVolume: number;
  maxVolume: number | null;
  platformFeeCentsPerTicket: number;
};

export type TicketFeeResolution = {
  tier: TicketFeeTier["name"];
  platformFeeCentsPerTicket: number;
  taxRateBps: number;
  taxCentsPerTicket: number;
  hostPayoutCentsPerTicket: number;
  buyerTotalCentsPerTicket: number;
};

export type TicketSaleSplit = {
  quantity: number;
  baseSubtotalCents: number;
  platformFeeSubtotalCents: number;
  taxSubtotalCents: number;
  buyerTotalCents: number;
  hostPayoutCents: number;
};

export const TICKET_FEE_LADDER: TicketFeeTier[] = [
  { name: "micro", minVolume: 1, maxVolume: 50, platformFeeCentsPerTicket: 75 },
  { name: "small", minVolume: 51, maxVolume: 250, platformFeeCentsPerTicket: 199 },
  { name: "mid", minVolume: 251, maxVolume: 1000, platformFeeCentsPerTicket: 399 },
  { name: "large", minVolume: 1001, maxVolume: 5000, platformFeeCentsPerTicket: 699 },
  { name: "major", minVolume: 5001, maxVolume: null, platformFeeCentsPerTicket: 999 },
];

function resolveTierByVolume(ticketVolume: number): TicketFeeTier {
  const tier = TICKET_FEE_LADDER.find((item) => {
    const inMin = ticketVolume >= item.minVolume;
    const inMax = item.maxVolume === null || ticketVolume <= item.maxVolume;
    return inMin && inMax;
  });

  return tier ?? TICKET_FEE_LADDER[TICKET_FEE_LADDER.length - 1];
}

function adjustTierByVenueSize(base: TicketFeeTier, venueSize?: EventVenueSize): TicketFeeTier {
  if (!venueSize) return base;

  // Conservative policy: keep volume ladder as source of truth, but if declared major venue,
  // ensure at least large fee tier to protect processing cost on large operations.
  if (venueSize === "major" && base.name === "micro") return TICKET_FEE_LADDER[3];
  return base;
}

export function resolveTicketFee(input: {
  baseTicketPriceCents: number;
  ticketVolume: number;
  eventCategory?: string;
  venueSize?: EventVenueSize;
  taxRateBps?: number;
}): TicketFeeResolution {
  const baseTier = resolveTierByVolume(input.ticketVolume);
  const tier = adjustTierByVenueSize(baseTier, input.venueSize);

  const taxRateBps = input.taxRateBps ?? 825;
  const platformFeeCentsPerTicket = tier.platformFeeCentsPerTicket;
  const taxCentsPerTicket = Math.round((input.baseTicketPriceCents * taxRateBps) / 10000);
  const hostPayoutCentsPerTicket = input.baseTicketPriceCents;
  const buyerTotalCentsPerTicket =
    input.baseTicketPriceCents + platformFeeCentsPerTicket + taxCentsPerTicket;

  return {
    tier: tier.name,
    platformFeeCentsPerTicket,
    taxRateBps,
    taxCentsPerTicket,
    hostPayoutCentsPerTicket,
    buyerTotalCentsPerTicket,
  };
}

export function buildTicketSaleSplit(input: {
  baseTicketPriceCents: number;
  quantity: number;
  ticketVolume: number;
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

  const baseSubtotalCents = input.baseTicketPriceCents * input.quantity;
  const platformFeeSubtotalCents = fee.platformFeeCentsPerTicket * input.quantity;
  const taxSubtotalCents = fee.taxCentsPerTicket * input.quantity;
  const buyerTotalCents = baseSubtotalCents + platformFeeSubtotalCents + taxSubtotalCents;
  const hostPayoutCents = baseSubtotalCents;

  return {
    quantity: input.quantity,
    baseSubtotalCents,
    platformFeeSubtotalCents,
    taxSubtotalCents,
    buyerTotalCents,
    hostPayoutCents,
  };
}

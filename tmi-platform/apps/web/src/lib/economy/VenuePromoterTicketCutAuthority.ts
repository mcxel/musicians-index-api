/**
 * Venue / Promoter physical & event ticket platform cut — owner-locked 13%.
 * Seller-controlled face price. Distinct from World Concert tier ladder and general 18%.
 */

export const VENUE_PROMOTER_TICKET_CUT_PERCENT = 13 as const;
export const VENUE_PROMOTER_TICKET_CUT_BPS = 1300 as const;
export const VENUE_PROMOTER_TICKET_POLICY_ID = "tmi-venue-promoter-ticket-cut-v1-13" as const;

export type VenuePromoterTicketQuote = {
  policyId: typeof VENUE_PROMOTER_TICKET_POLICY_ID;
  sellerRole: "VENUE" | "PROMOTER";
  fanPaysCents: number;
  platformRatePercent: typeof VENUE_PROMOTER_TICKET_CUT_PERCENT;
  tmiCutCents: number;
  sellerSideCents: number;
};

export function quoteVenuePromoterTicketCut(input: {
  fanPaysCents: number;
  sellerRole: "VENUE" | "PROMOTER";
}): VenuePromoterTicketQuote {
  const fanPaysCents = Math.max(0, Math.round(input.fanPaysCents));
  const tmiCutCents = Math.floor((fanPaysCents * VENUE_PROMOTER_TICKET_CUT_BPS) / 10_000);
  return {
    policyId: VENUE_PROMOTER_TICKET_POLICY_ID,
    sellerRole: input.sellerRole,
    fanPaysCents,
    platformRatePercent: VENUE_PROMOTER_TICKET_CUT_PERCENT,
    tmiCutCents,
    sellerSideCents: fanPaysCents - tmiCutCents,
  };
}

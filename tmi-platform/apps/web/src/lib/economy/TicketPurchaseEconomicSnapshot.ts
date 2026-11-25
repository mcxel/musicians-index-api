/**
 * TicketPurchaseEconomicSnapshot — immutable purchase-time economics.
 *
 * Cancellation / refund accounting MUST reverse from this snapshot,
 * never from the seller's current membership tier or a recalculated rate.
 *
 * Does not invent commissions — binds to existing family authorities at capture time.
 * Stripe untouched.
 */

import {
  PLATFORM_CUT_POLICY_ID,
  TMI_PLATFORM_CUT_BPS,
} from "./PlatformCutAuthority";
import {
  WORLD_CONCERT_TIER_RATE_POLICY_ID,
  quoteWorldConcertTierCut,
} from "./WorldConcertTierRateAuthority";
import {
  VENUE_PROMOTER_TICKET_POLICY_ID,
  VENUE_PROMOTER_TICKET_CUT_BPS,
  quoteVenuePromoterTicketCut,
} from "./VenuePromoterTicketCutAuthority";

export const TICKET_PURCHASE_ECONOMIC_SNAPSHOT_SCHEMA = 1 as const;

export type TicketEventFamily =
  | "WORLD_CONCERT"
  | "MINI_CONCERT"
  | "VENUE_EVENT"
  | "PROMOTER_EVENT"
  | "GENERAL_SELLER_COMMERCE"
  | "OTHER";

export type TicketSellerRole = "PERFORMER" | "VENUE" | "PROMOTER" | "OTHER";

export type TicketPurchaseEconomicSnapshot = {
  schemaVersion: typeof TICKET_PURCHASE_ECONOMIC_SNAPSHOT_SCHEMA;
  capturedAtIso: string;
  transactionId: string;
  eventId: string;
  offerId: string | null;
  sellerId: string;
  sellerRole: TicketSellerRole;
  eventFamily: TicketEventFamily;
  facePriceCents: number;
  quantity: number;
  grossTransactionCents: number;
  /** Frozen policy identity at purchase — never rewrite. */
  platformPolicyId: string;
  /** Frozen rate in basis points (e.g. 1200 = 12%). */
  platformRateBps: number;
  platformShareCents: number;
  sellerSideCents: number;
  /** TicketFeeResolver / buyer service fee if separately applied — not commission. */
  serviceFeeCents: number;
  taxCents: number;
  discountCents: number;
  buyerTotalCents: number;
  /** World Concert: tier that produced platformRateBps. Frozen. */
  performerTierAtPurchase: string | null;
  currency: "USD";
};

export type CaptureTicketPurchaseEconomicsInput = {
  transactionId: string;
  eventId: string;
  offerId?: string | null;
  sellerId: string;
  sellerRole: TicketSellerRole;
  eventFamily: TicketEventFamily;
  facePriceCents: number;
  quantity?: number;
  /** Required for WORLD_CONCERT (and Mini if/when tier-bound). Frozen into snapshot. */
  performerTierAtPurchase?: string | null;
  serviceFeeCents?: number;
  taxCents?: number;
  discountCents?: number;
  capturedAtIso?: string;
};

/**
 * Capture immutable economics at purchase.
 * MINI_CONCERT without proven policy throws OWNER_VALUE_REQUIRED — do not invent %.
 */
export function captureTicketPurchaseEconomics(
  input: CaptureTicketPurchaseEconomicsInput,
): TicketPurchaseEconomicSnapshot {
  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
  const facePriceCents = Math.max(0, Math.round(input.facePriceCents));
  const grossTransactionCents = facePriceCents * quantity;
  const serviceFeeCents = Math.max(0, Math.round(input.serviceFeeCents ?? 0));
  const taxCents = Math.max(0, Math.round(input.taxCents ?? 0));
  const discountCents = Math.max(0, Math.round(input.discountCents ?? 0));

  let platformPolicyId: string;
  let platformRateBps: number;
  let platformShareCents: number;
  let sellerSideCents: number;
  let performerTierAtPurchase: string | null = input.performerTierAtPurchase ?? null;

  switch (input.eventFamily) {
    case "WORLD_CONCERT": {
      const unit = quoteWorldConcertTierCut({
        fanPaysCents: facePriceCents,
        performerTier: input.performerTierAtPurchase,
      });
      platformPolicyId = WORLD_CONCERT_TIER_RATE_POLICY_ID;
      platformRateBps = unit.platformRateBps;
      platformShareCents = unit.tmiCutCents * quantity;
      sellerSideCents = unit.performerSideCents * quantity;
      performerTierAtPurchase = unit.performerTier;
      break;
    }
    case "VENUE_EVENT":
    case "PROMOTER_EVENT": {
      const role = input.eventFamily === "VENUE_EVENT" ? "VENUE" : "PROMOTER";
      const unit = quoteVenuePromoterTicketCut({
        fanPaysCents: facePriceCents,
        sellerRole: role,
      });
      platformPolicyId = VENUE_PROMOTER_TICKET_POLICY_ID;
      platformRateBps = VENUE_PROMOTER_TICKET_CUT_BPS;
      platformShareCents = unit.tmiCutCents * quantity;
      sellerSideCents = unit.sellerSideCents * quantity;
      performerTierAtPurchase = null;
      break;
    }
    case "GENERAL_SELLER_COMMERCE": {
      platformPolicyId = PLATFORM_CUT_POLICY_ID;
      platformRateBps = TMI_PLATFORM_CUT_BPS;
      platformShareCents = Math.floor((grossTransactionCents * TMI_PLATFORM_CUT_BPS) / 10_000);
      sellerSideCents = grossTransactionCents - platformShareCents;
      performerTierAtPurchase = null;
      break;
    }
    case "MINI_CONCERT":
      throw new Error(
        "OWNER_VALUE_REQUIRED:MINI_CONCERT_COMMISSION — audit proven Mini Concert ticket policy before capturing economics; do not invent 18% or 13%",
      );
    default:
      throw new Error(`UNSUPPORTED_TICKET_EVENT_FAMILY:${input.eventFamily}`);
  }

  const buyerTotalCents = Math.max(
    0,
    grossTransactionCents + serviceFeeCents + taxCents - discountCents,
  );

  return {
    schemaVersion: TICKET_PURCHASE_ECONOMIC_SNAPSHOT_SCHEMA,
    capturedAtIso: input.capturedAtIso ?? new Date().toISOString(),
    transactionId: input.transactionId,
    eventId: input.eventId,
    offerId: input.offerId ?? null,
    sellerId: input.sellerId,
    sellerRole: input.sellerRole,
    eventFamily: input.eventFamily,
    facePriceCents,
    quantity,
    grossTransactionCents,
    platformPolicyId,
    platformRateBps,
    platformShareCents,
    sellerSideCents,
    serviceFeeCents,
    taxCents,
    discountCents,
    buyerTotalCents,
    performerTierAtPurchase,
    currency: "USD",
  };
}

/** Commission reversal must use frozen bps — never re-quote from current tier. */
export function commissionReversalFromSnapshot(
  snapshot: TicketPurchaseEconomicSnapshot,
): {
  platformShareToReverseCents: number;
  sellerSideToReverseCents: number;
  platformRateBpsFrozen: number;
  platformPolicyId: string;
  mustNotUseCurrentTier: true;
} {
  return {
    platformShareToReverseCents: snapshot.platformShareCents,
    sellerSideToReverseCents: snapshot.sellerSideCents,
    platformRateBpsFrozen: snapshot.platformRateBps,
    platformPolicyId: snapshot.platformPolicyId,
    mustNotUseCurrentTier: true,
  };
}

/**
 * Prove cancellation reversal ignores a later tier upgrade.
 * Returns the frozen reversal + what a mistaken current-tier recalc would yield.
 */
export function compareWorldConcertReversalVsCurrentTier(input: {
  snapshot: TicketPurchaseEconomicSnapshot;
  currentPerformerTier: string;
}): {
  frozenReversalCents: number;
  mistakenCurrentTierRecalcCents: number;
  ratesDiffer: boolean;
  usesFrozenSnapshot: true;
} {
  if (input.snapshot.eventFamily !== "WORLD_CONCERT") {
    throw new Error("NOT_WORLD_CONCERT_SNAPSHOT");
  }
  const reversal = commissionReversalFromSnapshot(input.snapshot);
  const currentUnit = quoteWorldConcertTierCut({
    fanPaysCents: input.snapshot.facePriceCents,
    performerTier: input.currentPerformerTier,
  });
  return {
    frozenReversalCents: reversal.platformShareToReverseCents,
    mistakenCurrentTierRecalcCents: currentUnit.tmiCutCents * input.snapshot.quantity,
    ratesDiffer: currentUnit.platformRateBps !== input.snapshot.platformRateBps,
    usesFrozenSnapshot: true,
  };
}

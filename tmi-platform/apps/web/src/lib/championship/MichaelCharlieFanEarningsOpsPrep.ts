/**
 * MichaelCharlieFanEarningsOpsPrep — preparation only.
 *
 * Michael Charlie remains Award/Prize/Fulfillment authority
 * (`MichaelCharlieAwardOperations.ts`). This module does NOT expand that
 * authority and does NOT fabricate KPIs. It documents the approved read path
 * for future fan-earnings ops once owner explicitly authorizes MC integration.
 *
 * Big Ace stays outside fan-earnings operations (0% cross-brand command).
 * InstantPayoutEngine remains FROZEN — this never triggers payouts.
 */

import type { EconomicTransactionType } from "@/lib/commerce/economicPaymentIdentity";

export const MC_FAN_EARNINGS_OPS_STATUS = "PREP_ONLY_NOT_ACTIVATED" as const;

export const CREATOR_SPONSORSHIP_LEDGER_TYPE: EconomicTransactionType = "CREATOR_SPONSORSHIP";

/**
 * Query shape for future MC / admin transparency (not mounted in UI yet).
 * Callers must use real EconomicPayment rows — never invent revenue totals.
 */
export function creatorSponsorshipEarningsQueryHint() {
  return {
    transactionType: CREATOR_SPONSORSHIP_LEDGER_TYPE,
    fields: [
      "economicPaymentId",
      "grossCents",
      "platformFeeCents",
      "performerShareCents", // dual-use: fan or performer creator share
      "sellerTier",
      "productId",
      "paymentIntentId",
      "livemode",
      "createdAt",
    ] as const,
    rules: [
      "Sum platformFeeCents for TMI commercial share only",
      "Sum performerShareCents for creator earnings (fan or performer)",
      "Do not subtract fabricated Stripe processing fees",
      "Do not display InstantPayout availability while engine is frozen",
      "Do not show hardcoded Revenue Today / Active Users (Rule 20)",
    ],
    michaelCharlieScope: "PREP — award/fulfillment unchanged until owner expands ops charter",
    bigAceScope: "OUT_OF_FAN_EARNINGS",
  };
}

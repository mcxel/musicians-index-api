/**
 * TMI Creator Economy — platform fee constants.
 *
 * Philosophy: TMI does NOT replace streaming. It adds artist-controlled direct
 * commerce beside discovery/live. Artist is merchant of record and sets price;
 * TMI takes a transparent service fee on the commerce connector path.
 *
 * Flow: Discovery → Engagement → Commerce (TMI) → Fulfillment (external store) → Analytics.
 *
 * Distinct from other platform cuts (do not conflate):
 * - Tips via Stripe webhook: ~10% artistShare split
 * - Artist settle route: 15% PLATFORM_FEE_RATE
 * - Beat marketplace / RevenueSplitEngine presets: 15–25% depending on product
 * - Tickets: Venue/Promoter authority (Rule 17) — not this fee
 *
 * Commerce Connector service fee (external storefront deep-link / referral):
 * 500 bps = 5%. Aligns with "lowest platform fee — 5%" venue messaging and
 * the Phase-1 pitch vs $0.003 streaming — artist keeps pricing sovereignty.
 */

/** Basis points: 500 = 5.00% TMI commerce service fee on connector path. */
export const TMI_COMMERCE_SERVICE_FEE_BPS = 500;

export function commerceServiceFeePercent(): number {
  return TMI_COMMERCE_SERVICE_FEE_BPS / 100;
}

export function formatCommerceServiceFeeLabel(): string {
  const pct = TMI_COMMERCE_SERVICE_FEE_BPS / 100;
  return `${pct}% TMI service fee`;
}

/** Fee cents from a gross sale in cents (floor). */
export function computeCommerceServiceFeeCents(grossCents: number): number {
  if (grossCents <= 0) return 0;
  return Math.floor((grossCents * TMI_COMMERCE_SERVICE_FEE_BPS) / 10_000);
}

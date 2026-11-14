/**
 * Fan/Performer creator sponsorship — platform fee & renewal identity tests.
 * Local only. No Stripe mutations. No InstantPayout.
 */

import {
  CREATOR_SPONSORSHIP_TX,
  buildCreatorSponsorshipCycleSnapshot,
  isCreatorSponsorshipMetadataType,
  isPlatformWideAdProductType,
  normalizeCreatorSubscriptionTier,
  profileKindFromSponsorshipMetadata,
} from "@/lib/sponsors/CreatorSponsorshipCreditAuthority";
import {
  calculateArtistSponsorPayout,
  calculateCreatorSponsorPayout,
} from "@/lib/sponsors/ArtistSponsorPricingEngine";
import { getPlanPlatformRevenueShare } from "@/lib/subscriptions/SubscriptionPlanEngine";
import { creatorSponsorshipEarningsQueryHint } from "@/lib/championship/MichaelCharlieFanEarningsOpsPrep";
import {
  economicCreditKey,
  MemoryFinancialLedger,
  planAdjustment,
} from "@/lib/commerce/economicPaymentIdentity";

describe("Creator sponsorship revenue share (approved percentages)", () => {
  it("RUBY 20% on $25 → TMI $5 / creator $20 (illustrative of existing share)", () => {
    const split = calculateCreatorSponsorPayout({
      grossCents: 2500,
      creatorSubscriptionTier: "RUBY",
    });
    expect(getPlanPlatformRevenueShare("RUBY")).toBe(0.2);
    expect(split.platformCents).toBe(500);
    expect(split.creatorCents).toBe(2000);
  });

  it("fan and performer use identical math via calculateArtistSponsorPayout", () => {
    const a = calculateArtistSponsorPayout({
      grossCents: 10000,
      artistSubscriptionTier: "gold",
    });
    const b = calculateCreatorSponsorPayout({
      grossCents: 10000,
      creatorSubscriptionTier: "gold",
    });
    expect(b.platformCents).toBe(a.platformCents);
    expect(b.creatorCents).toBe(a.artistCents);
  });

  it("snapshot stores creator share in performerShareCents dual-use field", () => {
    const snap = buildCreatorSponsorshipCycleSnapshot({
      grossCents: 2500,
      creatorSubscriptionTier: "RUBY",
    });
    expect(snap.performerShareCents).toBe(2000);
    expect(snap.platformFeeCents).toBe(500);
    expect(snap.stripeProcessingFeeCents).toBeNull();
  });

  it("metadata typing distinguishes creator sponsorship from platform ads", () => {
    expect(isCreatorSponsorshipMetadataType("fan_sponsorship")).toBe(true);
    expect(isCreatorSponsorshipMetadataType("performer_sponsorship")).toBe(true);
    expect(isCreatorSponsorshipMetadataType("creator_sponsorship")).toBe(true);
    expect(isCreatorSponsorshipMetadataType("ad_purchase")).toBe(false);
    expect(isPlatformWideAdProductType("ad_purchase")).toBe(true);
    expect(profileKindFromSponsorshipMetadata({ type: "fan_sponsorship" })).toBe("FAN");
    expect(profileKindFromSponsorshipMetadata({ type: "performer_sponsorship" })).toBe(
      "PERFORMER",
    );
  });

  it("normalizes tiers and keeps CREATOR_SPONSORSHIP ledger type additive", () => {
    expect(normalizeCreatorSubscriptionTier("RUBY")).toBe("RUBY");
    expect(normalizeCreatorSubscriptionTier("pro")).toBe("pro");
    expect(CREATOR_SPONSORSHIP_TX).toBe("CREATOR_SPONSORSHIP");
    expect(creatorSponsorshipEarningsQueryHint().michaelCharlieScope).toMatch(/PREP/);
  });

  it("refund/dispute adjustments apply to CREATOR_SPONSORSHIP without duplicate deductions", () => {
    // RUBY $25 cycle: platform $5 / creator $20 — creator share lives in performerShareCents.
    const snap = buildCreatorSponsorshipCycleSnapshot({
      grossCents: 2500,
      creatorSubscriptionTier: "RUBY",
    });
    const invoiceId = "in_creator_sponsorship_refund_cert";
    const key = economicCreditKey({
      checkoutSessionId: invoiceId,
      transactionType: "CREATOR_SPONSORSHIP",
      livemode: true,
    });
    expect(key).toContain("CREATOR_SPONSORSHIP");

    const planned = planAdjustment({
      kind: "REFUND",
      originalGrossCents: snap.grossCents,
      originalPerformerShareCents: snap.performerShareCents,
      adjustmentGrossCents: snap.grossCents,
      alreadyReversedPerformerCents: 0,
      fundsCents: snap.performerShareCents,
    });
    expect(planned).toEqual({ status: "APPLIED", cents: 2000 });

    const ledger = new MemoryFinancialLedger();
    expect(
      ledger.credit({
        key,
        livemode: true,
        bucket: "PENDING",
        cents: snap.performerShareCents,
        gross: snap.grossCents,
        eventId: "evt_cs_sale",
      }),
    ).toBe(true);
    expect(ledger.live.pending).toBe(2000);

    const first = ledger.applyAdjustment({
      externalId: "re_cs_full",
      key,
      kind: "REFUND",
      grossCents: 2500,
      livemode: true,
    });
    expect(first).toEqual({ status: "APPLIED", cents: 2000 });
    expect(ledger.live.pending).toBe(0);
    expect(ledger.adjustments.size).toBe(1);

    const replay = ledger.applyAdjustment({
      externalId: "re_cs_full",
      key,
      kind: "REFUND",
      grossCents: 2500,
      livemode: true,
    });
    expect(replay.status).toBe("duplicate");
    expect(ledger.adjustments.size).toBe(1);
    expect(ledger.live.pending).toBe(0);

    const dispute = ledger.applyAdjustment({
      externalId: "dp_cs_1",
      key,
      kind: "DISPUTE",
      grossCents: 2500,
      livemode: true,
    });
    // Full creator share already reversed by refund — no second deduction.
    expect(dispute.status).toBe("COVERED_BY_PRIOR_REVERSAL");
    expect(dispute.cents).toBe(0);
    expect(ledger.live.pending).toBe(0);
  });
});

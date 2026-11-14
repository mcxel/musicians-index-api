/**
 * Pricing catalog + Stripe sync ledger + lowest-price-first + ad laws.
 */
import {
  assertLowestPriceFirst,
  sortOffersLowestPriceFirst,
} from "../lib/commerce/PriceSortAuthority";
import {
  CANONICAL_PRICING_REGISTRY,
  buildPricingSyncLedger,
  canServeCurtainAd,
  getPlatformAdLoadPercent,
  listCanonicalPricingLowestFirst,
  listMembershipOffersLowestFirst,
  MEMBER_PLATFORM_AD_LOAD_PERCENT,
} from "../lib/commerce/CanonicalPricingRegistry";
import {
  AD_PLACEMENT_REGISTRY,
  getPerformanceNativeSlots,
  getPlatformAdSlots,
} from "../lib/commerce/AdPlacementRegistry";
import { STRIPE_PRODUCTS, isRealPriceId } from "../lib/stripe/products";

describe("CanonicalPricingRegistry convergence", () => {
  it("every registry price comes from STRIPE_PRODUCTS (no second price table)", () => {
    for (const e of CANONICAL_PRICING_REGISTRY) {
      const product = STRIPE_PRODUCTS[e.stripeProductKey];
      expect(product.price).toBe(e.priceCents);
      expect(product.priceId).toBe(e.priceId);
      expect(product.name).toBe(e.name);
    }
  });

  it("membership offers are lowest-price-first with FREE first", () => {
    for (const account of ["fan", "performer"] as const) {
      const offers = listMembershipOffersLowestFirst(account);
      expect(offers[0]?.priceCents).toBe(0);
      expect(assertLowestPriceFirst(offers.map((o) => ({ id: o.id, priceCents: o.priceCents }))).ok).toBe(true);
    }
  });

  it("Performer Pro remains canonical $2.99 — no invented membership prices", () => {
    expect(STRIPE_PRODUCTS.PERFORMER_PRO_MONTHLY.price).toBe(299);
    expect(STRIPE_PRODUCTS.FAN_PRO_MONTHLY.price).toBe(499);
  });

  it("low-friction platform ads sit in $2.99–$29.99", () => {
    const lowFriction = listCanonicalPricingLowestFirst((e) => e.family === "ONE_TIME_PLATFORM_AD");
    expect(lowFriction.length).toBeGreaterThan(0);
    for (const e of lowFriction) {
      expect(e.priceCents).toBeGreaterThanOrEqual(299);
      expect(e.priceCents).toBeLessThanOrEqual(2999);
      expect(e.countsAgainstMemberAdAllowance).toBe(true);
      expect(e.monetizationKind).toBe("PLATFORM_AD");
    }
    expect(assertLowestPriceFirst(lowFriction.map((e) => ({ id: e.catalogId, priceCents: e.priceCents }))).ok).toBe(true);
  });

  it("PLATFORM_AD counts against allowance; PERFORMANCE_NATIVE does not", () => {
    for (const e of CANONICAL_PRICING_REGISTRY) {
      if (e.monetizationKind === "PLATFORM_AD") {
        expect(e.countsAgainstMemberAdAllowance).toBe(true);
      }
      if (e.monetizationKind === "PERFORMANCE_NATIVE") {
        expect(e.countsAgainstMemberAdAllowance).toBe(false);
      }
    }
    for (const slot of getPlatformAdSlots()) {
      expect(slot.countsAgainstMemberAdAllowance).toBe(true);
      expect(slot.monetizationKind).toBe("PLATFORM_AD");
    }
    for (const slot of getPerformanceNativeSlots()) {
      expect(slot.countsAgainstMemberAdAllowance).toBe(false);
      expect(slot.monetizationKind).toBe("PERFORMANCE_NATIVE");
    }
  });

  it("curtain slot never interrupts active performance; canServeCurtainAd gates LIVE/OPEN", () => {
    const curtain = AD_PLACEMENT_REGISTRY.find((s) => s.slotId === "curtain-ad-rail");
    expect(curtain?.neverInterruptActivePerformance).toBe(true);
    expect(curtain?.monetizationKind).toBe("PERFORMANCE_NATIVE");
    expect(canServeCurtainAd("LIVE")).toBe(false);
    expect(canServeCurtainAd("OPEN")).toBe(false);
    expect(canServeCurtainAd("INTERMISSION")).toBe(true);
    expect(canServeCurtainAd("COMMERCIAL_BREAK")).toBe(true);
    expect(canServeCurtainAd("CLOSED")).toBe(true);
  });

  it("membership PLATFORM_AD load FREE 100% … DIAMOND 5%", () => {
    expect(MEMBER_PLATFORM_AD_LOAD_PERCENT.FREE).toBe(100);
    expect(MEMBER_PLATFORM_AD_LOAD_PERCENT.DIAMOND).toBe(5);
    expect(getPlatformAdLoadPercent("free")).toBe(100);
    expect(getPlatformAdLoadPercent("diamond")).toBe(5);
    const ordered = ["FREE", "PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"] as const;
    for (let i = 1; i < ordered.length; i++) {
      expect(MEMBER_PLATFORM_AD_LOAD_PERCENT[ordered[i]]).toBeLessThan(
        MEMBER_PLATFORM_AD_LOAD_PERCENT[ordered[i - 1]],
      );
    }
  });

  it("sync ledger classifies real price IDs as MAPPED and placeholders as STRIPE_SYNC_PENDING", () => {
    const ledger = buildPricingSyncLedger();
    for (const e of ledger.mapped) {
      expect(isRealPriceId(e.priceId)).toBe(true);
      expect(e.syncStatus).toBe("MAPPED");
    }
    for (const e of ledger.stripeSyncPending) {
      expect(isRealPriceId(e.priceId)).toBe(false);
      expect(e.syncStatus).toBe("STRIPE_SYNC_PENDING");
    }
    // Without local sk_test_, pending ads/boosts are expected (not created this pass).
    expect(ledger.stripeSyncPending.length).toBeGreaterThan(0);
  });

  it("catalog listing sorts lowest-price-first via PriceSortAuthority", () => {
    const sorted = listCanonicalPricingLowestFirst();
    expect(
      assertLowestPriceFirst(sorted.map((e) => ({ id: e.catalogId, priceCents: e.priceCents }))).ok,
    ).toBe(true);
    const shuffled = sortOffersLowestPriceFirst(
      [...CANONICAL_PRICING_REGISTRY]
        .reverse()
        .map((e) => ({ id: e.catalogId, priceCents: e.priceCents })),
    );
    expect(assertLowestPriceFirst(shuffled).ok).toBe(true);
  });
});

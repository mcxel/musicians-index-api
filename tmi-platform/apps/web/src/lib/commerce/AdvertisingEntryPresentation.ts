/**
 * AdvertisingEntryPresentation — lowest real ad price first for public surfaces.
 * Prices come ONLY from STRIPE_PRODUCTS / CanonicalPricingRegistry / AdPricingEngine.
 * Presentation is replaceable; product keys and placement bindings are permanent.
 */

import { STRIPE_PRODUCTS, type StripeProductKey } from "@/lib/stripe/products";
import {
  CANONICAL_PRICING_REGISTRY,
  type CanonicalPricingEntry,
} from "@/lib/commerce/CanonicalPricingRegistry";
import { sortOffersLowestPriceFirst } from "@/lib/commerce/PriceSortAuthority";
import { listAdDayPricesLowestFirst } from "@/lib/ads/AdPricingEngine";

export const ADVERTISING_ENTRY_PRODUCT_KEY = "AD_ENTRY_DAY_099" as const satisfies StripeProductKey;

export type AdvertisingOfferCard = {
  id: string;
  catalogId: string;
  stripeProductKey: StripeProductKey;
  name: string;
  priceCents: number;
  displayPrice: string;
  intervalLabel: string;
  checkoutHref: string;
  isEntryOffer: boolean;
  family: CanonicalPricingEntry["family"];
  placementBindings: string[];
};

function centsDisplay(cents: number): string {
  const n = cents / 100;
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

function intervalLabel(entry: CanonicalPricingEntry): string {
  if (entry.stripeProductKey === ADVERTISING_ENTRY_PRODUCT_KEY) return "/day";
  if (entry.interval === "month") return "/mo";
  if (entry.interval === "week") return "/wk";
  if (entry.interval === "day") return "/day";
  return " one-time";
}

/** Public headline: Starting as low as $0.99 a day — from real catalog or AdPricingEngine. */
export function getAdvertisingEntryHeadline(): {
  priceCents: number;
  display: string;
  productKey: StripeProductKey;
  checkoutHref: string;
  source: "STRIPE_PRODUCTS" | "AD_PRICING_ENGINE";
} {
  const entry = STRIPE_PRODUCTS.AD_ENTRY_DAY_099;
  if (entry?.price === 99) {
    return {
      priceCents: entry.price,
      display: centsDisplay(entry.price),
      productKey: ADVERTISING_ENTRY_PRODUCT_KEY,
      checkoutHref: `/api/stripe/checkout?priceId=${encodeURIComponent(entry.priceId)}&mode=payment&type=ad_purchase&refId=ad_entry_day_099&productName=${encodeURIComponent(entry.name)}`,
      source: "STRIPE_PRODUCTS",
    };
  }
  const lowest = listAdDayPricesLowestFirst()[0];
  return {
    priceCents: lowest?.priceCents ?? 99,
    display: centsDisplay(lowest?.priceCents ?? 99),
    productKey: ADVERTISING_ENTRY_PRODUCT_KEY,
    checkoutHref: "/advertiser/buy",
    source: "AD_PRICING_ENGINE",
  };
}

const PUBLIC_AD_FAMILIES = new Set([
  "ONE_TIME_PLATFORM_AD",
  "MAGAZINE",
  "RECURRING_AD",
]);

/** Catalog cards for /advertising — entry first, then lowest-price-first. */
export function listPublicAdvertisingOffersLowestFirst(): AdvertisingOfferCard[] {
  const rows = CANONICAL_PRICING_REGISTRY.filter((e) =>
    PUBLIC_AD_FAMILIES.has(e.family),
  ).map((e) => ({
    id: e.catalogId,
    catalogId: e.catalogId,
    stripeProductKey: e.stripeProductKey,
    name: e.name,
    priceCents: e.priceCents,
    displayPrice: centsDisplay(e.priceCents),
    intervalLabel: intervalLabel(e),
    checkoutHref: `/api/stripe/checkout?priceId=${encodeURIComponent(e.priceId)}&mode=${e.interval === "month" || e.interval === "week" ? "subscription" : "payment"}&type=ad_purchase&refId=${encodeURIComponent(e.catalogId)}&productName=${encodeURIComponent(e.name)}`,
    isEntryOffer: e.stripeProductKey === ADVERTISING_ENTRY_PRODUCT_KEY,
    family: e.family,
    placementBindings: [...e.placementBindings],
  }));

  const sorted = sortOffersLowestPriceFirst(rows);
  const entry = sorted.filter((r) => r.isEntryOffer);
  const rest = sorted.filter((r) => !r.isEntryOffer);
  return [...entry, ...rest];
}

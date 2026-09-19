/**
 * MagazineAdMarketplaceDataModel — PERMANENT advertiser/media/placement data.
 * Temporary gallery UI reads from this; futuristic Magazine rebuild must reuse it.
 * Classification: FUNCTIONALLY_READY_TEMPORARY_PRESENTATION (presentation only).
 */

import { AD_PLACEMENT_REGISTRY, type AdPlacementSlot } from "@/lib/commerce/AdPlacementRegistry";
import { AD_PRICES, type AdPlacement, type AdDuration } from "@/lib/ads/AdPricingEngine";
import { STRIPE_PRODUCTS, type StripeProductKey } from "@/lib/stripe/products";
import { sortOffersLowestPriceFirst } from "@/lib/commerce/PriceSortAuthority";

export const MAGAZINE_AD_MARKETPLACE_CLASSIFICATION =
  "FUNCTIONALLY_READY_TEMPORARY_PRESENTATION" as const;

export type MagazineAdCreativeKind = "image" | "video" | "either";

export type MagazineAdMarketplaceListing = {
  id: string;
  listingId: string;
  placementId: string;
  slotId: string;
  zoneKey: string;
  title: string;
  description: string;
  width: number;
  height: number;
  sizeLabel: string;
  creativeKind: MagazineAdCreativeKind;
  priceCents: number;
  duration: AdDuration;
  displayPrice: string;
  stripeProductKey: StripeProductKey | null;
  checkoutHref: string;
  advertiserFacingLabel: string;
};

function centsDisplay(cents: number): string {
  const n = cents / 100;
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

function creativeKindFor(slot: AdPlacementSlot): MagazineAdCreativeKind {
  if (slot.height >= 250 && slot.width >= 300) return "either";
  if (slot.surface === "MAGAZINE_LEADERBOARD") return "image";
  return slot.height >= 140 ? "either" : "image";
}

function mapStripeKey(slotId: string): StripeProductKey | null {
  if (slotId.includes("leaderboard") || slotId.includes("strip") || slotId.includes("section")) {
    return "MAGAZINE_STRIP_OT";
  }
  if (slotId.includes("half") || slotId.includes("mid") || slotId.includes("sidebar")) {
    return "MAGAZINE_HALF_OT";
  }
  if (slotId.includes("full") || slotId.includes("feature") || slotId.includes("lower")) {
    return "MAGAZINE_FULL_OT";
  }
  return "AD_ENTRY_DAY_099";
}

function enginePlacementFor(slotId: string): AdPlacement {
  if (slotId.includes("full") || slotId.includes("feature")) return "magazine-full-page";
  if (slotId.includes("half") || slotId.includes("mid") || slotId.includes("sidebar")) {
    return "magazine-half-page";
  }
  if (slotId.includes("cover")) return "magazine-cover-wrap";
  return "magazine-strip";
}

/** All magazine inventory listings — permanent IDs + truthful prices. */
export function listMagazineAdMarketplaceListings(): MagazineAdMarketplaceListing[] {
  const magazineSlots = AD_PLACEMENT_REGISTRY.filter(
    (s) => s.surface === "MAGAZINE_LEADERBOARD" || s.surface === "MAGAZINE_MODULE",
  );

  const listings: MagazineAdMarketplaceListing[] = magazineSlots.map((slot) => {
    const engineId = enginePlacementFor(slot.slotId);
    const priceCents = AD_PRICES[engineId].day;
    const stripeKey = mapStripeKey(slot.slotId);
    const product = stripeKey ? STRIPE_PRODUCTS[stripeKey] : null;
    const resolvedCents = product?.price ?? priceCents;
    const priceId = product?.priceId ?? STRIPE_PRODUCTS.AD_ENTRY_DAY_099.priceId;

    return {
      id: `mag-ad-${slot.slotId}`,
      listingId: `mag-ad-${slot.slotId}`,
      placementId: engineId,
      slotId: slot.slotId,
      zoneKey: slot.zoneKey,
      title: slot.description,
      description: `${slot.width}×${slot.height} · ${slot.monetizationKind} · ${slot.inventoryClass}`,
      width: slot.width,
      height: slot.height,
      sizeLabel: `${slot.width}×${slot.height}`,
      creativeKind: creativeKindFor(slot),
      priceCents: resolvedCents,
      duration: "day",
      displayPrice: centsDisplay(resolvedCents),
      stripeProductKey: stripeKey,
      checkoutHref: `/api/stripe/checkout?priceId=${encodeURIComponent(priceId)}&mode=payment&type=ad_purchase&refId=${encodeURIComponent(slot.slotId)}&productName=${encodeURIComponent(slot.description)}`,
      advertiserFacingLabel: "SELECT PLACEMENT",
    };
  });

  // Always surface the $0.99/day platform entry as first selectable inventory.
  const entry = STRIPE_PRODUCTS.AD_ENTRY_DAY_099;
  listings.unshift({
    id: "mag-ad-platform-entry-day",
    listingId: "mag-ad-platform-entry-day",
    placementId: "free-member-profile",
    slotId: "home-banner",
    zoneKey: "homepageBanner",
    title: "Platform entry — starting as low as $0.99 a day",
    description: "Lowest eligible PLATFORM_AD day entry. Premium Magazine placements keep their own prices.",
    width: 728,
    height: 90,
    sizeLabel: "728×90",
    creativeKind: "either",
    priceCents: entry.price,
    duration: "day",
    displayPrice: centsDisplay(entry.price),
    stripeProductKey: "AD_ENTRY_DAY_099",
    checkoutHref: `/api/stripe/checkout?priceId=${encodeURIComponent(entry.priceId)}&mode=payment&type=ad_purchase&refId=ad_entry_day_099&productName=${encodeURIComponent(entry.name)}`,
    advertiserFacingLabel: "ACTIVATE ENTRY",
  });

  return sortOffersLowestPriceFirst(listings);
}

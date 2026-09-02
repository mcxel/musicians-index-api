/**
 * Commerce catalog identity for digital goods.
 * Prices come from existing server catalogs — never from the client.
 * This module wraps STRIPE_PRODUCTS + venue-skin SKU identity. Do not add a second catalog.
 */

import { STRIPE_PRODUCTS } from "@/lib/stripe/products";

export type CommerceProductType =
  | "VENUE_SKIN"
  | "LOUNGE_SKIN"
  | "AVATAR_ITEM"
  | "VENUE_FX_PACK"
  | "LIGHTING_PACK"
  | "STAGE_PACK"
  | "YOPHO_PACK"
  | "MEDIA_PLAYER_SKIN"
  | "SEASON_PASS"
  | "SUBSCRIPTION_TIER"
  | "LIMITED_DROP";

export type CommercePriceType = "ONE_TIME" | "RECURRING";

export type CommerceProduct = {
  id: string;
  sku: string;
  type: CommerceProductType;
  name: string;
  entitlementType: CommerceProductType;
  entitlementId: string;
  priceType: CommercePriceType;
  /** Server-only. Callers must not accept client unit_amount. */
  priceCents: number | null;
  stripePriceId: string | null;
  active: boolean;
  seasonId?: string;
  editionLimit?: number;
};

export type CommerceOrderState = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELED";

export type CommerceCatalogPrice = {
  sku: string;
  title: string;
  priceCents: number;
  stripePriceId: string | null;
  type: CommerceProductType;
};

export function venueSkinSku(skinId: string): string {
  return `VENUE_SKIN:${skinId}`;
}

export function parseVenueSkinSku(sku: string): string | null {
  if (!sku.startsWith("VENUE_SKIN:")) return null;
  return sku.slice("VENUE_SKIN:".length);
}

export function mediaPlayerChassisSku(chassisId: string): string {
  return `MEDIA_PLAYER_CHASSIS:${chassisId}`;
}

export function parseMediaPlayerChassisSku(sku: string): string | null {
  if (!sku.startsWith("MEDIA_PLAYER_CHASSIS:")) return null;
  return sku.slice("MEDIA_PLAYER_CHASSIS:".length);
}

/** StoreItemEngine catalog SKU — cart + OwnershipRuntime identity. */
export function storeItemSku(itemId: string): string {
  return `STORE_ITEM:${itemId}`;
}

export function parseStoreItemSku(sku: string): string | null {
  if (!sku.startsWith("STORE_ITEM:")) return null;
  return sku.slice("STORE_ITEM:".length);
}

type StripeCatalogEntry = (typeof STRIPE_PRODUCTS)[keyof typeof STRIPE_PRODUCTS];

function asStripeEntry(value: unknown): StripeCatalogEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<StripeCatalogEntry>;
  if (typeof entry.priceId !== "string" || typeof entry.name !== "string" || typeof entry.price !== "number") {
    return null;
  }
  return entry as StripeCatalogEntry;
}

/** Lookup against the existing STRIPE_PRODUCTS table only — no parallel price list. */
export function lookupStripeCatalogPrice(skuId: string): CommerceCatalogPrice | null {
  for (const [key, raw] of Object.entries(STRIPE_PRODUCTS)) {
    const product = asStripeEntry(raw);
    if (!product) continue;
    const productId = "productId" in product && typeof product.productId === "string" ? product.productId : "";
    if (product.priceId === skuId || productId === skuId || key === skuId) {
      const recurring = "interval" in product && product.interval != null;
      return {
        sku: skuId,
        title: product.name,
        priceCents: product.price,
        stripePriceId: product.priceId,
        type: recurring ? "SUBSCRIPTION_TIER" : "LIMITED_DROP",
      };
    }
  }
  return null;
}

/** Map a Stripe catalog row into the canonical CommerceProduct entitlement shape. */
export function stripeEntryToCommerceProduct(
  skuId: string,
  price: CommerceCatalogPrice,
): CommerceProduct {
  return {
    id: skuId,
    sku: price.sku,
    type: price.type,
    name: price.title,
    entitlementType: price.type,
    entitlementId: skuId,
    priceType: price.type === "SUBSCRIPTION_TIER" ? "RECURRING" : "ONE_TIME",
    priceCents: price.priceCents,
    stripePriceId: price.stripePriceId,
    active: true,
  };
}

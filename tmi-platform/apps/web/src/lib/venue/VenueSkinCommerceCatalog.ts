/**
 * VenueSkinCommerceCatalog — browser-safe venue skin pricing + catalog listing.
 * Durable ownership / fulfillment stays in VenueSkinCommerce.ts (server-only).
 */

import { VENUE_SKINS } from "./venueSkinEngine";
import { venueSkinSku, type CommerceProduct } from "@/lib/commerce/CommerceCatalogContract";

export type SkinRarity = "common" | "rare" | "epic";

export const SKIN_RARITY_PRICE_CENTS: Record<SkinRarity, number> = {
  common: 499, // $4.99
  rare: 799, // $7.99
  epic: 1199, // $11.99
};

export const VENUE_SKIN_RARITY: Record<keyof typeof VENUE_SKINS, SkinRarity> = {
  "neon-club": "common",
  "red-theater": "common",
  warehouse: "common",
  "street-corner": "common",
  beach: "rare",
  "luxury-lounge": "rare",
  "tv-studio": "rare",
  "underground-battle": "rare",
  festival: "epic",
  "concert-hall": "epic",
  "under-the-stars": "epic",
};

/**
 * Season-pass entitlement is a listed catalog, not "every skin in the registry".
 * Unlisted epic packs stay purchased-only until a real season catalog row exists.
 */
export const SEASON_PASS_INCLUDED_SKINS: ReadonlySet<string> = new Set([
  "neon-club",
  "street-corner",
]);

export function getSkinPriceCents(skinId: string): number {
  const rarity = VENUE_SKIN_RARITY[skinId as keyof typeof VENUE_SKIN_RARITY];
  return rarity ? SKIN_RARITY_PRICE_CENTS[rarity] : SKIN_RARITY_PRICE_CENTS.common;
}

export function listCatalogProducts(): CommerceProduct[] {
  return Object.keys(VENUE_SKINS).map((skinId) => ({
    id: venueSkinSku(skinId),
    sku: venueSkinSku(skinId),
    type: "VENUE_SKIN" as const,
    name: VENUE_SKINS[skinId].name,
    entitlementType: "VENUE_SKIN" as const,
    entitlementId: skinId,
    priceType: "ONE_TIME" as const,
    priceCents: getSkinPriceCents(skinId),
    stripePriceId: null,
    active: true,
  }));
}

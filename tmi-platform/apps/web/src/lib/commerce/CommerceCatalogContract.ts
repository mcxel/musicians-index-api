/**
 * Commerce catalog identity for digital goods.
 * Prices come from existing server catalogs — never from the client.
 */

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

export function venueSkinSku(skinId: string): string {
  return `VENUE_SKIN:${skinId}`;
}

export function parseVenueSkinSku(sku: string): string | null {
  if (!sku.startsWith("VENUE_SKIN:")) return null;
  return sku.slice("VENUE_SKIN:".length);
}

/**
 * Client-safe artist commerce types + formatters (no Prisma / Node imports).
 */

export const ARTIST_COMMERCE_PRODUCT_TYPES = [
  "MERCH",
  "SHOUTOUT",
  "MEET_AND_GREET",
  "VIP_PASS",
  "LICENSING_PACK",
  "DIGITAL_PRODUCT",
  "OTHER",
] as const;

export type ArtistCommerceProductType = (typeof ARTIST_COMMERCE_PRODUCT_TYPES)[number];

export type ArtistCommerceProduct = {
  id: string;
  artistId: string;
  type: ArtistCommerceProductType;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  active: boolean;
  inventory: number | null;
  imageUrl: string | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export function isArtistCommerceProductType(v: string): v is ArtistCommerceProductType {
  return (ARTIST_COMMERCE_PRODUCT_TYPES as readonly string[]).includes(v);
}

export function formatArtistCommercePrice(product: Pick<ArtistCommerceProduct, "priceCents" | "currency">): string {
  const dollars = product.priceCents / 100;
  const formatted = Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
  return product.currency.toLowerCase() === "usd"
    ? formatted
    : `${formatted} ${product.currency.toUpperCase()}`;
}

export const ARTIST_COMMERCE_TYPE_LABELS: Record<ArtistCommerceProductType, string> = {
  MERCH: "Merch",
  SHOUTOUT: "Shoutout",
  MEET_AND_GREET: "Meet & Greet",
  VIP_PASS: "VIP Pass",
  LICENSING_PACK: "Licensing Pack",
  DIGITAL_PRODUCT: "Digital Product",
  OTHER: "Other",
};

export const ARTIST_COMMERCE_TYPE_ICONS: Record<ArtistCommerceProductType, string> = {
  MERCH: "👕",
  SHOUTOUT: "📣",
  MEET_AND_GREET: "🤝",
  VIP_PASS: "👑",
  LICENSING_PACK: "🎹",
  DIGITAL_PRODUCT: "💾",
  OTHER: "🛍️",
};

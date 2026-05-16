/**
 * MerchantProductEngine
 * Product catalog for merchant accounts.
 * Products can be promoted on artist pages, magazine pages, article pages, contest/game prize pools.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductCategory =
  | "apparel"
  | "food-beverage"
  | "beauty"
  | "electronics"
  | "music-gear"
  | "services"
  | "gift-card"
  | "event-ticket"
  | "digital"
  | "other";

export type ProductStatus = "draft" | "active" | "out-of-stock" | "discontinued";

export type ProductImage = {
  url: string;
  altText?: string;
  isPrimary: boolean;
};

export type MerchantProduct = {
  productId: string;
  merchantId: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  priceCents: number;
  priceDisplay: string;
  salePriceCents?: number;
  salePriceDisplay?: string;
  images: ProductImage[];
  tags: string[];
  status: ProductStatus;
  isPromoted: boolean;
  promotedOnArtistIds: string[];
  promotedOnPlacementTypes: string[];
  stockQuantity?: number;
  externalBuyUrl?: string;
  createdAtMs: number;
  updatedAtMs: number;
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const products: MerchantProduct[] = [];
let productCounter = 0;

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function createMerchantProduct(input: {
  merchantId: string;
  name: string;
  description: string;
  category: ProductCategory;
  priceCents: number;
  salePriceCents?: number;
  images?: ProductImage[];
  tags?: string[];
  stockQuantity?: number;
  externalBuyUrl?: string;
}): MerchantProduct {
  const now = Date.now();
  const product: MerchantProduct = {
    productId: `product-${++productCounter}-${input.merchantId}`,
    merchantId: input.merchantId,
    name: input.name,
    slug: toSlug(input.name),
    description: input.description,
    category: input.category,
    priceCents: input.priceCents,
    priceDisplay: centsToDisplay(input.priceCents),
    salePriceCents: input.salePriceCents,
    salePriceDisplay: input.salePriceCents ? centsToDisplay(input.salePriceCents) : undefined,
    images: input.images ?? [],
    tags: input.tags ?? [],
    status: "active",
    isPromoted: false,
    promotedOnArtistIds: [],
    promotedOnPlacementTypes: [],
    stockQuantity: input.stockQuantity,
    externalBuyUrl: input.externalBuyUrl,
    createdAtMs: now,
    updatedAtMs: now,
  };
  products.unshift(product);
  return product;
}

export function getProductById(productId: string): MerchantProduct | null {
  return products.find((p) => p.productId === productId) ?? null;
}

export function listMerchantProducts(merchantId: string, onlyActive = false): MerchantProduct[] {
  return products.filter(
    (p) => p.merchantId === merchantId && (!onlyActive || p.status === "active")
  );
}

export function listPromotedProducts(artistId: string): MerchantProduct[] {
  return products.filter(
    (p) => p.isPromoted && p.status === "active" && p.promotedOnArtistIds.includes(artistId)
  );
}

export function promoteProductOnArtist(productId: string, artistId: string, placementType: string): MerchantProduct {
  const product = products.find((p) => p.productId === productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  if (!product.promotedOnArtistIds.includes(artistId)) product.promotedOnArtistIds.push(artistId);
  if (!product.promotedOnPlacementTypes.includes(placementType)) product.promotedOnPlacementTypes.push(placementType);
  product.isPromoted = true;
  product.updatedAtMs = Date.now();
  return product;
}

export function removeProductPromotion(productId: string, artistId: string): MerchantProduct {
  const product = products.find((p) => p.productId === productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  product.promotedOnArtistIds = product.promotedOnArtistIds.filter((id) => id !== artistId);
  if (product.promotedOnArtistIds.length === 0) product.isPromoted = false;
  product.updatedAtMs = Date.now();
  return product;
}

export function updateProductStatus(productId: string, status: ProductStatus): MerchantProduct {
  const product = products.find((p) => p.productId === productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  product.status = status;
  product.updatedAtMs = Date.now();
  return product;
}

export function addProductImage(productId: string, image: ProductImage): MerchantProduct {
  const product = products.find((p) => p.productId === productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  if (image.isPrimary) product.images.forEach((img) => (img.isPrimary = false));
  product.images.push(image);
  product.updatedAtMs = Date.now();
  return product;
}

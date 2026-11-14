/**
 * CreatorProductRegistry — thin canonical product types for Creator Economy Phase 1.
 *
 * Products come from connected storefront URL (manual entry) or stay empty with
 * an honest empty state. No fake sales numbers, inventory counts, or revenue
 * (Rule 20). Artist sets price on their store; TMI records optional display
 * priceCents for deep-link cards only.
 *
 * Ticket SKUs are intentionally absent — Rule 17: ticket inventory is
 * Venue/Promoter only.
 */

import type { CommerceConnectorId } from "@/lib/commerce/CommerceConnectorRegistry";

export type CreatorProductType =
  | "SINGLE"
  | "ALBUM"
  | "VINYL"
  | "MERCH"
  | "BEAT_LICENSE"
  | "EXPERIENCE"
  | "YOPHO"
  | "BUNDLE";

export type CreatorProductVisibility = "PUBLIC" | "UNLISTED" | "DRAFT";

export type ProductId = string;

export interface CreatorProduct {
  id: ProductId;
  ownerPerformerId: string;
  externalId?: string;
  title: string;
  type: CreatorProductType;
  /** Optional display price — artist sets real price on their store. */
  priceCents?: number;
  currency: string;
  connectorId: CommerceConnectorId;
  visibility: CreatorProductVisibility;
  /** Deep-link to buy / product page on artist store */
  buyUrl?: string;
  imageUrl?: string;
  /**
   * Source dates only. Never filled from the import clock.
   * Music prefers releaseDate / publishedAt. Merch prefers availabilityDate
   * or publicationDate. Tickets prefer saleDate. Absent means undated.
   */
  releaseDate?: string;
  publishedAt?: string;
  availabilityDate?: string;
  publicationDate?: string;
  saleDate?: string;
  /** When TMI first stored the row. Fallback sort only — not a release date. */
  tmiAddedAt?: string;
  updatedAt: string;
}

export type ProductSyncStatus = "empty" | "manual" | "linked_pending_sync";

const STORAGE_PREFIX = "tmi_creator_products_";

function storageKey(performerId: string): string {
  return `${STORAGE_PREFIX}${performerId}`;
}

/** Empty seed — never invent catalog rows. */
const SEED_PRODUCTS: CreatorProduct[] = [];

function readLocal(performerId: string): CreatorProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(performerId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreatorProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(performerId: string, products: CreatorProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(performerId), JSON.stringify(products));
  } catch {
    /* ignore */
  }
}

/** Published products across stored performer shops. Empty when none exist. */
export function listPublishedMarketplaceProducts(): CreatorProduct[] {
  if (typeof window === "undefined") return [];
  const out: CreatorProduct[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    const ownerPerformerId = key.slice(STORAGE_PREFIX.length);
    out.push(...listCreatorProducts(ownerPerformerId).filter((p) => p.visibility === "PUBLIC"));
  }
  return out;
}

export function listCreatorProducts(ownerPerformerId: string): CreatorProduct[] {
  if (!ownerPerformerId) return [];
  const seeded = SEED_PRODUCTS.filter((p) => p.ownerPerformerId === ownerPerformerId);
  const local = readLocal(ownerPerformerId);
  const byId = new Map<string, CreatorProduct>();
  for (const p of [...seeded, ...local]) byId.set(p.id, p);
  return Array.from(byId.values()).filter((p) => p.visibility !== "DRAFT");
}

export function listAllCreatorProductsForOwner(ownerPerformerId: string): CreatorProduct[] {
  if (!ownerPerformerId) return [];
  const seeded = SEED_PRODUCTS.filter((p) => p.ownerPerformerId === ownerPerformerId);
  const local = readLocal(ownerPerformerId);
  const byId = new Map<string, CreatorProduct>();
  for (const p of [...seeded, ...local]) byId.set(p.id, p);
  return Array.from(byId.values());
}

export function getCreatorProductSyncStatus(
  ownerPerformerId: string,
  hasStorefrontLink: boolean,
): ProductSyncStatus {
  const products = listAllCreatorProductsForOwner(ownerPerformerId);
  if (products.length > 0) return "manual";
  if (hasStorefrontLink) return "linked_pending_sync";
  return "empty";
}

function optionalIso(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || Number.isNaN(Date.parse(trimmed))) return undefined;
  return trimmed;
}

function keepDate(next: unknown, prev: unknown): string | undefined {
  return optionalIso(next) ?? optionalIso(prev);
}

export function upsertCreatorProduct(
  product: Omit<CreatorProduct, "updatedAt" | "id"> & { id?: string },
): CreatorProduct {
  const ownerPerformerId = product.ownerPerformerId;
  const existing = readLocal(ownerPerformerId);
  const id =
    product.id ??
    `prod_${ownerPerformerId}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const prior = existing.find((p) => p.id === id);
  const record: CreatorProduct = {
    id,
    ownerPerformerId,
    externalId: product.externalId,
    title: product.title.trim(),
    type: product.type,
    priceCents: product.priceCents,
    currency: product.currency || "USD",
    connectorId: product.connectorId,
    visibility: product.visibility,
    buyUrl: product.buyUrl?.trim() || undefined,
    imageUrl: product.imageUrl?.trim() || undefined,
    releaseDate: keepDate(product.releaseDate, prior?.releaseDate),
    publishedAt: keepDate(product.publishedAt, prior?.publishedAt),
    availabilityDate: keepDate(product.availabilityDate, prior?.availabilityDate),
    publicationDate: keepDate(product.publicationDate, prior?.publicationDate),
    saleDate: keepDate(product.saleDate, prior?.saleDate),
    tmiAddedAt: keepDate(product.tmiAddedAt, prior?.tmiAddedAt),
    updatedAt: new Date().toISOString(),
  };
  const next = [...existing.filter((p) => p.id !== id), record];
  writeLocal(ownerPerformerId, next);
  return record;
}

/**
 * Shelf product order. Source publication dates outrank TMI write time.
 * Undated rows stay after dated rows. Product id breaks ties.
 * Shelf order is not decided here.
 */
export type ProductOrderDateField =
  | "releaseDate"
  | "publishedAt"
  | "availabilityDate"
  | "publicationDate"
  | "saleDate"
  | "tmiAddedAt"
  | "updatedAt"
  | null;

const SOURCE_DATE_FIELDS = [
  "releaseDate",
  "publishedAt",
  "availabilityDate",
  "publicationDate",
  "saleDate",
] as const;

function sourceFieldsFor(type: CreatorProductType): readonly (typeof SOURCE_DATE_FIELDS)[number][] {
  if (type === "MERCH" || type === "YOPHO") {
    return ["availabilityDate", "publicationDate", "releaseDate", "publishedAt", "saleDate"];
  }
  if (type === "EXPERIENCE") {
    return ["saleDate", "publicationDate", "availabilityDate", "releaseDate", "publishedAt"];
  }
  return ["releaseDate", "publishedAt", "publicationDate", "availabilityDate", "saleDate"];
}

export function resolveCreatorProductOrderDate(product: CreatorProduct): {
  tier: 0 | 1 | 2;
  time: number;
  field: ProductOrderDateField;
} {
  for (const field of sourceFieldsFor(product.type)) {
    const time = Date.parse(product[field] ?? "");
    if (Number.isFinite(time)) return { tier: 0, time, field };
  }
  const added = Date.parse(product.tmiAddedAt ?? "");
  if (Number.isFinite(added)) return { tier: 1, time: added, field: "tmiAddedAt" };
  const written = Date.parse(product.updatedAt ?? "");
  if (Number.isFinite(written)) return { tier: 1, time: written, field: "updatedAt" };
  return { tier: 2, time: 0, field: null };
}

export function sortCreatorProductsNewestFirst(products: readonly CreatorProduct[]): CreatorProduct[] {
  return [...products].sort((a, b) => {
    const da = resolveCreatorProductOrderDate(a);
    const db = resolveCreatorProductOrderDate(b);
    if (da.tier !== db.tier) return da.tier - db.tier;
    if (da.tier < 2 && da.time !== db.time) return db.time - da.time;
    return a.id.localeCompare(b.id);
  });
}

export function removeCreatorProduct(ownerPerformerId: string, productId: string): void {
  const next = readLocal(ownerPerformerId).filter((p) => p.id !== productId);
  writeLocal(ownerPerformerId, next);
}

export function formatCreatorProductPrice(product: CreatorProduct): string | null {
  if (product.priceCents == null || product.priceCents < 0) return null;
  const dollars = (product.priceCents / 100).toFixed(2);
  return product.currency === "USD" ? `$${dollars}` : `${dollars} ${product.currency}`;
}

export const CREATOR_PRODUCT_TYPE_LABELS: Record<CreatorProductType, string> = {
  SINGLE: "Single",
  ALBUM: "Album",
  VINYL: "Vinyl",
  MERCH: "Merch",
  BEAT_LICENSE: "Beat License",
  EXPERIENCE: "Experience",
  YOPHO: "YoPho",
  BUNDLE: "Bundle",
};

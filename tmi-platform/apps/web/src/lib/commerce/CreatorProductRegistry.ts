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

export function upsertCreatorProduct(
  product: Omit<CreatorProduct, "updatedAt" | "id"> & { id?: string },
): CreatorProduct {
  const ownerPerformerId = product.ownerPerformerId;
  const existing = readLocal(ownerPerformerId);
  const id =
    product.id ??
    `prod_${ownerPerformerId}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
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
    updatedAt: new Date().toISOString(),
  };
  const next = [...existing.filter((p) => p.id !== id), record];
  writeLocal(ownerPerformerId, next);
  return record;
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

/**
 * commerceEngine — catalog adapter backing /api/store/checkout + /api/store/items.
 *
 * Lane D (2026-09-01): this used to be a hardcoded 7-item fake demo catalog
 * ("beat-1"/"Midnight Crown"/creator-a/venue "test-venue", etc.) that never
 * matched any real StoreItemEngine item id — every real store purchase 404'd
 * here (item_not_found) and silently fell back to a cruder priceId-only
 * checkout path that skipped points-discount and revenue-split settlement.
 * This is now a thin adapter over the real catalog (StoreItemEngine.ts) —
 * the single source of truth for store items (Rule 8).
 */
import { getAllStoreItems, type StoreCategory } from "@/lib/store/StoreItemEngine";

export type CommerceCategory = StoreCategory;

export type CommerceItem = {
  id: string;
  name: string;
  category: CommerceCategory;
  price: number; // dollars (not cents) — matches this module's historical contract
  stock: number;
  creatorId: string;
  venueId: string;
  sponsorId: string;
};

// In-memory stock counter for the (unlimited-inventory) digital/service goods
// StoreItemEngine sells. Not persisted — a decrement here is informational
// only, never the basis for an ownership/entitlement claim (see webhook.ts's
// honest PAID_PENDING_FULFILLMENT handling of metadata.type === 'store').
const UNLIMITED_STOCK = 999_999;
const stockOverrides = new Map<string, number>();

function buildCatalog(): CommerceItem[] {
  return getAllStoreItems().map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price / 100,
    stock: stockOverrides.get(item.id) ?? UNLIMITED_STOCK,
    creatorId: "",
    venueId: "",
    sponsorId: "",
  }));
}

export function listCommerceItems(category?: CommerceCategory): CommerceItem[] {
  const catalog = buildCatalog();
  if (!category) return catalog;
  return catalog.filter((item) => item.category === category);
}

export function syncInventory(itemId: string, qty: number): CommerceItem | null {
  const catalog = buildCatalog();
  const item = catalog.find((entry) => entry.id === itemId);
  if (!item) return null;
  const next = Math.max(0, item.stock - qty);
  stockOverrides.set(itemId, next);
  return { ...item, stock: next };
}

/**
 * CosmeticMerchandisingDirector — bounded automated merchandising façade.
 *
 * Does NOT invent ownership, sales, scarcity, or Stripe policy.
 * Composes FanCosmeticCatalog + VenueSkinCommerce + FanLobbySkinRegistry + OwnershipRuntime.
 */

import {
  getUnifiedFanCosmeticCatalog,
  listFanCosmeticsByStoreFilter,
  type FanStoreFilterId,
} from "@/lib/avatars/FanCosmeticCatalog";
import { listCatalogProducts } from "@/lib/venue/VenueSkinCommerceCatalog";
import { listStoreReadyFanLobbySkins } from "@/lib/lobby/FanLobbySkinRegistry";
import { OwnershipRuntime } from "@/lib/commerce/OwnershipRuntime";
import { listActiveShelfProducts } from "@/lib/commerce/MarketplaceMerchandisingAuthority";

export type MerchFamily = "FAN_AVATAR" | "VENUE_SKIN" | "LOBBY_SKIN";

export type ShowcaseSlot = {
  family: MerchFamily;
  productId: string;
  title: string;
  priceCents: number | null;
  featuredReason: "NEW" | "FEATURED" | "FOR_YOUR_AVATAR" | "FOR_YOUR_VENUE" | "COMPATIBLE" | "REAL_SALES";
  previewMode: "TRY_ON" | "ENVIRONMENT" | "STATIC";
};

export type RealSalesSignal = {
  productId: string;
  views: number;
  previewStarts: number;
  completedPurchases: number;
  equipRate: number;
};

/** Preview never grants ownership. */
export type TryOnSession = {
  productId: string;
  family: MerchFamily;
  startedAt: number;
  equippedSnapshotId: string | null;
};

const tryOnByUser = new Map<string, TryOnSession>();

export function startTryOn(userId: string, family: MerchFamily, productId: string): TryOnSession {
  const session: TryOnSession = {
    productId,
    family,
    startedAt: Date.now(),
    equippedSnapshotId: null,
  };
  tryOnByUser.set(userId, session);
  return session;
}

export function clearTryOn(userId: string): void {
  tryOnByUser.delete(userId);
}

export function getActiveTryOn(userId: string): TryOnSession | null {
  return tryOnByUser.get(userId) ?? null;
}

export function buildFanShowcase(filter: FanStoreFilterId = "FEATURED"): ShowcaseSlot[] {
  // Prefer curated active shelf Fan cosmetics when FEATURED (§9157 aggregator).
  if (filter === "FEATURED") {
    const shelf = listActiveShelfProducts().filter((p) => p.family === "FAN_COSMETIC");
    if (shelf.length) {
      return shelf.slice(0, 12).map((item) => ({
        family: "FAN_AVATAR" as const,
        productId: item.canonicalId,
        title: item.title,
        priceCents: item.usdCents,
        featuredReason: "FEATURED" as const,
        previewMode: "TRY_ON" as const,
      }));
    }
  }
  const items = listFanCosmeticsByStoreFilter(filter);
  const fallback = items.length ? items : getUnifiedFanCosmeticCatalog().slice(0, 12);
  return fallback.slice(0, 12).map((item) => ({
    family: "FAN_AVATAR" as const,
    productId: item.id,
    title: item.label,
    priceCents: item.usdCents ?? (item.rarity === "free" ? 0 : null),
    featuredReason: filter === "NEW" ? "NEW" : "FEATURED",
    previewMode: "TRY_ON",
  }));
}

export function buildVenueShowcase(): ShowcaseSlot[] {
  return listCatalogProducts().slice(0, 12).map((p) => ({
    family: "VENUE_SKIN" as const,
    productId: p.entitlementId,
    title: p.name,
    priceCents: p.priceCents,
    featuredReason: "FOR_YOUR_VENUE",
    previewMode: "ENVIRONMENT",
  }));
}

export function buildLobbyShowcase(): ShowcaseSlot[] {
  return listStoreReadyFanLobbySkins().slice(0, 12).map((s) => ({
    family: "LOBBY_SKIN" as const,
    productId: s.id,
    title: s.label,
    priceCents: s.priceCents ?? null,
    featuredReason: "FEATURED",
    previewMode: "ENVIRONMENT",
  }));
}

/**
 * Rank by REAL sales signals only. Missing metrics → stable catalog order, never fake popularity.
 */
export function rankByRealSales(
  slots: ShowcaseSlot[],
  signals: RealSalesSignal[],
): ShowcaseSlot[] {
  const map = new Map(signals.map((s) => [s.productId, s]));
  return [...slots].sort((a, b) => {
    const sa = map.get(a.productId);
    const sb = map.get(b.productId);
    const score = (s?: RealSalesSignal) =>
      s ? s.completedPurchases * 10 + s.equipRate * 5 + s.previewStarts : 0;
    return score(sb) - score(sa);
  });
}

export function userOwnsSku(userId: string, sku: string): boolean {
  return OwnershipRuntime.hasEntitlement(userId, sku);
}

export const CosmeticMerchandisingDirector = {
  startTryOn,
  clearTryOn,
  getActiveTryOn,
  buildFanShowcase,
  buildVenueShowcase,
  buildLobbyShowcase,
  rankByRealSales,
  userOwnsSku,
};

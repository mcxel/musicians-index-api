/**
 * FanStoreEngine.ts
 *
 * Manages fan reward store inventory and sales.
 * Purpose: Catalog of purchasable items for fan engagement.
 */

import { getUnifiedFanCosmeticCatalog } from "@/lib/avatars/FanCosmeticCatalog";

export interface FanStoreItem {
  itemId: string;
  itemType: 'avatar-item' | 'emote' | 'profile-frame' | 'season-pass' | 'collectible' | 'title';
  name: string;
  description: string;
  pointsCost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  inventoryCount?: number; // null = unlimited
  soldCount: number;
  createdAt: number;
  retiredAt?: number;
  featured: boolean;
}

// In-memory registry
const fanStoreInventory = new Map<string, FanStoreItem>();
let itemCounter = 0;

/**
 * Adds item to store.
 */
export function addToFanStore(input: {
  itemType: FanStoreItem['itemType'];
  name: string;
  description: string;
  pointsCost: number;
  rarity: FanStoreItem['rarity'];
  inventoryCount?: number;
  featured?: boolean;
}): string {
  const itemId = `fstore-${itemCounter++}`;

  const item: FanStoreItem = {
    itemId,
    itemType: input.itemType,
    name: input.name,
    description: input.description,
    pointsCost: input.pointsCost,
    rarity: input.rarity,
    inventoryCount: input.inventoryCount,
    soldCount: 0,
    createdAt: Date.now(),
    featured: input.featured ?? false,
  };

  fanStoreInventory.set(itemId, item);
  return itemId;
}

/**
 * Records item sale.
 */
export function recordFanStoreSale(itemId: string): boolean {
  const item = fanStoreInventory.get(itemId);
  if (!item || item.retiredAt) return false;

  if (item.inventoryCount !== undefined && item.inventoryCount <= 0) {
    return false; // Out of stock
  }

  item.soldCount += 1;
  if (item.inventoryCount !== undefined) {
    item.inventoryCount -= 1;
  }

  return true;
}

/**
 * Gets store item.
 */
export function getFanStoreItem(itemId: string): FanStoreItem | null {
  return fanStoreInventory.get(itemId) ?? null;
}

/**
 * Lists all available items.
 */
export function listFanStoreItems(): FanStoreItem[] {
  return Array.from(fanStoreInventory.values()).filter((item) => !item.retiredAt);
}

/**
 * Lists featured items.
 */
export function listFeaturedItems(): FanStoreItem[] {
  return Array.from(fanStoreInventory.values()).filter((item) => item.featured && !item.retiredAt);
}

/**
 * Lists items by type.
 */
export function listFanStoreItemsByType(itemType: FanStoreItem['itemType']): FanStoreItem[] {
  return Array.from(fanStoreInventory.values()).filter(
    (item) => item.itemType === itemType && !item.retiredAt
  );
}

/**
 * Gets top selling items.
 */
export function getTopSellingItems(limit: number = 10): FanStoreItem[] {
  return Array.from(fanStoreInventory.values())
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
}

/**
 * Retires item.
 */
export function retireFanStoreItem(itemId: string): void {
  const item = fanStoreInventory.get(itemId);
  if (item) {
    item.retiredAt = Date.now();
  }
}

/**
 * Features item.
 */
export function featureFanStoreItem(itemId: string): void {
  const item = fanStoreInventory.get(itemId);
  if (item) {
    item.featured = true;
  }
}

/**
 * Unfeatures item.
 */
export function unfeatureFanStoreItem(itemId: string): void {
  const item = fanStoreInventory.get(itemId);
  if (item) {
    item.featured = false;
  }
}

/**
 * Gets store report (admin).
 */
export function getFanStoreReport(): {
  totalItems: number;
  activeItems: number;
  retiredItems: number;
  totalSoldCount: number;
  totalPointsGenerated: number;
  mostPopularItem?: FanStoreItem;
} {
  const items = Array.from(fanStoreInventory.values());
  const active = items.filter((i) => !i.retiredAt);
  const retired = items.filter((i) => i.retiredAt);

  const totalSold = items.reduce((sum, i) => sum + i.soldCount, 0);
  const totalPointsGen = items.reduce((sum, i) => sum + i.pointsCost * i.soldCount, 0);

  const mostPopular =
    active.length > 0 ? active.reduce((a, b) => (b.soldCount > a.soldCount ? b : a)) : undefined;

  return {
    totalItems: items.length,
    activeItems: active.length,
    retiredItems: retired.length,
    totalSoldCount: totalSold,
    totalPointsGenerated: totalPointsGen,
    mostPopularItem: mostPopular,
  };
}

/** Seed Fan cosmetic economy from FanCosmeticCatalog (idempotent by name). */
let cosmeticCatalogSeeded = false;
export function seedFanCosmeticCatalogStoreItems(): void {
  if (cosmeticCatalogSeeded) return;
  const existingNames = new Set([...fanStoreInventory.values()].map((i) => i.name));
  for (const c of getUnifiedFanCosmeticCatalog()) {
    if (existingNames.has(c.label)) continue;
    const itemType: FanStoreItem["itemType"] =
      c.equipSlot === "emote" || c.slot === "emote" ? "emote" : "avatar-item";
    const rarity: FanStoreItem["rarity"] =
      c.rarity === "free"
        ? "common"
        : c.rarity === "legendary"
          ? "legendary"
          : c.rarity === "epic"
            ? "epic"
            : c.rarity === "rare"
              ? "rare"
              : "common";
    addToFanStore({
      itemType,
      name: c.label,
      description: `${c.description}${c.stripeProductId ? "" : " · Points path (Stripe product not wired — Rule 20)"}`,
      pointsCost: c.pointsCost,
      rarity,
      featured:
        c.inventoryCategory === "instruments" ||
        c.inventoryCategory === "vfx" ||
        c.inventoryCategory === "action-emotes" ||
        c.inventoryCategory === "dances" ||
        c.inventoryCategory === "auras" ||
        c.inventoryCategory === "hair" ||
        Boolean(c.featured) ||
        Boolean(c.colorwayOf),
    });
    existingNames.add(c.label);
  }
  cosmeticCatalogSeeded = true;
}

/** Seed bobblehead accessory fit SKUs once (idempotent by name). */
let bobbleheadSeeded = false;
export function seedBobbleheadAccessoryStoreItems(): void {
  if (bobbleheadSeeded) return;
  const seeds: Array<{
    itemType: FanStoreItem["itemType"];
    name: string;
    description: string;
    pointsCost: number;
    rarity: FanStoreItem["rarity"];
    featured?: boolean;
  }> = [
    {
      itemType: "avatar-item",
      name: "Backwards Cap (Bobblehead)",
      description: "Free headwear fit for urban/skater bases — concept plate until 3D GLB.",
      pointsCost: 0,
      rarity: "common",
      featured: true,
    },
    {
      itemType: "avatar-item",
      name: "Street Beanie (Bobblehead)",
      description: "Youth/skater beanie slot — Fan-only.",
      pointsCost: 0,
      rarity: "common",
    },
    {
      itemType: "avatar-item",
      name: "Neck Headphones (Bobblehead)",
      description: "Music-fan neck accessory template. Points path via FanCosmeticCatalog.",
      pointsCost: 150,
      rarity: "rare",
      featured: true,
    },
    {
      itemType: "avatar-item",
      name: "Studio Shades (Bobblehead)",
      description: "Eyewear fit linked to sunglasses SKU.",
      pointsCost: 200,
      rarity: "rare",
    },
    {
      itemType: "emote",
      name: "Dance Burst Emote",
      description: "Starter emote for Fan bobblehead bases.",
      pointsCost: 0,
      rarity: "common",
    },
  ];
  const existingNames = new Set([...fanStoreInventory.values()].map((i) => i.name));
  for (const s of seeds) {
    if (existingNames.has(s.name)) continue;
    addToFanStore(s);
  }
  bobbleheadSeeded = true;
  seedFanCosmeticCatalogStoreItems();
}

// Auto-seed on module load so Fan store surfaces real accessory + catalog rows.
seedBobbleheadAccessoryStoreItems();

/**
 * FanStoreEngine.ts
 *
 * Manages fan reward store inventory and sales.
 * Purpose: Catalog of purchasable items for fan engagement.
 */

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

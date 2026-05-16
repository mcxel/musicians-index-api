/**
 * FanRewardStoreEngine.ts
 *
 * Manages fan reward store: avatar items, emotes, props, season pass items, collectibles.
 * XP can be spent here to unlock cosmetics and benefits.
 * Purpose: Create in-platform economy for fan expression and engagement.
 */

export interface RewardItem {
  itemId: string;
  itemType:
    | 'avatar-item'
    | 'emote'
    | 'prop'
    | 'season-pass'
    | 'collectible'
    | 'title'
    | 'effect'
    | 'frame';
  name: string;
  description: string;
  xpCost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  releasedAt: number;
  retiredAt?: number;
  purchasedCount: number;
}

export interface FanRewardPurchase {
  purchaseId: string;
  fanId: string;
  itemId: string;
  purchasedAt: number;
  xpSpent: number;
}

export interface FanRewardStore {
  fanId: string;
  totalXPSpent: number;
  itemsOwned: string[]; // itemIds
  purchaseHistory: FanRewardPurchase[];
}

// In-memory registry
const rewardItems = new Map<string, RewardItem>();
const fanRewardStores = new Map<string, FanRewardStore>();
const rewardPurchases = new Map<string, FanRewardPurchase>();
let itemCounter = 0;
let purchaseCounter = 0;

/**
 * Creates reward item for store.
 */
export function createRewardItem(input: {
  itemType: RewardItem['itemType'];
  name: string;
  description: string;
  xpCost: number;
  rarity: RewardItem['rarity'];
}): string {
  const itemId = `reward-${itemCounter++}`;

  const item: RewardItem = {
    itemId,
    itemType: input.itemType,
    name: input.name,
    description: input.description,
    xpCost: input.xpCost,
    rarity: input.rarity,
    releasedAt: Date.now(),
    purchasedCount: 0,
  };

  rewardItems.set(itemId, item);
  return itemId;
}

/**
 * Retires item from store.
 */
export function retireRewardItem(itemId: string): void {
  const item = rewardItems.get(itemId);
  if (item) {
    item.retiredAt = Date.now();
  }
}

/**
 * Records fan purchase of reward item.
 */
export function purchaseRewardItem(fanId: string, itemId: string): FanRewardPurchase | null {
  const item = rewardItems.get(itemId);
  if (!item || item.retiredAt) return null;

  const purchaseId = `purchase-${purchaseCounter++}`;

  const purchase: FanRewardPurchase = {
    purchaseId,
    fanId,
    itemId,
    purchasedAt: Date.now(),
    xpSpent: item.xpCost,
  };

  rewardPurchases.set(purchaseId, purchase);

  // Update item counter
  item.purchasedCount += 1;

  // Update fan store
  let store = fanRewardStores.get(fanId);
  if (!store) {
    store = {
      fanId,
      totalXPSpent: 0,
      itemsOwned: [],
      purchaseHistory: [],
    };
    fanRewardStores.set(fanId, store);
  }

  store.totalXPSpent += item.xpCost;
  if (!store.itemsOwned.includes(itemId)) {
    store.itemsOwned.push(itemId);
  }
  store.purchaseHistory.push(purchase);

  return purchase;
}

/**
 * Gets reward item (non-mutating).
 */
export function getRewardItem(itemId: string): RewardItem | null {
  return rewardItems.get(itemId) ?? null;
}

/**
 * Lists available reward items (not retired).
 */
export function listAvailableRewardItems(): RewardItem[] {
  return Array.from(rewardItems.values()).filter((item) => !item.retiredAt);
}

/**
 * Gets top purchased items.
 */
export function getTopPurchasedItems(limit: number = 10): RewardItem[] {
  return Array.from(rewardItems.values())
    .sort((a, b) => b.purchasedCount - a.purchasedCount)
    .slice(0, limit);
}

/**
 * Gets fan reward store.
 */
export function getFanRewardStore(fanId: string): FanRewardStore | null {
  return fanRewardStores.get(fanId) ?? null;
}

/**
 * Gets fan reward store report (admin).
 */
export function getRewardStoreReport(): {
  totalItemsAvailable: number;
  totalRetired: number;
  totalXPSpentAcrossAllFans: number;
  totalFansBuyingRewards: number;
  mostPopularItem?: RewardItem;
} {
  const items = Array.from(rewardItems.values());
  const stores = Array.from(fanRewardStores.values());

  const available = items.filter((i) => !i.retiredAt);
  const retired = items.filter((i) => i.retiredAt);

  const totalXP = stores.reduce((sum, s) => sum + s.totalXPSpent, 0);

  const mostPopular =
    available.length > 0
      ? available.reduce((a, b) => (b.purchasedCount > a.purchasedCount ? b : a))
      : undefined;

  return {
    totalItemsAvailable: available.length,
    totalRetired: retired.length,
    totalXPSpentAcrossAllFans: totalXP,
    totalFansBuyingRewards: stores.length,
    mostPopularItem: mostPopular,
  };
}

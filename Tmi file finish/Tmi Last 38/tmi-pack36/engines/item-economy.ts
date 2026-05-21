// apps/api/src/modules/economy/item-economy.engine.ts
// Living item economy: constant creation, rotation, purchase, equip.

export type ItemCategory =
  | 'avatar_wearable' | 'avatar_effect' | 'avatar_animation' | 'avatar_emote'
  | 'profile_cosmetic' | 'room_effect' | 'chat_flair' | 'badge'
  | 'collectible' | 'game_item' | 'event_item' | 'sponsor_item' | 'seasonal';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'exclusive';

export const RARITY_CONFIG = {
  common:    { color: '#C8A8E8', dropWeight: 40, glowColor: '#C8A8E855', priceRange: [50, 200] },
  uncommon:  { color: '#00C896', dropWeight: 25, glowColor: '#00C89655', priceRange: [200, 500] },
  rare:      { color: '#00E5FF', dropWeight: 15, glowColor: '#00E5FF55', priceRange: [500, 1500] },
  epic:      { color: '#7B2FBE', dropWeight: 10, glowColor: '#7B2FBE55', priceRange: [1500, 5000] },
  legendary: { color: '#FFB800', dropWeight: 5,  glowColor: '#FFB80055', priceRange: [5000, 20000] },
  exclusive: { color: '#FF2D78', dropWeight: 0,  glowColor: '#FF2D7855', priceRange: [0, 0] }, // not for sale, earned only
} as const;

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  pointCost: number;       // cost in platform points (0 = not buyable with points)
  currencyCost?: number;   // cost in real currency (future)
  isLimited: boolean;      // limited quantity
  totalQuantity?: number;  // if limited
  remainingQuantity?: number;
  availableFrom?: Date;
  availableUntil?: Date;   // for seasonal/event items
  isEquippable: boolean;
  isTradeable: boolean;    // future feature
  sourceType: 'shop' | 'event_reward' | 'season_reward' | 'sponsor_drop' | 'game_win' | 'contest_win' | 'achievement' | 'daily_drop' | 'loot';
  linkedEventId?: string;  // tied to specific event
  linkedSponsorId?: string;
  linkedSeasonId?: string;
  previewUrl?: string;     // thumbnail or preview animation
  tags: string[];
}

// ── SHOP ROTATION SYSTEM ──────────────────────────────────
// Bots keep this constantly refreshing so users always have something new to buy
export interface ShopRotation {
  id: string;
  name: 'daily_featured' | 'weekly_spotlight' | 'seasonal_collection' | 'sponsor_drop' | 'event_exclusive';
  startsAt: Date;
  endsAt: Date;
  items: ShopSlot[];
  featuredBannerId?: string;
  discountPct?: number;
}

export interface ShopSlot {
  slotPosition: number;    // 1-6 for featured section, 1-12 for full catalog
  itemId: string;
  displayPrice: number;    // may differ from base if discounted
  isHighlighted: boolean;
  isSoldOut: boolean;
  purchaseCount: number;
}

// ── AUTOMATIC ITEM GENERATION TRIGGERS ────────────────────
// These events automatically create new items so the economy never goes stale
export const ITEM_GENERATION_TRIGGERS = [
  { trigger: 'new_sponsor_campaign',   generates: 'sponsor_item',  rarity: 'rare',   quantity: 500 },
  { trigger: 'issue_release',          generates: 'collectible',   rarity: 'epic',   quantity: 100 },
  { trigger: 'event_scheduled',        generates: 'event_item',    rarity: 'uncommon', quantity: 1000 },
  { trigger: 'battle_winner',          generates: 'avatar_effect', rarity: 'legendary', quantity: 1 },
  { trigger: 'season_start',           generates: 'seasonal',      rarity: 'rare',   quantity: 5000 },
  { trigger: 'crown_awarded',          generates: 'badge',         rarity: 'exclusive', quantity: 1 },
  { trigger: 'leaderboard_top_10',     generates: 'profile_cosmetic', rarity: 'epic', quantity: 10 },
  { trigger: 'daily_rotation',         generates: 'common_bundle', rarity: 'common', quantity: 99999 },
] as const;

// ── LOOT TABLE ────────────────────────────────────────────
export interface LootTable {
  id: string;
  name: string;
  drops: LootDrop[];
  guaranteedRarity?: ItemRarity; // always at least this rarity
  bonusOnHype: boolean; // drops better items when platform hype is high
}

export interface LootDrop {
  itemId?: string;        // specific item, or...
  categoryFilter?: ItemCategory; // any item in this category
  rarityFilter?: ItemRarity;    // any item of this rarity
  pointsInstead?: number;       // if item not available, award points
  weight: number;               // relative drop weight
}

// ── INVENTORY + EQUIP ─────────────────────────────────────
export interface UserInventory {
  userId: string;
  items: OwnedItem[];
  activeLoadout: AvatarLoadout;
  savedLoadouts: AvatarLoadout[];
  pointsBalance: number;
  premiumCurrencyBalance: number;
  totalSpentPoints: number;
  totalItemsOwned: number;
}

export interface OwnedItem {
  itemId: string;
  quantity: number;
  acquiredAt: Date;
  acquiredFrom: string;  // source description
  isEquipped: boolean;
  isNew: boolean;        // show "NEW" badge until viewed
  isFavorite: boolean;
}

export interface AvatarLoadout {
  id: string;
  name: string;
  slots: {
    hat?: string;
    glasses?: string;
    chain?: string;
    jacket?: string;
    shirt?: string;
    pants?: string;
    shoes?: string;
    accessory?: string;
    effect?: string;
    emote?: string;
    idleAnimation?: string;
  };
  savedAt: Date;
  isDefault: boolean;
}

// ── ECONOMY BALANCING ─────────────────────────────────────
export const ECONOMY_BALANCE_RULES = {
  // Earning caps (prevents inflation)
  maxDailyPoints: 500,
  maxWeeklyPoints: 2000,
  maxPointsPerEvent: 100,
  
  // Pricing guardrails
  minCommonPrice: 50,
  maxCommonPrice: 200,
  minLegendaryPrice: 5000,
  maxLegendaryPrice: 20000,
  
  // Duplication handling
  duplicateItemConversion: 0.25, // get 25% of item point cost back
  
  // Prestige economy
  maxItemsInDailyRotation: 12,
  shopRefreshIntervalHours: 24,
  seasonalCollectionDurationDays: 30,
  sponsorItemDurationDays: 14,
  
  // Loot box probability guards
  guaranteedEpicAfterXDrops: 50,
  guaranteedLegendaryAfterXDrops: 200,
} as const;

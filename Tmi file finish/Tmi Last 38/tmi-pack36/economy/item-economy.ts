// apps/api/src/modules/economy/item-economy.ts
// Living item economy — constant creation, rotation, purchase, unlock.

export type ItemCategory =
  | 'avatar_wearable'    // hats, chains, glasses, jackets
  | 'avatar_effect'      // aura, trails, neon glow
  | 'emote'              // dances, poses, reactions
  | 'profile_cosmetic'   // frames, borders, background
  | 'room_cosmetic'      // banners, effects in live rooms
  | 'victory_cosmetic'   // crown variants, champion rings
  | 'event_collectible'  // issue covers, winner cards
  | 'sponsor_item'       // branded by a local sponsor
  | 'game_cosmetic'      // Dirty Dozens, Deal or Feud themed
  | 'seasonal_item'      // limited time seasonal drops
  | 'prestige_item';     // top-tier, rare, earned not bought

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'exclusive';

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  emoji: string;
  imageRef: string;          // CDN path when assets exist

  // Pricing
  pointCost?: number;        // cost in points (most items)
  currencyCost?: number;     // cost in real money cents (premium items)
  isFreeWithTier?: string;   // tier required to get for free

  // Availability
  isLimitedTime: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  totalStock?: number;       // null = unlimited
  remainingStock?: number;

  // Source
  source: 'shop' | 'reward' | 'contest_win' | 'season_reward' | 'sponsor_drop'
        | 'event_drop' | 'battle_win' | 'crown_win' | 'loot_box' | 'achievement';

  // Tags for recommendation
  gameType?: string;         // associated game
  seasonId?: string;
  sponsorId?: string;
  contestId?: string;
  venueId?: string;

  isEquippable: boolean;
  equipSlot?: string;        // "hat", "jacket", "aura", "profile_frame"
}

// ── ROTATION ENGINE ────────────────────────────────────
// The Daily/Weekly/Seasonal rotation that keeps the store fresh.
export interface ShopRotation {
  id: string;
  type: 'daily' | 'weekly' | 'seasonal' | 'event' | 'sponsor' | 'featured';
  items: ItemDefinition[];
  startsAt: Date;
  endsAt: Date;
  label: string;             // "TODAY'S DROPS", "CYPHER WEEK", etc.
  bannerColor: string;
  accentColor: string;
}

// ── AUTOMATIC ITEM GENERATION ─────────────────────────
// Bots generate items automatically based on platform activity.
// Items are constantly created so there is always something to spend points on.
export const AUTO_GENERATION_TRIGGERS: Record<string, Partial<ItemDefinition>> = {
  contest_winner: { category: 'victory_cosmetic', rarity: 'epic', source: 'contest_win', isLimitedTime: true },
  crown_winner: { category: 'victory_cosmetic', rarity: 'legendary', source: 'crown_win', isLimitedTime: true },
  issue_release: { category: 'event_collectible', rarity: 'rare', source: 'event_drop', isLimitedTime: true },
  sponsor_campaign: { category: 'sponsor_item', rarity: 'uncommon', source: 'sponsor_drop' },
  battle_winner: { category: 'game_cosmetic', rarity: 'rare', source: 'battle_win' },
  season_launch: { category: 'seasonal_item', rarity: 'rare', source: 'season_reward' },
  event_start: { category: 'event_collectible', rarity: 'uncommon', source: 'event_drop' },
  loot_drop: { category: 'avatar_wearable', rarity: 'common', source: 'loot_box' },
};

// ── USER INVENTORY ─────────────────────────────────────
export interface UserInventory {
  userId: string;
  ownedItems: OwnedItem[];
  equippedLoadout: EquippedLoadout;
  savedLoadouts: SavedLoadout[];
  pointBalance: number;
  lifetimePointsEarned: number;
  lifetimePointsSpent: number;
}

export interface OwnedItem {
  itemId: string;
  acquiredAt: Date;
  acquiredVia: string;
  isEquipped: boolean;
  quantity: number;          // for stackable items
}

export interface EquippedLoadout {
  userId: string;
  hat?: string;
  glasses?: string;
  jacket?: string;
  shoes?: string;
  accessory?: string;
  aura?: string;
  profileFrame?: string;
  profileBackground?: string;
  victory?: string;
  emote?: string;
  updatedAt: Date;
}

export interface SavedLoadout {
  id: string;
  label: string;
  items: Partial<EquippedLoadout>;
}

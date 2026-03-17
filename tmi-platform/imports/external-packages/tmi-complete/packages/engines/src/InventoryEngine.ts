/**
 * InventoryEngine.ts
 * Purpose: Inventory management — emotes, icons, cosmetics, loadouts, season passes, rarity.
 * Placement: packages/engines/src/InventoryEngine.ts
 *            Import via @tmi/engines/InventoryEngine
 * Depends on: TierEngine
 */

import { Tier, getLoadoutConfig, LoadoutConfig } from './TierEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export type ItemSlot =
  | 'EMOTE'
  | 'ICON'
  | 'HAIR'
  | 'OUTFIT'
  | 'HAT'
  | 'GLASSES'
  | 'AURA'
  | 'NAMEPLATE'
  | 'BADGE'
  | 'EXPRESSION'
  | 'SEASON_PASS';

export type EmoteStyle = 'LOTTIE' | 'SPRITE_SHEET' | 'VIDEO_SNIPPET' | 'SKELETAL';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  iconUrl: string;
  animationUrl?: string;
  animationStyle?: EmoteStyle;
  pointsCost: number;
  tierRequired: Tier;
  isSeasonal: boolean;
  seasonId?: string;
  isSponsorItem: boolean;
  sponsorId?: string;
  isLimitedEdition: boolean;
  totalSupply?: number;        // null = unlimited
  currentSupply?: number;
  unlockedByAchievement?: string;
  tags: string[];              // genre, event, etc.
  createdAt: Date;
}

export interface UserInventory {
  userId: string;
  tier: Tier;
  ownedItemIds: string[];
  equippedLoadout: Loadout;
  seasonPasses: SeasonPass[];
  lastUpdated: Date;
}

export interface Loadout {
  userId: string;
  name: string;
  emoteSlots: Array<string | null>;    // item IDs or null
  iconSlots: Array<string | null>;
  auraSlot: string | null;
  nameplateSlot: string | null;
  outfitSlot: string | null;
  expressionSlot: string | null;
}

export interface SeasonPass {
  id: string;
  seasonId: string;
  seasonName: string;
  tier: Tier;
  startDate: Date;
  endDate: Date;
  rewardTrack: SeasonReward[];
  currentXp: number;
  xpToNextReward: number;
}

export interface SeasonReward {
  level: number;
  xpRequired: number;
  itemId: string;
  isFree: boolean;     // free tier can access; false = pass required
}

// ─── Rarity Config ────────────────────────────────────────────────────────────

export const RARITY_CONFIG: Record<ItemRarity, {
  color: string;
  glow: string;
  dropRate: number;    // base drop probability 0–1
  pointsMultiplier: number;
}> = {
  COMMON:    { color: '#AAAAAA', glow: 'none',                     dropRate: 0.60, pointsMultiplier: 1.0 },
  RARE:      { color: '#22E7FF', glow: '0 0 8px #22E7FF',          dropRate: 0.25, pointsMultiplier: 1.5 },
  EPIC:      { color: '#6B39FF', glow: '0 0 12px #6B39FF',         dropRate: 0.10, pointsMultiplier: 2.5 },
  LEGENDARY: { color: '#FFD700', glow: '0 0 16px #FFD700',         dropRate: 0.04, pointsMultiplier: 5.0 },
  MYTHIC:    { color: '#FF2DAA', glow: '0 0 20px #FF2DAA, 0 0 40px #FF2DAA', dropRate: 0.01, pointsMultiplier: 10.0 },
};

// ─── Emote Catalog Base ───────────────────────────────────────────────────────

export const BASE_EMOTES: Partial<InventoryItem>[] = [
  { id: 'emote_clap',    name: 'Clap',       slot: 'EMOTE', rarity: 'COMMON',    tierRequired: 'FREE',    pointsCost: 0,   animationStyle: 'LOTTIE' },
  { id: 'emote_heart',   name: 'Heart',      slot: 'EMOTE', rarity: 'COMMON',    tierRequired: 'FREE',    pointsCost: 0,   animationStyle: 'LOTTIE' },
  { id: 'emote_fire',    name: 'Fire',       slot: 'EMOTE', rarity: 'COMMON',    tierRequired: 'FREE',    pointsCost: 25,  animationStyle: 'LOTTIE' },
  { id: 'emote_wave',    name: 'Wave',       slot: 'EMOTE', rarity: 'RARE',      tierRequired: 'BRONZE',  pointsCost: 50,  animationStyle: 'SPRITE_SHEET' },
  { id: 'emote_dance1',  name: 'BK Bounce',  slot: 'EMOTE', rarity: 'RARE',      tierRequired: 'BRONZE',  pointsCost: 75,  animationStyle: 'SPRITE_SHEET' },
  { id: 'emote_dance2',  name: 'Two-Step',   slot: 'EMOTE', rarity: 'EPIC',      tierRequired: 'SILVER',  pointsCost: 150, animationStyle: 'VIDEO_SNIPPET' },
  { id: 'emote_confetti',name: 'Confetti',   slot: 'EMOTE', rarity: 'EPIC',      tierRequired: 'SILVER',  pointsCost: 200, animationStyle: 'LOTTIE' },
  { id: 'emote_crowd',   name: 'Crowd Wave', slot: 'EMOTE', rarity: 'LEGENDARY', tierRequired: 'GOLD',    pointsCost: 500, animationStyle: 'SKELETAL' },
  { id: 'emote_throne',  name: 'Throne',     slot: 'EMOTE', rarity: 'MYTHIC',    tierRequired: 'DIAMOND', pointsCost: 0,   unlockedByAchievement: 'WIN_3_BATTLES' },
];

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Validate a loadout against tier limits */
export function validateLoadout(
  loadout: Loadout,
  tier: Tier,
  inventory: UserInventory,
): { valid: boolean; errors: string[] } {
  const config = getLoadoutConfig(tier);
  const errors: string[] = [];

  // Check emote slot count
  const equippedEmotes = loadout.emoteSlots.filter(Boolean);
  if (equippedEmotes.length > config.emoteSlots) {
    errors.push(`Too many emotes: ${equippedEmotes.length}/${config.emoteSlots}`);
  }

  // Check icon slot count
  const equippedIcons = loadout.iconSlots.filter(Boolean);
  if (equippedIcons.length > config.iconSlots) {
    errors.push(`Too many icons: ${equippedIcons.length}/${config.iconSlots}`);
  }

  // Check aura access
  if (loadout.auraSlot && !config.canEquipAuras) {
    errors.push(`Tier ${tier} cannot equip auras`);
  }

  // Check nameplate access
  if (loadout.nameplateSlot && !config.canEquipNameplates) {
    errors.push(`Tier ${tier} cannot equip nameplates`);
  }

  // Check all equipped items are owned
  const allEquipped = [
    ...loadout.emoteSlots,
    ...loadout.iconSlots,
    loadout.auraSlot,
    loadout.nameplateSlot,
    loadout.outfitSlot,
    loadout.expressionSlot,
  ].filter(Boolean) as string[];

  allEquipped.forEach(itemId => {
    if (!inventory.ownedItemIds.includes(itemId)) {
      errors.push(`Item ${itemId} not owned`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/** Get available items for a tier from catalog */
export function getAvailableItems(items: InventoryItem[], tier: Tier): InventoryItem[] {
  return items.filter(item => {
    const config = getLoadoutConfig(tier);
    const tierOrder: Record<Tier, number> = { FREE: 0, BRONZE: 1, SILVER: 2, GOLD: 3, DIAMOND: 4 };
    return tierOrder[tier] >= tierOrder[item.tierRequired];
  });
}

/** Check if limited edition item is available */
export function isLimitedItemAvailable(item: InventoryItem): boolean {
  if (!item.isLimitedEdition) return true;
  if (item.totalSupply === undefined || item.currentSupply === undefined) return true;
  return item.currentSupply > 0;
}

/** Generate seasonal item pool based on date */
export function getSeasonalItems(
  allItems: InventoryItem[],
  currentDate: Date = new Date(),
): InventoryItem[] {
  const month = currentDate.getMonth();
  // Summer: Jun-Aug, Fall: Sep-Nov, Winter: Dec-Feb, Spring: Mar-May
  const season =
    month >= 5 && month <= 7 ? 'SUMMER' :
    month >= 8 && month <= 10 ? 'FALL' :
    month === 11 || month <= 1 ? 'WINTER' : 'SPRING';

  return allItems.filter(item => item.tags.includes(season));
}

/** Calculate item point cost with rarity multiplier */
export function calculateItemCost(item: InventoryItem): number {
  return Math.ceil(item.pointsCost * RARITY_CONFIG[item.rarity].pointsMultiplier);
}

// packages/economy-engine/src/economy.service.ts
// Wallet, points, item shop, inventory, purchases, and living economy rotation.

export interface WalletOperation {
  userId: string;
  type: "earn" | "spend" | "tip" | "payout_request" | "refund";
  amountCents?: number;
  points?: number;
  description: string;
  sourceId?: string;
  sourceType?: string;
  requiresBigAce: boolean;
}

// Big Ace approval gates
export const BIG_ACE_GATES = {
  payoutRequest: true,              // all payouts need Big Ace
  ownerDistribution: true,          // never auto-distribute profit
  campaignOver9999Cents: true,      // $99.99/wk max auto-approve
  exclusivityDeals: true,           // always
  refundOver5000Cents: true,        // $50 refunds need approval
} as const;

// ── SHOP ROTATION SCHEDULER ───────────────────────────────
export interface ShopRotationJob {
  zone: "daily_featured" | "weekly_spotlight" | "seasonal_collection" | "sponsor_drop" | "event_exclusive";
  refreshAt: Date;
  itemSelectionStrategy: "manual" | "rarity_weighted" | "sponsor_priority" | "event_linked";
  slots: number;
}

export const ROTATION_SCHEDULE: ShopRotationJob[] = [
  { zone: "daily_featured",       refreshAt: new Date(), itemSelectionStrategy: "rarity_weighted",  slots: 4 },
  { zone: "weekly_spotlight",     refreshAt: new Date(), itemSelectionStrategy: "manual",            slots: 8 },
  { zone: "seasonal_collection",  refreshAt: new Date(), itemSelectionStrategy: "event_linked",      slots: 12 },
  { zone: "sponsor_drop",         refreshAt: new Date(), itemSelectionStrategy: "sponsor_priority",  slots: 3 },
  { zone: "event_exclusive",      refreshAt: new Date(), itemSelectionStrategy: "event_linked",      slots: 2 },
];

// ── ECONOMY HEALTH RULES ──────────────────────────────────
export const ECONOMY_HEALTH = {
  // Point earning
  maxDailyPoints: 500,
  maxWeeklyPoints: 2000,
  maxPerEventPoints: 100,
  
  // Item economy
  maxItemsInDailyRotation: 12,
  shopRefreshHours: 24,
  seasonDays: 30,
  sponsorItemDays: 14,
  
  // Pity timers
  guaranteedEpicAfterDrops: 50,
  guaranteedLegendaryAfterDrops: 200,
  
  // Duplicate handling
  duplicateConversionRate: 0.25, // 25% point refund
  
  // Pricing guardrails
  minCommonPricePoints: 50,
  maxCommonPricePoints: 200,
  minLegendaryPricePoints: 5000,
  maxLegendaryPricePoints: 20000,
} as const;

// ── AUTOMATIC ITEM GENERATION ─────────────────────────────
export type ItemGenerationTrigger =
  | "new_sponsor_campaign"   // → rare sponsor_item (500 qty)
  | "issue_release"          // → epic collectible (100 qty)
  | "event_scheduled"        // → uncommon event_item (1000 qty)
  | "battle_winner"          // → legendary avatar_effect (1 qty)
  | "season_start"           // → rare seasonal batch (5000 qty)
  | "crown_awarded"          // → exclusive badge (1 qty)
  | "leaderboard_top_10"     // → epic profile_cosmetic (10 qty)
  | "daily_rotation";        // → common bundle (unlimited)

export function getItemGenerationSpec(trigger: ItemGenerationTrigger) {
  const specs = {
    new_sponsor_campaign: { category: "sponsor_item",     rarity: "RARE",      quantity: 500 },
    issue_release:        { category: "collectible",      rarity: "EPIC",      quantity: 100 },
    event_scheduled:      { category: "event_item",       rarity: "UNCOMMON",  quantity: 1000 },
    battle_winner:        { category: "avatar_effect",    rarity: "LEGENDARY", quantity: 1 },
    season_start:         { category: "seasonal",         rarity: "RARE",      quantity: 5000 },
    crown_awarded:        { category: "badge",            rarity: "EXCLUSIVE", quantity: 1 },
    leaderboard_top_10:   { category: "profile_cosmetic", rarity: "EPIC",      quantity: 10 },
    daily_rotation:       { category: "avatar_wearable",  rarity: "COMMON",    quantity: 99999 },
  } as const;
  return specs[trigger];
}

/**
 * Reward Bundle Engine
 * Assembles prize bundles for winners, runner-ups, and random audience members.
 * Supports: sponsor items + points + store items + NFTs + avatar collectibles.
 */

export type RewardTier = "WINNER" | "RUNNER_UP" | "TOP_10" | "AUDIENCE_RANDOM" | "CONSOLATION";

export type RewardItemType =
  | "POINTS"
  | "SPONSOR_ITEM"
  | "STORE_ITEM"
  | "NFT"
  | "AVATAR_COLLECTIBLE"
  | "VIP_ACCESS"
  | "DIGITAL_DOWNLOAD"
  | "CASH_PRIZE";

export interface RewardItem {
  type: RewardItemType;
  label: string;
  value: number;       // points amount, or dollar cents, or qty
  assetId?: string;    // reference to sponsor_item / store_item / nft / avatar_item
  description?: string;
}

export interface RewardBundle {
  id: string;
  name: string;
  tier: RewardTier;
  eventType: string;   // "CONTEST" | "BATTLE" | "CYPHER" | "MONTHLY_IDOL" | "DIRTY_DOZENS" | "RANDOM_DROP"
  items: RewardItem[];
  sponsorId?: string;
  totalValueCents: number;
  expiresAfterDays: number;
}

export interface RewardClaim {
  bundleId: string;
  userId: string;
  claimedAt: string;
  status: "PENDING" | "CLAIMED" | "FULFILLED" | "EXPIRED";
}

// ── Starter bundle templates ─────────────────────────────────────────────────

export const BUNDLE_TEMPLATES: Record<string, Omit<RewardBundle, "id">> = {
  BATTLE_WINNER: {
    name: "Battle Champion Pack",
    tier: "WINNER",
    eventType: "BATTLE",
    totalValueCents: 25000,
    expiresAfterDays: 30,
    items: [
      { type: "POINTS",      label: "Champion Points",      value: 5000 },
      { type: "NFT",         label: "Crown Win NFT Badge",  value: 1,   assetId: "nft-crown-win" },
      { type: "AVATAR_COLLECTIBLE", label: "Crown Avatar Frame", value: 1, assetId: "avatar-crown-frame" },
      { type: "SPONSOR_ITEM",label: "Sponsor Gear Bundle",  value: 1 },
    ],
  },
  BATTLE_RUNNER_UP: {
    name: "Runner-Up Pack",
    tier: "RUNNER_UP",
    eventType: "BATTLE",
    totalValueCents: 5000,
    expiresAfterDays: 30,
    items: [
      { type: "POINTS",      label: "Silver Points",        value: 1500 },
      { type: "AVATAR_COLLECTIBLE", label: "Silver Frame",  value: 1,   assetId: "avatar-silver-frame" },
    ],
  },
  AUDIENCE_RANDOM_DROP: {
    name: "Audience Winner Drop",
    tier: "AUDIENCE_RANDOM",
    eventType: "RANDOM_DROP",
    totalValueCents: 1500,
    expiresAfterDays: 7,
    items: [
      { type: "POINTS",      label: "Audience Points",     value: 100 },
      { type: "STORE_ITEM",  label: "Merch Discount Code", value: 1,   assetId: "store-discount-15pct" },
    ],
  },
  MONTHLY_IDOL_WINNER: {
    name: "Monthly Idol Crown",
    tier: "WINNER",
    eventType: "MONTHLY_IDOL",
    totalValueCents: 100000,
    expiresAfterDays: 90,
    items: [
      { type: "CASH_PRIZE",  label: "Cash Prize",          value: 50000 },
      { type: "POINTS",      label: "Idol Points",          value: 10000 },
      { type: "NFT",         label: "Monthly Idol NFT",     value: 1,    assetId: "nft-monthly-idol" },
      { type: "SPONSOR_ITEM",label: "Sponsor Gift Bundle",  value: 1 },
      { type: "VIP_ACCESS",  label: "VIP Room Access 90d",  value: 90 },
    ],
  },
  DIRTY_DOZENS_WINNER: {
    name: "Dirty Dozens Champion",
    tier: "WINNER",
    eventType: "DIRTY_DOZENS",
    totalValueCents: 50000,
    expiresAfterDays: 60,
    items: [
      { type: "POINTS",      label: "Champion Points",     value: 7500 },
      { type: "NFT",         label: "Dirty Dozens Badge",  value: 1,    assetId: "nft-dirty-dozens" },
      { type: "SPONSOR_ITEM",label: "Sponsor Gear",        value: 1 },
      { type: "VIP_ACCESS",  label: "VIP Access 30d",      value: 30 },
    ],
  },
  CONSOLATION: {
    name: "Participation Pack",
    tier: "CONSOLATION",
    eventType: "BATTLE",
    totalValueCents: 200,
    expiresAfterDays: 14,
    items: [
      { type: "POINTS",      label: "Participation Points", value: 50 },
    ],
  },
};

/** Build a bundle from a template, assigning a fresh ID */
export function buildBundle(
  templateKey: keyof typeof BUNDLE_TEMPLATES,
  overrides: Partial<RewardBundle> = {},
): RewardBundle {
  const template = BUNDLE_TEMPLATES[templateKey];
  if (!template) throw new Error(`Unknown bundle template: ${templateKey}`);
  return {
    ...template,
    ...overrides,
    id: `bundle_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

/** Calculate royalty split on a resale transaction */
export interface RoyaltySplit {
  creator: number;   // cents
  platform: number;  // cents
  seller: number;    // cents
}

export function calcRoyalty(
  salePriceCents: number,
  creatorRoyaltyPct = 10,
  platformFeePct = 5,
): RoyaltySplit {
  const creator  = Math.floor(salePriceCents * creatorRoyaltyPct / 100);
  const platform = Math.floor(salePriceCents * platformFeePct / 100);
  const seller   = salePriceCents - creator - platform;
  return { creator, platform, seller };
}

/** Pick N random audience winners from a pool of user IDs */
export function pickAudienceWinners(pool: string[], count: number): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

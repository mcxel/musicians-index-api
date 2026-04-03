/**
 * Reward Bundle Engine
 * Assembles winner + audience prize bundles from points, store items,
 * sponsor items, NFTs, and avatar collectibles.
 */

export type RewardRecipientType = 'WINNER' | 'RUNNER_UP' | 'RANDOM_AUDIENCE' | 'ALL_PARTICIPANTS';

export type RewardItemType =
  | 'POINTS'
  | 'STORE_ITEM'
  | 'SPONSOR_ITEM'
  | 'NFT'
  | 'AVATAR_ITEM'
  | 'DISCOUNT_COUPON'
  | 'VIP_ACCESS'
  | 'DIGITAL_BADGE';

export interface RewardItem {
  type: RewardItemType;
  label: string;
  value: number;        // points amount OR monetary value in cents
  quantity: number;
  metadata?: Record<string, unknown>;
}

export interface RewardBundle {
  id: string;
  name: string;
  recipientType: RewardRecipientType;
  items: RewardItem[];
  sponsorId?: string;
  eventId?: string;
  createdAt: string;
}

export interface RewardClaim {
  id: string;
  bundleId: string;
  userId: string;
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'FAILED';
  claimedAt?: string;
  expiresAt: string;
}

/** Pre-built reward bundle templates */
export const REWARD_TEMPLATES: Record<string, Omit<RewardBundle, 'id' | 'createdAt' | 'eventId'>> = {
  BATTLE_WINNER: {
    name: 'Battle Winner Pack',
    recipientType: 'WINNER',
    items: [
      { type: 'POINTS',        label: '1,000 Crown Points',     value: 1000,  quantity: 1 },
      { type: 'DIGITAL_BADGE', label: 'Champion Badge NFT',     value: 0,     quantity: 1 },
      { type: 'VIP_ACCESS',    label: 'VIP Room Access (30d)',   value: 0,     quantity: 1 },
    ],
  },
  AUDIENCE_RANDOM: {
    name: 'Audience Surprise Drop',
    recipientType: 'RANDOM_AUDIENCE',
    items: [
      { type: 'POINTS',       label: '100 Crown Points',        value: 100,   quantity: 1 },
      { type: 'AVATAR_ITEM',  label: 'Random Avatar Accessory', value: 0,     quantity: 1 },
    ],
  },
  SPONSOR_GIVEAWAY: {
    name: 'Sponsor Gift Bundle',
    recipientType: 'WINNER',
    items: [
      { type: 'SPONSOR_ITEM', label: 'Sponsor Prize Item',      value: 0,     quantity: 1 },
      { type: 'POINTS',       label: '500 Crown Points',        value: 500,   quantity: 1 },
      { type: 'DISCOUNT_COUPON', label: '25% Store Coupon',     value: 25,    quantity: 1 },
    ],
  },
  MONTHLY_IDOL_WINNER: {
    name: 'Monthly Idol Crown Pack',
    recipientType: 'WINNER',
    items: [
      { type: 'POINTS',        label: '5,000 Crown Points',     value: 5000,  quantity: 1 },
      { type: 'DIGITAL_BADGE', label: 'Monthly Idol Crown NFT', value: 0,     quantity: 1 },
      { type: 'VIP_ACCESS',    label: 'VIP Access (90d)',        value: 0,     quantity: 1 },
      { type: 'SPONSOR_ITEM',  label: 'Sponsor Grand Prize',    value: 0,     quantity: 1 },
    ],
  },
};

export function buildBundle(
  templateKey: keyof typeof REWARD_TEMPLATES,
  eventId: string,
  sponsorId?: string,
): RewardBundle {
  const template = REWARD_TEMPLATES[templateKey];
  return {
    id: `bundle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...template,
    eventId,
    sponsorId,
    createdAt: new Date().toISOString(),
  };
}

export function createClaim(bundle: RewardBundle, userId: string): RewardClaim {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  return {
    id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    bundleId: bundle.id,
    userId,
    status: 'PENDING',
    expiresAt,
  };
}

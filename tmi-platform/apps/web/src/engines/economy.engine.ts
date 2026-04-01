/**
 * Economy Engine — Client-Side
 * Handles points display, wallet state, tier logic, currency formatting,
 * and subscription tier feature gating for the TMI Platform frontend.
 *
 * Connects to: GET /api/economy/* endpoints
 */

// ─── Subscription Tiers ────────────────────────────────────────────────────────

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    monthlyPoints: 0,
    bookingBoost: 0,
    storeDiscount: 0,
    maxRooms: 1,
    maxPartySize: 4,
    color: '#6b7280',
    badge: '🎵',
    features: ['basic_access', 'public_rooms'],
  },
  SUPPORTER: {
    name: 'Supporter',
    monthlyPoints: 500,
    bookingBoost: 5,
    storeDiscount: 5,
    maxRooms: 3,
    maxPartySize: 8,
    color: '#3b82f6',
    badge: '⭐',
    features: ['basic_access', 'public_rooms', 'private_rooms', 'julius_basic'],
  },
  PRO: {
    name: 'Pro',
    monthlyPoints: 1500,
    bookingBoost: 10,
    storeDiscount: 10,
    maxRooms: 10,
    maxPartySize: 20,
    color: '#8b5cf6',
    badge: '💎',
    features: ['basic_access', 'public_rooms', 'private_rooms', 'julius_full', 'analytics', 'priority_booking'],
  },
  ELITE: {
    name: 'Elite',
    monthlyPoints: 5000,
    bookingBoost: 20,
    storeDiscount: 20,
    maxRooms: -1,
    maxPartySize: 100,
    color: '#f59e0b',
    badge: '👑',
    features: ['all_access', 'julius_full', 'analytics', 'priority_booking', 'vip_rooms', 'custom_avatar', 'ad_free'],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// ─── Point Rules ───────────────────────────────────────────────────────────────

export const POINT_RULES = {
  DAILY_LOGIN: 10,
  ROOM_JOIN: 5,
  ROOM_HOST: 25,
  ARTICLE_READ: 2,
  ARTICLE_SHARE: 10,
  COMMENT_POST: 5,
  FRIEND_ADD: 15,
  EVENT_ATTEND: 50,
  EVENT_HOST: 100,
  PURCHASE: 1,
  TIP_SENT: 5,
  CONTEST_ENTER: 20,
  CONTEST_WIN: 500,
  ACHIEVEMENT_UNLOCK: 50,
  REFERRAL: 200,
  JULIUS_INTERACT: 3,
  POLL_VOTE: 2,
  REACTION_SEND: 1,
} as const;

export type PointAction = keyof typeof POINT_RULES;

// ─── Currency Config ───────────────────────────────────────────────────────────

export const CURRENCY_CONFIG: Record<string, { symbol: string; name: string; rate: number; locale: string }> = {
  USD: { symbol: '$',  name: 'US Dollar',         rate: 1,     locale: 'en-US' },
  NGN: { symbol: '₦', name: 'Nigerian Naira',     rate: 1550,  locale: 'en-NG' },
  IDR: { symbol: 'Rp',name: 'Indonesian Rupiah',  rate: 15900, locale: 'id-ID' },
  ZAR: { symbol: 'R', name: 'South African Rand', rate: 18.5,  locale: 'en-ZA' },
  EUR: { symbol: '€', name: 'Euro',               rate: 0.92,  locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound',      rate: 0.79,  locale: 'en-GB' },
  KES: { symbol: 'KSh',name: 'Kenyan Shilling',   rate: 130,   locale: 'sw-KE' },
  GHS: { symbol: 'GH₵',name: 'Ghanaian Cedi',     rate: 15.5,  locale: 'en-GH' },
};

export type SupportedCurrency = keyof typeof CURRENCY_CONFIG;

// ─── Wallet State ──────────────────────────────────────────────────────────────

export interface WalletState {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  fanCredits: number;
  currency: SupportedCurrency;
}

// ─── Economy Engine Class ──────────────────────────────────────────────────────

export class EconomyEngine {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // ─── Currency Formatting ────────────────────────────────────────────────────

  formatCurrency(amountCents: number, currency: SupportedCurrency = 'USD'): string {
    const config = CURRENCY_CONFIG[currency];
    if (!config) return `${amountCents / 100}`;

    const amount = amountCents / 100;
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'IDR' ? 0 : 2,
        maximumFractionDigits: currency === 'IDR' ? 0 : 2,
      }).format(amount);
    } catch {
      return `${config.symbol}${amount.toFixed(2)}`;
    }
  }

  convertCurrency(amountCents: number, from: SupportedCurrency, to: SupportedCurrency): number {
    const fromRate = CURRENCY_CONFIG[from]?.rate ?? 1;
    const toRate = CURRENCY_CONFIG[to]?.rate ?? 1;
    return Math.round((amountCents / fromRate) * toRate);
  }

  // ─── Points Formatting ──────────────────────────────────────────────────────

  formatPoints(points: number): string {
    if (points >= 1_000_000) return `${(points / 1_000_000).toFixed(1)}M pts`;
    if (points >= 1_000) return `${(points / 1_000).toFixed(1)}K pts`;
    return `${points} pts`;
  }

  // ─── Tier Logic ─────────────────────────────────────────────────────────────

  getTierConfig(tier: SubscriptionTier) {
    return SUBSCRIPTION_TIERS[tier];
  }

  hasFeature(tier: SubscriptionTier, feature: string): boolean {
    const config = SUBSCRIPTION_TIERS[tier];
    return (config.features as readonly string[]).includes(feature) ||
           (config.features as readonly string[]).includes('all_access');
  }

  canCreateRoom(tier: SubscriptionTier, currentRooms: number): boolean {
    const max = SUBSCRIPTION_TIERS[tier].maxRooms;
    return max === -1 || currentRooms < max;
  }

  canJoinParty(tier: SubscriptionTier, partySize: number): boolean {
    return partySize < SUBSCRIPTION_TIERS[tier].maxPartySize;
  }

  getStoreDiscount(tier: SubscriptionTier): number {
    return SUBSCRIPTION_TIERS[tier].storeDiscount;
  }

  applyDiscount(priceCents: number, tier: SubscriptionTier): number {
    const discount = this.getStoreDiscount(tier);
    return Math.round(priceCents * (1 - discount / 100));
  }

  getBookingBoost(tier: SubscriptionTier, baseScore: number): number {
    const boost = SUBSCRIPTION_TIERS[tier].bookingBoost;
    return Math.round(baseScore * (1 + boost / 100));
  }

  // ─── Tier Upgrade Suggestions ───────────────────────────────────────────────

  getUpgradeSuggestion(tier: SubscriptionTier): SubscriptionTier | null {
    const order: SubscriptionTier[] = ['FREE', 'SUPPORTER', 'PRO', 'ELITE'];
    const idx = order.indexOf(tier);
    return idx < order.length - 1 ? order[idx + 1] : null;
  }

  getTierProgress(points: number): { tier: SubscriptionTier; nextTier: SubscriptionTier | null; progress: number } {
    // Tier thresholds based on lifetime points
    const thresholds: Array<{ tier: SubscriptionTier; min: number }> = [
      { tier: 'ELITE',     min: 10000 },
      { tier: 'PRO',       min: 3000  },
      { tier: 'SUPPORTER', min: 500   },
      { tier: 'FREE',      min: 0     },
    ];

    const current = thresholds.find(t => points >= t.min) ?? thresholds[thresholds.length - 1];
    const currentIdx = thresholds.indexOf(current);
    const nextThreshold = currentIdx > 0 ? thresholds[currentIdx - 1] : null;

    const progress = nextThreshold
      ? Math.min(100, Math.round(((points - current.min) / (nextThreshold.min - current.min)) * 100))
      : 100;

    return {
      tier: current.tier,
      nextTier: nextThreshold?.tier ?? null,
      progress,
    };
  }

  // ─── Point Action Labels ────────────────────────────────────────────────────

  getActionLabel(action: PointAction): string {
    const labels: Record<PointAction, string> = {
      DAILY_LOGIN:        'Daily Login',
      ROOM_JOIN:          'Join a Room',
      ROOM_HOST:          'Host a Room',
      ARTICLE_READ:       'Read Article',
      ARTICLE_SHARE:      'Share Article',
      COMMENT_POST:       'Post Comment',
      FRIEND_ADD:         'Add Friend',
      EVENT_ATTEND:       'Attend Event',
      EVENT_HOST:         'Host Event',
      PURCHASE:           'Make Purchase',
      TIP_SENT:           'Send Tip',
      CONTEST_ENTER:      'Enter Contest',
      CONTEST_WIN:        'Win Contest',
      ACHIEVEMENT_UNLOCK: 'Unlock Achievement',
      REFERRAL:           'Refer a Friend',
      JULIUS_INTERACT:    'Interact with Julius',
      POLL_VOTE:          'Vote in Poll',
      REACTION_SEND:      'Send Reaction',
    };
    return labels[action] ?? action;
  }

  getActionPoints(action: PointAction): number {
    return POINT_RULES[action];
  }

  // ─── API Calls ──────────────────────────────────────────────────────────────

  async fetchBalance(): Promise<WalletState> {
    const res = await fetch(`${this.baseUrl}/economy/balance`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch balance: ${res.status}`);
    return res.json();
  }

  async fetchPoints(): Promise<{ points: number }> {
    const res = await fetch(`${this.baseUrl}/economy/points`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch points: ${res.status}`);
    return res.json();
  }

  async awardPoints(action: PointAction): Promise<{ points: number; awarded: number; newTotal: number }> {
    const res = await fetch(`${this.baseUrl}/economy/points/award`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error(`Failed to award points: ${res.status}`);
    return res.json();
  }

  async redeemPoints(points: number, reason: string): Promise<{ success: boolean; remaining: number }> {
    const res = await fetch(`${this.baseUrl}/economy/points/redeem`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points, reason }),
    });
    if (!res.ok) throw new Error(`Failed to redeem points: ${res.status}`);
    return res.json();
  }

  async fetchLeaderboard(limit = 20): Promise<Array<{ userId: string; points: number; rank: number }>> {
    const res = await fetch(`${this.baseUrl}/economy/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
    return res.json();
  }

  async convertCurrencyRemote(amount: number, from: SupportedCurrency, to: SupportedCurrency): Promise<{ result: number; rate: number }> {
    const res = await fetch(`${this.baseUrl}/economy/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, from, to }),
    });
    if (!res.ok) throw new Error(`Failed to convert currency: ${res.status}`);
    return res.json();
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const economyEngine = new EconomyEngine();

// ─── React Hook (lightweight, no external deps) ───────────────────────────────

export function useEconomyEngine(): EconomyEngine {
  return economyEngine;
}

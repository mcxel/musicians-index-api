/**
 * Billing Engine
 * Subscription plans, tiers, and user subscription management.
 */

export type SubscriptionTier =
  | 'FREE'
  | 'FAN'
  | 'PERFORMER'
  | 'VIP'
  | 'ADVERTISER'
  | 'SPONSOR'
  | 'VENUE';

export type BillingInterval = 'monthly' | 'annual';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  interval: BillingInterval;
  startDate: number;
  nextRenewal: number;
  active: boolean;
}

const MS_MONTH = 30 * 24 * 60 * 60 * 1000;
const MS_YEAR = 365 * 24 * 60 * 60 * 1000;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'FREE',
    name: 'Free Access',
    priceMonthly: 0,
    priceAnnual: 0,
    features: ['Watch shows', 'Limited crowd votes', 'Public leaderboards'],
  },
  {
    tier: 'FAN',
    name: 'Fan Pass',
    priceMonthly: 9.99,
    priceAnnual: 89.99,
    features: [
      'Unlimited crowd votes',
      'Seat selection',
      'Show recordings',
      'Fan badge',
      'Group seating',
    ],
  },
  {
    tier: 'PERFORMER',
    name: 'Performer',
    priceMonthly: 19.99,
    priceAnnual: 179.99,
    features: [
      'All Fan features',
      'Contest entries',
      'Performance analytics',
      'Profile page',
      'Prize eligibility',
      'Monthly Idol entries',
    ],
  },
  {
    tier: 'VIP',
    name: 'VIP Season Pass',
    priceMonthly: 39.99,
    priceAnnual: 349.99,
    features: [
      'All Performer features',
      'VIP seating',
      'Backstage digital access',
      'Priority queue',
      'Exclusive NFT drops',
      'VIP badge',
    ],
  },
  {
    tier: 'ADVERTISER',
    name: 'Advertiser',
    priceMonthly: 99,
    priceAnnual: 899,
    features: [
      'Sponsor reads in shows',
      'Billboard placements',
      'Analytics dashboard',
      'Custom ad slots',
      'Audience targeting',
    ],
  },
  {
    tier: 'SPONSOR',
    name: 'Show Sponsor',
    priceMonthly: 299,
    priceAnnual: 2499,
    features: [
      'All Advertiser features',
      'Named sponsor in 4 shows/month',
      'Prize co-sponsorship',
      'Host script integration',
      'Show naming rights',
      'Dedicated account manager',
    ],
  },
  {
    tier: 'VENUE',
    name: 'Venue Partner',
    priceMonthly: 499,
    priceAnnual: 4499,
    features: [
      'Full venue digital presence',
      'NFT venue pass issuance',
      'Custom room branding',
      'Revenue share on ticket sales',
      'Dedicated show slot',
      'API access',
    ],
  },
];

export class BillingEngine {
  private subscriptions: Map<string, UserSubscription> = new Map();

  getPlansForRole(role: string): SubscriptionPlan[] {
    const roleLower = role.toLowerCase();
    if (roleLower === 'performer' || roleLower === 'artist') {
      return SUBSCRIPTION_PLANS.filter((p) =>
        ['FREE', 'FAN', 'PERFORMER', 'VIP'].includes(p.tier),
      );
    }
    if (roleLower === 'advertiser' || roleLower === 'sponsor') {
      return SUBSCRIPTION_PLANS.filter((p) =>
        ['ADVERTISER', 'SPONSOR', 'VENUE'].includes(p.tier),
      );
    }
    if (roleLower === 'venue') {
      return SUBSCRIPTION_PLANS.filter((p) =>
        ['VENUE', 'SPONSOR'].includes(p.tier),
      );
    }
    // Default: all fan-facing plans
    return SUBSCRIPTION_PLANS.filter((p) =>
      ['FREE', 'FAN', 'VIP'].includes(p.tier),
    );
  }

  createSubscription(
    userId: string,
    tier: SubscriptionTier,
    interval: BillingInterval,
  ): UserSubscription {
    const now = Date.now();
    const duration = interval === 'annual' ? MS_YEAR : MS_MONTH;
    const sub: UserSubscription = {
      userId,
      tier,
      interval,
      startDate: now,
      nextRenewal: now + duration,
      active: true,
    };
    this.subscriptions.set(userId, sub);
    return { ...sub };
  }

  cancelSubscription(userId: string): void {
    const sub = this.subscriptions.get(userId);
    if (!sub) return;
    sub.active = false;
  }

  getSubscription(userId: string): UserSubscription | undefined {
    const sub = this.subscriptions.get(userId);
    return sub ? { ...sub } : undefined;
  }

  isSubscriptionActive(userId: string): boolean {
    const sub = this.subscriptions.get(userId);
    if (!sub) return false;
    return sub.active && sub.nextRenewal > Date.now();
  }
}

/**
 * SubscriptionEngine
 * Subscription tier management — feature gates, upgrade/downgrade, trial handling.
 */

export type SubscriptionTier =
  | "free"
  | "fan_pro"
  | "performer_pro"
  | "venue_pro"
  | "sponsor_pro"
  | "platform_vip";

export type BillingInterval = "monthly" | "annual";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "expired"
  | "paused";

export type SubscriptionRecord = {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  interval: BillingInterval;
  startedAtMs: number;
  renewsAtMs: number;
  cancelledAtMs: number | null;
  trialEndsAtMs: number | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type TierFeatures = {
  maxShows: number | null;
  canGoLive: boolean;
  canSellTickets: boolean;
  canMintNFTs: boolean;
  hasAdFreeExperience: boolean;
  hasPrioritySupport: boolean;
  canAccessBeatLab: boolean;
  canCreateSponsorCampaigns: boolean;
  hasAnalyticsDashboard: boolean;
  maxBotSlots: number;
  canAccessSeasonPass: boolean;
  canAccessHallOfFame: boolean;
};

const TIER_PRICES_USD: Record<SubscriptionTier, Record<BillingInterval, number>> = {
  free: { monthly: 0, annual: 0 },
  fan_pro: { monthly: 9.99, annual: 89.99 },
  performer_pro: { monthly: 19.99, annual: 179.99 },
  venue_pro: { monthly: 49.99, annual: 449.99 },
  sponsor_pro: { monthly: 99.99, annual: 899.99 },
  platform_vip: { monthly: 199.99, annual: 1799.99 },
};

const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    maxShows: 2,
    canGoLive: false,
    canSellTickets: false,
    canMintNFTs: false,
    hasAdFreeExperience: false,
    hasPrioritySupport: false,
    canAccessBeatLab: false,
    canCreateSponsorCampaigns: false,
    hasAnalyticsDashboard: false,
    maxBotSlots: 0,
    canAccessSeasonPass: false,
    canAccessHallOfFame: true,
  },
  fan_pro: {
    maxShows: null,
    canGoLive: false,
    canSellTickets: false,
    canMintNFTs: false,
    hasAdFreeExperience: true,
    hasPrioritySupport: false,
    canAccessBeatLab: false,
    canCreateSponsorCampaigns: false,
    hasAnalyticsDashboard: false,
    maxBotSlots: 0,
    canAccessSeasonPass: true,
    canAccessHallOfFame: true,
  },
  performer_pro: {
    maxShows: null,
    canGoLive: true,
    canSellTickets: true,
    canMintNFTs: true,
    hasAdFreeExperience: true,
    hasPrioritySupport: true,
    canAccessBeatLab: true,
    canCreateSponsorCampaigns: false,
    hasAnalyticsDashboard: true,
    maxBotSlots: 2,
    canAccessSeasonPass: true,
    canAccessHallOfFame: true,
  },
  venue_pro: {
    maxShows: null,
    canGoLive: true,
    canSellTickets: true,
    canMintNFTs: true,
    hasAdFreeExperience: true,
    hasPrioritySupport: true,
    canAccessBeatLab: false,
    canCreateSponsorCampaigns: true,
    hasAnalyticsDashboard: true,
    maxBotSlots: 5,
    canAccessSeasonPass: true,
    canAccessHallOfFame: true,
  },
  sponsor_pro: {
    maxShows: null,
    canGoLive: false,
    canSellTickets: false,
    canMintNFTs: false,
    hasAdFreeExperience: true,
    hasPrioritySupport: true,
    canAccessBeatLab: false,
    canCreateSponsorCampaigns: true,
    hasAnalyticsDashboard: true,
    maxBotSlots: 3,
    canAccessSeasonPass: false,
    canAccessHallOfFame: false,
  },
  platform_vip: {
    maxShows: null,
    canGoLive: true,
    canSellTickets: true,
    canMintNFTs: true,
    hasAdFreeExperience: true,
    hasPrioritySupport: true,
    canAccessBeatLab: true,
    canCreateSponsorCampaigns: true,
    hasAnalyticsDashboard: true,
    maxBotSlots: 20,
    canAccessSeasonPass: true,
    canAccessHallOfFame: true,
  },
};

export class SubscriptionEngine {
  private readonly records: Map<string, SubscriptionRecord> = new Map();

  subscribe(
    userId: string,
    tier: SubscriptionTier,
    interval: BillingInterval,
    trialDays: number = 0,
  ): SubscriptionRecord {
    const now = Date.now();
    const intervalMs = interval === "monthly" ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    const trialMs = trialDays * 24 * 60 * 60 * 1000;

    const record: SubscriptionRecord = {
      userId,
      tier,
      status: trialDays > 0 ? "trialing" : "active",
      interval,
      startedAtMs: now,
      renewsAtMs: now + intervalMs,
      cancelledAtMs: null,
      trialEndsAtMs: trialDays > 0 ? now + trialMs : null,
    };

    this.records.set(userId, record);
    return record;
  }

  upgrade(userId: string, newTier: SubscriptionTier): void {
    const record = this.records.get(userId);
    if (!record) return;
    record.tier = newTier;
    record.status = "active";
  }

  downgrade(userId: string, newTier: SubscriptionTier): void {
    this.upgrade(userId, newTier);
  }

  cancel(userId: string): void {
    const record = this.records.get(userId);
    if (!record) return;
    record.status = "cancelled";
    record.cancelledAtMs = Date.now();
  }

  getRecord(userId: string): SubscriptionRecord | null {
    return this.records.get(userId) ?? null;
  }

  getTier(userId: string): SubscriptionTier {
    const record = this.records.get(userId);
    if (!record || record.status === "cancelled" || record.status === "expired") return "free";
    return record.tier;
  }

  getFeatures(userId: string): TierFeatures {
    return TIER_FEATURES[this.getTier(userId)];
  }

  canAccess(userId: string, feature: keyof TierFeatures): boolean {
    const features = this.getFeatures(userId);
    const val = features[feature];
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val > 0;
    return val !== null;
  }

  getPrice(tier: SubscriptionTier, interval: BillingInterval): number {
    return TIER_PRICES_USD[tier][interval];
  }

  getTierFeatures(tier: SubscriptionTier): TierFeatures {
    return TIER_FEATURES[tier];
  }

  getAllTiers(): SubscriptionTier[] {
    return Object.keys(TIER_FEATURES) as SubscriptionTier[];
  }
}

export const subscriptionEngine = new SubscriptionEngine();

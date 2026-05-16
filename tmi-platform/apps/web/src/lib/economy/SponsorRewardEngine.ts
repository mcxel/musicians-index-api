/**
 * SponsorRewardEngine
 * Manages sponsor reward campaigns: impression tracking, activation, and payout triggers.
 */

export type SponsorTier = "bronze" | "silver" | "gold" | "platinum" | "title";
export type RewardTrigger = "impression" | "click" | "vote" | "purchase" | "show-watch" | "milestone";

export interface SponsorCampaign {
  id: string;
  sponsorId: string;
  sponsorName: string;
  tier: SponsorTier;
  rewardPoolCents: number;
  rewardPerTriggerCents: number;
  triggerType: RewardTrigger;
  targetShowId?: string;
  maxRewardsTotal: number;
  rewardsDistributed: number;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  brandColor?: string;
  logoUrl?: string;
}

export interface SponsorReward {
  id: string;
  campaignId: string;
  userId: string;
  triggerType: RewardTrigger;
  amountCents: number;
  tmicoinBonus: number;
  earnedAt: number;
  paid: boolean;
}

const TIER_MULTIPLIERS: Record<SponsorTier, number> = {
  bronze:   1.0,
  silver:   1.25,
  gold:     1.5,
  platinum: 2.0,
  title:    3.0,
};

export class SponsorRewardEngine {
  private static _instance: SponsorRewardEngine | null = null;

  private _campaigns: Map<string, SponsorCampaign> = new Map();
  private _rewards: Map<string, SponsorReward[]> = new Map();
  private _userRewards: Map<string, SponsorReward[]> = new Map();
  private _listeners: Set<(reward: SponsorReward) => void> = new Set();

  static getInstance(): SponsorRewardEngine {
    if (!SponsorRewardEngine._instance) {
      SponsorRewardEngine._instance = new SponsorRewardEngine();
    }
    return SponsorRewardEngine._instance;
  }

  // ── Campaigns ──────────────────────────────────────────────────────────────

  createCampaign(campaign: Omit<SponsorCampaign, "id" | "rewardsDistributed" | "impressions" | "clicks">): SponsorCampaign {
    const full: SponsorCampaign = {
      ...campaign,
      id: Math.random().toString(36).slice(2),
      rewardsDistributed: 0,
      impressions: 0,
      clicks: 0,
    };
    this._campaigns.set(full.id, full);
    return full;
  }

  getCampaign(id: string): SponsorCampaign | null {
    return this._campaigns.get(id) ?? null;
  }

  getActiveCampaigns(showId?: string): SponsorCampaign[] {
    return [...this._campaigns.values()].filter((c) =>
      c.isActive && (!showId || !c.targetShowId || c.targetShowId === showId)
    );
  }

  // ── Tracking ──────────────────────────────────────────────────────────────

  recordImpression(campaignId: string): void {
    const c = this._campaigns.get(campaignId);
    if (c) c.impressions++;
  }

  recordClick(campaignId: string): void {
    const c = this._campaigns.get(campaignId);
    if (c) c.clicks++;
  }

  // ── Reward distribution ────────────────────────────────────────────────────

  triggerReward(campaignId: string, userId: string, trigger: RewardTrigger): SponsorReward | null {
    const campaign = this._campaigns.get(campaignId);
    if (!campaign || !campaign.isActive) return null;
    if (campaign.rewardsDistributed >= campaign.maxRewardsTotal) return null;
    if (campaign.rewardPoolCents <= 0) return null;

    const baseAmount = campaign.rewardPerTriggerCents;
    const multiplier = TIER_MULTIPLIERS[campaign.tier];
    const amountCents = Math.round(baseAmount * multiplier);
    const tmicoinBonus = Math.round(amountCents / 10);

    const reward: SponsorReward = {
      id: Math.random().toString(36).slice(2),
      campaignId,
      userId,
      triggerType: trigger,
      amountCents,
      tmicoinBonus,
      earnedAt: Date.now(),
      paid: false,
    };

    campaign.rewardPoolCents -= amountCents;
    campaign.rewardsDistributed++;
    if (campaign.rewardPoolCents <= 0) campaign.isActive = false;

    const existing = this._rewards.get(campaignId) ?? [];
    existing.push(reward);
    this._rewards.set(campaignId, existing);

    const userExisting = this._userRewards.get(userId) ?? [];
    userExisting.push(reward);
    this._userRewards.set(userId, userExisting);

    for (const cb of this._listeners) cb(reward);
    return reward;
  }

  triggerRewardsForShow(showId: string, userId: string, trigger: RewardTrigger): SponsorReward[] {
    const campaigns = this.getActiveCampaigns(showId);
    const rewards: SponsorReward[] = [];
    for (const c of campaigns) {
      const reward = this.triggerReward(c.id, userId, trigger);
      if (reward) rewards.push(reward);
    }
    return rewards;
  }

  markPaid(rewardId: string): void {
    for (const rewards of this._rewards.values()) {
      const r = rewards.find((r) => r.id === rewardId);
      if (r) { r.paid = true; return; }
    }
  }

  // ── User rewards ───────────────────────────────────────────────────────────

  getUserRewards(userId: string): SponsorReward[] {
    return this._userRewards.get(userId) ?? [];
  }

  getUserUnpaidTotal(userId: string): { cents: number; tmicoins: number } {
    const unpaid = (this._userRewards.get(userId) ?? []).filter((r) => !r.paid);
    return {
      cents: unpaid.reduce((s, r) => s + r.amountCents, 0),
      tmicoins: unpaid.reduce((s, r) => s + r.tmicoinBonus, 0),
    };
  }

  getCampaignStats(campaignId: string): { impressions: number; clicks: number; ctr: number; rewardsDistributed: number; poolRemainingCents: number } | null {
    const c = this._campaigns.get(campaignId);
    if (!c) return null;
    return {
      impressions: c.impressions,
      clicks: c.clicks,
      ctr: c.impressions > 0 ? Math.round((c.clicks / c.impressions) * 100) : 0,
      rewardsDistributed: c.rewardsDistributed,
      poolRemainingCents: c.rewardPoolCents,
    };
  }

  onReward(cb: (reward: SponsorReward) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }
}

export const sponsorRewardEngine = SponsorRewardEngine.getInstance();

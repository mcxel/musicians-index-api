/**
 * SeasonPassEngine
 * Season pass tiers, progress tracking, reward gates.
 */
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

export type SeasonPassTier =
  | "FREE"
  | "FAN_PASS"
  | "PERFORMER_PASS"
  | "VIP_PASS"
  | "LEGEND_PASS";

export type SeasonPassReward = {
  id: string;
  title: string;
  description: string;
  requiredTier: SeasonPassTier;
  xpThreshold: number;
  type: "exclusive_emote" | "avatar_skin" | "nft_drop" | "store_credit" | "vip_access" | "badge";
  claimable: boolean;
};

export type UserSeasonPass = {
  userId: string;
  tier: SeasonPassTier;
  seasonId: string;
  xpEarned: number;
  xpGoal: number;
  claimedRewardIds: string[];
  activatedAtMs: number;
  expiresAtMs: number;
};

const SEASON_PASS_REWARDS: SeasonPassReward[] = [
  { id: "sp-emote-1", title: "Crown Wave Emote", description: "Exclusive animated crown wave", requiredTier: "FAN_PASS", xpThreshold: 500, type: "exclusive_emote", claimable: true },
  { id: "sp-avatar-1", title: "Gold VIP Skin", description: "Gold avatar skin for the season", requiredTier: "VIP_PASS", xpThreshold: 1000, type: "avatar_skin", claimable: true },
  { id: "sp-nft-1", title: "Season NFT Badge", description: "Unique NFT for this season's passholders", requiredTier: "PERFORMER_PASS", xpThreshold: 2000, type: "nft_drop", claimable: true },
  { id: "sp-credit-1", title: "$10 TMI Store Credit", description: "Spend anywhere in the TMI store", requiredTier: "FAN_PASS", xpThreshold: 1500, type: "store_credit", claimable: true },
  { id: "sp-vip-backstage", title: "Backstage VIP Access", description: "One backstage pass for any event", requiredTier: "VIP_PASS", xpThreshold: 3000, type: "vip_access", claimable: true },
  { id: "sp-legend-badge", title: "Legend Badge", description: "Exclusive Legend tier profile badge", requiredTier: "LEGEND_PASS", xpThreshold: 5000, type: "badge", claimable: true },
  { id: "sp-credit-2", title: "$25 TMI Store Credit", description: "Bonus credit for Legend passholders", requiredTier: "LEGEND_PASS", xpThreshold: 7500, type: "store_credit", claimable: true },
];

const TIER_XP_GOALS: Record<SeasonPassTier, number> = {
  FREE: 2000,
  FAN_PASS: 5000,
  PERFORMER_PASS: 8000,
  VIP_PASS: 12000,
  LEGEND_PASS: 20000,
};

export class SeasonPassEngine {
  private readonly passes: Map<string, UserSeasonPass> = new Map();

  activatePass(userId: string, tier: SeasonPassTier, seasonId: string): UserSeasonPass {
    const existing = this.passes.get(userId);
    const pass: UserSeasonPass = {
      userId,
      tier,
      seasonId,
      xpEarned: existing?.xpEarned ?? 0,
      xpGoal: TIER_XP_GOALS[tier],
      claimedRewardIds: existing?.claimedRewardIds ?? [],
      activatedAtMs: Date.now(),
      expiresAtMs: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    this.passes.set(userId, pass);
    return pass;
  }

  addXP(userId: string, xp: number): void {
    const pass = this.passes.get(userId);
    if (!pass) return;
    pass.xpEarned = Math.min(pass.xpEarned + xp, pass.xpGoal * 2); // cap at 2x goal
    Analytics.xp({ userId, delta: xp, source: 'season-pass' });
  }

  getProgress(userId: string): { pct: number; xpEarned: number; xpGoal: number } {
    const pass = this.passes.get(userId);
    if (!pass) return { pct: 0, xpEarned: 0, xpGoal: 0 };
    const pct = Math.min(100, Math.round((pass.xpEarned / pass.xpGoal) * 100));
    return { pct, xpEarned: pass.xpEarned, xpGoal: pass.xpGoal };
  }

  getUnlockableRewards(userId: string): SeasonPassReward[] {
    const pass = this.passes.get(userId);
    if (!pass) return [];

    const tierOrder: SeasonPassTier[] = ["FREE", "FAN_PASS", "PERFORMER_PASS", "VIP_PASS", "LEGEND_PASS"];
    const userTierIdx = tierOrder.indexOf(pass.tier);

    return SEASON_PASS_REWARDS.filter((r) => {
      const rewardTierIdx = tierOrder.indexOf(r.requiredTier);
      return rewardTierIdx <= userTierIdx && pass.xpEarned >= r.xpThreshold;
    });
  }

  getClaimableRewards(userId: string): SeasonPassReward[] {
    const pass = this.passes.get(userId);
    if (!pass) return [];
    return this.getUnlockableRewards(userId).filter(
      (r) => !pass.claimedRewardIds.includes(r.id) && r.claimable,
    );
  }

  claimReward(userId: string, rewardId: string): boolean {
    const pass = this.passes.get(userId);
    if (!pass) return false;
    if (pass.claimedRewardIds.includes(rewardId)) return false;

    const claimable = this.getClaimableRewards(userId);
    if (!claimable.find((r) => r.id === rewardId)) return false;

    pass.claimedRewardIds.push(rewardId);
    return true;
  }

  getPass(userId: string): UserSeasonPass | null {
    return this.passes.get(userId) ?? null;
  }

  isActive(userId: string): boolean {
    const pass = this.passes.get(userId);
    if (!pass) return false;
    return Date.now() < pass.expiresAtMs;
  }

  getAllRewards(): SeasonPassReward[] {
    return [...SEASON_PASS_REWARDS];
  }

  getTierXPGoal(tier: SeasonPassTier): number {
    return TIER_XP_GOALS[tier];
  }
}

export const seasonPassEngine = new SeasonPassEngine();

/**
 * RewardsPipelineEngine
 * Dispatches rewards on achievement unlocks, show wins, and milestones.
 */
import type { AchievementUnlockEvent } from "./AchievementEngine";

export type RewardType =
  | "xp"
  | "store_credit"
  | "nft_drop"
  | "exclusive_emote"
  | "avatar_skin"
  | "badge"
  | "season_pass_xp"
  | "physical_prize"
  | "custom";

export type RewardGrant = {
  grantId: string;
  userId: string;
  rewardType: RewardType;
  amount: number;
  label: string;
  description?: string;
  sourceId: string;
  sourceType: "achievement" | "show_win" | "season_milestone" | "manual" | "giveaway";
  grantedAtMs: number;
  claimed: boolean;
  claimedAtMs: number | null;
};

let _grantSeq = 0;

export class RewardsPipelineEngine {
  private readonly grants: Map<string, RewardGrant[]> = new Map();
  private readonly listeners: Array<(grant: RewardGrant) => void> = [];

  onGrant(listener: (grant: RewardGrant) => void): void {
    this.listeners.push(listener);
  }

  private emit(grant: RewardGrant): void {
    for (const l of this.listeners) l(grant);
  }

  private issue(
    userId: string,
    rewardType: RewardType,
    amount: number,
    label: string,
    sourceId: string,
    sourceType: RewardGrant["sourceType"],
    description?: string,
  ): RewardGrant {
    const grant: RewardGrant = {
      grantId: `grant-${Date.now()}-${++_grantSeq}`,
      userId,
      rewardType,
      amount,
      label,
      description,
      sourceId,
      sourceType,
      grantedAtMs: Date.now(),
      claimed: false,
      claimedAtMs: null,
    };

    const existing = this.grants.get(userId) ?? [];
    existing.push(grant);
    this.grants.set(userId, existing);
    this.emit(grant);
    return grant;
  }

  handleAchievementUnlock(event: AchievementUnlockEvent): RewardGrant {
    return this.issue(
      event.userId,
      "xp",
      event.xpAwarded,
      `Achievement Unlocked: ${event.achievement.title}`,
      event.achievement.id,
      "achievement",
      event.achievement.description,
    );
  }

  handleShowWin(userId: string, showId: string, prizeName: string, prizeType: RewardType, value: number): RewardGrant {
    return this.issue(userId, prizeType, value, `Show Win Prize: ${prizeName}`, showId, "show_win", prizeName);
  }

  handleSeasonMilestone(userId: string, milestoneId: string, label: string, xp: number): RewardGrant {
    return this.issue(userId, "season_pass_xp", xp, label, milestoneId, "season_milestone");
  }

  grantManual(userId: string, rewardType: RewardType, amount: number, label: string, sourceId: string = "admin"): RewardGrant {
    return this.issue(userId, rewardType, amount, label, sourceId, "manual");
  }

  grantGiveaway(userId: string, giveawayId: string, label: string, rewardType: RewardType, amount: number): RewardGrant {
    return this.issue(userId, rewardType, amount, label, giveawayId, "giveaway");
  }

  claim(userId: string, grantId: string): boolean {
    const userGrants = this.grants.get(userId);
    if (!userGrants) return false;
    const grant = userGrants.find((g) => g.grantId === grantId);
    if (!grant || grant.claimed) return false;
    grant.claimed = true;
    grant.claimedAtMs = Date.now();
    return true;
  }

  getUnclaimed(userId: string): RewardGrant[] {
    return (this.grants.get(userId) ?? []).filter((g) => !g.claimed);
  }

  getAll(userId: string): RewardGrant[] {
    return [...(this.grants.get(userId) ?? [])];
  }

  getTotalXP(userId: string): number {
    return (this.grants.get(userId) ?? [])
      .filter((g) => g.rewardType === "xp" || g.rewardType === "season_pass_xp")
      .reduce((sum, g) => sum + g.amount, 0);
  }
}

export const rewardsPipelineEngine = new RewardsPipelineEngine();

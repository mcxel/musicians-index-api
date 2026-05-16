/**
 * FanRewardActivationEngine
 * Reward activation for onboarding and engagement milestones.
 */

import { grantInviteReward } from "./FanInviteEngine";

export type FanRewardType =
  | "signup-reward"
  | "article-reward"
  | "vote-reward"
  | "event-attendance-reward"
  | "referral-reward";

export type FanRewardActivation = {
  rewardActivationId: string;
  fanId: string;
  rewardType: FanRewardType;
  amount: number;
  currency: "points";
  activatedAtMs: number;
  metadata?: Record<string, string | number | boolean>;
};

const activations: FanRewardActivation[] = [];
let rewardActivationCounter = 0;

function activateReward(input: {
  fanId: string;
  rewardType: FanRewardType;
  amount: number;
  metadata?: Record<string, string | number | boolean>;
}): FanRewardActivation {
  const reward: FanRewardActivation = {
    rewardActivationId: `fan-reward-${++rewardActivationCounter}`,
    fanId: input.fanId,
    rewardType: input.rewardType,
    amount: Math.max(0, Math.floor(input.amount)),
    currency: "points",
    activatedAtMs: Date.now(),
    metadata: input.metadata,
  };

  activations.unshift(reward);
  return reward;
}

export function activateSignupReward(fanId: string): FanRewardActivation {
  return activateReward({ fanId, rewardType: "signup-reward", amount: 250 });
}

export function activateArticleReward(fanId: string, articleId: string): FanRewardActivation {
  return activateReward({
    fanId,
    rewardType: "article-reward",
    amount: 60,
    metadata: { articleId },
  });
}

export function activateVoteReward(fanId: string, voteId: string): FanRewardActivation {
  return activateReward({
    fanId,
    rewardType: "vote-reward",
    amount: 80,
    metadata: { voteId },
  });
}

export function activateEventAttendanceReward(fanId: string, eventId: string): FanRewardActivation {
  return activateReward({
    fanId,
    rewardType: "event-attendance-reward",
    amount: 120,
    metadata: { eventId },
  });
}

export function activateReferralReward(input: {
  fanId: string;
  inviteCode?: string;
  referredFanId?: string;
}): FanRewardActivation {
  const reward = activateReward({
    fanId: input.fanId,
    rewardType: "referral-reward",
    amount: 300,
    metadata: {
      ...(input.inviteCode ? { inviteCode: input.inviteCode } : {}),
      ...(input.referredFanId ? { referredFanId: input.referredFanId } : {}),
    },
  });

  if (input.inviteCode) {
    grantInviteReward({
      inviteCode: input.inviteCode,
      rewardType: "referral-reward",
      amount: reward.amount,
    });
  }

  return reward;
}

export function listFanRewards(fanId?: string): FanRewardActivation[] {
  if (!fanId) return [...activations];
  return activations.filter((activation) => activation.fanId === fanId);
}

export function getFanRewardBalance(fanId: string): number {
  return listFanRewards(fanId).reduce((sum, reward) => sum + reward.amount, 0);
}

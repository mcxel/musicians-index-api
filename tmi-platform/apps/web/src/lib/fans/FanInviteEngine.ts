/**
 * FanInviteEngine
 * Invite links, rewards, and invite tracking.
 */

import { getFanLead, updateFanLeadState } from "./FanLeadEngine";

export type FanInviteRewardType =
  | "signup-reward"
  | "article-reward"
  | "vote-reward"
  | "event-attendance-reward"
  | "referral-reward";

export type FanInviteReward = {
  rewardId: string;
  inviteCode: string;
  rewardType: FanInviteRewardType;
  amount: number;
  currency: "points";
  grantedAtMs: number;
};

export type FanInviteRecord = {
  inviteCode: string;
  inviteLink: string;
  inviterFanId: string;
  leadId: string;
  createdAtMs: number;
  acceptedByFanId?: string;
  acceptedAtMs?: number;
  rewards: FanInviteReward[];
};

const invites = new Map<string, FanInviteRecord>();
let inviteCounter = 0;
let rewardCounter = 0;

export function createFanInvite(input: {
  inviterFanId: string;
  leadId: string;
}): FanInviteRecord {
  const lead = getFanLead(input.leadId);
  if (!lead) throw new Error(`Fan lead ${input.leadId} not found`);

  const inviteCode = `fan-invite-${++inviteCounter}`;
  const record: FanInviteRecord = {
    inviteCode,
    inviteLink: `/invite/fan/${encodeURIComponent(inviteCode)}`,
    inviterFanId: input.inviterFanId,
    leadId: input.leadId,
    createdAtMs: Date.now(),
    rewards: [],
  };

  invites.set(inviteCode, record);
  updateFanLeadState(input.leadId, "invited");
  return record;
}

export function acceptFanInvite(input: {
  inviteCode: string;
  fanId: string;
}): FanInviteRecord {
  const invite = invites.get(input.inviteCode);
  if (!invite) throw new Error(`Fan invite ${input.inviteCode} not found`);

  const updated: FanInviteRecord = {
    ...invite,
    acceptedByFanId: input.fanId,
    acceptedAtMs: Date.now(),
  };

  invites.set(updated.inviteCode, updated);
  return updated;
}

export function grantInviteReward(input: {
  inviteCode: string;
  rewardType: FanInviteRewardType;
  amount: number;
}): FanInviteReward {
  const invite = invites.get(input.inviteCode);
  if (!invite) throw new Error(`Fan invite ${input.inviteCode} not found`);

  const reward: FanInviteReward = {
    rewardId: `fan-invite-reward-${++rewardCounter}`,
    inviteCode: input.inviteCode,
    rewardType: input.rewardType,
    amount: Math.max(0, Math.floor(input.amount)),
    currency: "points",
    grantedAtMs: Date.now(),
  };

  invite.rewards.unshift(reward);
  return reward;
}

export function getFanInvite(inviteCode: string): FanInviteRecord | null {
  return invites.get(inviteCode) ?? null;
}

export function listFanInvites(inviterFanId?: string): FanInviteRecord[] {
  const values = [...invites.values()];
  if (!inviterFanId) return values.sort((a, b) => b.createdAtMs - a.createdAtMs);
  return values
    .filter((invite) => invite.inviterFanId === inviterFanId)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function getInviteTrackingSummary(): {
  totalInvites: number;
  acceptedInvites: number;
  totalRewardsGranted: number;
} {
  const records = [...invites.values()];
  const acceptedInvites = records.filter((invite) => !!invite.acceptedByFanId).length;
  const totalRewardsGranted = records.reduce((sum, invite) => {
    return sum + invite.rewards.reduce((rewardSum, reward) => rewardSum + reward.amount, 0);
  }, 0);

  return {
    totalInvites: records.length,
    acceptedInvites,
    totalRewardsGranted,
  };
}

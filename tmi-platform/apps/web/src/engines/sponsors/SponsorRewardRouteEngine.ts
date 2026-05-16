// SponsorRewardRouteEngine
// Ownership chain: sponsor prize → battle/cypher winner → claim → inventory → profile

export type RewardStatus = "unclaimed" | "claimed" | "delivered" | "expired";
export type RewardCategory = "cash" | "nft" | "ticket" | "feature_slot" | "merch" | "studio_session" | "venue_booking" | "badge";

export type SponsorReward = {
  rewardId: string;
  sponsorId: string;
  sponsorName: string;
  eventId: string;
  eventType: "battle" | "cypher" | "contest";
  winnerId: string;
  winnerName: string;
  category: RewardCategory;
  label: string;
  valueUsd: number;
  status: RewardStatus;
  awardedAt: number;
  claimedAt?: number;
  deliveredAt?: number;
  expiresAt: number;
  metadata: Record<string, string>;
};

export type ClaimResult =
  | { ok: true; reward: SponsorReward; downstreamAction: string }
  | { ok: false; reason: string };

const _rewards: SponsorReward[] = [];
let _counter = 0;

// ── Award ─────────────────────────────────────────────────────────────────────

export function awardSponsorReward(opts: {
  sponsorId: string;
  sponsorName: string;
  eventId: string;
  eventType: SponsorReward["eventType"];
  winnerId: string;
  winnerName: string;
  category: RewardCategory;
  label: string;
  valueUsd: number;
  metadata?: Record<string, string>;
}): SponsorReward {
  const reward: SponsorReward = {
    rewardId: `srr-${++_counter}`,
    sponsorId: opts.sponsorId,
    sponsorName: opts.sponsorName,
    eventId: opts.eventId,
    eventType: opts.eventType,
    winnerId: opts.winnerId,
    winnerName: opts.winnerName,
    category: opts.category,
    label: opts.label,
    valueUsd: opts.valueUsd,
    status: "unclaimed",
    awardedAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,  // 30 days
    metadata: opts.metadata ?? {},
  };
  _rewards.push(reward);
  return reward;
}

// ── Claim ─────────────────────────────────────────────────────────────────────

export function claimReward(rewardId: string, claimingUserId: string): ClaimResult {
  const reward = _rewards.find((r) => r.rewardId === rewardId);
  if (!reward) return { ok: false, reason: "Reward not found" };
  if (reward.winnerId !== claimingUserId) return { ok: false, reason: "Not the winner" };
  if (reward.status !== "unclaimed") return { ok: false, reason: `Already ${reward.status}` };
  if (Date.now() > reward.expiresAt) {
    reward.status = "expired";
    return { ok: false, reason: "Reward expired" };
  }
  reward.status = "claimed";
  reward.claimedAt = Date.now();

  const downstreamAction = resolveDownstream(reward);
  return { ok: true, reward, downstreamAction };
}

function resolveDownstream(reward: SponsorReward): string {
  switch (reward.category) {
    case "nft":            return `mint_nft:${reward.rewardId}`;
    case "ticket":         return `issue_ticket:${reward.eventId}`;
    case "feature_slot":   return `activate_feature_slot:${reward.winnerId}`;
    case "venue_booking":  return `open_booking:${reward.winnerId}`;
    case "studio_session": return `schedule_session:${reward.winnerId}`;
    case "cash":           return `queue_payout:${reward.valueUsd}usd:${reward.winnerId}`;
    case "merch":          return `ship_merch:${reward.rewardId}`;
    case "badge":          return `grant_badge:${reward.label}:${reward.winnerId}`;
    default:               return `manual_fulfillment:${reward.rewardId}`;
  }
}

// ── Mark delivered ────────────────────────────────────────────────────────────

export function markDelivered(rewardId: string): boolean {
  const reward = _rewards.find((r) => r.rewardId === rewardId);
  if (!reward || reward.status !== "claimed") return false;
  reward.status = "delivered";
  reward.deliveredAt = Date.now();
  return true;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getRewardsForWinner(winnerId: string): SponsorReward[] {
  return _rewards.filter((r) => r.winnerId === winnerId);
}

export function getUnclaimedForWinner(winnerId: string): SponsorReward[] {
  return _rewards.filter((r) => r.winnerId === winnerId && r.status === "unclaimed");
}

export function getPendingDelivery(): SponsorReward[] {
  return _rewards.filter((r) => r.status === "claimed");
}

export function getSponsorOwnershipSummary(sponsorId: string): {
  totalAwarded: number;
  totalClaimed: number;
  totalDelivered: number;
  totalValueUsd: number;
} {
  const own = _rewards.filter((r) => r.sponsorId === sponsorId);
  return {
    totalAwarded: own.length,
    totalClaimed: own.filter((r) => r.status !== "unclaimed").length,
    totalDelivered: own.filter((r) => r.status === "delivered").length,
    totalValueUsd: own.reduce((s, r) => s + r.valueUsd, 0),
  };
}

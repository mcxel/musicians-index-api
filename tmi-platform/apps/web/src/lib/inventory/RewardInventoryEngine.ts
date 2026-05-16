import { PrizeType } from "@/lib/prizes/PrizeDropEngine";

export type RewardType =
  | "merch"
  | "nft"
  | "sponsor_gift"
  | "ticket"
  | "season_reward"
  | "exclusive_item"
  | "cash"
  | "xp_bonus";

export type RewardStatus =
  | "available"
  | "reserved"
  | "claimed"
  | "expired"
  | "distributed";

export type RewardSource =
  | "sponsor_prize"
  | "pass_reward"
  | "nft_drop"
  | "merch_drop"
  | "ticket_grant"
  | "xp_bonus"
  | "contest_win"
  | "battle_win"
  | "cypher_spotlight";

export interface RewardEntry {
  id: string;
  userId: string;
  rewardType: RewardType;
  source: RewardSource;
  prizeType: PrizeType;
  label: string;
  value: string;
  numericValue?: number;
  sponsorId?: string;
  contestId?: string;
  prizeId?: string;
  claimHref?: string;
  status: RewardStatus;
  grantedAt: Date;
  reservedAt?: Date;
  claimedAt?: Date;
  distributedAt?: Date;
  expiresAt?: Date;
  fulfillmentRef?: string;
}

export interface RewardInventorySummary {
  userId: string;
  totalRewards: number;
  availableCount: number;
  reservedCount: number;
  claimedCount: number;
  expiredCount: number;
  distributedCount: number;
  totalCashValue: number;
  entries: RewardEntry[];
}

// ── In-memory store ───────────────────────────────────────────────────────────

const _inventory: Map<string, RewardEntry[]> = new Map();
let _counter = 1;

function generateId(): string {
  return `reward_${Date.now()}_${_counter++}`;
}

function mutate(userId: string, rewardId: string, patch: Partial<RewardEntry>): RewardEntry | null {
  const entries = _inventory.get(userId);
  if (!entries) return null;
  const idx = entries.findIndex((e) => e.id === rewardId);
  if (idx === -1) return null;
  const updated = { ...entries[idx]!, ...patch };
  entries[idx] = updated;
  return updated;
}

// ── Core API ──────────────────────────────────────────────────────────────────

export function grantReward(
  entry: Omit<RewardEntry, "id" | "grantedAt" | "status">
): RewardEntry {
  const reward: RewardEntry = {
    ...entry,
    id: generateId(),
    status: "available",
    grantedAt: new Date(),
  };
  const existing = _inventory.get(entry.userId) ?? [];
  _inventory.set(entry.userId, [...existing, reward]);
  return reward;
}

export function reserveReward(userId: string, rewardId: string): RewardEntry | null {
  const entry = _inventory.get(userId)?.find((e) => e.id === rewardId);
  if (!entry || entry.status !== "available") return null;
  return mutate(userId, rewardId, { status: "reserved", reservedAt: new Date() });
}

export function claimReward(userId: string, rewardId: string): RewardEntry | null {
  const entry = _inventory.get(userId)?.find((e) => e.id === rewardId);
  if (!entry) return null;
  if (entry.status !== "available" && entry.status !== "reserved") return null;
  return mutate(userId, rewardId, { status: "claimed", claimedAt: new Date() });
}

export function distributeReward(
  userId: string,
  rewardId: string,
  fulfillmentRef?: string
): RewardEntry | null {
  const entry = _inventory.get(userId)?.find((e) => e.id === rewardId);
  if (!entry || entry.status !== "claimed") return null;
  return mutate(userId, rewardId, {
    status: "distributed",
    distributedAt: new Date(),
    fulfillmentRef,
  });
}

export function expireReward(userId: string, rewardId: string): RewardEntry | null {
  const entry = _inventory.get(userId)?.find((e) => e.id === rewardId);
  if (!entry || entry.status === "claimed" || entry.status === "distributed") return null;
  return mutate(userId, rewardId, { status: "expired" });
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getInventory(userId: string): RewardEntry[] {
  return _inventory.get(userId) ?? [];
}

export function getAvailableRewards(userId: string): RewardEntry[] {
  return getInventory(userId).filter((e) => e.status === "available");
}

export function getRewardsByType(userId: string, rewardType: RewardType): RewardEntry[] {
  return getInventory(userId).filter((e) => e.rewardType === rewardType);
}

export function getRewardsBySource(userId: string, source: RewardSource): RewardEntry[] {
  return getInventory(userId).filter((e) => e.source === source);
}

export function getRewardById(userId: string, rewardId: string): RewardEntry | undefined {
  return getInventory(userId).find((e) => e.id === rewardId);
}

export function getSummary(userId: string): RewardInventorySummary {
  const entries = getInventory(userId);
  const totalCashValue = entries
    .filter((e) => e.prizeType === "cash" && e.status !== "expired")
    .reduce((sum, e) => sum + (e.numericValue ?? 0), 0);

  return {
    userId,
    totalRewards: entries.length,
    availableCount:  entries.filter((e) => e.status === "available").length,
    reservedCount:   entries.filter((e) => e.status === "reserved").length,
    claimedCount:    entries.filter((e) => e.status === "claimed").length,
    expiredCount:    entries.filter((e) => e.status === "expired").length,
    distributedCount:entries.filter((e) => e.status === "distributed").length,
    totalCashValue,
    entries,
  };
}

// ── Sweep ─────────────────────────────────────────────────────────────────────

export function sweepExpired(): number {
  const now = new Date();
  let swept = 0;
  for (const [userId, entries] of _inventory.entries()) {
    const updated = entries.map((e) => {
      if (
        (e.status === "available" || e.status === "reserved") &&
        e.expiresAt &&
        e.expiresAt < now
      ) {
        swept++;
        return { ...e, status: "expired" as RewardStatus };
      }
      return e;
    });
    _inventory.set(userId, updated);
  }
  return swept;
}

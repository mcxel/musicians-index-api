/**
 * PointsEngine.ts
 * Purpose: Single source of truth for all points math, earning, spending, and anti-inflation.
 * Placement: packages/engines/src/PointsEngine.ts
 *            Import via @tmi/engines/PointsEngine
 * Depends on: TierEngine (for caps/rates)
 */

import { Tier, getPointsConfig, TIER_POINTS_CONFIG } from './TierEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PointsEarnReason =
  | 'WATCH_LIVE'           // watching live event
  | 'VOTE'                 // casting a vote
  | 'EVENT_ATTENDANCE'     // attending an event
  | 'DAILY_LOGIN'          // daily login bonus
  | 'REFERRAL'             // referring a new user
  | 'MILESTONE_REWARD'     // achievement milestones
  | 'SPONSOR_INTERACTION'  // engaging with sponsor content
  | 'GAME_WIN'             // winning a game
  | 'ARTICLE_READ'         // reading a magazine article
  | 'EMOTE_SEND';          // sending an emote in live

export type PointsSpendReason =
  | 'EVENT_SUBMISSION'     // artist submits to promoted event
  | 'PURCHASE_EMOTE'       // buy emote from inventory
  | 'PURCHASE_ICON'        // buy icon
  | 'PURCHASE_COSMETIC'    // buy cosmetic item
  | 'TIP_ARTIST'           // tip an artist directly
  | 'BOOST_POST'           // boost a magazine post
  | 'PREMIUM_VOTE'         // cast a premium/weighted vote
  | 'BATTLE_ENTRY';        // pay to enter a battle

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;           // positive = earn, negative = spend
  reason: PointsEarnReason | PointsSpendReason;
  referenceId?: string;     // event ID, item ID, etc.
  timestamp: Date;
  balanceAfter: number;
  tier: Tier;
}

export interface PointsLedger {
  userId: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  todayEarned: number;
  lastEarnDate: string;     // YYYY-MM-DD UTC
  transactions: PointsTransaction[];
}

// ─── Earn Rate Table ──────────────────────────────────────────────────────────

export const EARN_RATES: Record<PointsEarnReason, number> = {
  WATCH_LIVE:          1,    // per minute (multiplied by tier watchEarnPerMinute)
  VOTE:                1,    // per vote (multiplied by tier votingEarnPerVote)
  EVENT_ATTENDANCE:    1,    // flat (multiplied by tier eventAttendanceBonus)
  DAILY_LOGIN:         10,
  REFERRAL:            250,
  MILESTONE_REWARD:    100,
  SPONSOR_INTERACTION: 5,
  GAME_WIN:            50,
  ARTICLE_READ:        3,
  EMOTE_SEND:          0.5,
};

// ─── Spend Cost Table ─────────────────────────────────────────────────────────

export const SPEND_COSTS: Record<PointsSpendReason, number> = {
  EVENT_SUBMISSION:  100,  // base; scaled by TierEngine submissionCostBase
  PURCHASE_EMOTE:    50,
  PURCHASE_ICON:     25,
  PURCHASE_COSMETIC: 75,
  TIP_ARTIST:        0,    // variable amount
  BOOST_POST:        200,
  PREMIUM_VOTE:      20,
  BATTLE_ENTRY:      150,
};

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Calculate points earned for a given action */
export function calculateEarnings(
  reason: PointsEarnReason,
  tier: Tier,
  quantity: number = 1,
): number {
  const config = getPointsConfig(tier);
  const baseRate = EARN_RATES[reason];

  let multiplier = 1;
  if (reason === 'WATCH_LIVE')        multiplier = config.watchEarnPerMinute;
  else if (reason === 'VOTE')         multiplier = config.votingEarnPerVote;
  else if (reason === 'EVENT_ATTENDANCE') multiplier = config.eventAttendanceBonus;

  return Math.floor(baseRate * multiplier * quantity);
}

/** Calculate points cost for a spend action */
export function calculateSpendCost(
  reason: PointsSpendReason,
  tier: Tier,
  customAmount?: number,
): number {
  if (reason === 'TIP_ARTIST' && customAmount) return customAmount;
  const config = getPointsConfig(tier);
  if (reason === 'EVENT_SUBMISSION') {
    return Math.ceil(config.submissionCostBase * config.submissionCostMultiplier);
  }
  return SPEND_COSTS[reason];
}

/** Check if earning would exceed daily cap. Returns capped amount. */
export function applyCap(
  amount: number,
  tier: Tier,
  todayEarned: number,
): { allowed: number; cappedAt: boolean } {
  const cap = getPointsConfig(tier).dailyEarnCap;
  const remaining = Math.max(0, cap - todayEarned);
  const allowed = Math.min(amount, remaining);
  return { allowed, cappedAt: allowed < amount };
}

/** Process an earn transaction (returns new ledger state, does NOT mutate DB) */
export function processEarn(
  ledger: PointsLedger,
  reason: PointsEarnReason,
  tier: Tier,
  quantity: number = 1,
  referenceId?: string,
): { ledger: PointsLedger; transaction: PointsTransaction } {
  const raw = calculateEarnings(reason, tier, quantity);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEarned = ledger.lastEarnDate === todayStr ? ledger.todayEarned : 0;

  const { allowed } = applyCap(raw, tier, todayEarned);

  const tx: PointsTransaction = {
    id: crypto.randomUUID(),
    userId: ledger.userId,
    amount: allowed,
    reason,
    referenceId,
    timestamp: new Date(),
    balanceAfter: ledger.currentBalance + allowed,
    tier,
  };

  const updated: PointsLedger = {
    ...ledger,
    currentBalance: tx.balanceAfter,
    lifetimeEarned: ledger.lifetimeEarned + allowed,
    todayEarned: todayEarned + allowed,
    lastEarnDate: todayStr,
    transactions: [tx, ...ledger.transactions],
  };

  return { ledger: updated, transaction: tx };
}

/** Process a spend transaction */
export function processSpend(
  ledger: PointsLedger,
  reason: PointsSpendReason,
  tier: Tier,
  customAmount?: number,
  referenceId?: string,
): { ledger: PointsLedger; transaction: PointsTransaction } | { error: string } {
  const cost = calculateSpendCost(reason, tier, customAmount);
  if (ledger.currentBalance < cost) {
    return { error: `Insufficient points. Need ${cost}, have ${ledger.currentBalance}` };
  }

  const tx: PointsTransaction = {
    id: crypto.randomUUID(),
    userId: ledger.userId,
    amount: -cost,
    reason,
    referenceId,
    timestamp: new Date(),
    balanceAfter: ledger.currentBalance - cost,
    tier,
  };

  const updated: PointsLedger = {
    ...ledger,
    currentBalance: tx.balanceAfter,
    lifetimeSpent: ledger.lifetimeSpent + cost,
    transactions: [tx, ...ledger.transactions],
  };

  return { ledger: updated, transaction: tx };
}

/** Estimate inflation risk: returns score 0–100 */
export function inflationRisk(totalPointsInCirculation: number, totalUsers: number): number {
  if (totalUsers === 0) return 0;
  const avgPerUser = totalPointsInCirculation / totalUsers;
  // Risk score increases as avg balance grows beyond 10k per user
  return Math.min(100, Math.floor((avgPerUser / 10_000) * 100));
}

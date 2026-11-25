/**
 * Two-sided Heart/Fire participation XP policy (owner-approved values).
 *
 * Owner approved 2026-11-17 for LOCAL / ISOLATED testing only:
 *   Heart +1 · Fire +2 · 20/hr · 100/day · 2s throttle · 1 reward/target/24h
 *   Creator: 10 Hearts = 1 pt · 1 Fire = 2 pts · 1 pt = 1 XP
 *
 * Production rewards stay OFF until durable PostgreSQL ledger is certified
 * AND TMI_HEART_FIRE_PRODUCTION_REWARDS=1 is explicitly set.
 */

export type HeartFireKind = "heart" | "fire";

export type HeartFireXpPolicy = {
  fanHeartXp: number;
  fanFireXp: number;
  heartsPerCreatorPoint: number;
  fireCreatorPoints: number;
  creatorPointToXp: number | null;
  hourlyXpCap: number;
  hourlyCapWindowMs: number;
  dailyXpCap: number;
  dailyCapWindowMs: number;
  perTargetRewardWindowMs: number;
  actionThrottleMs: number;
  /**
   * Static preferred switch — runtime uses isHeartFireRewardsActivated()
   * which also enforces the production durable-ledger gate.
   */
  rewardsActivated: boolean;
  policyStatus: "OWNER_PROVISIONAL" | "OWNER_APPROVED";
  creatorConversionStatus: "OWNER_UNRESOLVED" | "OWNER_PROVISIONAL" | "OWNER_APPROVED";
  durableLedgerStatus: "BLOCKED_PENDING_AG_MERGE" | "ACTIVE";
};

export const HEART_FIRE_XP_POLICY: HeartFireXpPolicy = {
  fanHeartXp: 1,
  fanFireXp: 2,
  heartsPerCreatorPoint: 10,
  fireCreatorPoints: 2,
  creatorPointToXp: 1,
  hourlyXpCap: 20,
  hourlyCapWindowMs: 60 * 60 * 1000,
  dailyXpCap: 100,
  dailyCapWindowMs: 24 * 60 * 60 * 1000,
  perTargetRewardWindowMs: 24 * 60 * 60 * 1000,
  actionThrottleMs: 2000,
  rewardsActivated: true, // preferred for local — runtime gate still blocks production
  policyStatus: "OWNER_APPROVED",
  creatorConversionStatus: "OWNER_APPROVED",
  durableLedgerStatus: "BLOCKED_PENDING_AG_MERGE",
};

/**
 * Local/isolated: owner-approved values may award XP in memory.
 * Production: blocked until durable ledger ACTIVE + explicit env opt-in.
 * Set TMI_HEART_FIRE_LOCAL_REWARDS=0 to disable even locally.
 */
export function isHeartFireRewardsActivated(): boolean {
  if (process.env.TMI_HEART_FIRE_LOCAL_REWARDS === "0") return false;

  if (HEART_FIRE_XP_POLICY.durableLedgerStatus !== "ACTIVE") {
    if (process.env.NODE_ENV === "production") return false;
    return HEART_FIRE_XP_POLICY.policyStatus === "OWNER_APPROVED";
  }

  return process.env.TMI_HEART_FIRE_PRODUCTION_REWARDS === "1";
}

export function fanParticipationXpFor(kind: HeartFireKind): number {
  return kind === "heart"
    ? HEART_FIRE_XP_POLICY.fanHeartXp
    : HEART_FIRE_XP_POLICY.fanFireXp;
}

export function creatorRewardPointsForActive(kind: HeartFireKind): number {
  return kind === "heart"
    ? 1 / HEART_FIRE_XP_POLICY.heartsPerCreatorPoint
    : HEART_FIRE_XP_POLICY.fireCreatorPoints;
}

export function creatorXpFromRewardPoints(points: number): number | null {
  if (HEART_FIRE_XP_POLICY.creatorPointToXp == null) return null;
  if (HEART_FIRE_XP_POLICY.creatorConversionStatus === "OWNER_UNRESOLVED") return null;
  return points * HEART_FIRE_XP_POLICY.creatorPointToXp;
}

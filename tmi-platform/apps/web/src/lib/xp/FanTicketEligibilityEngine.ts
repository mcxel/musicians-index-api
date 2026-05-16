/**
 * FanTicketEligibilityEngine.ts
 *
 * Determines fan eligibility for XP ticket purchasing.
 * Checks: XP balance, fraud score, account age, attendance history, verification status.
 * Purpose: Prevent fraud while maintaining open access.
 */

export interface FanTicketEligibility {
  fanId: string;
  xpBalance: number;
  fraudScore: number; // 0-100
  accountAgeSeconds: number;
  totalAttendances: number;
  totalXPSpent: number;
  isVerified: boolean;
  restrictedUntil?: number; // if account under restriction
  eligibilityScore: number; // 0-100
  canBuyXPTickets: boolean;
  canBuyHybridTickets: boolean;
  maxXPTicketsAllowed: number; // limit per period
}

// In-memory registry
const fanEligibilities = new Map<string, FanTicketEligibility>();

/**
 * Evaluates fan eligibility for ticket purchasing.
 */
export function evaluateFanTicketEligibility(input: {
  fanId: string;
  xpBalance: number;
  fraudScore: number; // 0-100
  accountAgeSeconds: number;
  totalAttendances: number;
  totalXPSpent: number;
  isVerified: boolean;
  restrictedUntil?: number;
}): FanTicketEligibility {
  // Calculate eligibility score (0-100)
  let eligibilityScore = 100;

  // Deduct for fraud score (high fraud = low eligibility)
  eligibilityScore -= input.fraudScore * 0.5;

  // Deduct if account is new (< 7 days)
  const sevenDaysSeconds = 7 * 24 * 60 * 60;
  if (input.accountAgeSeconds < sevenDaysSeconds) {
    eligibilityScore -= 30;
  }

  // Add bonus for attendance history
  if (input.totalAttendances >= 10) eligibilityScore += 20;
  else if (input.totalAttendances >= 5) eligibilityScore += 10;

  // Add bonus for prior spending
  if (input.totalXPSpent >= 1000) eligibilityScore += 20;
  else if (input.totalXPSpent >= 500) eligibilityScore += 10;

  // Add bonus for verified account
  if (input.isVerified) eligibilityScore += 15;

  // Cap at 100
  eligibilityScore = Math.min(100, Math.max(0, eligibilityScore));

  // Determine purchase eligibility
  const canBuyXPTickets = eligibilityScore >= 60 && !input.restrictedUntil;
  const canBuyHybridTickets = eligibilityScore >= 40 && !input.restrictedUntil;

  // Max XP tickets per period (lower for new/high-fraud accounts)
  let maxXPTickets = 10; // default
  if (eligibilityScore < 60) maxXPTickets = 3;
  if (eligibilityScore < 40) maxXPTickets = 1;

  const eligibility: FanTicketEligibility = {
    fanId: input.fanId,
    xpBalance: input.xpBalance,
    fraudScore: input.fraudScore,
    accountAgeSeconds: input.accountAgeSeconds,
    totalAttendances: input.totalAttendances,
    totalXPSpent: input.totalXPSpent,
    isVerified: input.isVerified,
    restrictedUntil: input.restrictedUntil,
    eligibilityScore,
    canBuyXPTickets,
    canBuyHybridTickets,
    maxXPTicketsAllowed: maxXPTickets,
  };

  fanEligibilities.set(input.fanId, eligibility);
  return eligibility;
}

/**
 * Gets fan eligibility.
 */
export function getFanTicketEligibility(fanId: string): FanTicketEligibility | null {
  return fanEligibilities.get(fanId) ?? null;
}

/**
 * Restricts account from purchasing (fraud/abuse).
 */
export function restrictFanAccount(fanId: string, restrictUntil: number): void {
  const eligibility = fanEligibilities.get(fanId);
  if (eligibility) {
    eligibility.restrictedUntil = restrictUntil;
    eligibility.canBuyXPTickets = false;
    eligibility.canBuyHybridTickets = false;
  }
}

/**
 * Unrestricts fan account.
 */
export function unrestrictFanAccount(fanId: string): void {
  const eligibility = fanEligibilities.get(fanId);
  if (eligibility) {
    eligibility.restrictedUntil = undefined;
  }
}

/**
 * Verifies fan account (admin action).
 */
export function verifyFanAccount(fanId: string): void {
  const eligibility = fanEligibilities.get(fanId);
  if (eligibility) {
    eligibility.isVerified = true;
    eligibility.eligibilityScore = Math.min(100, eligibility.eligibilityScore + 15);
  }
}

/**
 * Updates fraud score for fan.
 */
export function updateFanFraudScore(fanId: string, newScore: number): void {
  const eligibility = fanEligibilities.get(fanId);
  if (eligibility) {
    eligibility.fraudScore = Math.min(100, Math.max(0, newScore));
    // Re-evaluate eligibility score
    eligibility.eligibilityScore = Math.max(0, 100 - eligibility.fraudScore * 0.5);
  }
}

/**
 * Gets eligibility report (admin).
 */
export function getEligibilityReport(): {
  totalFansEvaluated: number;
  canBuyXPTickets: number;
  canBuyHybridOnly: number;
  restricted: number;
  averageEligibilityScore: number;
} {
  const all = Array.from(fanEligibilities.values());

  const canBuyXP = all.filter((e) => e.canBuyXPTickets).length;
  const canBuyHybrid = all.filter((e) => e.canBuyHybridTickets && !e.canBuyXPTickets).length;
  const restricted = all.filter((e) => e.restrictedUntil && e.restrictedUntil > Date.now()).length;

  const avgScore =
    all.length > 0 ? all.reduce((sum, e) => sum + e.eligibilityScore, 0) / all.length : 0;

  return {
    totalFansEvaluated: all.length,
    canBuyXPTickets: canBuyXP,
    canBuyHybridOnly: canBuyHybrid,
    restricted,
    averageEligibilityScore: Math.round(avgScore),
  };
}

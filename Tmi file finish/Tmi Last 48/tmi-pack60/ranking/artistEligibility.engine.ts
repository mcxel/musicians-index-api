// apps/web/src/engines/ranking/artistEligibility.engine.ts
// Determines which artists qualify for top-10 homepage positions.
// Chain: artist account → genre → XP → achievements → rank score → eligibility

export interface ArtistEligibilityInput {
  artistId: string;
  genre: string;
  weeklyPoints: number;
  totalXP: number;
  prestige: number;         // 0-33 levels
  achievementsUnlocked: number;
  weeklyStreams: number;
  weeklyLiveMinutes: number;
  hasMotionCard: boolean;   // required for homepage display
  hasStationSlug: boolean;  // Platform Law #9 — required
  isProfileComplete: boolean;
  articleCount: number;
  weeklyVotes: number;      // from audience votes
}

export interface EligibilityResult {
  isEligible: boolean;
  score: number;            // 0-10000, higher = better position
  blockers: string[];       // reasons why NOT eligible
  rankScore: number;        // composite score for placement
  eligibleForCrown: boolean;
}

// ── ELIGIBILITY RULES ─────────────────────────────────────────
export function calculateEligibility(input: ArtistEligibilityInput): EligibilityResult {
  const blockers: string[] = [];

  // Hard requirements (must have these)
  if (!input.hasStationSlug) blockers.push("Missing station slug (Platform Law #9)");
  if (!input.isProfileComplete) blockers.push("Profile not complete");
  if (!input.hasMotionCard) blockers.push("No motion card uploaded (required for homepage display)");
  if (input.weeklyPoints < 50) blockers.push("Not enough weekly activity (minimum 50 pts)");

  if (blockers.length > 0) return { isEligible:false, score:0, blockers, rankScore:0, eligibleForCrown:false };

  // ── SCORE CALCULATION ──────────────────────────────────────
  let score = 0;
  score += Math.min(input.weeklyPoints, 500) * 5;          // up to 2500 pts
  score += Math.min(input.weeklyVotes, 1000) * 2;          // up to 2000 pts
  score += Math.min(input.prestige, 33) * 50;               // up to 1650 pts
  score += Math.min(input.weeklyStreams, 100) * 10;          // up to 1000 pts
  score += Math.min(input.weeklyLiveMinutes, 120) * 5;      // up to 600 pts
  score += Math.min(input.achievementsUnlocked, 20) * 15;   // up to 300 pts
  score += Math.min(input.articleCount, 10) * 10;           // up to 100 pts
  score += input.totalXP * 0.1;                             // XP contribution

  const rankScore = Math.round(score);
  const eligibleForCrown = rankScore >= 5000 && input.weeklyVotes >= 100;

  return { isEligible: true, score, blockers:[], rankScore, eligibleForCrown };
}

// ── XP THRESHOLDS PER PRESTIGE LEVEL ─────────────────────────
export const PRESTIGE_XP_THRESHOLDS = [
  0, 500, 1200, 2200, 3500, 5000, 7000, 9500, 12500, 16000,
  20000, 25000, 31000, 38000, 46000, 55000, 65000, 76500, 89500, 104000,
  120000, 138000, 158000, 180500, 206000, 235000, 268000, 305000, 347000, 395000,
  450000, 512000, 583000,
] as const;  // 33 levels

export function getPrestigeLevel(totalXP: number): number {
  let level = 0;
  for (let i = PRESTIGE_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= PRESTIGE_XP_THRESHOLDS[i]) { level = i; break; }
  }
  return level;
}

export function getXPToNextLevel(totalXP: number): { current: number; needed: number; percent: number } {
  const level = getPrestigeLevel(totalXP);
  if (level >= 32) return { current: totalXP, needed: PRESTIGE_XP_THRESHOLDS[32], percent: 100 };
  const current = totalXP - PRESTIGE_XP_THRESHOLDS[level];
  const needed = PRESTIGE_XP_THRESHOLDS[level + 1] - PRESTIGE_XP_THRESHOLDS[level];
  return { current, needed, percent: Math.round((current / needed) * 100) };
}

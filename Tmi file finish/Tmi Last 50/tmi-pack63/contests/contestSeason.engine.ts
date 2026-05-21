// apps/web/src/lib/contests/contestSeason.engine.ts
// 3-layer competition system: weekly → monthly → yearly

export type ContestTier = "weekly" | "monthly" | "yearly";

export interface ContestScore {
  audienceVote: number;    // 0-100
  performanceScore: number; // 0-100
  retentionRate: number;   // 0-100 (watch-through %)
  seasonPoints: number;    // accumulated from prior rounds
  finalsBonus: number;     // bonus for finals performance
}

// Weighted scoring per tier
export function calculateContestScore(tier: ContestTier, s: ContestScore): number {
  if (tier === "weekly") {
    return (s.audienceVote * 0.50) + (s.performanceScore * 0.25) + (s.retentionRate * 0.15) + ((s.finalsBonus || 0) * 0.10);
  }
  if (tier === "monthly") {
    return (s.audienceVote * 0.45) + (s.performanceScore * 0.25) + (s.retentionRate * 0.15) + (s.seasonPoints * 0.10) + (s.finalsBonus * 0.05);
  }
  // yearly finals
  return (s.audienceVote * 0.40) + (s.performanceScore * 0.25) + (s.retentionRate * 0.15) + (s.seasonPoints * 0.10) + (s.finalsBonus * 0.10);
}

export interface PrizePackage {
  tier: ContestTier;
  cashPrizeDollars: number;
  points: number;
  xp: number;
  badgeId: string;
  skinUnlock?: string;
  magazineFeature: boolean;
  homepagePlacement: boolean;
  hallOfFame: boolean;
  qualifiesFor?: ContestTier;   // weekly winners qualify for monthly
  sponsorPackage: boolean;
  titleGranted?: string;
}

export const PRIZE_PACKAGES: Record<ContestTier, PrizePackage> = {
  weekly: {
    tier:"weekly", cashPrizeDollars:25, points:500, xp:1000,
    badgeId:"weekly_winner", magazineFeature:false, homepagePlacement:false,
    hallOfFame:false, qualifiesFor:"monthly", sponsorPackage:false,
  },
  monthly: {
    tier:"monthly", cashPrizeDollars:250, points:2000, xp:5000,
    badgeId:"monthly_champion", skinUnlock:"champion-glow-skin", magazineFeature:true,
    homepagePlacement:false, hallOfFame:false, qualifiesFor:"yearly", sponsorPackage:true,
  },
  yearly: {
    tier:"yearly", cashPrizeDollars:10000, points:50000, xp:100000,
    badgeId:"yearly_champion", skinUnlock:"hall-of-fame-skin", magazineFeature:true,
    homepagePlacement:true, hallOfFame:true, sponsorPackage:true,
    titleGranted:"TMI Champion",
  },
};

// SEASON CALENDAR
export const SEASON_CALENDAR = {
  weeklyBattles: "Weeks 1-3 of every month",
  monthlyFinals: "Week 4 of every month",
  quarterlySpotlight: "End of March, June, September, December",
  yearlyChampionship: "December — Best of the Best with Danny Green + Eddie LaRocca",
} as const;

import type { CreatorRole, AllTag } from "./roles";

export type OriginalityRating =
  | "NEW_SOUND"
  | "FAMILIAR"
  | "SIMILAR_TO_EXISTING"
  | "UNSURE";

export type ReturnIntent = "YES" | "NO" | "MAYBE";

export interface PerformanceVote {
  id: string;
  performanceId: string;
  creatorId: string;
  creatorRole: CreatorRole;
  fanId: string;
  liked: boolean;
  originalityRating: OriginalityRating;
  performanceScore: number;        // 1-5
  wouldWatchAgain: ReturnIntent;
  tags: AllTag[];
  createdAt: number;
  contextId?: string;              // battleId | cypherId | roomId | contestId
  contextType?: "battle" | "cypher" | "room" | "contest" | "submission";
}

export interface PerformanceStats {
  totalVotes: number;
  likeScore: number;               // 0-100
  performanceScore: number;        // 0-100
  originalityScore: number;        // 0-100 (% NEW_SOUND)
  familiarityRisk: number;         // 0-100 (% SIMILAR_TO_EXISTING)
  crowdEnergyScore: number;        // 0-100 (avg of ENERGY tag frequency)
  returnIntent: number;            // 0-100 (% YES on wouldWatchAgain)
  ratingBreakdown: Record<OriginalityRating, number>;
  scoreDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  topTags: { tag: AllTag; count: number; percent: number }[];
  mostImprovedCategory: AllTag | null;
  styleEvolutionTrend: "RISING" | "STABLE" | "FALLING";
}

const VOTES = new Map<string, PerformanceVote[]>();

export function castPerformanceVote(
  vote: Omit<PerformanceVote, "id" | "createdAt">,
): PerformanceVote {
  const full: PerformanceVote = {
    ...vote,
    id: `pv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  };
  const existing = VOTES.get(vote.performanceId) ?? [];
  const deduped  = existing.filter((v) => v.fanId !== vote.fanId);
  VOTES.set(vote.performanceId, [...deduped, full]);
  return full;
}

export function getPerformanceStats(performanceId: string): PerformanceStats {
  const votes = VOTES.get(performanceId) ?? [];
  const total = votes.length;

  const empty: PerformanceStats = {
    totalVotes: 0,
    likeScore: 0,
    performanceScore: 0,
    originalityScore: 0,
    familiarityRisk: 0,
    crowdEnergyScore: 0,
    returnIntent: 0,
    ratingBreakdown: { NEW_SOUND: 0, FAMILIAR: 0, SIMILAR_TO_EXISTING: 0, UNSURE: 0 },
    scoreDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    topTags: [],
    mostImprovedCategory: null,
    styleEvolutionTrend: "STABLE",
  };
  if (total === 0) return empty;

  const liked        = votes.filter((v) => v.liked).length;
  const likeScore    = Math.round((liked / total) * 100);
  const avgScore     = votes.reduce((s, v) => s + v.performanceScore, 0) / total;
  const performanceScore = Math.round((avgScore / 5) * 100);

  const ratingBreakdown: Record<OriginalityRating, number> = {
    NEW_SOUND: 0, FAMILIAR: 0, SIMILAR_TO_EXISTING: 0, UNSURE: 0,
  };
  for (const v of votes) ratingBreakdown[v.originalityRating]++;

  const originalityScore = Math.round((ratingBreakdown.NEW_SOUND / total) * 100);
  const familiarityRisk  = Math.round((ratingBreakdown.SIMILAR_TO_EXISTING / total) * 100);

  const scoreDistribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const v of votes) {
    const s = Math.max(1, Math.min(5, Math.round(v.performanceScore))) as 1|2|3|4|5;
    scoreDistribution[s]++;
  }

  const tagCounts = new Map<AllTag, number>();
  for (const v of votes) {
    for (const t of v.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, count, percent: Math.round((count / total) * 100) }));

  const crowdEnergyCount = tagCounts.get("ENERGY") ?? 0;
  const crowdEnergyScore = Math.round((crowdEnergyCount / total) * 100);

  const returnYes = votes.filter((v) => v.wouldWatchAgain === "YES").length;
  const returnIntent = Math.round((returnYes / total) * 100);

  // Trend: recent 10 vs prior 10
  const sorted     = [...votes].sort((a, b) => a.createdAt - b.createdAt);
  const recent     = sorted.slice(-10);
  const prior      = sorted.slice(-20, -10);
  const recentAvg  = recent.length ? recent.reduce((s, v) => s + v.performanceScore, 0) / recent.length : avgScore;
  const priorAvg   = prior.length  ? prior.reduce((s, v) => s + v.performanceScore, 0) / prior.length   : avgScore;
  const styleEvolutionTrend: PerformanceStats["styleEvolutionTrend"] =
    recentAvg > priorAvg + 0.3 ? "RISING" :
    recentAvg < priorAvg - 0.3 ? "FALLING" : "STABLE";

  // Most improved = top tag in most recent 5 votes not in bottom half of all-time
  const recentTags = sorted.slice(-5).flatMap((v) => v.tags);
  const recentTagCounts = new Map<AllTag, number>();
  for (const t of recentTags) recentTagCounts.set(t, (recentTagCounts.get(t) ?? 0) + 1);
  const mostImprovedEntry = Array.from(recentTagCounts.entries())
    .sort((a, b) => b[1] - a[1])[0];
  const mostImprovedCategory = mostImprovedEntry?.[0] ?? null;

  return {
    totalVotes: total,
    likeScore,
    performanceScore,
    originalityScore,
    familiarityRisk,
    crowdEnergyScore,
    returnIntent,
    ratingBreakdown,
    scoreDistribution,
    topTags,
    mostImprovedCategory,
    styleEvolutionTrend,
  };
}

export function hasVoted(performanceId: string, fanId: string): boolean {
  return (VOTES.get(performanceId) ?? []).some((v) => v.fanId === fanId);
}

export function listPerformanceVotes(performanceId: string): PerformanceVote[] {
  return VOTES.get(performanceId) ?? [];
}

import { getPerformanceStats, type PerformanceStats } from "./PerformanceScoreEngine";
import type { AllTag } from "./roles";

export interface PerformanceRecord {
  performanceId: string;
  contextLabel: string;
  date: number;
}

export interface CreatorEvolutionStats {
  totalPerformances: number;
  likeScoreTrend:    number[];   // per-performance like score
  perfScoreTrend:    number[];   // per-performance performance score
  origScoreTrend:    number[];   // per-performance originality score
  peakLikeScore:     number;
  peakPerfScore:     number;
  mostConsistentTag: AllTag | null;
  overallTrend:      "RISING" | "STABLE" | "FALLING";
  latestStats:       PerformanceStats | null;
}

const CREATOR_RECORDS = new Map<string, PerformanceRecord[]>();

export function registerPerformance(
  creatorId: string,
  performanceId: string,
  contextLabel: string,
  date = Date.now(),
): void {
  const existing = CREATOR_RECORDS.get(creatorId) ?? [];
  if (!existing.some((r) => r.performanceId === performanceId)) {
    CREATOR_RECORDS.set(creatorId, [
      ...existing,
      { performanceId, contextLabel, date },
    ]);
  }
}

export function getCreatorEvolutionStats(creatorId: string): CreatorEvolutionStats {
  const records = (CREATOR_RECORDS.get(creatorId) ?? [])
    .sort((a, b) => a.date - b.date);

  if (records.length === 0) {
    return {
      totalPerformances: 0,
      likeScoreTrend: [],
      perfScoreTrend: [],
      origScoreTrend: [],
      peakLikeScore: 0,
      peakPerfScore: 0,
      mostConsistentTag: null,
      overallTrend: "STABLE",
      latestStats: null,
    };
  }

  const statsList = records.map((r) => getPerformanceStats(r.performanceId));

  const likeScoreTrend = statsList.map((s) => s.likeScore);
  const perfScoreTrend = statsList.map((s) => s.performanceScore);
  const origScoreTrend = statsList.map((s) => s.originalityScore);

  const peakLikeScore = Math.max(...likeScoreTrend);
  const peakPerfScore = Math.max(...perfScoreTrend);

  // Most consistent tag = appears in top-3 across the most performances
  const tagAppearances = new Map<AllTag, number>();
  for (const s of statsList) {
    for (const t of s.topTags.slice(0, 3)) {
      tagAppearances.set(t.tag, (tagAppearances.get(t.tag) ?? 0) + 1);
    }
  }
  const topEntry = Array.from(tagAppearances.entries()).sort((a, b) => b[1] - a[1])[0];
  const mostConsistentTag = topEntry?.[0] ?? null;

  // Overall trend: compare last 3 performances to the 3 before
  const recent = perfScoreTrend.slice(-3);
  const prior  = perfScoreTrend.slice(-6, -3);
  const recentAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const priorAvg  = prior.length  ? prior.reduce((a, b) => a + b, 0)  / prior.length  : recentAvg;
  const overallTrend: CreatorEvolutionStats["overallTrend"] =
    recentAvg > priorAvg + 5 ? "RISING"  :
    recentAvg < priorAvg - 5 ? "FALLING" : "STABLE";

  return {
    totalPerformances: records.length,
    likeScoreTrend,
    perfScoreTrend,
    origScoreTrend,
    peakLikeScore,
    peakPerfScore,
    mostConsistentTag,
    overallTrend,
    latestStats: statsList[statsList.length - 1] ?? null,
  };
}

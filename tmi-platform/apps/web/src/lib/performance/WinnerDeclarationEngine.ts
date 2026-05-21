import { getPerformanceStats, type PerformanceStats } from "./PerformanceScoreEngine";

export interface ContestEntry {
  performanceId: string;
  creatorId: string;
  creatorName: string;
}

export interface ContestResult {
  winnerId: string;
  winnerName: string;
  winnerPerformanceId: string;
  scores: {
    creatorId: string;
    creatorName: string;
    performanceId: string;
    composite: number;
    likeScore: number;
    performanceScore: number;
    originalityScore: number;
    returnIntent: number;
    totalVotes: number;
  }[];
  method: "VOTES" | "COMPOSITE";
}

function compositeScore(stats: PerformanceStats): number {
  // Weighted composite: like 30%, performance 35%, originality 20%, returnIntent 15%
  return Math.round(
    stats.likeScore        * 0.30 +
    stats.performanceScore * 0.35 +
    stats.originalityScore * 0.20 +
    stats.returnIntent     * 0.15,
  );
}

export function declareWinner(entries: ContestEntry[], method: "VOTES" | "COMPOSITE" = "COMPOSITE"): ContestResult | null {
  if (entries.length === 0) return null;

  const scores = entries.map((e) => {
    const s = getPerformanceStats(e.performanceId);
    return {
      creatorId:      e.creatorId,
      creatorName:    e.creatorName,
      performanceId:  e.performanceId,
      composite:      compositeScore(s),
      likeScore:      s.likeScore,
      performanceScore: s.performanceScore,
      originalityScore: s.originalityScore,
      returnIntent:   s.returnIntent,
      totalVotes:     s.totalVotes,
    };
  });

  const sorted = [...scores].sort((a, b) => {
    if (method === "VOTES") return b.totalVotes - a.totalVotes;
    return b.composite - a.composite;
  });

  const winner = sorted[0];
  if (!winner) return null;

  return {
    winnerId:              winner.creatorId,
    winnerName:            winner.creatorName,
    winnerPerformanceId:   winner.performanceId,
    scores:                sorted,
    method,
  };
}

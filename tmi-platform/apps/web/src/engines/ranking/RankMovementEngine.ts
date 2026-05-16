// Rank Movement Engine — per-performer rank delta and trend state

export type RankTrend = "rising" | "falling" | "holding";

export interface PerformerRankData {
  performerId: string;
  name: string;
  category: string;
  rank: number;
  previousRank: number;
  delta: number;
  likes: number;
  votes: number;
  trend: RankTrend;
  profileImage: string;
}

// positive delta = moved up (rank number decreased = better position)
export function computeDelta(current: number, previous: number): number {
  return previous - current;
}

export function computeTrend(current: number, previous: number): RankTrend {
  if (current < previous) return "rising";
  if (current > previous) return "falling";
  return "holding";
}

export function buildPerformer(
  performerId: string,
  name: string,
  category: string,
  rank: number,
  previousRank: number,
  likes: number,
  votes: number,
  profileImage: string
): PerformerRankData {
  return {
    performerId,
    name,
    category,
    rank,
    previousRank,
    delta: computeDelta(rank, previousRank),
    likes,
    votes,
    trend: computeTrend(rank, previousRank),
    profileImage,
  };
}

// Simulate a live rank tick: small random rank swaps to animate the spread
export function simulateRankTick(
  performers: PerformerRankData[],
  swapProbability = 0.3
): PerformerRankData[] {
  if (performers.length < 2) return performers;

  const next = performers.map((p) => ({ ...p, previousRank: p.rank }));

  // Randomly swap two adjacent ranks with given probability
  if (Math.random() < swapProbability) {
    const idx = Math.floor(Math.random() * (next.length - 1));
    const a = next[idx];
    const b = next[idx + 1];
    if (a && b) {
      const tmpRank = a.rank;
      next[idx]     = { ...a, rank: b.rank, delta: computeDelta(b.rank, a.rank), trend: computeTrend(b.rank, a.rank) };
      next[idx + 1] = { ...b, rank: tmpRank, delta: computeDelta(tmpRank, b.rank), trend: computeTrend(tmpRank, b.rank) };
    }
  }

  // Randomly increment votes
  return next.map((p) => ({
    ...p,
    votes: p.votes + Math.floor(Math.random() * 40),
    likes: p.likes + Math.floor(Math.random() * 15),
  }));
}

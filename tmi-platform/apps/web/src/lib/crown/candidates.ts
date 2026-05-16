export type CrownCandidate = {
  id: string;
  genre: string;
  score: number;
  raw: Record<string, unknown>;
};

export const crownCandidates: CrownCandidate[] = [];

export function buildCrownCandidates(input?: {
  top10Rows?: Array<Record<string, unknown>>;
  trendingRows?: Array<Record<string, unknown>>;
}): CrownCandidate[] {
  const top10Rows = input?.top10Rows ?? [];
  const trendingRows = input?.trendingRows ?? [];
  const merged = [...top10Rows, ...trendingRows];

  return merged.map((row, index) => ({
    id: typeof row.id === "string" ? row.id : `candidate-${index + 1}`,
    genre: typeof row.genre === "string" ? row.genre : typeof row.category === "string" ? row.category : "General",
    score: typeof row.score === "number" ? row.score : typeof row.rank === "number" ? Math.max(0, 100 - row.rank) : 0,
    raw: row,
  }));
}

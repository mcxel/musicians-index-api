// Engagement scores per reaction type
const REACTION_SCORES: Record<string, number> = {
  hard:     3,
  replay:   4,
  original: 2,
  skip:    -2,
};

// genre → hour → { totalScore, sampleCount }
const trends: Map<string, Map<number, { totalScore: number; sampleCount: number }>> = new Map();

function currentHour(): number {
  return new Date().getHours();
}

function getOrCreate(genre: string, hour: number): { totalScore: number; sampleCount: number } {
  if (!trends.has(genre)) trends.set(genre, new Map());
  const hourMap = trends.get(genre)!;
  if (!hourMap.has(hour)) hourMap.set(hour, { totalScore: 0, sampleCount: 0 });
  return hourMap.get(hour)!;
}

export const TrendLearningEngine = {
  record(genre: string, reactionType: string): void {
    const score = REACTION_SCORES[reactionType] ?? 0;
    if (score === 0) return;
    const hour = currentHour();
    const bucket = getOrCreate(genre.toLowerCase(), hour);
    bucket.totalScore  += score;
    bucket.sampleCount += 1;
  },

  // Returns 0.7–1.8 multiplier for a genre at current hour
  getMultiplier(genre: string): number {
    const hourMap = trends.get(genre.toLowerCase());
    if (!hourMap) return 1.0;
    const bucket = hourMap.get(currentHour());
    if (!bucket || bucket.sampleCount === 0) return 1.0;
    const avg = bucket.totalScore / bucket.sampleCount;
    // avg range: roughly -2 to +4 → normalize to 0.7–1.8
    const normalized = (avg + 2) / 6; // 0→0, 1→0.5 from avg=-2..+4
    return Math.max(0.7, Math.min(1.8, 0.7 + normalized * 1.1));
  },

  getTopGenre(): string | null {
    let best: { genre: string; score: number } | null = null;
    for (const [genre, hourMap] of trends.entries()) {
      const hour = currentHour();
      const bucket = hourMap.get(hour);
      if (!bucket || bucket.sampleCount === 0) continue;
      const score = bucket.totalScore / bucket.sampleCount;
      if (!best || score > best.score) best = { genre, score };
    }
    return best?.genre ?? null;
  },

  getSummary(): { genre: string; score: number }[] {
    const hour = currentHour();
    const results: { genre: string; score: number }[] = [];
    for (const [genre, hourMap] of trends.entries()) {
      const bucket = hourMap.get(hour);
      if (!bucket || bucket.sampleCount === 0) continue;
      results.push({ genre, score: bucket.totalScore / bucket.sampleCount });
    }
    return results.sort((a, b) => b.score - a.score);
  },
};

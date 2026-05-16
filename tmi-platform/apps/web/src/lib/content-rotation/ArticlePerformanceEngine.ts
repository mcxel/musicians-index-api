// ArticlePerformanceEngine
// Scores every article based on engagement signals.
// Higher score → more placement weight.

export interface ArticleSignals {
  articleId: string;
  reads: number;
  completionRate: number;       // 0–1
  artistConversions: number;    // clicks to artist profile
  sponsorConversions: number;   // clicks to sponsor CTA
  revenuePerImpression: number; // $ per render
  shares: number;
  comments: number;
  tips: number;
  uniqueReaders: number;
}

export interface ArticleScore {
  articleId: string;
  rawScore: number;    // 0–1 normalised
  tier: "S" | "A" | "B" | "C" | "D";
}

const WEIGHTS = {
  reads: 0.15,
  completionRate: 0.20,
  artistConversions: 0.15,
  sponsorConversions: 0.10,
  revenuePerImpression: 0.15,
  shares: 0.10,
  comments: 0.05,
  tips: 0.05,
  uniqueReaders: 0.05,
};

// Soft-normalise a value against a benchmark ceiling
function norm(value: number, ceiling: number): number {
  return Math.min(value / ceiling, 1);
}

export function scoreArticle(signals: ArticleSignals): ArticleScore {
  const s =
    norm(signals.reads, 10_000) * WEIGHTS.reads +
    signals.completionRate * WEIGHTS.completionRate +
    norm(signals.artistConversions, 500) * WEIGHTS.artistConversions +
    norm(signals.sponsorConversions, 200) * WEIGHTS.sponsorConversions +
    norm(signals.revenuePerImpression, 0.05) * WEIGHTS.revenuePerImpression +
    norm(signals.shares, 1_000) * WEIGHTS.shares +
    norm(signals.comments, 200) * WEIGHTS.comments +
    norm(signals.tips, 100) * WEIGHTS.tips +
    norm(signals.uniqueReaders, 5_000) * WEIGHTS.uniqueReaders;

  const tier: ArticleScore["tier"] =
    s >= 0.8 ? "S" :
    s >= 0.6 ? "A" :
    s >= 0.4 ? "B" :
    s >= 0.2 ? "C" : "D";

  return { articleId: signals.articleId, rawScore: s, tier };
}

export function rankArticles(signals: ArticleSignals[]): ArticleScore[] {
  return signals
    .map(scoreArticle)
    .sort((a, b) => b.rawScore - a.rawScore);
}

// Returns a rotation weight (1–10) from a scored article
export function scoreToWeight(score: ArticleScore): number {
  return Math.max(1, Math.round(score.rawScore * 10));
}

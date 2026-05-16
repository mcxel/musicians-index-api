/**
 * ArticleAdWeightEngine
 * Weighting logic for article ad priority and rotation.
 */

export type ArticleAdSlot =
  | "header-banner"
  | "inline"
  | "mid-scroll"
  | "footer"
  | "sponsor-rail"
  | "full-takeover";

export type ArticleAdWeightInput = {
  campaignPriority: number;
  rotationIndex: number;
  premiumMultiplier: number;
  articleRelevanceScore: number;
};

export type ArticleAdWeightBreakdown = {
  priorityWeight: number;
  rotationWeight: number;
  premiumWeight: number;
  relevanceWeight: number;
  totalWeight: number;
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function calculateArticleAdWeight(input: ArticleAdWeightInput): ArticleAdWeightBreakdown {
  const priorityWeight = clamp(input.campaignPriority, 0, 100) * 1.5;
  const rotationWeight = 100 - (Math.abs(input.rotationIndex) % 100);
  const premiumWeight = clamp(input.premiumMultiplier, 0.5, 5) * 20;
  const relevanceWeight = clamp(input.articleRelevanceScore, 0, 1) * 100;
  const totalWeight = Math.round(priorityWeight + rotationWeight + premiumWeight + relevanceWeight);

  return {
    priorityWeight,
    rotationWeight,
    premiumWeight,
    relevanceWeight,
    totalWeight,
  };
}

export function sortByAdWeight<T extends { weight: ArticleAdWeightBreakdown }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.weight.totalWeight - a.weight.totalWeight);
}

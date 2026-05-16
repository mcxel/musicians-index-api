// RevenueProtectionEngine
// Guards monetizable slots from low-value content.
// Sponsor/advertiser slots only receive articles with proven revenue performance.

import type { PlacementSurface } from "./types";

export interface RevenueThreshold {
  surface: PlacementSurface;
  minScore: number;           // 0–1 ArticlePerformanceEngine score
  minRevenuePerImpression: number; // $
}

// Revenue-sensitive surfaces and their minimum requirements
const THRESHOLDS: RevenueThreshold[] = [
  { surface: "homepage-4",    minScore: 0.40, minRevenuePerImpression: 0.005 },
  { surface: "sponsor-page",  minScore: 0.35, minRevenuePerImpression: 0.003 },
  { surface: "advertiser-page", minScore: 0.35, minRevenuePerImpression: 0.003 },
  { surface: "homepage-5",    minScore: 0.30, minRevenuePerImpression: 0.001 },
  { surface: "trending-rail", minScore: 0.25, minRevenuePerImpression: 0.001 },
];

export function getThreshold(surface: PlacementSurface): RevenueThreshold | undefined {
  return THRESHOLDS.find(t => t.surface === surface);
}

export function passesRevenueGuard(
  articleScore: number,
  revenuePerImpression: number,
  surface: PlacementSurface,
): boolean {
  const threshold = getThreshold(surface);
  if (!threshold) return true; // no guard on this surface
  return (
    articleScore >= threshold.minScore &&
    revenuePerImpression >= threshold.minRevenuePerImpression
  );
}

export interface RevenueGuardResult {
  allowed: boolean;
  reason?: string;
  threshold?: RevenueThreshold;
}

export function checkRevenueGuard(
  articleId: string,
  articleScore: number,
  revenuePerImpression: number,
  surface: PlacementSurface,
): RevenueGuardResult {
  const threshold = getThreshold(surface);
  if (!threshold) return { allowed: true };

  const scoreFail = articleScore < threshold.minScore;
  const revFail = revenuePerImpression < threshold.minRevenuePerImpression;

  if (scoreFail || revFail) {
    return {
      allowed: false,
      reason: scoreFail
        ? `Article score ${articleScore.toFixed(2)} below floor ${threshold.minScore}`
        : `Revenue/impression $${revenuePerImpression.toFixed(4)} below floor $${threshold.minRevenuePerImpression}`,
      threshold,
    };
  }

  return { allowed: true, threshold };
}

// Batch filter — removes underperforming articles from a monetized surface pool
export function filterByRevenue<T extends { articleId: string; score: number; revenuePerImpression: number }>(
  entries: T[],
  surface: PlacementSurface,
): T[] {
  const threshold = getThreshold(surface);
  if (!threshold) return entries;
  return entries.filter(
    e => e.score >= threshold.minScore && e.revenuePerImpression >= threshold.minRevenuePerImpression,
  );
}

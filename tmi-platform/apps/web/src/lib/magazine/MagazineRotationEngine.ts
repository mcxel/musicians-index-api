/**
 * MagazineRotationEngine
 * Rotations for article, homepage article, ad, sponsor, rank, contest, and event surfaces.
 */

import { listArticleAdPlacements } from "../articles/ArticleAdPlacementEngine";
import { listMagazineRankings } from "../progression/MagazineRankingEngine";
import type { MagazineArticle } from "./MagazineArticleResolver";

export type RotationCandidate = {
  id: string;
  label: string;
  weight?: number;
};

export type MagazineRotationSnapshot = {
  articleRotation: RotationCandidate[];
  homepageArticleRotation: RotationCandidate[];
  adRotation: RotationCandidate[];
  sponsorRotation: RotationCandidate[];
  rankRotation: RotationCandidate[];
  contestFeatureRotation: RotationCandidate[];
  featuredEventRotation: RotationCandidate[];
  generatedAtMs: number;
};

function sortByWeight(items: RotationCandidate[]): RotationCandidate[] {
  return [...items].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
}

function rotate(items: RotationCandidate[], atMs = Date.now(), bucketMs = 15 * 60 * 1000): RotationCandidate[] {
  if (items.length <= 1) return [...items];
  const shift = Math.floor(atMs / bucketMs) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

export function rotateMagazineArticles(
  articles: MagazineArticle[],
  atMs = Date.now(),
  bucketMs = 20 * 60 * 1000,
): MagazineArticle[] {
  if (articles.length <= 1) return [...articles];
  const shift = Math.floor(atMs / bucketMs) % articles.length;
  return [...articles.slice(shift), ...articles.slice(0, shift)];
}

export function rotateArticles(articles: RotationCandidate[], limit = 8): RotationCandidate[] {
  return rotate(sortByWeight(articles)).slice(0, limit);
}

export function rotateHomepageArticles(articles: RotationCandidate[], limit = 6): RotationCandidate[] {
  return rotate(sortByWeight(articles), Date.now(), 10 * 60 * 1000).slice(0, limit);
}

export function rotateSponsorsForIssue(sponsors: RotationCandidate[], limit = 6): RotationCandidate[] {
  return rotate(sortByWeight(sponsors), Date.now(), 20 * 60 * 1000).slice(0, limit);
}

export function rotateAdsForIssue(articleId?: string, limit = 8): RotationCandidate[] {
  const placements = listArticleAdPlacements({
    articleId,
    activeOnly: true,
  });

  const candidates: RotationCandidate[] = placements.map((placement) => ({
    id: placement.placementId,
    label: `${placement.slot}:${placement.creativeId}`,
    weight: placement.weight.totalWeight,
  }));

  return rotate(sortByWeight(candidates), Date.now(), 5 * 60 * 1000).slice(0, limit);
}

export function rotateContestFeatures(contests: RotationCandidate[], limit = 5): RotationCandidate[] {
  return rotate(sortByWeight(contests), Date.now(), 30 * 60 * 1000).slice(0, limit);
}

export function rotateTopRanks(limit = 10): RotationCandidate[] {
  const ranks = listMagazineRankings().map((entry) => ({
    id: entry.artistId,
    label: `#${entry.currentRank} Artist ${entry.artistId}`,
    weight: Math.max(0, 1000 - entry.currentRank * 10 + entry.score),
  }));

  return rotate(sortByWeight(ranks), Date.now(), 60 * 60 * 1000).slice(0, limit);
}

export function rotateFeaturedEvents(events: RotationCandidate[], limit = 6): RotationCandidate[] {
  return rotate(sortByWeight(events), Date.now(), 30 * 60 * 1000).slice(0, limit);
}

export function buildMagazineRotationSnapshot(input: {
  articles: RotationCandidate[];
  homepageArticles: RotationCandidate[];
  sponsors: RotationCandidate[];
  contests: RotationCandidate[];
  events: RotationCandidate[];
  articleIdForAds?: string;
}): MagazineRotationSnapshot {
  return {
    articleRotation: rotateArticles(input.articles),
    homepageArticleRotation: rotateHomepageArticles(input.homepageArticles),
    adRotation: rotateAdsForIssue(input.articleIdForAds),
    sponsorRotation: rotateSponsorsForIssue(input.sponsors),
    rankRotation: rotateTopRanks(),
    contestFeatureRotation: rotateContestFeatures(input.contests),
    featuredEventRotation: rotateFeaturedEvents(input.events),
    generatedAtMs: Date.now(),
  };
}

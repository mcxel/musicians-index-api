/**
 * ArticleAdPlacementEngine
 * Placement inventory assignment for all monetizable article ad slots.
 */

import {
  calculateArticleAdWeight,
  sortByAdWeight,
  type ArticleAdSlot,
  type ArticleAdWeightBreakdown,
} from "./ArticleAdWeightEngine";

export type ArticleAdPlacement = {
  placementId: string;
  campaignId: string;
  articleId: string;
  advertiserId: string;
  slot: ArticleAdSlot;
  creativeId: string;
  active: boolean;
  weight: ArticleAdWeightBreakdown;
  createdAtMs: number;
};

const placements = new Map<string, ArticleAdPlacement>();
let placementCounter = 0;

export function createArticleAdPlacement(input: {
  campaignId: string;
  articleId: string;
  advertiserId: string;
  slot: ArticleAdSlot;
  creativeId: string;
  campaignPriority: number;
  rotationIndex: number;
  premiumMultiplier: number;
  articleRelevanceScore: number;
}): ArticleAdPlacement {
  const placementId = `article-placement-${++placementCounter}`;

  const placement: ArticleAdPlacement = {
    placementId,
    campaignId: input.campaignId,
    articleId: input.articleId,
    advertiserId: input.advertiserId,
    slot: input.slot,
    creativeId: input.creativeId,
    active: true,
    weight: calculateArticleAdWeight({
      campaignPriority: input.campaignPriority,
      rotationIndex: input.rotationIndex,
      premiumMultiplier: input.premiumMultiplier,
      articleRelevanceScore: input.articleRelevanceScore,
    }),
    createdAtMs: Date.now(),
  };

  placements.set(placementId, placement);
  return placement;
}

export function listArticleAdPlacements(input?: {
  articleId?: string;
  campaignId?: string;
  slot?: ArticleAdSlot;
  activeOnly?: boolean;
}): ArticleAdPlacement[] {
  let list = [...placements.values()];

  if (input?.articleId) list = list.filter((placement) => placement.articleId === input.articleId);
  if (input?.campaignId) list = list.filter((placement) => placement.campaignId === input.campaignId);
  if (input?.slot) list = list.filter((placement) => placement.slot === input.slot);
  if (input?.activeOnly) list = list.filter((placement) => placement.active);

  return sortByAdWeight(list);
}

export function selectArticleAdForSlot(input: {
  articleId: string;
  slot: ArticleAdSlot;
}): ArticleAdPlacement | null {
  const eligible = listArticleAdPlacements({
    articleId: input.articleId,
    slot: input.slot,
    activeOnly: true,
  });

  return eligible[0] ?? null;
}

export function setArticleAdPlacementActive(placementId: string, active: boolean): ArticleAdPlacement {
  const placement = placements.get(placementId);
  if (!placement) throw new Error(`Article ad placement ${placementId} not found`);

  const updated: ArticleAdPlacement = {
    ...placement,
    active,
  };

  placements.set(placementId, updated);
  return updated;
}

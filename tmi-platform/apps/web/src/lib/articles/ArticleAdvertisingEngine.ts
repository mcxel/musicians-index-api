/**
 * ArticleAdvertisingEngine
 * Campaign lifecycle orchestration for article monetization inventory.
 */

import {
  createArticleAdPlacement,
  listArticleAdPlacements,
  setArticleAdPlacementActive,
  type ArticleAdPlacement,
} from "./ArticleAdPlacementEngine";
import { buildArticleAdRoutes } from "./ArticleAdRoutingEngine";
import { getArticleAdTracking, type ArticleAdTrackingSnapshot } from "./ArticleAdTrackingEngine";
import type { ArticleAdSlot } from "./ArticleAdWeightEngine";

export type ArticleAdCampaignStatus = "draft" | "active" | "paused" | "completed";

export type ArticleAdCampaign = {
  campaignId: string;
  advertiserId: string;
  articleId: string;
  name: string;
  budgetCents: number;
  status: ArticleAdCampaignStatus;
  createdAtMs: number;
  updatedAtMs: number;
};

const campaigns = new Map<string, ArticleAdCampaign>();
let campaignCounter = 0;

function getCampaignOrThrow(campaignId: string): ArticleAdCampaign {
  const campaign = campaigns.get(campaignId);
  if (!campaign) throw new Error(`Article ad campaign ${campaignId} not found`);
  return campaign;
}

function updateCampaignStatus(campaignId: string, status: ArticleAdCampaignStatus): ArticleAdCampaign {
  const existing = getCampaignOrThrow(campaignId);
  const updated: ArticleAdCampaign = {
    ...existing,
    status,
    updatedAtMs: Date.now(),
  };

  campaigns.set(campaignId, updated);

  const linkedPlacements = listArticleAdPlacements({ campaignId });
  const shouldBeActive = status === "active";
  for (const placement of linkedPlacements) {
    setArticleAdPlacementActive(placement.placementId, shouldBeActive);
  }

  return updated;
}

export function createArticleAdCampaign(input: {
  advertiserId: string;
  articleId: string;
  name: string;
  budgetCents: number;
}): ArticleAdCampaign {
  if (!input.advertiserId) throw new Error("advertiserId is required");
  if (!input.articleId) throw new Error("articleId is required");
  if (!input.name) throw new Error("campaign name is required");
  if (input.budgetCents <= 0) throw new Error("budget must be positive");

  const campaignId = `article-campaign-${++campaignCounter}`;
  const now = Date.now();

  const campaign: ArticleAdCampaign = {
    campaignId,
    advertiserId: input.advertiserId,
    articleId: input.articleId,
    name: input.name,
    budgetCents: input.budgetCents,
    status: "active",
    createdAtMs: now,
    updatedAtMs: now,
  };

  campaigns.set(campaignId, campaign);
  return campaign;
}

export function pauseArticleAdCampaign(campaignId: string): ArticleAdCampaign {
  return updateCampaignStatus(campaignId, "paused");
}

export function resumeArticleAdCampaign(campaignId: string): ArticleAdCampaign {
  return updateCampaignStatus(campaignId, "active");
}

export function completeArticleAdCampaign(campaignId: string): ArticleAdCampaign {
  return updateCampaignStatus(campaignId, "completed");
}

export function listArticleAdCampaigns(input?: {
  advertiserId?: string;
  articleId?: string;
  status?: ArticleAdCampaignStatus;
}): ArticleAdCampaign[] {
  let list = [...campaigns.values()];

  if (input?.advertiserId) {
    list = list.filter((campaign) => campaign.advertiserId === input.advertiserId);
  }
  if (input?.articleId) {
    list = list.filter((campaign) => campaign.articleId === input.articleId);
  }
  if (input?.status) {
    list = list.filter((campaign) => campaign.status === input.status);
  }

  return list.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export function placeArticleAdCreative(input: {
  campaignId: string;
  creativeId: string;
  slot: ArticleAdSlot;
  campaignPriority: number;
  rotationIndex: number;
  premiumMultiplier: number;
  articleRelevanceScore: number;
}): ArticleAdPlacement {
  const campaign = getCampaignOrThrow(input.campaignId);

  return createArticleAdPlacement({
    campaignId: campaign.campaignId,
    articleId: campaign.articleId,
    advertiserId: campaign.advertiserId,
    slot: input.slot,
    creativeId: input.creativeId,
    campaignPriority: input.campaignPriority,
    rotationIndex: input.rotationIndex,
    premiumMultiplier: input.premiumMultiplier,
    articleRelevanceScore: input.articleRelevanceScore,
  });
}

export function getArticleAdCampaignOverview(campaignId: string): {
  campaign: ArticleAdCampaign;
  placements: ArticleAdPlacement[];
  tracking: ArticleAdTrackingSnapshot;
  routes: ReturnType<typeof buildArticleAdRoutes>;
} {
  const campaign = getCampaignOrThrow(campaignId);

  return {
    campaign,
    placements: listArticleAdPlacements({ campaignId: campaign.campaignId }),
    tracking: getArticleAdTracking(campaign.campaignId),
    routes: buildArticleAdRoutes({
      campaignId: campaign.campaignId,
      advertiserId: campaign.advertiserId,
      articleId: campaign.articleId,
    }),
  };
}

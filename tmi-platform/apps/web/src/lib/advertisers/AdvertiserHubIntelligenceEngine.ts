/**
 * AdvertiserHubIntelligenceEngine
 * Consolidated advertiser dashboard intelligence using campaign and audience engines.
 */

import { listRevenueLedgerEntries } from "../revenue/RevenueLedgerEngine";
import { buildAdvertiserRoutes } from "./AdvertiserRoutingEngine";
import {
  buildCampaignInsights,
  summarizeAdvertiserCampaignPortfolio,
  type AdvertiserCampaignMetric,
} from "./AdvertiserCampaignIntelligenceEngine";
import {
  buildAudienceInsights,
  type AudienceSignal,
} from "./AdvertiserAudienceIntelligenceEngine";

export type AdvertiserHubIntelligence = {
  advertiserId: string;
  campaignInsights: ReturnType<typeof buildCampaignInsights>;
  audienceInsights: ReturnType<typeof buildAudienceInsights>;
  portfolioSummary: ReturnType<typeof summarizeAdvertiserCampaignPortfolio>;
  ledgerBackedRevenueCents: number;
  routes: ReturnType<typeof buildAdvertiserRoutes>;
};

export function buildAdvertiserHubIntelligence(input: {
  advertiserId: string;
  campaignMetrics: AdvertiserCampaignMetric[];
  audienceSignals: AudienceSignal[];
}): AdvertiserHubIntelligence {
  const campaignInsights = buildCampaignInsights(
    input.campaignMetrics.filter((metric) => metric.advertiserId === input.advertiserId)
  );
  const audienceInsights = buildAudienceInsights(input.audienceSignals);
  const portfolioSummary = summarizeAdvertiserCampaignPortfolio({
    advertiserId: input.advertiserId,
    campaigns: input.campaignMetrics,
  });

  const ledgerBackedRevenueCents = listRevenueLedgerEntries({
    sellerId: input.advertiserId,
    status: "recorded",
  }).reduce((sum, entry) => sum + entry.totalCents, 0);
  const routes = buildAdvertiserRoutes({
    advertiserId: input.advertiserId,
    campaignId: campaignInsights[0]?.campaignId,
  });

  return {
    advertiserId: input.advertiserId,
    campaignInsights,
    audienceInsights,
    portfolioSummary,
    ledgerBackedRevenueCents,
    routes,
  };
}

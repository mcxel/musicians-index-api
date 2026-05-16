/**
 * AdvertiserCampaignIntelligenceEngine
 * Campaign-level performance and ROI intelligence for advertisers.
 */

export type AdvertiserCampaignStatus = "draft" | "active" | "paused" | "completed";

export type AdvertiserCampaignMetric = {
  campaignId: string;
  advertiserId: string;
  campaignName: string;
  status: AdvertiserCampaignStatus;
  spendCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  attributedRevenueCents: number;
};

export type AdvertiserCampaignInsight = AdvertiserCampaignMetric & {
  ctr: number;
  conversionRate: number;
  roas: number;
};

export function buildCampaignInsights(metrics: AdvertiserCampaignMetric[]): AdvertiserCampaignInsight[] {
  return metrics
    .map((metric) => {
      const ctr = metric.impressions > 0 ? metric.clicks / metric.impressions : 0;
      const conversionRate = metric.clicks > 0 ? metric.conversions / metric.clicks : 0;
      const roas = metric.spendCents > 0 ? metric.attributedRevenueCents / metric.spendCents : 0;

      return {
        ...metric,
        ctr,
        conversionRate,
        roas,
      };
    })
    .sort((a, b) => b.roas - a.roas);
}

export function summarizeAdvertiserCampaignPortfolio(input: {
  advertiserId: string;
  campaigns: AdvertiserCampaignMetric[];
}): {
  advertiserId: string;
  totalSpendCents: number;
  totalRevenueCents: number;
  overallRoas: number;
  bestCampaignId: string | null;
} {
  const insights = buildCampaignInsights(input.campaigns.filter((campaign) => campaign.advertiserId === input.advertiserId));
  const totalSpendCents = insights.reduce((sum, campaign) => sum + campaign.spendCents, 0);
  const totalRevenueCents = insights.reduce((sum, campaign) => sum + campaign.attributedRevenueCents, 0);

  return {
    advertiserId: input.advertiserId,
    totalSpendCents,
    totalRevenueCents,
    overallRoas: totalSpendCents > 0 ? totalRevenueCents / totalSpendCents : 0,
    bestCampaignId: insights[0]?.campaignId ?? null,
  };
}

/**
 * AdvertiserRoutingEngine
 * Route generator for advertiser intelligence surfaces.
 */

export type AdvertiserRoutes = {
  advertiserHubRoute: string;
  campaignAnalyticsRoute: string;
  audienceInsightsRoute: string;
  roiRoute: string;
  supportRoute: string;
};

export function buildAdvertiserRoutes(input: {
  advertiserId: string;
  campaignId?: string;
}): AdvertiserRoutes {
  const base = `/advertisers/${input.advertiserId}`;

  return {
    advertiserHubRoute: `${base}/hub`,
    campaignAnalyticsRoute: input.campaignId
      ? `${base}/campaigns/${input.campaignId}/analytics`
      : `${base}/campaigns/analytics`,
    audienceInsightsRoute: `${base}/audience/insights`,
    roiRoute: `${base}/roi`,
    supportRoute: `${base}/support`,
  };
}

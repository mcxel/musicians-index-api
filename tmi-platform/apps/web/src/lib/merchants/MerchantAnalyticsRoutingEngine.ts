/**
 * MerchantAnalyticsRoutingEngine
 * Analytics route builder for merchant dashboards.
 */

export type MerchantAnalyticsRoutes = {
  merchantAnalyticsRoute: string;
  productAnalyticsRoute: string;
  artistAttributionRoute: string;
  campaignAnalyticsRoute: string;
};

export function buildMerchantAnalyticsRoutes(input: {
  merchantId: string;
  merchantSlug?: string;
  productId?: string;
  artistId?: string;
  campaignId?: string;
}): MerchantAnalyticsRoutes {
  const merchantBase = input.merchantSlug
    ? `/merchants/${input.merchantSlug}`
    : `/merchants/${input.merchantId}`;

  return {
    merchantAnalyticsRoute: `${merchantBase}/analytics`,
    productAnalyticsRoute: input.productId
      ? `${merchantBase}/analytics/products/${input.productId}`
      : `${merchantBase}/analytics/products`,
    artistAttributionRoute: input.artistId
      ? `${merchantBase}/analytics/artists/${input.artistId}`
      : `${merchantBase}/analytics/artists`,
    campaignAnalyticsRoute: input.campaignId
      ? `${merchantBase}/analytics/campaigns/${input.campaignId}`
      : `${merchantBase}/analytics/campaigns`,
  };
}

export function buildMerchantCampaignAnalyticsRoute(
  merchantSlug: string,
  campaignId: string
): string {
  return `/merchants/${merchantSlug}/analytics/campaigns/${campaignId}`;
}

export function buildMerchantArtistAttributionRoute(
  merchantSlug: string,
  artistId: string
): string {
  return `/merchants/${merchantSlug}/analytics/artists/${artistId}`;
}

export function buildMerchantProductAnalyticsRoute(
  merchantSlug: string,
  productId: string
): string {
  return `/merchants/${merchantSlug}/analytics/products/${productId}`;
}

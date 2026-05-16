/**
 * MerchantRoutingEngine
 * All route paths for merchant lifecycle:
 * profile, signup, products, sponsor artist, promotions, prize submissions.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type MerchantRoutes = {
  merchantProfileRoute: string;
  merchantSignupRoute: string;
  merchantDashboardRoute: string;
  merchantProductsRoute: string;
  merchantPromotionsRoute: string;
  merchantPrizeSubmissionRoute: string;
  sponsorArtistRoute: string;
};

export type MerchantProductRoutes = {
  productDetailRoute: string;
  productBuyRoute: string;
  productPromoteRoute: string;
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildMerchantRoutes(input: {
  merchantId: string;
  merchantSlug?: string;
  artistId?: string;
  contestId?: string;
}): MerchantRoutes {
  const base = input.merchantSlug
    ? `/merchants/${input.merchantSlug}`
    : `/merchants/${input.merchantId}`;

  return {
    merchantProfileRoute: base,
    merchantSignupRoute: `/merchants/signup`,
    merchantDashboardRoute: `${base}/dashboard`,
    merchantProductsRoute: `${base}/products`,
    merchantPromotionsRoute: `${base}/promotions`,
    merchantPrizeSubmissionRoute: input.contestId
      ? `${base}/prizes/submit?contest=${input.contestId}`
      : `${base}/prizes/submit`,
    sponsorArtistRoute: input.artistId
      ? `${base}/sponsor?artist=${input.artistId}`
      : `${base}/sponsor`,
  };
}

export function buildMerchantProductRoutes(input: {
  merchantSlug: string;
  productId: string;
  artistId?: string;
}): MerchantProductRoutes {
  const base = `/merchants/${input.merchantSlug}/products/${input.productId}`;
  return {
    productDetailRoute: base,
    productBuyRoute: input.artistId ? `${base}/buy?ref=${input.artistId}` : `${base}/buy`,
    productPromoteRoute: input.artistId
      ? `${base}/promote?artist=${input.artistId}`
      : `${base}/promote`,
  };
}

export function buildMerchantSignupRoute(referralArtistId?: string): string {
  return referralArtistId
    ? `/merchants/signup?ref=${referralArtistId}`
    : `/merchants/signup`;
}

export function buildMerchantCampaignRoute(merchantSlug: string, artistId?: string): string {
  const base = `/merchants/${merchantSlug}/campaigns`;
  return artistId ? `${base}?artist=${artistId}` : base;
}

export function buildMerchantAnalyticsRoute(merchantSlug: string): string {
  return `/merchants/${merchantSlug}/analytics`;
}

export function buildPrizeSubmissionRoute(merchantSlug: string, poolTarget: string): string {
  return `/merchants/${merchantSlug}/prizes/submit?pool=${poolTarget}`;
}

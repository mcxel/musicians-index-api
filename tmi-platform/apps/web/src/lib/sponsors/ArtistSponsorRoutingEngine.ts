/**
 * ArtistSponsorRoutingEngine
 * All route paths for artist sponsor lifecycle:
 * signup, sponsor profile, artist profile sponsor view, product promotion, prize submission.
 */

import type { SponsorClass } from "./ArtistSponsorPricingEngine";

export type ArtistSponsorRoutes = {
  artistSponsorSignupRoute: string;
  sponsorProfileRoute: string;
  artistProfileSponsorRoute: string;
  productPromotionRoute: string;
  prizeSubmissionRoute: string;
  manageSponsorsRoute: string;
  upgradeRoute: string;
};

export type MerchantSponsorRoutes = {
  merchantSignupRoute: string;
  merchantProfileRoute: string;
  merchantCampaignRoute: string;
  merchantDashboardRoute: string;
  merchantProductRoute: string;
};

export function buildArtistSponsorRoutes(input: {
  artistId: string;
  sponsorId?: string;
  sponsorClass?: SponsorClass;
  productId?: string;
  contestId?: string;
}): ArtistSponsorRoutes {
  const base = `/artists/${input.artistId}/sponsors`;

  return {
    artistSponsorSignupRoute: input.sponsorClass
      ? `${base}/signup?class=${input.sponsorClass}`
      : `${base}/signup`,
    sponsorProfileRoute: input.sponsorId
      ? `/sponsors/${input.sponsorId}`
      : `/sponsors`,
    artistProfileSponsorRoute: `${base}`,
    productPromotionRoute: input.productId
      ? `${base}/products/${input.productId}`
      : `${base}/products`,
    prizeSubmissionRoute: input.contestId
      ? `/contests/${input.contestId}/prizes/submit?artist=${input.artistId}`
      : `/prizes/submit?artist=${input.artistId}`,
    manageSponsorsRoute: `${base}/manage`,
    upgradeRoute: `/subscriptions/artist/upgrade`,
  };
}

export function buildMerchantSponsorRoutes(input: {
  merchantId: string;
  artistId?: string;
  productId?: string;
}): MerchantSponsorRoutes {
  const base = `/merchants/${input.merchantId}`;

  return {
    merchantSignupRoute: `/merchants/signup`,
    merchantProfileRoute: base,
    merchantCampaignRoute: input.artistId
      ? `${base}/campaigns?artist=${input.artistId}`
      : `${base}/campaigns`,
    merchantDashboardRoute: `${base}/dashboard`,
    merchantProductRoute: input.productId
      ? `${base}/products/${input.productId}`
      : `${base}/products`,
  };
}

export function buildSponsorSignupRoute(artistId: string, sponsorClass: SponsorClass): string {
  return `/artists/${artistId}/sponsors/signup?class=${sponsorClass}`;
}

export function buildSponsorQrUrl(sponsorId: string, artistId: string): string {
  return `/qr/sponsor/${sponsorId}?artist=${artistId}`;
}

export function buildCouponRedemptionRoute(couponCode: string, merchantId: string): string {
  return `/redeem/${couponCode}?merchant=${merchantId}`;
}

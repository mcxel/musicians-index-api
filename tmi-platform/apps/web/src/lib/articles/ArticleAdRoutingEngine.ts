/**
 * ArticleAdRoutingEngine
 * Route builder for article ad commerce and analytics flows.
 */

import { buildCheckoutRoutes } from "../checkout/CheckoutRoutingEngine";

export type ArticleAdRoutes = {
  checkoutRoute: string;
  campaignRoute: string;
  analyticsRoute: string;
  advertiserRoute: string;
};

export function buildArticleAdRoutes(input: {
  campaignId: string;
  advertiserId: string;
  articleId?: string;
  checkoutId?: string;
  orderId?: string;
}): ArticleAdRoutes {
  const checkout = buildCheckoutRoutes({
    productType: "article-ad",
    productId: input.campaignId,
    customerId: input.advertiserId,
    checkoutId: input.checkoutId,
    orderId: input.orderId,
  });

  const campaignBase = `/articles/ads/campaigns/${encodeURIComponent(input.campaignId)}`;

  return {
    checkoutRoute: checkout.checkoutRoute,
    campaignRoute: input.articleId
      ? `${campaignBase}?articleId=${encodeURIComponent(input.articleId)}`
      : campaignBase,
    analyticsRoute: `${campaignBase}/analytics`,
    advertiserRoute: `/advertisers/${encodeURIComponent(input.advertiserId)}/hub`,
  };
}

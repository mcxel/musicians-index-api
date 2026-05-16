/**
 * CheckoutRoutingEngine
 * Route builder for universal checkout lifecycle.
 */

export type CheckoutProductType =
  | "subscription"
  | "ticket"
  | "beat"
  | "sponsor-package"
  | "artist-local-sponsor"
  | "venue-promotion"
  | "article-ad"
  | "merchant-promotion"
  | "nft"
  | "store-product"
  | "contest-entry"
  | "custom-product";

export type CheckoutRoutes = {
  checkoutRoute: string;
  successRoute: string;
  cancelRoute: string;
  receiptRoute: string;
  supportRoute: string;
};

export function buildCheckoutRoutes(input: {
  productType: CheckoutProductType;
  productId: string;
  customerId?: string;
  checkoutId?: string;
  orderId?: string;
}): CheckoutRoutes {
  const checkoutQuery = `type=${encodeURIComponent(input.productType)}&id=${encodeURIComponent(input.productId)}`;
  const customerQuery = input.customerId ? `&customer=${encodeURIComponent(input.customerId)}` : "";

  return {
    checkoutRoute: `/checkout?${checkoutQuery}${customerQuery}`,
    successRoute: input.checkoutId
      ? `/checkout/success?checkoutId=${encodeURIComponent(input.checkoutId)}`
      : `/checkout/success`,
    cancelRoute: input.checkoutId
      ? `/checkout/cancel?checkoutId=${encodeURIComponent(input.checkoutId)}`
      : `/checkout/cancel`,
    receiptRoute: input.orderId
      ? `/checkout/receipt/${encodeURIComponent(input.orderId)}`
      : `/checkout/receipt`,
    supportRoute: `/checkout/support`,
  };
}

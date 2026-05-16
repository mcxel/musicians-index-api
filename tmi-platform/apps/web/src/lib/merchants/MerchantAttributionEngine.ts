/**
 * MerchantAttributionEngine
 * Merchant attribution trust layer:
 * impression, click, QR scan, coupon redemption, product click, checkout callback.
 */

export type MerchantAttributionEventType =
  | "impression"
  | "click"
  | "qr-scan"
  | "coupon-redemption"
  | "product-click"
  | "checkout-callback";

export type MerchantAttributionEvent = {
  attributionId: string;
  eventType: MerchantAttributionEventType;
  merchantId: string;
  artistId: string;
  productId?: string;
  promotionId?: string;
  couponCode?: string;
  qrCodeId?: string;
  checkoutId?: string;
  sessionId?: string;
  route?: string;
  orderValueCents?: number;
  timestampMs: number;
};

export type MerchantAttributionSummary = {
  merchantId: string;
  impressions: number;
  clicks: number;
  qrScans: number;
  couponRedemptions: number;
  productClicks: number;
  checkoutCallbacks: number;
  revenueAttributedCents: number;
};

const attributionEvents: MerchantAttributionEvent[] = [];
let attributionCounter = 0;

function pushEvent(
  event: Omit<MerchantAttributionEvent, "attributionId" | "timestampMs">
): MerchantAttributionEvent {
  const full: MerchantAttributionEvent = {
    ...event,
    attributionId: `merchant-attr-${++attributionCounter}`,
    timestampMs: Date.now(),
  };
  attributionEvents.unshift(full);
  return full;
}

export function trackMerchantImpression(input: {
  merchantId: string;
  artistId: string;
  promotionId?: string;
  productId?: string;
  route?: string;
  sessionId?: string;
}): MerchantAttributionEvent {
  return pushEvent({ eventType: "impression", ...input });
}

export function trackMerchantClick(input: {
  merchantId: string;
  artistId: string;
  promotionId?: string;
  productId?: string;
  route?: string;
  sessionId?: string;
}): MerchantAttributionEvent {
  return pushEvent({ eventType: "click", ...input });
}

export function trackMerchantQrScan(input: {
  merchantId: string;
  artistId: string;
  qrCodeId: string;
  promotionId?: string;
  productId?: string;
  route?: string;
  sessionId?: string;
}): MerchantAttributionEvent {
  return pushEvent({ eventType: "qr-scan", ...input });
}

export function trackMerchantCouponRedemption(input: {
  merchantId: string;
  artistId: string;
  couponCode: string;
  checkoutId?: string;
  productId?: string;
  promotionId?: string;
  route?: string;
  sessionId?: string;
  orderValueCents?: number;
}): MerchantAttributionEvent {
  return pushEvent({ eventType: "coupon-redemption", ...input });
}

export function trackMerchantProductClick(input: {
  merchantId: string;
  artistId: string;
  productId: string;
  promotionId?: string;
  route?: string;
  sessionId?: string;
}): MerchantAttributionEvent {
  return pushEvent({ eventType: "product-click", ...input });
}

export function trackMerchantCheckoutCallback(input: {
  merchantId: string;
  artistId: string;
  checkoutId: string;
  orderValueCents: number;
  productId?: string;
  promotionId?: string;
  couponCode?: string;
  route?: string;
  sessionId?: string;
}): MerchantAttributionEvent {
  return pushEvent({ eventType: "checkout-callback", ...input });
}

export function listMerchantAttributionEvents(filters?: {
  merchantId?: string;
  artistId?: string;
  productId?: string;
  promotionId?: string;
  eventType?: MerchantAttributionEventType;
}): MerchantAttributionEvent[] {
  return attributionEvents.filter((event) => {
    if (filters?.merchantId && event.merchantId !== filters.merchantId) return false;
    if (filters?.artistId && event.artistId !== filters.artistId) return false;
    if (filters?.productId && event.productId !== filters.productId) return false;
    if (filters?.promotionId && event.promotionId !== filters.promotionId) return false;
    if (filters?.eventType && event.eventType !== filters.eventType) return false;
    return true;
  });
}

export function summarizeMerchantAttribution(merchantId: string): MerchantAttributionSummary {
  const merchantEvents = listMerchantAttributionEvents({ merchantId });
  const impressions = merchantEvents.filter((event) => event.eventType === "impression").length;
  const clicks = merchantEvents.filter((event) => event.eventType === "click").length;
  const qrScans = merchantEvents.filter((event) => event.eventType === "qr-scan").length;
  const couponRedemptions = merchantEvents.filter((event) => event.eventType === "coupon-redemption").length;
  const productClicks = merchantEvents.filter((event) => event.eventType === "product-click").length;
  const checkoutCallbacks = merchantEvents.filter((event) => event.eventType === "checkout-callback").length;
  const revenueAttributedCents = merchantEvents
    .filter((event) => event.eventType === "checkout-callback")
    .reduce((sum, event) => sum + (event.orderValueCents ?? 0), 0);

  return {
    merchantId,
    impressions,
    clicks,
    qrScans,
    couponRedemptions,
    productClicks,
    checkoutCallbacks,
    revenueAttributedCents,
  };
}

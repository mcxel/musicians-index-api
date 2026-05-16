/**
 * ArtistSponsorAttributionEngine
 * Tracks every verifiable event in the sponsor → artist → audience → conversion chain.
 * Events: impression, click, QR scan, coupon redemption, product click, checkout callback.
 * This is the hinge that makes merchants scale their spend.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttributionEventType =
  | "impression"
  | "click"
  | "qr-scan"
  | "coupon-redemption"
  | "product-click"
  | "checkout-callback";

export type AttributionEvent = {
  eventId: string;
  eventType: AttributionEventType;
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementId: string;
  productId?: string;
  couponCode?: string;
  orderAmountCents?: number;
  viewerSessionId?: string;
  location?: string;
  timestampMs: number;
};

export type SponsorAttributionSummary = {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  impressions: number;
  clicks: number;
  qrScans: number;
  couponRedemptions: number;
  productClicks: number;
  checkoutCallbacks: number;
  totalAttributedRevenueCents: number;
  clickThroughRate: number;          // clicks / impressions
  conversionRate: number;            // checkouts / clicks
};

export type ArtistAttributionSummary = {
  artistId: string;
  totalImpressions: number;
  totalClicks: number;
  totalQrScans: number;
  totalCouponRedemptions: number;
  totalProductClicks: number;
  totalCheckoutCallbacks: number;
  totalAttributedRevenueCents: number;
  sponsorCount: number;
  bestPerformingSponsorId: string | null;
  bestPerformingProductId: string | null;
};

export type MerchantAttributionSummary = {
  merchantId: string;
  totalImpressions: number;
  totalClicks: number;
  totalQrScans: number;
  totalCouponRedemptions: number;
  totalAttributedRevenueCents: number;
  sponsoredArtistCount: number;
  bestPerformingArtistId: string | null;
  roi: number;                        // attributedRevenue / totalSpent (0 if totalSpent unknown)
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const events: AttributionEvent[] = [];
let eventCounter = 0;

function pushEvent(evt: Omit<AttributionEvent, "eventId" | "timestampMs">): AttributionEvent {
  const full: AttributionEvent = {
    ...evt,
    eventId: `attr-${++eventCounter}`,
    timestampMs: Date.now(),
  };
  events.unshift(full);
  return full;
}

// ─── Track functions ──────────────────────────────────────────────────────────

export function trackImpression(input: {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementId: string;
  viewerSessionId?: string;
}): AttributionEvent {
  return pushEvent({ eventType: "impression", productId: undefined, couponCode: undefined, orderAmountCents: undefined, location: undefined, ...input });
}

export function trackClick(input: {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementId: string;
  productId?: string;
  viewerSessionId?: string;
}): AttributionEvent {
  return pushEvent({ eventType: "click", couponCode: undefined, orderAmountCents: undefined, location: undefined, ...input });
}

export function trackQrScan(input: {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementId: string;
  location?: string;
  viewerSessionId?: string;
}): AttributionEvent {
  return pushEvent({ eventType: "qr-scan", productId: undefined, couponCode: undefined, orderAmountCents: undefined, ...input });
}

export function trackCouponRedemption(input: {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementId: string;
  couponCode: string;
  orderAmountCents: number;
  viewerSessionId?: string;
}): AttributionEvent {
  return pushEvent({ eventType: "coupon-redemption", productId: undefined, location: undefined, ...input });
}

export function trackProductClick(input: {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementId: string;
  productId: string;
  viewerSessionId?: string;
}): AttributionEvent {
  return pushEvent({ eventType: "product-click", couponCode: undefined, orderAmountCents: undefined, location: undefined, ...input });
}

export function trackCheckoutCallback(input: {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementId: string;
  productId?: string;
  orderAmountCents: number;
  viewerSessionId?: string;
}): AttributionEvent {
  return pushEvent({ eventType: "checkout-callback", couponCode: undefined, location: undefined, ...input });
}

// ─── Summary builders ─────────────────────────────────────────────────────────

export function getSponsorAttributionSummary(sponsorId: string): SponsorAttributionSummary {
  const sponsorEvts = events.filter((e) => e.sponsorId === sponsorId);

  const impressions = sponsorEvts.filter((e) => e.eventType === "impression").length;
  const clicks = sponsorEvts.filter((e) => e.eventType === "click").length;
  const qrScans = sponsorEvts.filter((e) => e.eventType === "qr-scan").length;
  const couponRedemptions = sponsorEvts.filter((e) => e.eventType === "coupon-redemption").length;
  const productClicks = sponsorEvts.filter((e) => e.eventType === "product-click").length;
  const checkouts = sponsorEvts.filter((e) => e.eventType === "checkout-callback");
  const totalAttributedRevenueCents = checkouts.reduce((s, e) => s + (e.orderAmountCents ?? 0), 0);

  const firstEvt = sponsorEvts[0];
  return {
    sponsorId,
    artistId: firstEvt?.artistId ?? "",
    merchantId: firstEvt?.merchantId ?? "",
    impressions,
    clicks,
    qrScans,
    couponRedemptions,
    productClicks,
    checkoutCallbacks: checkouts.length,
    totalAttributedRevenueCents,
    clickThroughRate: impressions > 0 ? clicks / impressions : 0,
    conversionRate: clicks > 0 ? checkouts.length / clicks : 0,
  };
}

export function getArtistAttributionSummary(artistId: string): ArtistAttributionSummary {
  const artistEvts = events.filter((e) => e.artistId === artistId);

  // best sponsor: highest checkout revenue
  const sponsorRevenue = new Map<string, number>();
  const productRevenue = new Map<string, number>();
  artistEvts.filter((e) => e.eventType === "checkout-callback").forEach((e) => {
    sponsorRevenue.set(e.sponsorId, (sponsorRevenue.get(e.sponsorId) ?? 0) + (e.orderAmountCents ?? 0));
    if (e.productId) productRevenue.set(e.productId, (productRevenue.get(e.productId) ?? 0) + (e.orderAmountCents ?? 0));
  });

  const bestSponsor = [...sponsorRevenue.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const bestProduct = [...productRevenue.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const uniqueSponsors = new Set(artistEvts.map((e) => e.sponsorId)).size;
  const totalRev = [...sponsorRevenue.values()].reduce((s, v) => s + v, 0);

  return {
    artistId,
    totalImpressions: artistEvts.filter((e) => e.eventType === "impression").length,
    totalClicks: artistEvts.filter((e) => e.eventType === "click").length,
    totalQrScans: artistEvts.filter((e) => e.eventType === "qr-scan").length,
    totalCouponRedemptions: artistEvts.filter((e) => e.eventType === "coupon-redemption").length,
    totalProductClicks: artistEvts.filter((e) => e.eventType === "product-click").length,
    totalCheckoutCallbacks: artistEvts.filter((e) => e.eventType === "checkout-callback").length,
    totalAttributedRevenueCents: totalRev,
    sponsorCount: uniqueSponsors,
    bestPerformingSponsorId: bestSponsor,
    bestPerformingProductId: bestProduct,
  };
}

export function getMerchantAttributionSummary(merchantId: string): MerchantAttributionSummary {
  const merchantEvts = events.filter((e) => e.merchantId === merchantId);

  const checkouts = merchantEvts.filter((e) => e.eventType === "checkout-callback");
  const totalRev = checkouts.reduce((s, e) => s + (e.orderAmountCents ?? 0), 0);
  const uniqueArtists = new Set(merchantEvts.map((e) => e.artistId));

  // best artist by attributed revenue
  const artistRevenue = new Map<string, number>();
  checkouts.forEach((e) => {
    artistRevenue.set(e.artistId, (artistRevenue.get(e.artistId) ?? 0) + (e.orderAmountCents ?? 0));
  });
  const bestArtist = [...artistRevenue.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    merchantId,
    totalImpressions: merchantEvts.filter((e) => e.eventType === "impression").length,
    totalClicks: merchantEvts.filter((e) => e.eventType === "click").length,
    totalQrScans: merchantEvts.filter((e) => e.eventType === "qr-scan").length,
    totalCouponRedemptions: merchantEvts.filter((e) => e.eventType === "coupon-redemption").length,
    totalAttributedRevenueCents: totalRev,
    sponsoredArtistCount: uniqueArtists.size,
    bestPerformingArtistId: bestArtist,
    roi: 0,  // set by caller with totalSpent context
  };
}

export function listAttributionEvents(filters?: {
  artistId?: string;
  merchantId?: string;
  sponsorId?: string;
  eventType?: AttributionEventType;
}): AttributionEvent[] {
  return events.filter((e) => {
    if (filters?.artistId && e.artistId !== filters.artistId) return false;
    if (filters?.merchantId && e.merchantId !== filters.merchantId) return false;
    if (filters?.sponsorId && e.sponsorId !== filters.sponsorId) return false;
    if (filters?.eventType && e.eventType !== filters.eventType) return false;
    return true;
  });
}

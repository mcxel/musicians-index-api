/**
 * MerchantROIEngine
 * Computes merchant ROI and top-performing artist/product from attribution + conversion data.
 */

import { summarizeMerchantAttribution, listMerchantAttributionEvents } from "./MerchantAttributionEngine";
import { summarizeMerchantConversions, listMerchantConversions } from "./MerchantConversionEngine";

export type MerchantROISummary = {
  merchantId: string;
  spendCents: number;
  clicks: number;
  scans: number;
  redemptions: number;
  sales: number;
  revenueCents: number;
  roi: number;
  bestPerformingArtistId: string | null;
  bestPerformingProductId: string | null;
};

export function computeMerchantROI(input: {
  merchantId: string;
  spendCents: number;
}): MerchantROISummary {
  const attribution = summarizeMerchantAttribution(input.merchantId);
  const conversionSummary = summarizeMerchantConversions(input.merchantId);
  const events = listMerchantAttributionEvents({ merchantId: input.merchantId });
  const conversions = listMerchantConversions({ merchantId: input.merchantId });

  const artistRevenueMap = new Map<string, number>();
  conversions.forEach((event) => {
    artistRevenueMap.set(
      event.artistId,
      (artistRevenueMap.get(event.artistId) ?? 0) + event.conversionValueCents
    );
  });

  const productRevenueMap = new Map<string, number>();
  conversions.forEach((event) => {
    if (!event.productId) return;
    productRevenueMap.set(
      event.productId,
      (productRevenueMap.get(event.productId) ?? 0) + event.conversionValueCents
    );
  });

  const bestPerformingArtistId =
    [...artistRevenueMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const bestPerformingProductId =
    [...productRevenueMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const sales = conversions.filter((event) =>
    event.conversionType === "sale" ||
    event.conversionType === "coupon-sale" ||
    event.conversionType === "qr-sale"
  ).length;

  const revenueCents = conversionSummary.totalValueCents || attribution.revenueAttributedCents;
  const roi = input.spendCents > 0 ? (revenueCents - input.spendCents) / input.spendCents : 0;

  return {
    merchantId: input.merchantId,
    spendCents: input.spendCents,
    clicks: attribution.clicks,
    scans: attribution.qrScans,
    redemptions: attribution.couponRedemptions,
    sales,
    revenueCents,
    roi,
    bestPerformingArtistId,
    bestPerformingProductId,
  };
}

export function summarizeMerchantFunnel(merchantId: string): {
  merchantId: string;
  impressions: number;
  clicks: number;
  qrScans: number;
  couponRedemptions: number;
  checkoutCallbacks: number;
  conversionRateFromClicks: number;
  conversionRateFromImpressions: number;
} {
  const attribution = summarizeMerchantAttribution(merchantId);
  const checkoutCallbacks = attribution.checkoutCallbacks;

  return {
    merchantId,
    impressions: attribution.impressions,
    clicks: attribution.clicks,
    qrScans: attribution.qrScans,
    couponRedemptions: attribution.couponRedemptions,
    checkoutCallbacks,
    conversionRateFromClicks:
      attribution.clicks > 0 ? checkoutCallbacks / attribution.clicks : 0,
    conversionRateFromImpressions:
      attribution.impressions > 0 ? checkoutCallbacks / attribution.impressions : 0,
  };
}

export function summarizeMerchantTopArtists(merchantId: string, limit = 5): Array<{
  artistId: string;
  revenueCents: number;
  conversions: number;
}> {
  const conversions = listMerchantConversions({ merchantId });
  const buckets = new Map<string, { revenueCents: number; conversions: number }>();

  conversions.forEach((event) => {
    const current = buckets.get(event.artistId) ?? { revenueCents: 0, conversions: 0 };
    current.revenueCents += event.conversionValueCents;
    current.conversions += 1;
    buckets.set(event.artistId, current);
  });

  return [...buckets.entries()]
    .map(([artistId, stats]) => ({ artistId, ...stats }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, limit);
}

export function summarizeMerchantTopProducts(merchantId: string, limit = 5): Array<{
  productId: string;
  revenueCents: number;
  conversions: number;
}> {
  const conversions = listMerchantConversions({ merchantId });
  const buckets = new Map<string, { revenueCents: number; conversions: number }>();

  conversions.forEach((event) => {
    if (!event.productId) return;
    const current = buckets.get(event.productId) ?? { revenueCents: 0, conversions: 0 };
    current.revenueCents += event.conversionValueCents;
    current.conversions += 1;
    buckets.set(event.productId, current);
  });

  return [...buckets.entries()]
    .map(([productId, stats]) => ({ productId, ...stats }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, limit);
}

/**
 * MerchantConversionEngine
 * Definitive conversion records for analytics, ledger, and payout dependencies.
 */

export type MerchantConversionType =
  | "sale"
  | "coupon-sale"
  | "qr-sale"
  | "lead"
  | "booking"
  | "ticket"
  | "custom";

export type MerchantConversionEvent = {
  conversionId: string;
  merchantId: string;
  artistId: string;
  promotionId?: string;
  productId?: string;
  conversionType: MerchantConversionType;
  conversionValueCents: number;
  currency: "USD";
  occurredAtMs: number;
  source: {
    sourceArtistId: string;
    sourcePromotionId?: string;
    sourceProductId?: string;
  };
  metadata?: Record<string, string | number | boolean>;
};

const conversionEvents: MerchantConversionEvent[] = [];
let conversionCounter = 0;

export function recordMerchantConversion(input: {
  merchantId: string;
  artistId: string;
  promotionId?: string;
  productId?: string;
  conversionType: MerchantConversionType;
  conversionValueCents: number;
  metadata?: Record<string, string | number | boolean>;
}): MerchantConversionEvent {
  const event: MerchantConversionEvent = {
    conversionId: `merchant-conv-${++conversionCounter}`,
    merchantId: input.merchantId,
    artistId: input.artistId,
    promotionId: input.promotionId,
    productId: input.productId,
    conversionType: input.conversionType,
    conversionValueCents: input.conversionValueCents,
    currency: "USD",
    occurredAtMs: Date.now(),
    source: {
      sourceArtistId: input.artistId,
      sourcePromotionId: input.promotionId,
      sourceProductId: input.productId,
    },
    metadata: input.metadata,
  };

  conversionEvents.unshift(event);
  return event;
}

export function listMerchantConversions(filters?: {
  merchantId?: string;
  artistId?: string;
  promotionId?: string;
  productId?: string;
  conversionType?: MerchantConversionType;
}): MerchantConversionEvent[] {
  return conversionEvents.filter((event) => {
    if (filters?.merchantId && event.merchantId !== filters.merchantId) return false;
    if (filters?.artistId && event.artistId !== filters.artistId) return false;
    if (filters?.promotionId && event.promotionId !== filters.promotionId) return false;
    if (filters?.productId && event.productId !== filters.productId) return false;
    if (filters?.conversionType && event.conversionType !== filters.conversionType) return false;
    return true;
  });
}

export function getMerchantConversionValue(merchantId: string): number {
  return listMerchantConversions({ merchantId }).reduce(
    (sum, event) => sum + event.conversionValueCents,
    0
  );
}

export function summarizeMerchantConversions(merchantId: string): {
  conversions: number;
  sales: number;
  couponSales: number;
  qrSales: number;
  leads: number;
  bookings: number;
  tickets: number;
  totalValueCents: number;
} {
  const conversions = listMerchantConversions({ merchantId });
  return {
    conversions: conversions.length,
    sales: conversions.filter((event) => event.conversionType === "sale").length,
    couponSales: conversions.filter((event) => event.conversionType === "coupon-sale").length,
    qrSales: conversions.filter((event) => event.conversionType === "qr-sale").length,
    leads: conversions.filter((event) => event.conversionType === "lead").length,
    bookings: conversions.filter((event) => event.conversionType === "booking").length,
    tickets: conversions.filter((event) => event.conversionType === "ticket").length,
    totalValueCents: conversions.reduce((sum, event) => sum + event.conversionValueCents, 0),
  };
}

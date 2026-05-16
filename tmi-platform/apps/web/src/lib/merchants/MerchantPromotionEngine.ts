/**
 * MerchantPromotionEngine
 * Promotion types: banner, video, coupon, product, artist-linked.
 * Promotions connect merchant assets to artist pages, article pages, and homepage surfaces.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PromotionType =
  | "banner"
  | "video"
  | "coupon"
  | "product"
  | "artist-linked";

export type PromotionPlacement =
  | "artist-page"
  | "artist-page-banner"
  | "article-page"
  | "homepage-rail"
  | "magazine-page"
  | "live-room"
  | "contest-page"
  | "game-page";

export type PromotionStatus = "draft" | "active" | "paused" | "expired" | "completed";

export type MerchantPromotion = {
  promotionId: string;
  merchantId: string;
  artistId?: string;
  promotionType: PromotionType;
  placement: PromotionPlacement;
  status: PromotionStatus;
  title: string;
  body?: string;
  assetUrl?: string;
  ctaLabel: string;
  ctaUrl: string;
  couponCode?: string;
  couponDiscountPercent?: number;
  productId?: string;
  budgetCents: number;
  spentCents: number;
  impressions: number;
  clicks: number;
  startDateIso: string;
  endDateIso: string;
  createdAtMs: number;
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const promotions: MerchantPromotion[] = [];
let promotionCounter = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

export function createMerchantPromotion(input: {
  merchantId: string;
  artistId?: string;
  promotionType: PromotionType;
  placement: PromotionPlacement;
  title: string;
  body?: string;
  assetUrl?: string;
  ctaLabel: string;
  ctaUrl: string;
  couponCode?: string;
  couponDiscountPercent?: number;
  productId?: string;
  budgetCents: number;
  startDateIso: string;
  endDateIso: string;
}): MerchantPromotion {
  const promotion: MerchantPromotion = {
    promotionId: `promo-${++promotionCounter}-${input.merchantId}`,
    ...input,
    status: "active",
    spentCents: 0,
    impressions: 0,
    clicks: 0,
    createdAtMs: Date.now(),
  };
  promotions.unshift(promotion);
  return promotion;
}

export function getMerchantPromotions(merchantId: string, onlyActive = false): MerchantPromotion[] {
  return promotions.filter(
    (p) => p.merchantId === merchantId && (!onlyActive || p.status === "active")
  );
}

export function getArtistPromotions(artistId: string): MerchantPromotion[] {
  return promotions.filter((p) => p.artistId === artistId && p.status === "active");
}

export function getPromotionsByPlacement(placement: PromotionPlacement): MerchantPromotion[] {
  return promotions.filter((p) => p.placement === placement && p.status === "active");
}

export function recordPromotionImpression(promotionId: string): void {
  const p = promotions.find((x) => x.promotionId === promotionId);
  if (p) p.impressions += 1;
}

export function recordPromotionClick(promotionId: string, costCents = 0): void {
  const p = promotions.find((x) => x.promotionId === promotionId);
  if (!p) return;
  p.clicks += 1;
  p.spentCents += costCents;
  if (p.spentCents >= p.budgetCents) p.status = "completed";
}

export function pausePromotion(promotionId: string): MerchantPromotion {
  const p = promotions.find((x) => x.promotionId === promotionId);
  if (!p) throw new Error(`Promotion ${promotionId} not found`);
  p.status = "paused";
  return p;
}

export function expireStalePromotions(): number {
  const today = new Date().toISOString().slice(0, 10);
  let count = 0;
  promotions.forEach((p) => {
    if (p.status === "active" && p.endDateIso < today) {
      p.status = "expired";
      count++;
    }
  });
  return count;
}

export function getPromotionSummary(merchantId: string): {
  totalPromotions: number;
  activePromotions: number;
  totalImpressions: number;
  totalClicks: number;
  totalSpentCents: number;
  totalBudgetCents: number;
} {
  const all = promotions.filter((p) => p.merchantId === merchantId);
  const active = all.filter((p) => p.status === "active");
  return {
    totalPromotions: all.length,
    activePromotions: active.length,
    totalImpressions: all.reduce((s, p) => s + p.impressions, 0),
    totalClicks: all.reduce((s, p) => s + p.clicks, 0),
    totalSpentCents: all.reduce((s, p) => s + p.spentCents, 0),
    totalBudgetCents: all.reduce((s, p) => s + p.budgetCents, 0),
  };
}

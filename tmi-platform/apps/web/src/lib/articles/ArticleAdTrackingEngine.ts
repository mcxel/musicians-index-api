/**
 * ArticleAdTrackingEngine
 * Impression, click, CTR, and conversion tracking for article ad campaigns.
 */

export type ArticleAdTrackingSnapshot = {
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  updatedAtMs: number;
};

const tracking = new Map<string, ArticleAdTrackingSnapshot>();

function ensureSnapshot(campaignId: string): ArticleAdTrackingSnapshot {
  const existing = tracking.get(campaignId);
  if (existing) return existing;

  const created: ArticleAdTrackingSnapshot = {
    campaignId,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    conversionRate: 0,
    updatedAtMs: Date.now(),
  };

  tracking.set(campaignId, created);
  return created;
}

function recalc(snapshot: ArticleAdTrackingSnapshot): ArticleAdTrackingSnapshot {
  const ctr = snapshot.impressions > 0 ? snapshot.clicks / snapshot.impressions : 0;
  const conversionRate = snapshot.clicks > 0 ? snapshot.conversions / snapshot.clicks : 0;

  return {
    ...snapshot,
    ctr,
    conversionRate,
    updatedAtMs: Date.now(),
  };
}

export function trackArticleAdImpression(campaignId: string, count = 1): ArticleAdTrackingSnapshot {
  const base = ensureSnapshot(campaignId);
  const next = recalc({
    ...base,
    impressions: base.impressions + Math.max(0, count),
  });

  tracking.set(campaignId, next);
  return next;
}

export function trackArticleAdClick(campaignId: string, count = 1): ArticleAdTrackingSnapshot {
  const base = ensureSnapshot(campaignId);
  const next = recalc({
    ...base,
    clicks: base.clicks + Math.max(0, count),
  });

  tracking.set(campaignId, next);
  return next;
}

export function trackArticleAdConversion(campaignId: string, count = 1): ArticleAdTrackingSnapshot {
  const base = ensureSnapshot(campaignId);
  const next = recalc({
    ...base,
    conversions: base.conversions + Math.max(0, count),
  });

  tracking.set(campaignId, next);
  return next;
}

export function getArticleAdTracking(campaignId: string): ArticleAdTrackingSnapshot {
  return ensureSnapshot(campaignId);
}

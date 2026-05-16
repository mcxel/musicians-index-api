/**
 * AdvertiserAudienceIntelligenceEngine
 * Audience segmentation and engagement intelligence for advertisers.
 */

export type AudienceSegment =
  | "music-fans"
  | "live-event-buyers"
  | "sponsor-responsive"
  | "high-intent-shoppers"
  | "venue-goers"
  | "youth-community"
  | "custom";

export type AudienceSignal = {
  segment: AudienceSegment;
  impressions: number;
  clicks: number;
  conversions: number;
  avgOrderValueCents: number;
};

export type AudienceInsight = AudienceSignal & {
  ctr: number;
  conversionRate: number;
  weightedEngagementScore: number;
};

export function buildAudienceInsights(signals: AudienceSignal[]): AudienceInsight[] {
  return signals
    .map((signal) => {
      const ctr = signal.impressions > 0 ? signal.clicks / signal.impressions : 0;
      const conversionRate = signal.clicks > 0 ? signal.conversions / signal.clicks : 0;
      const weightedEngagementScore = Math.round(
        ctr * 40 + conversionRate * 45 + Math.min(signal.avgOrderValueCents / 1000, 15)
      );

      return {
        ...signal,
        ctr,
        conversionRate,
        weightedEngagementScore,
      };
    })
    .sort((a, b) => b.weightedEngagementScore - a.weightedEngagementScore);
}

export function getTopAudienceSegments(signals: AudienceSignal[], limit = 3): AudienceInsight[] {
  return buildAudienceInsights(signals).slice(0, limit);
}

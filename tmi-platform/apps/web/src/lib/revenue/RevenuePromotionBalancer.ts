/**
 * RevenuePromotionBalancer
 * Fair promotion weighting across all money-generating user groups.
 */

export type RevenueContributorType =
  | "artist"
  | "venue"
  | "merchant"
  | "sponsor"
  | "advertiser"
  | "promoter-event-host";

export type RevenueContributorSignal = {
  contributorId: string;
  contributorType: RevenueContributorType;
  revenueCents: number;
  conversionCount: number;
  retentionScore: number;
  activityScore: number;
};

export type RevenuePromotionEntry = RevenueContributorSignal & {
  promotionWeight: number;
  priorityBand: "baseline" | "boosted" | "priority" | "headline";
};

function bandFromWeight(weight: number): RevenuePromotionEntry["priorityBand"] {
  if (weight >= 85) return "headline";
  if (weight >= 60) return "priority";
  if (weight >= 35) return "boosted";
  return "baseline";
}

export function balanceRevenuePromotion(
  signals: RevenueContributorSignal[]
): RevenuePromotionEntry[] {
  return signals
    .map((signal) => {
      const weight = Math.round(
        signal.revenueCents / 1000 +
        signal.conversionCount * 3 +
        signal.retentionScore * 20 +
        signal.activityScore * 15
      );

      return {
        ...signal,
        promotionWeight: weight,
        priorityBand: bandFromWeight(weight),
      };
    })
    .sort((a, b) => b.promotionWeight - a.promotionWeight);
}

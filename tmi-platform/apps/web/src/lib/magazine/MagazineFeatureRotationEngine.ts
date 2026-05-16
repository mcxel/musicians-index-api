/**
 * MagazineFeatureRotationEngine
 * Rotation helpers for featured artist, venue, event, and sponsor slots.
 */

import { SponsorVisibilityWeightEngine } from "../sponsors/SponsorVisibilityWeightEngine";

export type FeaturedRotationItem = {
  id: string;
  label: string;
  priorityScore?: number;
};

export type FeaturedSponsorCandidate = {
  sponsorId: string;
  name: string;
  totalSpendCents: number;
  campaignPerformanceScore: number;
  activeCampaignsCount: number;
  artistSponsorshipCount: number;
  merchantProductCount: number;
};

function rotateByTime<T extends { id: string }>(items: T[], atMs = Date.now()): T[] {
  if (items.length <= 1) return [...items];
  const index = Math.floor(atMs / 60000) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function sortByPriority<T extends { priorityScore?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
}

export function rotateFeaturedArtists(items: FeaturedRotationItem[], limit = 5): FeaturedRotationItem[] {
  return rotateByTime(sortByPriority(items)).slice(0, limit);
}

export function rotateFeaturedVenues(items: FeaturedRotationItem[], limit = 5): FeaturedRotationItem[] {
  return rotateByTime(sortByPriority(items)).slice(0, limit);
}

export function rotateFeaturedEvents(items: FeaturedRotationItem[], limit = 5): FeaturedRotationItem[] {
  return rotateByTime(sortByPriority(items)).slice(0, limit);
}

export function rotateFeaturedSponsors(
  sponsors: FeaturedSponsorCandidate[],
  limit = 5
): Array<FeaturedRotationItem & { visibilityTier: string }> {
  const weighted = sponsors.map((sponsor) => {
    const visibility = SponsorVisibilityWeightEngine.calculateVisibility({
      sponsorId: sponsor.sponsorId,
      totalSpendCents: sponsor.totalSpendCents,
      campaignPerformanceScore: sponsor.campaignPerformanceScore,
      activeCampaignsCount: sponsor.activeCampaignsCount,
      artistSponsorshipCount: sponsor.artistSponsorshipCount,
      merchantProductCount: sponsor.merchantProductCount,
    });

    return {
      id: sponsor.sponsorId,
      label: sponsor.name,
      priorityScore: visibility.sponsorPriorityScore,
      visibilityTier: visibility.visibilityTier,
    };
  });

  return rotateByTime(sortByPriority(weighted)).slice(0, limit);
}

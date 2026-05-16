// DiscoveryPoolEngine
// Builds the pool of artists eligible for issue placement.
// Sources: new, rising, battle winners, editorial picks, regional, sponsor picks, staff picks.

import type { DiscoveryArtist, ArtistTier } from "./types";

// Tier base weights — not final, modified by ExposureCooldownEngine and TopTenPriorityEngine
export const TIER_BASE_WEIGHTS: Record<ArtistTier, number> = {
  "top10":            10,
  "new":               8,
  "rising":            7,
  "active-performer":  8,
  "established":       4,
};

export const PROMOTION_MULTIPLIERS: Record<string, number> = {
  "paid-boost":     9,
  "battle-winner":  8,
  "editorial-pick": 7,
  "staff-pick":     6,
  "sponsor-pick":   5,
  "none":           1,
};

export function buildDiscoveryPool(artists: DiscoveryArtist[]): DiscoveryArtist[] {
  // Exclude artists already shown this session
  return artists.filter(a => !a.shownThisSession && !a.shownThisIssue);
}

export function computeBaseWeight(artist: DiscoveryArtist): number {
  const tier = TIER_BASE_WEIGHTS[artist.tier] ?? 5;
  const promo = PROMOTION_MULTIPLIERS[artist.promotionType] ?? 1;
  return tier * promo;
}

export function selectFromPool(
  pool: DiscoveryArtist[],
  count: number,
): DiscoveryArtist[] {
  if (pool.length <= count) return [...pool];

  const selected: DiscoveryArtist[] = [];
  const remaining = [...pool];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, a) => sum + computeBaseWeight(a), 0);
    let rng = Math.random() * totalWeight;
    let chosen: DiscoveryArtist | null = null;

    for (let j = 0; j < remaining.length; j++) {
      rng -= computeBaseWeight(remaining[j]!);
      if (rng <= 0) {
        chosen = remaining[j]!;
        remaining.splice(j, 1);
        break;
      }
    }

    if (chosen) selected.push(chosen);
  }

  return selected;
}

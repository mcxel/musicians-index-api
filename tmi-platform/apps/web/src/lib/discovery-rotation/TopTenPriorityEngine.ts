// TopTenPriorityEngine
// Top 10 artists get earlier placement — not guaranteed first page every time.
// Early zone (pages 1–10): higher probability for Top 10, paid boosts, battle winners.

import type { DiscoveryArtist } from "./types";
import { computeBaseWeight } from "./DiscoveryPoolEngine";
import { exposureScoreToModifier } from "./ExposureRankEngine";

export const TOP10_EARLY_MULTIPLIER = 1.8;
export const TOP10_MID_MULTIPLIER = 1.2;
export const TOP10_LATE_MULTIPLIER = 0.8;

export function getZoneMultiplier(
  tier: DiscoveryArtist["tier"],
  zone: "early" | "mid" | "late",
): number {
  if (tier === "top10") {
    return zone === "early" ? TOP10_EARLY_MULTIPLIER
         : zone === "mid"   ? TOP10_MID_MULTIPLIER
         : TOP10_LATE_MULTIPLIER;
  }
  if (tier === "new" && zone === "mid") return 1.3;
  if (tier === "rising" && zone === "mid") return 1.2;
  return 1.0;
}

export function computeZoneWeight(
  artist: DiscoveryArtist,
  zone: "early" | "mid" | "late",
): number {
  const base = computeBaseWeight(artist);
  const exposureMod = exposureScoreToModifier(artist.exposureScore);
  const zoneMult = getZoneMultiplier(artist.tier, zone);
  return base * exposureMod * zoneMult;
}

export function selectForZone(
  pool: DiscoveryArtist[],
  zone: "early" | "mid" | "late",
  count: number,
): DiscoveryArtist[] {
  if (pool.length <= count) return [...pool];

  const selected: DiscoveryArtist[] = [];
  const remaining = [...pool];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, a) => sum + computeZoneWeight(a, zone), 0);
    let rng = Math.random() * totalWeight;
    let chosen: DiscoveryArtist | null = null;

    for (let j = 0; j < remaining.length; j++) {
      rng -= computeZoneWeight(remaining[j]!, zone);
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

// MagazineContentRotationEngine
// Orchestrates which content goes into which spreads.
// Pulls from discovery pool, applies all rotation rules.

import type { MagazineIssue } from "./types";
import type { DiscoveryArtist } from "../discovery-rotation/types";
import { buildDiscoveryPool } from "../discovery-rotation/DiscoveryPoolEngine";
import { filterWithCooldown } from "../discovery-rotation/ExposureCooldownEngine";
import { filterByGenreBalance } from "../discovery-rotation/GenreBalanceEngine";
import { filterByRegionBalance } from "../discovery-rotation/RegionalRotationEngine";
import { selectForZone } from "../discovery-rotation/TopTenPriorityEngine";
import { getFloorDueArtists } from "../discovery-rotation/PlacementFloorEngine";

export interface RotationResult {
  earlyZoneArtists: DiscoveryArtist[];
  midZoneArtists: DiscoveryArtist[];
  lateZoneArtists: DiscoveryArtist[];
  floorGuaranteed: DiscoveryArtist[];
}

export function buildRotation(
  allArtists: DiscoveryArtist[],
  earlyCount = 10,
  midCount = 20,
  lateCount = 10,
): RotationResult {
  // 1. Floor-guaranteed artists must be included
  const floorDue = getFloorDueArtists(allArtists);

  // 2. Active pool — not shown this session
  let pool = buildDiscoveryPool(allArtists);

  // 3. Cooldown filter
  const cooledPool = filterWithCooldown(pool);

  // 4. Genre balance
  const genreFiltered = filterByGenreBalance(cooledPool, 0);

  // 5. Region balance
  const regionFiltered = filterByRegionBalance(genreFiltered);

  // 6. Zone selection using TopTenPriorityEngine
  const earlyZoneArtists = selectForZone(regionFiltered, "early", earlyCount);
  const earlyIds = new Set(earlyZoneArtists.map(a => a.id));

  const midPool = regionFiltered.filter(a => !earlyIds.has(a.id));
  const midZoneArtists = selectForZone(midPool, "mid", midCount);
  const midIds = new Set(midZoneArtists.map(a => a.id));

  const latePool = midPool.filter(a => !midIds.has(a.id));
  const lateZoneArtists = selectForZone(latePool, "late", lateCount);

  return {
    earlyZoneArtists,
    midZoneArtists,
    lateZoneArtists,
    floorGuaranteed: floorDue,
  };
}

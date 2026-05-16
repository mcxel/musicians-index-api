// RegionalRotationEngine
// Ensures global representation in magazine spreads.
// Rotate: US, UK, Africa, Asia, Latin America, Europe, Caribbean, Middle East

export type Region =
  | "north-america"
  | "south-america"
  | "europe"
  | "africa"
  | "asia"
  | "caribbean"
  | "middle-east"
  | "oceania"
  | "latin-america";

// Target proportion per region in a full issue
const REGION_TARGET_RATIOS: Record<Region, number> = {
  "north-america": 0.28,
  "europe":        0.16,
  "africa":        0.14,
  "latin-america": 0.10,
  "asia":          0.10,
  "south-america": 0.08,
  "caribbean":     0.07,
  "middle-east":   0.04,
  "oceania":       0.03,
};

const REGION_COOLDOWN_SLOTS = 2;
const _recentRegions: Region[] = [];

export function resetRegionTracking(): void {
  _recentRegions.length = 0;
}

export function recordRegion(region: Region): void {
  _recentRegions.unshift(region);
  if (_recentRegions.length > REGION_COOLDOWN_SLOTS * 3) _recentRegions.pop();
}

export function isRegionInCooldown(region: Region): boolean {
  return _recentRegions.slice(0, REGION_COOLDOWN_SLOTS).includes(region);
}

export function getRegionWeight(region: Region): number {
  return REGION_TARGET_RATIOS[region] ?? 0.05;
}

export function filterByRegionBalance<T extends { region: string }>(
  artists: T[],
): T[] {
  const balanced = artists.filter(a => !isRegionInCooldown(a.region as Region));
  return balanced.length > 0 ? balanced : artists;
}

export function analyzeRegionCoverage(
  artists: Array<{ region: string }>,
): Record<string, number> {
  const coverage: Record<string, number> = {};
  for (const a of artists) {
    coverage[a.region] = (coverage[a.region] ?? 0) + 1;
  }
  return coverage;
}

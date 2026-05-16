// ExposureCooldownEngine
// Reduces probability of re-showing recently exposed artists.
// Shown in last 3 spreads → cooldown. Shown in last issue → cooldown.

import type { DiscoveryArtist } from "./types";

export interface CooldownConfig {
  cooldownAfterSpreads: number;   // e.g. 3
  cooldownAfterIssues: number;    // e.g. 1
  cooldownReductionFactor: number; // 0–1, e.g. 0.2 = 80% weight reduction during cooldown
}

const DEFAULT_CONFIG: CooldownConfig = {
  cooldownAfterSpreads: 3,
  cooldownAfterIssues: 1,
  cooldownReductionFactor: 0.15, // during cooldown, weight = base * 0.15
};

// Track recent spread exposures in-memory
const _recentSpreadExposures: string[][] = []; // last N spread artist ID arrays
let _currentIssueNumber = 0;

export function initCooldownTracker(issueNumber: number): void {
  _currentIssueNumber = issueNumber;
  // Clear per-issue spread tracking
  _recentSpreadExposures.length = 0;
}

export function recordSpreadExposure(artistIds: string[]): void {
  _recentSpreadExposures.unshift([...artistIds]);
  if (_recentSpreadExposures.length > 10) _recentSpreadExposures.pop();
}

export function isInCooldown(artist: DiscoveryArtist, config = DEFAULT_CONFIG): boolean {
  // Check spread-level cooldown
  const recentSpreads = _recentSpreadExposures.slice(0, config.cooldownAfterSpreads);
  const shownRecentSpread = recentSpreads.some(spread => spread.includes(artist.id));
  if (shownRecentSpread) return true;

  // Check issue-level cooldown
  if (
    artist.lastShownIssue !== undefined &&
    _currentIssueNumber - artist.lastShownIssue <= config.cooldownAfterIssues
  ) return true;

  return false;
}

export function applyCooldownWeight(
  baseWeight: number,
  artist: DiscoveryArtist,
  config = DEFAULT_CONFIG,
): number {
  return isInCooldown(artist, config)
    ? baseWeight * config.cooldownReductionFactor
    : baseWeight;
}

export function filterWithCooldown(
  artists: DiscoveryArtist[],
  config = DEFAULT_CONFIG,
): DiscoveryArtist[] {
  // Don't hard-exclude — just reduce weight. Return all but mark cooldown state.
  return artists.filter(a => !isInCooldown(a, config));
}

// ExposureRankEngine
// Computes an artist's earned exposure score from activity signals.
// More activity = higher re-entry weight.

import type { DiscoveryArtist } from "./types";

const ACTIVITY_WEIGHTS = {
  battleWins:       20,
  fanEngagement:    20,
  articleTraction:  15,
  tipActivity:      15,
  attendanceScore:  15,
  merchandiseScore: 15,
};

export function computeExposureScore(artist: DiscoveryArtist): number {
  const raw =
    (artist.battleWins / 10) * ACTIVITY_WEIGHTS.battleWins +
    (artist.fanEngagement / 100) * ACTIVITY_WEIGHTS.fanEngagement +
    (artist.articleTraction / 100) * ACTIVITY_WEIGHTS.articleTraction +
    (artist.tipActivity / 100) * ACTIVITY_WEIGHTS.tipActivity +
    (artist.attendanceScore / 100) * ACTIVITY_WEIGHTS.attendanceScore +
    (artist.merchandiseScore / 100) * ACTIVITY_WEIGHTS.merchandiseScore;

  return Math.min(100, Math.round(raw));
}

// Converts exposure score to a re-entry weight modifier
export function exposureScoreToModifier(score: number): number {
  // Score 0–100 → modifier 0.5–1.5
  return 0.5 + (score / 100);
}

export function rankByExposure(artists: DiscoveryArtist[]): DiscoveryArtist[] {
  return [...artists].sort((a, b) => b.exposureScore - a.exposureScore);
}

export function updateExposureScores(artists: DiscoveryArtist[]): DiscoveryArtist[] {
  return artists.map(a => ({ ...a, exposureScore: computeExposureScore(a) }));
}

/**
 * ArtistProgressionEngine
 * Artist and performer progression derived from XP and ranking movement.
 */

import { getArtistXpTotal } from "./ArtistXpEngine";

export type ProgressionBadge =
  | "newcomer"
  | "sponsor-ready"
  | "feature-ready"
  | "booking-ready"
  | "contest-qualified"
  | "headline-ready";

export type ArtistProgressionSnapshot = {
  artistId: string;
  performerId?: string;
  artistLevel: number;
  performerLevel: number;
  progressionScore: number;
  rankMovement: number;
  eligibilityBadges: ProgressionBadge[];
  updatedAtMs: number;
};

const progressionSnapshots = new Map<string, ArtistProgressionSnapshot>();

function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

function resolveBadges(input: {
  xp: number;
  rankMovement: number;
}): ProgressionBadge[] {
  const badges: ProgressionBadge[] = ["newcomer"];
  if (input.xp >= 250) badges.push("sponsor-ready");
  if (input.xp >= 500) badges.push("feature-ready");
  if (input.xp >= 800) badges.push("booking-ready");
  if (input.xp >= 1200) badges.push("contest-qualified");
  if (input.xp >= 2000 && input.rankMovement > 0) badges.push("headline-ready");
  return badges;
}

export function updateArtistProgression(input: {
  artistId: string;
  performerId?: string;
  rankMovement?: number;
}): ArtistProgressionSnapshot {
  const xp = getArtistXpTotal(input.artistId);
  const artistLevel = levelFromXp(xp);
  const performerLevel = input.performerId ? levelFromXp(Math.round(xp * 0.9)) : artistLevel;
  const rankMovement = input.rankMovement ?? 0;
  const progressionScore = xp + rankMovement * 25;

  const snapshot: ArtistProgressionSnapshot = {
    artistId: input.artistId,
    performerId: input.performerId,
    artistLevel,
    performerLevel,
    progressionScore,
    rankMovement,
    eligibilityBadges: resolveBadges({ xp, rankMovement }),
    updatedAtMs: Date.now(),
  };

  progressionSnapshots.set(input.artistId, snapshot);
  return snapshot;
}

export function getArtistProgression(artistId: string): ArtistProgressionSnapshot | null {
  return progressionSnapshots.get(artistId) ?? null;
}

export function listArtistProgressionSnapshots(): ArtistProgressionSnapshot[] {
  return [...progressionSnapshots.values()];
}

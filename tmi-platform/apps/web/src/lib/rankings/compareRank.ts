/**
 * compareRank — Human-over-Bot Ranking (MJ Rule)
 *
 * Locked policy (NOT blunt `isHuman ? +1000` on score):
 *   1. Humans with points > 0 ALWAYS rank above bots/placeholders
 *   2. Then by points descending
 *   3. Then earliest scoreReachedAt (first to reach that score wins ties)
 *
 * Bands:
 *   Band 1 — Human active (kind === 'human' && points > 0)
 *   Band 2 — Fill remaining with bots / placeholders
 */

export type RankKind = 'human' | 'bot' | 'placeholder';

export interface RankComparable {
  profileId: string;
  kind: RankKind;
  /** Platform points / XP — never fabricate grants */
  points: number;
  /** Epoch ms when this score was first reached; earlier wins ties */
  scoreReachedAt: number;
}

/** Band 1 gate: real human with any positive points. */
export function isHumanActive(entry: RankComparable): boolean {
  return entry.kind === 'human' && entry.points > 0;
}

/**
 * Comparator for Array.sort — negative if `a` ranks better (higher) than `b`.
 */
export function compareRank(a: RankComparable, b: RankComparable): number {
  const aBand = isHumanActive(a) ? 0 : 1;
  const bBand = isHumanActive(b) ? 0 : 1;
  if (aBand !== bBand) return aBand - bBand;

  if (a.points !== b.points) return b.points - a.points;

  if (a.scoreReachedAt !== b.scoreReachedAt) {
    return a.scoreReachedAt - b.scoreReachedAt;
  }

  return a.profileId.localeCompare(b.profileId);
}

export function sortByRank<T extends RankComparable>(entries: readonly T[]): T[] {
  return [...entries].sort(compareRank);
}

/**
 * Pure Top-N builder — Band 1 humans (points > 0), then bots/placeholders.
 * Unit-testable with no registry / path-alias dependencies.
 */
export function buildRankingSlots<T extends RankComparable>(
  candidates: readonly T[],
  limit: number,
): Array<T & { rank: number }> {
  return sortByRank(candidates)
    .slice(0, Math.max(0, limit))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

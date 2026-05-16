/**
 * MagazineRankingEngine
 * Issue-based global ranking memory with assigned magazine numbers.
 */

export type MagazineRankEntry = {
  artistId: string;
  performerId?: string;
  magazineNumber: number;
  currentRank: number;
  previousRank: number | null;
  rankMovement: number;
  score: number;
};

export type MagazineIssueSnapshot = {
  issueId: string;
  publishedAtMs: number;
  rankings: MagazineRankEntry[];
};

const magazineNumbers = new Map<string, number>();
const currentRankings = new Map<string, MagazineRankEntry>();
const issueMemory: MagazineIssueSnapshot[] = [];
let magazineNumberCounter = 1000;
let issueCounter = 0;

export function getOrAssignMagazineNumber(artistId: string): number {
  const existing = magazineNumbers.get(artistId);
  if (existing) return existing;
  const next = ++magazineNumberCounter;
  magazineNumbers.set(artistId, next);
  return next;
}

export function updateMagazineRankings(entries: Array<{
  artistId: string;
  performerId?: string;
  score: number;
}>): MagazineRankEntry[] {
  const ranked = [...entries]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => {
      const previous = currentRankings.get(entry.artistId) ?? null;
      const currentRank = index + 1;
      const previousRank = previous?.currentRank ?? null;
      const rankMovement = previousRank === null ? 0 : previousRank - currentRank;

      const record: MagazineRankEntry = {
        artistId: entry.artistId,
        performerId: entry.performerId,
        magazineNumber: getOrAssignMagazineNumber(entry.artistId),
        currentRank,
        previousRank,
        rankMovement,
        score: entry.score,
      };

      currentRankings.set(entry.artistId, record);
      return record;
    });

  issueMemory.unshift({
    issueId: `issue-${++issueCounter}`,
    publishedAtMs: Date.now(),
    rankings: ranked,
  });

  return ranked;
}

export function getMagazineRankEntry(artistId: string): MagazineRankEntry | null {
  return currentRankings.get(artistId) ?? null;
}

export function listMagazineRankings(): MagazineRankEntry[] {
  return [...currentRankings.values()].sort((a, b) => a.currentRank - b.currentRank);
}

export function listMagazineIssueMemory(): MagazineIssueSnapshot[] {
  return [...issueMemory];
}

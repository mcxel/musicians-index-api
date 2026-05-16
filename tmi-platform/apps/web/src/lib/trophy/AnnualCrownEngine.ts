export interface AnnualCrown {
  crownId: string;
  year: number;
  crownHolderId: string;
  displayName: string;
  totalPoints: number;
  battlesWon: number;
  crowdVotes: number;
  seasonChampionships: number;
  crownedAt: string;
  trophyId?: string;
  nftTokenId?: string;
}

export interface CrownContender {
  artistId: string;
  displayName: string;
  points: number;
  battlesWon: number;
  crowdVotes: number;
  seasonChampionships: number;
  rank: number;
}

const crowns = new Map<number, AnnualCrown>();
const contenders = new Map<number, CrownContender[]>();

function gen(): string {
  return `crown_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function computeCrownScore(c: Omit<CrownContender, "rank">): number {
  return c.points + c.battlesWon * 10 + c.crowdVotes * 2 + c.seasonChampionships * 100;
}

export function registerContender(
  year: number,
  artistId: string,
  displayName: string,
  stats: { points: number; battlesWon: number; crowdVotes: number; seasonChampionships: number },
): CrownContender {
  const list = contenders.get(year) ?? [];
  const existing = list.findIndex((c) => c.artistId === artistId);
  const contender: CrownContender = { artistId, displayName, rank: 0, ...stats };

  if (existing >= 0) list[existing] = contender;
  else list.push(contender);

  list.sort((a, b) => computeCrownScore(b) - computeCrownScore(a));
  list.forEach((c, i) => { c.rank = i + 1; });
  contenders.set(year, list);
  return list.find((c) => c.artistId === artistId)!;
}

export function crownArtistOfYear(year: number, opts: { trophyId?: string; nftTokenId?: string } = {}): AnnualCrown | null {
  const list = contenders.get(year);
  if (!list?.length) return null;
  const top = list[0];
  const crown: AnnualCrown = {
    crownId: gen(),
    year,
    crownHolderId: top.artistId,
    displayName: top.displayName,
    totalPoints: top.points,
    battlesWon: top.battlesWon,
    crowdVotes: top.crowdVotes,
    seasonChampionships: top.seasonChampionships,
    crownedAt: new Date().toISOString(),
    trophyId: opts.trophyId,
    nftTokenId: opts.nftTokenId,
  };
  crowns.set(year, crown);
  return crown;
}

export function getCrown(year: number): AnnualCrown | null {
  return crowns.get(year) ?? null;
}

export function getCurrentYearCrown(): AnnualCrown | null {
  return crowns.get(new Date().getFullYear()) ?? null;
}

export function getContenders(year: number, limit = 10): CrownContender[] {
  return (contenders.get(year) ?? []).slice(0, limit);
}

export function getCrownHistory(): AnnualCrown[] {
  return [...crowns.values()].sort((a, b) => b.year - a.year);
}

export function isCurrentCrownHolder(artistId: string): boolean {
  const year = new Date().getFullYear();
  return crowns.get(year)?.crownHolderId === artistId;
}

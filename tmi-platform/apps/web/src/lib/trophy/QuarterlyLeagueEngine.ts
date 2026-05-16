export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type LeagueStatus = "upcoming" | "active" | "scoring" | "closed";

export interface LeagueParticipant {
  artistId: string;
  displayName: string;
  points: number;
  wins: number;
  battles: number;
  rank: number;
}

export interface QuarterlyLeague {
  leagueId: string;
  year: number;
  quarter: Quarter;
  status: LeagueStatus;
  participants: LeagueParticipant[];
  prizePool: number;
  startDate: string;
  endDate: string;
  championId?: string;
}

const leagues = new Map<string, QuarterlyLeague>();

function gen(): string {
  return `league_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createLeague(
  year: number,
  quarter: Quarter,
  prizePool: number,
  startDate: string,
  endDate: string,
): QuarterlyLeague {
  const league: QuarterlyLeague = {
    leagueId: gen(),
    year,
    quarter,
    status: "upcoming",
    participants: [],
    prizePool,
    startDate,
    endDate,
  };
  leagues.set(league.leagueId, league);
  return league;
}

export function joinLeague(leagueId: string, artistId: string, displayName: string): boolean {
  const league = leagues.get(leagueId);
  if (!league || league.status !== "upcoming") return false;
  if (league.participants.some((p) => p.artistId === artistId)) return false;
  league.participants.push({ artistId, displayName, points: 0, wins: 0, battles: 0, rank: 0 });
  return true;
}

export function recordLeagueBattle(
  leagueId: string,
  winnerId: string,
  loserId: string,
  winnerPoints: number,
  loserPoints: number,
): void {
  const league = leagues.get(leagueId);
  if (!league || league.status !== "active") return;
  const winner = league.participants.find((p) => p.artistId === winnerId);
  const loser = league.participants.find((p) => p.artistId === loserId);
  if (winner) { winner.points += winnerPoints; winner.wins += 1; winner.battles += 1; }
  if (loser)  { loser.points += loserPoints;   loser.battles += 1; }
  reRank(league);
}

function reRank(league: QuarterlyLeague): void {
  league.participants.sort((a, b) => b.points - a.points);
  league.participants.forEach((p, i) => { p.rank = i + 1; });
}

export function closeLeague(leagueId: string): QuarterlyLeague | null {
  const league = leagues.get(leagueId);
  if (!league) return null;
  reRank(league);
  const champion = league.participants[0];
  league.status = "closed";
  league.championId = champion?.artistId;
  return league;
}

export function getLeague(leagueId: string): QuarterlyLeague | null {
  return leagues.get(leagueId) ?? null;
}

export function getActiveLeague(): QuarterlyLeague | null {
  return [...leagues.values()].find((l) => l.status === "active") ?? null;
}

export function getLeaderboard(leagueId: string, limit = 10): LeagueParticipant[] {
  return (leagues.get(leagueId)?.participants ?? []).slice(0, limit);
}

export function setStatus(leagueId: string, status: LeagueStatus): void {
  const league = leagues.get(leagueId);
  if (league) league.status = status;
}

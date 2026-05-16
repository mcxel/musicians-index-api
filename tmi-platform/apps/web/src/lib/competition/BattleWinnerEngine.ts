export type WinMethod = "vote" | "forfeit" | "no-show" | "judges" | "technical";

export interface BattleResult {
  battleId: string;
  winnerId: string;
  loserId: string;
  method: WinMethod;
  voteMargin?: number;
  xpAwarded: number;
  pointsAwarded: number;
  revenueTriggered: number;
  settledAt: string;
  seasonId?: string;
  leagueId?: string;
}

const results = new Map<string, BattleResult>();
const artistHistory = new Map<string, string[]>();

function XP_FOR_METHOD(method: WinMethod): number {
  switch (method) {
    case "vote":      return 120;
    case "judges":    return 150;
    case "forfeit":   return 80;
    case "no-show":   return 60;
    case "technical": return 70;
  }
}

function gen(): string {
  return `bwr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function settleWinner(
  battleId: string,
  winnerId: string,
  loserId: string,
  method: WinMethod,
  opts: { voteMargin?: number; seasonId?: string; leagueId?: string } = {},
): BattleResult {
  const xpAwarded = XP_FOR_METHOD(method);
  const pointsAwarded = Math.round(xpAwarded * 1.5);
  const revenueTriggered = method === "vote" ? 0.5 : 0.25;

  const result: BattleResult = {
    battleId,
    winnerId,
    loserId,
    method,
    voteMargin: opts.voteMargin,
    xpAwarded,
    pointsAwarded,
    revenueTriggered,
    settledAt: new Date().toISOString(),
    seasonId: opts.seasonId,
    leagueId: opts.leagueId,
  };

  results.set(battleId, result);

  const wList = artistHistory.get(winnerId) ?? [];
  wList.unshift(battleId);
  artistHistory.set(winnerId, wList.slice(0, 200));

  const lList = artistHistory.get(loserId) ?? [];
  lList.unshift(battleId);
  artistHistory.set(loserId, lList.slice(0, 200));

  return result;
}

export function getBattleResult(battleId: string): BattleResult | null {
  return results.get(battleId) ?? null;
}

export function getArtistWins(artistId: string): BattleResult[] {
  const ids = artistHistory.get(artistId) ?? [];
  return ids.map((id) => results.get(id)!).filter(Boolean).filter((r) => r.winnerId === artistId);
}

export function getArtistWinRate(artistId: string): number {
  const ids = artistHistory.get(artistId) ?? [];
  const battles = ids.map((id) => results.get(id)!).filter(Boolean);
  if (!battles.length) return 0;
  const wins = battles.filter((r) => r.winnerId === artistId).length;
  return Math.round((wins / battles.length) * 100);
}

export function getArtistStreak(artistId: string): number {
  const ids = artistHistory.get(artistId) ?? [];
  let streak = 0;
  for (const id of ids) {
    const r = results.get(id);
    if (!r) break;
    if (r.winnerId === artistId) streak++;
    else break;
  }
  return streak;
}

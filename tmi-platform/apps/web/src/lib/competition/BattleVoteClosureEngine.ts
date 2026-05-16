export type VoteOption = "artist-a" | "artist-b";

export interface BattleVoteTally {
  battleId: string;
  artistAVotes: number;
  artistBVotes: number;
  totalVotes: number;
  artistAPercent: number;
  artistBPercent: number;
  closedAt?: string;
  isClosed: boolean;
  winner?: VoteOption;
}

const tallies = new Map<string, BattleVoteTally>();
const voterLog = new Map<string, VoteOption>();

function voterKey(battleId: string, userId: string) {
  return `${battleId}::${userId}`;
}

export function openVoting(battleId: string): BattleVoteTally {
  const tally: BattleVoteTally = {
    battleId,
    artistAVotes: 0,
    artistBVotes: 0,
    totalVotes: 0,
    artistAPercent: 50,
    artistBPercent: 50,
    isClosed: false,
  };
  tallies.set(battleId, tally);
  return tally;
}

export function castVote(
  battleId: string,
  userId: string,
  vote: VoteOption,
): { ok: boolean; tally?: BattleVoteTally; reason?: string } {
  const tally = tallies.get(battleId);
  if (!tally) return { ok: false, reason: "battle-not-found" };
  if (tally.isClosed) return { ok: false, reason: "voting-closed" };

  const k = voterKey(battleId, userId);
  if (voterLog.has(k)) return { ok: false, reason: "already-voted" };
  voterLog.set(k, vote);

  const aVotes = tally.artistAVotes + (vote === "artist-a" ? 1 : 0);
  const bVotes = tally.artistBVotes + (vote === "artist-b" ? 1 : 0);
  const total = aVotes + bVotes;

  const next: BattleVoteTally = {
    ...tally,
    artistAVotes: aVotes,
    artistBVotes: bVotes,
    totalVotes: total,
    artistAPercent: total > 0 ? Math.round((aVotes / total) * 100) : 50,
    artistBPercent: total > 0 ? Math.round((bVotes / total) * 100) : 50,
  };
  tallies.set(battleId, next);
  return { ok: true, tally: next };
}

export function closeVoting(battleId: string): BattleVoteTally | null {
  const tally = tallies.get(battleId);
  if (!tally) return null;
  const winner: VoteOption = tally.artistAVotes >= tally.artistBVotes ? "artist-a" : "artist-b";
  const closed: BattleVoteTally = { ...tally, isClosed: true, closedAt: new Date().toISOString(), winner };
  tallies.set(battleId, closed);
  return closed;
}

export function getTally(battleId: string): BattleVoteTally | null {
  return tallies.get(battleId) ?? null;
}

export function hasVoted(battleId: string, userId: string): boolean {
  return voterLog.has(voterKey(battleId, userId));
}

export function getVote(battleId: string, userId: string): VoteOption | null {
  return voterLog.get(voterKey(battleId, userId)) ?? null;
}

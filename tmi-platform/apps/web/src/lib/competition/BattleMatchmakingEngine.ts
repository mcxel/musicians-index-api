export type MatchmakingMode = "open" | "ranked" | "invite-only" | "challenger" | "sponsored";

export interface ArtistMatchProfile {
  artistId: string;
  displayName: string;
  rankScore: number;
  wins: number;
  losses: number;
  genre: string;
  availableNow: boolean;
  preferredMode: MatchmakingMode;
}

export interface BattleMatch {
  matchId: string;
  artistAId: string;
  artistBId: string;
  mode: MatchmakingMode;
  createdAt: string;
  scheduledFor?: string;
  accepted: boolean;
  acceptedAt?: string;
}

const profiles = new Map<string, ArtistMatchProfile>();
const queue: string[] = [];
const matches = new Map<string, BattleMatch>();

function gen(): string {
  return `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function registerForMatchmaking(profile: ArtistMatchProfile): void {
  profiles.set(profile.artistId, profile);
  if (profile.availableNow && !queue.includes(profile.artistId)) {
    queue.push(profile.artistId);
  }
}

export function findMatch(artistId: string, mode: MatchmakingMode = "open"): BattleMatch | null {
  const requester = profiles.get(artistId);
  if (!requester) return null;

  const candidates = queue
    .filter((id) => id !== artistId)
    .map((id) => profiles.get(id)!)
    .filter(Boolean)
    .filter((p) => p.availableNow && (mode === "open" || p.preferredMode === mode));

  if (!candidates.length) return null;

  candidates.sort((a, b) => Math.abs(a.rankScore - requester.rankScore) - Math.abs(b.rankScore - requester.rankScore));
  const opponent = candidates[0];

  const match: BattleMatch = {
    matchId: gen(),
    artistAId: artistId,
    artistBId: opponent.artistId,
    mode,
    createdAt: new Date().toISOString(),
    accepted: false,
  };

  matches.set(match.matchId, match);
  queue.splice(queue.indexOf(artistId), 1);
  queue.splice(queue.indexOf(opponent.artistId), 1);

  return match;
}

export function acceptMatch(matchId: string): BattleMatch | null {
  const match = matches.get(matchId);
  if (!match) return null;
  const accepted: BattleMatch = { ...match, accepted: true, acceptedAt: new Date().toISOString() };
  matches.set(matchId, accepted);
  return accepted;
}

export function getMatch(matchId: string): BattleMatch | null {
  return matches.get(matchId) ?? null;
}

export function getQueueLength(): number {
  return queue.length;
}

export function removeFromQueue(artistId: string): void {
  const idx = queue.indexOf(artistId);
  if (idx >= 0) queue.splice(idx, 1);
  const profile = profiles.get(artistId);
  if (profile) profiles.set(artistId, { ...profile, availableNow: false });
}

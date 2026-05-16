export type SongBattleStatus = "queued" | "live" | "intermission" | "completed";
export type SongVote = "fire" | "smooth" | "miss";

export type SongBattleRound = {
  roundId: string;
  roundNumber: number;
  artistASlug: string;
  artistBSlug: string;
  songA: { title: string; artist: string; bpm: number };
  songB: { title: string; artist: string; bpm: number };
  activeArtist: "a" | "b";
  votes: { fire: number; smooth: number; miss: number };
  winner?: "a" | "b";
  durationSeconds: number;
};

export type SongBattle = {
  battleId: string;
  title: string;
  artistA: { slug: string; name: string; genre: string; wins: number };
  artistB: { slug: string; name: string; genre: string; wins: number };
  status: SongBattleStatus;
  rounds: SongBattleRound[];
  currentRound: number;
  bestOf: 5 | 7;
  crowdCount: number;
  startedAtMs: number;
  endsAtMs: number;
  route: string;
};

const SEED_BATTLES: SongBattle[] = [
  {
    battleId: "sb-001",
    title: "Wavetek vs Verse Knight — Song-for-Song",
    artistA: { slug: "wavetek", name: "Wavetek", genre: "Hip-Hop / Trap", wins: 0 },
    artistB: { slug: "verse-knight", name: "Verse Knight", genre: "Hip-Hop / Boom Bap", wins: 0 },
    status: "live",
    currentRound: 2,
    bestOf: 5,
    crowdCount: 4800,
    startedAtMs: Date.now() - 8 * 60 * 1000,
    endsAtMs: Date.now() + 22 * 60 * 1000,
    route: "/song-battle/sb-001",
    rounds: [
      { roundId: "r1", roundNumber: 1, artistASlug: "wavetek", artistBSlug: "verse-knight", songA: { title: "Midnight Grind", artist: "Wavetek", bpm: 140 }, songB: { title: "Iron Verse", artist: "Verse Knight", bpm: 95 }, activeArtist: "b", votes: { fire: 2240, smooth: 870, miss: 190 }, winner: "a", durationSeconds: 240 },
      { roundId: "r2", roundNumber: 2, artistASlug: "wavetek", artistBSlug: "verse-knight", songA: { title: "Neon Waves", artist: "Wavetek", bpm: 128 }, songB: { title: "Street Scripture", artist: "Verse Knight", bpm: 88 }, activeArtist: "b", votes: { fire: 1890, smooth: 1140, miss: 310 }, durationSeconds: 240 },
      { roundId: "r3", roundNumber: 3, artistASlug: "wavetek", artistBSlug: "verse-knight", songA: { title: "TBA", artist: "Wavetek", bpm: 0 }, songB: { title: "TBA", artist: "Verse Knight", bpm: 0 }, activeArtist: "a", votes: { fire: 0, smooth: 0, miss: 0 }, durationSeconds: 240 },
    ],
  },
  {
    battleId: "sb-002",
    title: "Ray Journey vs Nova Cipher — Ballad Showdown",
    artistA: { slug: "ray-journey", name: "Ray Journey", genre: "R&B / Soul", wins: 0 },
    artistB: { slug: "nova-cipher", name: "Nova Cipher", genre: "R&B / Neo Soul", wins: 0 },
    status: "queued",
    currentRound: 0,
    bestOf: 5,
    crowdCount: 0,
    startedAtMs: Date.now() + 45 * 60 * 1000,
    endsAtMs: Date.now() + 135 * 60 * 1000,
    route: "/song-battle/sb-002",
    rounds: [],
  },
];

const battles = new Map<string, SongBattle>(SEED_BATTLES.map(b => [b.battleId, b]));

export function listSongBattles(): SongBattle[] {
  return [...battles.values()].sort((a, b) => {
    const order: Record<SongBattleStatus, number> = { live: 0, intermission: 1, queued: 2, completed: 3 };
    return order[a.status] - order[b.status];
  });
}

export function getSongBattle(battleId: string): SongBattle | null {
  return battles.get(battleId) ?? null;
}

export function getLiveSongBattles(): SongBattle[] {
  return [...battles.values()].filter(b => b.status === "live" || b.status === "intermission");
}

export function recordSongVote(battleId: string, roundId: string, vote: SongVote): void {
  const battle = battles.get(battleId);
  if (!battle) return;
  const round = battle.rounds.find(r => r.roundId === roundId);
  if (round) round.votes[vote]++;
}

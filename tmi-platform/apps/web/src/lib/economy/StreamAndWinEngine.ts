import { grantXP, XP_VALUES } from "@/lib/xp/xpEngine";

export type FeedbackReaction = "hard" | "replay" | "original" | "skip";
export type SongState = "active" | "decaying" | "expired";

export interface StreamWinSong {
  id: string;
  artistId: string;
  title: string;
  genre: string;
  audioUrl: string;
  submittedAt: number;
  state: SongState;
  listenCount: number;
  listenSeconds: number;
  reactionCounts: Record<FeedbackReaction, number>;
  voteCount: number;
  boostPoints: number;
  visibilityScore: number;
  lastActivityAt: number;
}

export interface SongSubmitResult {
  ok: boolean;
  song?: StreamWinSong;
  error?: "duplicate" | "quota_exceeded";
}

const songs: Map<string, StreamWinSong> = new Map();
// artistId -> count of active submissions
const artistSubmissions: Map<string, number> = new Map();
// userId -> { xpThisHour, windowStart, skipCount, noSkipStreak }
const userActivity: Map<string, { xpThisHour: number; windowStart: number; skipCount: number; noSkipStreak: number }> = new Map();

const DECAY_IDLE_MS   = 5 * 60 * 1000;  // 5 min → decaying
const EXPIRE_IDLE_MS  = 15 * 60 * 1000; // 15 min → expired
const FREE_SONGS_MAX  = 2;
const XP_HOUR_CAP     = 500;
const SKIP_BLOCK_THRESHOLD = 3;

function recomputeScore(song: StreamWinSong): number {
  const reactions = Object.values(song.reactionCounts).reduce((s, n) => s + n, 0);
  return song.listenSeconds * 0.4 + reactions * 3 + song.voteCount * 5 + song.boostPoints * 0.1;
}

function getUserActivity(userId: string) {
  const now = Date.now();
  let rec = userActivity.get(userId);
  if (!rec || now - rec.windowStart > 3600_000) {
    rec = { xpThisHour: 0, windowStart: now, skipCount: 0, noSkipStreak: 0 };
    userActivity.set(userId, rec);
  }
  return rec;
}

function tryGrantXP(userId: string, source: "stream_listen" | "stream_react" | "stream_vote"): boolean {
  const rec = getUserActivity(userId);
  if (rec.skipCount > SKIP_BLOCK_THRESHOLD) return false;
  let amount = XP_VALUES[source];
  // Streak bonus: consecutive non-skip listens
  if (source === "stream_listen") {
    if (rec.noSkipStreak >= 5) amount = Math.round(amount * 2);
    else if (rec.noSkipStreak >= 3) amount = Math.round(amount * 1.5);
  }
  if (rec.xpThisHour + amount > XP_HOUR_CAP) return false;
  rec.xpThisHour += amount;
  grantXP({ source, amount, userId });
  return true;
}

let decayTimer: ReturnType<typeof setInterval> | null = null;

export const StreamAndWinEngine = {
  start(): void {
    if (decayTimer) return;
    decayTimer = setInterval(() => StreamAndWinEngine.runDecay(), 60_000);
  },

  stop(): void {
    if (decayTimer) clearInterval(decayTimer);
    decayTimer = null;
  },

  submitSong(params: { artistId: string; title: string; genre: string; audioUrl: string }): SongSubmitResult {
    const existing = Array.from(songs.values()).filter(
      s => s.artistId === params.artistId && s.state !== "expired"
    );
    if (existing.length >= FREE_SONGS_MAX) return { ok: false, error: "quota_exceeded" };

    const id = `sw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const song: StreamWinSong = {
      id,
      artistId: params.artistId,
      title: params.title,
      genre: params.genre,
      audioUrl: params.audioUrl,
      submittedAt: Date.now(),
      state: "active",
      listenCount: 0,
      listenSeconds: 0,
      reactionCounts: { hard: 0, replay: 0, original: 0, skip: 0 },
      voteCount: 0,
      boostPoints: 0,
      visibilityScore: 0,
      lastActivityAt: Date.now(),
    };
    songs.set(id, song);
    artistSubmissions.set(params.artistId, (artistSubmissions.get(params.artistId) ?? 0) + 1);
    return { ok: true, song };
  },

  recordListen(songId: string, userId: string, listenPct: number, isActive = true): boolean {
    const song = songs.get(songId);
    if (!song || song.state === "expired") return false;

    // Anti-cheat: hidden tab = no XP
    if (!isActive) return false;

    const rec = getUserActivity(userId);
    if (listenPct < 0.30) {
      rec.skipCount += 1;
      rec.noSkipStreak = 0;
      userActivity.set(userId, rec);
      return false;
    }

    song.listenCount += 1;
    song.listenSeconds += Math.round(listenPct * 180); // assume avg 3min track
    song.lastActivityAt = Date.now();
    song.state = "active";
    song.visibilityScore = recomputeScore(song);

    rec.noSkipStreak += 1;
    tryGrantXP(userId, "stream_listen");
    return true;
  },

  recordReaction(songId: string, userId: string, reaction: FeedbackReaction): boolean {
    const song = songs.get(songId);
    if (!song || song.state === "expired") return false;

    song.reactionCounts[reaction] += 1;
    song.lastActivityAt = Date.now();
    song.state = "active";
    song.visibilityScore = recomputeScore(song);

    if (reaction === "skip") {
      const rec = getUserActivity(userId);
      rec.skipCount += 1;
      rec.noSkipStreak = 0;
      return false;
    }

    tryGrantXP(userId, "stream_react");
    return true;
  },

  recordVote(songId: string, userId: string): boolean {
    const song = songs.get(songId);
    if (!song || song.state === "expired") return false;

    song.voteCount += 1;
    song.lastActivityAt = Date.now();
    song.visibilityScore = recomputeScore(song);

    tryGrantXP(userId, "stream_vote");
    return true;
  },

  // Paid boost: exposure only, does NOT affect eligibility or prize odds
  applyBoost(songId: string, boostPoints: number): boolean {
    const song = songs.get(songId);
    if (!song) return false;
    song.boostPoints += boostPoints;
    song.visibilityScore = recomputeScore(song);
    return true;
  },

  runDecay(): void {
    const now = Date.now();
    for (const song of songs.values()) {
      if (song.state === "expired") continue;
      const idle = now - song.lastActivityAt;
      if (idle > EXPIRE_IDLE_MS) {
        song.state = "expired";
      } else if (idle > DECAY_IDLE_MS) {
        song.state = "decaying";
      }
    }
  },

  getActiveSongs(): StreamWinSong[] {
    return Array.from(songs.values())
      .filter(s => s.state !== "expired")
      .sort((a, b) => {
        if (a.state === "active" && b.state !== "active") return -1;
        if (b.state === "active" && a.state !== "active") return 1;
        return b.visibilityScore - a.visibilityScore;
      });
  },

  getSong(id: string): StreamWinSong | undefined {
    return songs.get(id);
  },

  // Returns user IDs eligible for prize drops (listened ≥30% to any active song)
  getEligibleUsers(sessionListeners: string[]): string[] {
    return sessionListeners;
  },
};

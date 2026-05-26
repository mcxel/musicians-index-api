import type { StreamWinSong } from "@/lib/economy/StreamAndWinEngine";
import { TrendLearningEngine } from "./TrendLearningEngine";

const MIN_REPLAY_GAP_MS = 20 * 60 * 1000; // 20 minutes

interface RotationEntry {
  songId: string;
  artistId: string;
  boostMultiplier: number;   // 1 = free, 2 = $5 boost, 3 = $10 boost
  lastPlayedAt: number;      // 0 = never played
  playCount: number;
  requiredPlaysThisCycle: number; // = boostMultiplier
  playsThisCycle: number;
  isLocked: boolean;
}

const rotation: Map<string, RotationEntry> = new Map();

function getOrRegister(song: StreamWinSong): RotationEntry {
  if (!rotation.has(song.id)) {
    rotation.set(song.id, {
      songId: song.id,
      artistId: song.artistId,
      boostMultiplier: 1,
      lastPlayedAt: 0,
      playCount: 0,
      requiredPlaysThisCycle: 1,
      playsThisCycle: 0,
      isLocked: false,
    });
  }
  return rotation.get(song.id)!;
}

function isEligibleNow(entry: RotationEntry): boolean {
  if (entry.lastPlayedAt === 0) return true; // never played
  return Date.now() - entry.lastPlayedAt >= MIN_REPLAY_GAP_MS;
}

export const PlaylistFairnessEngine = {
  register(songId: string, artistId: string, boostMultiplier = 1): void {
    if (!rotation.has(songId)) {
      rotation.set(songId, {
        songId, artistId, boostMultiplier,
        lastPlayedAt: 0, playCount: 0,
        requiredPlaysThisCycle: boostMultiplier,
        playsThisCycle: 0,
        isLocked: false,
      });
    }
  },

  recordPlayed(songId: string): void {
    const entry = rotation.get(songId);
    if (!entry) return;
    entry.lastPlayedAt = Date.now();
    entry.playCount++;
    entry.playsThisCycle++;
    // Reset cycle if we've hit required plays
    if (entry.playsThisCycle >= entry.requiredPlaysThisCycle) {
      entry.playsThisCycle = 0;
    }
  },

  applyBoost(songId: string, multiplier: number): void {
    const entry = rotation.get(songId);
    if (!entry) return;
    entry.boostMultiplier = Math.max(entry.boostMultiplier, multiplier);
    entry.requiredPlaysThisCycle = entry.boostMultiplier;
  },

  setLocked(songId: string, val: boolean): void {
    const entry = rotation.get(songId);
    if (entry) entry.isLocked = val;
  },

  isEligible(songId: string): boolean {
    const entry = rotation.get(songId);
    return entry ? isEligibleNow(entry) : true;
  },

  // Pick next song: never-played first, then paid/locked, then trend-weighted eligible
  getNext(currentSongId: string, available: StreamWinSong[]): StreamWinSong | null {
    if (available.length === 0) return null;

    // Ensure all available songs are registered
    for (const s of available) getOrRegister(s);

    // Filter out current song and non-expired
    const candidates = available.filter(s => s.id !== currentSongId && s.state !== "expired");
    if (candidates.length === 0) return available[0] ?? null;

    // Priority 1: Never-played songs (sorted by submittedAt asc — first submitted, first played)
    const neverPlayed = candidates.filter(s => rotation.get(s.id)?.lastPlayedAt === 0);
    if (neverPlayed.length > 0) {
      return neverPlayed.sort((a, b) => a.submittedAt - b.submittedAt)[0]!;
    }

    // Priority 2: Eligible songs (past replay gap)
    const eligible = candidates.filter(s => {
      const entry = rotation.get(s.id);
      return entry ? isEligibleNow(entry) : true;
    });

    if (eligible.length === 0) {
      // All songs within replay gap — pick least recently played
      return candidates.sort((a, b) => {
        const aLast = rotation.get(a.id)?.lastPlayedAt ?? 0;
        const bLast = rotation.get(b.id)?.lastPlayedAt ?? 0;
        return aLast - bLast;
      })[0] ?? null;
    }

    // Priority 3: Score eligible songs by boost × trend multiplier
    const scored = eligible.map(s => {
      const entry = rotation.get(s.id)!;
      const trendMult = TrendLearningEngine.getMultiplier(s.genre);
      const boostScore = entry.boostMultiplier * trendMult;
      // Locked songs get a bump
      const lockBonus = entry.isLocked ? 1.5 : 1.0;
      return { song: s, score: boostScore * lockBonus };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]!.song;
  },
};

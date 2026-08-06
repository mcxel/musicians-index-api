/**
 * MediaLockerChallengeAdapter.ts — Phase 5.2 Media Locker Read Adapter.
 * Canonical server-authoritative adapter connecting finished Media Locker song records to Song Challenge runtimes.
 * Enforces ownership, audio processing, loudness normalization, rights verification, moderation approval, and atomic match asset locks.
 */

export interface MediaLockerSong {
  songId: string;
  artistId: string;
  title: string;
  album?: string;
  durationSeconds: number;
  audioUrl: string;
  artworkUrl?: string;
  genre: string;
  isExplicit: boolean;
  isChallengeEligible: boolean;
  isAudioProcessed: boolean;
  isLoudnessNormalized: boolean;
  isRightsVerified: boolean;
  isLockedInActiveMatch: boolean;
  moderationStatus: "APPROVED" | "PENDING" | "REJECTED";
}

export interface SongChallengeAssetLock {
  lockId: string;
  matchId: string;
  songId: string;
  artistId: string;
  status: "LOCKED" | "RELEASED" | "EXPIRED";
  lockedAt: string;
}

const activeAssetLocks = new Map<string, SongChallengeAssetLock>();

export function validateAndGetChallengeLoadout(
  artistId: string,
  requestedSongIds: string[],
  masterCatalog: MediaLockerSong[],
  requiredCount: number = 3,
): { success: boolean; loadout: MediaLockerSong[]; error?: string } {
  if (requestedSongIds.length !== requiredCount) {
    return { success: false, loadout: [], error: `Exact loadout of ${requiredCount} songs required.` };
  }

  const uniqueIds = new Set(requestedSongIds);
  if (uniqueIds.size !== requiredCount) {
    return { success: false, loadout: [], error: "Duplicate songs are not allowed in a challenge loadout." };
  }

  const validatedSongs: MediaLockerSong[] = [];

  for (const songId of requestedSongIds) {
    const song = masterCatalog.find((s) => s.songId === songId && s.artistId === artistId);

    if (!song) {
      return { success: false, loadout: [], error: `Song ${songId} not found or unauthorized.` };
    }
    if (!song.isChallengeEligible) {
      return { success: false, loadout: [], error: `Song "${song.title}" is not challenge-eligible.` };
    }
    if (!song.isAudioProcessed || !song.isLoudnessNormalized || !song.isRightsVerified) {
      return { success: false, loadout: [], error: `Song "${song.title}" failed audio/rights verification.` };
    }
    if (song.moderationStatus !== "APPROVED") {
      return { success: false, loadout: [], error: `Song "${song.title}" is under moderation hold.` };
    }

    // Check active lock registry
    const existingLock = activeAssetLocks.get(songId);
    if (existingLock && existingLock.status === "LOCKED") {
      return { success: false, loadout: [], error: `Song "${song.title}" is currently locked in another match.` };
    }

    validatedSongs.push(song);
  }

  return { success: true, loadout: validatedSongs };
}

export function acquireMatchAssetLocks(matchId: string, songs: MediaLockerSong[]): boolean {
  for (const song of songs) {
    activeAssetLocks.set(song.songId, {
      lockId: `lock-${matchId}-${song.songId}`,
      matchId,
      songId: song.songId,
      artistId: song.artistId,
      status: "LOCKED",
      lockedAt: new Date().toISOString(),
    });
  }
  return true;
}

export function releaseMatchAssetLocks(matchId: string): void {
  for (const [songId, lock] of activeAssetLocks.entries()) {
    if (lock.matchId === matchId) {
      activeAssetLocks.set(songId, { ...lock, status: "RELEASED" });
    }
  }
}

export function getActiveAssetLockCount(): number {
  let count = 0;
  for (const lock of activeAssetLocks.values()) {
    if (lock.status === "LOCKED") count += 1;
  }
  return count;
}

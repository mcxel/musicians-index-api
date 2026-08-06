/**
 * SongCrownRegistry — genre Song Crown scaffold (work-vs-work wins).
 *
 * Separate from Battle championships / performer Crowns (Rule 3/4).
 * 10 wins in a genre → genre Song Crown. Champion challenge messaging only —
 * no fabricated champions or win counts (Rule 20).
 *
 * Wires beside SongChallengeMatchEngine; does not invent match results.
 */

export type SongCrownGenre =
  | "hip_hop"
  | "rnb"
  | "rock"
  | "country"
  | "gospel"
  | "edm"
  | "open_genre"
  | "spoken_word"
  | "comedy"
  | "latin";

export const SONG_CROWN_WINS_REQUIRED = 10;

export interface SongCrownHolder {
  genre: SongCrownGenre;
  /** Real song / media locker id — never a fake title */
  songId: string;
  songTitle: string;
  artistUserId: string;
  artistDisplayName: string;
  winsInGenre: number;
  crownedAtMs: number;
  /** Challenge CTA copy when a real champion exists */
  challengeMessage: string;
}

export interface SongCrownProgress {
  genre: SongCrownGenre;
  songId: string;
  artistUserId: string;
  winsInGenre: number;
  winsRequired: number;
  isChampion: boolean;
}

const holders = new Map<SongCrownGenre, SongCrownHolder>();
const progress = new Map<string, SongCrownProgress>(); // key: genre::songId

function progressKey(genre: SongCrownGenre, songId: string): string {
  return `${genre}::${songId}`;
}

function challengeMessage(holder: Omit<SongCrownHolder, "challengeMessage">): string {
  return `Challenge the ${holder.genre.replace(/_/g, " ").toUpperCase()} Song Crown — "${holder.songTitle}" by ${holder.artistDisplayName} (${holder.winsInGenre} wins).`;
}

/** Record a real Song Challenge win. Caller must pass verified match outcome only. */
export function recordSongChallengeWin(input: {
  genre: SongCrownGenre;
  songId: string;
  songTitle: string;
  artistUserId: string;
  artistDisplayName: string;
}): SongCrownProgress {
  const songId = input.songId.trim();
  const artistUserId = input.artistUserId.trim();
  if (!songId || !artistUserId) {
    throw new Error("song_crown_requires_real_song_and_artist");
  }

  const key = progressKey(input.genre, songId);
  const prev = progress.get(key);
  const winsInGenre = (prev?.winsInGenre ?? 0) + 1;
  const entry: SongCrownProgress = {
    genre: input.genre,
    songId,
    artistUserId,
    winsInGenre,
    winsRequired: SONG_CROWN_WINS_REQUIRED,
    isChampion: winsInGenre >= SONG_CROWN_WINS_REQUIRED,
  };
  progress.set(key, entry);

  if (entry.isChampion) {
    const holderBase = {
      genre: input.genre,
      songId,
      songTitle: (input.songTitle || "Untitled").trim(),
      artistUserId,
      artistDisplayName: (input.artistDisplayName || "Artist").trim(),
      winsInGenre,
      crownedAtMs: Date.now(),
    };
    holders.set(input.genre, {
      ...holderBase,
      challengeMessage: challengeMessage(holderBase),
    });
  }

  return entry;
}

export function getSongCrownHolder(genre: SongCrownGenre): SongCrownHolder | null {
  return holders.get(genre) ?? null;
}

export function listSongCrownHolders(): SongCrownHolder[] {
  return [...holders.values()];
}

export function getSongCrownProgress(
  genre: SongCrownGenre,
  songId: string,
): SongCrownProgress | null {
  return progress.get(progressKey(genre, songId.trim())) ?? null;
}

/** Honest empty messaging when no champion exists yet. */
export function getSongCrownChallengeCopy(genre: SongCrownGenre): string {
  const holder = holders.get(genre);
  if (holder) return holder.challengeMessage;
  return `No ${genre.replace(/_/g, " ")} Song Crown yet — win ${SONG_CROWN_WINS_REQUIRED} Song Challenges in this genre to claim it.`;
}

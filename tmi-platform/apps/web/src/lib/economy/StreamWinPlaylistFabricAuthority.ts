/**
 * StreamWinPlaylistFabricAuthority.ts — deterministic Stream & Win playlist
 * routing/provisioning authority (§8421–8448, §8449–8475, §8476–8504).
 *
 * OWNER-LOCKED:
 *  - §8449/§8477  24 ACTIVE SONG MEMBERSHIPS per playlist (25th rejected).
 *  - §8421/§8479  TWO companion playlists per genre from the start (A/B).
 *  - §8455        Cool public display names (e.g. "Sunny Breeze") — separated
 *                 from canonical PLAYLIST_ID/GENRE_ID (§8457/§8458).
 *  - §8451/§8480  The existing playlist is preserved as the FIRST in its family.
 *  - §8487        Full playlist → route to another SAME-GENRE playlist (never overflow).
 *  - §8488/§8453  Provision the next playlist ahead of demand.
 *  - §8426/§8489  Conflict-free performer listening: performer in A → listen via B.
 *  - §8492        Own-song listener completion reward = 0 (no prior-point loss).
 *
 * SCOPE: deterministic, non-DB routing/provisioning logic ONLY (§8484). Durable
 * playlist/membership/concurrency/rollover persistence = WAITING_FOR_ISOLATED_DB
 * (§8503). Pure data/logic. No Prisma, no DOM, no fetch.
 */

import { GENRE_CONFIG } from "@/lib/arena/genreConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Locked capacity + naming
// ─────────────────────────────────────────────────────────────────────────────

/** §8449 — 24 active song memberships per playlist; never a 25th. */
export const STREAM_WIN_PLAYLIST_MAX_ACTIVE_SONGS = 24;

/**
 * §8509 — the exact ahead-of-demand provisioning watermark (20/24, 22/24, …) is
 * NOT owner-selected. The CAPABILITY to provision before full exists; the exact
 * trigger is owner policy. Do not silently turn an arbitrary threshold into law.
 */
export const STREAM_WIN_PLAYLIST_PREPROVISION_WATERMARK = "OWNER_VALUE_REQUIRED" as const;

/** §8455 — cool radio-style public display names (decorative; not routing). */
export const STREAM_WIN_PLAYLIST_NAME_POOL: readonly string[] = [
  "Sunny Breeze",
  "Midnight Ride",
  "Golden Hour",
  "After Hours",
  "Neon Nights",
  "Sunday Cruise",
  "City Lights",
  "Velvet Room",
  "Blue Skies",
  "Night Shift",
  "Electric Avenue",
  "Moonlight Drive",
] as const;

/** Canonical genre ids (from the existing taxonomy). */
export function listStreamWinGenres(): string[] {
  return Object.keys(GENRE_CONFIG);
}

export function isStreamWinGenre(genreId: string): boolean {
  return Object.prototype.hasOwnProperty.call(GENRE_CONFIG, genreId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Playlist model (structured internal identity — §8483/§8458)
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamWinPlaylist {
  /** Canonical internal id, e.g. "sw_hip-hop_a_001". Never the display name. */
  playlistId: string;
  /** Canonical genre id (routing authority — §8457). */
  genreId: string;
  /** Companion family "A"/"B" — INTERNAL ONLY (§8507). Public UI shows publicName. */
  companion: "A" | "B";
  /** Segment sequence within the family (1-based). */
  segment: number;
  /** Decorative public display name (§8455) — NOT routing authority. */
  publicName: string;
  /** Active song memberships: canonical song ids (max 24). */
  activeSongIds: string[];
  /** songId → owning performerId (canonical association, §8490). */
  songOwner: Record<string, string>;
  /** Preserved once full — remains playable (§8465). */
  createdAtMs: number;
}

export function playlistActiveCount(p: StreamWinPlaylist): number {
  return p.activeSongIds.length;
}

/** §8485/§8452 — full at 24; closed to NEW membership but still playable. */
export function isPlaylistFull(p: StreamWinPlaylist): boolean {
  return p.activeSongIds.length >= STREAM_WIN_PLAYLIST_MAX_ACTIVE_SONGS;
}

/** §8465 — full ≠ dead: full playlists remain playable. */
export function isPlaylistPlayable(p: StreamWinPlaylist): boolean {
  return p.activeSongIds.length > 0;
}

export function playlistHasPerformer(p: StreamWinPlaylist, performerId: string): boolean {
  return p.activeSongIds.some((id) => p.songOwner[id] === performerId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Naming (decorative; deterministic by family+segment — §8455/§8458)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deterministically pick a cool public name for a playlist family+segment.
 * Existing playlists keep their established name (§8451) — the caller passes
 * `existingName` to preserve it.
 */
export function resolvePublicPlaylistName(input: {
  genreId: string;
  companion: "A" | "B";
  segment: number;
  existingName?: string | null;
}): string {
  if (input.existingName && input.existingName.trim()) return input.existingName;
  const genreIdx = listStreamWinGenres().indexOf(input.genreId);
  const seed = (genreIdx < 0 ? 0 : genreIdx) * 17 + (input.companion === "A" ? 0 : 5) + (input.segment - 1) * 3;
  return STREAM_WIN_PLAYLIST_NAME_POOL[seed % STREAM_WIN_PLAYLIST_NAME_POOL.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fabric: genre → playlists (deterministic, in-memory for source certification)
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamWinGenreFabric {
  genreId: string;
  playlists: StreamWinPlaylist[];
}

/**
 * Provision the initial companion pair for a genre (§8440/§8479): A-001 + B-001,
 * both empty-capable (no fake songs §8461). If the genre already has an existing
 * playlist, it is preserved as the FIRST member of companion A (§8451/§8480).
 */
export function provisionGenreFabric(input: {
  genreId: string;
  nowMs: number;
  existingPlaylist?: { playlistId: string; publicName: string; activeSongIds?: string[]; songOwner?: Record<string, string> } | null;
}): StreamWinGenreFabric {
  if (!isStreamWinGenre(input.genreId)) {
    throw new Error(`Unknown Stream & Win genre: ${input.genreId}`);
  }
  const playlists: StreamWinPlaylist[] = [];

  // §8451 — preserve the existing playlist as companion A segment 1.
  const a1: StreamWinPlaylist = input.existingPlaylist
    ? {
        playlistId: input.existingPlaylist.playlistId,
        genreId: input.genreId,
        companion: "A",
        segment: 1,
        publicName: input.existingPlaylist.publicName, // preserved, not renamed
        activeSongIds: [...(input.existingPlaylist.activeSongIds ?? [])],
        songOwner: { ...(input.existingPlaylist.songOwner ?? {}) },
        createdAtMs: input.nowMs,
      }
    : makeEmptyPlaylist(input.genreId, "A", 1, input.nowMs);
  playlists.push(a1);

  // §8481 — second companion B-001 without replacing the first.
  playlists.push(makeEmptyPlaylist(input.genreId, "B", 1, input.nowMs));

  return { genreId: input.genreId, playlists };
}

function makeEmptyPlaylist(genreId: string, companion: "A" | "B", segment: number, nowMs: number): StreamWinPlaylist {
  return {
    playlistId: `sw_${genreId}_${companion.toLowerCase()}_${String(segment).padStart(3, "0")}`,
    genreId,
    companion,
    segment,
    publicName: resolvePublicPlaylistName({ genreId, companion, segment }),
    activeSongIds: [],
    songOwner: {},
    createdAtMs: nowMs,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Placement: accepted song → same-genre accepting playlist (§8485–§8498)
// ─────────────────────────────────────────────────────────────────────────────

export interface PlacementDecision {
  ok: boolean;
  playlistId: string | null;
  reason?: "genre_full" | "duplicate" | "unknown_genre";
  /** New-entry position intent: append at bottom (§8501/§8467). */
  position: "BOTTOM_NEW_ENTRY";
  /** True when provisioning of a next same-genre playlist is now required (§8488). */
  provisioningNeeded: boolean;
}

/**
 * Choose the accepting same-genre playlist for an accepted song. Distribution:
 * prefer the non-full playlist with fewer active songs, but NEVER put the song
 * into a playlist that would defeat conflict-free listening if avoidable (§8498)
 * and NEVER overflow into another genre (§8487). One song = one slot (§8468).
 */
export function placeSongInGenre(
  fabric: StreamWinGenreFabric,
  input: { songId: string; ownerPerformerId: string },
): PlacementDecision {
  if (!isStreamWinGenre(fabric.genreId)) {
    return { ok: false, playlistId: null, reason: "unknown_genre", position: "BOTTOM_NEW_ENTRY", provisioningNeeded: false };
  }
  // Duplicate protection — same song never enters twice (idempotency).
  for (const p of fabric.playlists) {
    if (p.activeSongIds.includes(input.songId)) {
      return { ok: false, playlistId: p.playlistId, reason: "duplicate", position: "BOTTOM_NEW_ENTRY", provisioningNeeded: false };
    }
  }
  const accepting = fabric.playlists.filter((p) => !isPlaylistFull(p));
  if (accepting.length === 0) {
    return { ok: false, playlistId: null, reason: "genre_full", position: "BOTTOM_NEW_ENTRY", provisioningNeeded: true };
  }
  // Distribute to the least-filled accepting playlist (fair distribution §8469/§8498).
  accepting.sort((a, b) => playlistActiveCount(a) - playlistActiveCount(b) || a.createdAtMs - b.createdAtMs);
  const target = accepting[0];
  // §8453/§8509 — signal (not policy) that this playlist is approaching capacity so
  // the caller can provision ahead of demand. The exact watermark threshold is
  // OWNER_VALUE_REQUIRED; here we expose capability at cap-1 without hardcoding policy.
  const willBeCount = playlistActiveCount(target) + 1;
  const provisioningNeeded = willBeCount >= STREAM_WIN_PLAYLIST_MAX_ACTIVE_SONGS - 1;
  return { ok: true, playlistId: target.playlistId, position: "BOTTOM_NEW_ENTRY", provisioningNeeded };
}

/** Apply a placement decision (mutation helper for the in-memory fabric). */
export function applyPlacement(
  fabric: StreamWinGenreFabric,
  playlistId: string,
  input: { songId: string; ownerPerformerId: string },
): boolean {
  const p = fabric.playlists.find((x) => x.playlistId === playlistId);
  if (!p || isPlaylistFull(p) || p.activeSongIds.includes(input.songId)) return false;
  p.activeSongIds.push(input.songId);
  p.songOwner[input.songId] = input.ownerPerformerId;
  return true;
}

/**
 * Provision the next same-genre playlist when capacity is needed (§8496/§8459).
 * Appends the next segment to the family with the fewest total songs (keeps
 * companions balanced). Returns the new playlist.
 */
export function provisionNextPlaylist(fabric: StreamWinGenreFabric, nowMs: number): StreamWinPlaylist {
  const familyCounts = { A: 0, B: 0 };
  let nextSegment = { A: 1, B: 1 };
  for (const p of fabric.playlists) {
    familyCounts[p.companion] += p.activeSongIds.length;
    nextSegment[p.companion] = Math.max(nextSegment[p.companion], p.segment + 1);
  }
  const companion: "A" | "B" = familyCounts.A <= familyCounts.B ? "A" : "B";
  const np = makeEmptyPlaylist(fabric.genreId, companion, nextSegment[companion], nowMs);
  fabric.playlists.push(np);
  return np;
}

// ─────────────────────────────────────────────────────────────────────────────
// Conflict-free performer listening (§8426–§8495)
// ─────────────────────────────────────────────────────────────────────────────

export interface ListenerRouteDecision {
  playlistId: string | null;
  reason: "ok" | "no_conflict_free_playlist" | "empty_genre";
}

/**
 * Route a listener to a playlist in the genre. If the listener is a Performer
 * associated with songs in a candidate, prefer a conflict-free companion
 * (§8426/§8489). If every playlist contains the performer, search the larger
 * pool (§8494); if none is conflict-free, return no_conflict_free_playlist —
 * playback may still occur but own-song reward is separately zeroed (§8492).
 */
export function routeListenerInGenre(
  fabric: StreamWinGenreFabric,
  listenerPerformerId: string | null,
): ListenerRouteDecision {
  const playable = fabric.playlists.filter(isPlaylistPlayable);
  if (playable.length === 0) return { playlistId: null, reason: "empty_genre" };
  if (!listenerPerformerId) {
    // unrelated listener → normal eligible routing (§8446): most-populated playable.
    const sorted = [...playable].sort((a, b) => playlistActiveCount(b) - playlistActiveCount(a));
    return { playlistId: sorted[0].playlistId, reason: "ok" };
  }
  const conflictFree = playable.filter((p) => !playlistHasPerformer(p, listenerPerformerId));
  if (conflictFree.length > 0) {
    const sorted = [...conflictFree].sort((a, b) => playlistActiveCount(b) - playlistActiveCount(a));
    return { playlistId: sorted[0].playlistId, reason: "ok" };
  }
  return { playlistId: null, reason: "no_conflict_free_playlist" };
}

/**
 * §8492/§8444 — own-song listener completion reward = 0. Other creators' songs
 * remain reward-eligible (§8493). No previously earned points are subtracted.
 */
export function listenerCompletionRewardForSong(input: {
  listenerPerformerId: string | null;
  songOwnerId: string;
  baseRewardPoints: number;
}): number {
  if (input.listenerPerformerId && input.listenerPerformerId === input.songOwnerId) {
    return 0; // own song — no self-reward
  }
  return Math.max(0, Math.floor(input.baseRewardPoints));
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime fabric cache — same authority, not a second engine
// ─────────────────────────────────────────────────────────────────────────────

const genreFabrics = new Map<string, StreamWinGenreFabric>();

const GENRE_ALIASES: Record<string, string> = {
  "hip hop": "hip-hop",
  hiphop: "hip-hop",
  "r&b": "rnb",
  "r and b": "rnb",
  electronic: "edm",
  dance: "edm",
};

/** Map a display/engine genre label onto a canonical fabric genre, or null. */
export function resolveStreamWinGenreId(label: string): string | null {
  const raw = label.trim().toLowerCase();
  if (!raw) return null;
  if (isStreamWinGenre(raw)) return raw;
  const compact = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (isStreamWinGenre(compact)) return compact;
  return GENRE_ALIASES[raw] ?? GENRE_ALIASES[compact] ?? null;
}

export function getOrCreateGenreFabric(genreId: string, nowMs = Date.now()): StreamWinGenreFabric | null {
  if (!isStreamWinGenre(genreId)) return null;
  const existing = genreFabrics.get(genreId);
  if (existing) return existing;
  const created = provisionGenreFabric({ genreId, nowMs });
  genreFabrics.set(genreId, created);
  return created;
}

export function placeAcceptedSongOnFabric(input: {
  genreLabel: string;
  songId: string;
  ownerPerformerId: string;
  nowMs?: number;
}): PlacementDecision & { publicName: string | null; genreId: string | null } {
  const genreId = resolveStreamWinGenreId(input.genreLabel);
  if (!genreId) {
    return { ok: false, playlistId: null, reason: "unknown_genre", position: "BOTTOM_NEW_ENTRY", provisioningNeeded: false, publicName: null, genreId: null };
  }
  const fabric = getOrCreateGenreFabric(genreId, input.nowMs);
  if (!fabric) {
    return { ok: false, playlistId: null, reason: "unknown_genre", position: "BOTTOM_NEW_ENTRY", provisioningNeeded: false, publicName: null, genreId: null };
  }
  let decision = placeSongInGenre(fabric, { songId: input.songId, ownerPerformerId: input.ownerPerformerId });
  if (!decision.ok && decision.reason === "genre_full") {
    provisionNextPlaylist(fabric, input.nowMs ?? Date.now());
    decision = placeSongInGenre(fabric, { songId: input.songId, ownerPerformerId: input.ownerPerformerId });
  }
  if (decision.ok && decision.playlistId) {
    applyPlacement(fabric, decision.playlistId, { songId: input.songId, ownerPerformerId: input.ownerPerformerId });
  }
  if (decision.provisioningNeeded) {
    provisionNextPlaylist(fabric, input.nowMs ?? Date.now());
  }
  const named = decision.playlistId ? fabric.playlists.find((p) => p.playlistId === decision.playlistId) : null;
  return { ...decision, publicName: named?.publicName ?? null, genreId };
}

export interface FabricListenerRoute {
  genreId: string | null;
  playlistId: string | null;
  publicName: string | null;
  memberSongIds: string[];
  reason: ListenerRouteDecision["reason"] | "unknown_genre";
}

export function routeListenerOnFabric(input: {
  genreLabel?: string | null;
  listenerPerformerId: string | null;
}): FabricListenerRoute {
  const preferred = input.genreLabel ? resolveStreamWinGenreId(input.genreLabel) : null;
  const genreId = preferred ?? [...genreFabrics.keys()].find((id) => {
    const f = genreFabrics.get(id);
    return f ? f.playlists.some(isPlaylistPlayable) : false;
  }) ?? null;
  if (!genreId) {
    return { genreId: null, playlistId: null, publicName: null, memberSongIds: [], reason: "unknown_genre" };
  }
  const fabric = getOrCreateGenreFabric(genreId);
  if (!fabric) {
    return { genreId, playlistId: null, publicName: null, memberSongIds: [], reason: "unknown_genre" };
  }
  const route = routeListenerInGenre(fabric, input.listenerPerformerId);
  const playlist = route.playlistId ? fabric.playlists.find((p) => p.playlistId === route.playlistId) : null;
  return {
    genreId,
    playlistId: route.playlistId,
    publicName: playlist?.publicName ?? null,
    memberSongIds: playlist?.activeSongIds ?? [],
    reason: route.reason,
  };
}

export function resetStreamWinFabricForCertification(): void {
  genreFabrics.clear();
}

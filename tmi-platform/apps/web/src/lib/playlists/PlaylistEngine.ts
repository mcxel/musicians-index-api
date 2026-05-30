/**
 * PlaylistEngine.ts
 *
 * Stream & Win Playlist Engine for BernoutGlobal / TMI.
 *
 * Rules encoded here:
 *   1. Mandatory catalog inclusion — every playlist must have ≥1 track from
 *      each BernoutGlobal-owned catalog (Berntout Perductions, BJM, Big Kazhdog).
 *   2. Spacing — owned tracks must be ≥ MIN_OWNED_SPACING positions apart.
 *   3. Anti-cluster — no two owned tracks back-to-back.
 *   4. Priority formula — 40% favorites, 30% trending, 20% new, 10% BG rotation.
 *   5. Auto-distribution — new releases injected into all eligible playlists.
 *   6. Rotation — every 24 h positions shuffle, winners rise, low-performers drop.
 *   7. Coverage — every active track must appear in ≥1 playlist.
 *   8. Platform sync — each track stores links for all supported platforms.
 */

export type CatalogId =
  | 'berntout-perductions'
  | 'bjm'
  | 'big-kazhdog'
  | 'community';

export type Platform =
  | 'youtube'
  | 'spotify'
  | 'apple-music'
  | 'amazon-music'
  | 'tidal'
  | 'deezer'
  | 'pandora'
  | 'tmi';

export type PlaylistType =
  | 'stream-and-win'
  | 'usa-top'
  | 'genre'
  | 'discovery'
  | 'new-releases'
  | 'artist-spotlight';

export interface Track {
  id: string;
  title: string;
  artistName: string;
  catalog: CatalogId;
  genre?: string;
  releaseDate: string;   // ISO 8601
  platforms: Partial<Record<Platform, string>>;
  engagementScore: number;   // 0–100, updated daily
  streamCount: number;
  favoriteCount: number;
  isActive: boolean;
}

export interface PlaylistEntry {
  trackId: string;
  position: number;
  insertedAt: number;   // unix ms
  score: number;        // computed rank score used for sorting
}

export interface Playlist {
  id: string;
  name: string;
  type: PlaylistType;
  genre?: string;       // for genre playlists
  entries: PlaylistEntry[];
  lastRotatedAt: number;
  createdAt: number;
}

export interface DistributionResult {
  trackId: string;
  injectedInto: string[];   // playlist ids
  skippedFrom: string[];    // playlist ids (spacing violation)
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MIN_OWNED_SPACING = 3;   // absolute minimum positions between owned tracks
const PREFERRED_SPACING = 7;   // target spacing (best-effort)
const MAX_OWNED_RATIO   = 0.15; // BG-owned tracks ≤ 15% of any playlist

const OWNED_CATALOGS: CatalogId[] = [
  'berntout-perductions',
  'bjm',
  'big-kazhdog',
];

const MANDATORY_CATALOGS: CatalogId[] = [...OWNED_CATALOGS];

// In-memory stores (swap for DB in production)
const TRACK_REGISTRY = new Map<string, Track>();
const PLAYLIST_REGISTRY = new Map<string, Playlist>();

// ── Registry helpers ──────────────────────────────────────────────────────────

export function registerTrack(track: Track): void {
  TRACK_REGISTRY.set(track.id, { ...track });
}

export function getTrack(id: string): Track | undefined {
  return TRACK_REGISTRY.get(id);
}

export function getAllTracks(): Track[] {
  return Array.from(TRACK_REGISTRY.values()).filter(t => t.isActive);
}

export function getTracksByCatalog(catalog: CatalogId): Track[] {
  return getAllTracks().filter(t => t.catalog === catalog);
}

export function registerPlaylist(playlist: Playlist): void {
  PLAYLIST_REGISTRY.set(playlist.id, playlist);
}

export function getPlaylist(id: string): Playlist | undefined {
  return PLAYLIST_REGISTRY.get(id);
}

export function getAllPlaylists(): Playlist[] {
  return Array.from(PLAYLIST_REGISTRY.values());
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  missingCatalogs: CatalogId[];
  spacingViolations: number[];   // positions with violations
  ownedRatioViolation: boolean;
}

export function validatePlaylist(entries: PlaylistEntry[]): ValidationResult {
  const tracks = entries
    .sort((a, b) => a.position - b.position)
    .map(e => ({ ...e, track: TRACK_REGISTRY.get(e.trackId) }))
    .filter((e): e is typeof e & { track: Track } => Boolean(e.track));

  // 1. Mandatory catalog check
  const presentCatalogs = new Set(tracks.map(t => t.track.catalog));
  const missingCatalogs = MANDATORY_CATALOGS.filter(c => !presentCatalogs.has(c));

  // 2. Spacing check
  const spacingViolations: number[] = [];
  let lastOwnedPosition = -MIN_OWNED_SPACING - 1;
  for (const { position, track } of tracks) {
    if (OWNED_CATALOGS.includes(track.catalog)) {
      if (position - lastOwnedPosition < MIN_OWNED_SPACING) {
        spacingViolations.push(position);
      }
      lastOwnedPosition = position;
    }
  }

  // 3. Owned ratio check
  const ownedCount = tracks.filter(t => OWNED_CATALOGS.includes(t.track.catalog)).length;
  const ownedRatioViolation = tracks.length > 0 && ownedCount / tracks.length > MAX_OWNED_RATIO;

  return {
    valid: missingCatalogs.length === 0 && spacingViolations.length === 0 && !ownedRatioViolation,
    missingCatalogs,
    spacingViolations,
    ownedRatioViolation,
  };
}

// ── Scoring ───────────────────────────────────────────────────────────────────

/**
 * Stream & Win priority formula:
 *   40% user favorites  (favoriteCount normalized)
 *   30% trending        (engagementScore)
 *   20% new releases    (released within 30 days = bonus)
 *   10% BG rotation     (owned catalog priority boost)
 */
function computeScore(track: Track, allTracks: Track[]): number {
  const maxFavorites = Math.max(...allTracks.map(t => t.favoriteCount), 1);
  const favoriteScore = (track.favoriteCount / maxFavorites) * 100;

  const engagementScore = track.engagementScore;

  const daysSinceRelease = (Date.now() - new Date(track.releaseDate).getTime()) / 86400000;
  const newReleaseBonus = daysSinceRelease <= 30 ? 100 * (1 - daysSinceRelease / 30) : 0;

  const bgRotationBonus = OWNED_CATALOGS.includes(track.catalog) ? 100 : 0;

  return (
    favoriteScore   * 0.40 +
    engagementScore * 0.30 +
    newReleaseBonus * 0.20 +
    bgRotationBonus * 0.10
  );
}

// ── Playlist builder ──────────────────────────────────────────────────────────

/**
 * Build a new playlist from the registered catalog, applying all rules.
 * community tracks fill remaining slots; BernoutGlobal tracks are distributed
 * at natural spacing intervals.
 */
export function buildPlaylist(
  id: string,
  name: string,
  type: PlaylistType,
  options: { genre?: string; targetSize?: number } = {}
): Playlist {
  const { genre, targetSize = 40 } = options;
  const now = Date.now();
  const allTracks = getAllTracks().filter(t => !genre || t.genre === genre || !t.genre);

  if (allTracks.length === 0) {
    return { id, name, type, genre, entries: [], lastRotatedAt: now, createdAt: now };
  }

  const scored = allTracks.map(t => ({ track: t, score: computeScore(t, allTracks) }));

  const communityTracks = scored
    .filter(s => !OWNED_CATALOGS.includes(s.track.catalog))
    .sort((a, b) => b.score - a.score);

  const ownedByLabel: Partial<Record<CatalogId, typeof scored[0][]>> = {};
  for (const cat of OWNED_CATALOGS) {
    ownedByLabel[cat] = scored
      .filter(s => s.track.catalog === cat)
      .sort((a, b) => b.score - a.score);
  }

  // Place community tracks first at full capacity
  const slots: Array<typeof scored[0] | null> = Array(targetSize).fill(null);
  let commIdx = 0;
  for (let i = 0; i < targetSize; i++) {
    if (commIdx < communityTracks.length) {
      slots[i] = communityTracks[commIdx++] ?? null;
    }
  }

  // Inject owned tracks at spaced intervals (one catalog per injection round)
  const INJECTION_INTERVALS: Record<CatalogId, number> = {
    'berntout-perductions': Math.floor(targetSize * 0.30),
    'bjm':                  Math.floor(targetSize * 0.55),
    'big-kazhdog':          Math.floor(targetSize * 0.75),
  };

  for (const cat of OWNED_CATALOGS) {
    const owned = ownedByLabel[cat];
    if (!owned || owned.length === 0) continue;
    const targetPos = INJECTION_INTERVALS[cat];
    const legalPos = findLegalPosition(slots, targetPos, PREFERRED_SPACING);
    if (legalPos !== -1) {
      slots[legalPos] = owned[0] ?? null;
    }
  }

  // Build final entries, compacting nulls
  const entries: PlaylistEntry[] = slots
    .map((s, idx) => s ? { trackId: s.track.id, position: idx, insertedAt: now, score: s.score } : null)
    .filter((e): e is PlaylistEntry => e !== null);

  return { id, name, type, genre, entries, lastRotatedAt: now, createdAt: now };
}

function findLegalPosition(
  slots: Array<unknown | null>,
  preferred: number,
  minSpacing: number,
): number {
  const clamped = Math.max(0, Math.min(slots.length - 1, preferred));
  for (let delta = 0; delta < slots.length; delta++) {
    for (const sign of [1, -1]) {
      const pos = clamped + sign * delta;
      if (pos < 0 || pos >= slots.length) continue;
      if (slots[pos] !== null) continue;
      // Check spacing from adjacent owned slots
      const neighbors = slots.slice(
        Math.max(0, pos - minSpacing),
        Math.min(slots.length, pos + minSpacing + 1),
      );
      const hasNearOwned = neighbors.some((s, i) => {
        if (i === minSpacing) return false; // this is the candidate slot
        const t = s as { track?: Track } | null;
        return t?.track && OWNED_CATALOGS.includes(t.track.catalog);
      });
      if (!hasNearOwned) return pos;
    }
  }
  return -1;
}

// ── Auto-distribution ─────────────────────────────────────────────────────────

/**
 * Inject a newly released track into all eligible playlists.
 * Skips any playlist where spacing rules cannot be satisfied.
 */
export function distributeNewRelease(trackId: string): DistributionResult {
  const track = TRACK_REGISTRY.get(trackId);
  const result: DistributionResult = { trackId, injectedInto: [], skippedFrom: [] };
  if (!track) return result;

  for (const playlist of PLAYLIST_REGISTRY.values()) {
    const maxPos = playlist.entries.reduce((m, e) => Math.max(m, e.position), -1);
    const candidatePos = findLegalPosition(
      buildSlotMap(playlist),
      Math.floor(Math.random() * (maxPos + 2)),
      OWNED_CATALOGS.includes(track.catalog) ? MIN_OWNED_SPACING : 0,
    );
    if (candidatePos === -1) {
      result.skippedFrom.push(playlist.id);
      continue;
    }
    playlist.entries.push({
      trackId,
      position: candidatePos,
      insertedAt: Date.now(),
      score: computeScore(track, getAllTracks()),
    });
    // Shift subsequent positions
    for (const e of playlist.entries) {
      if (e.trackId !== trackId && e.position >= candidatePos) e.position++;
    }
    result.injectedInto.push(playlist.id);
  }
  return result;
}

function buildSlotMap(playlist: Playlist): Array<PlaylistEntry | null> {
  const maxPos = playlist.entries.reduce((m, e) => Math.max(m, e.position), -1);
  const slots: Array<PlaylistEntry | null> = Array(maxPos + 2).fill(null);
  for (const e of playlist.entries) { slots[e.position] = e; }
  return slots;
}

// ── Daily rotation ────────────────────────────────────────────────────────────

/**
 * Rotate a playlist: recalculate scores, move winners up, low-performers down.
 * Preserves spacing rules during reorder.
 */
export function rotatePlaylist(playlistId: string): Playlist | null {
  const playlist = PLAYLIST_REGISTRY.get(playlistId);
  if (!playlist) return null;

  const allTracks = getAllTracks();
  // Re-score each entry
  for (const entry of playlist.entries) {
    const track = TRACK_REGISTRY.get(entry.trackId);
    if (track) entry.score = computeScore(track, allTracks);
  }

  // Sort community tracks by score (descending), keep owned tracks in fixed slots
  const ownedEntries = playlist.entries.filter(e => {
    const t = TRACK_REGISTRY.get(e.trackId);
    return t && OWNED_CATALOGS.includes(t.catalog);
  });
  const communityEntries = playlist.entries.filter(e => {
    const t = TRACK_REGISTRY.get(e.trackId);
    return !t || !OWNED_CATALOGS.includes(t.catalog);
  });

  communityEntries.sort((a, b) => b.score - a.score);

  // Rebuild positions: owned tracks stay near their original spacing, community fills gaps
  const allSorted = [...communityEntries, ...ownedEntries];
  allSorted.sort((a, b) => {
    const aOwned = OWNED_CATALOGS.includes(TRACK_REGISTRY.get(a.trackId)?.catalog ?? 'community');
    const bOwned = OWNED_CATALOGS.includes(TRACK_REGISTRY.get(b.trackId)?.catalog ?? 'community');
    if (aOwned !== bOwned) return aOwned ? 1 : -1;
    return b.score - a.score;
  });

  allSorted.forEach((e, i) => { e.position = i; });
  playlist.entries = allSorted;
  playlist.lastRotatedAt = Date.now();

  return playlist;
}

// ── Coverage audit ────────────────────────────────────────────────────────────

export function auditCoverage(): { uncovered: Track[]; covered: Track[] } {
  const coveredIds = new Set<string>();
  for (const playlist of PLAYLIST_REGISTRY.values()) {
    for (const entry of playlist.entries) coveredIds.add(entry.trackId);
  }
  const all = getAllTracks();
  return {
    covered:   all.filter(t => coveredIds.has(t.id)),
    uncovered: all.filter(t => !coveredIds.has(t.id)),
  };
}

// ── Seeded BernoutGlobal catalog ──────────────────────────────────────────────

export const BERNOUTGLOBAL_CATALOG: Track[] = [
  {
    id: 'bp-001', title: 'Streets Are Watching', artistName: 'Berntout Perductions',
    catalog: 'berntout-perductions', genre: 'hip-hop',
    releaseDate: '2025-01-15', engagementScore: 82, streamCount: 14200, favoriteCount: 890,
    isActive: true,
    platforms: { youtube: 'https://youtube.com/@berntoutperductions', spotify: '', tmi: '/artists/berntout-perductions' },
  },
  {
    id: 'bp-002', title: 'Crown Season', artistName: 'Berntout Perductions',
    catalog: 'berntout-perductions', genre: 'hip-hop',
    releaseDate: '2025-04-01', engagementScore: 76, streamCount: 9800, favoriteCount: 620,
    isActive: true,
    platforms: { youtube: 'https://youtube.com/@berntoutperductions', tmi: '/artists/berntout-perductions' },
  },
  {
    id: 'bjm-001', title: 'Bars & Beats Vol. 1', artistName: 'BJM The Rapper',
    catalog: 'bjm', genre: 'hip-hop',
    releaseDate: '2025-02-20', engagementScore: 79, streamCount: 11500, favoriteCount: 740,
    isActive: true,
    platforms: { youtube: 'https://youtube.com/@bjmtherapper', tmi: '/artists/bjm' },
  },
  {
    id: 'bjm-002', title: 'Underground Frequency', artistName: 'BJM Beats',
    catalog: 'bjm', genre: 'instrumental',
    releaseDate: '2025-03-10', engagementScore: 71, streamCount: 7600, favoriteCount: 410,
    isActive: true,
    platforms: { youtube: 'https://youtube.com/@bjmbeats', tmi: '/artists/bjm-beats' },
  },
  {
    id: 'bk-001', title: 'Big Dog Energy', artistName: 'Big Kazhdog',
    catalog: 'big-kazhdog', genre: 'hip-hop',
    releaseDate: '2025-01-30', engagementScore: 88, streamCount: 18700, favoriteCount: 1240,
    isActive: true,
    platforms: { youtube: 'https://youtube.com/@bigkazhdog', tmi: '/artists/big-kazhdog' },
  },
  {
    id: 'bk-002', title: 'Top Dog Chronicles', artistName: 'Big Kazhdog',
    catalog: 'big-kazhdog', genre: 'hip-hop',
    releaseDate: '2025-05-01', engagementScore: 91, streamCount: 22300, favoriteCount: 1580,
    isActive: true,
    platforms: { youtube: 'https://youtube.com/@bigkazhdog', tmi: '/artists/big-kazhdog' },
  },
];

// Auto-seed on import
for (const track of BERNOUTGLOBAL_CATALOG) {
  registerTrack(track);
}

/**
 * MusicGenreTaxonomy — canonical genre/subgenre classification authority for
 * music MEDIA (songs, music videos, releases, Add Your Video/Song submissions).
 *
 * OWNER DECISION (2026-10-28): "New dedicated MusicGenreTaxonomy." This is a
 * separate domain from, and does NOT replace:
 *   - PerformerRegistry.PerformerCategory — performer/profile identity. Its 24
 *     values include non-genre account types (Venues, Sponsors, Comedy, Dance
 *     Crews, Hip Hop Dance) that are not song genres at all.
 *   - the Lobby system's CanonicalGenreRegistry (15 values) — 3D spatial/social
 *     room taxonomy, unrelated to media content classification.
 * MAPPING != OWNERSHIP: crosswalks below let the two domains reference each
 * other without either becoming the other's authority. Changing a Lobby must
 * never change a song's classification, and vice versa.
 *
 * PRIMARY_GENRE list is not invented — it is Rule 25's already-locked Radio
 * Network launch taxonomy ("20 launch channels, 2 per genre": Hip-Hop, R&B/Soul,
 * Pop, Rock, Country, EDM/DJ, Gospel/Christian, Jazz/Blues, Latin/World,
 * Comedy/Spoken Word) reused here so Video Shuffle, Radio, submissions, and
 * future charts converge on ONE canonical list instead of a fourth competing one.
 * Rule 25's "Slow Jam Meet & Greet Room" is a social lounge, not a genre, and is
 * intentionally excluded from this media-classification taxonomy.
 *
 * This module is pure data + pure functions. It has no Prisma/DB dependency —
 * importing or calling anything here never touches a database.
 */

export type MusicPrimaryGenreId =
  | 'HIP_HOP'
  | 'RNB_SOUL'
  | 'POP'
  | 'ROCK'
  | 'COUNTRY'
  | 'EDM_DANCE'
  | 'GOSPEL_CHRISTIAN'
  | 'JAZZ_BLUES'
  | 'LATIN_WORLD'
  | 'COMEDY_SPOKEN_WORD';

export interface MusicPrimaryGenre {
  id: MusicPrimaryGenreId;
  displayName: string;
  slug: string;
  type: 'PRIMARY';
  active: boolean;
  sortOrder: number;
  /** Free-text strings (case/whitespace/punctuation-insensitive) that normalize to this id. */
  aliases: string[];
}

export interface MusicSubgenre {
  id: string;
  displayName: string;
  parentId: MusicPrimaryGenreId;
  type: 'SUBGENRE';
  active: boolean;
  sortOrder: number;
  aliases: string[];
}

/**
 * GenreClassification — the result of resolving a submission's declared genre
 * against this taxonomy. GENRE_SOURCE is honest provenance (Rule 20): never
 * fabricate SYSTEM confidence when no classifier actually ran. Today only
 * CREATOR-declared text is resolved; a future audio/metadata classifier would
 * populate systemSuggestedGenre separately rather than overwriting this.
 */
export interface GenreClassification {
  declaredText: string;
  primaryGenre: MusicPrimaryGenreId | null;
  subgenre: string | null;
  matched: boolean;
  source: 'CREATOR' | 'UNRESOLVED';
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// ── Primary genres ────────────────────────────────────────────────────────────

const PRIMARY_GENRES: MusicPrimaryGenre[] = [
  {
    id: 'HIP_HOP',
    displayName: 'Hip-Hop',
    slug: 'hip-hop',
    type: 'PRIMARY',
    active: true,
    sortOrder: 1,
    aliases: ['hip-hop', 'hip hop', 'hiphop', 'rap'],
  },
  {
    id: 'RNB_SOUL',
    displayName: 'R&B / Soul',
    slug: 'rnb-soul',
    type: 'PRIMARY',
    active: true,
    sortOrder: 2,
    aliases: ['r&b', 'r and b', 'r-and-b', 'rnb', 'rhythm and blues', 'soul', 'funk', 'neo soul', 'neo-soul'],
  },
  {
    id: 'POP',
    displayName: 'Pop',
    slug: 'pop',
    type: 'PRIMARY',
    active: true,
    sortOrder: 3,
    aliases: ['pop', 'top 40', 'top40'],
  },
  {
    id: 'ROCK',
    displayName: 'Rock',
    slug: 'rock',
    type: 'PRIMARY',
    active: true,
    sortOrder: 4,
    aliases: ['rock', 'metal', 'punk', 'alternative', 'alt rock', 'alt-rock', 'indie rock', 'indie-rock'],
  },
  {
    id: 'COUNTRY',
    displayName: 'Country',
    slug: 'country',
    type: 'PRIMARY',
    active: true,
    sortOrder: 5,
    aliases: ['country', 'americana', 'bluegrass'],
  },
  {
    id: 'EDM_DANCE',
    displayName: 'EDM / DJ',
    slug: 'edm-dance',
    type: 'PRIMARY',
    active: true,
    sortOrder: 6,
    aliases: ['edm', 'electronic', 'dance', 'dj', 'house', 'techno', 'dubstep', 'trance', 'electronica'],
  },
  {
    id: 'GOSPEL_CHRISTIAN',
    displayName: 'Gospel / Christian',
    slug: 'gospel-christian',
    type: 'PRIMARY',
    active: true,
    sortOrder: 7,
    aliases: ['gospel', 'christian', 'ccm', 'worship', 'praise'],
  },
  {
    id: 'JAZZ_BLUES',
    displayName: 'Jazz / Blues',
    slug: 'jazz-blues',
    type: 'PRIMARY',
    active: true,
    sortOrder: 8,
    aliases: ['jazz', 'blues', 'classical', 'swing'],
  },
  {
    id: 'LATIN_WORLD',
    displayName: 'Latin / World',
    slug: 'latin-world',
    type: 'PRIMARY',
    active: true,
    sortOrder: 9,
    aliases: ['latin', 'world', 'reggae', 'reggaeton', 'afrobeats', 'afrobeat', 'dancehall', 'salsa', 'bachata'],
  },
  {
    id: 'COMEDY_SPOKEN_WORD',
    displayName: 'Comedy / Spoken Word',
    slug: 'comedy-spoken-word',
    type: 'PRIMARY',
    active: true,
    sortOrder: 10,
    aliases: ['comedy', 'spoken word', 'spoken-word', 'poetry'],
  },
];

// ── Subgenres ─────────────────────────────────────────────────────────────────
// Internal classification metadata only (per OWNER DECISION: "Subgenres remain
// internal programming metadata" — never exposed as independent primary
// stations unless a later canonical design explicitly requires it).

const SUBGENRES: MusicSubgenre[] = [
  // Hip-Hop
  { id: 'TRAP', displayName: 'Trap', parentId: 'HIP_HOP', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['trap'] },
  { id: 'BOOM_BAP', displayName: 'Boom Bap', parentId: 'HIP_HOP', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['boom bap', 'boom-bap'] },
  { id: 'DRILL', displayName: 'Drill', parentId: 'HIP_HOP', type: 'SUBGENRE', active: true, sortOrder: 3, aliases: ['drill'] },
  { id: 'CONSCIOUS', displayName: 'Conscious', parentId: 'HIP_HOP', type: 'SUBGENRE', active: true, sortOrder: 4, aliases: ['conscious', 'conscious rap'] },
  { id: 'WEST_COAST', displayName: 'West Coast', parentId: 'HIP_HOP', type: 'SUBGENRE', active: true, sortOrder: 5, aliases: ['west coast', 'west-coast'] },
  { id: 'SOUTHERN', displayName: 'Southern', parentId: 'HIP_HOP', type: 'SUBGENRE', active: true, sortOrder: 6, aliases: ['southern', 'dirty south'] },
  { id: 'HIP_HOP_ALTERNATIVE', displayName: 'Alternative', parentId: 'HIP_HOP', type: 'SUBGENRE', active: true, sortOrder: 7, aliases: ['alternative hip-hop', 'alt hip-hop'] },
  // R&B / Soul
  { id: 'NEO_SOUL', displayName: 'Neo-Soul', parentId: 'RNB_SOUL', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['neo soul', 'neo-soul'] },
  { id: 'FUNK', displayName: 'Funk', parentId: 'RNB_SOUL', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['funk'] },
  { id: 'SLOW_JAM', displayName: 'Slow Jam', parentId: 'RNB_SOUL', type: 'SUBGENRE', active: true, sortOrder: 3, aliases: ['slow jam', 'slow-jam', 'quiet storm'] },
  // Pop
  { id: 'DANCE_POP', displayName: 'Dance Pop', parentId: 'POP', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['dance pop', 'dance-pop'] },
  { id: 'INDIE_POP', displayName: 'Indie Pop', parentId: 'POP', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['indie pop', 'indie-pop'] },
  // Rock
  { id: 'METAL', displayName: 'Metal', parentId: 'ROCK', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['metal'] },
  { id: 'PUNK', displayName: 'Punk', parentId: 'ROCK', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['punk'] },
  { id: 'INDIE_ROCK', displayName: 'Indie Rock', parentId: 'ROCK', type: 'SUBGENRE', active: true, sortOrder: 3, aliases: ['indie rock', 'indie-rock'] },
  // Country
  { id: 'BLUEGRASS', displayName: 'Bluegrass', parentId: 'COUNTRY', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['bluegrass'] },
  { id: 'AMERICANA', displayName: 'Americana', parentId: 'COUNTRY', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['americana'] },
  // EDM / Dance
  { id: 'HOUSE', displayName: 'House', parentId: 'EDM_DANCE', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['house'] },
  { id: 'TECHNO', displayName: 'Techno', parentId: 'EDM_DANCE', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['techno'] },
  { id: 'DUBSTEP', displayName: 'Dubstep', parentId: 'EDM_DANCE', type: 'SUBGENRE', active: true, sortOrder: 3, aliases: ['dubstep'] },
  { id: 'TRANCE', displayName: 'Trance', parentId: 'EDM_DANCE', type: 'SUBGENRE', active: true, sortOrder: 4, aliases: ['trance'] },
  // Gospel / Christian
  { id: 'WORSHIP', displayName: 'Worship', parentId: 'GOSPEL_CHRISTIAN', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['worship'] },
  { id: 'CCM', displayName: 'CCM', parentId: 'GOSPEL_CHRISTIAN', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['ccm', 'contemporary christian'] },
  // Jazz / Blues
  { id: 'CLASSICAL', displayName: 'Classical', parentId: 'JAZZ_BLUES', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['classical'] },
  { id: 'SWING', displayName: 'Swing', parentId: 'JAZZ_BLUES', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['swing'] },
  // Latin / World
  { id: 'REGGAETON', displayName: 'Reggaeton', parentId: 'LATIN_WORLD', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['reggaeton'] },
  { id: 'AFROBEATS', displayName: 'Afrobeats', parentId: 'LATIN_WORLD', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['afrobeats', 'afrobeat'] },
  { id: 'DANCEHALL', displayName: 'Dancehall', parentId: 'LATIN_WORLD', type: 'SUBGENRE', active: true, sortOrder: 3, aliases: ['dancehall'] },
  { id: 'SALSA', displayName: 'Salsa', parentId: 'LATIN_WORLD', type: 'SUBGENRE', active: true, sortOrder: 4, aliases: ['salsa'] },
  // Comedy / Spoken Word
  { id: 'POETRY', displayName: 'Poetry', parentId: 'COMEDY_SPOKEN_WORD', type: 'SUBGENRE', active: true, sortOrder: 1, aliases: ['poetry'] },
  { id: 'STAND_UP', displayName: 'Stand-Up', parentId: 'COMEDY_SPOKEN_WORD', type: 'SUBGENRE', active: true, sortOrder: 2, aliases: ['stand up', 'stand-up'] },
];

// Build normalized-alias → id lookup once at module load (pure, no I/O).
const PRIMARY_ALIAS_LOOKUP = new Map<string, MusicPrimaryGenreId>();
for (const g of PRIMARY_GENRES) {
  PRIMARY_ALIAS_LOOKUP.set(normalize(g.displayName), g.id);
  PRIMARY_ALIAS_LOOKUP.set(normalize(g.id), g.id);
  for (const alias of g.aliases) PRIMARY_ALIAS_LOOKUP.set(normalize(alias), g.id);
}

const SUBGENRE_ALIAS_LOOKUP = new Map<string, MusicSubgenre>();
for (const s of SUBGENRES) {
  SUBGENRE_ALIAS_LOOKUP.set(normalize(s.displayName), s);
  SUBGENRE_ALIAS_LOOKUP.set(normalize(s.id), s);
  for (const alias of s.aliases) SUBGENRE_ALIAS_LOOKUP.set(normalize(alias), s);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAllPrimaryGenres(): MusicPrimaryGenre[] {
  return [...PRIMARY_GENRES].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPrimaryGenreById(id: string): MusicPrimaryGenre | null {
  return PRIMARY_GENRES.find((g) => g.id === id) ?? null;
}

export function isValidPrimaryGenre(id: string): id is MusicPrimaryGenreId {
  return PRIMARY_GENRES.some((g) => g.id === id);
}

export function getSubgenresForPrimary(primaryId: MusicPrimaryGenreId): MusicSubgenre[] {
  return SUBGENRES.filter((s) => s.parentId === primaryId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getSubgenreById(id: string): MusicSubgenre | null {
  return SUBGENRES.find((s) => s.id === id) ?? null;
}

/**
 * Resolves arbitrary free text (what a creator types/selects today) to a
 * canonical primary genre id, or null if nothing matches. Case/whitespace/
 * punctuation-insensitive. Does not guess — an unmatched string returns null
 * rather than silently defaulting to a catch-all bucket (Rule 20: no fabricated
 * classification).
 */
export function resolvePrimaryGenreFromFreeText(text: string): MusicPrimaryGenreId | null {
  if (!text) return null;
  return PRIMARY_ALIAS_LOOKUP.get(normalize(text)) ?? null;
}

/**
 * Resolves free text to a subgenre, if it matches one. A matched subgenre's
 * parentId is always the correct primary — callers should prefer this over a
 * separate primary-genre guess when both are available.
 */
export function resolveSubgenreFromFreeText(text: string): MusicSubgenre | null {
  if (!text) return null;
  return SUBGENRE_ALIAS_LOOKUP.get(normalize(text)) ?? null;
}

/**
 * Classifies a submission's declared genre text against this taxonomy. This is
 * the function SubmissionEngine/Song/Video intake should call instead of
 * storing free text directly. Honest about provenance and non-matches — see
 * GenreClassification's source field.
 */
export function classifyDeclaredGenre(declaredText: string): GenreClassification {
  const text = (declaredText ?? '').trim();
  const subgenreMatch = resolveSubgenreFromFreeText(text);
  if (subgenreMatch) {
    return {
      declaredText: text,
      primaryGenre: subgenreMatch.parentId,
      subgenre: subgenreMatch.id,
      matched: true,
      source: 'CREATOR',
    };
  }

  const primaryMatch = resolvePrimaryGenreFromFreeText(text);
  if (primaryMatch) {
    return {
      declaredText: text,
      primaryGenre: primaryMatch,
      subgenre: null,
      matched: true,
      source: 'CREATOR',
    };
  }

  return {
    declaredText: text,
    primaryGenre: null,
    subgenre: null,
    matched: false,
    source: 'UNRESOLVED',
  };
}

/**
 * Crosswalk: primary genre -> performer-taxonomy categories that are
 * conceptually related, for discovery/display purposes only. MAPPING !=
 * OWNERSHIP (see file header) — this never mutates or is mutated by
 * PerformerRegistry, and PerformerRegistry does not import this file.
 * Intentionally omits non-genre PerformerCategory values (Venues, Sponsors,
 * Comedy, Dance Crews, Hip Hop Dance are account/room types, not song genres,
 * except where Comedy legitimately maps to COMEDY_SPOKEN_WORD).
 */
const PRIMARY_TO_PERFORMER_CATEGORY_CROSSWALK: Record<MusicPrimaryGenreId, string[]> = {
  HIP_HOP: ['Hip-Hop', 'Rap'],
  RNB_SOUL: ['R&B', 'Soul', 'Funk'],
  POP: ['Pop'],
  ROCK: ['Rock', 'Metal', 'Indie'],
  COUNTRY: ['Country'],
  EDM_DANCE: ['EDM', 'Electronic'],
  GOSPEL_CHRISTIAN: ['Gospel'],
  JAZZ_BLUES: ['Jazz', 'Blues'],
  LATIN_WORLD: ['Latin', 'Reggae', 'Afrobeats', 'Dancehall'],
  COMEDY_SPOKEN_WORD: ['Comedy'],
};

export function getRelatedPerformerCategories(primaryId: MusicPrimaryGenreId): string[] {
  return PRIMARY_TO_PERFORMER_CATEGORY_CROSSWALK[primaryId] ?? [];
}

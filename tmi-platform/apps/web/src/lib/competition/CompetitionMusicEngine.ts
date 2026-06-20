/**
 * CompetitionMusicEngine
 * Canonical music source of truth for all TMI competition types.
 *
 * Three competition lanes:
 *   battle    → shared beat (locked, no skip, sync start) — unless BYOB/acapella format
 *   cypher    → Mode A (shared) | Mode B (rotating) | Mode C (DJ)
 *   challenge → BYOM (performer brings own music — default open)
 *
 * Wires: Beat Registry → Room Creation → Playlist Engine → Battle/Cypher Runtime
 */

import { isBeatExclusivelySold } from "@/lib/beats/BeatInventoryEngine";

// ─── Competition lanes ────────────────────────────────────────────────────────

export type CompetitionType = 'battle' | 'cypher' | 'challenge' | 'showcase';

export type CypherMode = 'shared' | 'rotating' | 'dj-controlled';

// ─── Music modes ─────────────────────────────────────────────────────────────

export type MusicMode =
  | 'shared'        // one beat, everyone performs on it — locked, no skip
  | 'rotating'      // beat changes per performer slot (cypher only)
  | 'byom'          // bring your own music — performer uploads their track
  | 'dj-controlled' // live DJ controls playback
  | 'acapella'      // no music — voice/instrument only
  | 'none';         // non-music format (dirty dozens, roast, etc.)

export type BeatSource =
  | 'beat-registry'  // pull from TMI Beat Registry (community/lease/exclusive)
  | 'user-upload'    // performer uploads their own file
  | 'sponsor-pack'   // sponsor provides a curated beat pack
  | 'dj-live'        // DJ controls in real time
  | 'none';

export type BeatLicenseType = 'community' | 'lease' | 'exclusive' | 'sponsor';

// ─── Rights & ownership layer ─────────────────────────────────────────────────

export interface BeatUsage {
  beatId: string;
  ownerId: string;
  licenseType: BeatLicenseType;
  genre: string;
  bpm?: number;
  usageCount: number;
  usageCap?: number;      // max times this beat can be used in competitions
  revenueShare?: number;  // percentage going to beat owner from prize pool
}

// ─── Music config stored per room ─────────────────────────────────────────────

export interface MusicConfig {
  competitionType: CompetitionType;
  musicMode: MusicMode;
  beatSource: BeatSource;
  genre?: string;
  playlistId?: string;
  beatIds?: string[];
  beatUsage?: BeatUsage[];
  sponsorId?: string;
  sponsorBeatPackId?: string;
  cypherMode?: CypherMode;
  skipAllowed: boolean;
  shuffleAllowed: boolean;
  replayLocked: boolean;
  createdAt: string;
}

// ─── Rules object returned to consumers ───────────────────────────────────────

export interface MusicRules {
  competitionType: CompetitionType;
  musicMode: MusicMode;
  beatSource: BeatSource;
  skipAllowed: boolean;
  shuffleAllowed: boolean;
  replayLocked: boolean;
  description: string;
}

// ─── Beat Registry entry ──────────────────────────────────────────────────────

export interface BeatRegistryEntry {
  id: string;
  title: string;
  ownerId: string;
  licenseType: BeatLicenseType;
  genre: string;
  bpm: number;
  audioUrl: string;
  tags: string[];
  usageCount: number;
  isAvailableForBattle: boolean;
  isAvailableForCypher: boolean;
  sponsorId?: string;
}

// ─── Format → music mode map ──────────────────────────────────────────────────

const FORMAT_MUSIC_OVERRIDES: Record<string, MusicMode> = {
  'acapella-battle':  'acapella',
  'acapella':         'acapella',
  'byob':             'byom',
  'bring-your-own-beat': 'byom',
  'producer-mc':      'shared',   // producer submits beat → shared for that room
  'dj-mc':            'dj-controlled',
  'beat-submission':  'shared',   // both submit; engine picks one for judging
  'flip-battle':      'shared',   // same sample, provided by platform
  'yo-mama':          'none',
  'roast':            'none',
  'freestyle-roast':  'none',
  'insult-battle':    'none',
  'comedy-roast':     'none',
  'beatbox':          'acapella',
  'dj':               'dj-controlled',
  'dj-vs-dj':         'dj-controlled',
};

// ─── In-memory room music config store ────────────────────────────────────────
// When Prisma RoomSession gains a musicConfig JSON field, swap this for DB writes.

const roomMusicStore = new Map<string, MusicConfig>();

// ─── Engine ───────────────────────────────────────────────────────────────────

export class CompetitionMusicEngine {

  getRules(
    type: CompetitionType,
    format?: string,
    cypherMode?: CypherMode,
  ): MusicRules {
    // Challenges always BYOM
    if (type === 'challenge') {
      return {
        competitionType: 'challenge',
        musicMode: 'byom',
        beatSource: 'user-upload',
        skipAllowed: true,
        shuffleAllowed: false,
        replayLocked: true,
        description: 'Performer brings their own track. No shared beat.',
      };
    }

    // Cyphers respect mode selection
    if (type === 'cypher') {
      const mode = cypherMode ?? 'shared';
      const map: Record<CypherMode, MusicRules> = {
        shared: {
          competitionType: 'cypher', musicMode: 'shared', beatSource: 'beat-registry',
          skipAllowed: false, shuffleAllowed: false, replayLocked: true,
          description: 'One beat. Everyone takes turns. Classic hip-hop cypher.',
        },
        rotating: {
          competitionType: 'cypher', musicMode: 'rotating', beatSource: 'beat-registry',
          skipAllowed: false, shuffleAllowed: false, replayLocked: true,
          description: 'Beat rotates with each performer slot. Playlist Engine auto-advances.',
        },
        'dj-controlled': {
          competitionType: 'cypher', musicMode: 'dj-controlled', beatSource: 'dj-live',
          skipAllowed: true, shuffleAllowed: true, replayLocked: true,
          description: 'DJ controls music in real time. No auto-advance.',
        },
      };
      return map[mode];
    }

    // Battles — check format overrides first
    if (format && FORMAT_MUSIC_OVERRIDES[format]) {
      const musicMode = FORMAT_MUSIC_OVERRIDES[format];
      const beatSource: BeatSource =
        musicMode === 'acapella' || musicMode === 'none' ? 'none' :
        musicMode === 'byom' ? 'user-upload' :
        musicMode === 'dj-controlled' ? 'dj-live' :
        'beat-registry';

      return {
        competitionType: type,
        musicMode,
        beatSource,
        skipAllowed: musicMode === 'byom',
        shuffleAllowed: false,
        replayLocked: true,
        description: this._describeMode(musicMode, format),
      };
    }

    // Default battle: shared beat, locked
    return {
      competitionType: 'battle',
      musicMode: 'shared',
      beatSource: 'beat-registry',
      skipAllowed: false,
      shuffleAllowed: false,
      replayLocked: true,
      description: 'Host selects a beat from Beat Registry. Everyone performs on the same track.',
    };
  }

  resolveMusicConfig(options: {
    competitionType: CompetitionType;
    format?: string;
    genre?: string;
    sponsorId?: string;
    cypherMode?: CypherMode;
    beatIds?: string[];
    playlistId?: string;
  }): MusicConfig {
    const rules = this.getRules(options.competitionType, options.format, options.cypherMode);

    const beatSource: BeatSource =
      options.sponsorId ? 'sponsor-pack' : rules.beatSource;

    return {
      competitionType: options.competitionType,
      musicMode: rules.musicMode,
      beatSource,
      genre: options.genre,
      playlistId: options.playlistId,
      beatIds: options.beatIds ?? [],
      beatUsage: [],
      sponsorId: options.sponsorId,
      cypherMode: options.cypherMode,
      skipAllowed: rules.skipAllowed,
      shuffleAllowed: rules.shuffleAllowed,
      replayLocked: rules.replayLocked,
      createdAt: new Date().toISOString(),
    };
  }

  bindToRoom(roomId: string, config: MusicConfig): void {
    roomMusicStore.set(roomId, config);
  }

  getRoomMusicConfig(roomId: string): MusicConfig | null {
    return roomMusicStore.get(roomId) ?? null;
  }

  formatRequiresSharedBeat(format: string): boolean {
    const mode = FORMAT_MUSIC_OVERRIDES[format];
    if (!mode) return true; // default battle = shared
    return mode === 'shared';
  }

  formatIsBYOM(format: string): boolean {
    return FORMAT_MUSIC_OVERRIDES[format] === 'byom';
  }

  formatIsAcapella(format: string): boolean {
    return FORMAT_MUSIC_OVERRIDES[format] === 'acapella';
  }

  filterBeatsByGenre(beats: BeatRegistryEntry[], genre: string): BeatRegistryEntry[] {
    const g = genre.toLowerCase();
    return beats.filter(b =>
      b.genre.toLowerCase() === g ||
      b.tags.some(t => t.toLowerCase().includes(g))
    );
  }

  recordBeatUsage(config: MusicConfig, entry: BeatRegistryEntry): MusicConfig {
    const usage: BeatUsage = {
      beatId: entry.id,
      ownerId: entry.ownerId,
      licenseType: entry.licenseType,
      genre: entry.genre,
      bpm: entry.bpm,
      usageCount: entry.usageCount + 1,
      revenueShare: entry.licenseType === 'lease' ? 15 : entry.licenseType === 'exclusive' ? 0 : 10,
    };
    return {
      ...config,
      beatIds: [...(config.beatIds ?? []), entry.id],
      beatUsage: [...(config.beatUsage ?? []), usage],
    };
  }

  private _describeMode(mode: MusicMode, format: string): string {
    const map: Record<MusicMode, string> = {
      acapella:       `${format} — no instrumentals. Voice and skill only.`,
      byom:           'Each performer brings their own beat. No shared track.',
      shared:         'Single beat locked for all performers. No skip allowed.',
      rotating:       'Beat rotates per performer slot.',
      'dj-controlled': 'DJ controls music live. No pre-selected track.',
      none:           'No music required for this format.',
    };
    return map[mode] ?? 'Standard battle music rules.';
  }
}

export const competitionMusicEngine = new CompetitionMusicEngine();

// ─── Beat Registry (seed data — replace with Prisma Beat model query) ─────────

export const BEAT_REGISTRY_SEED: BeatRegistryEntry[] = [
  { id: 'beat-001', title: 'Dark Trap 140', ownerId: 'sys-tmi', licenseType: 'community', genre: 'Hip-Hop', bpm: 140, audioUrl: '/beats/dark-trap-140.mp3', tags: ['trap', 'hip-hop', 'dark'], usageCount: 0, isAvailableForBattle: true, isAvailableForCypher: true },
  { id: 'beat-002', title: 'Boom Bap Classic', ownerId: 'sys-tmi', licenseType: 'community', genre: 'Hip-Hop', bpm: 90, audioUrl: '/beats/boom-bap-classic.mp3', tags: ['boom-bap', 'hip-hop', 'classic'], usageCount: 0, isAvailableForBattle: true, isAvailableForCypher: true },
  { id: 'beat-003', title: 'R&B Smooth Keys', ownerId: 'sys-tmi', licenseType: 'community', genre: 'R&B', bpm: 75, audioUrl: '/beats/rnb-smooth-keys.mp3', tags: ['r&b', 'smooth', 'keys'], usageCount: 0, isAvailableForBattle: false, isAvailableForCypher: true },
  { id: 'beat-004', title: 'Afrobeats Fire', ownerId: 'sys-tmi', licenseType: 'community', genre: 'Afrobeats', bpm: 102, audioUrl: '/beats/afrobeats-fire.mp3', tags: ['afrobeats', 'dance', 'fire'], usageCount: 0, isAvailableForBattle: true, isAvailableForCypher: true },
  { id: 'beat-005', title: 'Gospel Rise', ownerId: 'sys-tmi', licenseType: 'community', genre: 'Gospel', bpm: 80, audioUrl: '/beats/gospel-rise.mp3', tags: ['gospel', 'praise', 'church'], usageCount: 0, isAvailableForBattle: false, isAvailableForCypher: true },
  { id: 'beat-006', title: 'EDM Drop Zone', ownerId: 'sys-tmi', licenseType: 'community', genre: 'EDM', bpm: 128, audioUrl: '/beats/edm-drop-zone.mp3', tags: ['edm', 'dance', 'drop'], usageCount: 0, isAvailableForBattle: true, isAvailableForCypher: true },
];

// A beat sold exclusively in the Beat Marketplace must never be offered for
// competition use, even though these are deliberately separate registries
// (apps/web/src/lib/beats/BeatInventoryEngine.ts) — see isBeatExclusivelySold.
function excludeExclusivelySoldBeats(beats: BeatRegistryEntry[]): BeatRegistryEntry[] {
  return beats.filter((b) => !isBeatExclusivelySold(b.id));
}

export function getBeatsByGenreForBattle(genre: string): BeatRegistryEntry[] {
  return excludeExclusivelySoldBeats(competitionMusicEngine.filterBeatsByGenre(
    BEAT_REGISTRY_SEED.filter(b => b.isAvailableForBattle),
    genre,
  ));
}

export function getBeatsByGenreForCypher(genre: string): BeatRegistryEntry[] {
  return excludeExclusivelySoldBeats(competitionMusicEngine.filterBeatsByGenre(
    BEAT_REGISTRY_SEED.filter(b => b.isAvailableForCypher),
    genre,
  ));
}

// PerformanceTaxonomyRegistry.ts
// Central canonical taxonomy for experiences, skills, genres, subgenres, and formats.

export type Experience = 'GAUNTLET' | 'CHALLENGE' | 'CYPHER' | 'BATTLE' | 'PERFORMANCE_VIDEO';
export type Skill =
  | 'MUSIC'
  | 'COMEDY'
  | 'DANCE'
  | 'DJ'
  | 'PRODUCER'
  | 'INSTRUMENT'
  | 'MAGIC'
  | 'SPOKEN_WORD'
  | 'PERFORMANCE_VIDEO';

export type Genre =
  // Music genres
  | 'HIP_HOP'
  | 'RNB'
  | 'COUNTRY'
  | 'ROCK'
  | 'ELECTRONIC'
  // Comedy genres
  | 'COMEDY'
  // Dance genres
  | 'DANCE'
  // Instrument families are also treated as genres for matching purposes
  | 'INSTRUMENT'
  // Producer categories
  | 'PRODUCER';

export type Subgenre = string; // flexible, defined per skill/genre
export type Format = string; // e.g., 'SONG', 'LIVE_SET', etc.

interface TaxonomyNode {
  subgenres?: Record<string, { formats: string[] }>; // subgenre -> formats
  formats?: string[]; // when no subgenre level (direct formats)
}

interface SkillNode {
  [genre: string]: TaxonomyNode;
}

interface Taxonomy {
  [skill: string]: SkillNode;
}

export const PerformanceTaxonomy: Taxonomy = {
  MUSIC: {
    HIP_HOP: {
      subgenres: {
        TRAP: { formats: ['SONG', 'LIVE_PERFORMANCE'] },
        BOOM_BAP: { formats: ['SONG'] },
        DRILL: { formats: ['SONG'] },
        CONSCIOUS: { formats: ['SONG'] },
        OLD_SCHOOL: { formats: ['SONG'] },
        ALTERNATIVE_HIP_HOP: { formats: ['SONG'] },
        FREESTYLE: { formats: ['LIVE_PERFORMANCE'] },
      },
    },
    RNB: {
      subgenres: {
        CONTEMPORARY_RNB: { formats: ['SONG'] },
        NEO_SOUL: { formats: ['SONG'] },
        ALTERNATIVE_RNB: { formats: ['SONG'] },
        QUIET_STORM: { formats: ['SONG'] },
        SOUL: { formats: ['SONG'] },
      },
    },
    COUNTRY: {
      subgenres: {
        TRADITIONAL_COUNTRY: { formats: ['SONG'] },
        MODERN_COUNTRY: { formats: ['SONG'] },
        COUNTRY_ROCK: { formats: ['SONG'] },
        AMERICANA: { formats: ['SONG'] },
        BLUEGRASS: { formats: ['SONG'] },
        OUTLAW_COUNTRY: { formats: ['SONG'] },
      },
    },
    ROCK: {
      subgenres: {
        CLASSIC_ROCK: { formats: ['SONG'] },
        ALTERNATIVE_ROCK: { formats: ['SONG'] },
        INDIE_ROCK: { formats: ['SONG'] },
        PUNK: { formats: ['SONG'] },
        METAL: { formats: ['SONG'] },
        HARD_ROCK: { formats: ['SONG'] },
      },
    },
    ELECTRONIC: {
      subgenres: {
        HOUSE: { formats: ['SONG'] },
        TECHNO: { formats: ['SONG'] },
        EDM: { formats: ['SONG'] },
        DRUM_AND_BASS: { formats: ['SONG'] },
        DUBSTEP: { formats: ['SONG'] },
        TRANCE: { formats: ['SONG'] },
      },
    },
  },
  COMEDY: {
    STAND_UP: { formats: ['LIVE_SET', 'RECORDED_SET'] },
    ONE_LINERS: { formats: ['LIVE_SET'] },
    STORYTELLING: { formats: ['LIVE_SET'] },
    OBSERVATIONAL: { formats: ['LIVE_SET'] },
    ROAST: { formats: ['LIVE_SET'] },
    IMPRESSIONS: { formats: ['LIVE_SET'] },
    CHARACTER_COMEDY: { formats: ['LIVE_SET'] },
    CLEAN_COMEDY: { formats: ['LIVE_SET'] },
  },
  DANCE: {
    HIP_HOP_DANCE: { formats: ['LIVE_SET'] },
    BREAKING: { formats: ['LIVE_SET'] },
    POPPING: { formats: ['LIVE_SET'] },
    LOCKING: { formats: ['LIVE_SET'] },
    KRUMP: { formats: ['LIVE_SET'] },
    BALLET: { formats: ['LIVE_SET'] },
    CONTEMPORARY: { formats: ['LIVE_SET'] },
    SALSA: { formats: ['LIVE_SET'] },
    AFROBEATS_DANCE: { formats: ['LIVE_SET'] },
    DANCEHALL: { formats: ['LIVE_SET'] },
    FREESTYLE_DANCE: { formats: ['LIVE_SET'] },
  },
  INSTRUMENT: {
    GUITAR: {
      subgenres: {
        ELECTRIC: { formats: ['LIVE_PERFORMANCE'] },
        ACOUSTIC: { formats: ['LIVE_PERFORMANCE'] },
        LEAD: { formats: ['LIVE_PERFORMANCE'] },
        RHYTHM: { formats: ['LIVE_PERFORMANCE'] },
      },
    },
    PIANO: {
      subgenres: {
        CLASSICAL: { formats: ['LIVE_PERFORMANCE'] },
        JAZZ: { formats: ['LIVE_PERFORMANCE'] },
        CONTEMPORARY: { formats: ['LIVE_PERFORMANCE'] },
      },
    },
    SAXOPHONE: {
      subgenres: {
        JAZZ: { formats: ['LIVE_PERFORMANCE'] },
        RNB: { formats: ['LIVE_PERFORMANCE'] },
        FREESTYLE: { formats: ['LIVE_PERFORMANCE'] },
      },
    },
    DRUMS: { formats: ['LIVE_PERFORMANCE'] },
    BASS: { formats: ['LIVE_PERFORMANCE'] },
    TRUMPET: { formats: ['LIVE_PERFORMANCE'] },
    VIOLIN: { formats: ['LIVE_PERFORMANCE'] },
    CLARINET: { formats: ['LIVE_PERFORMANCE'] },
    FLUTE: { formats: ['LIVE_PERFORMANCE'] },
    CELLO: { formats: ['LIVE_PERFORMANCE'] },
    TROMBONE: { formats: ['LIVE_PERFORMANCE'] },
    KEYBOARD: { formats: ['LIVE_PERFORMANCE'] },
    OTHER: { formats: ['LIVE_PERFORMANCE'] },
  },
  PRODUCER: {
    TRAP_BEAT: { formats: ['CONTENT_SUBMISSION'] },
    BOOM_BAP_BEAT: { formats: ['CONTENT_SUBMISSION'] },
    RNB_BEAT: { formats: ['CONTENT_SUBMISSION'] },
    AFROBEATS_BEAT: { formats: ['CONTENT_SUBMISSION'] },
    DRILL_BEAT: { formats: ['CONTENT_SUBMISSION'] },
    POP_BEAT: { formats: ['CONTENT_SUBMISSION'] },
    EDM_BEAT: { formats: ['CONTENT_SUBMISSION'] },
    SAMPLE_BASED: { formats: ['CONTENT_SUBMISSION'] },
    LIVE_INSTRUMENTATION: { formats: ['CONTENT_SUBMISSION'] },
  },
  // Placeholder for other skills
  DJ: {},
  MAGIC: {},
  SPOKEN_WORD: {},
  PERFORMANCE_VIDEO: {},
};

/** Helper to retrieve all skills */
export const getSkills = (): Skill[] => Object.keys(PerformanceTaxonomy) as Skill[];
/** Retrieve genres for a skill */
export const getGenresForSkill = (skill: Skill): string[] =>
  PerformanceTaxonomy[skill] ? Object.keys(PerformanceTaxonomy[skill]) : [];
/** Retrieve subgenres for a skill & genre */
export const getSubgenres = (skill: Skill, genre: string): string[] => {
  const node = PerformanceTaxonomy[skill]?.[genre];
  if (!node) return [];
  return node.subgenres ? Object.keys(node.subgenres) : [];
};
/** Retrieve formats for a path */
export const getFormats = (
  skill: Skill,
  genre: string,
  subgenre?: string,
): string[] => {
  const genreNode = PerformanceTaxonomy[skill]?.[genre];
  if (!genreNode) return [];
  if (subgenre && genreNode.subgenres && genreNode.subgenres[subgenre]) {
    return genreNode.subgenres[subgenre].formats;
  }
  if (genreNode.formats) return genreNode.formats;
  return [];
};

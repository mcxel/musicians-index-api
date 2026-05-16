// SeasonPassSkinEngine
// Defines seasonal instrument skins — one per season.
// Core progression logic never changes; only the visual shell rotates each season.
// Season 1 = Guitar (active). Seasons 2–10 are defined for roadmap display.

export type InstrumentType =
  | "guitar" | "saxophone" | "trumpet" | "drums" | "keyboard"
  | "violin" | "vocal_mic" | "producer_board" | "dj_mixer" | "bass";

export type ProgressionStyle =
  | "fretboard"   // guitar — lights move up neck
  | "keys"        // saxophone — keys press down
  | "valves"      // trumpet — valves depress
  | "rings"       // drums — rings glow outward
  | "piano_keys"  // keyboard — keys light up
  | "strings"     // violin — bow position moves
  | "waveform"    // vocal_mic — wave rises
  | "pads"        // producer_board — pads light sequentially
  | "crossfader"  // dj_mixer — crossfader sweeps
  | "fretboard";  // bass — same as guitar neck

export type SeasonSkin = {
  seasonId: string;        // "season-1", "season-2", etc.
  seasonNumber: number;
  seasonName: string;      // "The Rise"
  instrument: InstrumentType;
  instrumentEmoji: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  progressionStyle: ProgressionStyle;
  unlockLabel: string;     // what animates at level-up: "Fret Lights Up"
  maxLevel: number;        // always 10
  isActive: boolean;       // current live season
};

export const SEASON_SKINS: SeasonSkin[] = [
  {
    seasonId: "season-1",
    seasonNumber: 1,
    seasonName: "The Rise",
    instrument: "guitar",
    instrumentEmoji: "🎸",
    primaryColor: "#AA2DFF",
    accentColor: "#FFD700",
    glowColor: "#AA2DFF",
    progressionStyle: "fretboard",
    unlockLabel: "Fret Lights Up",
    maxLevel: 10,
    isActive: true,
  },
  {
    seasonId: "season-2",
    seasonNumber: 2,
    seasonName: "The Smooth",
    instrument: "saxophone",
    instrumentEmoji: "🎷",
    primaryColor: "#00FFFF",
    accentColor: "#FF2DAA",
    glowColor: "#00FFFF",
    progressionStyle: "keys",
    unlockLabel: "Key Pressed",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-3",
    seasonNumber: 3,
    seasonName: "The Fanfare",
    instrument: "trumpet",
    instrumentEmoji: "🎺",
    primaryColor: "#FFD700",
    accentColor: "#FF6B35",
    glowColor: "#FFD700",
    progressionStyle: "valves",
    unlockLabel: "Valve Opens",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-4",
    seasonNumber: 4,
    seasonName: "The Pulse",
    instrument: "drums",
    instrumentEmoji: "🥁",
    primaryColor: "#FF2DAA",
    accentColor: "#00FF88",
    glowColor: "#FF2DAA",
    progressionStyle: "rings",
    unlockLabel: "Ring Glows",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-5",
    seasonNumber: 5,
    seasonName: "The Keys",
    instrument: "keyboard",
    instrumentEmoji: "🎹",
    primaryColor: "#00FF88",
    accentColor: "#AA2DFF",
    glowColor: "#00FF88",
    progressionStyle: "piano_keys",
    unlockLabel: "Key Illuminates",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-6",
    seasonNumber: 6,
    seasonName: "The Strings",
    instrument: "violin",
    instrumentEmoji: "🎻",
    primaryColor: "#FF6B35",
    accentColor: "#FFD700",
    glowColor: "#FF6B35",
    progressionStyle: "strings",
    unlockLabel: "String Resonates",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-7",
    seasonNumber: 7,
    seasonName: "The Voice",
    instrument: "vocal_mic",
    instrumentEmoji: "🎤",
    primaryColor: "#c4b5fd",
    accentColor: "#FF2DAA",
    glowColor: "#c4b5fd",
    progressionStyle: "waveform",
    unlockLabel: "Wave Rises",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-8",
    seasonNumber: 8,
    seasonName: "The Studio",
    instrument: "producer_board",
    instrumentEmoji: "🎛",
    primaryColor: "#00FFFF",
    accentColor: "#00FF88",
    glowColor: "#00FFFF",
    progressionStyle: "pads",
    unlockLabel: "Pad Fires",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-9",
    seasonNumber: 9,
    seasonName: "The Drop",
    instrument: "dj_mixer",
    instrumentEmoji: "🎚",
    primaryColor: "#FF2DAA",
    accentColor: "#AA2DFF",
    glowColor: "#FF2DAA",
    progressionStyle: "crossfader",
    unlockLabel: "Crossfader Sweeps",
    maxLevel: 10,
    isActive: false,
  },
  {
    seasonId: "season-10",
    seasonNumber: 10,
    seasonName: "The Foundation",
    instrument: "bass",
    instrumentEmoji: "🎸",
    primaryColor: "#FFD700",
    accentColor: "#00FF88",
    glowColor: "#FFD700",
    progressionStyle: "fretboard",
    unlockLabel: "Bass Line Drops",
    maxLevel: 10,
    isActive: false,
  },
];

export function getActiveSkin(): SeasonSkin {
  return SEASON_SKINS.find((s) => s.isActive) ?? SEASON_SKINS[0]!;
}

export function getSkinBySeason(seasonId: string): SeasonSkin | undefined {
  return SEASON_SKINS.find((s) => s.seasonId === seasonId);
}

export function getSkinByNumber(n: number): SeasonSkin | undefined {
  return SEASON_SKINS.find((s) => s.seasonNumber === n);
}

export function getAllSkins(): SeasonSkin[] {
  return SEASON_SKINS;
}

export function getCollectorSkins(collectedSeasonIds: string[]): SeasonSkin[] {
  return SEASON_SKINS.filter((s) => collectedSeasonIds.includes(s.seasonId));
}

export function getMissingSkins(collectedSeasonIds: string[]): SeasonSkin[] {
  return SEASON_SKINS.filter((s) => !collectedSeasonIds.includes(s.seasonId));
}

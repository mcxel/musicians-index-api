// SeasonPassInstrumentEngine
// Manages the instrument shell progression per season.
// Core XP logic stays in SeasonPassEngine — this layer only governs visual instrument identity.

export type InstrumentShell =
  | "guitar"
  | "bass"
  | "keys"
  | "sax"
  | "trumpet"
  | "drums"
  | "violin"
  | "harp"
  | "flute"
  | "theremin";

export type SeasonInstrument = {
  seasonId: string;
  seasonNumber: number;
  seasonName: string;
  instrument: InstrumentShell;
  instrumentLabel: string;
  instrumentEmoji: string;
  primaryColor: string;
  accentColor: string;
  unlockXp: number;
  isActive: boolean;
  progressionStyle: "fretboard" | "keys" | "brass" | "percussion" | "strings" | "wind" | "experimental";
  flavorText: string;
};

export const SEASON_INSTRUMENTS: SeasonInstrument[] = [
  { seasonId: "s1",  seasonNumber: 1,  seasonName: "The Rise",       instrument: "guitar",   instrumentLabel: "Guitar",   instrumentEmoji: "🎸", primaryColor: "#AA2DFF", accentColor: "#FFD700", unlockXp: 0,     isActive: true,  progressionStyle: "fretboard",  flavorText: "Where legends begin" },
  { seasonId: "s2",  seasonNumber: 2,  seasonName: "The Groove",      instrument: "bass",     instrumentLabel: "Bass",     instrumentEmoji: "🎸", primaryColor: "#00FF88", accentColor: "#00FFFF", unlockXp: 500,   isActive: false, progressionStyle: "fretboard",  flavorText: "Feel the low end" },
  { seasonId: "s3",  seasonNumber: 3,  seasonName: "The Statement",   instrument: "sax",      instrumentLabel: "Sax",      instrumentEmoji: "🎷", primaryColor: "#FFD700", accentColor: "#FF6B35", unlockXp: 1500,  isActive: false, progressionStyle: "brass",      flavorText: "Jazz meets fire" },
  { seasonId: "s4",  seasonNumber: 4,  seasonName: "The Anthem",      instrument: "trumpet",  instrumentLabel: "Trumpet",  instrumentEmoji: "🎺", primaryColor: "#FF2DAA", accentColor: "#FFD700", unlockXp: 3500,  isActive: false, progressionStyle: "brass",      flavorText: "Sound the charge" },
  { seasonId: "s5",  seasonNumber: 5,  seasonName: "The Pulse",       instrument: "drums",    instrumentLabel: "Drums",    instrumentEmoji: "🥁", primaryColor: "#CC0000", accentColor: "#FF6B35", unlockXp: 6000,  isActive: false, progressionStyle: "percussion", flavorText: "Drive the room" },
  { seasonId: "s6",  seasonNumber: 6,  seasonName: "The Harmony",     instrument: "keys",     instrumentLabel: "Keys",     instrumentEmoji: "🎹", primaryColor: "#00FFFF", accentColor: "#AA2DFF", unlockXp: 9000,  isActive: false, progressionStyle: "keys",       flavorText: "Every note counts" },
  { seasonId: "s7",  seasonNumber: 7,  seasonName: "The Ether",       instrument: "violin",   instrumentLabel: "Violin",   instrumentEmoji: "🎻", primaryColor: "#FF6B35", accentColor: "#00FF88", unlockXp: 13000, isActive: false, progressionStyle: "strings",    flavorText: "Emotion in strings" },
  { seasonId: "s8",  seasonNumber: 8,  seasonName: "The Current",     instrument: "flute",    instrumentLabel: "Flute",    instrumentEmoji: "🪈", primaryColor: "#00FF88", accentColor: "#00FFFF", unlockXp: 18000, isActive: false, progressionStyle: "wind",       flavorText: "Breath is the beat" },
  { seasonId: "s9",  seasonNumber: 9,  seasonName: "The Celestial",   instrument: "harp",     instrumentLabel: "Harp",     instrumentEmoji: "🎵", primaryColor: "#FFD700", accentColor: "#FF2DAA", unlockXp: 25000, isActive: false, progressionStyle: "strings",    flavorText: "Ascend the scale" },
  { seasonId: "s10", seasonNumber: 10, seasonName: "The Transcendent", instrument: "theremin", instrumentLabel: "Theremin", instrumentEmoji: "✨", primaryColor: "#FF2DAA", accentColor: "#AA2DFF", unlockXp: 35000, isActive: false, progressionStyle: "experimental", flavorText: "Play without touching" },
];

// ── Queries ───────────────────────────────────────────────────────────────────

export function getActiveSeason(): SeasonInstrument {
  return SEASON_INSTRUMENTS.find((s) => s.isActive) ?? SEASON_INSTRUMENTS[0]!;
}

export function getSeasonById(seasonId: string): SeasonInstrument | undefined {
  return SEASON_INSTRUMENTS.find((s) => s.seasonId === seasonId);
}

export function getUnlockedSeasons(currentXp: number): SeasonInstrument[] {
  return SEASON_INSTRUMENTS.filter((s) => currentXp >= s.unlockXp);
}

export function getNextLockedSeason(currentXp: number): SeasonInstrument | null {
  return SEASON_INSTRUMENTS.find((s) => !s.isActive && currentXp < s.unlockXp) ?? null;
}

export function getXpToNextSeason(currentXp: number): number | null {
  const next = getNextLockedSeason(currentXp);
  return next ? next.unlockXp - currentXp : null;
}

export function getInstrumentProgressLabel(currentXp: number): string {
  const active = getActiveSeason();
  const xpToNext = getXpToNextSeason(currentXp);
  if (xpToNext === null) return `MAX SEASON — ${active.instrumentLabel} Master`;
  return `${xpToNext.toLocaleString()} XP to unlock Season ${(getActiveSeason().seasonNumber + 1)} ${getNextLockedSeason(currentXp)?.instrumentLabel ?? ""}`.trim();
}

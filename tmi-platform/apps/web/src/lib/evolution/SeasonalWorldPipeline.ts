/**
 * SeasonalWorldPipeline
 * Manages seasonal transitions for the TMI world — theme changes, badge resets,
 * content rotations, and seasonal show schedules.
 */

export type Season = "spring" | "summer" | "fall" | "winter";
export type SeasonPhase = "opening" | "peak" | "closing" | "off_season";

export interface SeasonConfig {
  season: Season;
  label: string;
  accentColor: string;
  backgroundVariant: string;
  badgeIcon: string;
  featuredGenre: string;
  startsMonth: number;   // 0-indexed
  endsMonth: number;
}

const SEASONS: SeasonConfig[] = [
  { season: "spring", label: "TMI Spring Season", accentColor: "#22c55e", backgroundVariant: "aurora",   badgeIcon: "🌱", featuredGenre: "Afrobeats",  startsMonth: 2,  endsMonth: 4  },
  { season: "summer", label: "TMI Summer Season", accentColor: "#f59e0b", backgroundVariant: "golden",   badgeIcon: "☀️", featuredGenre: "Hip-Hop",     startsMonth: 5,  endsMonth: 7  },
  { season: "fall",   label: "TMI Fall Season",   accentColor: "#ef4444", backgroundVariant: "ember",    badgeIcon: "🍂", featuredGenre: "R&B",         startsMonth: 8,  endsMonth: 10 },
  { season: "winter", label: "TMI Winter Season", accentColor: "#06b6d4", backgroundVariant: "midnight", badgeIcon: "❄️", featuredGenre: "Electronic",  startsMonth: 11, endsMonth: 1  },
];

export interface SeasonalState {
  currentSeason: SeasonConfig;
  phase: SeasonPhase;
  seasonStartedAt: number;
  daysIntoSeason: number;
  nextSeasonAt: number;
  activeBadgeIcon: string;
  featuredContent: string[];
}

let seasonalState: SeasonalState | null = null;
const seasonListeners = new Set<(state: SeasonalState) => void>();

function getCurrentSeason(): SeasonConfig {
  const month = new Date().getMonth();
  return SEASONS.find(s => {
    if (s.startsMonth <= s.endsMonth) return month >= s.startsMonth && month <= s.endsMonth;
    return month >= s.startsMonth || month <= s.endsMonth;
  }) ?? SEASONS[1];
}

function computePhase(daysIntoSeason: number): SeasonPhase {
  const totalDays = 90;
  const progress = daysIntoSeason / totalDays;
  if (progress < 0.1) return "opening";
  if (progress > 0.9) return "closing";
  if (progress > 0.4 && progress < 0.6) return "peak";
  return "opening";
}

function notify(): void {
  if (seasonalState) seasonListeners.forEach(l => l(seasonalState!));
}

export function initSeasonalPipeline(): SeasonalState {
  const season = getCurrentSeason();
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), season.startsMonth, 1);
  const daysIntoSeason = Math.floor((now.getTime() - seasonStart.getTime()) / (24 * 60 * 60 * 1000));
  const nextSeason = SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
  const nextSeasonAt = new Date(now.getFullYear(), nextSeason.startsMonth, 1).getTime();

  seasonalState = {
    currentSeason: season,
    phase: computePhase(daysIntoSeason),
    seasonStartedAt: seasonStart.getTime(),
    daysIntoSeason,
    nextSeasonAt,
    activeBadgeIcon: season.badgeIcon,
    featuredContent: [`${season.featuredGenre} Showcase`, `${season.label} Finals`, `${season.label} Opener`],
  };

  return seasonalState;
}

export function getSeasonalState(): SeasonalState {
  return seasonalState ?? initSeasonalPipeline();
}

export function subscribeToSeason(listener: (state: SeasonalState) => void): () => void {
  seasonListeners.add(listener);
  if (seasonalState) listener(seasonalState);
  return () => seasonListeners.delete(listener);
}

export function getSeasonConfig(season: Season): SeasonConfig {
  return SEASONS.find(s => s.season === season) ?? SEASONS[0];
}

export function getAllSeasons(): SeasonConfig[] {
  return SEASONS;
}

/**
 * Issue Color Engine
 * Manages per-issue color themes for the TMI magazine.
 * Each issue can have a primary genre + secondary genre blend.
 */

import {
  getPaletteByGenre,
  getAllGenres,
  type GenreKey,
  type GenrePalette,
} from "./genre-colors";

export interface MagazineIssue {
  issueNumber: number;
  primaryGenre: GenreKey;
  secondaryGenre?: GenreKey;
  title: string;
  colorTint: string; // Override color if needed
}

export interface IssueColorTheme {
  issue: MagazineIssue;
  primaryPalette: GenrePalette;
  secondaryPalette?: GenrePalette;
  blendedGradient: string;
  coverGradient: string;
  accentColor: string;
  glowColor: string;
}

/**
 * Blend two color palettes together
 */
export function blendPalettes(
  primary: GenrePalette,
  secondary?: GenrePalette
): string {
  if (!secondary) return primary.gradient;
  return `linear-gradient(135deg, ${primary.primary} 0%, ${secondary.primary} 50%, ${secondary.accent} 100%)`;
}

/**
 * Generate issue-specific color theme
 */
export function getIssueColorTheme(
  issue: MagazineIssue
): IssueColorTheme {
  const primaryPalette = getPaletteByGenre(issue.primaryGenre);
  const secondaryPalette = issue.secondaryGenre
    ? getPaletteByGenre(issue.secondaryGenre)
    : undefined;

  const blendedGradient = blendPalettes(primaryPalette, secondaryPalette);
  const coverGradient = `linear-gradient(180deg, ${blendedGradient} 0%, rgba(0,0,0,0.9) 100%)`;
  const accentColor = secondaryPalette
    ? secondaryPalette.accent
    : primaryPalette.accent;

  return {
    issue,
    primaryPalette,
    secondaryPalette,
    blendedGradient,
    coverGradient,
    accentColor,
    glowColor: primaryPalette.glow,
  };
}

/**
 * Current active issue (can be rotated periodically)
 * For now: Hip-Hop primary, Electronic secondary
 */
const CURRENT_ISSUE: MagazineIssue = {
  issueNumber: 1,
  primaryGenre: "hip-hop" as GenreKey,
  secondaryGenre: "electronic" as GenreKey,
  title: "TMI Magazine · Issue 01",
  colorTint: "cyan",
};

export function getCurrentIssueTheme(): IssueColorTheme {
  return getIssueColorTheme(CURRENT_ISSUE);
}

export function getCurrentIssue(): MagazineIssue {
  return CURRENT_ISSUE;
}

/**
 * Hardcoded issue schedule (for future time-based rotation)
 * In production, this would come from the API
 */
export const ISSUE_SCHEDULE: MagazineIssue[] = [
  {
    issueNumber: 1,
    primaryGenre: "hip-hop",
    secondaryGenre: "electronic",
    title: "TMI Magazine · Issue 01",
    colorTint: "cyan",
  },
  {
    issueNumber: 2,
    primaryGenre: "trap",
    secondaryGenre: "battles",
    title: "TMI Magazine · Issue 02",
    colorTint: "orange",
  },
  {
    issueNumber: 3,
    primaryGenre: "rb",
    secondaryGenre: "comedy",
    title: "TMI Magazine · Issue 03",
    colorTint: "pink",
  },
  {
    issueNumber: 4,
    primaryGenre: "cypher",
    secondaryGenre: "hip-hop",
    title: "TMI Magazine · Issue 04",
    colorTint: "cyan",
  },
];

/**
 * Get issue by number
 */
export function getIssueByNumber(issueNumber: number): MagazineIssue | null {
  return ISSUE_SCHEDULE.find((issue) => issue.issueNumber === issueNumber) || null;
}

/**
 * Cycle to next issue (for testing)
 */
export function getNextIssueInSchedule(currentIssue: number): MagazineIssue {
  const nextIndex = (currentIssue % ISSUE_SCHEDULE.length);
  return ISSUE_SCHEDULE[nextIndex];
}

/**
 * Get issue for a specific date (in production, would be based on magazine calendar)
 */
export function getIssueForDate(date: Date = new Date()): MagazineIssue {
  // For now: just use current issue
  // In production: calculate based on publish schedule
  return CURRENT_ISSUE;
}

/**
 * Generate issue-wide CSS variables
 * Can be injected into root or a specific container
 */
export function getIssueCSSVariables(issueTheme: IssueColorTheme): Record<string, string> {
  return {
    "--issue-primary": issueTheme.primaryPalette.primary,
    "--issue-secondary": issueTheme.primaryPalette.secondary,
    "--issue-accent": issueTheme.accentColor,
    "--issue-glow": issueTheme.glowColor,
    "--issue-gradient": issueTheme.blendedGradient,
    "--issue-cover-gradient": issueTheme.coverGradient,
    "--issue-glow-rgba": issueTheme.primaryPalette.glowRgba,
  };
}

/**
 * Apply issue theme to a React element (inline style)
 */
export function getIssueThemeStyle(
  issueTheme: IssueColorTheme
): React.CSSProperties {
  return {
    background: issueTheme.coverGradient,
    color: issueTheme.primaryPalette.primary,
  };
}

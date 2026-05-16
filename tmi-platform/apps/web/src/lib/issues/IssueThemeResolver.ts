/**
 * IssueThemeResolver.ts
 * PASS 8 — Issue Intelligence Engine
 *
 * Controls per-issue:
 *  - color palette
 *  - mood
 *  - typography mode
 *  - visual energy profile
 */

export type IssueMood =
  | "battle"      // high-energy, red/gold
  | "editorial"   // clean, cyan/white
  | "discovery"   // vibrant, fuchsia/purple
  | "spotlight"   // warm, gold/amber
  | "cypher"      // electric, purple/cyan
  | "championship"; // prestige, gold/white

export type TypographyMode =
  | "bold-headline"   // dominant H1s, editorial weight
  | "editorial-wide"  // wide-tracked subheadings
  | "compact-dense"   // tight tracking, news-print style
  | "display-oversized"; // oversized display type

export type VisualEnergyProfile =
  | "explosive"  // high contrast, glowing borders, fast pulses
  | "editorial"  // measured, grid-locked, steady
  | "electric"   // neon heavy, animated strips
  | "prestige";  // gold accents, slow reveals

export interface IssueTheme {
  issueNumber: number;
  mood: IssueMood;
  typographyMode: TypographyMode;
  energyProfile: VisualEnergyProfile;
  /** Primary accent — drives glow, borders, headlines */
  primary: string;
  /** Secondary accent — drives chips, badges, strips */
  secondary: string;
  /** Tertiary accent — ambient underlay color */
  tertiary: string;
  /** Base background override */
  baseBackground: string;
  /** Short descriptor — used in CoverMasthead / article chips */
  descriptor: string;
}

// ── Issue theme roster — one entry per issue number (1-indexed) ───────────────

const ISSUE_THEMES: Record<number, IssueTheme> = {
  1: {
    issueNumber: 1,
    mood: "battle",
    typographyMode: "bold-headline",
    energyProfile: "explosive",
    primary: "#FF2DAA",
    secondary: "#FFD700",
    tertiary: "#AA2DFF",
    baseBackground: "#050510",
    descriptor: "BATTLE SEASON 1",
  },
  2: {
    issueNumber: 2,
    mood: "editorial",
    typographyMode: "editorial-wide",
    energyProfile: "editorial",
    primary: "#00FFFF",
    secondary: "#FF2DAA",
    tertiary: "#AA2DFF",
    baseBackground: "#050510",
    descriptor: "DISCOVERY EDITION",
  },
  3: {
    issueNumber: 3,
    mood: "cypher",
    typographyMode: "bold-headline",
    energyProfile: "electric",
    primary: "#AA2DFF",
    secondary: "#00FFFF",
    tertiary: "#FF2DAA",
    baseBackground: "#050510",
    descriptor: "CYPHER OPEN WEEK",
  },
  4: {
    issueNumber: 4,
    mood: "spotlight",
    typographyMode: "display-oversized",
    energyProfile: "prestige",
    primary: "#FFD700",
    secondary: "#00FFFF",
    tertiary: "#FF2DAA",
    baseBackground: "#050510",
    descriptor: "ARTIST SPOTLIGHT",
  },
  5: {
    issueNumber: 5,
    mood: "championship",
    typographyMode: "bold-headline",
    energyProfile: "prestige",
    primary: "#FFD700",
    secondary: "#FF2DAA",
    tertiary: "#AA2DFF",
    baseBackground: "#050510",
    descriptor: "CHAMPIONSHIP SEASON",
  },
  6: {
    issueNumber: 6,
    mood: "discovery",
    typographyMode: "compact-dense",
    energyProfile: "electric",
    primary: "#FF2DAA",
    secondary: "#AA2DFF",
    tertiary: "#00FFFF",
    baseBackground: "#050510",
    descriptor: "GENRE DISCOVERY",
  },
  7: {
    issueNumber: 7,
    mood: "editorial",
    typographyMode: "editorial-wide",
    energyProfile: "editorial",
    primary: "#00FFFF",
    secondary: "#FFD700",
    tertiary: "#FF2DAA",
    baseBackground: "#050510",
    descriptor: "WEEKLY CROWN EDITION",
  },
  8: {
    issueNumber: 8,
    mood: "battle",
    typographyMode: "bold-headline",
    energyProfile: "explosive",
    primary: "#FF2DAA",
    secondary: "#AA2DFF",
    tertiary: "#FFD700",
    baseBackground: "#050510",
    descriptor: "BATTLE FINALS",
  },
};

// Fallback theme used if issue number exceeds defined roster
const FALLBACK_THEME: IssueTheme = {
  issueNumber: 0,
  mood: "editorial",
  typographyMode: "bold-headline",
  energyProfile: "editorial",
  primary: "#00FFFF",
  secondary: "#FF2DAA",
  tertiary: "#AA2DFF",
  baseBackground: "#050510",
  descriptor: "WEEKLY EDITION",
};

/**
 * Resolve the visual theme for a given issue number.
 * Cycles modulo the defined roster so it never returns undefined.
 */
export function resolveIssueTheme(issueNumber: number): IssueTheme {
  const keys = Object.keys(ISSUE_THEMES).map(Number);
  const maxIssue = Math.max(...keys);
  const cycled = ((issueNumber - 1) % maxIssue) + 1;
  return ISSUE_THEMES[cycled] ?? FALLBACK_THEME;
}

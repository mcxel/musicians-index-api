/**
 * Homepage Vibrance Engine
 * Injects vivid, magazine-ready color canon across homepage sections.
 * Purpose: Replace muted grays with high-saturation glows and gradients.
 */

import {
  getCurrentIssueTheme,
  type IssueColorTheme,
} from "./issue-color-engine";
import {
  getMagazineCardStyle,
  getHeroGradient,
  getAccentBarStyle,
  getBadgeStyle,
  type MagazineTheme,
} from "./magazine-palette-engine";
import { getPaletteByGenre, type GenreKey } from "./genre-colors";

export interface HomepageSectionColors {
  backgroundGradient: string;
  accentColor: string;
  textPrimary: string;
  textSecondary: string;
  cardGlowShadow: string;
  borderColor: string;
  highlightGradient: string;
}

export interface HomepageVibranceTheme {
  issue: IssueColorTheme;
  home1: HomepageSectionColors;
  home1to2: HomepageSectionColors;
  home2: HomepageSectionColors;
  home3: HomepageSectionColors;
  home4: HomepageSectionColors;
  home5: HomepageSectionColors;
}

/**
 * Generate vibrant section colors for a homepage section
 */
export function generateSectionColors(
  genre: GenreKey | string,
  intensity: number = 1
): HomepageSectionColors {
  const palette = getPaletteByGenre(genre);
  const intensityFactor = Math.min(Math.max(intensity, 0.5), 1.5);

  return {
    backgroundGradient: `linear-gradient(135deg, 
      ${palette.primary}${Math.round(15 * intensityFactor).toString(16).padStart(2, "0")} 0%, 
      ${palette.secondary}${Math.round(8 * intensityFactor).toString(16).padStart(2, "0")} 100%)`,
    accentColor: palette.accent,
    textPrimary: palette.primary,
    textSecondary: palette.secondary,
    cardGlowShadow: `0 0 ${25 * intensityFactor}px ${palette.glowRgba}, 
                      0 0 ${50 * intensityFactor}px ${palette.glowRgba}`,
    borderColor: `${palette.primary}${Math.round(80 * intensityFactor).toString(16).padStart(2, "0")}`,
    highlightGradient: `linear-gradient(90deg, 
      ${palette.accent}80 0%, 
      ${palette.primary}40 100%)`,
  };
}

/**
 * Generate full homepage vibrance theme
 */
export function getHomepageVibranceTheme(): HomepageVibranceTheme {
  const issue = getCurrentIssueTheme();

  return {
    issue,
    // Home 1: Cover + Crown + Battles
    home1: generateSectionColors("hip-hop", 1.2),
    // Home 1-2: Top 10 Spread
    home1to2: generateSectionColors("electronic", 1.1),
    // Home 2: Live World
    home2: generateSectionColors("cypher", 1),
    // Home 3: Editorial + Discovery
    home3: generateSectionColors("rb", 1),
    // Home 4: Battles
    home4: generateSectionColors("battles", 1.2),
    // Home 5: Rewards + Commerce
    home5: generateSectionColors("comedy", 1),
  };
}

/**
 * Apply vibrance theme to a homepage section
 * Returns inline style object for React
 */
export function getHomepageSectionStyle(
  pageNumber: number
): React.CSSProperties {
  const theme = getHomepageVibranceTheme();
  let sectionColors: HomepageSectionColors;

  switch (pageNumber) {
    case 1:
      sectionColors = theme.home1;
      break;
    case 2:
      sectionColors = theme.home1to2;
      break;
    case 3:
      sectionColors = theme.home2;
      break;
    case 4:
      sectionColors = theme.home3;
      break;
    case 5:
      sectionColors = theme.home4;
      break;
    case 6:
      sectionColors = theme.home5;
      break;
    default:
      sectionColors = theme.home1;
  }

  return {
    backgroundImage: `
      radial-gradient(circle at top-left, ${sectionColors.backgroundGradient} 0%, transparent 60%),
      linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)
    `,
    color: sectionColors.textPrimary,
  };
}

/**
 * Get glow effect for hero section
 */
export function getHeroGlowStyle(pageNumber: number): React.CSSProperties {
  const theme = getHomepageVibranceTheme();
  let sectionColors: HomepageSectionColors;

  switch (pageNumber) {
    case 1:
      sectionColors = theme.home1;
      break;
    case 2:
      sectionColors = theme.home1to2;
      break;
    default:
      sectionColors = theme.home1;
  }

  return {
    boxShadow: sectionColors.cardGlowShadow,
    backgroundImage: sectionColors.highlightGradient,
  };
}

/**
 * Generate card container styling with vibrance
 */
export function getVibranceCardStyle(
  pageNumber: number
): React.CSSProperties {
  const theme = getHomepageVibranceTheme();
  let sectionColors: HomepageSectionColors;

  switch (pageNumber) {
    case 1:
      sectionColors = theme.home1;
      break;
    case 2:
      sectionColors = theme.home1to2;
      break;
    default:
      sectionColors = theme.home1;
  }

  return {
    borderColor: sectionColors.borderColor,
    borderWidth: "2px",
    borderRadius: "12px",
    backgroundColor: `${sectionColors.accentColor}08`,
    boxShadow: sectionColors.cardGlowShadow,
    backdropFilter: "blur(8px)",
    transition: "all 0.3s ease",
  };
}

/**
 * Get vibrant accent strip (horizontal)
 */
export function getVibranceAccentBar(
  pageNumber: number
): React.CSSProperties {
  const theme = getHomepageVibranceTheme();
  let sectionColors: HomepageSectionColors;

  switch (pageNumber) {
    case 1:
      sectionColors = theme.home1;
      break;
    default:
      sectionColors = theme.home1;
  }

  return {
    backgroundImage: sectionColors.highlightGradient,
    height: "6px",
    borderRadius: "3px",
    boxShadow: sectionColors.cardGlowShadow,
  };
}

/**
 * Generate CSS variable overrides for a page
 */
export function getVibranceCSSVariables(pageNumber: number): Record<string, string> {
  const theme = getHomepageVibranceTheme();
  let sectionColors: HomepageSectionColors;

  switch (pageNumber) {
    case 1:
      sectionColors = theme.home1;
      break;
    case 2:
      sectionColors = theme.home1to2;
      break;
    default:
      sectionColors = theme.home1;
  }

  return {
    "--section-primary": sectionColors.textPrimary,
    "--section-secondary": sectionColors.textSecondary,
    "--section-accent": sectionColors.accentColor,
    "--section-border": sectionColors.borderColor,
    "--section-glow": sectionColors.cardGlowShadow,
    "--section-highlight": sectionColors.highlightGradient,
  };
}

/**
 * Tailwind class generator for vibrant cards
 * Can be injected into className strings
 */
export function getVibranceCardClasses(pageNumber: number): string {
  return `
    border-2 rounded-xl
    bg-opacity-5 backdrop-blur-md
    transition-all duration-300
    hover:bg-opacity-10 hover:shadow-lg
  `.trim();
}

/**
 * Generate full page theme for layout component
 */
export function getLayoutVibranceTheme(pageNumber: number) {
  return {
    page: getHomepageSectionStyle(pageNumber),
    hero: getHeroGlowStyle(pageNumber),
    card: getVibranceCardStyle(pageNumber),
    accentBar: getVibranceAccentBar(pageNumber),
    variables: getVibranceCSSVariables(pageNumber),
    classes: getVibranceCardClasses(pageNumber),
  };
}

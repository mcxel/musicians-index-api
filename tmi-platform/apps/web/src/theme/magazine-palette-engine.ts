/**
 * Magazine Palette Engine
 * Orchestrates color theming across the TMI magazine.
 * Manages: card styles, gradient backgrounds, glow effects, text colors.
 */

import {
  getPaletteByGenre,
  getPrimaryColorByGenre,
  getGradientByGenre,
  type GenrePalette,
  type GenreKey,
} from "./genre-colors";

export interface MagazineCardStyle {
  bgGradient: string;
  borderColor: string;
  glowShadow: string;
  textPrimary: string;
  textSecondary: string;
  accentBorder: string;
  hoverEffect: string;
}

export interface MagazineTheme {
  palette: GenrePalette;
  card: MagazineCardStyle;
  hero: string; // Full-screen gradient
  rail: string; // Horizontal rail gradient
  badge: string; // Status/category badge background
  glow: string; // Ambient glow color
}

/**
 * Generate magazine card styling from a genre palette
 */
export function generateCardStyle(palette: GenrePalette): MagazineCardStyle {
  return {
    bgGradient: `linear-gradient(135deg, ${palette.primary}08 0%, ${palette.secondary}08 100%)`,
    borderColor: `${palette.primary}50`,
    glowShadow: `0 0 20px ${palette.glowRgba}, 0 0 40px ${palette.glowRgba}`,
    textPrimary: palette.primary,
    textSecondary: palette.secondary,
    accentBorder: `2px solid ${palette.accent}`,
    hoverEffect: `box-shadow: 0 0 30px ${palette.glowRgba}; border-color: ${palette.primary}80;`,
  };
}

/**
 * Generate full magazine theme for a genre
 */
export function generateMagazineTheme(genre: GenreKey | string): MagazineTheme {
  const palette = getPaletteByGenre(genre);
  const card = generateCardStyle(palette);

  return {
    palette,
    card,
    hero: `linear-gradient(180deg, ${palette.gradient} 0%, rgba(0,0,0,0.8) 100%)`,
    rail: `linear-gradient(90deg, ${palette.primary}20 0%, ${palette.secondary}20 100%)`,
    badge: `linear-gradient(135deg, ${palette.accent}40 0%, ${palette.primary}20 100%)`,
    glow: palette.glow,
  };
}

/**
 * CSS class generator for magazine cards
 * Output can be used directly in Tailwind or custom styles
 */
export function getMagazineCardClasses(genre: GenreKey | string): string {
  const palette = getPaletteByGenre(genre);
  return `
    border-2 border-opacity-40 rounded-lg
    transition-all duration-300
    hover:shadow-lg hover:border-opacity-80
  `.trim();
}

/**
 * Generate inline style object for React
 */
export function getMagazineCardStyle(
  genre: GenreKey | string
): React.CSSProperties {
  const theme = generateMagazineTheme(genre);
  return {
    backgroundImage: theme.card.bgGradient,
    borderColor: theme.card.borderColor,
    boxShadow: theme.card.glowShadow,
    color: theme.card.textPrimary,
  };
}

/**
 * Generate gradient background for hero sections
 */
export function getHeroGradient(genre: GenreKey | string): string {
  return generateMagazineTheme(genre).hero;
}

/**
 * Generate glow shadow for card elements
 * Use this as boxShadow in CSS
 */
export function getGlowShadow(genre: GenreKey | string): string {
  const palette = getPaletteByGenre(genre);
  return `0 0 20px ${palette.glowRgba}, 0 0 40px ${palette.glowRgba}`;
}

/**
 * Generate color-based accent bar (horizontal strip)
 */
export function getAccentBarStyle(
  genre: GenreKey | string
): React.CSSProperties {
  const palette = getPaletteByGenre(genre);
  return {
    backgroundImage: palette.gradient,
    height: "4px",
    borderRadius: "2px",
    boxShadow: `0 0 20px ${palette.glowRgba}`,
  };
}

/**
 * Generate badge/label styling
 */
export function getBadgeStyle(
  genre: GenreKey | string,
  variant: "solid" | "outline" | "ghost" = "solid"
): React.CSSProperties {
  const palette = getPaletteByGenre(genre);

  if (variant === "solid") {
    return {
      backgroundColor: palette.primary,
      color: "#000",
      fontWeight: 700,
      padding: "4px 12px",
      borderRadius: "4px",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      boxShadow: `0 0 15px ${palette.glowRgba}`,
    };
  }

  if (variant === "outline") {
    return {
      backgroundColor: "transparent",
      border: `2px solid ${palette.primary}`,
      color: palette.primary,
      fontWeight: 700,
      padding: "4px 12px",
      borderRadius: "4px",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    };
  }

  // ghost
  return {
    backgroundColor: `${palette.primary}20`,
    color: palette.primary,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };
}

/**
 * Generate text color pair (primary + secondary) for readability
 */
export function getTextColorPair(genre: GenreKey | string) {
  const palette = getPaletteByGenre(genre);
  return {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    muted: `${palette.primary}80`, // Semi-transparent variant
  };
}

/**
 * Generate full page background (for magazine spreads)
 */
export function getPageBackgroundStyle(
  genre: GenreKey | string
): React.CSSProperties {
  const palette = getPaletteByGenre(genre);
  return {
    background: `radial-gradient(circle at center, ${palette.primary}08 0%, transparent 70%), 
                  linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)`,
    color: palette.primary,
  };
}

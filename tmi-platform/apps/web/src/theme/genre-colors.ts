/**
 * Genre Color Mapping
 * Authoritative genre → color palette assignments for TMI magazine.
 * Each genre has: primary, secondary, accent, and glow colors.
 * All high-saturation, magazine-ready palettes (no muted grays).
 */

export type GenreKey =
  | "hip-hop"
  | "electronic"
  | "trap"
  | "rb"
  | "comedy"
  | "battles"
  | "cypher";

export interface GenrePalette {
  name: string;
  primary: string; // Hex color code
  secondary: string;
  accent: string;
  glow: string; // For box-shadow glow effects
  glowRgba: string; // For rgba glow layers
  gradient: string; // CSS gradient
  darkGradient: string; // Darker variant
}

/** Genre → Color Palette Mapping */
export const GENRE_COLORS: Record<GenreKey, GenrePalette> = {
  "hip-hop": {
    name: "Hip-Hop",
    primary: "#00FFFF", // Cyan
    secondary: "#FFD700", // Gold
    accent: "#FF1493", // Deep magenta
    glow: "#00FFFF",
    glowRgba: "rgba(0, 255, 255, 0.4)",
    gradient: "linear-gradient(135deg, #00FFFF 0%, #FFD700 50%, #FF1493 100%)",
    darkGradient: "linear-gradient(135deg, #008B8B 0%, #B8860B 50%, #8B0A50 100%)",
  },

  electronic: {
    name: "Electronic",
    primary: "#9D00FF", // Purple
    secondary: "#00CCFF", // Neon blue
    accent: "#FFFF00", // Bright yellow
    glow: "#9D00FF",
    glowRgba: "rgba(157, 0, 255, 0.4)",
    gradient: "linear-gradient(135deg, #9D00FF 0%, #00CCFF 50%, #FFFF00 100%)",
    darkGradient: "linear-gradient(135deg, #6A00CC 0%, #0099CC 50%, #CCCC00 100%)",
  },

  trap: {
    name: "Trap",
    primary: "#FF6B35", // Orange
    secondary: "#FF0000", // Red
    accent: "#00FFFF", // Cyan
    glow: "#FF6B35",
    glowRgba: "rgba(255, 107, 53, 0.4)",
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF0000 50%, #00FFFF 100%)",
    darkGradient: "linear-gradient(135deg, #CC5528 0%, #CC0000 50%, #008B8B 100%)",
  },

  rb: {
    name: "R&B",
    primary: "#FF1493", // Deep pink
    secondary: "#9370DB", // Medium purple
    accent: "#FFD700", // Gold
    glow: "#FF1493",
    glowRgba: "rgba(255, 20, 147, 0.4)",
    gradient: "linear-gradient(135deg, #FF1493 0%, #9370DB 50%, #FFD700 100%)",
    darkGradient: "linear-gradient(135deg, #C71585 0%, #6A5ACD 50%, #B8860B 100%)",
  },

  comedy: {
    name: "Comedy",
    primary: "#ADFF2F", // Lime green
    secondary: "#FFFF00", // Bright yellow
    accent: "#00FFFF", // Cyan
    glow: "#ADFF2F",
    glowRgba: "rgba(173, 255, 47, 0.4)",
    gradient: "linear-gradient(135deg, #ADFF2F 0%, #FFFF00 50%, #00FFFF 100%)",
    darkGradient: "linear-gradient(135deg, #7CB342 0%, #CCCC00 50%, #008B8B 100%)",
  },

  battles: {
    name: "Battles",
    primary: "#FFD700", // Gold
    secondary: "#FF0000", // Red
    accent: "#9D00FF", // Purple
    glow: "#FFD700",
    glowRgba: "rgba(255, 215, 0, 0.4)",
    gradient: "linear-gradient(135deg, #FFD700 0%, #FF0000 50%, #9D00FF 100%)",
    darkGradient: "linear-gradient(135deg, #B8860B 0%, #CC0000 50%, #6A00CC 100%)",
  },

  cypher: {
    name: "Cypher",
    primary: "#00FFFF", // Cyan
    secondary: "#FF1493", // Deep magenta
    accent: "#0099FF", // Electric blue
    glow: "#00FFFF",
    glowRgba: "rgba(0, 255, 255, 0.4)",
    gradient: "linear-gradient(135deg, #00FFFF 0%, #FF1493 50%, #0099FF 100%)",
    darkGradient: "linear-gradient(135deg, #008B8B 0%, #8B0A50 50%, #004499 100%)",
  },
};

/**
 * Get palette by genre key
 */
export function getPaletteByGenre(genre: GenreKey | string): GenrePalette {
  const normalized = (genre || "hip-hop").toLowerCase().replace(/[- _]/g, "");
  const key = Object.keys(GENRE_COLORS).find(
    (k) => k.replace(/[- _]/g, "") === normalized
  ) as GenreKey | undefined;
  return GENRE_COLORS[key || "hip-hop"];
}

/**
 * Extract primary color from genre
 */
export function getPrimaryColorByGenre(genre: GenreKey | string): string {
  return getPaletteByGenre(genre).primary;
}

/**
 * Extract gradient from genre
 */
export function getGradientByGenre(genre: GenreKey | string): string {
  return getPaletteByGenre(genre).gradient;
}

/**
 * All available genres
 */
export function getAllGenres(): GenreKey[] {
  return Object.keys(GENRE_COLORS) as GenreKey[];
}

/**
 * Random genre palette (for shuffle/discovery modes)
 */
export function getRandomGenrePalette(): GenrePalette {
  const genres = getAllGenres();
  const random = genres[Math.floor(Math.random() * genres.length)];
  return GENRE_COLORS[random];
}

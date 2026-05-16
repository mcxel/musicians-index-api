export const TMI_COLOR_SYSTEM_2026 = {
  TMI_YELLOW: "#FFE45C",
  TMI_HOT_PINK: "#FF3CA6",
  TMI_CYAN: "#2FE9FF",
  TMI_ELECTRIC_BLUE: "#2B6CFF",
  TMI_RED: "#FF3B3B",
  TMI_LIME: "#A6FF4D",
  TMI_WHITE_GLOW: "#F5F8FF",
  TMI_CHROME: "#C8D1E2",
  TMI_GLASS_BLACK: "#0B0E16",
} as const;

export type TmiColorToken = keyof typeof TMI_COLOR_SYSTEM_2026;

export function resolveTmiColor(token: TmiColorToken): string {
  return TMI_COLOR_SYSTEM_2026[token];
}

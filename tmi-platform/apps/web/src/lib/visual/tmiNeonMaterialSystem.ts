import { TMI_COLOR_SYSTEM_2026, type TmiColorToken } from "./tmiColorSystem2026";

export type TmiNeonSurfaceKind =
  | "hud-glass"
  | "card-gloss"
  | "panel-chrome"
  | "billboard-neon"
  | "monitor-premium"
  | "stage-neon";

export type TmiNeonSurfaceStyle = {
  kind: TmiNeonSurfaceKind;
  background: TmiColorToken;
  border: TmiColorToken;
  glow: TmiColorToken;
  accent: TmiColorToken;
  className: string;
};

export const TMI_NEON_SURFACES: Record<TmiNeonSurfaceKind, TmiNeonSurfaceStyle> = {
  "hud-glass": {
    kind: "hud-glass",
    background: "TMI_GLASS_BLACK",
    border: "TMI_CYAN",
    glow: "TMI_WHITE_GLOW",
    accent: "TMI_ELECTRIC_BLUE",
    className: "bg-black/60 border border-cyan-300/60 shadow-[0_0_20px_rgba(47,233,255,0.28)]",
  },
  "card-gloss": {
    kind: "card-gloss",
    background: "TMI_GLASS_BLACK",
    border: "TMI_HOT_PINK",
    glow: "TMI_HOT_PINK",
    accent: "TMI_YELLOW",
    className: "bg-zinc-950/80 border border-pink-400/55 shadow-[0_0_16px_rgba(255,60,166,0.3)]",
  },
  "panel-chrome": {
    kind: "panel-chrome",
    background: "TMI_GLASS_BLACK",
    border: "TMI_CHROME",
    glow: "TMI_WHITE_GLOW",
    accent: "TMI_CYAN",
    className: "bg-zinc-900/85 border border-slate-300/55 shadow-[0_0_14px_rgba(245,248,255,0.22)]",
  },
  "billboard-neon": {
    kind: "billboard-neon",
    background: "TMI_GLASS_BLACK",
    border: "TMI_ELECTRIC_BLUE",
    glow: "TMI_ELECTRIC_BLUE",
    accent: "TMI_RED",
    className: "bg-blue-950/65 border border-blue-400/60 shadow-[0_0_20px_rgba(43,108,255,0.35)]",
  },
  "monitor-premium": {
    kind: "monitor-premium",
    background: "TMI_GLASS_BLACK",
    border: "TMI_CYAN",
    glow: "TMI_LIME",
    accent: "TMI_HOT_PINK",
    className: "bg-black/70 border border-cyan-300/65 shadow-[0_0_24px_rgba(166,255,77,0.25)]",
  },
  "stage-neon": {
    kind: "stage-neon",
    background: "TMI_GLASS_BLACK",
    border: "TMI_RED",
    glow: "TMI_RED",
    accent: "TMI_YELLOW",
    className: "bg-rose-950/40 border border-red-400/55 shadow-[0_0_18px_rgba(255,59,59,0.3)]",
  },
};

export function getNeonSurface(kind: TmiNeonSurfaceKind): TmiNeonSurfaceStyle {
  return TMI_NEON_SURFACES[kind];
}

export function resolveSurfacePalette(kind: TmiNeonSurfaceKind) {
  const style = getNeonSurface(kind);
  return {
    backgroundHex: TMI_COLOR_SYSTEM_2026[style.background],
    borderHex: TMI_COLOR_SYSTEM_2026[style.border],
    glowHex: TMI_COLOR_SYSTEM_2026[style.glow],
    accentHex: TMI_COLOR_SYSTEM_2026[style.accent],
  };
}

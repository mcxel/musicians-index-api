/**
 * AdaptiveThemeEngine
 * Dynamically shifts hub visual theme based on time-of-day, season, event energy, and user tier.
 */

export type ThemeMode = "midnight" | "dawn" | "golden" | "neon" | "storm" | "aurora" | "cosmic" | "ember";

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  backgroundStart: string;
  backgroundEnd: string;
  particleColor: string;
  fontWeight: 700 | 800 | 900;
  contrastRatio: number;
}

const THEMES: Record<ThemeMode, ThemeConfig> = {
  midnight: { mode: "midnight", primaryColor: "#1a1a2e", accentColor: "#06b6d4", glowColor: "#06b6d444", backgroundStart: "#07071a", backgroundEnd: "#0a0a2e", particleColor: "#06b6d4", fontWeight: 700, contrastRatio: 8 },
  dawn:     { mode: "dawn",     primaryColor: "#1a0a14", accentColor: "#f59e0b", glowColor: "#f59e0b44", backgroundStart: "#0d0508", backgroundEnd: "#1a0a14", particleColor: "#f59e0b", fontWeight: 700, contrastRatio: 7 },
  golden:   { mode: "golden",   primaryColor: "#1a1400", accentColor: "#ffd700", glowColor: "#ffd70044", backgroundStart: "#0d0a00", backgroundEnd: "#1a1400", particleColor: "#ffd700", fontWeight: 800, contrastRatio: 9 },
  neon:     { mode: "neon",     primaryColor: "#0a001a", accentColor: "#ec4899", glowColor: "#ec489944", backgroundStart: "#070012", backgroundEnd: "#0a001a", particleColor: "#a78bfa", fontWeight: 800, contrastRatio: 8 },
  storm:    { mode: "storm",    primaryColor: "#0a0f1a", accentColor: "#3b82f6", glowColor: "#3b82f644", backgroundStart: "#050810", backgroundEnd: "#0a0f1a", particleColor: "#3b82f6", fontWeight: 700, contrastRatio: 7 },
  aurora:   { mode: "aurora",   primaryColor: "#001a0a", accentColor: "#22c55e", glowColor: "#22c55e44", backgroundStart: "#000d05", backgroundEnd: "#001a0a", particleColor: "#22c55e", fontWeight: 700, contrastRatio: 8 },
  cosmic:   { mode: "cosmic",   primaryColor: "#0a0014", accentColor: "#a78bfa", glowColor: "#a78bfa44", backgroundStart: "#05000d", backgroundEnd: "#0a0014", particleColor: "#a78bfa", fontWeight: 900, contrastRatio: 9 },
  ember:    { mode: "ember",    primaryColor: "#1a0500", accentColor: "#ef4444", glowColor: "#ef444444", backgroundStart: "#0d0300", backgroundEnd: "#1a0500", particleColor: "#f97316", fontWeight: 800, contrastRatio: 8 },
};

export interface AdaptiveThemeState {
  hubId: string;
  currentTheme: ThemeConfig;
  previousTheme: ThemeMode | null;
  autoAdapt: boolean;
  lastAdaptedAt: number | null;
  adaptationReason: string | null;
}

const themeStates = new Map<string, AdaptiveThemeState>();
type ThemeListener = (state: AdaptiveThemeState) => void;
const themeListeners = new Map<string, Set<ThemeListener>>();

function timeOfDayTheme(): ThemeMode {
  const h = new Date().getHours();
  if (h >= 5  && h < 8)  return "dawn";
  if (h >= 8  && h < 17) return "golden";
  if (h >= 17 && h < 20) return "ember";
  if (h >= 20 && h < 23) return "neon";
  return "midnight";
}

function notify(hubId: string, state: AdaptiveThemeState): void {
  themeListeners.get(hubId)?.forEach(l => l(state));
}

export function initAdaptiveTheme(hubId: string, autoAdapt = true): AdaptiveThemeState {
  const mode = autoAdapt ? timeOfDayTheme() : "midnight";
  const state: AdaptiveThemeState = {
    hubId, currentTheme: THEMES[mode], previousTheme: null,
    autoAdapt, lastAdaptedAt: null, adaptationReason: null,
  };
  themeStates.set(hubId, state);
  return state;
}

export function setTheme(hubId: string, mode: ThemeMode, reason?: string): AdaptiveThemeState {
  const current = themeStates.get(hubId) ?? initAdaptiveTheme(hubId, false);
  const state: AdaptiveThemeState = {
    ...current,
    currentTheme: THEMES[mode],
    previousTheme: current.currentTheme.mode,
    lastAdaptedAt: Date.now(),
    adaptationReason: reason ?? null,
  };
  themeStates.set(hubId, state);
  notify(hubId, state);
  return state;
}

export function adaptToEnergy(hubId: string, energyLevel: number): AdaptiveThemeState {
  const current = themeStates.get(hubId) ?? initAdaptiveTheme(hubId);
  if (!current.autoAdapt) return current;

  let mode: ThemeMode;
  if (energyLevel >= 90) mode = "cosmic";
  else if (energyLevel >= 70) mode = "neon";
  else if (energyLevel >= 50) mode = "storm";
  else mode = timeOfDayTheme();

  return setTheme(hubId, mode, `energy:${energyLevel}`);
}

export function adaptToTimeOfDay(hubId: string): AdaptiveThemeState {
  const current = themeStates.get(hubId) ?? initAdaptiveTheme(hubId);
  if (!current.autoAdapt) return current;
  return setTheme(hubId, timeOfDayTheme(), "time-of-day");
}

export function getThemeConfig(hubId: string): ThemeConfig {
  return themeStates.get(hubId)?.currentTheme ?? THEMES["midnight"];
}

export function getAllThemes(): Record<ThemeMode, ThemeConfig> {
  return THEMES;
}

export function subscribeToTheme(hubId: string, listener: ThemeListener): () => void {
  if (!themeListeners.has(hubId)) themeListeners.set(hubId, new Set());
  themeListeners.get(hubId)!.add(listener);
  const current = themeStates.get(hubId);
  if (current) listener(current);
  return () => themeListeners.get(hubId)?.delete(listener);
}

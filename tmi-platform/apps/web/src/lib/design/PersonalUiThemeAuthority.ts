/**
 * PersonalUiThemeAuthority — section + button personalization on top of ThemeEngine.
 *
 * Extends the existing ThemeEngine catalog (does not create a second theme store).
 * Projects semantic CSS variables onto document.documentElement so drawers, buttons,
 * monitors, and HUD chrome can follow the user's palette without remounting media.
 *
 * Does NOT recolor WebRTC video, avatar skin textures, or 3D venue meshes.
 * COMMIT=OFF · SAFE_TO_PUSH=NO
 */

import type { ThemeTokens } from "@/lib/design/ThemeEngine";

export type ButtonColorStyle =
  | "tmi_multicolor"
  | "solid_black"
  | "solid_white"
  | "neutral_gray"
  | "outlined"
  | "custom_solid";

export type ThemeSectionId =
  | "workspace"
  | "drawer"
  | "monitor"
  | "hud"
  | "nav"
  | "messaging"
  | "store"
  | "avatar_center"
  | "admin";

export interface SectionColorOverride {
  bg?: string;
  surface?: string;
  text?: string;
  accent?: string;
  border?: string;
}

export interface PersonalUiThemePrefs {
  /** Catalog theme id from ThemeEngine (neon-royal, midnight-noir, …). */
  catalogThemeId: string;
  buttonStyle: ButtonColorStyle;
  customButtonHex: string;
  customBgHex: string;
  customTextHex: string;
  customAccentHex: string;
  /** 0.15–1 — HUD overlay opacity only (never affects video pixels). */
  hudOpacity: number;
  applyToEverything: boolean;
  sectionOverrides: Partial<Record<ThemeSectionId, SectionColorOverride>>;
}

export const PERSONAL_UI_THEME_STORAGE_KEY = "tmi.theme.personal.v1" as const;

export const DEFAULT_PERSONAL_UI_THEME: PersonalUiThemePrefs = {
  catalogThemeId: "neon-royal",
  buttonStyle: "tmi_multicolor",
  customButtonHex: "#00FFFF",
  customBgHex: "#030310",
  customTextHex: "#FFFFFF",
  customAccentHex: "#AA2DFF",
  hudOpacity: 0.88,
  applyToEverything: true,
  sectionOverrides: {},
};

export function loadPersonalUiThemePrefs(): PersonalUiThemePrefs {
  if (typeof window === "undefined") return { ...DEFAULT_PERSONAL_UI_THEME };
  try {
    const raw = localStorage.getItem(PERSONAL_UI_THEME_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PERSONAL_UI_THEME };
    const parsed = JSON.parse(raw) as Partial<PersonalUiThemePrefs>;
    return {
      ...DEFAULT_PERSONAL_UI_THEME,
      ...parsed,
      sectionOverrides: { ...DEFAULT_PERSONAL_UI_THEME.sectionOverrides, ...(parsed.sectionOverrides ?? {}) },
    };
  } catch {
    return { ...DEFAULT_PERSONAL_UI_THEME };
  }
}

export function savePersonalUiThemePrefs(prefs: PersonalUiThemePrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PERSONAL_UI_THEME_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

function resolveButtonColors(
  prefs: PersonalUiThemePrefs,
  tokens: ThemeTokens,
): { bg: string; text: string; border: string; hover: string; active: string } {
  switch (prefs.buttonStyle) {
    case "solid_black":
      return {
        bg: "#000000",
        text: "#FFFFFF",
        border: "rgba(255,255,255,0.35)",
        hover: "#1a1a1a",
        active: "#333333",
      };
    case "solid_white":
      return {
        bg: "#FFFFFF",
        text: "#0a0a0a",
        border: "rgba(0,0,0,0.35)",
        hover: "#f0f0f0",
        active: "#e0e0e0",
      };
    case "neutral_gray":
      return {
        bg: "#2a2a2e",
        text: "#FFFFFF",
        border: "rgba(255,255,255,0.25)",
        hover: "#3a3a40",
        active: "#1a1a1e",
      };
    case "outlined":
      return {
        bg: "transparent",
        text: prefs.customTextHex || tokens.secondary || "#FFFFFF",
        border: prefs.customAccentHex || tokens.primary,
        hover: "rgba(255,255,255,0.08)",
        active: "rgba(255,255,255,0.14)",
      };
    case "custom_solid":
      return {
        bg: prefs.customButtonHex || tokens.primary,
        text: contrastText(prefs.customButtonHex || tokens.primary),
        border: prefs.customButtonHex || tokens.primary,
        hover: lighten(prefs.customButtonHex || tokens.primary, 0.12),
        active: darken(prefs.customButtonHex || tokens.primary, 0.12),
      };
    case "tmi_multicolor":
    default:
      return {
        bg: tokens.primary,
        text: "#FFFFFF",
        border: tokens.secondary,
        hover: tokens.secondary,
        active: tokens.tertiary,
      };
  }
}

function sectionTone(
  prefs: PersonalUiThemePrefs,
  section: ThemeSectionId,
  tokens: ThemeTokens,
): SectionColorOverride {
  if (!prefs.applyToEverything && prefs.sectionOverrides[section]) {
    return prefs.sectionOverrides[section]!;
  }
  // Custom catalog-free palette when user picked pure custom hex backgrounds
  const useCustom =
    prefs.catalogThemeId === "custom-color" ||
    prefs.catalogThemeId === "pure-black" ||
    prefs.catalogThemeId === "pure-white";
  if (useCustom && prefs.customBgHex) {
    return {
      bg: prefs.customBgHex,
      surface: lighten(prefs.customBgHex, 0.06),
      text: prefs.customTextHex || contrastText(prefs.customBgHex),
      accent: prefs.customAccentHex || tokens.primary,
      border: `${prefs.customAccentHex || tokens.primary}55`,
    };
  }
  return {
    bg: tokens.bgBase,
    surface: tokens.bgSurface,
    text: "#FFFFFF",
    accent: tokens.primary,
    border: `${tokens.primary}44`,
  };
}

/** Project theme + personal prefs onto existing TMI CSS tokens + chrome vars. */
export function projectPersonalUiThemeToCss(
  tokens: ThemeTokens,
  prefs: PersonalUiThemePrefs = loadPersonalUiThemePrefs(),
): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const workspace = sectionTone(prefs, "workspace", tokens);
  const drawer = sectionTone(prefs, "drawer", tokens);
  const monitor = sectionTone(prefs, "monitor", tokens);
  const hud = sectionTone(prefs, "hud", tokens);
  const nav = sectionTone(prefs, "nav", tokens);
  const messaging = sectionTone(prefs, "messaging", tokens);
  const store = sectionTone(prefs, "store", tokens);
  const buttons = resolveButtonColors(prefs, tokens);

  const bg = workspace.bg || tokens.bgBase;
  const surface = workspace.surface || tokens.bgSurface;
  const text = workspace.text || "#FFFFFF";
  const accent = workspace.accent || tokens.primary;

  // Existing master tokens (tokens.css) — drive global chrome
  root.style.setProperty("--bg-void", bg);
  root.style.setProperty("--bg-deep", darken(bg, 0.04));
  root.style.setProperty("--bg-dark", surface);
  root.style.setProperty("--bg-panel", surface);
  root.style.setProperty("--bg-card", lighten(surface, 0.04));
  root.style.setProperty("--bg-elevated", lighten(surface, 0.08));
  root.style.setProperty("--bg-glass", tokens.bgGlass);
  root.style.setProperty("--text-primary", text);
  root.style.setProperty("--text-secondary", text === "#0a0a0a" || text === "#000000" ? "#333348" : "#B4BEFF");
  root.style.setProperty("--border-subtle", workspace.border || `${accent}22`);
  root.style.setProperty("--border-active", `${accent}88`);
  root.style.setProperty("--neon-cyan", tokens.secondary || accent);
  root.style.setProperty("--neon-pink", tokens.primary);
  root.style.setProperty("--neon-gold", tokens.tertiary);

  // Personal chrome tokens
  root.style.setProperty("--tmi-accent", accent);
  root.style.setProperty("--tmi-btn-bg", buttons.bg);
  root.style.setProperty("--tmi-btn-text", buttons.text);
  root.style.setProperty("--tmi-btn-border", buttons.border);
  root.style.setProperty("--tmi-btn-hover", buttons.hover);
  root.style.setProperty("--tmi-btn-active", buttons.active);
  root.style.setProperty("--tmi-btn-mode", prefs.buttonStyle);

  root.style.setProperty("--tmi-drawer-bg", drawer.bg || surface);
  root.style.setProperty("--tmi-drawer-header", drawer.surface || lighten(drawer.bg || surface, 0.05));
  root.style.setProperty("--tmi-drawer-text", drawer.text || text);
  root.style.setProperty("--tmi-drawer-accent", drawer.accent || accent);
  root.style.setProperty("--tmi-drawer-border", drawer.border || `${accent}44`);

  root.style.setProperty("--tmi-monitor-frame", monitor.border || tokens.monitorBorderColor || accent);
  root.style.setProperty("--tmi-monitor-bg", monitor.bg || surface);
  root.style.setProperty("--tmi-monitor-text", monitor.text || text);

  root.style.setProperty("--tmi-hud-bg", hud.bg || tokens.bgGlass);
  root.style.setProperty("--tmi-hud-text", hud.text || text);
  root.style.setProperty("--tmi-hud-accent", hud.accent || accent);
  root.style.setProperty("--tmi-hud-opacity", String(Math.min(1, Math.max(0.15, prefs.hudOpacity))));

  root.style.setProperty("--tmi-nav-bg", nav.bg || surface);
  root.style.setProperty("--tmi-nav-text", nav.text || text);
  root.style.setProperty("--tmi-nav-accent", nav.accent || accent);

  root.style.setProperty("--tmi-msg-bg", messaging.bg || surface);
  root.style.setProperty("--tmi-msg-accent", messaging.accent || accent);
  root.style.setProperty("--tmi-store-bg", store.bg || surface);
  root.style.setProperty("--tmi-store-accent", store.accent || accent);

  root.dataset.tmiTheme = tokens.id;
  root.dataset.tmiBtnStyle = prefs.buttonStyle;
  root.dataset.tmiThemeMode = prefs.applyToEverything ? "global" : "section";
}

export function contrastText(bgHex: string): string {
  const c = parseHex(bgHex);
  if (!c) return "#FFFFFF";
  const lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#FFFFFF";
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0]! + h[0]!, 16),
      g: parseInt(h[1]! + h[1]!, 16),
      b: parseInt(h[2]! + h[2]!, 16),
    };
  }
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lighten(hex: string, amount: number): string {
  const c = parseHex(hex);
  if (!c) return hex;
  const t = Math.round(255 * amount);
  return `#${[c.r, c.g, c.b]
    .map((v) => Math.min(255, v + t).toString(16).padStart(2, "0"))
    .join("")}`;
}

function darken(hex: string, amount: number): string {
  const c = parseHex(hex);
  if (!c) return hex;
  const t = Math.round(255 * amount);
  return `#${[c.r, c.g, c.b]
    .map((v) => Math.max(0, v - t).toString(16).padStart(2, "0"))
    .join("")}`;
}

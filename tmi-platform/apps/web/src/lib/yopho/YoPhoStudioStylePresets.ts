/**
 * YoPho Studio Style Presets — Marcel's 1-hour novelty / Olan Mills brief.
 * CSS/SVG/canvas overlays only. Honest labels — no fake film / camera claims (Rule 20).
 */

import type { PortraitCompositionMode, ObjectMaskType, TexturePreset } from "./YoPhoPortraitEngine";

export type YoPhoStudioStyleId =
  | "classic"
  | "olan_mills_float"
  | "wine_glass"
  | "vaseline_soft"
  | "neon_cosmic"
  | "glamour_glow"
  | "border_white"
  | "border_date"
  | "border_magazine"
  | "border_calendar"
  | "prism_multi"
  | "mask_heart"
  | "mask_keyhole"
  | "mask_oval"
  | "twin_split"
  | "minilab_warm"
  | "light_leak"
  | "industrial_creator"
  | "diamond_prestige"
  | "underground_cypher"
  | "concert_hero"
  | "magazine_editorial";

export type StudioOverlayKind =
  | "none"
  | "olan_float"
  | "wine_glass"
  | "vaseline"
  | "neon_grid"
  | "glamour"
  | "border_white"
  | "border_date"
  | "border_magazine"
  | "border_calendar"
  | "prism"
  | "mask_heart"
  | "mask_keyhole"
  | "mask_oval"
  | "twin_split"
  | "minilab"
  | "light_leak"
  | "industrial_creator"
  | "diamond_prestige"
  | "underground_cypher"
  | "concert_hero"
  | "magazine_editorial";

export interface YoPhoStudioStylePreset {
  id: YoPhoStudioStyleId;
  label: string;
  tagline: string;
  pack: "classic" | "olan" | "masks" | "borders" | "neon" | "color";
  /** Overlay renderer key */
  overlay: StudioOverlayKind;
  /** Optional blueprint nudges when selecting this style */
  compositionHint?: PortraitCompositionMode;
  objectMaskHint?: ObjectMaskType;
  textureHint?: TexturePreset;
  accentHint?: string;
}

export const YOPHO_STUDIO_STYLE_PRESETS: YoPhoStudioStylePreset[] = [
  {
    id: "classic",
    label: "Classic Card",
    tagline: "Clean trading-card frame",
    pack: "classic",
    overlay: "none",
    textureHint: "cyber_glow",
  },
  {
    id: "olan_mills_float",
    label: "Olan Float",
    tagline: "Floating-head double exposure",
    pack: "olan",
    overlay: "olan_float",
    compositionHint: "double_exposure",
    textureHint: "80s_airbrush",
    accentHint: "#FFD700",
  },
  {
    id: "wine_glass",
    label: "Snifter Glass",
    tagline: "Face-in-glass novelty mask",
    pack: "olan",
    overlay: "wine_glass",
    compositionHint: "object_composite",
    objectMaskHint: "coffee_cup",
    textureHint: "glow",
  },
  {
    id: "vaseline_soft",
    label: "Vaseline Soft",
    tagline: "Soft-focus vignette glow",
    pack: "olan",
    overlay: "vaseline",
    textureHint: "glow",
  },
  {
    id: "neon_cosmic",
    label: "Neon Cosmic",
    tagline: "Laser grid · TMI neon space",
    pack: "neon",
    overlay: "neon_grid",
    textureHint: "cyber_glow",
    accentHint: "#00E5FF",
  },
  {
    id: "glamour_glow",
    label: "Glamour Glow",
    tagline: "Soft beauty-light bloom",
    pack: "olan",
    overlay: "glamour",
    textureHint: "80s_airbrush",
    accentHint: "#FF2DAA",
  },
  {
    id: "border_white",
    label: "White Edge",
    tagline: "Studio print white border",
    pack: "borders",
    overlay: "border_white",
  },
  {
    id: "border_date",
    label: "Date Stamp",
    tagline: "Corner date stamp frame",
    pack: "borders",
    overlay: "border_date",
  },
  {
    id: "border_magazine",
    label: "Magazine Cover",
    tagline: "1980s entertainment cover edge",
    pack: "borders",
    overlay: "border_magazine",
    accentHint: "#FFD700",
  },
  {
    id: "border_calendar",
    label: "Calendar",
    tagline: "Tear-off calendar border",
    pack: "borders",
    overlay: "border_calendar",
  },
  {
    id: "prism_multi",
    label: "Prism Multi",
    tagline: "Multi-image prism shards",
    pack: "olan",
    overlay: "prism",
    compositionHint: "multi_montage",
    textureHint: "halftone",
  },
  {
    id: "mask_heart",
    label: "Heart Vignette",
    tagline: "Heart-shaped cutout",
    pack: "masks",
    overlay: "mask_heart",
  },
  {
    id: "mask_keyhole",
    label: "Keyhole",
    tagline: "Keyhole peep vignette",
    pack: "masks",
    overlay: "mask_keyhole",
  },
  {
    id: "mask_oval",
    label: "Cameo Oval",
    tagline: "Classic oval portrait",
    pack: "masks",
    overlay: "mask_oval",
  },
  {
    id: "twin_split",
    label: "Twin Split",
    tagline: "Horizontal twin split-screen",
    pack: "olan",
    overlay: "twin_split",
    compositionHint: "opposing",
  },
  {
    id: "minilab_warm",
    label: "Minilab Warm",
    tagline: "Warm print color cast",
    pack: "color",
    overlay: "minilab",
    textureHint: "vintage_album",
  },
  {
    id: "light_leak",
    label: "Light Leak",
    tagline: "Analog light-leak streaks",
    pack: "color",
    overlay: "light_leak",
    textureHint: "film_texture",
  },
  {
    id: "industrial_creator",
    label: "Industrial Creator",
    tagline: "Workshop · Wires · CRT Monitors · Sparks & Lightning",
    pack: "neon",
    overlay: "industrial_creator",
    textureHint: "grain",
    accentHint: "#00FFFF",
  },
  {
    id: "diamond_prestige",
    label: "Diamond Prestige",
    tagline: "Glass & Crystal · Prism Effects · Floating Dust",
    pack: "color",
    overlay: "diamond_prestige",
    textureHint: "gold_foil",
    accentHint: "#FFD700",
  },
  {
    id: "underground_cypher",
    label: "Underground Cypher",
    tagline: "Concrete · Graffiti · Neon Tubes · Equalizer Haze",
    pack: "neon",
    overlay: "underground_cypher",
    textureHint: "cyber_glow",
    accentHint: "#FF2DAA",
  },
  {
    id: "concert_hero",
    label: "Concert Hero",
    tagline: "Stage Lights · Laser Beams · Crowd Smoke · Tour Marquee",
    pack: "classic",
    overlay: "concert_hero",
    textureHint: "glow",
    accentHint: "#00FF88",
  },
  {
    id: "magazine_editorial",
    label: "Magazine Editorial",
    tagline: "Publication Typography · Clean Geometry · Studio Framing",
    pack: "borders",
    overlay: "magazine_editorial",
    textureHint: "none",
    accentHint: "#FFFFFF",
  },
];

export function getStudioStylePreset(id: YoPhoStudioStyleId): YoPhoStudioStylePreset {
  return YOPHO_STUDIO_STYLE_PRESETS.find((p) => p.id === id) ?? YOPHO_STUDIO_STYLE_PRESETS[0]!;
}

export function listStudioStylesByPack(pack: YoPhoStudioStylePreset["pack"]): YoPhoStudioStylePreset[] {
  return YOPHO_STUDIO_STYLE_PRESETS.filter((p) => p.pack === pack);
}

const STORAGE_KEY = "tmi_yopho_studio_style";

export function loadSavedStudioStyle(): YoPhoStudioStyleId {
  if (typeof window === "undefined") return "classic";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && YOPHO_STUDIO_STYLE_PRESETS.some((p) => p.id === raw)) {
      return raw as YoPhoStudioStyleId;
    }
  } catch {
    /* ignore */
  }
  return "classic";
}

export function saveStudioStyle(id: YoPhoStudioStyleId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/**
 * YoPho Magic Effect presets — toggleable underlay/foreground overlays.
 * CSS/SVG particles only — live preview, no AI wait (Phase A).
 */

export type YoPhoMagicEffectId =
  | "rain"
  | "snow"
  | "fog"
  | "neon_glow"
  | "smoke"
  | "confetti"
  | "light_leak";

export type YoPhoMagicEffectSlot = "underlay" | "foreground";

export interface YoPhoMagicEffectPreset {
  id: YoPhoMagicEffectId;
  label: string;
  tagline: string;
  slot: YoPhoMagicEffectSlot;
  /** Accent hint for editor chips */
  accent: string;
}

export const YOPHO_MAGIC_EFFECTS: YoPhoMagicEffectPreset[] = [
  {
    id: "rain",
    label: "Rain",
    tagline: "Soft diagonal streaks",
    slot: "foreground",
    accent: "#7EC8E3",
  },
  {
    id: "snow",
    label: "Snow",
    tagline: "Drift flakes",
    slot: "foreground",
    accent: "#E8F4FF",
  },
  {
    id: "fog",
    label: "Fog",
    tagline: "Low haze wash",
    slot: "underlay",
    accent: "#A0A8B8",
  },
  {
    id: "neon_glow",
    label: "Neon Glow",
    tagline: "Cyan / fuchsia bloom",
    slot: "underlay",
    accent: "#00E5FF",
  },
  {
    id: "smoke",
    label: "Smoke",
    tagline: "Stage haze columns",
    slot: "underlay",
    accent: "#8899AA",
  },
  {
    id: "confetti",
    label: "Confetti",
    tagline: "Celebration flecks",
    slot: "foreground",
    accent: "#FF2DAA",
  },
  {
    id: "light_leak",
    label: "Light Leak",
    tagline: "Film edge flare",
    slot: "underlay",
    accent: "#FFD700",
  },
];

export function getMagicEffectPreset(id: YoPhoMagicEffectId): YoPhoMagicEffectPreset {
  return YOPHO_MAGIC_EFFECTS.find((e) => e.id === id) ?? YOPHO_MAGIC_EFFECTS[0]!;
}

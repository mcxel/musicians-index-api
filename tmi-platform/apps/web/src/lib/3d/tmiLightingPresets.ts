export type TmiLightingPresetId =
  | "arena-neon-night"
  | "magazine-hero-gloss"
  | "monitor-glow-control"
  | "venue-concert-prime";

export type TmiLightingPreset = {
  id: TmiLightingPresetId;
  keyLight: { color: string; intensity: number; angle: number };
  fillLight: { color: string; intensity: number };
  rimLight: { color: string; intensity: number };
  bloom: number;
  fog?: { color: string; density: number };
};

export const TMI_LIGHTING_PRESETS: Record<TmiLightingPresetId, TmiLightingPreset> = {
  "arena-neon-night": {
    id: "arena-neon-night",
    keyLight: { color: "#2B6CFF", intensity: 1.25, angle: 35 },
    fillLight: { color: "#FF3CA6", intensity: 0.85 },
    rimLight: { color: "#2FE9FF", intensity: 0.95 },
    bloom: 0.62,
    fog: { color: "#0B0E16", density: 0.018 },
  },
  "magazine-hero-gloss": {
    id: "magazine-hero-gloss",
    keyLight: { color: "#F5F8FF", intensity: 1.05, angle: 25 },
    fillLight: { color: "#FFE45C", intensity: 0.7 },
    rimLight: { color: "#FF3CA6", intensity: 0.8 },
    bloom: 0.48,
  },
  "monitor-glow-control": {
    id: "monitor-glow-control",
    keyLight: { color: "#2FE9FF", intensity: 1.1, angle: 18 },
    fillLight: { color: "#2B6CFF", intensity: 0.7 },
    rimLight: { color: "#A6FF4D", intensity: 0.72 },
    bloom: 0.54,
  },
  "venue-concert-prime": {
    id: "venue-concert-prime",
    keyLight: { color: "#FF3B3B", intensity: 1.3, angle: 40 },
    fillLight: { color: "#2FE9FF", intensity: 0.75 },
    rimLight: { color: "#FFE45C", intensity: 0.82 },
    bloom: 0.66,
    fog: { color: "#0B0E16", density: 0.022 },
  },
};

export function getLightingPreset(id: TmiLightingPresetId): TmiLightingPreset {
  return TMI_LIGHTING_PRESETS[id];
}

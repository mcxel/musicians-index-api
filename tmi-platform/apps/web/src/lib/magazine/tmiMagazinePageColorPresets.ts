export type TmiMagazinePageColorPreset = {
  id: string;
  leftPage: string;
  rightPage: string;
  accent: string;
  darkPanel: string;
};

const PRESETS: Record<string, TmiMagazinePageColorPreset> = {
  "home-1": {
    id: "home-1",
    leftPage: "linear-gradient(160deg, rgba(18,170,182,0.85), rgba(12,48,76,0.92))",
    rightPage: "linear-gradient(160deg, rgba(170,52,172,0.84), rgba(46,12,82,0.92))",
    accent: "#f7cf4f",
    darkPanel: "rgba(10,13,22,0.76)",
  },
  "home-1-2": {
    id: "home-1-2",
    leftPage: "linear-gradient(160deg, rgba(28,188,202,0.84), rgba(10,46,74,0.9))",
    rightPage: "linear-gradient(160deg, rgba(204,66,210,0.82), rgba(64,16,104,0.9))",
    accent: "#ffd45e",
    darkPanel: "rgba(9,11,24,0.8)",
  },
  "home-2": {
    id: "home-2",
    leftPage: "linear-gradient(160deg, rgba(34,182,150,0.84), rgba(12,54,68,0.92))",
    rightPage: "linear-gradient(160deg, rgba(42,178,226,0.82), rgba(14,42,84,0.92))",
    accent: "#ffd96a",
    darkPanel: "rgba(8,16,24,0.8)",
  },
  default: {
    id: "default",
    leftPage: "linear-gradient(160deg, rgba(29,160,174,0.82), rgba(13,42,70,0.9))",
    rightPage: "linear-gradient(160deg, rgba(166,66,176,0.82), rgba(54,18,94,0.9))",
    accent: "#f5c94b",
    darkPanel: "rgba(10,12,23,0.78)",
  },
};

export function getMagazinePageColorPreset(presetId: string): TmiMagazinePageColorPreset {
  return PRESETS[presetId] ?? PRESETS.default;
}

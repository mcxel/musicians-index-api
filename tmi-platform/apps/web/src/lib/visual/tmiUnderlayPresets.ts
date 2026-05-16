export type TmiUnderlayPreset = {
  id: string;
  shadowPool: string;
  colorWash: string;
  texture: string;
};

export const TMI_UNDERLAY_PRESETS: TmiUnderlayPreset[] = [
  {
    id: "magazine-neon",
    shadowPool: "radial-gradient(circle at 50% 84%, rgba(0,0,0,0.56), transparent 52%)",
    colorWash: "linear-gradient(135deg, rgba(29,172,194,0.18), rgba(162,54,180,0.16), rgba(250,209,92,0.12))",
    texture: "repeating-linear-gradient(120deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 6px)",
  },
];

export function getUnderlayPreset(id = "magazine-neon"): TmiUnderlayPreset {
  return TMI_UNDERLAY_PRESETS.find((item) => item.id === id) ?? TMI_UNDERLAY_PRESETS[0];
}

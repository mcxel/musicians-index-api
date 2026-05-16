export type TmiMagazineMoodPreset = {
  id: string;
  name: string;
  glow: string;
  atmosphere: string;
};

export const TMI_MAGAZINE_PAGE_MOOD_PRESETS: TmiMagazineMoodPreset[] = [
  { id: "neon-crown", name: "Neon Crown", glow: "rgba(62,245,255,0.28)", atmosphere: "rgba(255,84,210,0.12)" },
  { id: "late-show", name: "Late Show", glow: "rgba(255,212,92,0.24)", atmosphere: "rgba(16,24,58,0.28)" },
  { id: "arena-pulse", name: "Arena Pulse", glow: "rgba(255,120,240,0.24)", atmosphere: "rgba(16,10,36,0.26)" },
];

export function getMoodPreset(id: string): TmiMagazineMoodPreset {
  return TMI_MAGAZINE_PAGE_MOOD_PRESETS.find((item) => item.id === id) ?? TMI_MAGAZINE_PAGE_MOOD_PRESETS[0];
}

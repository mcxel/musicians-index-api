export type TmiMagazinePaperPreset = {
  id: string;
  paperTexture: string;
  border: string;
  trim: string;
};

export const TMI_MAGAZINE_PAPER_PRESETS: TmiMagazinePaperPreset[] = [
  {
    id: "default",
    paperTexture:
      "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06), transparent 40%)",
    border: "rgba(255,255,255,0.2)",
    trim: "rgba(255,217,102,0.65)",
  },
];

export function getPaperPreset(id: string): TmiMagazinePaperPreset {
  return TMI_MAGAZINE_PAPER_PRESETS.find((item) => item.id === id) ?? TMI_MAGAZINE_PAPER_PRESETS[0];
}

export type TmiMagazineSectionColor = {
  section: string;
  base: string;
  accent: string;
  panel: string;
};

export const TMI_MAGAZINE_SECTION_COLORS: TmiMagazineSectionColor[] = [
  { section: "cover", base: "#0f4c5f", accent: "#ffd66b", panel: "rgba(8,17,30,0.78)" },
  { section: "ranking", base: "#6e2a86", accent: "#ffd24a", panel: "rgba(12,9,24,0.8)" },
  { section: "articles", base: "#1f8cab", accent: "#ff85d0", panel: "rgba(8,15,28,0.78)" },
  { section: "sponsor", base: "#7a3c2a", accent: "#ffe17f", panel: "rgba(18,12,8,0.76)" },
];

export function getSectionColor(section: string): TmiMagazineSectionColor {
  return TMI_MAGAZINE_SECTION_COLORS.find((item) => item.section === section) ?? TMI_MAGAZINE_SECTION_COLORS[0];
}

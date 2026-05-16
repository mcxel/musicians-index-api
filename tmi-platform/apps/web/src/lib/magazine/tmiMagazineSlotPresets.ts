export type TmiMagazineSlotPreset = {
  id: string;
  type: "article" | "playlist" | "ranking" | "sponsor";
  colSpan: number;
  rowSpan: number;
};

export const TMI_MAGAZINE_SLOT_PRESETS: TmiMagazineSlotPreset[] = [
  { id: "slot-article-main", type: "article", colSpan: 2, rowSpan: 2 },
  { id: "slot-playlist-strip", type: "playlist", colSpan: 2, rowSpan: 1 },
  { id: "slot-ranking-stack", type: "ranking", colSpan: 1, rowSpan: 2 },
  { id: "slot-sponsor-chip", type: "sponsor", colSpan: 1, rowSpan: 1 },
];

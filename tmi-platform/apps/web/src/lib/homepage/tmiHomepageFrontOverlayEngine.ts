export type TmiFrontOverlayFrame = {
  id: string;
  borderGlow: string;
  cornerNotches: ("tl" | "tr" | "bl" | "br")[];
  hotspotSlots: number;
};

const FRAMES: TmiFrontOverlayFrame[] = [
  { id: "frame-cinema-a", borderGlow: "rgba(56, 189, 248, 0.55)", cornerNotches: ["tl", "tr", "bl", "br"], hotspotSlots: 6 },
  { id: "frame-cinema-b", borderGlow: "rgba(232, 121, 249, 0.55)", cornerNotches: ["tl", "tr"], hotspotSlots: 5 },
  { id: "frame-cinema-c", borderGlow: "rgba(52, 211, 153, 0.5)", cornerNotches: ["bl", "br"], hotspotSlots: 4 }
];

export function getFrontOverlayFrame(index: number): TmiFrontOverlayFrame {
  return FRAMES[((index % FRAMES.length) + FRAMES.length) % FRAMES.length];
}

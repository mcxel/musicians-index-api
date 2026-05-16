export type MagazineSlotRole = "rank1" | "rank2" | "rank3" | "feature";

export type MagazineSlot = {
  slotId: string;
  role: MagazineSlotRole;
  x: number; // percentage
  y: number; // percentage
  w: number; // percentage
  h: number; // percentage
};

/**
 * Home 1 hero blueprint slot coordinates.
 * These are design slots (blueprint), not baked image pixels.
 */
export const HOME1_SLOTS: MagazineSlot[] = [
  { slotId: "rank1", role: "rank1", x: 49, y: 48, w: 30, h: 44 },
  { slotId: "rank2", role: "rank2", x: 20, y: 24, w: 16, h: 24 },
  { slotId: "rank3", role: "rank3", x: 80, y: 24, w: 16, h: 24 },
  { slotId: "rank4", role: "feature", x: 12, y: 56, w: 14, h: 20 },
  { slotId: "rank5", role: "feature", x: 86, y: 56, w: 14, h: 20 },
  { slotId: "rank6", role: "feature", x: 30, y: 74, w: 14, h: 20 },
  { slotId: "rank7", role: "feature", x: 70, y: 74, w: 14, h: 20 },
];

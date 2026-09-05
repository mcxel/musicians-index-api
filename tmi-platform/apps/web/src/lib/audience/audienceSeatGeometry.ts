/**
 * audienceSeatGeometry.ts — Seat Pin Coordinates & Layout for AudienceScene
 * Pure calculation logic (no React/JSX) for cross-runtime and testing consumption.
 */

export const AUDIENCE_SCENE_W = 900;
export const AUDIENCE_SCENE_H = 480;
export const FAN_TOTAL_SEATS = 84;
export const PERF_TOTAL_SEATS = 114;

export const FAN_ROWS = [
  { y: 310, seats: 15, sw: 48, sz: 9.5, lit: 0.15 },
  { y: 332, seats: 14, sw: 52, sz: 11, lit: 0.22 },
  { y: 355, seats: 13, sw: 57, sz: 13, lit: 0.32 },
  { y: 376, seats: 12, sw: 62, sz: 14.5, lit: 0.44 },
  { y: 397, seats: 11, sw: 68, sz: 16, lit: 0.58 },
  { y: 418, seats: 10, sw: 74, sz: 17.5, lit: 0.72 },
  { y: 440, seats: 9, sw: 80, sz: 18.5, lit: 0.85 },
] as const;

export const PERF_ROWS = [
  { ri: 0, yB: 0.4, seats: 20, sw: 36, sz: 8, lit: 0.65 },
  { ri: 1, yB: 0.46, seats: 18, sw: 40, sz: 9.5, lit: 0.72 },
  { ri: 2, yB: 0.52, seats: 16, sw: 44, sz: 11, lit: 0.78 },
  { ri: 3, yB: 0.58, seats: 14, sw: 50, sz: 13, lit: 0.84 },
  { ri: 4, yB: 0.65, seats: 12, sw: 56, sz: 14.5, lit: 0.9 },
  { ri: 5, yB: 0.72, seats: 10, sw: 62, sz: 16, lit: 0.94 },
  { ri: 6, yB: 0.79, seats: 8, sw: 70, sz: 17.5, lit: 0.97 },
  { ri: 7, yB: 0.86, seats: 6, sw: 80, sz: 19, lit: 1 },
] as const;

export type AudienceSeatPin = {
  seatIndex: number;
  x: number;
  y: number;
  sz: number;
  /** Higher = closer to camera / more visible for R3F overlay priority */
  visibility: number;
};

/**
 * Seat pins matching AudienceScene canvas layout (logical 900×480).
 * Fill order matches canvas occupancy (fanSeatIdx / perfSeatIdx).
 */
export function computeAudienceSeatPins(
  view: "fan" | "performer",
  W = AUDIENCE_SCENE_W,
  H = AUDIENCE_SCENE_H,
): AudienceSeatPin[] {
  const pins: AudienceSeatPin[] = [];
  if (view === "fan") {
    let seatIndex = 0;
    FAN_ROWS.forEach((row, ri) => {
      const sx = (W - row.seats * row.sw) / 2;
      for (let c = 0; c < row.seats; c++) {
        const px = sx + c * row.sw + row.sw / 2;
        pins.push({
          seatIndex: seatIndex++,
          x: px,
          y: row.y,
          sz: row.sz,
          visibility: ri * 10 + c * 0.01 + row.lit * 20,
        });
      }
    });
  } else {
    let seatIndex = 0;
    PERF_ROWS.forEach((row) => {
      const y = H * row.yB;
      const sx = (W - row.seats * row.sw) / 2;
      for (let c = 0; c < row.seats; c++) {
        const px = sx + c * row.sw + row.sw / 2;
        pins.push({
          seatIndex: seatIndex++,
          x: px,
          y,
          sz: row.sz,
          visibility: (PERF_ROWS.length - row.ri) * 10 + row.lit * 20,
        });
      }
    });
  }
  return pins;
}

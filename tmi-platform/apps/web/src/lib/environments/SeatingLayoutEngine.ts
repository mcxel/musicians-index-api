/**
 * SeatingLayoutEngine.ts
 * Generates seating arrangements for each room type.
 * Outputs normalized seat positions for rendering.
 */

export type SeatStatus = "empty" | "occupied" | "vip" | "reserved" | "bot";

export type Seat = {
  id: string;
  row: number;
  col: number;
  /** Normalized 0–1 within audience zone */
  x: number;
  y: number;
  status: SeatStatus;
  label?: string;
};

export type SeatingLayout = {
  rows: number;
  cols: number;
  seats: Seat[];
  totalCapacity: number;
  occupiedCount: number;
};

export type SeatingStyle = "theater" | "arena" | "cabaret" | "standing" | "bleachers";

function buildGrid(rows: number, cols: number, style: SeatingStyle): Seat[] {
  const seats: Seat[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xPad = style === "cabaret" ? 0.08 : 0.04;
      const yPad = 0.06;
      const x = xPad + (c / Math.max(cols - 1, 1)) * (1 - xPad * 2);
      const y = yPad + (r / Math.max(rows - 1, 1)) * (1 - yPad * 2);
      seats.push({
        id: `seat-r${r}-c${c}`,
        row: r,
        col: c,
        x,
        y,
        status: "empty",
      });
    }
  }
  return seats;
}

export function generateSeatingLayout(style: SeatingStyle, rows: number, cols: number): SeatingLayout {
  const seats = buildGrid(rows, cols, style);
  return {
    rows,
    cols,
    seats,
    totalCapacity: rows * cols,
    occupiedCount: 0,
  };
}

export function applyOccupancy(layout: SeatingLayout, occupancyPct: number): SeatingLayout {
  const count = Math.floor(layout.totalCapacity * Math.min(occupancyPct, 1));
  const seated = layout.seats.map((s, i) => ({
    ...s,
    status: (i < count ? "occupied" : "empty") as SeatStatus,
  }));
  return { ...layout, seats: seated, occupiedCount: count };
}

/** Per-room seating presets */
export const ROOM_SEATING_PRESETS: Record<string, { style: SeatingStyle; rows: number; cols: number }> = {
  "monthly-idol":       { style: "theater",   rows: 6,  cols: 12 },
  "monday-night-stage": { style: "bleachers",  rows: 5,  cols: 14 },
  "deal-or-feud":       { style: "theater",   rows: 4,  cols: 10 },
  "name-that-tune":     { style: "cabaret",   rows: 5,  cols: 10 },
  "circle-squares":     { style: "arena",     rows: 6,  cols: 12 },
  "cypher":             { style: "standing",  rows: 4,  cols: 14 },
  "lobbies":            { style: "cabaret",   rows: 4,  cols: 10 },
};

export function getSeatingLayoutForRoom(roomId: string, occupancyPct = 0.6): SeatingLayout {
  const preset = ROOM_SEATING_PRESETS[roomId] ?? { style: "theater" as SeatingStyle, rows: 5, cols: 10 };
  const layout = generateSeatingLayout(preset.style, preset.rows, preset.cols);
  return applyOccupancy(layout, occupancyPct);
}

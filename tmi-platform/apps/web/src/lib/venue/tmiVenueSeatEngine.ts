export type TmiSeatStatus = "open" | "reserved" | "blocked";

export type TmiSeatNode = {
  id: string;
  row: string;
  number: number;
  x: number;
  y: number;
  zone: "front" | "mid" | "rear" | "vip";
  status: TmiSeatStatus;
};

export type TmiSeatingMap = {
  venueId: string;
  rows: number;
  cols: number;
  seats: TmiSeatNode[];
};

function seatStatusFor(col: number): TmiSeatStatus {
  if (col % 9 === 0) return "blocked";
  if (col % 4 === 0) return "reserved";
  return "open";
}

export type VenueSeat = {
  id: string;
  row: string;
  seat: number;
  zone: string;
  price: number;
  claimedBy?: string;
  ticketId?: string;
};

const claimStore = new Map<string, { claimedBy: string; ticketId?: string }>();

export function claimSeat(seatId: string, userId: string, ticketId?: string): void {
  claimStore.set(seatId, { claimedBy: userId, ticketId });
}

export function releaseSeat(seatId: string): void {
  claimStore.delete(seatId);
}

export function getSeatClaim(seatId: string) {
  return claimStore.get(seatId) ?? null;
}

export function buildVenueSeatingMap(venueId: string, rows = 8, cols = 12): TmiSeatingMap {
  const seats: TmiSeatNode[] = [];
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  for (let r = 0; r < rows; r += 1) {
    for (let c = 1; c <= cols; c += 1) {
      seats.push({
        id: `${venueId}-seat-${r + 1}-${c}`,
        row: rowLabels[r] ?? `R${r + 1}`,
        number: c,
        x: c * 6,
        y: (r + 1) * 7,
        zone: r < 2 ? "vip" : r < 4 ? "front" : r < 6 ? "mid" : "rear",
        status: seatStatusFor(c),
      });
    }
  }

  return { venueId, rows, cols, seats };
}

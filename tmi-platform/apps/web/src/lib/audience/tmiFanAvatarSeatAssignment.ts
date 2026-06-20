import { getSeatTierPolicy, type TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";

export type TmiSeatSection = "VIP" | "FRONT" | "MAIN" | "BACK";

export type TmiSeatPosition = {
  seatId: string;
  row: number;
  col: number;
  x: number;
  y: number;
  z: number;
  rotation: { x: number; y: number; z: number };
  section: TmiSeatSection;
};

export type TmiFanSeatAssignment = {
  fanId: string;
  seat: TmiSeatPosition;
  tier: TmiSeatTier;
  roomId: string;
};

function sectionForRow(row: number, totalRows: number): TmiSeatSection {
  if (totalRows <= 1) return "MAIN";
  const frac = row / (totalRows - 1);
  if (frac < 0.25) return "FRONT";
  if (frac > 0.85) return "BACK";
  return "MAIN";
}

/**
 * Real seat-map generator (Phase 2 — Spatial Audience Runtime): every seat
 * gets a deterministic x/y/z, a facing rotation (curved toward center so the
 * whole row looks at the stage, not just forward), and a section derived
 * from its row. `vipCols` marks the center seats of the front row VIP —
 * a declared business rule, never randomized.
 */
export function generateSeatMap(rows: number, cols: number, opts?: { vipCols?: number }): TmiSeatPosition[] {
  const seats: TmiSeatPosition[] = [];
  const centerCol = (cols - 1) / 2;
  const vipCols = opts?.vipCols ?? 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const section: TmiSeatSection =
        row === 0 && vipCols > 0 && Math.abs(col - centerCol) < vipCols / 2
          ? "VIP"
          : sectionForRow(row, rows);
      seats.push({
        seatId: `seat-${row}-${col}`,
        row,
        col,
        x: (col - centerCol) * 1.25,
        y: 0,
        z: row * 1.2,
        rotation: { x: 0, y: -(col - centerCol) * 0.04, z: 0 },
        section,
      });
    }
  }
  return seats;
}

/**
 * Derives real seat geometry from the canonical seatId format that
 * audienceRuntimeEngine.assignNextSeat() already produces ("seat-N",
 * sequential) — used so the spatial/tier/reaction layer renders the SAME
 * seat the canonical room-membership engine assigned, instead of running
 * a second independent seat pool with its own ID scheme (the duplication
 * the Venue Runtime Divergence Audit, 2026-06-20, flagged).
 */
export function seatGeometryFromSeatId(seatId: string, cols = 8, visibleRows = 4): TmiSeatPosition {
  const m = /^seat-(\d+)$/.exec(seatId);
  const n = m ? parseInt(m[1]!, 10) : 0;
  // Wrap into the currently-rendered grid size (small rooms today) so a seat
  // number from a high-capacity room still lands inside the visible grid
  // instead of being positioned off-screen — the real seatId is preserved
  // for identity either way, this only bounds where it's drawn.
  const wrapped = n % (cols * visibleRows);
  const row = Math.floor(wrapped / cols);
  const col = wrapped % cols;
  const centerCol = (cols - 1) / 2;
  const section: TmiSeatSection =
    row === 0 && Math.abs(col - centerCol) < 1
      ? "VIP"
      : row <= 1
        ? "FRONT"
        : row <= 8
          ? "MAIN"
          : "BACK";
  return {
    seatId,
    row,
    col,
    x: (col - centerCol) * 1.25,
    y: 0,
    z: row * 1.2,
    rotation: { x: 0, y: -(col - centerCol) * 0.04, z: 0 },
    section,
  };
}

export function assignSeatForFan(
  fanId: string,
  roomId: string,
  tier: TmiSeatTier,
  seats: TmiSeatPosition[],
): TmiFanSeatAssignment | undefined {
  const policy = getSeatTierPolicy(tier);
  const ordered = [...seats].sort((a, b) => {
    const aScore = Math.abs(a.row - policy.rowPriority);
    const bScore = Math.abs(b.row - policy.rowPriority);
    return aScore - bScore;
  });

  const seat = ordered[0];
  if (!seat) return undefined;

  return {
    fanId,
    roomId,
    tier,
    seat,
  };
}

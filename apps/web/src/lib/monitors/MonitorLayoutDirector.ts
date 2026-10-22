/**
 * MonitorLayoutDirector — square, separated monitor windows.
 *
 * Each addressable window stays 1:1. The grid does not stretch a cell
 * into a wide rectangle to fill a 16:9 frame.
 *
 * Desktop:
 *   1 → 1×1
 *   2 → 2×1
 *   3 → 3×1
 *   4 → 4×1 squares (one row; each cell stays 1:1)
 *   5–6 → 3×2
 *   7–8 → 4×2
 *
 * Phone uses fewer columns so eight windows reflow to 2×4
 * instead of four microscopic squares across.
 */

export interface MonitorLayoutPreset {
  columns: number;
  rows: number;
  gap: number;
  aspectRatio: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  isMobileStack: boolean;
}

function squarePreset(columns: number, rows: number, gap: number, isMobileStack: boolean): MonitorLayoutPreset {
  return {
    columns,
    rows,
    gap,
    aspectRatio: "1/1",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, auto)`,
    isMobileStack,
  };
}

export function resolveMonitorLayoutPreset(
  count: number,
  isPhone: boolean = false,
  isTablet: boolean = false
): MonitorLayoutPreset {
  const c = Math.max(1, Math.min(8, count));
  void isTablet;

  if (isPhone) {
    if (c === 1) return squarePreset(1, 1, 4, true);
    if (c === 2) return squarePreset(2, 1, 4, true);
    if (c <= 4) return squarePreset(2, 2, 4, true);
    if (c <= 6) return squarePreset(2, 3, 4, true);
    return squarePreset(2, 4, 4, true);
  }

  if (c === 1) return squarePreset(1, 1, 6, false);
  if (c === 2) return squarePreset(2, 1, 6, false);
  if (c === 3) return squarePreset(3, 1, 6, false);
  if (c === 4) return squarePreset(4, 1, 6, false);
  if (c <= 6) return squarePreset(3, 2, 6, false);
  return squarePreset(4, 2, 6, false);
}

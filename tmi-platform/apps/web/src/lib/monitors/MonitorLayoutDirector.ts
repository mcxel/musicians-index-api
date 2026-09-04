/**
 * MonitorLayoutDirector — Deterministic Count-Aware Monitor Layout Engine.
 *
 * Laws:
 *   1. 1 Monitor    → 1 × 1
 *   2 Monitors   → 2 × 1
 *   3 Monitors   → 3 × 1 desktop / 2 + 1 adaptive phone
 *   4 Monitors   → 2 × 2 grid
 *   5–6 Monitors → 3 × 2 desktop / 2-column adaptive phone
 *   7–8 Monitors → 4 × 2 desktop / 2 × 4 adaptive stack on phone
 *
 * Guarantees: Zero horizontal overflow, zero monitor clipping, zero frame overlap.
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

export function resolveMonitorLayoutPreset(
  count: number,
  isPhone: boolean = false,
  isTablet: boolean = false
): MonitorLayoutPreset {
  const c = Math.max(1, Math.min(16, count));

  if (isPhone) {
    if (c === 1) {
      return { columns: 1, rows: 1, gap: 4, aspectRatio: "16/9", gridTemplateColumns: "1fr", gridTemplateRows: "1fr", isMobileStack: true };
    }
    if (c === 2) {
      return { columns: 1, rows: 2, gap: 4, aspectRatio: "16/18", gridTemplateColumns: "1fr", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: true };
    }
    if (c === 3) {
      return { columns: 1, rows: 3, gap: 4, aspectRatio: "16/27", gridTemplateColumns: "1fr", gridTemplateRows: "repeat(3, 1fr)", isMobileStack: true };
    }
    if (c === 4) {
      return { columns: 2, rows: 2, gap: 4, aspectRatio: "16/9", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: true };
    }
    if (c <= 6) {
      return { columns: 2, rows: 3, gap: 4, aspectRatio: "16/13.5", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(3, 1fr)", isMobileStack: true };
    }
    // 7-8 monitors on phone
    return { columns: 2, rows: 4, gap: 4, aspectRatio: "16/18", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(4, 1fr)", isMobileStack: true };
  }

  // Tablet presets
  if (isTablet) {
    if (c === 1) return { columns: 1, rows: 1, gap: 6, aspectRatio: "16/9", gridTemplateColumns: "1fr", gridTemplateRows: "1fr", isMobileStack: false };
    if (c === 2) return { columns: 2, rows: 1, gap: 6, aspectRatio: "32/9", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "1fr", isMobileStack: false };
    if (c === 3) return { columns: 2, rows: 2, gap: 6, aspectRatio: "16/9", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: false };
    if (c === 4) return { columns: 2, rows: 2, gap: 6, aspectRatio: "16/9", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: false };
    if (c <= 6) return { columns: 3, rows: 2, gap: 6, aspectRatio: "24/9", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: false };
    return { columns: 4, rows: 2, gap: 6, aspectRatio: "32/9", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: false };
  }

  // Desktop presets
  if (c === 1) return { columns: 1, rows: 1, gap: 8, aspectRatio: "16/9", gridTemplateColumns: "1fr", gridTemplateRows: "1fr", isMobileStack: false };
  if (c === 2) return { columns: 2, rows: 1, gap: 8, aspectRatio: "32/9", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "1fr", isMobileStack: false };
  if (c === 3) return { columns: 3, rows: 1, gap: 8, aspectRatio: "48/9", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "1fr", isMobileStack: false };
  if (c === 4) return { columns: 2, rows: 2, gap: 8, aspectRatio: "16/9", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: false };
  if (c <= 6) return { columns: 3, rows: 2, gap: 8, aspectRatio: "24/9", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: false };
  if (c <= 8) return { columns: 4, rows: 2, gap: 8, aspectRatio: "32/9", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(2, 1fr)", isMobileStack: false };
  return { columns: 4, rows: 4, gap: 6, aspectRatio: "16/9", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 1fr)", isMobileStack: false };
}

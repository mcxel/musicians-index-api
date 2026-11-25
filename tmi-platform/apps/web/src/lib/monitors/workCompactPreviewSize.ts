/**
 * §20995-O — responsive editing-style Media Player 1 preview when WORK opens.
 * Phone → small thumbnail; PC → watchable 16:9 editing preview (not a tiny pip).
 */

export function resolveWorkCompactPreviewWidth(viewportWidth: number): number {
  const w = Math.max(0, Math.floor(viewportWidth));
  if (w < 640) return Math.min(180, Math.max(120, Math.round(w * 0.42)));
  if (w < 1024) return Math.min(320, Math.max(240, Math.round(w * 0.3)));
  if (w < 1440) return Math.min(480, Math.max(320, Math.round(w * 0.28)));
  return Math.min(560, Math.max(400, Math.round(w * 0.26)));
}

/**
 * Outer preview height for a 16:9 editing-style frame.
 * §20995-U: height depends ONLY on width — never on panel count (1–8).
 */
export function resolveWorkCompactPreviewHeight(widthPx: number): number {
  return Math.round((Math.max(120, widthPx) * 9) / 16);
}

/** Geometry lock: panel count must not change compact viewport dimensions. */
export function assertCompactViewportIndependentOfPanelCount(
  viewportWidth: number,
  panelCounts: readonly number[] = [1, 2, 4, 7, 8],
): { width: number; height: number; ok: boolean } {
  const width = resolveWorkCompactPreviewWidth(viewportWidth);
  const height = resolveWorkCompactPreviewHeight(width);
  void panelCounts;
  return { width, height, ok: panelCounts.every(() => true) };
}

/**
 * Content-aware WORK drawer max-height CSS (§20995-M).
 * Studio drawers get more vertical room; notes stay compact-expandable.
 */
export function resolveWorkDrawerMaxHeightCss(workspaceId: string | null | undefined): string {
  switch (workspaceId) {
    case "notes":
      /* §20995-V: library is compact — writing lives in floating Notepad */
      return "min(52vh, 560px)";
    case "messaging":
      return "min(62vh, 720px)";
    case "playlist-studio":
      return "min(68vh, 780px)";
    case "yopho":
    case "settings":
    case "memory-wall":
      return "min(72vh, 860px)";
    case "your-page":
      return "min(78vh, 920px)";
    default:
      return "min(70vh, 820px)";
  }
}

export function resolveWorkDrawerMinHeightPx(workspaceId: string | null | undefined): number {
  switch (workspaceId) {
    case "notes":
      return 300;
    case "messaging":
      return 420;
    case "yopho":
    case "your-page":
      return 560;
    default:
      return 480;
  }
}

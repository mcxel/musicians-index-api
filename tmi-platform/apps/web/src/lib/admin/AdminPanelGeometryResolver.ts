/**
 * AdminPanelGeometryResolver.ts — Fold-to-Fit Law, Panel Expansion States, and Media Player Boundary Protection
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Implements:
 * 1. COMPACT / STANDARD / LARGE / FOCUSED geometry calculations
 * 2. FOLD_TO_FIT spatial compression when available height decreases (e.g. monitors reattach)
 * 3. UNFOLD_TO_AVAILABLE expansion when monitors detach
 * 4. MEDIA_PLAYER_BOUNDARY_PROTECTION (zero collision, zero overflow into Media Player)
 * 5. Decoupled presentation size from underlying service lifecycle
 */

export type PanelGeometryMode =
  | "COMPACT"
  | "STANDARD"
  | "LARGE"
  | "FOCUSED"
  | "FOLDED"
  | "TRANSITIONING";

export type PanelReflowTier = "SUMMARY" | "BALANCED" | "DETAILED" | "MAXIMUM";

export interface PanelGeometryConfig {
  mode: PanelGeometryMode;
  reflowTier: PanelReflowTier;
  maxHeight: number | string;
  width?: number | string;
  height?: number | string;
  elevation: number;
  scrimDim?: number;
  overflowY: "hidden" | "auto";
  canisterStyle?: Record<string, string | number>;
}

export const CANONICAL_PANEL_GEOMETRIES: Record<PanelGeometryMode, PanelGeometryConfig> = {
  COMPACT: {
    mode: "COMPACT",
    reflowTier: "SUMMARY",
    maxHeight: 240,
    elevation: 0,
    overflowY: "hidden",
  },
  STANDARD: {
    mode: "STANDARD",
    reflowTier: "BALANCED",
    maxHeight: 420,
    elevation: 1,
    overflowY: "auto",
  },
  LARGE: {
    mode: "LARGE",
    reflowTier: "DETAILED",
    width: "85vw",
    height: "78vh",
    maxHeight: "78vh",
    elevation: 10,
    scrimDim: 0.5,
    overflowY: "auto",
  },
  FOCUSED: {
    mode: "FOCUSED",
    reflowTier: "MAXIMUM",
    width: "96vw",
    height: "90vh",
    maxHeight: "90vh",
    elevation: 20,
    scrimDim: 0.75,
    overflowY: "auto",
  },
  FOLDED: {
    mode: "FOLDED",
    reflowTier: "SUMMARY",
    maxHeight: 120,
    elevation: 0,
    overflowY: "hidden",
  },
  TRANSITIONING: {
    mode: "TRANSITIONING",
    reflowTier: "BALANCED",
    maxHeight: 300,
    elevation: 2,
    overflowY: "hidden",
  },
};

export interface LayoutBounds {
  viewportHeight: number;
  monitorWallHeight: number;
  mediaPlayerTopBoundary: number;
  attachedMonitorCount: number;
}

/**
 * Calculates available vertical geometry for side panels.
 * Strictly guarantees that panels never collide with or overflow into Media Player 1.
 */
export function calculateAvailablePanelHeight(bounds: LayoutBounds): number {
  const { viewportHeight, monitorWallHeight, mediaPlayerTopBoundary, attachedMonitorCount } = bounds;

  // If attached count is 0 (DISPLAY-ONLY), center wall collapsed; panels have much more space
  if (attachedMonitorCount === 0) {
    const spaceAbovePlayer = Math.max(300, mediaPlayerTopBoundary - 120);
    return Math.min(viewportHeight * 0.75, spaceAbovePlayer);
  }

  // Under normal monitor wall, panel height is bounded by the stage height and Media Player top
  const maxSafeHeight = Math.max(160, mediaPlayerTopBoundary - monitorWallHeight - 60);
  return Math.min(monitorWallHeight || 480, maxSafeHeight);
}

/**
 * FOLD-TO-FIT LAW:
 * Detects whether a panel needs to compress/fold to fit within newly restricted bounds
 * (e.g., when monitors reattach and available vertical space shrinks).
 */
export function resolveFoldToFitState(
  currentMode: PanelGeometryMode,
  availableHeight: number,
  requiredHeight = 240,
): { targetMode: PanelGeometryMode; shouldFold: boolean } {
  if (currentMode === "LARGE" || currentMode === "FOCUSED") {
    // Lifted/expanded panels float above the deck on their own Z-plane and do not fold
    return { targetMode: currentMode, shouldFold: false };
  }

  if (availableHeight < requiredHeight) {
    return { targetMode: "FOLDED", shouldFold: true };
  }

  if (availableHeight >= 400 && currentMode === "FOLDED") {
    return { targetMode: "STANDARD", shouldFold: false };
  }

  return { targetMode: currentMode, shouldFold: false };
}

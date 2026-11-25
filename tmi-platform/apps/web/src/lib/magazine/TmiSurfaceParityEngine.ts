/**
 * TmiSurfaceParityEngine
 *
 * Enforces the PERFORMER AND MAGAZINE SURFACE PARITY LAW:
 *
 * 1. The canonical Performer page and canonical Magazine reader use the same
 *    primary application content width at a given breakpoint.
 * 2. Neither product is rendered as a noticeably smaller inner application.
 * 3. Both are vertically scrollable.
 * 4. Their difference comes from composition, not container size:
 *    - On desktop, if the Performer canvas is W, Magazine is also W.
 *    - On tablet, both resolve through the same responsive content-width authority.
 *    - On phone (390×844), both become the available viewport width minus the
 *      canonical safe-area/gutter treatment.
 * 5. Same width does NOT mean same height:
 *    - Performer page gets taller because more performer modules appear beneath the hero.
 *    - Magazine gets taller because more editorial modules are stacked inside each
 *      physical magazine page.
 */

import React from "react";

export const TMI_CANVAS_MAX_WIDTH_PX = 1040;

export const TMI_RESPONSIVE_BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
  desktopMin: 1024,
} as const;

export interface SurfaceParityContainerStyle {
  width: string;
  maxWidth: number | string;
  margin: string;
  boxSizing: "border-box";
  padding: string;
  overflowX: "hidden";
}

/**
 * Returns canonical container style for both Performer Profile and Magazine Reader.
 */
export function getCanonicalSurfaceContainerStyle(options?: {
  paddingOverride?: string;
  minHeight?: string | number;
}): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: TMI_CANVAS_MAX_WIDTH_PX,
    margin: "0 auto",
    boxSizing: "border-box",
    padding: options?.paddingOverride ?? "24px 20px",
    overflowX: "hidden",
    minHeight: options?.minHeight,
  };
}

/**
 * Common layout token constants to ensure zero drift
 */
export const TMI_CANVAS_TOKENS = {
  maxWidth: TMI_CANVAS_MAX_WIDTH_PX,
  desktopPadding: "24px 20px",
  tabletPadding: "20px 16px",
  mobilePadding: "16px 12px",
  desktopGutter: 20,
  tabletGutter: 16,
  mobileGutter: 12,
  borderRadius: 14,
  primaryPlumBg: "#0a0014",
  secondaryBurgundyBg: "#16041c",
  darkTealSurface: "#061a1e",
  saturatedGoldAccent: "#FFD700",
  orangePrimaryAccent: "#FF9900",
  magentaAccent: "#FF2DAA",
  creamTypography: "#FFF8E7",
  mutedTypography: "rgba(255,255,255,0.65)",
} as const;

/**
 * AdminMonitorLayoutResolver.ts — Elastic Monitor Wall Geometry & Detach/Reattach Resolver
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Resolves layout geometry for attached monitor counts 0 (DISPLAY-ONLY) through 8.
 * Supports independent detach/reattach, split/merge reflow, and display deck rise/yield.
 */

export type AttachedMonitorCount = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface MonitorLayoutSpec {
  attachedCount: AttachedMonitorCount;
  isCollapsed: boolean;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gap: number;
  aspectRatio: string;
  minHeight: number;
  shouldDisplayDeckRise: boolean;
  activeSlots: string[];
}

export const ALL_CANONICAL_MONITOR_SLOTS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export type CanonicalMonitorSlotId = (typeof ALL_CANONICAL_MONITOR_SLOTS)[number];

export function resolveAdminMonitorLayout(
  attachedCount: AttachedMonitorCount,
  isMobile = false,
  isTablet = false,
): MonitorLayoutSpec {
  const activeSlots = ALL_CANONICAL_MONITOR_SLOTS.slice(0, attachedCount) as unknown as string[];

  // COUNT 0: DISPLAY-ONLY MODE
  // Center monitor wall collapses; operational display deck rises up to meet Media Player boundary.
  if (attachedCount === 0) {
    return {
      attachedCount: 0,
      isCollapsed: true,
      gridTemplateColumns: "1fr",
      gridTemplateRows: "0px",
      gap: 0,
      aspectRatio: "16/9",
      minHeight: 0,
      shouldDisplayDeckRise: true,
      activeSlots: [],
    };
  }

  // Mobile viewports always present a focused 1-monitor frame with source switcher
  if (isMobile) {
    return {
      attachedCount,
      isCollapsed: false,
      gridTemplateColumns: "1fr",
      gridTemplateRows: "1fr",
      gap: 6,
      aspectRatio: "16/9",
      minHeight: 180,
      shouldDisplayDeckRise: false,
      activeSlots: activeSlots.slice(0, 1),
    };
  }

  // Tablet or Desktop configurations
  switch (attachedCount) {
    case 1:
      return {
        attachedCount: 1,
        isCollapsed: false,
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr",
        gap: 8,
        aspectRatio: "16/9",
        minHeight: 340,
        shouldDisplayDeckRise: false,
        activeSlots,
      };

    case 2:
      return {
        attachedCount: 2,
        isCollapsed: false,
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr",
        gap: 8,
        aspectRatio: "16/9",
        minHeight: 260,
        shouldDisplayDeckRise: false,
        activeSlots,
      };

    case 3:
      return {
        attachedCount: 3,
        isCollapsed: false,
        gridTemplateColumns: isTablet ? "1fr" : "repeat(3, minmax(0, 1fr))",
        gridTemplateRows: "1fr",
        gap: 8,
        aspectRatio: "16/9",
        minHeight: 200,
        shouldDisplayDeckRise: false,
        activeSlots,
      };

    case 4:
      return {
        attachedCount: 4,
        isCollapsed: false,
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 8,
        aspectRatio: "16/9",
        minHeight: 180,
        shouldDisplayDeckRise: false,
        activeSlots,
      };

    case 5:
      return {
        attachedCount: 5,
        isCollapsed: false,
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gridTemplateRows: "1fr 1fr",
        gap: 6,
        aspectRatio: "16/9",
        minHeight: 160,
        shouldDisplayDeckRise: false,
        activeSlots,
      };

    case 6:
      return {
        attachedCount: 6,
        isCollapsed: false,
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gridTemplateRows: "1fr 1fr",
        gap: 6,
        aspectRatio: "16/9",
        minHeight: 150,
        shouldDisplayDeckRise: false,
        activeSlots,
      };

    case 7:
      return {
        attachedCount: 7,
        isCollapsed: false,
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gridTemplateRows: "1fr 1fr",
        gap: 6,
        aspectRatio: "16/9",
        minHeight: 140,
        shouldDisplayDeckRise: false,
        activeSlots,
      };

    case 8:
    default:
      return {
        attachedCount: 8,
        isCollapsed: false,
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gridTemplateRows: "1fr 1fr",
        gap: 6,
        aspectRatio: "16/9",
        minHeight: 130,
        shouldDisplayDeckRise: false,
        activeSlots,
      };
  }
}

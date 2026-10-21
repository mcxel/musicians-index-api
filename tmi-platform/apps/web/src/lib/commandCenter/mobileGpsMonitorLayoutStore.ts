/**
 * mobileGpsMonitorLayoutStore.ts — CONVERGENCE-ADDENDUM-2026-09-24-J
 * (K = superseding implementation revision of J — one law, not two.)
 *
 * GPS navigator presentation state. Normal opening keeps both monitor slots intact.
 */

import { canonicalMonitorFromMixMonitor } from "@/lib/monitors/canonicalMonitorIdentity";
import { create } from "zustand";

export type MobileMonitorLayoutState =
  | "DUAL_MONITORS_CLOSED"
  | "DRAWER_REPLACES_MONITOR_2"
  | "DUAL_MONITORS_DRAWER_BELOW";

export type GpsDrawerDock = "under-a" | "under-b";

interface MobileGpsMonitorLayoutStore {
  layout: MobileMonitorLayoutState;
  /** Which media player the active drawer sits under. */
  drawerDock: GpsDrawerDock | null;
  /** Extra downward shift for the compact rail, in pixels. */
  railShiftY: number;
  /** Preserve the independent GPS destination scroll position across dismissal. */
  railScrollTop: number;
  /** Shared drawer frame height. Every workspace uses this same size. */
  drawerFrameHeight: number;
  drawerFullscreen: boolean;
  /** User pressed the Monitor 2 control. This is activation, not inferred occupancy. */
  m2ExplicitlyActivated: boolean;
  /** Ask the open GPS drawer to show its existing Coming Soon note. */
  releaseNoteId: string | null;
  setDrawerDock: (dock: GpsDrawerDock | null) => void;
  setRailShiftY: (y: number) => void;
  setRailScrollTop: (scrollTop: number) => void;
  setDrawerFrameHeight: (height: number) => void;
  setDrawerFullscreen: (fullscreen: boolean) => void;
  setM2ExplicitlyActivated: (activated: boolean) => void;
  /** Open the side drawer. Both monitors stay mounted. */
  openGpsDrawer: () => void;
  /** Close GPS entirely → dual monitors, no drawer. */
  closeGpsDrawer: () => void;
  /** Toggle the side drawer. Monitors are not restacked. */
  toggleGpsDrawer: () => void;
  /** Open the existing drawer and show one Coming Soon note. */
  showReleaseNote: (id: string) => void;
  clearReleaseNote: () => void;
  /** Restore Monitor 2; drawer drops below into scroll bed. */
  restoreMonitor2: () => void;
  reset: () => void;
}

export const useMobileGpsMonitorLayoutStore = create<MobileGpsMonitorLayoutStore>((set, get) => ({
  layout: "DUAL_MONITORS_CLOSED",
  drawerDock: null,
  railShiftY: 48,
  railScrollTop: 0,
  drawerFrameHeight: 280,
  drawerFullscreen: false,
  m2ExplicitlyActivated: false,
  releaseNoteId: null,
  setDrawerDock: (drawerDock) => set({ drawerDock }),
  setRailShiftY: (railShiftY) => set({ railShiftY: Math.max(0, Math.min(280, railShiftY)) }),
  setRailScrollTop: (railScrollTop) => set({ railScrollTop: Math.max(0, railScrollTop) }),
  setDrawerFrameHeight: (drawerFrameHeight) => set({ drawerFrameHeight: Math.max(200, Math.min(640, drawerFrameHeight)) }),
  setDrawerFullscreen: (drawerFullscreen) => set({ drawerFullscreen }),
  setM2ExplicitlyActivated: (m2ExplicitlyActivated) => set({ m2ExplicitlyActivated }),
  openGpsDrawer: () => set({ layout: "DUAL_MONITORS_DRAWER_BELOW" }),
  closeGpsDrawer: () => set({ layout: "DUAL_MONITORS_CLOSED", releaseNoteId: null }),
  toggleGpsDrawer: () => {
    const { layout } = get();
    if (layout === "DUAL_MONITORS_CLOSED") {
      set({ layout: "DUAL_MONITORS_DRAWER_BELOW" });
    } else {
      set({ layout: "DUAL_MONITORS_CLOSED", releaseNoteId: null });
    }
  },
  showReleaseNote: (id: string) => set({ layout: "DUAL_MONITORS_DRAWER_BELOW", releaseNoteId: id }),
  clearReleaseNote: () => set({ releaseNoteId: null }),
  restoreMonitor2: () => {
    if (get().layout === "DRAWER_REPLACES_MONITOR_2") {
      set({ layout: "DUAL_MONITORS_DRAWER_BELOW" });
    }
  },
  reset: () => set({
    layout: "DUAL_MONITORS_CLOSED",
    drawerDock: null,
    railShiftY: 48,
    railScrollTop: 0,
    drawerFrameHeight: 280,
    drawerFullscreen: false,
    m2ExplicitlyActivated: false,
    releaseNoteId: null,
  }),
}));

export function isGpsDrawerVisible(layout: MobileMonitorLayoutState): boolean {
  return layout === "DRAWER_REPLACES_MONITOR_2" || layout === "DUAL_MONITORS_DRAWER_BELOW";
}

/** When true, MediaStack should render primary-only so drawer owns Mon 2 footprint. */
export function shouldReplaceMonitor2Slot(layout: MobileMonitorLayoutState): boolean {
  return layout === "DRAWER_REPLACES_MONITOR_2";
}

export function isGpsLeftSwipe(deltaX: number, deltaY: number): boolean {
  return deltaX <= -64 && Math.abs(deltaX) >= Math.abs(deltaY) * 1.5;
}

export type DrawerPlacement = "monitor-2-slot" | "below-monitor-2";

/** One placement decision for every drawer. Rail position is not an input. */
export function resolveDrawerPlacement(input: {
  m2ExplicitlyActivated: boolean;
  m2HasActivePresentation: boolean;
  m2HasProtectedSession: boolean;
}): DrawerPlacement {
  const m2NeedsSlot =
    input.m2ExplicitlyActivated || input.m2HasActivePresentation || input.m2HasProtectedSession;
  return m2NeedsSlot ? "below-monitor-2" : "monitor-2-slot";
}

const ACTIVE_FRAME_SOURCES = new Set([
  "VIDEO_PLAYBACK",
  "SCREEN_SHARE",
  "PERFORMER_FEED",
  "VENUE_VIEW",
  "MONITOR_FEED",
  "SELF_CAMERA",
]);

const PROTECTED_FRAME_SOURCES = new Set(["SELF_CAMERA", "SCREEN_SHARE", "PERFORMER_FEED"]);

const PROTECTED_PANEL_OCCUPANCY = new Set(["PINNED", "LIVE_EVENT_LOCKED", "SYSTEM_RESERVED"]);

/** Legacy mixer token only. Canonical "M2" strings are not panel ids in Phase 1. */
function panelBelongsToPresentedM2(monitorId: string): boolean {
  if (monitorId !== "MONITOR_1" && monitorId !== "MONITOR_2") return false;
  return canonicalMonitorFromMixMonitor(monitorId) === "M2";
}

export function describeMonitor2Occupancy(input: {
  sourceB: string | null;
  frameBSource: string | null;
  panels: Array<{ monitorId: string; occupancy: string; sourceType: string; sourceId: string | null }>;
}): { active: boolean; protectedSession: boolean } {
  const frameActive = input.frameBSource != null && ACTIVE_FRAME_SOURCES.has(input.frameBSource);
  const frameProtected = input.frameBSource != null && PROTECTED_FRAME_SOURCES.has(input.frameBSource);
  const monitor2Panels = input.panels.filter((panel) => panelBelongsToPresentedM2(panel.monitorId));
  const panelActive = monitor2Panels.some(
    (panel) => panel.sourceId != null && panel.sourceType !== "EMPTY" && panel.occupancy !== "AVAILABLE",
  );
  const panelProtected = monitor2Panels.some((panel) => PROTECTED_PANEL_OCCUPANCY.has(panel.occupancy));
  return {
    active: frameActive || panelActive || Boolean(input.sourceB?.trim()),
    protectedSession: frameProtected || panelProtected,
  };
}

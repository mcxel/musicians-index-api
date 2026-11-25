/**
 * mobileGpsMonitorLayoutStore.ts — CONVERGENCE-ADDENDUM-2026-09-24-J
 * (K = superseding implementation revision of J — one law, not two.)
 *
 * GPS / OC navigator presentation state. Normal opening keeps both monitor
 * slots intact (drawer below). openRailMode toggles gps|oc without stacking.
 *
 * Drawer presentation fields (Claude lineage) kept here so UniversalDrawerBase /
 * CanonicalBottomDrawerHost / YourPageStudio share one store — no second layout engine.
 */

import { create } from "zustand";
import {
  INITIAL_DRAWER_PRESENTATION,
  reduceDrawerPresentation,
  type DrawerPresentation,
  type DrawerPresentationAction,
} from "@/lib/drawers/drawerPresentation";

export type MobileMonitorLayoutState =
  | "DUAL_MONITORS_CLOSED"
  | "DRAWER_REPLACES_MONITOR_2"
  | "DUAL_MONITORS_DRAWER_BELOW";

export type GpsRailMode = "gps" | "oc";
export type GpsDockSide = "left" | "right";
export type GpsDrawerDock = "under-b" | null;

export const GPS_OVERLAY_WIDTH = 292;
export const GPS_LAUNCHER_DRAG_THRESHOLD_PX = 48;

const DOCK_STORAGE_KEY = "tmi.gps.dockSide";
const OC_DOCK_STORAGE_KEY = "tmi.oc.dockSide";

export function resolveGpsDockSide(clientX: number, viewportWidth: number): GpsDockSide {
  return clientX < viewportWidth / 2 ? "left" : "right";
}

export function describeMonitor2Occupancy(input: {
  sourceB: unknown;
  frameBSource: unknown;
  panels: Array<{
    monitorId?: string;
    occupancy?: string;
    sourceType?: string;
    sourceId?: string | null;
  }>;
}): { active: boolean; protectedSession: boolean } {
  const m2 = input.panels.filter(
    (p) => p.monitorId === "MONITOR_2" || p.monitorId === "M2",
  );
  const protectedSession = m2.some(
    (p) =>
      p.occupancy === "PINNED" &&
      (p.sourceType === "VIDEO" || p.sourceType === "LIVE" || Boolean(p.sourceId)),
  );
  const panelActive = m2.some(
    (p) => Boolean(p.occupancy) && p.occupancy !== "EMPTY" && p.occupancy !== "IDLE",
  );
  const active = Boolean(input.sourceB) || Boolean(input.frameBSource) || panelActive;
  return { active, protectedSession };
}

/** Prefer drawer-below when M2 is active/protected; never invent a second navigator. */
export function resolveDrawerPlacement(input: {
  m2ExplicitlyActivated: boolean;
  m2HasActivePresentation: boolean;
  m2HasProtectedSession: boolean;
}): "below" | "replace-m2" {
  if (input.m2HasProtectedSession || input.m2ExplicitlyActivated || input.m2HasActivePresentation) {
    return "below";
  }
  return "below";
}

function readStoredDock(key: string): GpsDockSide | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(key);
    if (v === "left" || v === "right") return v;
  } catch {
    /* private mode */
  }
  return null;
}

function writeStoredDock(key: string, side: GpsDockSide): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, side);
  } catch {
    /* ignore */
  }
}

interface MobileGpsMonitorLayoutStore {
  layout: MobileMonitorLayoutState;
  railMode: GpsRailMode | null;
  dockSide: GpsDockSide;
  ocDockSide: GpsDockSide;
  drawerDock: GpsDrawerDock;
  m2ExplicitlyActivated: boolean;
  railScrollTop: number;
  railShiftY: number;
  releaseNoteId: string | null;
  drawerFrameHeight: number;
  drawerFullscreen: boolean;
  drawerPresentation: DrawerPresentation;
  drawerPresentationBeforeFullscreen: "compact" | "expanded";

  openGpsDrawer: () => void;
  closeGpsDrawer: () => void;
  toggleGpsDrawer: () => void;
  /** Open GPS or OC rail; pressing the same mode again closes (no stacking). */
  openRailMode: (mode: GpsRailMode) => void;
  restoreMonitor2: () => void;
  setDockSide: (side: GpsDockSide) => void;
  setOcDockSide: (side: GpsDockSide) => void;
  hydrateDockSide: () => void;
  hydrateOcDockSide: () => void;
  setDrawerDock: (dock: GpsDrawerDock) => void;
  setM2ExplicitlyActivated: (activated: boolean) => void;
  setRailScrollTop: (top: number) => void;
  setRailShiftY: (y: number) => void;
  setDrawerFrameHeight: (height: number) => void;
  setDrawerFullscreen: (fullscreen: boolean) => void;
  applyDrawerPresentation: (action: DrawerPresentationAction) => boolean;
  showReleaseNote: (id: string) => void;
  setReleaseNoteId: (id: string | null) => void;
  clearReleaseNote: () => void;
  reset: () => void;
}

const INITIAL = {
  layout: "DUAL_MONITORS_CLOSED" as MobileMonitorLayoutState,
  railMode: null as GpsRailMode | null,
  dockSide: "left" as GpsDockSide,
  ocDockSide: "left" as GpsDockSide,
  drawerDock: null as GpsDrawerDock,
  m2ExplicitlyActivated: false,
  railScrollTop: 0,
  railShiftY: 0,
  releaseNoteId: null as string | null,
  drawerFrameHeight: 420,
  drawerFullscreen: false,
  drawerPresentation: INITIAL_DRAWER_PRESENTATION.presentation as DrawerPresentation,
  drawerPresentationBeforeFullscreen: INITIAL_DRAWER_PRESENTATION.beforeFullscreen as
    | "compact"
    | "expanded",
};

export const useMobileGpsMonitorLayoutStore = create<MobileGpsMonitorLayoutStore>((set, get) => ({
  ...INITIAL,

  openGpsDrawer: () =>
    set({ layout: "DUAL_MONITORS_DRAWER_BELOW", railMode: get().railMode ?? "gps" }),

  closeGpsDrawer: () =>
    set({ layout: "DUAL_MONITORS_CLOSED", railMode: null, drawerDock: null }),

  toggleGpsDrawer: () => {
    const { layout } = get();
    if (layout === "DUAL_MONITORS_CLOSED") {
      set({ layout: "DUAL_MONITORS_DRAWER_BELOW", railMode: "gps" });
    } else {
      set({ layout: "DUAL_MONITORS_CLOSED", railMode: null, drawerDock: null });
    }
  },

  openRailMode: (mode) => {
    const { railMode, layout } = get();
    if (railMode === mode && layout !== "DUAL_MONITORS_CLOSED") {
      set({ layout: "DUAL_MONITORS_CLOSED", railMode: null, drawerDock: null });
      return;
    }
    set({ layout: "DUAL_MONITORS_DRAWER_BELOW", railMode: mode });
  },

  restoreMonitor2: () => {
    if (get().layout === "DRAWER_REPLACES_MONITOR_2") {
      set({ layout: "DUAL_MONITORS_DRAWER_BELOW" });
    }
  },

  setDockSide: (side) => {
    writeStoredDock(DOCK_STORAGE_KEY, side);
    set({ dockSide: side });
  },

  setOcDockSide: (side) => {
    writeStoredDock(OC_DOCK_STORAGE_KEY, side);
    set({ ocDockSide: side });
  },

  hydrateDockSide: () => {
    const stored = readStoredDock(DOCK_STORAGE_KEY);
    if (stored) set({ dockSide: stored });
  },

  hydrateOcDockSide: () => {
    const stored = readStoredDock(OC_DOCK_STORAGE_KEY);
    if (stored) set({ ocDockSide: stored });
  },

  setDrawerDock: (dock) => set({ drawerDock: dock }),

  setM2ExplicitlyActivated: (activated) => set({ m2ExplicitlyActivated: activated }),

  setRailScrollTop: (top) => set({ railScrollTop: top }),

  setRailShiftY: (y) => set({ railShiftY: y }),

  setDrawerFrameHeight: (height) =>
    set({ drawerFrameHeight: Math.max(200, Math.min(920, height)) }),

  setDrawerFullscreen: (fullscreen) => {
    const current = get();
    if (fullscreen) {
      set({
        drawerFullscreen: true,
        drawerPresentation: "fullscreen",
        drawerPresentationBeforeFullscreen:
          current.drawerPresentation === "expanded" ? "expanded" : "compact",
      });
      return;
    }
    const back =
      current.drawerPresentation === "fullscreen"
        ? current.drawerPresentationBeforeFullscreen
        : current.drawerPresentation === "expanded"
          ? "expanded"
          : "compact";
    set({ drawerFullscreen: false, drawerPresentation: back });
  },

  applyDrawerPresentation: (action) => {
    const next = reduceDrawerPresentation(
      {
        presentation: get().drawerPresentation,
        beforeFullscreen: get().drawerPresentationBeforeFullscreen,
      },
      action,
    );
    set({
      drawerPresentation: next.state.presentation,
      drawerPresentationBeforeFullscreen: next.state.beforeFullscreen,
      drawerFullscreen: next.state.presentation === "fullscreen",
    });
    return next.close;
  },

  showReleaseNote: (id) =>
    set({ layout: "DUAL_MONITORS_DRAWER_BELOW", releaseNoteId: id, railMode: get().railMode ?? "gps" }),

  setReleaseNoteId: (id) => set({ releaseNoteId: id }),

  clearReleaseNote: () => set({ releaseNoteId: null }),

  reset: () => set({ ...INITIAL }),
}));

export function isGpsDrawerVisible(layout: MobileMonitorLayoutState): boolean {
  return layout === "DRAWER_REPLACES_MONITOR_2" || layout === "DUAL_MONITORS_DRAWER_BELOW";
}

/** When true, MediaStack should render primary-only so drawer owns Mon 2 footprint. */
export function shouldReplaceMonitor2Slot(layout: MobileMonitorLayoutState): boolean {
  return layout === "DRAWER_REPLACES_MONITOR_2";
}

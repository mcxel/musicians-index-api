/**
 * mobileGpsMonitorLayoutStore.ts — CONVERGENCE-ADDENDUM-2026-09-24-J
 * (K = superseding implementation revision of J — one law, not two.)
 *
 * GPS navigator presentation state. Normal opening keeps both monitor slots intact.
 */

import { create } from "zustand";

export type MobileMonitorLayoutState =
  | "DUAL_MONITORS_CLOSED"
  | "DRAWER_REPLACES_MONITOR_2"
  | "DUAL_MONITORS_DRAWER_BELOW";

interface MobileGpsMonitorLayoutStore {
  layout: MobileMonitorLayoutState;
  /** Open GPS below the independent monitor stack. */
  openGpsDrawer: () => void;
  /** Close GPS entirely → dual monitors, no drawer. */
  closeGpsDrawer: () => void;
  /** Toggle from closed ↔ drawer below the monitor stack. */
  toggleGpsDrawer: () => void;
  /** Restore Monitor 2; drawer drops below into scroll bed. */
  restoreMonitor2: () => void;
  reset: () => void;
}

export const useMobileGpsMonitorLayoutStore = create<MobileGpsMonitorLayoutStore>((set, get) => ({
  layout: "DUAL_MONITORS_CLOSED",
  openGpsDrawer: () => set({ layout: "DUAL_MONITORS_DRAWER_BELOW" }),
  closeGpsDrawer: () => set({ layout: "DUAL_MONITORS_CLOSED" }),
  toggleGpsDrawer: () => {
    const { layout } = get();
    if (layout === "DUAL_MONITORS_CLOSED") {
      set({ layout: "DUAL_MONITORS_DRAWER_BELOW" });
    } else {
      set({ layout: "DUAL_MONITORS_CLOSED" });
    }
  },
  restoreMonitor2: () => {
    if (get().layout === "DRAWER_REPLACES_MONITOR_2") {
      set({ layout: "DUAL_MONITORS_DRAWER_BELOW" });
    }
  },
  reset: () => set({ layout: "DUAL_MONITORS_CLOSED" }),
}));

export function isGpsDrawerVisible(layout: MobileMonitorLayoutState): boolean {
  return layout === "DRAWER_REPLACES_MONITOR_2" || layout === "DUAL_MONITORS_DRAWER_BELOW";
}

/** When true, MediaStack should render primary-only so drawer owns Mon 2 footprint. */
export function shouldReplaceMonitor2Slot(layout: MobileMonitorLayoutState): boolean {
  return layout === "DRAWER_REPLACES_MONITOR_2";
}

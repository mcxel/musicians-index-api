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
  /** Open GPS in the secondary monitor slot. Monitor B stays mounted. */
  openGpsDrawer: () => void;
  /** Close GPS entirely → dual monitors, no drawer. */
  closeGpsDrawer: () => void;
  /** Toggle closed ↔ GPS in the secondary monitor slot. */
  toggleGpsDrawer: () => void;
  /** Restore Monitor 2; drawer drops below into scroll bed. */
  restoreMonitor2: () => void;
  reset: () => void;
}

export const useMobileGpsMonitorLayoutStore = create<MobileGpsMonitorLayoutStore>((set, get) => ({
  layout: "DUAL_MONITORS_CLOSED",
  openGpsDrawer: () => set({ layout: "DRAWER_REPLACES_MONITOR_2" }),
  closeGpsDrawer: () => set({ layout: "DUAL_MONITORS_CLOSED" }),
  toggleGpsDrawer: () => {
    const { layout } = get();
    if (layout === "DUAL_MONITORS_CLOSED") {
      set({ layout: "DRAWER_REPLACES_MONITOR_2" });
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

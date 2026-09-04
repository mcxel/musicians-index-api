"use client";

/**
 * MobileQuickPanelRuntime — unified state for the mobile monitor-yield + quick panel system.
 *
 * Law: when a quick panel opens on a ≤768px screen with two monitors visible,
 * one monitor yields its visual space via CSS (DOM stays mounted → no WebRTC
 * restart, no audio restart, no room-state loss). The user can swap which
 * monitor survives. The panel snaps to three heights via drag or tap.
 */

import { create } from "zustand";

export type PanelSnapState = "compact" | "standard" | "expanded";
export type MonitorSide = "a" | "b";

/** Screen-height percentages for each snap level. */
export const PANEL_SNAP_HEIGHTS: Record<PanelSnapState, number> = {
  compact: 25,
  standard: 42,
  expanded: 60,
};

/** Drag delta (px, positive = dragged upward) required to advance one snap level. */
const SNAP_THRESHOLD = 55;

const SNAP_ORDER: PanelSnapState[] = ["compact", "standard", "expanded"];

interface MobileQuickPanelRuntimeState {
  snapState: PanelSnapState;
  /** Monitor that stays visible while the panel is open. */
  activeMonitor: MonitorSide;
  /** True once the component has set mobile mode (≤768 px viewport). */
  isMobile: boolean;
  /** True when both Monitor A and Monitor B are mounted (GoLiveStudio dual-monitor layout). */
  dualMonitorActive: boolean;

  setSnap: (snap: PanelSnapState) => void;
  snapUp: () => void;
  /** Collapses one level; at compact fires onClose so callers can closePanel(). */
  snapDown: () => void;
  /** Call from touch-end with deltaY = startY − endY (positive = dragged up). */
  applyDragDelta: (deltaY: number, onClose: () => void) => void;
  swapMonitor: () => void;
  setActiveMonitor: (side: MonitorSide) => void;
  setIsMobile: (v: boolean) => void;
  setDualMonitorActive: (v: boolean) => void;
}

export const useMobileQuickPanelRuntime = create<MobileQuickPanelRuntimeState>((set, get) => ({
  snapState: "standard",
  activeMonitor: "a",
  isMobile: false,
  dualMonitorActive: false,

  setSnap: (snap) => set({ snapState: snap }),

  snapUp: () => {
    const idx = SNAP_ORDER.indexOf(get().snapState);
    if (idx < SNAP_ORDER.length - 1) set({ snapState: SNAP_ORDER[idx + 1] });
  },

  snapDown: () => {
    const idx = SNAP_ORDER.indexOf(get().snapState);
    if (idx > 0) set({ snapState: SNAP_ORDER[idx - 1] });
    // caller handles close at compact via onClose callback
  },

  applyDragDelta: (deltaY, onClose) => {
    if (Math.abs(deltaY) < SNAP_THRESHOLD) return;
    if (deltaY > 0) {
      // dragged up → expand
      get().snapUp();
    } else {
      // dragged down → collapse or close
      const idx = SNAP_ORDER.indexOf(get().snapState);
      if (idx === 0) {
        onClose();
      } else {
        set({ snapState: SNAP_ORDER[idx - 1] });
      }
    }
  },

  swapMonitor: () =>
    set((s) => ({ activeMonitor: s.activeMonitor === "a" ? "b" : "a" })),

  setActiveMonitor: (side) => set({ activeMonitor: side }),
  setIsMobile: (v) => set({ isMobile: v }),
  setDualMonitorActive: (v) => set({ dualMonitorActive: v }),
}));

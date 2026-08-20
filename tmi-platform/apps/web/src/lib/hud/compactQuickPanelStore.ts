"use client";

import { create } from "zustand";

/** Compact floating quick-panel ids — in-place overlays, never routes. */
export type CompactQuickPanelId =
  | "lobbies"
  | "stream-win"
  | "avatar"
  | "memory-wall"
  | "yopho"
  | "remote"
  | "snips"
  | null;

export type CompactQuickPanelCorner = "bottom-left" | "bottom-right";

interface CompactQuickPanelState {
  activePanel: CompactQuickPanelId;
  corner: CompactQuickPanelCorner;
  collapsed: boolean;
  openPanel: (id: Exclude<CompactQuickPanelId, null>, corner?: CompactQuickPanelCorner) => void;
  closePanel: () => void;
  togglePanel: (id: Exclude<CompactQuickPanelId, null>, corner?: CompactQuickPanelCorner) => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useCompactQuickPanelStore = create<CompactQuickPanelState>((set, get) => ({
  activePanel: null,
  corner: "bottom-right",
  collapsed: false,
  openPanel: (id, corner = "bottom-right") =>
    set({ activePanel: id, corner, collapsed: false }),
  closePanel: () => set({ activePanel: null, collapsed: false }),
  togglePanel: (id, corner = "bottom-right") => {
    const cur = get();
    if (cur.activePanel === id) {
      set({ collapsed: !cur.collapsed });
      return;
    }
    set({ activePanel: id, corner, collapsed: false });
  },
  setCollapsed: (collapsed) => set({ collapsed }),
}));

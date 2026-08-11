"use client";

import { create } from "zustand";
import type { UniversalWorkspaceId } from "./types";

export type WorkspaceSurface = "LEFT_PANEL" | "RIGHT_PANEL" | "DRAWER" | "FLOATING";

export interface WorkspacePresentationConfig {
  preferredSurface: WorkspaceSurface;
  /** Surface used when user opens "full studio" from a quick panel. */
  deepSurface?: WorkspaceSurface;
  defaultWidth?: number;
  defaultHeight?: number;
  preserveState?: boolean;
}

/**
 * Canonical 4-zone routing (locked 2026-08-10):
 * ACT left/right = compact quick runtime controls
 * WORK bottom drawer = deep studios
 * DISCOVER = visual lobby wall (left quick), not text list / floating window
 */
export const WORKSPACE_PRESENTATION_MAP: Record<string, WorkspacePresentationConfig> = {
  inventory: { preferredSurface: "LEFT_PANEL", deepSurface: "DRAWER", defaultWidth: 320, preserveState: true },
  lobby: { preferredSurface: "LEFT_PANEL", defaultWidth: 420, preserveState: true },
  "live-destinations": { preferredSurface: "LEFT_PANEL", defaultWidth: 420, preserveState: true },
  "playlist-studio": { preferredSurface: "RIGHT_PANEL", deepSurface: "DRAWER", preserveState: true },
  "memory-wall": { preferredSurface: "RIGHT_PANEL", defaultWidth: 320 },
  submissions: { preferredSurface: "RIGHT_PANEL", defaultWidth: 340 },
  messaging: { preferredSurface: "RIGHT_PANEL", defaultWidth: 340 },
  rewards: { preferredSurface: "LEFT_PANEL", defaultWidth: 300 },
  "share-studio": { preferredSurface: "RIGHT_PANEL", defaultWidth: 360 },
  yopho: { preferredSurface: "DRAWER", preserveState: true },
  store: { preferredSurface: "DRAWER", preserveState: true },
  analytics: { preferredSurface: "DRAWER", preserveState: true },
  booking: { preferredSurface: "DRAWER", preserveState: true },
  settings: { preferredSurface: "DRAWER", preserveState: true },
};

interface PresentationState {
  leftPanelWorkspace: UniversalWorkspaceId | null;
  rightPanelWorkspace: UniversalWorkspaceId | null;
  drawerWorkspace: UniversalWorkspaceId | null;
  isDrawerExpanded: boolean;

  openInSurface: (id: UniversalWorkspaceId, surface?: WorkspaceSurface) => void;
  openDeepStudio: (id: UniversalWorkspaceId) => void;
  closeSurface: (surface: WorkspaceSurface) => void;
  toggleDrawerExpand: () => void;
}

export const useWorkspacePresentationStore = create<PresentationState>((set, get) => ({
  leftPanelWorkspace: null,
  rightPanelWorkspace: null,
  drawerWorkspace: null,
  isDrawerExpanded: false,

  openInSurface: (id, targetSurface) => {
    const config = WORKSPACE_PRESENTATION_MAP[id] ?? { preferredSurface: "DRAWER" as WorkspaceSurface };
    const surface = targetSurface ?? config.preferredSurface;

    if (surface === "LEFT_PANEL") {
      set({ leftPanelWorkspace: id });
    } else if (surface === "RIGHT_PANEL") {
      set({ rightPanelWorkspace: id });
    } else if (surface === "DRAWER") {
      set({ drawerWorkspace: id, isDrawerExpanded: true });
    }
  },

  openDeepStudio: (id) => {
    const config = WORKSPACE_PRESENTATION_MAP[id];
    const deep = config?.deepSurface ?? "DRAWER";
    if (deep === "DRAWER") {
      set({ drawerWorkspace: id, isDrawerExpanded: true });
    } else {
      get().openInSurface(id, deep);
    }
  },

  closeSurface: (surface) => {
    if (surface === "LEFT_PANEL") set({ leftPanelWorkspace: null });
    if (surface === "RIGHT_PANEL") set({ rightPanelWorkspace: null });
    if (surface === "DRAWER") set({ drawerWorkspace: null, isDrawerExpanded: false });
  },

  toggleDrawerExpand: () => set((s) => ({ isDrawerExpanded: !s.isDrawerExpanded })),
}));

"use client";

import { create } from "zustand";
import type { UniversalWorkspaceId } from "./types";

export type WorkspaceSurface = "LEFT_PANEL" | "RIGHT_PANEL" | "DRAWER" | "FLOATING";

export interface WorkspacePresentationConfig {
  preferredSurface: WorkspaceSurface;
  defaultWidth?: number;
  defaultHeight?: number;
  preserveState?: boolean;
}

export const WORKSPACE_PRESENTATION_MAP: Record<string, WorkspacePresentationConfig> = {
  "playlist-studio": { preferredSurface: "DRAWER", preserveState: true },
  "yopho": { preferredSurface: "DRAWER", preserveState: true },
  "memory-wall": { preferredSurface: "RIGHT_PANEL", defaultWidth: 320 },
  "inventory": { preferredSurface: "LEFT_PANEL", defaultWidth: 320 },
  "submissions": { preferredSurface: "RIGHT_PANEL", defaultWidth: 340 },
  "messaging": { preferredSurface: "RIGHT_PANEL", defaultWidth: 340 },
  "store": { preferredSurface: "DRAWER", preserveState: true },
  "rewards": { preferredSurface: "LEFT_PANEL", defaultWidth: 300 },
  "analytics": { preferredSurface: "DRAWER", preserveState: true },
  "booking": { preferredSurface: "DRAWER", preserveState: true },
  "lobby": { preferredSurface: "LEFT_PANEL", defaultWidth: 320 },
  "share-studio": { preferredSurface: "RIGHT_PANEL", defaultWidth: 360 },
};

interface PresentationState {
  leftPanelWorkspace: UniversalWorkspaceId | null;
  rightPanelWorkspace: UniversalWorkspaceId | null;
  drawerWorkspace: UniversalWorkspaceId | null;
  isDrawerExpanded: boolean;

  openInSurface: (id: UniversalWorkspaceId, surface?: WorkspaceSurface) => void;
  closeSurface: (surface: WorkspaceSurface) => void;
  toggleDrawerExpand: () => void;
}

export const useWorkspacePresentationStore = create<PresentationState>((set, get) => ({
  leftPanelWorkspace: "inventory",
  rightPanelWorkspace: "memory-wall",
  drawerWorkspace: "playlist-studio",
  isDrawerExpanded: true,

  openInSurface: (id, targetSurface) => {
    const config = WORKSPACE_PRESENTATION_MAP[id] ?? { preferredSurface: "DRAWER" };
    const surface = targetSurface ?? config.preferredSurface;

    if (surface === "LEFT_PANEL") {
      set({ leftPanelWorkspace: id });
    } else if (surface === "RIGHT_PANEL") {
      set({ rightPanelWorkspace: id });
    } else if (surface === "DRAWER") {
      set({ drawerWorkspace: id, isDrawerExpanded: true });
    }
  },

  closeSurface: (surface) => {
    if (surface === "LEFT_PANEL") set({ leftPanelWorkspace: null });
    if (surface === "RIGHT_PANEL") set({ rightPanelWorkspace: null });
    if (surface === "DRAWER") set({ drawerWorkspace: null, isDrawerExpanded: false });
  },

  toggleDrawerExpand: () => set((s) => ({ isDrawerExpanded: !s.isDrawerExpanded })),
}));

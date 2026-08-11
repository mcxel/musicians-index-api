"use client";

/**
 * WorkspacePresentationRuntime — 4-zone + Media Console presentation authority.
 *
 * HQ modules resolve here (LEFT_QUICK / RIGHT_QUICK / BOTTOM_DEEP / DISCOVERY_WALL).
 * UniversalWorkspaceWindow FLOATING is FLOATING_EXCEPTION only — never default for HQ.
 */

import { create } from "zustand";
import type { UniversalWorkspaceId } from "./types";

/** Surfaces used by Command Center hosts (aliases kept for existing hosts). */
export type WorkspaceSurface =
  | "LEFT_PANEL"
  | "RIGHT_PANEL"
  | "DRAWER"
  | "DISCOVERY_WALL"
  | "FULL_DESTINATION"
  | "FLOATING";

export type MediaConsoleMode = "mini" | "expanded";

export interface WorkspacePresentationConfig {
  preferredSurface: WorkspaceSurface;
  /** Surface used when user opens "full studio" from a quick panel. */
  deepSurface?: WorkspaceSurface;
  defaultWidth?: number;
  defaultHeight?: number;
  preserveState?: boolean;
  /**
   * Media Console mode when this workspace occupies BOTTOM_DEEP.
   * playlist → expanded (full Media Player/Playlist Studio under mini-player band).
   * other deep drawers → mini player stays compact; drawer docks under it.
   */
  mediaConsoleMode?: MediaConsoleMode;
}

/**
 * Canonical presentation map (locked 2026-08-11):
 * LEFT_QUICK  = compact ACT (Avatar / Inventory)
 * RIGHT_QUICK = compact INSPECT (Memory)
 * BOTTOM_DEEP = Media Console DrawerDock (one activeDrawer)
 * DISCOVERY_WALL = Live Lobby Wall matrix (not floating room)
 * FLOATING = temporary movable exception only (Share Studio)
 */
export const WORKSPACE_PRESENTATION_MAP: Record<string, WorkspacePresentationConfig> = {
  // BOTTOM_DEEP — all OC workspaces dock here (one-click no second door)
  inventory: {
    preferredSurface: "DRAWER",
    deepSurface: "DRAWER",
    preserveState: true,
    mediaConsoleMode: "mini",
  },

  "memory-wall": { preferredSurface: "DRAWER", deepSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  submissions: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "share-studio": { preferredSurface: "FLOATING", defaultWidth: 480 },

  // Live Lobby Wall — full-width grid in bottom dock (not floating side panel)
  lobby: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "live-destinations": { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },

  // BOTTOM_DEEP / DrawerDock — Media Console
  "playlist-studio": {
    preferredSurface: "DRAWER",
    deepSurface: "DRAWER",
    preserveState: true,
    mediaConsoleMode: "expanded",
  },
  messaging: { preferredSurface: "DRAWER", defaultWidth: 340, preserveState: true, mediaConsoleMode: "mini" },
  yopho: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  store: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  analytics: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  booking: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  settings: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  sponsors: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "beat-lab": { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "media-locker": { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  notifications: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "achievement-center": { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "room-controls": { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  scores: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  marketplace: { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "prize-vault": { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  "championship-center": { preferredSurface: "DRAWER", preserveState: true, mediaConsoleMode: "mini" },
  rewards: { preferredSurface: "DRAWER", defaultWidth: 300, mediaConsoleMode: "mini" },
};

/** HQ modules that must never open as UniversalWorkspaceWindow FLOATING. */
export function isFloatingException(id: string): boolean {
  return (WORKSPACE_PRESENTATION_MAP[id]?.preferredSurface ?? "DRAWER") === "FLOATING";
}

export function resolvePreferredSurface(id: string): WorkspaceSurface {
  return WORKSPACE_PRESENTATION_MAP[id]?.preferredSurface ?? "DRAWER";
}

export function resolveMediaConsoleMode(id: string | null): MediaConsoleMode {
  if (!id) return "mini";
  return WORKSPACE_PRESENTATION_MAP[id]?.mediaConsoleMode ?? "mini";
}

interface PresentationState {
  leftPanelWorkspace: UniversalWorkspaceId | null;
  rightPanelWorkspace: UniversalWorkspaceId | null;
  /** Single active BOTTOM_DEEP drawer in Media Console DrawerDock */
  drawerWorkspace: UniversalWorkspaceId | null;
  isDrawerExpanded: boolean;
  mediaConsoleMode: MediaConsoleMode;

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
  mediaConsoleMode: "mini",

  openInSurface: (id, targetSurface) => {
    const config = WORKSPACE_PRESENTATION_MAP[id] ?? {
      preferredSurface: "DRAWER" as WorkspaceSurface,
      mediaConsoleMode: "mini" as MediaConsoleMode,
    };
    const surface = targetSurface ?? config.preferredSurface;

    if (surface === "LEFT_PANEL") {
      set({ leftPanelWorkspace: id });
      return;
    }
    if (surface === "RIGHT_PANEL") {
      set({ rightPanelWorkspace: id });
      return;
    }
    if (surface === "DISCOVERY_WALL" || surface === "FULL_DESTINATION") {
      // Discovery / destination handled by openCanonicalPresentation (overlay / router).
      // Clear bottom deep so stage + dock stay clean while wall is open.
      set({
        drawerWorkspace: null,
        isDrawerExpanded: false,
        mediaConsoleMode: "mini",
      });
      return;
    }
    if (surface === "FLOATING") {
      // Caller opens UniversalWorkspaceRuntime — presentation store does not own FLOATING.
      return;
    }
    // BOTTOM_DEEP / DRAWER — one activeDrawer; swaps previous
    set({
      drawerWorkspace: id,
      isDrawerExpanded: true,
      mediaConsoleMode: config.mediaConsoleMode ?? "mini",
    });
  },

  openDeepStudio: (id) => {
    const config = WORKSPACE_PRESENTATION_MAP[id];
    const deep = config?.deepSurface ?? "DRAWER";
    if (deep === "DRAWER") {
      set({
        drawerWorkspace: id,
        isDrawerExpanded: true,
        mediaConsoleMode: config?.mediaConsoleMode ?? "mini",
      });
    } else {
      get().openInSurface(id, deep);
    }
  },

  closeSurface: (surface) => {
    if (surface === "LEFT_PANEL") set({ leftPanelWorkspace: null });
    if (surface === "RIGHT_PANEL") set({ rightPanelWorkspace: null });
    if (surface === "DRAWER") {
      set({ drawerWorkspace: null, isDrawerExpanded: false, mediaConsoleMode: "mini" });
    }
  },

  toggleDrawerExpand: () => set((s) => ({ isDrawerExpanded: !s.isDrawerExpanded })),
}));

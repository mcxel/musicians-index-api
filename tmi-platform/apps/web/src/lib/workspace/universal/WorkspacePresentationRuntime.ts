"use client";

/**
 * WorkspacePresentationRuntime — 4-zone + Media Console + Mobile Stage Deck.
 *
 * HQ modules resolve here (LEFT_QUICK / RIGHT_QUICK / BOTTOM_DEEP / DISCOVERY_WALL).
 * On mobile Command Center, DRAWER workspaces occupy the Stage Deck region
 * (MONITORS ⇄ WORKSPACE) via CommandCenterShell + CanonicalBottomDrawerHost —
 * not a second stacked drawer under live monitors.
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
export type MobilePresentationMode = "WATCH" | "WORK" | "CONTROL";
export type MobileControlMode =
  | "AVATAR_NAVIGATION"
  | "SPATIAL_VIDEO"
  | "VIDEO_SHUFFLE"
  | "WEB_RADIO"
  | "BATTLE_ACTION"
  | "CYPHER_CONTROL"
  | "GAME_ACTION"
  | "VENUE_PRODUCTION"
  | "SPECTATOR";
export type MobilePresentationTransition =
  | "IDLE"
  | "OPENING_WORK"
  | "CLOSING_WORK"
  | "OPENING_CONTROL"
  | "CLOSING_CONTROL";
export type MediaViewportId = "A" | "B";
export const WORKSPACE_PRESENTATION_INSTANCE_ID = "workspace-presentation-runtime-v1";

export interface WorkspacePresentationConfig {
  preferredSurface: WorkspaceSurface;
  /** Surface used when user opens "full studio" from a quick panel. */
  deepSurface?: WorkspaceSurface;
  defaultWidth?: number;
  defaultHeight?: number;
  preserveState?: boolean;
  /** Governing mobile shell mode when this workspace is opened on phones. */
  mobileShellMode?: MobilePresentationMode;
  /** Control mode to activate when mobileShellMode is CONTROL. */
  mobileControlMode?: MobileControlMode;
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
    mobileShellMode: "WORK",
    mediaConsoleMode: "expanded",
  },

  "memory-wall": { preferredSurface: "DRAWER", deepSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  submissions: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "share-studio": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },

  // Live Lobby Wall — GPS discovery owns the reclaimed stage (WORK), not one leftover monitor.
  lobby: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "live-destinations": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },

  // BOTTOM_DEEP / DrawerDock — Media Console
  "playlist-studio": {
    preferredSurface: "DRAWER",
    deepSurface: "DRAWER",
    preserveState: true,
    mobileShellMode: "WORK",
    mediaConsoleMode: "expanded",
  },
  messaging: { preferredSurface: "DRAWER", defaultWidth: 340, preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  yopho: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  store: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  analytics: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  booking: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  settings: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  sponsors: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "beat-lab": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "media-locker": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  notifications: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "achievement-center": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "room-controls": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  scores: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  marketplace: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "prize-vault": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "championship-center": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  rewards: { preferredSurface: "DRAWER", defaultWidth: 300, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "bio-magazine": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "expanded" },

  // Compact quick-HUD variants — open side panels, with deepSurface pointing to full workspace
  "avatar-quick": { preferredSurface: "LEFT_PANEL", deepSurface: "DRAWER", mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "inventory-quick": { preferredSurface: "LEFT_PANEL", deepSurface: "DRAWER", mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
  "memory-quick": { preferredSurface: "RIGHT_PANEL", deepSurface: "DRAWER", mobileShellMode: "WORK", mediaConsoleMode: "expanded" },
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

function isProofDiagnosticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("proof") === "1";
  } catch {
    return false;
  }
}

function tracePresentation(action: string, payload?: unknown): void {
  const shouldTrace = process.env.NODE_ENV === "development" || isProofDiagnosticsEnabled();
  if (shouldTrace && typeof window !== "undefined") {
    const traceEntry = {
      instanceId: WORKSPACE_PRESENTATION_INSTANCE_ID,
      action,
      payload,
      timestamp: performance.now(),
    };
    const w = window as Window & { __TMI_PRESENTATION_TRACE__?: Array<unknown> };
    const current = w.__TMI_PRESENTATION_TRACE__ ?? [];
    current.push(traceEntry);
    if (current.length > 300) current.shift();
    w.__TMI_PRESENTATION_TRACE__ = current;
    document.documentElement.setAttribute("data-presentation-last-action", action);
  }

  if (shouldTrace) {
    console.debug("[TMI:PRESENTATION]", {
      instanceId: WORKSPACE_PRESENTATION_INSTANCE_ID,
      action,
      payload,
    });
  }
}

interface PresentationState {
  leftPanelWorkspace: UniversalWorkspaceId | null;
  rightPanelWorkspace: UniversalWorkspaceId | null;
  /** Single active BOTTOM_DEEP drawer in Media Console DrawerDock */
  drawerWorkspace: UniversalWorkspaceId | null;
  isDrawerExpanded: boolean;
  mediaConsoleMode: MediaConsoleMode;
  mobileMode: MobilePresentationMode;
  activeWorkspace: UniversalWorkspaceId | null;
  activeControlMode: MobileControlMode | null;
  previousMonitorCount: 0 | 1 | 2;
  monitorCount: 0 | 1 | 2;
  focusedViewport: MediaViewportId;
  sourceA: string | null;
  sourceB: string | null;
  transition: MobilePresentationTransition;

  openInSurface: (id: UniversalWorkspaceId, surface?: WorkspaceSurface) => void;
  openDeepStudio: (id: UniversalWorkspaceId) => void;
  closeSurface: (surface: WorkspaceSurface) => void;
  toggleDrawerExpand: () => void;
  cycleMonitorCount: () => void;
  setMonitorCount: (count: 0 | 1 | 2) => void;
  openWorkspace: (id: UniversalWorkspaceId) => void;
  closeWorkspace: () => void;
  openControl: (mode: MobileControlMode, viewport?: MediaViewportId, workspaceId?: UniversalWorkspaceId | null) => void;
  closeControl: () => void;
  setFocusedViewport: (viewport: MediaViewportId) => void;
  setViewportSource: (viewport: MediaViewportId, sourceId: string | null) => void;
}

export const useWorkspacePresentationStore = create<PresentationState>((set, get) => ({
  leftPanelWorkspace: null,
  rightPanelWorkspace: null,
  drawerWorkspace: null,
  isDrawerExpanded: false,
  mediaConsoleMode: "mini",
  mobileMode: "WATCH",
  activeWorkspace: null,
  activeControlMode: null,
  previousMonitorCount: 2,
  monitorCount: 2,
  focusedViewport: "A",
  sourceA: null,
  sourceB: null,
  transition: "IDLE",


  openWorkspace: (id) => {
    const config = WORKSPACE_PRESENTATION_MAP[id] ?? {};
    const nextMonitorCount = get().monitorCount === 0 ? get().previousMonitorCount : get().monitorCount;
    tracePresentation("OPEN_WORKSPACE_REQUEST", {
      workspaceId: id,
      fromMode: get().mobileMode,
      configMobileShellMode: config.mobileShellMode ?? null,
    });
    set({
      drawerWorkspace: id,
      isDrawerExpanded: true,
      mediaConsoleMode: config.mediaConsoleMode ?? "expanded",
      mobileMode: "WORK",
      activeWorkspace: id,
      activeControlMode: null,
      previousMonitorCount: nextMonitorCount,
      monitorCount: 0,
      transition: "OPENING_WORK",
    });
  },

  closeWorkspace: () => {
    const restoreCount = get().previousMonitorCount || 2;
    tracePresentation("RESET_TO_WATCH", { reason: "workspace-close" });
    set({
      drawerWorkspace: null,
      isDrawerExpanded: false,
      mediaConsoleMode: "mini",
      mobileMode: "WATCH",
      activeWorkspace: null,
      activeControlMode: null,
      monitorCount: restoreCount,
      transition: "CLOSING_WORK",
    });
  },

  openControl: (mode, viewport = get().focusedViewport, workspaceId = null) => {
    const nextMonitorCount = get().monitorCount === 0 ? 1 : get().monitorCount;
    tracePresentation("OPEN_CONTROL_REQUEST", {
      mode,
      viewport,
      workspaceId,
      fromMode: get().mobileMode,
    });
    set({
      mobileMode: "CONTROL",
      activeWorkspace: workspaceId ?? get().activeWorkspace,
      activeControlMode: mode,
      focusedViewport: viewport,
      previousMonitorCount: nextMonitorCount,
      monitorCount: 1,
      transition: "OPENING_CONTROL",
    });
  },

  closeControl: () => {
    const restoreCount = get().previousMonitorCount || 2;
    tracePresentation("RESET_TO_WATCH", { reason: "control-close" });
    set({
      mobileMode: "WATCH",
      activeControlMode: null,
      activeWorkspace: null,
      monitorCount: restoreCount,
      transition: "CLOSING_CONTROL",
    });
  },

  setFocusedViewport: (viewport) => set({ focusedViewport: viewport }),
  setViewportSource: (viewport, sourceId) => set((state) => (viewport === "A" ? { sourceA: sourceId } : { sourceB: sourceId })),

  openInSurface: (id, targetSurface) => {
    const config = WORKSPACE_PRESENTATION_MAP[id] ?? {
      preferredSurface: "DRAWER" as WorkspaceSurface,
      mediaConsoleMode: "mini" as MediaConsoleMode,
    };
    const surface = targetSurface ?? config.preferredSurface;
    tracePresentation("OPEN_IN_SURFACE_REQUEST", {
      workspaceId: id,
      targetSurface: targetSurface ?? null,
      resolvedSurface: surface,
      configMobileShellMode: config.mobileShellMode ?? null,
      fromMode: get().mobileMode,
    });

    if (surface === "LEFT_PANEL") {
      tracePresentation("OPEN_LEFT_PANEL", { workspaceId: id });
      set({ leftPanelWorkspace: id });
      return;
    }
    if (surface === "RIGHT_PANEL") {
      tracePresentation("OPEN_RIGHT_PANEL", { workspaceId: id });
      set({ rightPanelWorkspace: id });
      return;
    }
    if (surface === "DISCOVERY_WALL" || surface === "FULL_DESTINATION") {
      // Discovery / destination handled by openCanonicalPresentation (overlay / router).
      // Clear bottom deep so stage + dock stay clean while wall is open.
      tracePresentation("RESET_TO_WATCH", { reason: "discovery-open", workspaceId: id });
      set({
        drawerWorkspace: null,
        isDrawerExpanded: false,
        mediaConsoleMode: "mini",
        mobileMode: "WATCH",
        activeWorkspace: null,
        activeControlMode: null,
        monitorCount: 2,
        transition: "IDLE",
      });
      return;
    }
    if (surface === "FLOATING") {
      // Caller opens UniversalWorkspaceRuntime — presentation store does not own FLOATING.
      tracePresentation("OPEN_FLOATING_SURFACE", { workspaceId: id });
      return;
    }
    // BOTTOM_DEEP / DRAWER — one activeDrawer; swaps previous
    tracePresentation("OPEN_DRAWER_SURFACE_APPLY", {
      workspaceId: id,
      nextMode: config.mobileShellMode ?? get().mobileMode,
      transition:
        config.mobileShellMode === "WORK"
          ? "OPENING_WORK"
          : config.mobileShellMode === "CONTROL"
            ? "OPENING_CONTROL"
            : "IDLE",
    });
    set({
      drawerWorkspace: id,
      isDrawerExpanded: true,
      mediaConsoleMode: config.mediaConsoleMode ?? "mini",
      mobileMode: config.mobileShellMode ?? get().mobileMode,
      activeWorkspace: config.mobileShellMode ? id : get().activeWorkspace,
      activeControlMode: config.mobileShellMode === "CONTROL" ? config.mobileControlMode ?? null : get().activeControlMode,
      previousMonitorCount: get().monitorCount === 0 ? get().previousMonitorCount : get().monitorCount,
      monitorCount: config.mobileShellMode === "WORK" ? 0 : config.mobileShellMode === "CONTROL" ? 1 : get().monitorCount,
      transition:
        config.mobileShellMode === "WORK"
          ? "OPENING_WORK"
          : config.mobileShellMode === "CONTROL"
            ? "OPENING_CONTROL"
            : "IDLE",
    });
  },

  openDeepStudio: (id) => {
    const config = WORKSPACE_PRESENTATION_MAP[id];
    const deep = config?.deepSurface ?? "DRAWER";
    tracePresentation("OPEN_DEEP_STUDIO", {
      workspaceId: id,
      deepSurface: deep,
      configMobileShellMode: config?.mobileShellMode ?? null,
    });
    if (deep === "DRAWER") {
      set({
        drawerWorkspace: id,
        isDrawerExpanded: true,
        mediaConsoleMode: config?.mediaConsoleMode ?? "mini",
        mobileMode: config?.mobileShellMode ?? get().mobileMode,
        activeWorkspace: config?.mobileShellMode ? id : get().activeWorkspace,
        activeControlMode: config?.mobileShellMode === "CONTROL" ? config.mobileControlMode ?? null : get().activeControlMode,
        previousMonitorCount: get().monitorCount === 0 ? get().previousMonitorCount : get().monitorCount,
        monitorCount: config?.mobileShellMode === "WORK" ? 0 : config?.mobileShellMode === "CONTROL" ? 1 : get().monitorCount,
        transition:
          config?.mobileShellMode === "WORK"
            ? "OPENING_WORK"
            : config?.mobileShellMode === "CONTROL"
              ? "OPENING_CONTROL"
              : "IDLE",
      });
    } else {
      get().openInSurface(id, deep);
    }
  },

  closeSurface: (surface) => {
    tracePresentation("CLOSE_SURFACE_REQUEST", { surface, fromMode: get().mobileMode });
    if (surface === "LEFT_PANEL") set({ leftPanelWorkspace: null });
    if (surface === "RIGHT_PANEL") set({ rightPanelWorkspace: null });
    if (surface === "DRAWER") {
      const state = get();
      const restoreCount = state.previousMonitorCount || 2;
      const reason =
        state.mobileMode === "CONTROL"
          ? "drawer-dismiss-control"
          : state.mobileMode === "WORK"
            ? "drawer-dismiss-work"
            : "drawer-dismiss-watch";
      tracePresentation("RESET_TO_WATCH", { reason, restoreCount });
      set({
        drawerWorkspace: null,
        isDrawerExpanded: false,
        mediaConsoleMode: "mini",
        mobileMode: state.mobileMode === "CONTROL" ? "WATCH" : state.mobileMode === "WORK" ? "WATCH" : state.mobileMode,
        activeWorkspace: null,
        activeControlMode: null,
        monitorCount: restoreCount,
        transition: state.mobileMode === "CONTROL" ? "CLOSING_CONTROL" : state.mobileMode === "WORK" ? "CLOSING_WORK" : "IDLE",
      });
    }
  },

  toggleDrawerExpand: () => set((s) => ({ isDrawerExpanded: !s.isDrawerExpanded })),

  cycleMonitorCount: () =>
    set((state) => {
      const next = state.monitorCount === 2 ? 1 : state.monitorCount === 1 ? 0 : 2;
      tracePresentation("CYCLE_MONITOR_COUNT", {
        from: state.monitorCount,
        to: next,
        mode: state.mobileMode,
      });
      return {
        monitorCount: next,
        mobileMode: state.activeWorkspace || state.activeControlMode ? state.mobileMode : "WATCH",
        transition: "IDLE",
      };
    }),

  setMonitorCount: (count) =>
    (tracePresentation("SET_MONITOR_COUNT", { count, from: get().monitorCount, mode: get().mobileMode }),
    set({
      monitorCount: count,
      transition: "IDLE",
    })),
}));

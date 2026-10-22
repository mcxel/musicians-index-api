"use client";

/**
 * WorkspacePresentationRuntime — 4-zone + Media Console + Mobile Stage Deck.
 *
 * HQ modules resolve here (LEFT_QUICK / RIGHT_QUICK / BOTTOM_DEEP / DISCOVERY_WALL).
 * DRAWER opens BELOW the primary dual-monitor fabric — NEVER replaces monitors.
 * WORK = drawer expanded under monitors (feeds/WebRTC/audio preserved).
 * Only explicit user detach/HIDDEN frees monitor geometry for the drawer.
 * UniversalWorkspaceWindow FLOATING is FLOATING_EXCEPTION only — never default for HQ.
 */

import { canonicalMonitorFromMediaViewport, type Phase1PresentedMonitorId } from "@/lib/monitors/canonicalMonitorIdentity";
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
/** Runtime viewports stay A/B. They adapt to presented monitors M1/M2. */
export type MediaViewportId = "A" | "B";

export function canonicalMonitorForViewport(viewport: MediaViewportId): Phase1PresentedMonitorId {
  return canonicalMonitorFromMediaViewport(viewport);
}
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
    mediaConsoleMode: "mini",
  },

  "memory-wall": { preferredSurface: "DRAWER", deepSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  submissions: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "share-studio": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },

  // Live Lobby Wall — flat Class-A drawer BELOW monitors (never replaces media fabric).
  lobby: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "live-destinations": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },

  // BOTTOM_DEEP / DrawerDock — Media Console
  // Class-B: Playlist uniquely expands Mini Player into full Playlist workspace.
  "playlist-studio": {
    preferredSurface: "DRAWER",
    deepSurface: "DRAWER",
    preserveState: true,
    mobileShellMode: "WORK",
    mediaConsoleMode: "expanded",
  },
  messaging: { preferredSurface: "DRAWER", defaultWidth: 340, preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  yopho: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  store: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  shop: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  merch: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  analytics: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  booking: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  settings: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  sponsors: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "beat-lab": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "media-locker": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  notifications: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "achievement-center": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  // DRAWER, not RIGHT_PANEL — matches the only proven click-to-open pattern
  // in this runtime (FloatingLobbyWallTrigger / YoPhoQuickCardPanel).
  "championship-history": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "room-controls": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  scores: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  marketplace: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "prize-vault": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "championship-center": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  rewards: { preferredSurface: "DRAWER", defaultWidth: 300, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "bio-magazine": { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  notes: { preferredSurface: "DRAWER", preserveState: true, mobileShellMode: "WORK", mediaConsoleMode: "mini" },

  // Compact quick-HUD variants — open side panels, with deepSurface pointing to full workspace
  "avatar-quick": { preferredSurface: "LEFT_PANEL", deepSurface: "DRAWER", mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "inventory-quick": { preferredSurface: "LEFT_PANEL", deepSurface: "DRAWER", mobileShellMode: "WORK", mediaConsoleMode: "mini" },
  "memory-quick": { preferredSurface: "RIGHT_PANEL", deepSurface: "DRAWER", mobileShellMode: "WORK", mediaConsoleMode: "mini" },
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
  /**
   * Prior drawer workspaces for CHILD_PUSH / CHILD_POP / RETURN_RESTORE.
   * Closing pops to the previous workspace when the stack is non-empty
   * instead of collapsing the entire drawer shell.
   */
  drawerWorkspaceStack: UniversalWorkspaceId[];
  /** Last close motion hint for AnimatePresence consumers. */
  drawerMotionKind:
    | "DRAWER_IN"
    | "DRAWER_OUT"
    | "PANEL_SCALE_FADE"
    | "CHILD_PUSH"
    | "CHILD_POP"
    | "RETURN_RESTORE"
    | null;
  isDrawerExpanded: boolean;
  mediaConsoleMode: MediaConsoleMode;
  mobileMode: MobilePresentationMode;
  activeWorkspace: UniversalWorkspaceId | null;
  activeControlMode: MobileControlMode | null;
  previousMonitorCount: 0 | 1 | 2;
  monitorCount: 0 | 1 | 2;
  /** Internal view count per focused monitor (1-8). Never 16. */
  activeViewCount: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  focusedViewport: MediaViewportId;
  sourceA: string | null;
  sourceB: string | null;
  transition: MobilePresentationTransition;

  openInSurface: (id: UniversalWorkspaceId, surface?: WorkspaceSurface) => void;
  openDeepStudio: (id: UniversalWorkspaceId) => void;
  closeSurface: (surface: WorkspaceSurface) => void;
  /** Explicit CHILD_POP — restore previous drawer without full shell dismiss. */
  returnToPreviousDrawer: () => boolean;
  toggleDrawerExpand: () => void;
  cycleMonitorCount: () => void;
  setMonitorCount: (count: 0 | 1 | 2) => void;
  setActiveViewCount: (count: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => void;
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
  drawerWorkspaceStack: [],
  drawerMotionKind: null,
  isDrawerExpanded: false,
  mediaConsoleMode: "mini",
  mobileMode: "WATCH",
  activeWorkspace: null,
  activeControlMode: null,
  previousMonitorCount: 2,
  monitorCount: 2,
  activeViewCount: 1,
  focusedViewport: "A",
  sourceA: null,
  sourceB: null,
  transition: "IDLE",


  openWorkspace: (id) => {
    const config = WORKSPACE_PRESENTATION_MAP[id] ?? {};
    const nextMonitorCount = get().monitorCount === 0 ? get().previousMonitorCount : get().monitorCount;
    const prev = get().drawerWorkspace;
    const alreadyOpen = Boolean(prev) && get().isDrawerExpanded;
    tracePresentation("OPEN_WORKSPACE_REQUEST", {
      workspaceId: id,
      fromMode: get().mobileMode,
      configMobileShellMode: config.mobileShellMode ?? null,
    });
    set({
      drawerWorkspace: id,
      drawerWorkspaceStack: alreadyOpen ? get().drawerWorkspaceStack : [],
      drawerMotionKind: alreadyOpen && prev !== id ? "PANEL_SCALE_FADE" : "DRAWER_IN",
      isDrawerExpanded: true,
      mediaConsoleMode: config.mediaConsoleMode ?? "mini",
      mobileMode: "WORK",
      activeWorkspace: id,
      activeControlMode: null,
      // Preserve monitor fabric — drawer layers below; never zero monitors for WORK.
      previousMonitorCount: nextMonitorCount,
      monitorCount: nextMonitorCount || get().previousMonitorCount || 2,
      transition: "OPENING_WORK",
    });
  },

  closeWorkspace: () => {
    const restoreCount = get().previousMonitorCount || 2;
    tracePresentation("RESET_TO_WATCH", { reason: "workspace-close" });
    set({
      drawerWorkspace: null,
      drawerWorkspaceStack: [],
      drawerMotionKind: "DRAWER_OUT",
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
        drawerWorkspaceStack: [],
        drawerMotionKind: "DRAWER_OUT",
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
    // BOTTOM_DEEP / DRAWER — sibling swap replaces; deep nest pushes via openDeepStudio
    const prevDrawer = get().drawerWorkspace;
    const alreadyOpen = Boolean(prevDrawer) && get().isDrawerExpanded;
    tracePresentation("OPEN_DRAWER_SURFACE_APPLY", {
      workspaceId: id,
      nextMode: config.mobileShellMode ?? get().mobileMode,
      transition:
        config.mobileShellMode === "WORK"
          ? "OPENING_WORK"
          : config.mobileShellMode === "CONTROL"
            ? "OPENING_CONTROL"
            : "IDLE",
      siblingSwap: alreadyOpen && prevDrawer !== id,
    });
    set({
      drawerWorkspace: id,
      // Sibling tool swaps keep the stack (do not push) so CLOSE dismisses the shell
      drawerWorkspaceStack: alreadyOpen ? get().drawerWorkspaceStack : [],
      drawerMotionKind: alreadyOpen && prevDrawer !== id ? "PANEL_SCALE_FADE" : "DRAWER_IN",
      isDrawerExpanded: true,
      mediaConsoleMode: config.mediaConsoleMode ?? "mini",
      mobileMode: config.mobileShellMode ?? get().mobileMode,
      activeWorkspace: config.mobileShellMode ? id : get().activeWorkspace,
      activeControlMode: config.mobileShellMode === "CONTROL" ? config.mobileControlMode ?? null : get().activeControlMode,
      previousMonitorCount: get().monitorCount === 0 ? get().previousMonitorCount : get().monitorCount,
      // WORK preserves dual-monitor count; CONTROL may focus one; never collapse for drawer.
      monitorCount:
        config.mobileShellMode === "CONTROL"
          ? 1
          : get().monitorCount === 0
            ? get().previousMonitorCount || 2
            : get().monitorCount,
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
    const prevDrawer = get().drawerWorkspace;
    const nextStack =
      prevDrawer && prevDrawer !== id
        ? [...get().drawerWorkspaceStack, prevDrawer]
        : get().drawerWorkspaceStack;
    tracePresentation("OPEN_DEEP_STUDIO", {
      workspaceId: id,
      deepSurface: deep,
      configMobileShellMode: config?.mobileShellMode ?? null,
    });
    if (deep === "DRAWER") {
      set({
        drawerWorkspace: id,
        drawerWorkspaceStack: nextStack,
        drawerMotionKind: prevDrawer && prevDrawer !== id ? "CHILD_PUSH" : "DRAWER_IN",
        isDrawerExpanded: true,
        mediaConsoleMode: config?.mediaConsoleMode ?? "mini",
        mobileMode: config?.mobileShellMode ?? get().mobileMode,
        activeWorkspace: config?.mobileShellMode ? id : get().activeWorkspace,
        activeControlMode: config?.mobileShellMode === "CONTROL" ? config.mobileControlMode ?? null : get().activeControlMode,
        previousMonitorCount: get().monitorCount === 0 ? get().previousMonitorCount : get().monitorCount,
        monitorCount:
          config?.mobileShellMode === "CONTROL"
            ? 1
            : get().monitorCount === 0
              ? get().previousMonitorCount || 2
              : get().monitorCount,
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
      // RETURN_RESTORE: pop child first when stack has a prior workspace
      if (get().returnToPreviousDrawer()) return;
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
        drawerWorkspaceStack: [],
        drawerMotionKind: "DRAWER_OUT",
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

  returnToPreviousDrawer: () => {
    const stack = [...get().drawerWorkspaceStack];
    if (stack.length === 0) return false;
    const previous = stack.pop()!;
    const config = WORKSPACE_PRESENTATION_MAP[previous] ?? {};
    tracePresentation("RETURN_RESTORE_DRAWER", {
      from: get().drawerWorkspace,
      to: previous,
      remainingStack: stack.length,
    });
    set({
      drawerWorkspace: previous,
      drawerWorkspaceStack: stack,
      drawerMotionKind: "RETURN_RESTORE",
      isDrawerExpanded: true,
      mediaConsoleMode: config.mediaConsoleMode ?? get().mediaConsoleMode,
      activeWorkspace: previous,
      // Monitors / media / communications stay — only workspace id changes
      transition: "IDLE",
    });
    return true;
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

  setActiveViewCount: (count) =>
    set({
      activeViewCount: Math.max(1, Math.min(8, count)) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
      transition: "IDLE",
    }),
}));

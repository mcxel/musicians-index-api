/**
 * UniversalWorkspaceRuntime — CANONICAL OWNER of Universal Workspace Window state.
 *
 * Phase 1 (2026-08-03): playlist-studio + share-studio open here — NOT one-off drawers.
 *
 * Legacy paths become adapters:
 * - FloatingWorkspacePanel / floatingWorkspaceStore → Pass 8 quick modules only
 * - PlaylistPanelOverlay → LEGACY; MasterControlDock routes audio → playlist-studio
 * - UniversalDrawerRegistry playlist/memory/… → under-monitor drawers until migrated
 * - WindowManagerRuntime → general panel layout; does not own workspace windows
 */

"use client";

import { useSyncExternalStore } from "react";
import {
  clampGeometry,
  resolveOpenGeometry,
  saveWorkspaceGeometry,
} from "./WorkspaceGeometryStore";
import { getWorkspaceDef } from "./UniversalWorkspaceRegistry";
import type {
  UniversalWorkspaceId,
  WorkspaceContext,
  WorkspaceDockSide,
  WorkspaceGeometry,
  WorkspaceInstanceState,
  WorkspaceSnapZone,
  WorkspaceWindowState,
} from "./types";

const OPEN_MODES: WorkspaceWindowState[] = [
  "OPENING",
  "DOCKED",
  "FLOATING",
  "RESIZING",
  "MAXIMIZED",
  "FULLSCREEN",
  "PICTURE_IN_PICTURE",
  "RETURNING",
];

type Listener = () => void;

let zCounter = 9600;
const instances = new Map<UniversalWorkspaceId, WorkspaceInstanceState>();
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function snapshot(): Record<string, WorkspaceInstanceState> {
  const out: Record<string, WorkspaceInstanceState> = {};
  for (const [id, inst] of instances) out[id] = inst;
  return out;
}

let cachedSnap: Record<string, WorkspaceInstanceState> = {};
let cacheDirty = true;

function getSnapshot(): Record<string, WorkspaceInstanceState> {
  if (cacheDirty) {
    cachedSnap = snapshot();
    cacheDirty = false;
  }
  return cachedSnap;
}

/** Stable SSR snapshot — must not allocate a new object per call (React useSyncExternalStore). */
const SERVER_SNAPSHOT: Record<string, WorkspaceInstanceState> = {};

function getServerSnapshot(): Record<string, WorkspaceInstanceState> {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function nextZ(): number {
  zCounter += 1;
  return zCounter;
}

function ensure(id: UniversalWorkspaceId): WorkspaceInstanceState {
  const existing = instances.get(id);
  if (existing) return existing;
  const def = getWorkspaceDef(id);
  const restored = resolveOpenGeometry(id);
  const created: WorkspaceInstanceState = {
    id,
    windowState: "CLOSED",
    geometry: restored.geometry,
    previousGeometry: restored.previousGeometry,
    zIndex: nextZ(),
    context: {},
    keepMounted: false,
  };
  instances.set(id, created);
  cacheDirty = true;
  return created;
}

function persist(inst: WorkspaceInstanceState) {
  const mode =
    inst.windowState === "DOCKED" ||
    inst.windowState === "FLOATING" ||
    inst.windowState === "MAXIMIZED" ||
    inst.windowState === "FULLSCREEN" ||
    inst.windowState === "PICTURE_IN_PICTURE"
      ? inst.windowState
      : "FLOATING";
  saveWorkspaceGeometry(inst.id, {
    geometry: inst.geometry,
    previousGeometry: inst.previousGeometry,
    lastMode: mode,
  });
}

function setInstance(id: UniversalWorkspaceId, next: WorkspaceInstanceState) {
  instances.set(id, next);
  cacheDirty = true;
  emit();
}

function viewport() {
  if (typeof window === "undefined") return { vw: 1440, vh: 900 };
  return { vw: window.innerWidth, vh: window.innerHeight };
}

function dockRect(side: WorkspaceDockSide): WorkspaceGeometry {
  const { vw, vh } = viewport();
  switch (side) {
    case "left":
      return { x: 0, y: 0, width: Math.min(480, Math.round(vw * 0.42)), height: vh, dockSide: "left" };
    case "right":
      return {
        x: Math.max(0, vw - Math.min(480, Math.round(vw * 0.42))),
        y: 0,
        width: Math.min(480, Math.round(vw * 0.42)),
        height: vh,
        dockSide: "right",
      };
    case "top":
      return { x: 0, y: 0, width: vw, height: Math.min(360, Math.round(vh * 0.45)), dockSide: "top" };
    case "bottom":
      return {
        x: 0,
        y: Math.max(0, vh - Math.min(360, Math.round(vh * 0.45))),
        width: vw,
        height: Math.min(360, Math.round(vh * 0.45)),
        dockSide: "bottom",
      };
  }
}

function snapRect(zone: WorkspaceSnapZone): WorkspaceGeometry | null {
  const { vw, vh } = viewport();
  if (zone === "left") return { x: 0, y: 0, width: Math.round(vw / 2), height: vh };
  if (zone === "right") return { x: Math.round(vw / 2), y: 0, width: Math.round(vw / 2), height: vh };
  if (zone === "top") return { x: 0, y: 0, width: vw, height: Math.round(vh / 2) };
  return null;
}

function detectSnapZone(x: number, y: number, width: number): WorkspaceSnapZone {
  const { vw } = viewport();
  const edge = 28;
  if (x <= edge) return "left";
  if (x + width >= vw - edge) return "right";
  if (y <= edge) return "top";
  return "none";
}

function modeFromPreferred(
  preferred: "DOCKED" | "FLOATING" | "MAXIMIZED" | "FULLSCREEN" | "PICTURE_IN_PICTURE",
): WorkspaceWindowState {
  return preferred;
}

export const universalWorkspaceRuntime = {
  getState: getSnapshot,
  subscribe,

  get(id: UniversalWorkspaceId): WorkspaceInstanceState {
    return ensure(id);
  },

  isOpen(id: UniversalWorkspaceId): boolean {
    const inst = instances.get(id);
    return !!inst && OPEN_MODES.includes(inst.windowState);
  },

  /**
   * Open workspace, restoring remembered geometry/mode when available.
   */
  open(id: UniversalWorkspaceId, context?: WorkspaceContext) {
    const def = getWorkspaceDef(id);
    const inst = ensure(id);
    const restored = resolveOpenGeometry(id);
    const geometry = clampGeometry(restored.geometry, def.minWidth, def.minHeight);
    const targetMode = modeFromPreferred(restored.preferredMode);

    setInstance(id, {
      ...inst,
      windowState: "OPENING",
      geometry,
      previousGeometry: restored.previousGeometry,
      zIndex: nextZ(),
      context: { ...inst.context, ...context },
      keepMounted: true,
    });

    // Transition OPENING → remembered mode (sync after paint tick).
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const current = ensure(id);
        if (current.windowState !== "OPENING") return;
        let nextGeom = current.geometry;
        if (targetMode === "DOCKED") {
          nextGeom = dockRect(current.geometry.dockSide ?? "right");
        } else if (targetMode === "MAXIMIZED") {
          const { vw, vh } = viewport();
          nextGeom = { x: 12, y: 12, width: vw - 24, height: vh - 100 };
        } else if (targetMode === "FULLSCREEN") {
          const { vw, vh } = viewport();
          nextGeom = { x: 0, y: 0, width: vw, height: vh };
        } else if (targetMode === "PICTURE_IN_PICTURE") {
          const { vw, vh } = viewport();
          nextGeom = {
            x: Math.max(12, vw - 340),
            y: Math.max(12, vh - 240),
            width: 320,
            height: 200,
          };
        }
        const next: WorkspaceInstanceState = {
          ...current,
          windowState: targetMode,
          geometry: nextGeom,
        };
        persist(next);
        setInstance(id, next);
      });
    } else {
      const next = { ...ensure(id), windowState: "FLOATING" as const };
      setInstance(id, next);
    }
  },

  close(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    if (inst.windowState === "CLOSED" || inst.windowState === "CLOSING") return;
    persist(inst);
    setInstance(id, { ...inst, windowState: "CLOSING" });
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        const current = ensure(id);
        if (current.windowState !== "CLOSING") return;
        setInstance(id, { ...current, windowState: "CLOSED" });
      }, 140);
    } else {
      setInstance(id, { ...inst, windowState: "CLOSED" });
    }
  },

  toggle(id: UniversalWorkspaceId, context?: WorkspaceContext) {
    if (this.isOpen(id)) this.close(id);
    else this.open(id, context);
  },

  focus(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    if (!OPEN_MODES.includes(inst.windowState)) return;
    setInstance(id, { ...inst, zIndex: nextZ() });
  },

  setContext(id: UniversalWorkspaceId, context: WorkspaceContext) {
    const inst = ensure(id);
    setInstance(id, { ...inst, context: { ...inst.context, ...context } });
  },

  dock(id: UniversalWorkspaceId, side: WorkspaceDockSide = "right") {
    const inst = ensure(id);
    const previous =
      inst.windowState === "FLOATING" || inst.windowState === "RESIZING"
        ? { ...inst.geometry }
        : inst.previousGeometry;
    const next: WorkspaceInstanceState = {
      ...inst,
      previousGeometry: previous,
      geometry: dockRect(side),
      windowState: "DOCKED",
      keepMounted: true,
      zIndex: nextZ(),
    };
    persist(next);
    setInstance(id, next);
  },

  float(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    const def = getWorkspaceDef(id);
    const geom =
      inst.previousGeometry ??
      clampGeometry(getWorkspaceDef(id).defaultGeometry, def.minWidth, def.minHeight);
    const next: WorkspaceInstanceState = {
      ...inst,
      geometry: { ...geom, dockSide: undefined },
      windowState: "FLOATING",
      keepMounted: true,
      zIndex: nextZ(),
    };
    persist(next);
    setInstance(id, next);
  },

  maximize(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    const { vw, vh } = viewport();
    const previous =
      inst.windowState !== "MAXIMIZED" && inst.windowState !== "FULLSCREEN"
        ? { ...inst.geometry }
        : inst.previousGeometry;
    const next: WorkspaceInstanceState = {
      ...inst,
      previousGeometry: previous,
      geometry: { x: 12, y: 12, width: vw - 24, height: vh - 100 },
      windowState: "MAXIMIZED",
      keepMounted: true,
      zIndex: nextZ(),
    };
    persist(next);
    setInstance(id, next);
  },

  fullscreen(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    const { vw, vh } = viewport();
    const previous =
      inst.windowState !== "FULLSCREEN" ? { ...inst.geometry } : inst.previousGeometry;
    const next: WorkspaceInstanceState = {
      ...inst,
      previousGeometry: previous,
      geometry: { x: 0, y: 0, width: vw, height: vh },
      windowState: "FULLSCREEN",
      keepMounted: true,
      zIndex: nextZ(),
    };
    persist(next);
    setInstance(id, next);
  },

  pictureInPicture(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    const { vw, vh } = viewport();
    const previous =
      inst.windowState !== "PICTURE_IN_PICTURE"
        ? { ...inst.geometry }
        : inst.previousGeometry;
    const next: WorkspaceInstanceState = {
      ...inst,
      previousGeometry: previous,
      geometry: {
        x: Math.max(12, vw - 340),
        y: Math.max(12, vh - 240),
        width: 320,
        height: 200,
      },
      windowState: "PICTURE_IN_PICTURE",
      keepMounted: true,
      zIndex: nextZ(),
    };
    persist(next);
    setInstance(id, next);
  },

  /** Restore previousGeometry (RETURNING → FLOATING). */
  returnFromMode(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    const def = getWorkspaceDef(id);
    const target =
      inst.previousGeometry ??
      clampGeometry(def.defaultGeometry, def.minWidth, def.minHeight);
    setInstance(id, {
      ...inst,
      windowState: "RETURNING",
      keepMounted: true,
    });
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const current = ensure(id);
        const next: WorkspaceInstanceState = {
          ...current,
          geometry: { ...target, dockSide: undefined },
          windowState: "FLOATING",
        };
        persist(next);
        setInstance(id, next);
      });
    }
  },

  beginResize(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    if (!OPEN_MODES.includes(inst.windowState)) return;
    if (inst.windowState === "FULLSCREEN" || inst.windowState === "MAXIMIZED") return;
    setInstance(id, { ...inst, windowState: "RESIZING" });
  },

  endResize(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    if (inst.windowState !== "RESIZING") return;
    const next: WorkspaceInstanceState = { ...inst, windowState: "FLOATING" };
    persist(next);
    setInstance(id, next);
  },

  dragTo(id: UniversalWorkspaceId, x: number, y: number) {
    const inst = ensure(id);
    if (
      inst.windowState === "FULLSCREEN" ||
      inst.windowState === "MAXIMIZED" ||
      inst.windowState === "DOCKED" ||
      inst.windowState === "CLOSED" ||
      inst.windowState === "CLOSING"
    ) {
      return;
    }
    const next: WorkspaceInstanceState = {
      ...inst,
      windowState: "FLOATING",
      geometry: { ...inst.geometry, x, y, dockSide: undefined },
    };
    setInstance(id, next);
  },

  resizeTo(id: UniversalWorkspaceId, width: number, height: number) {
    const inst = ensure(id);
    const def = getWorkspaceDef(id);
    const geometry = clampGeometry(
      { ...inst.geometry, width, height },
      def.minWidth,
      def.minHeight,
    );
    setInstance(id, {
      ...inst,
      windowState: inst.windowState === "RESIZING" ? "RESIZING" : "FLOATING",
      geometry,
    });
  },

  snap(id: UniversalWorkspaceId, zone: WorkspaceSnapZone) {
    const rect = snapRect(zone);
    if (!rect) return;
    const inst = ensure(id);
    const previous =
      inst.windowState === "FLOATING" || inst.windowState === "RESIZING"
        ? { ...inst.geometry }
        : inst.previousGeometry;
    const next: WorkspaceInstanceState = {
      ...inst,
      previousGeometry: previous,
      geometry: rect,
      windowState: "FLOATING",
      keepMounted: true,
    };
    persist(next);
    setInstance(id, next);
  },

  endDragWithSnap(id: UniversalWorkspaceId) {
    const inst = ensure(id);
    const zone = detectSnapZone(inst.geometry.x, inst.geometry.y, inst.geometry.width);
    if (zone === "none") {
      persist(inst);
      return;
    }
    this.snap(id, zone);
  },

  persistNow(id: UniversalWorkspaceId) {
    persist(ensure(id));
  },
};

export function useUniversalWorkspace(
  id: UniversalWorkspaceId,
): WorkspaceInstanceState & {
  open: (context?: WorkspaceContext) => void;
  close: () => void;
  toggle: (context?: WorkspaceContext) => void;
  isOpen: boolean;
} {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const inst = all[id] ?? ensure(id);
  return {
    ...inst,
    isOpen: OPEN_MODES.includes(inst.windowState),
    open: (context?: WorkspaceContext) => universalWorkspaceRuntime.open(id, context),
    close: () => universalWorkspaceRuntime.close(id),
    toggle: (context?: WorkspaceContext) => universalWorkspaceRuntime.toggle(id, context),
  };
}

export function useUniversalWorkspaceStore(): Record<string, WorkspaceInstanceState> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

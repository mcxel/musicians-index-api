"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DrawerMode, WorkspaceActions, WorkspaceId, WorkspaceRole, WorkspaceState } from "@/components/shell/workspaceTypes";

type WorkspaceContextValue = WorkspaceState & WorkspaceActions & {
  workspaceRole: WorkspaceRole;
  availableWorkspaceIds: WorkspaceId[];
};

const STORAGE_KEY = "tmi.workspace.drawer.v1";
const MAX_RECENTS = 8;

const defaultState: WorkspaceState = {
  activeWorkspace: null,
  drawerMode: "collapsed",
  favorites: ["inventory", "messages", "playlists"],
  recentWorkspaces: [],
  pinnedWorkspaces: [],
  isCommandPaletteOpen: false,
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function uniquePush(list: WorkspaceId[], id: WorkspaceId, max = MAX_RECENTS): WorkspaceId[] {
  const next = [id, ...list.filter((item) => item !== id)];
  return next.slice(0, max);
}

function sanitizeWorkspaceIds(list: WorkspaceId[] | undefined, allowedSet: Set<WorkspaceId>): WorkspaceId[] {
  if (!list) return [];
  return list.filter((id) => allowedSet.has(id));
}

export function WorkspaceProvider({
  children,
  workspaceRole,
  availableWorkspaceIds,
}: {
  children: ReactNode;
  workspaceRole: WorkspaceRole;
  availableWorkspaceIds: WorkspaceId[];
}) {
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const allowedWorkspaceSet = useMemo(() => new Set<WorkspaceId>(availableWorkspaceIds), [availableWorkspaceIds]);
  const storageKey = `${STORAGE_KEY}.${workspaceRole}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
      const sanitizedFavorites = sanitizeWorkspaceIds(parsed.favorites, allowedWorkspaceSet);
      const sanitizedRecents = sanitizeWorkspaceIds(parsed.recentWorkspaces, allowedWorkspaceSet);
      const sanitizedPinned = sanitizeWorkspaceIds(parsed.pinnedWorkspaces, allowedWorkspaceSet);
      const sanitizedActive = parsed.activeWorkspace && allowedWorkspaceSet.has(parsed.activeWorkspace)
        ? parsed.activeWorkspace
        : null;

      setState((prev) => ({
        ...prev,
        ...parsed,
        drawerMode: parsed.drawerMode ?? prev.drawerMode,
        activeWorkspace: sanitizedActive ?? prev.activeWorkspace,
        favorites: sanitizedFavorites.length > 0 ? sanitizedFavorites : sanitizeWorkspaceIds(prev.favorites, allowedWorkspaceSet),
        recentWorkspaces: sanitizedRecents,
        pinnedWorkspaces: sanitizedPinned,
      }));
    } catch {
      // Ignore malformed local storage payloads.
    }
  }, [allowedWorkspaceSet, storageKey]);

  useEffect(() => {
    setState((prev) => {
      const activeWorkspace = prev.activeWorkspace && allowedWorkspaceSet.has(prev.activeWorkspace) ? prev.activeWorkspace : null;
      const favorites = sanitizeWorkspaceIds(prev.favorites, allowedWorkspaceSet);
      const recentWorkspaces = sanitizeWorkspaceIds(prev.recentWorkspaces, allowedWorkspaceSet);
      const pinnedWorkspaces = sanitizeWorkspaceIds(prev.pinnedWorkspaces, allowedWorkspaceSet);

      if (
        activeWorkspace === prev.activeWorkspace &&
        favorites.length === prev.favorites.length &&
        recentWorkspaces.length === prev.recentWorkspaces.length &&
        pinnedWorkspaces.length === prev.pinnedWorkspaces.length
      ) {
        return prev;
      }

      return {
        ...prev,
        activeWorkspace,
        favorites,
        recentWorkspaces,
        pinnedWorkspaces,
      };
    });
  }, [allowedWorkspaceSet]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: WorkspaceState = {
      activeWorkspace: state.activeWorkspace,
      drawerMode: state.drawerMode,
      favorites: state.favorites,
      recentWorkspaces: state.recentWorkspaces,
      pinnedWorkspaces: state.pinnedWorkspaces,
      isCommandPaletteOpen: state.isCommandPaletteOpen,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [state, storageKey]);

  const openWorkspace = useCallback((id: WorkspaceId, mode?: DrawerMode) => {
    if (!allowedWorkspaceSet.has(id)) return;
    setState((prev) => ({
      ...prev,
      activeWorkspace: id,
      drawerMode: mode ?? (prev.drawerMode === "collapsed" ? "half" : prev.drawerMode),
      recentWorkspaces: uniquePush(prev.recentWorkspaces, id),
      isCommandPaletteOpen: false,
    }));
  }, [allowedWorkspaceSet]);

  const closeDrawer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      drawerMode: "collapsed",
      activeWorkspace: null,
      isCommandPaletteOpen: false,
    }));
  }, []);

  const setDrawerMode = useCallback((mode: DrawerMode) => {
    setState((prev) => ({ ...prev, drawerMode: mode }));
  }, []);

  const toggleFavorite = useCallback((id: WorkspaceId) => {
    if (!allowedWorkspaceSet.has(id)) return;
    setState((prev) => {
      const exists = prev.favorites.includes(id);
      const favorites = exists ? prev.favorites.filter((item) => item !== id) : [...prev.favorites, id];
      return { ...prev, favorites };
    });
  }, [allowedWorkspaceSet]);

  const pinWorkspace = useCallback((id: WorkspaceId) => {
    if (!allowedWorkspaceSet.has(id)) return;
    setState((prev) => {
      if (prev.pinnedWorkspaces.includes(id)) return prev;
      return { ...prev, pinnedWorkspaces: [...prev.pinnedWorkspaces, id] };
    });
  }, [allowedWorkspaceSet]);

  const unpinWorkspace = useCallback((id: WorkspaceId) => {
    setState((prev) => ({
      ...prev,
      pinnedWorkspaces: prev.pinnedWorkspaces.filter((item) => item !== id),
    }));
  }, []);

  const openCommandPalette = useCallback(() => {
    setState((prev) => ({ ...prev, isCommandPaletteOpen: true }));
  }, []);

  const closeCommandPalette = useCallback(() => {
    setState((prev) => ({ ...prev, isCommandPaletteOpen: false }));
  }, []);

  const value = useMemo<WorkspaceContextValue>(() => ({
    ...state,
    workspaceRole,
    availableWorkspaceIds,
    openWorkspace,
    closeDrawer,
    setDrawerMode,
    toggleFavorite,
    pinWorkspace,
    unpinWorkspace,
    openCommandPalette,
    closeCommandPalette,
  }), [state, workspaceRole, availableWorkspaceIds, openWorkspace, closeDrawer, setDrawerMode, toggleFavorite, pinWorkspace, unpinWorkspace, openCommandPalette, closeCommandPalette]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}

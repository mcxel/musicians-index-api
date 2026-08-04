/**
 * WorkspaceGeometryStore — persist window geometry + previousGeometry for RETURNING.
 * localStorage key per workspace id.
 */

import type { UniversalWorkspaceId, WorkspaceGeometry } from "./types";
import { getWorkspaceDef } from "./UniversalWorkspaceRegistry";

const STORAGE_PREFIX = "tmi.universalWorkspace.geometry.v1.";

export interface PersistedWorkspaceGeometry {
  geometry: WorkspaceGeometry;
  previousGeometry: WorkspaceGeometry | null;
  lastMode: "DOCKED" | "FLOATING" | "MAXIMIZED" | "FULLSCREEN" | "PICTURE_IN_PICTURE";
  updatedAt: number;
}

function storageKey(id: UniversalWorkspaceId): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function loadWorkspaceGeometry(
  id: UniversalWorkspaceId,
): PersistedWorkspaceGeometry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWorkspaceGeometry;
    if (!parsed?.geometry?.width || !parsed?.geometry?.height) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWorkspaceGeometry(
  id: UniversalWorkspaceId,
  data: Omit<PersistedWorkspaceGeometry, "updatedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedWorkspaceGeometry = {
      ...data,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(storageKey(id), JSON.stringify(payload));
  } catch {
    // Storage full / private mode — ignore.
  }
}

export function resolveOpenGeometry(id: UniversalWorkspaceId): {
  geometry: WorkspaceGeometry;
  previousGeometry: WorkspaceGeometry | null;
  preferredMode: PersistedWorkspaceGeometry["lastMode"];
} {
  const def = getWorkspaceDef(id);
  const saved = loadWorkspaceGeometry(id);
  if (!saved) {
    return {
      geometry: { ...def.defaultGeometry },
      previousGeometry: null,
      preferredMode: "FLOATING",
    };
  }
  return {
    geometry: { ...saved.geometry },
    previousGeometry: saved.previousGeometry ? { ...saved.previousGeometry } : null,
    preferredMode: saved.lastMode || "FLOATING",
  };
}

export function clampGeometry(
  geometry: WorkspaceGeometry,
  minWidth: number,
  minHeight: number,
): WorkspaceGeometry {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const width = Math.max(minWidth, Math.min(geometry.width, vw));
  const height = Math.max(minHeight, Math.min(geometry.height, vh));
  const x = Math.max(0, Math.min(geometry.x, Math.max(0, vw - 80)));
  const y = Math.max(0, Math.min(geometry.y, Math.max(0, vh - 80)));
  return { ...geometry, x, y, width, height };
}

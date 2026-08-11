/**
 * openCanonicalPresentation — hub quick launch → 4-zone surfaces.
 * Stops giant floating windows for canonical workspaces.
 */

import type { CommandCenterPanelId } from "@/components/commandCenter/commandCenterRegistry";
import { UNIVERSAL_WORKSPACE_DEFS } from "./UniversalWorkspaceRegistry";
import {
  useWorkspacePresentationStore,
  WORKSPACE_PRESENTATION_MAP,
  type WorkspaceSurface,
} from "./WorkspacePresentationRuntime";
import type { UniversalWorkspaceId } from "./types";

function resolveWorkspaceId(moduleId: CommandCenterPanelId | "appearance" | "settings"): UniversalWorkspaceId | "playlist-studio" | null {
  if (moduleId === "playlist") return "playlist-studio";
  if (moduleId === "appearance" || moduleId === "settings") return "settings";
  for (const def of Object.values(UNIVERSAL_WORKSPACE_DEFS)) {
    if (def.legacyDrawerId === moduleId) return def.id;
  }
  return null;
}

export function openCanonicalWorkspaceQuick(
  moduleId: CommandCenterPanelId | "appearance" | "settings",
  surfaceOverride?: WorkspaceSurface,
): UniversalWorkspaceId | null {
  const wsId = resolveWorkspaceId(moduleId);
  if (!wsId) return null;

  const config = WORKSPACE_PRESENTATION_MAP[wsId];
  const surface = surfaceOverride ?? config?.preferredSurface ?? "DRAWER";
  useWorkspacePresentationStore.getState().openInSurface(wsId, surface);
  return wsId;
}

export function openCanonicalDeepStudio(workspaceId: UniversalWorkspaceId): void {
  useWorkspacePresentationStore.getState().openDeepStudio(workspaceId);
}

export function isCanonicalWorkspaceActive(moduleId: CommandCenterPanelId): boolean {
  const state = useWorkspacePresentationStore.getState();
  const wsId = resolveWorkspaceId(moduleId);
  if (!wsId) return false;
  return (
    state.leftPanelWorkspace === wsId ||
    state.rightPanelWorkspace === wsId ||
    state.drawerWorkspace === wsId
  );
}

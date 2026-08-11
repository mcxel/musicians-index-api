/**
 * openCanonicalPresentation — hub quick launch → 4-zone / Media Console surfaces.
 * Stops giant floating windows for canonical HQ workspaces.
 */

import type { CommandCenterPanelId } from "@/components/commandCenter/commandCenterRegistry";
import { liveDiscoveryOverlayStore } from "@/lib/discovery/liveDiscoveryOverlayStore";
import { UNIVERSAL_WORKSPACE_DEFS } from "./UniversalWorkspaceRegistry";
import {
  useWorkspacePresentationStore,
  WORKSPACE_PRESENTATION_MAP,
  isFloatingException,
  type WorkspaceSurface,
} from "./WorkspacePresentationRuntime";
import { universalWorkspaceRuntime } from "./UniversalWorkspaceRuntime";
import type { UniversalWorkspaceId } from "./types";

function resolveWorkspaceId(
  moduleId: CommandCenterPanelId | "appearance" | "settings",
): UniversalWorkspaceId | null {
  if (moduleId === "playlist") return "playlist-studio";
  if (moduleId === "appearance" || moduleId === "settings") return "settings";
  for (const def of Object.values(UNIVERSAL_WORKSPACE_DEFS)) {
    if (def.legacyDrawerId === moduleId) return def.id;
  }
  return null;
}

/** Close LEGACY floating window if presentation store now owns this workspace. */
function suppressFloatingForCanonical(wsId: UniversalWorkspaceId): void {
  if (isFloatingException(wsId)) return;
  if (universalWorkspaceRuntime.isOpen(wsId)) {
    universalWorkspaceRuntime.close(wsId);
  }
}

/**
 * Open a workspace by UniversalWorkspaceId into the correct presentation surface.
 * Used by command-bus wire + hub quick launch (single authority path).
 */
export function presentCanonicalWorkspace(
  wsId: UniversalWorkspaceId,
  surfaceOverride?: WorkspaceSurface,
): WorkspaceSurface {
  const config = WORKSPACE_PRESENTATION_MAP[wsId];
  const surface = surfaceOverride ?? config?.preferredSurface ?? "DRAWER";

  if (surface === "DISCOVERY_WALL") {
    liveDiscoveryOverlayStore.open();
    useWorkspacePresentationStore.getState().openInSurface(wsId, "DISCOVERY_WALL");
    suppressFloatingForCanonical(wsId);
    return surface;
  }

  if (surface === "FLOATING") {
    // FLOATING_EXCEPTION — UniversalWorkspaceRuntime owns the shell
    universalWorkspaceRuntime.open(wsId);
    return surface;
  }

  useWorkspacePresentationStore.getState().openInSurface(wsId, surface);
  suppressFloatingForCanonical(wsId);
  return surface;
}

export function openCanonicalWorkspaceQuick(
  moduleId: CommandCenterPanelId | "appearance" | "settings",
  surfaceOverride?: WorkspaceSurface,
): UniversalWorkspaceId | null {
  const wsId = resolveWorkspaceId(moduleId);
  if (!wsId) return null;
  presentCanonicalWorkspace(wsId, surfaceOverride);
  return wsId;
}

export function openCanonicalDeepStudio(workspaceId: UniversalWorkspaceId): void {
  const config = WORKSPACE_PRESENTATION_MAP[workspaceId];
  const deep = config?.deepSurface ?? "DRAWER";
  presentCanonicalWorkspace(workspaceId, deep);
}

export function isCanonicalWorkspaceActive(moduleId: CommandCenterPanelId): boolean {
  const state = useWorkspacePresentationStore.getState();
  const wsId = resolveWorkspaceId(moduleId);
  if (!wsId) return false;
  if (wsId === "lobby" || wsId === "live-destinations") {
    return liveDiscoveryOverlayStore.getState().isOpen;
  }
  return (
    state.leftPanelWorkspace === wsId ||
    state.rightPanelWorkspace === wsId ||
    state.drawerWorkspace === wsId
  );
}

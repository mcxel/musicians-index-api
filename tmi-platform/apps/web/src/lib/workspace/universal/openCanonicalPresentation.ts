/**
 * openCanonicalPresentation — hub quick launch → 4-zone / Media Console surfaces.
 * Stops giant floating windows for canonical HQ workspaces.
 */

import type { CommandCenterPanelId } from "@/components/commandCenter/commandCenterRegistry";
import { UNIVERSAL_WORKSPACE_DEFS } from "./UniversalWorkspaceRegistry";
import {
  useWorkspacePresentationStore,
  WORKSPACE_PRESENTATION_MAP,
  isFloatingException,
  type WorkspaceSurface,
} from "./WorkspacePresentationRuntime";
import { universalWorkspaceRuntime } from "./UniversalWorkspaceRuntime";
import type { UniversalWorkspaceId } from "./types";

function isProofDiagnosticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("proof") === "1";
  } catch {
    return false;
  }
}

function tracePresenter(action: string, payload?: unknown): void {
  if (process.env.NODE_ENV !== "development" && !isProofDiagnosticsEnabled()) return;
  if (typeof window !== "undefined") {
    const w = window as Window & { __TMI_PRESENTER_TRACE__?: Array<unknown> };
    const current = w.__TMI_PRESENTER_TRACE__ ?? [];
    current.push({ action, payload, timestamp: performance.now() });
    if (current.length > 200) current.shift();
    w.__TMI_PRESENTER_TRACE__ = current;
  }
  console.debug("[TMI:PRESENTER]", { action, payload });
}

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

function isPhoneViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
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
  const preferred = surfaceOverride ?? config?.preferredSurface ?? "DRAWER";
  // Phone Command Center: all HQ tools go DRAWER → WORK. Side panels only exist on desktop.
  const surface =
    isPhoneViewport() && preferred !== "FLOATING"
      ? "DRAWER"
      : preferred;
  tracePresenter("CALL_CANONICAL_PRESENTER", {
    workspaceId: wsId,
    surfaceOverride: surfaceOverride ?? null,
    resolvedSurface: surface,
    mobileShellMode: config?.mobileShellMode ?? null,
    phoneViewport: isPhoneViewport(),
  });

  // Omni Rolodex: never open the floating Live Lobby overlay for HQ workspaces.
  // DISCOVERY_WALL callers converge into the in-place bottom drawer.
  if (surface === "DISCOVERY_WALL") {
    useWorkspacePresentationStore.getState().openInSurface(wsId, "DRAWER");
    suppressFloatingForCanonical(wsId);
    return "DRAWER";
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
  return (
    state.leftPanelWorkspace === wsId ||
    state.rightPanelWorkspace === wsId ||
    state.drawerWorkspace === wsId
  );
}

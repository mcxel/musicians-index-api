/**
 * executeQuickLaunchWorkspace — idempotent open into canonical presentation.
 *
 * LEGACY note: previously opened UniversalWorkspaceWindow (FLOATING overlay).
 * HQ modules now route through presentCanonicalWorkspace (Media Console / L/R / Discovery).
 * FLOATING_EXCEPTION (e.g. share-studio) still uses UniversalWorkspaceRuntime.
 */

import { presentCanonicalWorkspace } from "./openCanonicalPresentation";
import { isFloatingException } from "./WorkspacePresentationRuntime";
import { universalWorkspaceRuntime } from "./UniversalWorkspaceRuntime";
import type { UniversalWorkspaceId, WorkspaceContext } from "./types";

export function executeQuickLaunchWorkspace(
  workspaceId: UniversalWorkspaceId,
  context?: WorkspaceContext,
): void {
  if (typeof window === "undefined") return;

  if (isFloatingException(workspaceId)) {
    if (universalWorkspaceRuntime.isOpen(workspaceId)) {
      universalWorkspaceRuntime.focus(workspaceId);
      return;
    }
    universalWorkspaceRuntime.open(workspaceId, context);
    return;
  }

  presentCanonicalWorkspace(workspaceId);
}

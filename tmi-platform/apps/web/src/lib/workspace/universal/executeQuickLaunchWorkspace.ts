/**
 * executeQuickLaunchWorkspace — idempotent open / restore / bring-forward.
 * Does not reflow monitor stack (overlay-only Universal Workspace Window).
 */

import { universalWorkspaceRuntime } from "./UniversalWorkspaceRuntime";
import type { UniversalWorkspaceId, WorkspaceContext } from "./types";

export function executeQuickLaunchWorkspace(
  workspaceId: UniversalWorkspaceId,
  context?: WorkspaceContext,
): void {
  if (typeof window === "undefined") return;
  if (universalWorkspaceRuntime.isOpen(workspaceId)) {
    universalWorkspaceRuntime.focus(workspaceId);
    return;
  }
  universalWorkspaceRuntime.open(workspaceId, context);
}

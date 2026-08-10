"use client";

/**
 * Open YoPho in the Command Center universal workspace (no /fan/canvas route hop).
 */

import { universalWorkspaceRuntime } from "@/lib/workspace/universal/UniversalWorkspaceRuntime";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import type { CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";

export function openYoPhoUniversalWorkspace(role: CommandCenterRole, userId?: string): void {
  const wsId = "yopho" as const;
  if (universalWorkspaceRuntime.isOpen(wsId)) {
    universalWorkspaceRuntime.focus(wsId);
  } else {
    universalWorkspaceRuntime.open(wsId);
  }
  livingOsCommandBus.executeAction("ACTION_OPEN_YOPHO_STUDIO", {
    role,
    userId,
    payload: { workspaceId: wsId },
  });
  livingOsCommandBus.dispatch({
    type: "WORKSPACE_OPENED",
    category: "navigation",
    role,
    userId,
    payload: { workspaceId: wsId, panelId: "yopho" },
  });
}

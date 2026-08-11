/**
 * hubQuickLaunch — one press opens workspace (Living OS quick launch, locked 2026-08-10).
 * Resolves drawer module → Universal Workspace Window, playlist-studio, floating panel,
 * or under-monitor drawer (single click — never select-then-OPEN).
 */

import type { CommandCenterPanelId, CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";
import { UNIVERSAL_WORKSPACE_DEFS } from "@/lib/workspace/universal/UniversalWorkspaceRegistry";
import { universalWorkspaceRuntime } from "@/lib/workspace/universal/UniversalWorkspaceRuntime";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import type { ActionId } from "@/lib/os/universalActionRegistry";
import { floatingWorkspaceStore } from "@/lib/workspace/floatingWorkspaceStore";
import type { FloatingWorkspaceModuleId } from "@/lib/workspace/FloatingWorkspaceModules";
import { executeQuickLaunchWorkspace } from "@/lib/workspace/universal/executeQuickLaunchWorkspace";
import { openCanonicalWorkspaceQuick, isCanonicalWorkspaceActive } from "@/lib/workspace/universal/openCanonicalPresentation";

const DRAWER_TO_FLOATING: Partial<Record<CommandCenterPanelId, FloatingWorkspaceModuleId>> = {
  memory: "memory_wall",
  inventory: "avatar_inventory",
  messaging: "messages",
  lobby: "fan_lobby",
};

/** Stable map for certification docs — drawer module → workspace id (null = drawer/floating only). */
export const HUB_QUICK_LAUNCH_WORKSPACE_MAP: Record<string, UniversalWorkspaceId | "playlist-studio" | null> =
  (() => {
    const out: Record<string, UniversalWorkspaceId | "playlist-studio" | null> = {
      playlist: "playlist-studio",
      appearance: null,
    };
    for (const def of Object.values(UNIVERSAL_WORKSPACE_DEFS)) {
      if (def.legacyDrawerId) {
        out[def.legacyDrawerId] = def.id;
      }
    }
    return out;
  })();

export function resolveUniversalWorkspaceIdForDrawerModule(
  moduleId: CommandCenterPanelId | "appearance",
): UniversalWorkspaceId | "playlist-studio" | null {
  if (moduleId === "playlist") return "playlist-studio";
  if (moduleId === "appearance") return "settings";
  const mapped = HUB_QUICK_LAUNCH_WORKSPACE_MAP[moduleId];
  if (mapped !== undefined) return mapped;
  for (const def of Object.values(UNIVERSAL_WORKSPACE_DEFS)) {
    if (def.legacyDrawerId === moduleId) return def.id;
  }
  return null;
}

export function isUniversalWorkspaceOpenForModule(moduleId: CommandCenterPanelId): boolean {
  if (isCanonicalWorkspaceActive(moduleId)) return true;
  const wsId = resolveUniversalWorkspaceIdForDrawerModule(moduleId);
  if (!wsId || wsId === "playlist-studio") {
    return wsId === "playlist-studio" && universalWorkspaceRuntime.isOpen("playlist-studio");
  }
  return universalWorkspaceRuntime.isOpen(wsId);
}

export interface HubQuickLaunchOptions {
  moduleId: CommandCenterPanelId | "appearance";
  role: CommandCenterRole;
  userId?: string;
  actionId?: ActionId;
  /** Opens under-monitor drawer when no universal workspace exists (still one click). */
  openDrawer: (id: CommandCenterPanelId) => void;
  openAppearance: () => void;
  /** Clears bottom drawer when a floating/universal overlay owns the surface. */
  closeDrawer: () => void;
}

export function openHubQuickLaunch(opts: HubQuickLaunchOptions): void {
  const { moduleId, role, userId, actionId, openDrawer, openAppearance, closeDrawer } = opts;

  if (moduleId === "appearance") {
    closeDrawer();
    openCanonicalWorkspaceQuick("appearance", "DRAWER");
    return;
  }

  if (actionId) {
    livingOsCommandBus.executeAction(actionId, {
      role,
      userId,
      payload: { panelId: moduleId },
    });
  }

  const canonicalOpened = openCanonicalWorkspaceQuick(moduleId);
  if (canonicalOpened) {
    closeDrawer();
    livingOsCommandBus.dispatch({
      type: "WORKSPACE_OPENED",
      category: "navigation",
      role,
      userId,
      payload: { workspaceId: canonicalOpened, panelId: moduleId },
    });
    return;
  }

  const wsId = resolveUniversalWorkspaceIdForDrawerModule(moduleId);
  if (wsId && wsId !== "playlist-studio") {
    closeDrawer();
    executeQuickLaunchWorkspace(wsId);
    livingOsCommandBus.dispatch({
      type: "WORKSPACE_OPENED",
      category: "navigation",
      role,
      userId,
      payload: { workspaceId: wsId, panelId: moduleId },
    });
    return;
  }

  const floatingId = DRAWER_TO_FLOATING[moduleId];
  if (floatingId) {
    closeDrawer();
    floatingWorkspaceStore.setRole(role === "performer" ? "PERFORMER" : "FAN");
    floatingWorkspaceStore.open(floatingId);
    return;
  }

  openDrawer(moduleId);
}

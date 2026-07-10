import type { WorkspaceDefinition, WorkspacePermission, WorkspaceRole } from "./WorkspaceSchema";

const ROLE_PERMISSIONS: Record<WorkspaceRole, Set<WorkspacePermission>> = {
  marcel: new Set<WorkspacePermission>([
    "founder.override",
    "ai.executive",
    "revenue.manage",
    "security.manage",
    "automation.manage",
    "media.manage",
    "queue.manage",
    "deployment.manage",
    "music.manage",
  ]),
  bigace: new Set<WorkspacePermission>([
    "ai.executive",
    "revenue.manage",
    "security.manage",
    "automation.manage",
    "media.manage",
    "queue.manage",
    "deployment.manage",
    "music.manage",
  ]),
  jaypaul: new Set<WorkspacePermission>([
    "music.manage",
    "media.manage",
    "queue.manage",
  ]),
  justin: new Set<WorkspacePermission>(["read.only"]),
  michaelcharlie: new Set<WorkspacePermission>([
    "automation.manage",
    "media.manage",
    "queue.manage",
    "deployment.manage",
    "security.manage",
  ]),
  legal: new Set<WorkspacePermission>([
    "read.only",
  ]),
};

const panelIsAllowed = (role: WorkspaceRole, permission?: WorkspacePermission) => {
  if (!permission) return true;
  return ROLE_PERMISSIONS[role].has(permission);
};

export function filterWorkspaceByPermissions(
  workspace: WorkspaceDefinition,
  role: WorkspaceRole,
): WorkspaceDefinition {
  const filterPanels = <T extends { requiredPermission?: WorkspacePermission }>(panels: T[]) =>
    panels.filter((panel) => panelIsAllowed(role, panel.requiredPermission));

  return {
    ...workspace,
    leftRail: filterPanels(workspace.leftRail),
    center: filterPanels(workspace.center),
    rightRail: filterPanels(workspace.rightRail),
    bottom: filterPanels(workspace.bottom),
  };
}

export function listPermissions(role: WorkspaceRole): WorkspacePermission[] {
  return Array.from(ROLE_PERMISSIONS[role]);
}

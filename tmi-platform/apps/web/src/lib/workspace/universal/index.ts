/**
 * Universal Workspace Window — public exports (canonical owner).
 */

export type {
  UniversalWorkspaceId,
  WorkspaceContext,
  WorkspaceDockSide,
  WorkspaceGeometry,
  WorkspaceInstanceState,
  WorkspaceSnapZone,
  WorkspaceWindowState,
  UniversalWorkspaceDef,
} from "./types";

export { UNIVERSAL_WORKSPACE_DEFS, getWorkspaceDef, listPhase1Workspaces } from "./UniversalWorkspaceRegistry";

export {
  universalWorkspaceRuntime,
  useUniversalWorkspace,
  useUniversalWorkspaceStore,
} from "./UniversalWorkspaceRuntime";

export { WorkspaceTransitionRuntime, getWorkspaceMotion } from "./WorkspaceTransitionRuntime";
export { wireUniversalWorkspaceCommandBus } from "./wireUniversalWorkspaceCommandBus";
export { executeQuickLaunchWorkspace } from "./executeQuickLaunchWorkspace";
export {
  loadWorkspaceGeometry,
  saveWorkspaceGeometry,
  resolveOpenGeometry,
} from "./WorkspaceGeometryStore";

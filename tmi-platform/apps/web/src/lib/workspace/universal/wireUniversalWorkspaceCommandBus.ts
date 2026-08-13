/**
 * wireUniversalWorkspaceCommandBus — Command Bus → presentation authority.
 *
 * HQ modules → WorkspacePresentationRuntime (Media Console DrawerDock / L/R / Discovery).
 * FLOATING_EXCEPTION only → UniversalWorkspaceRuntime (LEGACY movable window).
 *
 * Previously every WORKSPACE_OPENED called universalWorkspaceRuntime.open() → FLOATING,
 * which overwrote the 4-zone path and showed the "FLOATING" chrome Marcel screenshotted.
 */

import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import { universalWorkspaceRuntime } from "./UniversalWorkspaceRuntime";
import { presentCanonicalWorkspace, openCanonicalDeepStudio } from "./openCanonicalPresentation";
import { isFloatingException, resolvePreferredSurface } from "./WorkspacePresentationRuntime";
import type { UniversalWorkspaceId, WorkspaceContext } from "./types";

let wired = false;

function asContext(payload?: Record<string, unknown>): WorkspaceContext {
  if (!payload) return {};
  return {
    trackId: typeof payload.trackId === "string" ? payload.trackId : undefined,
    trackTitle: typeof payload.trackTitle === "string" ? payload.trackTitle : undefined,
    artistName: typeof payload.artistName === "string" ? payload.artistName : undefined,
    playlistId: typeof payload.playlistId === "string" ? payload.playlistId : undefined,
    playlistTitle:
      typeof payload.playlistTitle === "string" ? payload.playlistTitle : undefined,
    sharePath: typeof payload.sharePath === "string" ? payload.sharePath : undefined,
    linkUrl: typeof payload.linkUrl === "string" ? payload.linkUrl : undefined,
  };
}

function openViaPresentation(workspaceId: UniversalWorkspaceId, context?: WorkspaceContext): void {
  if (isFloatingException(workspaceId)) {
    universalWorkspaceRuntime.open(workspaceId, context);
    return;
  }
  const surface = resolvePreferredSurface(workspaceId);
  if (surface === "FLOATING") {
    universalWorkspaceRuntime.open(workspaceId, context);
    return;
  }
  presentCanonicalWorkspace(workspaceId);
}

export function wireUniversalWorkspaceCommandBus(): () => void {
  if (wired) return () => undefined;
  wired = true;

  const unsubs = [
    livingOsCommandBus.on("WORKSPACE_OPENED", (cmd) => {
      const actionId = cmd.payload?.actionId;
      const context = asContext(cmd.payload);
      if (actionId === "ACTION_OPEN_PLAYLIST_STUDIO") {
        openViaPresentation("playlist-studio", context);
        return;
      }
      if (actionId === "ACTION_OPEN_SHARE_STUDIO") {
        openViaPresentation("share-studio", context);
        return;
      }
      const workspaceId = cmd.payload?.workspaceId;
      if (typeof workspaceId === "string") {
        openViaPresentation(workspaceId as UniversalWorkspaceId, context);
      }
    }),
    livingOsCommandBus.on("WORKSPACE_CLOSED", (cmd) => {
      const workspaceId = cmd.payload?.workspaceId;
      if (typeof workspaceId === "string") {
        universalWorkspaceRuntime.close(workspaceId as UniversalWorkspaceId);
      }
    }),
  ];

  return () => {
    for (const u of unsubs) u();
    wired = false;
  };
}

/** @deprecated Use presentCanonicalWorkspace — kept for call sites that imported deep open. */
export function openDeepViaWire(workspaceId: UniversalWorkspaceId): void {
  openCanonicalDeepStudio(workspaceId);
}

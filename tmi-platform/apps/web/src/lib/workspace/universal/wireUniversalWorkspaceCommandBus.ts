/**
 * wireUniversalWorkspaceCommandBus — Command Bus → Universal Workspace Runtime.
 *
 * SHARE / playlist open paths:
 *   ACTION_OPEN_SHARE_STUDIO    → open("share-studio", context)
 *   ACTION_OPEN_PLAYLIST_STUDIO → open("playlist-studio", context)
 *   ACTION_CLOSE_WORKSPACE      → close(payload.workspaceId)
 *
 * Legacy DRAWER_OPENED with panelId playlist from Flight Deck should prefer
 * ACTION_OPEN_PLAYLIST_STUDIO (this wire). Under-monitor drawers stay on DRAWER_*.
 */

import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import { universalWorkspaceRuntime } from "./UniversalWorkspaceRuntime";
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

export function wireUniversalWorkspaceCommandBus(): () => void {
  if (wired) return () => undefined;
  wired = true;

  const unsubs = [
    livingOsCommandBus.on("WORKSPACE_OPENED", (cmd) => {
      const actionId = cmd.payload?.actionId;
      const context = asContext(cmd.payload);
      if (actionId === "ACTION_OPEN_PLAYLIST_STUDIO") {
        universalWorkspaceRuntime.open("playlist-studio", context);
        return;
      }
      if (actionId === "ACTION_OPEN_SHARE_STUDIO") {
        universalWorkspaceRuntime.open("share-studio", context);
        return;
      }
      const workspaceId = cmd.payload?.workspaceId;
      if (typeof workspaceId === "string") {
        universalWorkspaceRuntime.open(workspaceId as UniversalWorkspaceId, context);
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

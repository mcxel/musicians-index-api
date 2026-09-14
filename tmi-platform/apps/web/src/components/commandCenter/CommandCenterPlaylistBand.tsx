"use client";

/**
 * Persistent playlist library band — sits immediately below the cyan/gold dock boundary.
 * Compact by default; expands to full Playlist Canister when playlist drawer is active.
 * Single audio owner (PlaylistCanister) — playback continues across expand/collapse.
 */

import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import { useTheme } from "@/lib/design/ThemeEngine";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import type { CommandCenterRole } from "./commandCenterRegistry";

export interface CommandCenterPlaylistBandProps {
  role: CommandCenterRole;
  userId: string;
  displayName: string;
  expanded: boolean;
  initialPlaylistId?: string | null;
  onCollapse?: () => void;
}

export default function CommandCenterPlaylistBand({
  role,
  userId,
  displayName,
  expanded,
  initialPlaylistId = null,
  onCollapse,
}: CommandCenterPlaylistBandProps) {
  const theme = useTheme();
  const drawerWorkspace = useWorkspacePresentationStore((s) => s.drawerWorkspace);
  const bottomDrawerOwnsPlaylist = drawerWorkspace === "playlist-studio";

  return (
    <section
      data-playlist-library-band
      data-playlist-expanded={expanded ? "true" : "false"}
      data-bottom-drawer-owns-playlist={bottomDrawerOwnsPlaylist ? "true" : "false"}
      style={{
        flexShrink: 0,
        width: "100%",
        padding: "6px 8px 8px",
        background: "rgba(3, 3, 14, 0.92)",
        borderLeft: `1px solid ${theme.primary}22`,
        borderRight: `1px solid ${theme.primary}22`,
        borderBottom: `1px solid ${theme.primary}22`,
      }}
    >
      {bottomDrawerOwnsPlaylist ? (
        /* Structural Single Mount: Bottom Drawer owns the full Playlist Canister.
           The band remains as the continuity chrome without mounting a second PlaylistCanister. */
        <div
          data-playlist-band-continuity
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px",
            background: "rgba(0, 229, 255, 0.04)",
            border: `1px solid ${theme.primary}33`,
            borderRadius: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: theme.primary }}>
              🎵 PLAYLIST CANISTER ACTIVE IN RESERVED BOTTOM DRAWER
            </span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
              (Single media playback authority preserved)
            </span>
          </div>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              style={{
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.08em",
                padding: "3px 8px",
                borderRadius: 4,
                border: `1px solid ${theme.secondary}66`,
                background: "rgba(255,255,255,0.04)",
                color: theme.secondary,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              CLOSE DRAWER
            </button>
          ) : null}
        </div>
      ) : (
        /* When bottom drawer is closed or displaying another tool, band mounts compact canister */
        <>
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 4,
              padding: "0 4px",
            }}
          >
            PLAYLIST LIBRARY
          </div>
          <PlaylistCanister
            entityId={userId}
            entityName={displayName}
            isOwner
            role={role === "performer" ? "performer" : "fan"}
            accentColor={theme.primary}
            initialPlaylistId={initialPlaylistId}
            layout="compact"
          />
        </>
      )}
    </section>
  );
}

"use client";

/**
 * Persistent playlist library band — sits immediately below the cyan/gold dock boundary.
 * Compact by default; expands to full Playlist Canister when playlist drawer is active.
 * Single audio owner (PlaylistCanister) — playback continues across expand/collapse.
 */

import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import { useTheme } from "@/lib/design/ThemeEngine";
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

  return (
    <section
      data-playlist-library-band
      data-playlist-expanded={expanded ? "true" : "false"}
      style={{
        flexShrink: 0,
        width: "100%",
        padding: expanded ? "10px 8px 12px" : "8px 8px 10px",
        background: "rgba(3, 3, 14, 0.92)",
        borderLeft: `1px solid ${theme.primary}22`,
        borderRight: `1px solid ${theme.primary}22`,
        borderBottom: `1px solid ${theme.primary}22`,
      }}
    >
      {expanded ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            padding: "0 4px",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: theme.primary,
            }}
          >
            PLAYLIST CANISTER · FULL EXPANSION
          </span>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.08em",
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${theme.secondary}66`,
                background: "rgba(255,255,255,0.04)",
                color: theme.secondary,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              COLLAPSE LIBRARY
            </button>
          ) : null}
        </div>
      ) : (
        <div
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 6,
            padding: "0 4px",
          }}
        >
          PLAYLIST LIBRARY
        </div>
      )}
      <PlaylistCanister
        entityId={userId}
        entityName={displayName}
        isOwner
        role={role === "performer" ? "performer" : "fan"}
        accentColor={theme.primary}
        initialPlaylistId={initialPlaylistId}
        layout={expanded ? "full" : "compact"}
      />
    </section>
  );
}

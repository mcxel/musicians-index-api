"use client";

/**
 * CanonicalBottomDrawerHost — Media Console DrawerDock.
 * Attached under PersistentMediaInteractionDock (mini player). One activeDrawer at a time.
 * Stage geometry must not reflow when this opens/closes/swaps (document-flow under media band).
 */

import React from "react";
import dynamic from "next/dynamic";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import PlaylistStudioContent from "./PlaylistStudioContent";
import SettingsWorkspaceContent from "./SettingsWorkspaceContent";
import ShareStudioContent from "./ShareStudioContent";
import UniversalWorkspaceStubContent from "./UniversalWorkspaceStubContent";

const FanAvatarCanister = dynamic(() => import("@/components/avatar/FanAvatarCanister"), { ssr: false });
const LiveLobbyWallContent = dynamic(
  () => import("@/components/lobby/LiveLobbyDrawer").then((m) => ({ default: m.LiveLobbyWallContent })),
  { ssr: false, loading: () => <div style={{ padding: 24, color: "rgba(255,255,255,0.35)" }}>Loading lobby wall…</div> },
);

export default function CanonicalBottomDrawerHost({
  userId,
  displayName,
  role,
}: {
  userId?: string;
  displayName?: string;
  role: "fan" | "performer";
}) {
  const { drawerWorkspace, isDrawerExpanded, mediaConsoleMode, closeSurface, toggleDrawerExpand } =
    useWorkspacePresentationStore();

  if (!drawerWorkspace || !isDrawerExpanded) return null;

  const uid = userId ?? "session";
  const name = displayName ?? "Member";
  const expandedPlaylist = drawerWorkspace === "playlist-studio" && mediaConsoleMode === "expanded";
  const isLobbyWall = drawerWorkspace === "lobby" || drawerWorkspace === "live-destinations";
  const maxHeight = expandedPlaylist ? "min(72vh, 700px)" : isLobbyWall ? "min(72vh, 700px)" : "min(60vh, 620px)";
  const minHeight = expandedPlaylist ? 400 : isLobbyWall ? 480 : 380;

  return (
    <div
      data-canonical-bottom-drawer
      data-media-console-drawer
      data-active-drawer={drawerWorkspace}
      data-media-console-mode={mediaConsoleMode}
      style={{
        width: "100%",
        flexShrink: 0,
        marginTop: 0,
        background: "rgba(6, 9, 24, 0.98)",
        border: "1px solid rgba(0, 229, 255, 0.3)",
        borderTop: "none",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.85), inset 0 1px 0 rgba(0,229,255,0.2)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          background: "rgba(10, 16, 38, 0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#00FFFF", fontSize: 12 }}>▾</span>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 11,
              fontWeight: 900,
              color: "#FFD700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            MEDIA CONSOLE · {drawerWorkspace.replace(/-/g, " ")}
          </span>
          <span
            style={{
              fontSize: 8,
              fontWeight: 800,
              color: "rgba(0,255,255,0.55)",
              letterSpacing: "0.08em",
            }}
          >
            {mediaConsoleMode === "expanded" ? "EXPANDED" : "MINI + DOCK"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={toggleDrawerExpand}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              color: "#fff",
              fontSize: 9,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            {isDrawerExpanded ? "COLLAPSE" : "EXPAND"}
          </button>
          <button
            type="button"
            onClick={() => closeSurface("DRAWER")}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ padding: 16, minHeight, maxHeight, overflowY: "auto" }}>
        {drawerWorkspace === "playlist-studio" ? (
          <PlaylistStudioContent userId={uid} context={{}} />
        ) : drawerWorkspace === "share-studio" ? (
          <ShareStudioContent context={{ sharePath: typeof window !== "undefined" ? window.location.pathname : "/" }} />
        ) : drawerWorkspace === "settings" ? (
          <SettingsWorkspaceContent userId={uid} displayName={name} />
        ) : drawerWorkspace === "inventory" && role === "fan" ? (
          <FanAvatarCanister userId={uid} displayName={name} role="FAN" />
        ) : isLobbyWall ? (
          <LiveLobbyWallContent />
        ) : (
          <UniversalWorkspaceStubContent
            workspaceId={drawerWorkspace}
            role={role}
            userId={uid}
            displayName={name}
          />
        )}
      </div>
    </div>
  );
}

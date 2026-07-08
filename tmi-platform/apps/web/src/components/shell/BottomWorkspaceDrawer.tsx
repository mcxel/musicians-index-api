"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import { getWorkspaceRegistry, renderWorkspaceContentForRole } from "@/components/shell/workspaceRegistry";
import type { DrawerMode, WorkspaceId } from "@/components/shell/workspaceTypes";
import { TmiMotionPanel, type TmiMotionPanelType } from "@/components/motion/TmiMotionPanel";

const HEADER_HEIGHT = 72;

function MiniMusicPlayer() {
  const [playing, setPlaying] = useState(true);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, minWidth: 200 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "linear-gradient(135deg, rgba(170,45,255,0.5), rgba(0,255,255,0.25))",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        🎵
      </div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontSize: 9, color: "rgba(245,239,255,0.55)", letterSpacing: "0.06em" }}>NOW PLAYING</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#f4f1ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
          Hustle &amp; Flow
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button type="button" aria-label="Previous track" style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer" }}>⏮</button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((p) => !p)}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,255,255,0.85)",
            color: "#04142a",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button type="button" aria-label="Next track" style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer" }}>⏭</button>
      </div>
    </div>
  );
}

function TelemetryStrip() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <button
        type="button"
        aria-label="Screenshot"
        title="Screenshot"
        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#f4f1ff", fontSize: 13, cursor: "pointer" }}
      >
        📷
      </button>
      <button
        type="button"
        aria-label="Record"
        title="Record"
        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#f4f1ff", fontSize: 13, cursor: "pointer" }}
      >
        ⏺
      </button>
      <button
        type="button"
        aria-label="Share"
        title="Share"
        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#f4f1ff", fontSize: 13, cursor: "pointer" }}
      >
        🔗
      </button>
      <div
        style={{
          borderRadius: 999,
          border: "1px solid rgba(255,215,0,0.4)",
          background: "rgba(255,215,0,0.08)",
          color: "#FFD700",
          fontSize: 10,
          fontWeight: 800,
          padding: "5px 9px",
        }}
      >
        4K
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          borderRadius: 999,
          border: "1px solid rgba(0,255,136,0.35)",
          background: "rgba(0,255,136,0.08)",
          color: "#7dffb8",
          fontSize: 10,
          fontWeight: 800,
          padding: "5px 9px",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88aa" }} />
        Perfect Connection
      </div>
    </div>
  );
}

function getHeightForMode(mode: DrawerMode): string {
  switch (mode) {
    case "collapsed":
      return "70px";
    case "peek":
      return "120px";
    case "half":
      return "50vh";
    case "fullscreen":
      return `calc(100vh - ${HEADER_HEIGHT}px)`;
    default:
      return "70px";
  }
}

function nextExpandMode(mode: DrawerMode): DrawerMode {
  if (mode === "collapsed") return "peek";
  if (mode === "peek") return "half";
  if (mode === "half") return "fullscreen";
  return "collapsed";
}

export function BottomWorkspaceDrawer() {
  const {
    activeWorkspace,
    drawerMode,
    favorites,
    availableWorkspaceIds,
    workspaceRole,
    openWorkspace,
    closeDrawer,
    setDrawerMode,
    toggleFavorite,
    openCommandPalette,
  } = useWorkspace();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const registry = useMemo(() => {
    const allowed = new Set(availableWorkspaceIds);
    return getWorkspaceRegistry().filter((workspace) => allowed.has(workspace.id));
  }, [availableWorkspaceIds]);
  const allowedWorkspaceSet = useMemo(() => new Set<WorkspaceId>(availableWorkspaceIds), [availableWorkspaceIds]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "escape") {
        closeDrawer();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        openCommandPalette();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDrawer, openCommandPalette]);

  useEffect(() => {
    if (drawerMode !== "fullscreen") return;
    const container = rootRef.current;
    if (!container) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [drawerMode]);

  const content = activeWorkspace && allowedWorkspaceSet.has(activeWorkspace)
    ? renderWorkspaceContentForRole(activeWorkspace, workspaceRole)
    : null;
  const isExpanded = drawerMode !== "collapsed";

  const panelType: TmiMotionPanelType =
    activeWorkspace === "memory-wall" ? "memoryWall"
      : activeWorkspace === "playlists" ? "playlist"
      : activeWorkspace === "inventory" ? "inventory"
      : activeWorkspace === "lobby-wall" ? "lobbyWall"
      : activeWorkspace === "settings" ? "settings"
      : activeWorkspace === "messages" ? "messages"
      : activeWorkspace === "store" ? "store"
      : activeWorkspace === "camera" ? "camera"
      : "rewards";

  const panelSide: "left" | "right" | "bottom" | "center" =
    activeWorkspace === "memory-wall" ? "right"
      : activeWorkspace === "playlists" ? "left"
      : activeWorkspace === "lobby-wall" ? "center"
      : "bottom";

  const drawerStyle: React.CSSProperties = {
    position: "fixed",
    left: 22,
    right: 22,
    bottom: 14,
    zIndex: 80,
    height: getHeightForMode(drawerMode),
    transition: "height 220ms ease, box-shadow 220ms ease, background-color 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
    background: "rgba(4, 6, 20, 0.86)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    borderRadius: 18,
    // Detached "floating cabinet drawer" feel — no longer flush against the
    // viewport edge or sharing a border with the left/right rails.
    boxShadow: isExpanded
      ? "0 24px 56px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.05)"
      : "0 12px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.04)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    color: "#e7e8ff",
  };

  return (
    <div ref={rootRef} style={drawerStyle} aria-label="Workspace drawer" role="region">
      <div
        style={{
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => setDrawerMode(nextExpandMode(drawerMode))}
          aria-label="Expand or collapse drawer"
          style={{
            border: "none",
            background: "transparent",
            color: "#d6b5ff",
            fontSize: 16,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          {drawerMode === "collapsed" ? "▲" : drawerMode === "fullscreen" ? "▼" : "▲"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <MiniMusicPlayer />

        <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", flex: 1, minWidth: 0 }}>
          {registry.map((workspace) => {
            const isActive = activeWorkspace === workspace.id;
            return (
              <button
                key={workspace.id}
                type="button"
                onClick={() => openWorkspace(workspace.id, "half")}
                aria-label={`Open ${workspace.label}`}
                title={workspace.label}
                style={{
                  minWidth: 42,
                  height: 42,
                  borderRadius: 12,
                  border: isActive ? "1px solid rgba(0, 255, 255, 0.55)" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: isActive ? "rgba(0, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.04)",
                  color: "#f6ecff",
                  fontSize: 18,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {workspace.icon}
              </button>
            );
          })}
        </div>

        <TelemetryStrip />
      </div>

      {favorites.length > 0 && drawerMode !== "collapsed" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            overflowX: "auto",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(239, 235, 255, 0.74)", whiteSpace: "nowrap" }}>Favorites:</span>
          {favorites.filter((id) => allowedWorkspaceSet.has(id)).map((id) => (
            <FavoriteChip key={id} id={id} activeWorkspace={activeWorkspace} onOpen={openWorkspace} onToggle={toggleFavorite} />
          ))}
        </div>
      )}

      {drawerMode !== "collapsed" && (
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 12 }}>
          <TmiMotionPanel motionType={panelType} side={panelSide} isVisible>
            {content ?? (
              <div
                style={{
                  borderRadius: 14,
                  border: "1px dashed rgba(255, 255, 255, 0.22)",
                  padding: 18,
                  color: "rgba(239, 235, 255, 0.74)",
                }}
              >
                Select a workspace icon to open content in this drawer.
              </div>
            )}
          </TmiMotionPanel>
        </div>
      )}
    </div>
  );
}

function FavoriteChip({
  id,
  activeWorkspace,
  onOpen,
  onToggle,
}: {
  id: WorkspaceId;
  activeWorkspace: WorkspaceId | null;
  onOpen: (id: WorkspaceId, mode?: DrawerMode) => void;
  onToggle: (id: WorkspaceId) => void;
}) {
  const registry = getWorkspaceRegistry();
  const workspace = registry.find((item) => item.id === id);
  if (!workspace) return null;

  const active = activeWorkspace === id;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <button
        type="button"
        aria-label={`Open favorite ${workspace.label}`}
        onClick={() => onOpen(id, "half")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 999,
          border: active ? "1px solid rgba(255, 215, 0, 0.6)" : "1px solid rgba(255, 255, 255, 0.2)",
          background: active ? "rgba(255, 215, 0, 0.16)" : "rgba(255, 255, 255, 0.06)",
          color: "#f2e6ff",
          fontSize: 12,
          padding: "4px 10px",
          cursor: "pointer",
        }}
      >
        <span>{workspace.icon}</span>
        <span>{workspace.label}</span>
      </button>
      <button
        type="button"
        aria-label={`Remove ${workspace.label} from favorites`}
        onClick={() => onToggle(id)}
        style={{
          border: "none",
          background: "transparent",
          color: "rgba(255, 255, 255, 0.7)",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

export default BottomWorkspaceDrawer;

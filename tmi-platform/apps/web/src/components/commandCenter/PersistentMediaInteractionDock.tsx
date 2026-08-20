"use client";

/**
 * Persistent Media/Interaction Control Dock — Fan + Performer Command Center.
 * Fixed geometry in document flow under dual monitors, above Playlist Library.
 * Mini player ↔ full Playlist Canister share commandCenterPlaybackBus + cast events.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MemoryWallPanelOverlay from "@/components/panels/MemoryWallPanelOverlay";
import CameraCaptureOverlay from "@/components/panels/CameraCaptureOverlay";
import { useFloatingWorkspace } from "@/lib/workspace/floatingWorkspaceStore";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import type { PlatformRole } from "@/lib/os/universalPermissionRegistry";
import { useTheme } from "@/lib/design/ThemeEngine";
import { useMonitorScreenShare } from "@/hooks/useMonitorScreenShare";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";
import {
  sendPlaybackCommand,
  subscribePlaybackCommands,
  subscribePlaylistNowPlaying,
  type PlaylistNowPlayingPayload,
} from "@/lib/playlists/commandCenterPlaybackBus";
import type { DockModuleId } from "@/components/shell/MasterControlDock";
import MobileQuickPanelBar from "@/components/commandCenter/MobileQuickPanelBar";

export interface PersistentMediaInteractionDockProps {
  role: "fan" | "performer";
  userId: string;
  roomId?: string;
  onLobbyNav?: () => void;
  onOpenModule?: (module: DockModuleId) => void;
}

function formatTime(seconds: number | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—:—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PersistentMediaInteractionDock({
  role,
  userId,
  roomId = "hub-command-center",
  onLobbyNav,
  onOpenModule,
}: PersistentMediaInteractionDockProps) {
  const theme = useTheme();
  const isPerformer = role === "performer";
  const commandRole = (): PlatformRole => (isPerformer ? "performer" : "fan");

  const [nowPlaying, setNowPlaying] = useState<PlaylistNowPlayingPayload | null>(null);
  const [waveTick, setWaveTick] = useState(0);
  const [online, setOnline] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMemoryWallOpen, setIsMemoryWallOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => {
      const mobile = mql.matches;
      setIsMobile(mobile);
      if (!mobile) setNavDrawerOpen(false);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const { isOpen: workspaceOpen, toggle: toggleWorkspace, open: openWorkspace } =
    useFloatingWorkspace();
  const { screenStream, startScreenShare, stopScreenShare } = useMonitorScreenShare({
    openPickerOnStart: true,
  });
  const openInSurface = useWorkspacePresentationStore((s) => s.openInSurface);

  useEffect(() => {
    const unsub = subscribePlaylistNowPlaying((payload) => setNowPlaying(payload));
    return unsub;
  }, []);

  const openPlaylistStudio = useCallback(() => {
    if (onOpenModule) {
      onOpenModule("playlist");
      return;
    }
    livingOsCommandBus.executeAction("ACTION_OPEN_PLAYLIST_STUDIO", {
      role: commandRole(),
      payload: { workspaceId: "playlist-studio" },
    });
  }, [onOpenModule, isPerformer]);

  useEffect(() => {
    return subscribePlaybackCommands((command) => {
      if (command === "open-full") openPlaylistStudio();
    });
  }, [openPlaylistStudio]);

  useEffect(() => {
    if (!nowPlaying?.isPlaying) return;
    const id = window.setInterval(() => setWaveTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, [nowPlaying?.isPlaying]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const [notifRes, msgRes] = await Promise.all([
          fetch("/api/notifications", { cache: "no-store" }),
          fetch("/api/messages", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (notifRes.ok) {
          const d = await notifRes.json();
          setUnreadNotifications(typeof d.unreadCount === "number" ? d.unreadCount : 0);
        }
        if (msgRes.ok) {
          const d = await msgRes.json();
          setUnreadMessages(typeof d.unreadTotal === "number" ? d.unreadTotal : 0);
        }
      } catch {
        /* keep last counts */
      }
    }
    void poll();
    const id = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const openShareStudio = () => {
    presentCanonicalWorkspace("share-studio", "DRAWER");
  };

  const progressLabel = (() => {
    if (!nowPlaying?.title) return "—:— / —:—";
    const p = nowPlaying.progress;
    if (p == null) return nowPlaying.isPlaying ? "Live EQ" : "—:— / —:—";
    const current = formatTime(p * 240);
    return `${current} / —:—`;
  })();

  const openNavModule = (moduleId: "lobby" | "messaging" | "notifications") => {
    openCanonicalWorkspaceQuick(moduleId, "DRAWER");
    setNavDrawerOpen(false);
  };

  return (
    <>
      {isMobile && navDrawerOpen ? (
        <div
          role="presentation"
          onClick={() => setNavDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 8800,
          }}
        />
      ) : null}
      {isMobile && navDrawerOpen ? (
        <div
          style={{
            position: "fixed",
            right: 12,
            bottom: "calc(120px + env(safe-area-inset-bottom, 0px))",
            width: "min(88vw, 280px)",
            zIndex: 8900,
            background: "rgba(5,5,20,0.97)",
            border: "1px solid rgba(0,255,255,0.25)",
            borderRadius: 12,
            padding: "10px 12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.75)",
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
            NAVIGATION
          </div>
          <NavHome workspaceOpen={workspaceOpen} onToggleWorkspace={() => { toggleWorkspace(); setNavDrawerOpen(false); }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <NavButton label="DISCOVER" icon="🧭" onClick={() => openNavModule("lobby")} />
            <NavButton label="LIVE NOW" icon="📹" onClick={() => openNavModule("lobby")} />
            <NavButton label="LOBBY" icon="👥" onClick={() => openNavModule("lobby")} />
            <NavButton label="MESSAGES" icon="💬" onClick={() => openNavModule("messaging")} badge={unreadMessages} />
            <NavButton label="NOTIFICATIONS" icon="🔔" onClick={() => openNavModule("notifications")} badge={unreadNotifications} />
          </div>
        </div>
      ) : null}
      <MemoryWallPanelOverlay
        isOpen={isMemoryWallOpen}
        onClose={() => setIsMemoryWallOpen(false)}
        onViewAll={() => {
          setIsMemoryWallOpen(false);
          openWorkspace("memory_wall");
        }}
      />
      <CameraCaptureOverlay isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      <div
        data-persistent-media-interaction-dock
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          margin: "0 0 0",
          zIndex: 20,
        }}
      >
        <div
          style={{
            background: "rgba(5, 5, 20, 0.94)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 255, 255, 0.28)",
            borderTop: "none",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.65)",
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minHeight: 56,
              gap: 12,
              flexWrap: isMobile ? "nowrap" : "wrap",
            }}
          >
            {/* LEFT — Mini Media Player (compact, fixed) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingRight: isMobile ? 0 : 14,
                marginRight: isMobile ? 0 : 14,
                borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.12)",
                minWidth: 0,
                maxWidth: isMobile ? "100%" : 320,
                flexShrink: 1,
                flex: isMobile ? "1 1 100%" : "0 1 260px",
              }}
            >
              <button
                type="button"
                onClick={openPlaylistStudio}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: nowPlaying?.coverUrl
                    ? `url(${nowPlaying.coverUrl}) center/cover`
                    : `linear-gradient(135deg,${theme.primary},${theme.secondary})`,
                  border: `1px solid ${theme.primary}88`,
                  cursor: "pointer",
                  boxShadow: `0 0 10px ${theme.primary}44`,
                }}
                aria-label="Open full media player"
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {nowPlaying?.title ?? "No track — open playlist"}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.45)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {nowPlaying?.artist ?? "Select a track in Playlist Library"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <button type="button" onClick={() => sendPlaybackCommand("prev")} style={transportBtn} aria-label="Previous">
                    ⏮
                  </button>
                  <button
                    type="button"
                    onClick={() => sendPlaybackCommand("toggle")}
                    style={{ ...transportBtn, color: theme.primary }}
                    aria-label={nowPlaying?.isPlaying ? "Pause" : "Play"}
                  >
                    {nowPlaying?.isPlaying ? "⏸" : "▶"}
                  </button>
                  <button type="button" onClick={() => sendPlaybackCommand("next")} style={transportBtn} aria-label="Next">
                    ⏭
                  </button>
                  <button
                    type="button"
                    onClick={() => sendPlaybackCommand("open-full")}
                    style={{ ...transportBtn, fontSize: 8, fontWeight: 800, color: "#FFD700" }}
                    aria-label="Expand media player"
                  >
                    ⛶
                  </button>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, minWidth: 52 }}>
                    {progressLabel}
                  </span>
                  {nowPlaying?.progress != null ? (
                    <div
                      style={{
                        flex: 1,
                        minWidth: 48,
                        maxWidth: 72,
                        height: 3,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.12)",
                        overflow: "hidden",
                      }}
                      aria-hidden
                    >
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, nowPlaying.progress * 100))}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20, flexShrink: 0 }} aria-hidden>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const h = nowPlaying?.isPlaying
                    ? 4 + ((Math.sin(waveTick * 0.7 + i * 0.9) + 1) * 0.5) * 14
                    : 3;
                  return (
                    <span
                      key={i}
                      style={{
                        width: 3,
                        height: h,
                        background: `linear-gradient(180deg, ${theme.primary}, #AA2DFF)`,
                        borderRadius: 1,
                        transition: "height 0.1s ease",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {isMobile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  data-testid="tmi-mobile-nav-trigger"
                  onClick={() => setNavDrawerOpen((v) => !v)}
                  style={{
                    ...toolBtn,
                    border: navDrawerOpen ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    color: navDrawerOpen ? "#00FFFF" : "rgba(255,255,255,0.75)",
                  }}
                  aria-expanded={navDrawerOpen}
                >
                  🧭 NAV {navDrawerOpen ? "▾" : "▴"}
                </button>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: online ? "#00FF88" : "#FF6666",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: online ? "#00FF88" : "#FF6666",
                    }}
                  />
                  {online ? "ONLINE" : "OFFLINE"}
                </div>
              </div>
            ) : (
              <>
            {/* CENTER — Global Navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                flex: 1,
                minWidth: 0,
                flexWrap: "wrap",
                paddingRight: 14,
                marginRight: 14,
                borderRight: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <NavHome workspaceOpen={workspaceOpen} onToggleWorkspace={toggleWorkspace} />
              <NavButton label="DISCOVER" icon="🧭" onClick={() => openCanonicalWorkspaceQuick("lobby", "DRAWER")} />
              <NavButton label="LIVE NOW" icon="📹" onClick={() => openCanonicalWorkspaceQuick("lobby", "DRAWER")} />
              <NavButton label="LOBBY" icon="👥" onClick={() => openCanonicalWorkspaceQuick("lobby", "DRAWER")} />
              <NavButton label="MESSAGES" icon="💬" onClick={() => openCanonicalWorkspaceQuick("messaging", "DRAWER")} badge={unreadMessages} />
              <NavButton label="NOTIFICATIONS" icon="🔔" onClick={() => openCanonicalWorkspaceQuick("notifications", "DRAWER")} badge={unreadNotifications} />
            </div>

            {/* RIGHT — Live / Media controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
              {/* Avatar/Inventory ownership is Fan-only (Rule 26 Identity Policy) — never expose the chrome to Performers. */}
              {!isPerformer && (
                <>
                  <button
                    type="button"
                    onClick={() => presentCanonicalWorkspace("avatar-quick", "DRAWER")}
                    style={toolBtn}
                    aria-label="Avatar workspace"
                  >
                    👤 AVATAR
                  </button>
                  <button
                    type="button"
                    onClick={() => presentCanonicalWorkspace("inventory", "DRAWER")}
                    style={toolBtn}
                    aria-label="Inventory workspace"
                  >
                    🎒 INV
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => (screenStream ? stopScreenShare() : void startScreenShare())}
                style={toolBtn}
                aria-label={screenStream ? "Stop screen share" : "Start screen share"}
              >
                🖥 {screenStream ? "STOP SHARE" : "SHARE SCREEN"}
              </button>
              <button type="button" onClick={() => setIsCameraOpen(true)} style={toolBtn} aria-label="Camera workspace">
                ⏺ RECORD
              </button>
              <button type="button" onClick={openShareStudio} style={toolBtn} aria-label="Open Share Studio">
                ↗ SHARE
              </button>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  color: "#FFD700",
                  border: "1px solid rgba(255,215,0,0.45)",
                  borderRadius: 4,
                  padding: "2px 6px",
                }}
                title="Stream quality follows connection (auto)"
              >
                AUTO
              </span>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  color: online ? "#00FF88" : "#FF6666",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: online ? "#00FF88" : "#FF6666",
                  }}
                />
                {online ? "ONLINE" : "OFFLINE"}
              </div>
              <button
                type="button"
                onClick={() => presentCanonicalWorkspace("memory-wall", "DRAWER")}
                style={toolBtn}
                aria-label="Memory workspace"
              >
                🧠 MEMORY
              </button>
            </div>
              </>
            )}
          </div>
        </div>

        {/* Cyan / gold hard boundary — playlist library starts immediately below */}
        <div
          style={{
            height: 3,
            flexShrink: 0,
            background: "linear-gradient(90deg, #00FFFF 0%, #FFD700 50%, #00FFFF 100%)",
            boxShadow: "0 0 12px rgba(0,255,255,0.35)",
          }}
        />
      </div>
      {isMobile ? (
        <MobileQuickPanelBar
          role={role}
          screenShareActive={Boolean(screenStream)}
          onShareScreen={() => (screenStream ? stopScreenShare() : void startScreenShare())}
          onRecord={() => setIsCameraOpen(true)}
          onShare={openShareStudio}
          onMemory={() => presentCanonicalWorkspace("memory-wall", "DRAWER")}
        />
      ) : null}
    </>
  );
}

const transportBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.75)",
  fontSize: 11,
  cursor: "pointer",
  padding: 0,
  lineHeight: 1,
};

const toolBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.65)",
  fontSize: 9,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontFamily: "inherit",
};

function NavLink({
  label,
  icon,
  href,
  badge,
}: {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.05em",
        color: "rgba(255,255,255,0.85)",
        textDecoration: "none",
        position: "relative",
        whiteSpace: "nowrap",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {badge != null && badge > 0 ? <Badge count={badge} /> : null}
    </Link>
  );
}

function NavButton({
  label,
  icon,
  onClick,
  badge,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.05em",
        color: "rgba(255,255,255,0.85)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        position: "relative",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {badge != null && badge > 0 ? <Badge count={badge} /> : null}
    </button>
  );
}

function NavHome({
  workspaceOpen,
  onToggleWorkspace,
}: {
  workspaceOpen: boolean;
  onToggleWorkspace: () => void;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.05em",
          color: "rgba(255,255,255,0.85)",
          textDecoration: "none",
        }}
      >
        <span>🏠</span>
        <span>HOME</span>
      </Link>
      <button
        type="button"
        aria-label={workspaceOpen ? "Close workspace panel" : "Open workspace panel"}
        onClick={onToggleWorkspace}
        style={{
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.05)",
          color: "#d6b5ff",
          borderRadius: 6,
          fontSize: 10,
          fontWeight: 900,
          cursor: "pointer",
          padding: "1px 6px",
        }}
      >
        {workspaceOpen ? "▼" : "▲"}
      </button>
    </div>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -8,
        background: "#FF0055",
        color: "#fff",
        fontSize: 7,
        fontWeight: 900,
        padding: "1px 4px",
        borderRadius: 4,
        minWidth: 14,
        textAlign: "center",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

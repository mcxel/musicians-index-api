"use client";

/**
 * QuickPanelDock — Fast pop-over panels for in-the-moment actions.
 *
 * CLASSIFICATION: These are PANELS, not drawers (per owner voice notes 2026-07-31).
 * Panels are single-purpose quick-action overlays that appear and dismiss instantly.
 * They do NOT have the expand/fullscreen/management workspace design of drawers.
 *
 * PANELS in this dock:
 *   🏠 Lobby       — Avatar Fan Lobby access (Fan only)
 *                    Note: Performer gets Avatar Fan Lobby too per AGENTS.md Rule 26
 *   📺 Live Wall   — Browse active live rooms (quick discovery)
 *   🔔 Alerts      — Notifications and activity feed
 *   👥 Friends     — Online friends / invite
 *   ⚡ Quick Queue — Now-playing mini + quick add to queue
 *
 * Rule: Lobbies NEVER get a drawer — they always use this panel system.
 * Rule: Live Wall is discovery — panel only, never a full workspace drawer.
 */

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLiveDiscoveryOverlay } from "@/lib/discovery/liveDiscoveryOverlayStore";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { discoveryToLobbyRoom } from "@/lib/discovery/discoveryToLobbyRoom";
import LiveLobbyWallGrid, { type LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import {
  digitalQuickPanelFrameStyle,
  resolveHubQuickPanelPosition,
  type ViewportAnchor,
} from "@/lib/ui/digitalQuickPanelChrome";

// ─── Types ────────────────────────────────────────────────────────────────────

type PanelId = "lobby" | "live_wall" | "alerts" | "friends" | "quick_queue";
type UserRole = "performer" | "fan" | "guest";

interface PanelDef {
  id: PanelId;
  icon: string;
  label: string;
  accent: string;
  badge?: number;
}

const PANELS: PanelDef[] = [
  { id: "lobby",       icon: "🏠", label: "LOBBY",    accent: "#9B59FF" },
  { id: "live_wall",   icon: "📺", label: "LIVE",     accent: "#FF4444" },
  { id: "alerts",      icon: "🔔", label: "ALERTS",   accent: "#FFD700" },
  { id: "friends",     icon: "👥", label: "FRIENDS",  accent: "#00FF88" },
  { id: "quick_queue", icon: "⚡", label: "QUEUE",    accent: "#FF6B1A" },
];

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Row({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${accent}22` }}>
      {children}
    </div>
  );
}

function Btn({ children, color, outline, onClick }: { children: React.ReactNode; color: string; outline?: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{ padding: "3px 9px", fontSize: 8, fontWeight: 800, borderRadius: 4, background: outline ? `${color}18` : color, border: outline ? `1px solid ${color}88` : "none", color: outline ? color : "#fff", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
    >
      {children}
    </span>
  );
}

// ─── Panel contents ───────────────────────────────────────────────────────────

function LobbyPanel({ role }: { role: UserRole }) {
  return (
    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 900, color: "#9B59FF", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {role === "fan" ? "YOUR AVATAR LOBBY" : "AVATAR FAN LOBBY"}
      </div>
      <div style={{ background: "#9B59FF22", border: "1px solid #9B59FF44", borderRadius: 8, padding: 12, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🎭</div>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#E8E8FF", marginBottom: 2 }}>Personal Lobby</div>
        <div style={{ fontSize: 8, color: "#7878AA", marginBottom: 8 }}>Your pre-show hangout</div>
        <Btn color="#9B59FF">Enter Lobby</Btn>
      </div>
      <div style={{ fontSize: 8, color: "#7878AA", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>RECENTLY VISITED</div>
      <div style={{ fontSize: 8, color: "#7878AA", padding: "8px 0", textAlign: "center" }}>
        No recently visited lobbies yet.
      </div>
    </div>
  );
}

/** LIVE quick menu — Brady-Bunch video tiles (same language as full wall). Tap = instant join. */
function LiveWallPanel({
  onOpenFullWall,
  onClose,
}: {
  onOpenFullWall: () => void;
  onClose: () => void;
}) {
  const records = useDiscoveryBus(null);
  const rooms = useMemo(() => records.map(discoveryToLobbyRoom), [records]);
  const [joinDecision, setJoinDecision] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);

  const handleRoomJoin = useCallback(
    (room: LobbyRoom) => {
      const record = records.find((r) => r.roomId === room.id || r.id === room.id);
      if (record) {
        setJoinDecision(resolveInstantJoin(record));
        return;
      }
      const dest = resolveLobbyDestination({
        roomId: room.id,
        kind:
          room.type === "battle" ||
          room.type === "cypher" ||
          room.type === "challenge" ||
          room.type === "game" ||
          room.type === "live" ||
          room.type === "dance" ||
          room.type === "concert" ||
          room.type === "lounge"
            ? room.type
            : "live",
        href: room.href,
      });
      setJoinDecision({
        instant: true,
        gateReason: "none",
        href: dest.href,
        room: {
          id: room.id,
          title: room.name,
          hostName: room.performerName,
          genre: room.genre,
          viewers: room.viewerCount,
          status: room.status === "live" ? "live" : "starting-soon",
          access: "free",
          accentColor: "#FF4444",
          roomRoute: dest.href,
          venueIndex: 0,
        },
      });
    },
    [records],
  );

  return (
    <div style={{ padding: "8px 10px 12px", display: "flex", flexDirection: "column", gap: 8, maxHeight: "55vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#FF4444", animation: "pulse 1s infinite" }} />
        <span style={{ fontSize: 9, fontWeight: 900, color: "#FF4444", letterSpacing: "0.12em", textTransform: "uppercase", flex: 1 }}>
          LIVE QUICK WALL
        </span>
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenFullWall();
          }}
          style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Btn color="#FF4444" outline>FULL WALL</Btn>
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 180, overflowY: "auto" }}>
        <LiveLobbyWallGrid
          rooms={rooms}
          title="Tap tile → instant join"
          accentColor="#FF4444"
          typeLabel="LIVE"
          variant="quick"
          onRoomJoin={handleRoomJoin}
        />
      </div>
      {joinDecision && (
        <LobbyEntryFlow
          room={joinDecision.room}
          instant
          onClose={() => {
            setJoinDecision(null);
            onClose();
          }}
        />
      )}
    </div>
  );
}

interface ApiNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  ts: number;
  emoji?: string;
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}

function AlertsPanel() {
  const [alerts, setAlerts] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    } catch {
      /* leave state as-is on failure */
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as { notifications?: ApiNotification[] };
        setAlerts(data.notifications ?? []);
      } catch {
        if (!cancelled) setAlerts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.12em", textTransform: "uppercase" }}>NOTIFICATIONS</span>
        <span onClick={() => void markAllRead()}>
          <Btn color="#7878AA" outline>Mark all read</Btn>
        </span>
      </div>
      {loading ? (
        <div style={{ fontSize: 8, color: "#7878AA", padding: "8px 0", textAlign: "center" }}>Loading…</div>
      ) : alerts.length === 0 ? (
        <div style={{ fontSize: 8, color: "#7878AA", padding: "8px 0", textAlign: "center" }}>No notifications yet.</div>
      ) : (
        alerts.map((a) => (
          <div key={a.id} style={{ background: "#0A0A1A", border: `1px solid ${a.read ? "rgba(120,120,170,0.2)" : "rgba(255,215,0,0.3)"}`, borderRadius: 6, padding: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{a.emoji ?? (a.read ? "🔔" : "🟡")}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: "#E8E8FF" }}>{a.title}</div>
              <div style={{ fontSize: 8, color: "#B8B8D8", marginTop: 1 }}>{a.body}</div>
              <div style={{ fontSize: 7, color: "#7878AA", marginTop: 1 }}>{timeAgo(a.ts)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

interface ApiFriend {
  id: string;
  displayName: string;
  status?: string;
  online?: boolean;
}

function FriendsPanel() {
  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/friends", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 501) {
          setUnavailable(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json() as { friends?: ApiFriend[] };
        setFriends((data.friends ?? []).filter((f) => f.online));
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#00FF88", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          FRIENDS ONLINE{friends.length > 0 ? ` · ${friends.length}` : ""}
        </span>
        <a href="/friends" style={{ textDecoration: "none" }}>
          <Btn color="#00FF88" outline>+ Invite</Btn>
        </a>
      </div>
      {loading ? (
        <div style={{ fontSize: 8, color: "#7878AA", padding: "8px 0", textAlign: "center" }}>Loading…</div>
      ) : unavailable ? (
        <div style={{ fontSize: 8, color: "#7878AA", padding: "8px 0", textAlign: "center" }}>Friends system not connected yet.</div>
      ) : friends.length === 0 ? (
        <div style={{ fontSize: 8, color: "#7878AA", padding: "8px 0", textAlign: "center" }}>No friends online right now.</div>
      ) : (
        friends.map((f) => (
          <Row key={f.id} accent="#00FF88">
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00FF88", flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>{f.displayName}</span>
            <span style={{ fontSize: 7, color: "#7878AA" }}>{f.status ?? "Online"}</span>
          </Row>
        ))
      )}
    </div>
  );
}

function QuickQueuePanel() {
  return (
    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 9, fontWeight: 900, color: "#FF6B1A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>NOW PLAYING &amp; QUEUE</div>
      <div style={{ fontSize: 8, color: "#7878AA", padding: "16px 0", textAlign: "center", lineHeight: 1.6 }}>
        Nothing queued. Open Playlists to start playing a track.
      </div>
      <a href="/hub/fan?drawer=playlist" style={{ textDecoration: "none" }}>
        <Btn color="#FF6B1A" outline>Open Playlists →</Btn>
      </a>
    </div>
  );
}

// ─── Panel popup shell ────────────────────────────────────────────────────────

function PanelPopup({
  panel,
  role,
  anchor,
  onClose,
  onOpenLiveWall,
}: {
  panel: PanelDef;
  role: UserRole;
  anchor: ViewportAnchor;
  onClose: () => void;
  onOpenLiveWall: () => void;
}) {
  const isLiveWall = panel.id === "live_wall";
  const panelWidth = isLiveWall ? 420 : 320;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const panelMaxH = isLiveWall ? Math.min(vh * 0.7, 520) : Math.min(vh * 0.55, 420);
  const { top, left } = resolveHubQuickPanelPosition(
    panel.id,
    panelWidth,
    panelMaxH,
    anchor,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        position: "fixed",
        top,
        left,
        width: panelWidth,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: panelMaxH,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch" as CSSProperties["WebkitOverflowScrolling"],
        borderRadius: 4,
        ...digitalQuickPanelFrameStyle(panel.accent),
        zIndex: 200,
      }}
      role="dialog"
      aria-label={`${panel.label} panel`}
    >
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${panel.accent}44`, position: "sticky", top: 0, background: "rgba(2,8,22,0.92)", zIndex: 1 }}>
        <span style={{ fontSize: 16 }}>{panel.icon}</span>
        <span style={{ fontSize: 10, fontWeight: 900, color: panel.accent, letterSpacing: "0.1em", textTransform: "uppercase", flex: 1 }}>{panel.label}</span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#7878AA", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Panel content */}
      {panel.id === "lobby" && <LobbyPanel role={role} />}
      {panel.id === "live_wall" && (
        <LiveWallPanel onOpenFullWall={onOpenLiveWall} onClose={onClose} />
      )}
      {panel.id === "alerts" && <AlertsPanel />}
      {panel.id === "friends" && <FriendsPanel />}
      {panel.id === "quick_queue" && <QuickQueuePanel />}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface QuickPanelDockProps {
  role?: UserRole;
  style?: CSSProperties;
  /** Which panels to show — defaults to all 5 */
  panels?: PanelId[];
}

export default function QuickPanelDock({ role = "fan", style, panels }: QuickPanelDockProps) {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [panelAnchor, setPanelAnchor] = useState<ViewportAnchor>({ x: 0, y: 0 });
  const { open: openLiveLobbyWalls } = useLiveDiscoveryOverlay();

  const openPanelAt = (id: PanelId, event: MouseEvent<HTMLButtonElement>) => {
    if (activePanel === id) {
      setActivePanel(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setPanelAnchor({
      x: rect.left + rect.width / 2,
      y: event.clientY,
      rect,
    });
    setActivePanel(id);
  };

  const visiblePanels = panels ? PANELS.filter((p) => panels.includes(p.id)) : PANELS;
  const activePanelDef = visiblePanels.find((p) => p.id === activePanel) ?? null;

  return (
    <>
      <AnimatePresence>
        {activePanelDef && (
          <PanelPopup
            key={activePanelDef.id}
            panel={activePanelDef}
            role={role}
            anchor={panelAnchor}
            onClose={() => setActivePanel(null)}
            onOpenLiveWall={openLiveLobbyWalls}
          />
        )}
      </AnimatePresence>

      {/* Backdrop — close on click outside */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePanel(null)}
            style={{ position: "fixed", inset: 0, zIndex: 199, background: "transparent" }}
          />
        )}
      </AnimatePresence>

      {/* Panel button row */}
      <div
        role="toolbar"
        aria-label="Quick panels"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "3px 12px",
          background: "rgba(5,5,16,0.92)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          ...style,
        }}
      >
        {visiblePanels.map((p) => {
          const isActive = activePanel === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => openPanelAt(p.id, e)}
              aria-pressed={isActive}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                background: isActive ? `${p.accent}18` : "transparent",
                border: `1px solid ${isActive ? p.accent : "rgba(255,255,255,0.06)"}`,
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.12s",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <span style={{ fontSize: 12 }}>{p.icon}</span>
              <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: isActive ? p.accent : "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                {p.label}
              </span>
              {p.badge && p.badge > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: p.accent, color: "#fff", borderRadius: 8, fontSize: 7, padding: "1px 4px", fontWeight: 900, minWidth: 14, textAlign: "center" }}>
                  {p.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

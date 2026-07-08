"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import type { WorkspaceRole } from "@/components/shell/workspaceTypes";
import { useScreenShare } from "@/hooks/useScreenShare";
import { Monitor, type MonitorConfig, type MonitorFeed } from "@/components/shell/VideoMonitorGrid";
import { BroadcastHeroStatusBar } from "@/components/broadcast/BroadcastHeroStatusBar";

type RightRailTab = "chat" | "room" | "people";
type FloatingPanelId = "inventory" | "memoryWall";

function GlobalHeader() {
  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontWeight: 900, letterSpacing: "0.08em" }}>TMI</div>
        <nav style={{ display: "flex", gap: 14, fontSize: 13, color: "rgba(245, 239, 255, 0.82)" }}>
          <span>Home</span>
          <span>Discover</span>
          <span>Live Now</span>
          <span>Magazine</span>
          <span>Marketplace</span>
          <span>Arena</span>
        </nav>
      </div>

      <div
        style={{
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "8px 14px",
          minWidth: 320,
          color: "rgba(245, 239, 255, 0.72)",
          fontSize: 13,
        }}
      >
        Search performers, rooms, people...
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
        <span style={{ border: "1px solid rgba(170,45,255,0.5)", borderRadius: 999, padding: "6px 10px" }}>💎 12,450</span>
        <span style={{ border: "1px solid rgba(255,215,0,0.5)", borderRadius: 999, padding: "6px 10px" }}>🪙 8,670</span>
        <span style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "6px 10px" }}>MarcelD</span>
      </div>
    </div>
  );
}

function LeftLauncher({
  workspaceRole,
  compact,
  pinned,
  onRoleChange,
}: {
  workspaceRole: WorkspaceRole;
  compact: boolean;
  pinned: boolean;
  onRoleChange: (role: WorkspaceRole) => void;
}) {
  const { openWorkspace } = useWorkspace();

  const launchers: Array<{ id: string; label: string; workspace: Parameters<typeof openWorkspace>[0] }> = [
    { id: "live", label: "🎤 LIVE ROOMS", workspace: "lobby-wall" },
    { id: "lobby", label: "🌐 LOBBY WALL", workspace: "lobby-wall" },
    { id: "messages", label: "💬 MESSAGES", workspace: "messages" },
    { id: "inventory", label: "🎒 INVENTORY", workspace: "inventory" },
    { id: "memory", label: "📸 MEMORY WALL", workspace: "memory-wall" },
    { id: "playlists", label: "🎵 PLAYLISTS", workspace: "playlists" },
    { id: "camera", label: "📹 CAMERA", workspace: "camera" },
    { id: "rewards", label: "⭐ REWARDS", workspace: "rewards" },
    { id: "store", label: "🛍️ STORE", workspace: "store" },
    { id: "settings", label: "⚙️ SETTINGS", workspace: "settings" },
    { id: "notes", label: "📝 NOTES", workspace: "notes" },
  ];

  const itemStyle = {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    padding: compact ? "10px 8px" : "10px 12px",
    background: "rgba(255,255,255,0.03)",
    fontSize: 13,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: compact ? ("center" as const) : ("flex-start" as const),
    gap: 8,
  };

  const compactIcon = (label: string) => {
    const [icon] = label.split(" ");
    return icon;
  };

  return (
    <div style={{ padding: compact ? 8 : 12, display: "grid", gap: 10 }}>
      {!compact && <div style={{ fontSize: 11, color: "rgba(245, 239, 255, 0.7)", letterSpacing: "0.14em" }}>PERSONAL HUB</div>}
      {launchers.map((launcher, index) => (
        <button
          key={launcher.id}
          type="button"
          onClick={() => openWorkspace(launcher.workspace, "half")}
          title={launcher.label}
          style={{
            ...itemStyle,
            width: "100%",
            textAlign: compact ? ("center" as const) : ("left" as const),
            cursor: "pointer",
            ...(index === 0 ? { borderColor: "rgba(170,45,255,0.6)", background: "rgba(170,45,255,0.16)" } : {}),
          }}
        >
          {compact ? compactIcon(launcher.label) : launcher.label}
        </button>
      ))}

      {!compact && <div style={{ marginTop: 10, fontSize: 11, color: "rgba(245, 239, 255, 0.7)", letterSpacing: "0.14em" }}>ACCOUNT PERSONA</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: compact ? ("center" as const) : ("flex-start" as const) }}>
        {[
          { id: "fan", label: "Fan" },
          { id: "performer", label: "Performer" },
          { id: "writer", label: "Writer" },
          { id: "venue", label: "Venue" },
          { id: "sponsor", label: "Sponsor" },
          { id: "advertiser", label: "Advertiser" },
          { id: "admin", label: "Admin" },
          { id: "mc", label: "MC" },
          { id: "big-ace", label: "Big Ace" },
        ].map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id as WorkspaceRole)}
            style={{
              borderRadius: 999,
              border: role.id === workspaceRole ? "1px solid rgba(0,255,255,0.65)" : "1px solid rgba(255,255,255,0.16)",
              background: role.id === workspaceRole ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.03)",
              padding: compact ? "4px 7px" : "4px 9px",
              fontSize: compact ? 10 : 11,
              color: "#f4f1ff",
              cursor: "pointer",
            }}
            title={role.label}
          >
            {compact ? role.label.slice(0, 1) : role.label}
          </button>
        ))}
      </div>

      {compact && (
        <div title="Shift+Click left rail to pin/unpin expansion" style={{ marginTop: 2, textAlign: "center", fontSize: 10, color: "rgba(245, 239, 255, 0.46)" }}>
          {pinned ? "📌" : "⇧"}
        </div>
      )}
    </div>
  );
}

function InventoryPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"avatar" | "wearables" | "items" | "emotes">("avatar");
  return (
    <div
      style={{
        position: "absolute",
        left: 14,
        bottom: 92,
        width: 260,
        borderRadius: 16,
        border: "1px solid rgba(170,45,255,0.4)",
        background: "rgba(6, 8, 24, 0.86)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        zIndex: 15,
        pointerEvents: "auto",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: "#f4f1ff" }}>INVENTORY</span>
        <button type="button" onClick={onClose} aria-label="Close inventory" style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "8px 10px 0" }}>
        {(["avatar", "wearables", "items", "emotes"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              borderRadius: 8,
              border: tab === id ? "1px solid rgba(170,45,255,0.6)" : "1px solid rgba(255,255,255,0.12)",
              background: tab === id ? "rgba(170,45,255,0.18)" : "rgba(255,255,255,0.03)",
              color: "#f4f1ff",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.04em",
              padding: "5px 4px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {id}
          </button>
        ))}
      </div>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 120,
            height: 130,
            borderRadius: 12,
            background: "radial-gradient(60% 60% at 50% 20%, rgba(170,45,255,0.35), rgba(6,8,24,0.9))",
            border: "1px solid rgba(170,45,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
          }}
        >
          🕴️
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["🧢", "🕶️", "🧥", "👟"].map((icon) => (
            <div key={icon} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(0,255,136,0.4)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              {icon}
            </div>
          ))}
        </div>
        <button
          type="button"
          style={{
            width: "100%",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, #AA2DFF, #7a5cff)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.05em",
            padding: "9px 0",
            cursor: "pointer",
          }}
        >
          CUSTOMIZE AVATAR
        </button>
      </div>
    </div>
  );
}

function MemoryWallPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"all" | "photos" | "videos" | "tickets">("all");
  const cards = [
    { label: "Thunder Dome", sub: "6/18/2026", icon: "🖼️" },
    { label: "MarcelD Live", sub: "6/10/2026", icon: "🎥" },
    { label: "VIP Ticket", sub: "Thunder Dome", icon: "🎟️" },
    { label: "Crowd Shot", sub: "6/18/2026", icon: "📸" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        right: 14,
        bottom: 92,
        width: 300,
        borderRadius: 16,
        border: "1px solid rgba(255,215,0,0.35)",
        background: "rgba(6, 8, 24, 0.86)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        zIndex: 15,
        pointerEvents: "auto",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: "#f4f1ff" }}>MEMORY WALL</span>
        <button type="button" onClick={onClose} aria-label="Close memory wall" style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "8px 10px 0" }}>
        {(["all", "photos", "videos", "tickets"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              borderRadius: 8,
              border: tab === id ? "1px solid rgba(255,215,0,0.6)" : "1px solid rgba(255,255,255,0.12)",
              background: tab === id ? "rgba(255,215,0,0.16)" : "rgba(255,255,255,0.03)",
              color: "#f4f1ff",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.04em",
              padding: "5px 4px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {id}
          </button>
        ))}
      </div>

      <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "radial-gradient(80% 80% at 50% 20%, rgba(255,215,0,0.16), rgba(6,8,24,0.9))",
              padding: "10px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              minHeight: 76,
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 22 }}>{card.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f4f1ff" }}>{card.label}</span>
            <span style={{ fontSize: 9, color: "rgba(245,239,255,0.55)" }}>{card.sub}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 12px 12px" }}>
        <button
          type="button"
          style={{
            width: "100%",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, #FFD700, #B47517)",
            color: "#1a1200",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.05em",
            padding: "9px 0",
            cursor: "pointer",
          }}
        >
          VIEW ALL MEMORIES
        </button>
      </div>
    </div>
  );
}

function HeroStage() {
  const [openPanels, setOpenPanels] = useState<Set<FloatingPanelId>>(new Set(["inventory", "memoryWall"]));
  const [pipEnabled, setPipEnabled] = useState(true);
  const [pipLarge, setPipLarge] = useState(false);
  const [pipPosition, setPipPosition] = useState({ x: 24, y: 112 });
  const [pipFeed, setPipFeed] = useState<MonitorFeed>("self-camera");
  const [draggingPip, setDraggingPip] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const closePanel = (id: FloatingPanelId) =>
    setOpenPanels((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

  // Contextual per-monitor source lists (Broadcast Foundation audit) — each
  // monitor exposes only the sources relevant to its role, not one giant
  // shared catalog. Program = on-air output. Community = audience/venue
  // context. Utility (PIP) = compact personal feed.
  const heroMonitor = useMemo<MonitorConfig>(() => ({
    defaultFeed: "live-stream",
    availableFeeds: ["live-stream", "battle-feed", "cypher-feed", "challenge-feed", "screen-share", "performance", "sponsor", "empty"],
    accentColor: "#00FFFF",
  }), []);

  const secondaryMonitor = useMemo<MonitorConfig>(() => ({
    defaultFeed: "audience",
    availableFeeds: ["audience", "billboard", "memory-wall", "self-camera", "empty"],
    accentColor: "#FF2DAA",
  }), []);

  const pipMonitor = useMemo<MonitorConfig>(() => ({
    defaultFeed: pipFeed,
    availableFeeds: ["audience", "self-camera", "playlist", "empty"],
    accentColor: "#00C8FF",
  }), [pipFeed]);

  const { isSharing, toggleScreenShare } = useScreenShare({
    onStart: () => {
      setPipFeed("screen-share");
    },
    onStop: () => {
      setPipFeed("self-camera");
    },
  });

  useEffect(() => {
    if (!draggingPip) return;

    const onMove = (event: PointerEvent) => {
      setPipPosition({
        x: Math.max(8, event.clientX - dragOffsetRef.current.x),
        y: Math.max(84, event.clientY - dragOffsetRef.current.y),
      });
    };

    const onUp = () => setDraggingPip(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [draggingPip]);

  function startPipDrag(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.currentTarget.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setDraggingPip(true);
  }

  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "calc(78% - 2px)" }}>
        <Monitor config={heroMonitor} size="big" />
      </div>

      {/* Metal bezel divider — reads as two physically separate monitor units
          rather than one continuous video surface, like a real broadcast wall. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "calc(78% - 2px)",
          height: 4,
          zIndex: 6,
          background: "linear-gradient(180deg, #3a3d47 0%, #0b0c10 50%, #3a3d47 100%)",
          borderTop: "1px solid rgba(255,255,255,0.22)",
          borderBottom: "1px solid rgba(0,0,0,0.6)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 6px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfd2da, #55575f)" }} />
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfd2da, #55575f)" }} />
      </div>

      {/* Secondary monitor strip — sits directly beneath the main stage, right
          above where the floating BottomWorkspaceDrawer docks. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: "calc(78% + 2px)" }}>
        <Monitor config={secondaryMonitor} size="mini" />
      </div>

      {/* Top status overlay — LIVE badge, title, 4K badge.
          Offset below the Monitor's own built-in SRC-selector/badge row so the two don't collide.
          Viewer count intentionally omitted until a real audience count source is wired (Rule 20). */}
      <BroadcastHeroStatusBar
        live
        title="MarcelD Live in Thunder Dome"
        subtitle="Hip Hop · 4K Ultra HD"
        qualityBadge={{ label: "4K", sublabel: "ULTRA HD" }}
      />

      {openPanels.has("inventory") && <InventoryPanel onClose={() => closePanel("inventory")} />}
      {openPanels.has("memoryWall") && <MemoryWallPanel onClose={() => closePanel("memoryWall")} />}

      {pipEnabled && (
        <div
          style={{
            position: "absolute",
            left: pipPosition.x,
            top: pipPosition.y,
            width: pipLarge ? 320 : 240,
            height: pipLarge ? 188 : 138,
            borderRadius: 12,
            border: "1px solid rgba(0,200,255,0.45)",
            background: "rgba(6, 8, 24, 0.85)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
            overflow: "hidden",
            zIndex: 16,
            pointerEvents: "auto",
          }}
        >
          <div
            onPointerDown={startPipDrag}
            style={{
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px",
              borderBottom: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.48)",
              cursor: "grab",
            }}
          >
            <span style={{ fontSize: 9, letterSpacing: "0.08em", fontWeight: 800, color: "#c8f4ff" }}>PIP · AUDIENCE</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPipLarge((v) => !v);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 12,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
                aria-label="Resize PIP"
              >
                {pipLarge ? "▣" : "▢"}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPipEnabled(false);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 14,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
                aria-label="Close PIP"
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ position: "absolute", top: 24, left: 0, right: 0, bottom: 0 }}>
            <Monitor config={pipMonitor} size="mini" onFeedChange={setPipFeed} />
          </div>
        </div>
      )}

      {!openPanels.has("inventory") && (
        <button
          type="button"
          onClick={() => setOpenPanels((c) => new Set(c).add("inventory"))}
          style={{ position: "absolute", left: 14, bottom: 92, zIndex: 15, borderRadius: 999, border: "1px solid rgba(170,45,255,0.5)", background: "rgba(6,8,24,0.8)", color: "#f4f1ff", fontSize: 11, fontWeight: 700, padding: "6px 12px", cursor: "pointer" }}
        >
          🎒 Inventory
        </button>
      )}
      {!openPanels.has("memoryWall") && (
        <button
          type="button"
          onClick={() => setOpenPanels((c) => new Set(c).add("memoryWall"))}
          style={{ position: "absolute", right: 14, bottom: 92, zIndex: 15, borderRadius: 999, border: "1px solid rgba(255,215,0,0.5)", background: "rgba(6,8,24,0.8)", color: "#f4f1ff", fontSize: 11, fontWeight: 700, padding: "6px 12px", cursor: "pointer" }}
        >
          📸 Memory Wall
        </button>
      )}

      {/* Command deck — Leave Room / Mic / Cam / Raise Hand / Emotes / Enter Stage.
          Cleared above the Monitor's own bottom switch-indicator strip (18px). */}
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 28,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,45,45,0.55)",
            background: "rgba(80,10,10,0.55)",
            color: "#ff9b9b",
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          ⇄ Leave Room
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(6, 8, 24, 0.72)",
            backdropFilter: "blur(14px)",
            padding: "8px 14px",
          }}
        > 
          {["🎙 Mic On", "📹 Cam On", "🖥️ Share Screen", "✋ Raise Hand", "😀 Emotes"].map((action) => {
            const isSharingAction = action === "🖥️ Share Screen" && isSharing;
            return (
              <button
                key={action}
                type="button"
                style={{
                  borderRadius: 999,
                  border: isSharingAction ? "1px solid rgba(0,255,136,0.7)" : "1px solid rgba(255,255,255,0.18)",
                  background: isSharingAction ? "rgba(0,255,136,0.16)" : "rgba(255,255,255,0.06)",
                  color: isSharingAction ? "#7dffb8" : "#f4f1ff",
                  padding: "7px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onClick={action === "🖥️ Share Screen" ? toggleScreenShare : undefined}
              >
                {isSharingAction ? "🖥️ Sharing..." : action}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPipEnabled((v) => !v)}
            style={{
              borderRadius: 999,
              border: pipEnabled ? "1px solid rgba(0,255,255,0.7)" : "1px solid rgba(255,255,255,0.18)",
              background: pipEnabled ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.06)",
              color: "#f4f1ff",
              padding: "7px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            🧿 PIP
          </button>
        </div>

        <button
          type="button"
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,215,0,0.6)",
            background: "linear-gradient(135deg, rgba(255,215,0,0.28), rgba(180,117,23,0.28))",
            color: "#FFD700",
            padding: "10px 18px",
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          ⭐ Enter Stage
        </button>
      </div>
    </div>
  );
}

function RightSocialRail({ mode }: { mode: "compact" | "expanded" | "hidden" }) {
  const compact = mode === "compact";
  const [tab, setTab] = useState<RightRailTab>("chat");

  // Compact mode is now icon-only (70px), mirroring the left rail's hover-to-expand
  // behavior — hover or pin the rail to see the full Chat/Room/People content.
  if (compact) {
    const icons: Array<{ id: RightRailTab; icon: string }> = [
      { id: "chat", icon: "💬" },
      { id: "room", icon: "🏷️" },
      { id: "people", icon: "👥" },
    ];
    return (
      <div style={{ padding: 8, display: "grid", gap: 8, justifyItems: "center" }}>
        {icons.map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            title={id.toUpperCase()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: tab === id ? "1px solid rgba(0,255,255,0.5)" : "1px solid rgba(255,255,255,0.12)",
              background: tab === id ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.03)",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {icon}
          </button>
        ))}
      </div>
    );
  }

  const tabButton = (id: RightRailTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      style={{
        borderRadius: 8,
        border: tab === id ? "1px solid rgba(0,255,255,0.5)" : "1px solid rgba(255,255,255,0.16)",
        background: tab === id ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.04)",
        color: "#f4f1ff",
        padding: "6px 8px",
        fontSize: 11,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  const renderTabPanel = () => {
    if (tab === "chat") {
      return (
        <div style={{ fontSize: 13, color: "rgba(245, 239, 255, 0.85)", lineHeight: 1.6 }}>
          QueenV: THIS IS FIRE
          <br />
          BeatKing: MarcelD never misses
          <br />
          LoyalFan23: The energy is crazy
          <br />
          <br />
          StarGirl: 4K quality is insane
        </div>
      );
    }

    if (tab === "room") {
      return (
        <div style={{ fontSize: 13, color: "rgba(245, 239, 255, 0.85)", lineHeight: 1.6 }}>
          Host: MarcelD
          <br />
          Stage: LIVE
          <br />
          Queue: 3 performers waiting
          <br />
          Mode: Concert / Audience View
        </div>
      );
    }

    return (
      <div style={{ fontSize: 13, color: "rgba(245, 239, 255, 0.85)", lineHeight: 1.6 }}>
        JayPaul • In Lobby
        <br />
        MicahMillion • Watching Live
        <br />
        ProdigyBeats • In Studio
        <br />
        RealMC • On Stage Queue
      </div>
    );
  };

  return (
    <div style={{ padding: 12, display: "grid", gap: 10 }}>
      <div style={{ fontSize: 11, color: "rgba(245, 239, 255, 0.7)", letterSpacing: "0.14em" }}>SOCIAL RAIL</div>
      <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", padding: 12, background: "rgba(255,255,255,0.04)", minHeight: 120 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {tabButton("chat", "CHAT")}
          {tabButton("room", "ROOM")}
          {tabButton("people", "PEOPLE")}
        </div>

        {renderTabPanel()}
      </div>

      {!compact && (
        <>
          <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", padding: 12, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Live Signals</div>
            <div style={{ display: "grid", gap: 6 }}>
              {[
                "Poll: Encore track voting open",
                "Gift Queue: 3 pending highlights",
                "Announcement: Backstage opens in 04:12",
              ].map((line) => (
                <div key={line} style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.03)", padding: "6px 8px", fontSize: 11, color: "rgba(245,239,255,0.76)" }}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", padding: 12, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Nearby Rooms</div>
            <div style={{ fontSize: 13, color: "rgba(245, 239, 255, 0.85)", lineHeight: 1.7 }}>
              Cypher Circle • 4,231
              <br />
              Beat Battle Arena • 2,156
              <br />
              World Dance Party • 8,742
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function WorkspaceShellV2PreviewPage() {
  const [workspaceRole, setWorkspaceRole] = useState<WorkspaceRole>("fan");

  return (
    <WorkspaceShell
      workspaceRole={workspaceRole}
      globalHeader={<GlobalHeader />}
      leftLauncher={({ compact, pinned }) => (
        <LeftLauncher workspaceRole={workspaceRole} compact={compact} pinned={pinned} onRoleChange={setWorkspaceRole} />
      )}
      heroStage={<HeroStage />}
      rightSocialRail={({ mode }) => <RightSocialRail mode={mode} />}
    />
  );
}

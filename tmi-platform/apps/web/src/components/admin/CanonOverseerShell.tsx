"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LiveCameraPreview } from "@/components/media/LiveCameraPreview";
import OverlayHost from "@/components/shell/OverlayHost";
// 12-panel layout assembling all existing overseer sub-panels
//
// LAYOUT (bottom → top of import precedence):
//   Row 0 (full-width): OverseerDock — Quick Dock / Chain Pulse / Alerts / Actions
//   Row 1 (3-col grid):
//     Left  — ChainCommandPanel · BigAceFinancePanel · BotSummonDeck · UnifiedInbox
//     Center — LiveFeedRouter (TV Screen Router / Boardroom) · FeedExplorer (Live Feed Explorer)
//     Right  — SentinelWall · AccountLinker · RevenueAnalytics · MagazineAnalytics

import OverseerDock            from "@/components/admin/overseer/OverseerDock";
import Canister                from "@/components/admin/overseer/Canister";
import ChainCommandPanel       from "@/components/admin/overseer/ChainCommandPanel";
import FeedExplorer            from "@/components/admin/overseer/FeedExplorer";
import SentinelWall            from "@/components/admin/overseer/SentinelWall";
import AccountLinker           from "@/components/admin/overseer/AccountLinker";
import MagazineAnalytics       from "@/components/admin/overseer/MagazineAnalytics";
// RevenueAnalytics is LEGACY (hardcoded demo data, see file header) — the
// real Stripe-backed replacement is AdminRevenuePanel. Wiring it in directly
// so the Overseer Deck's revenue panel shows real telemetry, not fake numbers.
import AdminRevenuePanel        from "@/components/admin/AdminRevenuePanel";
import StripeObservatoryCard    from "@/components/admin/StripeObservatoryCard";
import UnifiedInbox            from "@/components/admin/overseer/UnifiedInbox";
import LiveFeedRouter          from "@/components/admin/overseer/LiveFeedRouter";
import BotSummonDeck           from "@/components/admin/BotSummonDeck";
import BigAceFinancePanel      from "@/components/admin/BigAceFinancePanel";
import MediaMatrixEngine       from "@/components/admin/overseer/workspace/widgets/MediaMatrixEngine";
import HQDock from "@/components/admin/overseer/HQDock";
import { resolveDockItems } from "@/components/admin/overseer/services/DockRegistry";
import { useDrawerManager } from "@/components/admin/overseer/services/DrawerManager";

export type ShellDockButton = {
  label: string;
  href: string;
};

export type ShellPanel = {
  id?: string;
  title: string;
  accent?: string;
  statusLabel?: string;
  content: ReactNode;
  fixedHeight?: number;
  flex?: number;
  fullscreenKey?: string;
};

export type ShellWorkspaceDefinition = {
  title: string;
  ribbon?: ReactNode;
  leftRail: ShellPanel[];
  center: ShellPanel[];
  rightRail: ShellPanel[];
  bottom: ShellPanel[];
  dockButtons?: ShellDockButton[];
};

type CanonOverseerShellProps = {
  workspace?: ShellWorkspaceDefinition;
};

// ─── Shell ─────────────────────────────────────────────────────────────────────

export default function CanonOverseerShell({ workspace }: CanonOverseerShellProps) {
  const [fullscreenPanel, setFullscreenPanel] = useState<string | null>(null);
  const [clock, setClock] = useState<string>("");
  const [cameraOverlayOpen, setCameraOverlayOpen] = useState(false);
  const drawerManager = useDrawerManager();

  useEffect(() => {
    const updateClock = () =>
      setClock(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }));
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!cameraOverlayOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCameraOverlayOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cameraOverlayOpen]);

  const defaultWorkspace = useMemo<ShellWorkspaceDefinition>(
    () => ({
      title: "Marcel - Founder and CEO",
      leftRail: [
        { id: "chain-command", title: "CHAIN COMMAND", accent: "#AA2DFF", content: <ChainCommandPanel /> },
        { title: "MONEY & BILLING", accent: "#FFD700", content: <BigAceFinancePanel /> },
        { title: "BOT ROSTER & SUMMON", accent: "#FF2DAA", content: <BotSummonDeck />, flex: 1 },
        { id: "unified-inbox", title: "UNIFIED INBOX", accent: "#00FFFF", content: <UnifiedInbox /> },
      ],
      center: [
        {
          id: "live-feed-router",
          title: "TV SCREEN ROUTER · BOARDROOM LIVE",
          accent: "#00FFFF",
          content: <MediaMatrixEngine />,
          fixedHeight: 340,
          fullscreenKey: "tv",
        },
        {
          title: "LIVE FEED EXPLORER",
          accent: "#00FFFF",
          content: <FeedExplorer />,
          flex: 1,
          fullscreenKey: "feed",
        },
      ],
      rightRail: [
        { id: "sentinel-wall", title: "SECURITY SENTINEL WALL", accent: "#FF4444", content: <SentinelWall /> },
        { title: "ACCOUNT LINKER", accent: "#AA2DFF", content: <AccountLinker /> },
        { title: "STRIPE WEBHOOK INTEGRITY", accent: "#00FFFF", content: <StripeObservatoryCard />, flex: 1 },
      ],
      bottom: [
        {
          id: "revenue-analytics",
          title: "ARTIST REVENUE & BUYOUTS",
          accent: "#FFD700",
          content: (
            <AdminRevenuePanel
              selectedId="billing"
              onSelect={(id) => {
                window.location.href = id === "artist-analytics" ? "/admin/artist-analytics" : "/admin/revenue";
              }}
            />
          ),
          fullscreenKey: "revenue",
        },
        { title: "MAGAZINE & INDEX ANALYTICS", accent: "#FF2DAA", content: <MagazineAnalytics /> },
      ],
      dockButtons: [
        { label: "Go Back", href: "/admin" },
        { label: "Voice", href: "/admin/overseer#live-feed-router" },
        { label: "Audio", href: "/admin/overseer#live-feed-router" },
        { label: "Disclaimer", href: "/legal/disclaimer" },
        { label: "Revenue", href: "/admin/revenue" },
        { label: "Messages", href: "/admin/messages" },
        { label: "Users", href: "/admin/users" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Camera", href: "#" }, // Placeholder for camera toggle
        { label: "Power", href: "/" },
      ],
    }),
    [],
  );

  const activeWorkspace = workspace ?? defaultWorkspace;

  const dockItems = useMemo(
    () => resolveDockItems(activeWorkspace.dockButtons),
    [activeWorkspace.dockButtons],
  );

  const leftCollapsed = drawerManager.isRailCollapsed("left");
  const rightCollapsed = drawerManager.isRailCollapsed("right");
  const bottomCollapsed = drawerManager.isRailCollapsed("bottom");

  const leftWidth = leftCollapsed ? 74 : 268;
  const rightWidth = rightCollapsed ? 74 : 268;
  const bottomHeight = bottomCollapsed ? 44 : 230;

  const toggleFullscreen = (panelId: string) => {
    setFullscreenPanel((curr) => (curr === panelId ? null : panelId));
  };

  const shellGridTemplate = fullscreenPanel
    ? "1fr"
    : `${leftWidth}px minmax(0,1fr) ${rightWidth}px`;

  const allPanels = useMemo(
    () => [
      ...activeWorkspace.leftRail,
      ...activeWorkspace.center,
      ...activeWorkspace.rightRail,
      ...activeWorkspace.bottom,
    ],
    [activeWorkspace],
  );

  const fullscreenMatch = allPanels.find((panel) => panel.fullscreenKey === fullscreenPanel);

  const renderFullscreen = () => {
    if (!fullscreenMatch) return null;
    return fullscreenMatch.content;
  };

  const isFloatingPanel = (panel: ShellPanel) =>
    Boolean(panel.id && drawerManager.getWindowState(panel.id)?.mode === "floating");

  const floatingCanisterStyle = (panel: ShellPanel) => ({
    position: "fixed" as const,
    left: drawerManager.getWindowState(panel.id as string)?.x ?? 32,
    top: drawerManager.getWindowState(panel.id as string)?.y ?? 32,
    width: panel.id && activeWorkspace.bottom.some((b) => b.id === panel.id)
      ? 560
      : "min(720px, calc(100vw - 48px))",
    height: panel.fixedHeight ? panel.fixedHeight : activeWorkspace.bottom.some((b) => b.id === panel.id) ? 320 : 360,
    minWidth: 320,
    minHeight: 220,
    zIndex: 1,
    pointerEvents: "auto" as const,
  });

  const renderPanelCanister = (
    panel: ShellPanel,
    collapsed: boolean,
    floating: boolean,
    canisterStyle?: React.CSSProperties,
  ) => (
    <Canister
      key={panel.id ?? panel.title}
      id={panel.id}
      title={panel.title}
      accent={panel.accent ?? "#00FFFF"}
      statusLabel={panel.statusLabel}
      collapsed={collapsed}
      floating={floating}
      onToggleFullscreen={panel.fullscreenKey ? () => toggleFullscreen(panel.fullscreenKey as string) : undefined}
      onToggleFloat={panel.id ? () => drawerManager.toggleWindowFloat(panel.id as string) : undefined}
      onCloseWindow={panel.id ? () => drawerManager.closeWindow(panel.id as string) : undefined}
      style={{
        ...(panel.fixedHeight ? { flex: `0 0 ${panel.fixedHeight}px` } : {}),
        ...(panel.flex ? { flex: panel.flex } : {}),
        ...(canisterStyle ?? {}),
      }}
      onToggleCollapse={panel.id ? undefined : undefined}
    >
      <div
        onPointerDown={panel.id && floating ? (event) => drawerManager.beginDrag(panel.id as string, event) : undefined}
        onPointerMove={panel.id && floating ? drawerManager.moveDrag : undefined}
        onPointerUp={panel.id && floating ? drawerManager.endDrag : undefined}
        style={{ height: "100%" }}
      >
        {panel.content}
      </div>
    </Canister>
  );

  const renderRail = (panels: ShellPanel[], rail: "left" | "center" | "right") => {
    const isLeft = rail === "left";
    const isRight = rail === "right";

    return (
      <div
        data-col={rail}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minHeight: 0,
          overflowY: "auto",
          paddingRight: 2,
        }}
      >
        {panels
          .filter((panel) => !isFloatingPanel(panel))
          .map((panel) => renderPanelCanister(panel, isLeft ? leftCollapsed : isRight ? rightCollapsed : false, false))}
      </div>
    );
  };

  return (
    <div
      data-canon-overseer-shell
      style={{
        minHeight: "100vh",
        height: "100vh",
        background:
          "radial-gradient(130% 90% at 50% -5%, rgba(92,26,74,0.45) 0%, rgba(28,10,32,0.85) 46%, rgba(7,3,12,1) 100%)",
        border: "14px solid transparent",
        borderImage: "linear-gradient(135deg, #ffd700 0%, #b8860b 35%, #ffd700 50%, #b8860b 65%, #ffd700 100%) 14",
        boxShadow:
          "inset 0 0 90px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,215,0,0.15), 0 16px 40px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: 10,
        fontFamily: "inherit",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Corner Fuchsia Gems */}
      <div style={{ position: "absolute", top: 2, left: 2, width: 14, height: 14, background: "radial-gradient(circle, #e066ff, #8b008b)", border: "2px solid #D4AF37", transform: "rotate(45deg)", boxShadow: "0 0 8px #e066ff, inset 0 0 3px #fff", zIndex: 200 }} />
      <div style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, background: "radial-gradient(circle, #e066ff, #8b008b)", border: "2px solid #D4AF37", transform: "rotate(45deg)", boxShadow: "0 0 8px #e066ff, inset 0 0 3px #fff", zIndex: 200 }} />
      <div style={{ position: "absolute", bottom: 2, left: 2, width: 14, height: 14, background: "radial-gradient(circle, #e066ff, #8b008b)", border: "2px solid #D4AF37", transform: "rotate(45deg)", boxShadow: "0 0 8px #e066ff, inset 0 0 3px #fff", zIndex: 200 }} />
      <div style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, background: "radial-gradient(circle, #e066ff, #8b008b)", border: "2px solid #D4AF37", transform: "rotate(45deg)", boxShadow: "0 0 8px #e066ff, inset 0 0 3px #fff", zIndex: 200 }} />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(transparent 96%, rgba(255,215,0,0.06) 96%), linear-gradient(90deg, transparent 96%, rgba(0,255,255,0.05) 96%)",
          backgroundSize: "100% 24px, 24px 100%",
          opacity: 0.25,
        }}
      />

      {/* Main Header */}
      <div
        style={{
          position: "relative",
          zIndex: 100,
          border: "2px solid #D4AF37",
          borderRadius: 10,
          background: "linear-gradient(180deg, #2b1822 0%, #150910 100%)",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.6), inset 0 0 10px rgba(255,215,0,0.15)",
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FFD700, #B8860B)",
            boxShadow: "0 0 8px #FFD700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#150910",
            fontSize: 11,
            fontWeight: 900
          }}>
            B
          </div>
          <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 900, letterSpacing: "0.05em" }}>
            BerntttGlobal
          </span>
        </div>

        {/* Center: System Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
            OVERSEER DECK
          </span>
          
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,0,136,0.4)", background: "rgba(255,0,136,0.1)", borderRadius: 6, padding: "2px 8px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF0088", boxShadow: "0 0 6px #FF0088" }} />
            <span style={{ color: "#FF8FBE", fontSize: 8, fontWeight: 900 }}>LIVE 2.1M</span>
          </div>

          <span style={{ color: "#FFD700", fontSize: 9, fontWeight: 900, border: "1.5px solid #D4AF37", borderRadius: 4, padding: "1px 6px" }}>
            DPE
          </span>

          {/* Pulsing Audio Wave Visualizer SVG */}
          <svg width="150" height="14" style={{ opacity: 0.8, verticalAlign: "middle" }}>
            <path d="M0,7 C30,0 45,14 75,7 C105,0 120,14 150,7" fill="none" stroke="#FF5500" strokeWidth="1.5">
              <animate attributeName="d" values="M0,7 C30,0 45,14 75,7 C105,0 120,14 150,7; M0,7 C30,14 45,0 75,7 C105,14 120,0 150,7; M0,7 C30,0 45,14 75,7 C105,0 120,14 150,7" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M0,7 C30,14 45,0 75,7 C105,14 120,0 150,7" fill="none" stroke="#00FFFF" strokeWidth="1">
              <animate attributeName="d" values="M0,7 C30,14 45,0 75,7 C105,14 120,0 150,7; M0,7 C30,0 45,14 75,7 C105,0 120,14 150,7; M0,7 C30,14 45,0 75,7 C105,14 120,0 150,7" dur="2.5s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>

        {/* Right: Time & Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.05em" }}>
            11.45 AM EST
          </span>
          <div style={{ display: "flex", gap: 6, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            <span style={{ cursor: "pointer" }}>🔔</span>
            <span style={{ cursor: "pointer" }}>⚙</span>
          </div>
        </div>
      </div>

      {/* Sub-Header Dock row */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "linear-gradient(180deg, #1b0914 0%, #0d040a 100%)",
          border: "2px solid #D4AF37",
          borderRadius: 10,
          padding: "6px 12px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "0 3px 10px rgba(0,0,0,0.5)",
        }}
      >
        <button style={{ background: "linear-gradient(180deg, #5b217a 0%, #301042 100%)", border: "1.5px solid #D4AF37", borderRadius: 6, color: "#ffe3a3", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
          QUICK DOCK
        </button>
        <button style={{ background: "rgba(255,68,68,0.1)", border: "1.5px solid #FF4444", borderRadius: 6, color: "#FF8A8A", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
          TAX LOSE <span style={{ background: "#FF4444", color: "#fff", fontSize: 7, padding: "1px 3px", borderRadius: 3, marginLeft: 3 }}>DOPN</span>
        </button>
        <button style={{ background: "rgba(0,191,255,0.1)", border: "1.5px solid #00BFFF", borderRadius: 6, color: "#87CEFA", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
          ALERTB <span style={{ background: "#00BFFF", color: "#fff", fontSize: 7, padding: "1px 3px", borderRadius: 3, marginLeft: 3 }}>8</span>
        </button>
        <button style={{ background: "rgba(255,20,147,0.1)", border: "1.5px solid #FF1493", borderRadius: 6, color: "#FF69B4", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
          CHAIN PULSE
        </button>
        <button style={{ background: "linear-gradient(180deg, #5b217a 0%, #301042 100%)", border: "1.5px solid #D4AF37", borderRadius: 6, color: "#ffe3a3", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
          Start Meeting
        </button>
        <button style={{ background: "linear-gradient(180deg, #5b217a 0%, #301042 100%)", border: "1.5px solid #D4AF37", borderRadius: 6, color: "#ffe3a3", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
          Summon Big Ace
        </button>
        <button style={{ background: "linear-gradient(180deg, #5b217a 0%, #301042 100%)", border: "1.5px solid #D4AF37", borderRadius: 6, color: "#ffe3a3", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
          Approve Queue
        </button>
      </div>

      {activeWorkspace.ribbon ? (
        <Canister title={activeWorkspace.title.toUpperCase()} accent="#FFD700" style={{ borderRadius: 10, position: "relative", zIndex: 1 }}>
          {activeWorkspace.ribbon}
        </Canister>
      ) : null}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexWrap: "wrap",
          padding: "0 2px",
          justifyContent: "flex-end",
        }}
      >
        <button type="button" onClick={() => drawerManager.toggleRail("left")} style={{ borderRadius: 999, border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.06)", color: "rgba(255,215,0,0.75)", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", cursor: "pointer" }}>
          {leftCollapsed ? "◀" : "◁"} Left
        </button>
        <button type="button" onClick={() => drawerManager.toggleRail("bottom")} style={{ borderRadius: 999, border: "1px solid rgba(170,45,255,0.35)", background: "rgba(170,45,255,0.06)", color: "rgba(216,135,255,0.75)", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", cursor: "pointer" }}>
          {bottomCollapsed ? "▲" : "▼"} Analytics
        </button>
        <button type="button" onClick={() => drawerManager.toggleRail("right")} style={{ borderRadius: 999, border: "1px solid rgba(0,255,255,0.35)", background: "rgba(0,255,255,0.06)", color: "rgba(115,255,255,0.75)", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", cursor: "pointer" }}>
          Right {rightCollapsed ? "▶" : "▷"}
        </button>
      </div>

      <div
        data-row="workspace"
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          transition: "all 280ms ease",
        }}
      >
        <div
          data-row="main"
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: shellGridTemplate,
            gap: 6,
            border: "1px solid rgba(255,215,0,0.18)",
            borderRadius: 10,
            padding: 6,
            background: "linear-gradient(180deg, rgba(255,215,0,0.04), rgba(255,255,255,0.02))",
            transition: "all 280ms ease",
          }}
        >
          {fullscreenPanel ? (
            <Canister
              title="FOCUS MODE"
              accent="#00FFFF"
              statusLabel="FOCUSED"
              onToggleFullscreen={() => setFullscreenPanel(null)}
              style={{ minHeight: 0 }}
            >
              {renderFullscreen()}
            </Canister>
          ) : (
            <>
              {renderRail(activeWorkspace.leftRail, "left")}
              {renderRail(activeWorkspace.center, "center")}
              {renderRail(activeWorkspace.rightRail, "right")}
            </>
          )}
        </div>

        <div
          data-row="bottom"
          style={{
            height: bottomHeight,
            minHeight: bottomHeight,
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, activeWorkspace.bottom.length)}, minmax(0, 1fr))`,
            gap: 6,
            border: "1px solid rgba(255,215,0,0.18)",
            borderRadius: 10,
            padding: 6,
            background: "linear-gradient(180deg, rgba(255,45,170,0.03), rgba(255,215,0,0.03))",
            transition: "all 280ms ease",
          }}
        >
          {activeWorkspace.bottom
            .filter((panel) => !isFloatingPanel(panel))
            .map((panel) => renderPanelCanister(panel, bottomCollapsed, false))}
        </div>

        <div
          data-row="dock-bottom"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 24px",
            background: "linear-gradient(180deg, #2b1822 0%, #150910 100%)",
            border: "3px solid #b8860b",
            borderRadius: 14,
            boxShadow: "0 0 20px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,215,0,0.15)",
            position: "relative",
            marginTop: 10,
          }}
        >
          {/* Left Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/admin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
                border: "2px solid #D4AF37",
                borderRadius: 10,
                color: "#ffe3a3",
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
              }}
            >
              ◀ Go Back
            </Link>
            <button
              type="button"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
                border: "2px solid #D4AF37",
                color: "#ffe3a3",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
              }}
              title="Toggle Microphone"
            >
              🎤
            </button>
            <button
              type="button"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
                border: "2px solid #D4AF37",
                color: "#ffe3a3",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
              }}
              title="Toggle Volume"
            >
              🔊
            </button>
          </div>

          {/* Center Diamond Gem */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) rotate(45deg)",
              width: 30,
              height: 30,
              background: "radial-gradient(circle, #e066ff, #8b008b)",
              border: "3px solid #D4AF37",
              boxShadow: "0 0 15px #e066ff, inset 0 0 5px rgba(255,255,255,0.8)",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={() => setCameraOverlayOpen((prev) => !prev)}
            title="Consensus / Camera Toggle"
          />

          {/* Right Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
                border: "2px solid #D4AF37",
                color: "#ffe3a3",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
              }}
              title="Database"
            >
              📂
            </button>
            <button
              type="button"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
                border: "2px solid #D4AF37",
                color: "#ffe3a3",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
              }}
              title="Profile"
            >
              👤
            </button>
            <button
              type="button"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
                border: "2px solid #D4AF37",
                color: "#ffe3a3",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
              }}
              title="Settings"
            >
              ⚙
            </button>
            <Link
              href="/"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #c0392b 0%, #7f0c0d 100%)",
                border: "2px solid #D4AF37",
                color: "#fff",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
              }}
              title="Exit"
            >
              ⏻
            </Link>
          </div>
        </div>
      </div>

      <OverlayHost zIndex={1000} pointerEvents="none">
        {activeWorkspace.leftRail
          .concat(activeWorkspace.center)
          .concat(activeWorkspace.rightRail)
          .concat(activeWorkspace.bottom ?? [])
          .filter((panel) => isFloatingPanel(panel))
          .map((panel) => (
            <div key={`floating-${panel.id ?? panel.title}`} style={floatingCanisterStyle(panel)}>
              {renderPanelCanister(panel, false, true)}
            </div>
          ))}

        {Object.entries(drawerManager.rawState?.windows ?? {})
          .filter(([, state]) => state.mode === "closed")
          .map(([id], index) => {
            const panel = allPanels.find((item) => item.id === id);
            if (!panel) return null;
            return (
              <button
                key={`restore-${id}`}
                type="button"
                onClick={() => drawerManager.restoreWindow(id)}
                style={{
                  position: "fixed",
                  right: 16,
                  bottom: 16 + index * 42,
                  zIndex: 1200,
                  borderRadius: 999,
                  border: "1px solid rgba(255,215,0,0.45)",
                  background: "linear-gradient(180deg, rgba(255,215,0,0.16), rgba(255,215,0,0.06))",
                  color: "#FFD88F",
                  padding: "8px 12px",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
              >
                Restore {panel.title}
              </button>
            );
          })}

        {/* Camera Overlay is now managed within the OverlayHost */}
      </OverlayHost>

      <div
        id="tmi-flight-deck"
        className="tmi-flight-deck"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        {/* The portal target for all floating elements */}
        {cameraOverlayOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1300,
                background: "rgba(1, 3, 8, 0.45)",
                pointerEvents: "auto",
              }}
              onClick={() => setCameraOverlayOpen(false)}
            >
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 92,
                  width: "min(420px, calc(100vw - 32px))",
                  pointerEvents: "auto",
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing the overlay
              >
                <Canister
                  id="observatory-camera-overlay"
                  title="ADMIN CAMERA"
                  accent="#00FFFF"
                  statusLabel="ON DEMAND"
                  style={{ minHeight: 250 }}
                  onCloseWindow={() => setCameraOverlayOpen(false)}
                >
                  <div style={{ aspectRatio: "16 / 9", width: "100%", minHeight: 220 }}>
                    <LiveCameraPreview />
                  </div>
                </Canister>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
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
        border: "1px solid rgba(255,215,0,0.35)",
        boxShadow:
          "inset 0 0 90px rgba(0,0,0,0.78), inset 0 0 0 1px rgba(255,215,0,0.08), 0 16px 40px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: 6,
        fontFamily: "inherit",
        position: "relative",
        overflow: "hidden",
      }}
    >
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          border: "1px solid rgba(255,215,0,0.35)",
          borderRadius: 10,
          background: "linear-gradient(180deg, rgba(43,18,24,0.92), rgba(14,8,14,0.92))",
          padding: "8px 10px",
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ color: "#FFD700", fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Admin OS
          </span>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activeWorkspace.title}
          </span>
        </div>
        <span style={{ borderRadius: 999, border: "1px solid rgba(0,255,136,0.45)", background: "rgba(0,255,136,0.11)", color: "#00FF88", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px" }}>
          System PASS
        </span>
        <span style={{ borderRadius: 999, border: "1px solid rgba(255,215,0,0.4)", background: "rgba(255,215,0,0.12)", color: "#FFD88F", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px" }}>
          Workspace Active
        </span>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{clock}</span>
      </div>

      {/* ── Row 0: Overseer Dock (full width) ── */}
      <div data-row="dock" style={{ position: "relative", zIndex: 1 }}>
        <Canister title="OVERSEER DOCK" accent="#FFD700" style={{ borderRadius: 10 }}>
          <OverseerDock />
        </Canister>
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

        <div data-row="dock-bottom">
          <HQDock items={dockItems} onCameraToggle={() => setCameraOverlayOpen((prev) => !prev)} cameraActive={cameraOverlayOpen} />
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

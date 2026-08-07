"use client";

/**
 * OverseerFlightDeck — ground-up Two-Deck layout (Marcel mandate 2026-07-29)
 *
 * Foundation: two equal stacked 16:9 monitors with ornate gold/brass bezels.
 * Page extends (scrollable) — never 100vh squash.
 *
 * HEADER (minimal brand + LIVE) →
 * OPERATIONS (LeftRail | MonitorStack×2 | RightRail) →
 * LIVE CHANNEL TICKER →
 * LIVING OS CONTROL DESK (Phase 1 rail + primary workspace) →
 * INTELLIGENCE DECK →
 * sticky bottom gem dock (Admin Concierge + Admin Cam on demand)
 *
 * Supersedes congested CanonOverseerShell patch attempts (Quick Dock / fake alert pills /
 * top Admin Quick Switch oval bar). CanonOverseerShell re-exports this module.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import OverlayHost from "@/components/shell/OverlayHost";
import Canister from "@/components/admin/overseer/Canister";
import ChainCommandPanel from "@/components/admin/overseer/ChainCommandPanel";
import FeedExplorer from "@/components/admin/overseer/FeedExplorer";
import SentinelWall from "@/components/admin/overseer/SentinelWall";
import AccountLinker from "@/components/admin/overseer/AccountLinker";
import MagazineAnalytics from "@/components/admin/overseer/MagazineAnalytics";
import AdminRevenuePanel from "@/components/admin/AdminRevenuePanel";
import StripeObservatoryCard from "@/components/admin/StripeObservatoryCard";
import UnifiedInbox from "@/components/admin/overseer/UnifiedInbox";
import BotSummonDeck from "@/components/admin/BotSummonDeck";
import BigAceFinancePanel from "@/components/admin/BigAceFinancePanel";
import MediaMatrixEngine from "@/components/admin/overseer/workspace/widgets/MediaMatrixEngine";
import LiveChannelTicker from "@/components/admin/overseer/LiveChannelTicker";
import ObservatoryControlDesk from "@/components/admin/overseer/ObservatoryControlDesk";
import OverseerSectionSwitcher from "@/components/admin/overseer/OverseerSectionSwitcher";
import OverseerQuickControlRow from "@/components/admin/overseer/OverseerQuickControlRow";
import {
  renderOverseerCenterView,
  type OverseerCenterViewId,
} from "@/components/admin/overseer/OverseerCommandViews";
import { buildSurroundSectionOptions } from "@/components/admin/overseer/overseerSurroundSections";
import { useDrawerManager } from "@/components/admin/overseer/services/DrawerManager";
import AdminConciergePanel from "@/components/admin/AdminConciergePanel";
import CanonicalDualMonitorStack, { type MonitorSplitMode } from "@/components/monitors/CanonicalDualMonitorStack";
import BotActivitySwitcherPanel from "@/components/admin/overseer/BotActivitySwitcherPanel";

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

type OverseerFlightDeckProps = {
  workspace?: ShellWorkspaceDefinition;
  operatorLabel?: string;
  fullControl?: boolean;
  canAutoApplyFixes?: boolean;
  onSuggestFix?: () => void | Promise<void>;
  submittingFix?: boolean;
};

const DECK_GAP = 16;
const RAIL_EXPANDED = 268;
const RAIL_COLLAPSED = 74;

function gemStyle(active = false): CSSProperties {
  return {
    position: "absolute",
    width: 14,
    height: 14,
    background: active
      ? "radial-gradient(circle, #66ffaa, #008844)"
      : "radial-gradient(circle, #e066ff, #8b008b)",
    border: "2px solid #D4AF37",
    transform: "rotate(45deg)",
    boxShadow: active
      ? "0 0 8px #00FF88, inset 0 0 3px #fff"
      : "0 0 8px #e066ff, inset 0 0 3px #fff",
    zIndex: 200,
  };
}

export default function OverseerFlightDeck({
  workspace,
  operatorLabel = "Admin",
  fullControl = false,
  canAutoApplyFixes = false,
  onSuggestFix,
  submittingFix = false,
}: OverseerFlightDeckProps) {
  const [fullscreenPanel, setFullscreenPanel] = useState<string | null>(null);
  const [clock, setClock] = useState("");
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [botIntelOpen, setBotIntelOpen] = useState(false);
  const [localSubmittingFix, setLocalSubmittingFix] = useState(false);
  const [centerView, setCenterView] = useState<OverseerCenterViewId>("media");
  const [flipKey, setFlipKey] = useState(0);
  const [monitorSplits, setMonitorSplits] = useState<[MonitorSplitMode, MonitorSplitMode]>([1, 1]);
  const [isMerging, setIsMerging] = useState(false);
  const mergeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const drawerManager = useDrawerManager();

  // cascade all monitors to split=1 with staggered animation
  const mergeAllMonitors = useCallback(() => {
    setIsMerging(true);
    mergeTimers.current.forEach(clearTimeout);
    mergeTimers.current = [
      setTimeout(() => setMonitorSplits((s) => [s[0], 1]), 0),
      setTimeout(() => setMonitorSplits((_s) => [1, 1]), 280),
      setTimeout(() => setIsMerging(false), 600),
    ];
  }, []);

  // cascade all monitors to a target split
  const expandAllMonitors = useCallback((n: MonitorSplitMode) => {
    mergeTimers.current.forEach(clearTimeout);
    mergeTimers.current = [
      setTimeout(() => setMonitorSplits((s) => [n, s[1]]), 0),
      setTimeout(() => setMonitorSplits((_s) => [n, n]), 280),
    ];
  }, []);

  useEffect(() => {
    return () => { mergeTimers.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#bot-activity") setBotIntelOpen(true);
    const onHash = () => {
      if (window.location.hash === "#bot-activity") setBotIntelOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const selectCenterView = (view: OverseerCenterViewId) => {
    setCenterView(view);
    setFlipKey((k) => k + 1);
    if (view !== "media") setFullscreenPanel(null);
  };

  const openBotIntel = () => {
    setBotIntelOpen(true);
    try {
      // Prefer left intelligence rail section switcher when present
      window.localStorage.setItem("tmi.overseer.sectionSlot.v1:surround:bot-roster", "bot-activity");
    } catch {
      /* ignore */
    }
  };

  const handleOpsAction = (action: string) => {
    const scrollTo = (id: string) => {
      const el = document.getElementById(id);
      if (el instanceof HTMLElement) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    if (action === "alerts") scrollTo("sentinel-wall");
    if (action === "chain-pulse") scrollTo("chain-command");
    if (action === "summon") {
      openBotIntel();
      scrollTo("bot-roster");
    }
    if (action === "start-meeting") selectCenterView("observatory");
  };

  const handleSuggestFix = async () => {
    if (onSuggestFix) {
      await onSuggestFix();
      return;
    }
    const issue = window.prompt("What should we fix right now?");
    if (!issue || !issue.trim()) return;
    setLocalSubmittingFix(true);
    try {
      const response = await fetch("/api/admin/fix-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: issue.trim(),
          operator: operatorLabel,
          autoApply: canAutoApplyFixes,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        status?: string;
        ticketId?: string;
        error?: string;
      };
      if (!response.ok) {
        window.alert(payload.error ?? "Could not submit fix intake.");
        return;
      }
      window.alert(
        `${payload.status === "auto-fixed" ? "Auto-fixed" : "Queued"} as ${payload.ticketId ?? "ticket"}.`,
      );
    } catch {
      window.alert("Network error while sending fix intake.");
    } finally {
      setLocalSubmittingFix(false);
    }
  };

  useEffect(() => {
    const updateClock = () =>
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  const defaultWorkspace = useMemo<ShellWorkspaceDefinition>(
    () => ({
      title: "Marcel - Founder and CEO",
      leftRail: [
        { id: "chain-command", title: "CHAIN COMMAND", accent: "#AA2DFF", content: <ChainCommandPanel /> },
        { id: "money-billing", title: "MONEY & BILLING", accent: "#FFD700", content: <BigAceFinancePanel /> },
        { id: "bot-roster", title: "BOT ROSTER & SUMMON", accent: "#FF2DAA", content: (
            <div style={{ height: "100%", maxHeight: 380, overflowY: "auto", overflowX: "hidden" }}>
              <BotSummonDeck />
            </div>
          ), fixedHeight: 400 },
        { id: "unified-inbox", title: "UNIFIED INBOX", accent: "#00FFFF", content: <UnifiedInbox /> },
      ],
      center: [
        {
          id: "live-feed-router",
          title: "TV SCREEN ROUTER · LIVE MONITOR WALL",
          accent: "#00FFFF",
          content: <MediaMatrixEngine />,
          flex: 1,
          fullscreenKey: "tv",
        },
        {
          id: "live-feed-explorer",
          title: "LIVE FEED EXPLORER",
          accent: "#00FFFF",
          content: <FeedExplorer />,
          flex: 1,
          fullscreenKey: "feed",
        },
      ],
      rightRail: [
        { id: "sentinel-wall", title: "SECURITY SENTINEL WALL", accent: "#FF4444", content: <SentinelWall /> },
        { id: "account-linker", title: "ACCOUNT LINKER", accent: "#AA2DFF", content: <AccountLinker /> },
        { id: "stripe-observatory", title: "STRIPE WEBHOOK INTEGRITY", accent: "#00FFFF", content: <StripeObservatoryCard />, flex: 1 },
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
                window.location.href =
                  id === "artist-analytics" ? "/admin/artist-analytics" : "/admin/revenue";
              }}
            />
          ),
          fullscreenKey: "revenue",
        },
        { id: "magazine-analytics", title: "MAGAZINE & INDEX ANALYTICS", accent: "#FF2DAA", content: <MagazineAnalytics /> },
      ],
      dockButtons: [
        { label: "Go Back", href: "/admin" },
        { label: "Revenue", href: "/admin/revenue" },
        { label: "Messages", href: "/admin/messages" },
        { label: "Users", href: "/admin/users" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Power", href: "/" },
      ],
    }),
    [],
  );

  const activeWorkspace = workspace ?? defaultWorkspace;
  const leftCollapsed = drawerManager.isRailCollapsed("left");
  const rightCollapsed = drawerManager.isRailCollapsed("right");
  const bottomCollapsed = drawerManager.isRailCollapsed("bottom");
  const leftWidth = leftCollapsed ? RAIL_COLLAPSED : RAIL_EXPANDED;
  const rightWidth = rightCollapsed ? RAIL_COLLAPSED : RAIL_EXPANDED;
  const intelligenceMinHeight = bottomCollapsed ? 48 : 560;

  const toggleFullscreen = (panelId: string) => {
    setFullscreenPanel((curr) => (curr === panelId ? null : panelId));
  };

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

  const isFloatingPanel = (panel: ShellPanel) =>
    Boolean(panel.id && drawerManager.getWindowState(panel.id)?.mode === "floating");

  const floatingCanisterStyle = (panel: ShellPanel): CSSProperties => ({
    position: "fixed",
    left: drawerManager.getWindowState(panel.id as string)?.x ?? 32,
    top: drawerManager.getWindowState(panel.id as string)?.y ?? 32,
    width: panel.id && activeWorkspace.bottom.some((b) => b.id === panel.id)
      ? 560
      : "min(720px, calc(100vw - 48px))",
    height: panel.fixedHeight
      ? panel.fixedHeight
      : activeWorkspace.bottom.some((b) => b.id === panel.id)
        ? 320
        : 360,
    minWidth: 320,
    minHeight: 220,
    zIndex: 1,
    pointerEvents: "auto",
  });

  const surroundSections = useMemo(() => buildSurroundSectionOptions(), []);

  const renderPanelCanister = (
    panel: ShellPanel,
    collapsed: boolean,
    floating: boolean,
    canisterStyle?: CSSProperties,
    /** Side/intelligence slots rotate; center dual media monitors stay fixed. */
    enableSectionSwitcher = false,
  ) => {
    const slotId = panel.id ?? panel.title;
    const body =
      enableSectionSwitcher ? (
        <OverseerSectionSwitcher
          slotId={`surround:${slotId}`}
          defaultLabel={panel.title}
          defaultContent={panel.content}
          sections={surroundSections}
          compact
        />
      ) : (
        panel.content
      );

    return (
      <Canister
        key={slotId}
        id={panel.id}
        title={panel.title}
        accent={panel.accent ?? "#00FFFF"}
        statusLabel={panel.statusLabel}
        collapsed={collapsed}
        floating={floating}
        onToggleFullscreen={
          panel.fullscreenKey ? () => toggleFullscreen(panel.fullscreenKey as string) : undefined
        }
        onToggleFloat={panel.id ? () => drawerManager.toggleWindowFloat(panel.id as string) : undefined}
        onCloseWindow={panel.id ? () => drawerManager.closeWindow(panel.id as string) : undefined}
        style={{
          ...(panel.fixedHeight ? { flex: `0 0 ${panel.fixedHeight}px` } : {}),
          ...(panel.flex ? { flex: panel.flex } : {}),
          ...(canisterStyle ?? {}),
        }}
      >
        <div
          onPointerDown={
            panel.id && floating
              ? (event) => drawerManager.beginDrag(panel.id as string, event)
              : undefined
          }
          onPointerMove={panel.id && floating ? drawerManager.moveDrag : undefined}
          onPointerUp={panel.id && floating ? drawerManager.endDrag : undefined}
          style={{ height: "100%" }}
        >
          {body}
        </div>
      </Canister>
    );
  };

  const renderRail = (panels: ShellPanel[], rail: "left" | "center" | "right") => {
    const isLeft = rail === "left";
    const isRight = rail === "right";
    const visible = panels.filter((panel) => !isFloatingPanel(panel));
    const equalDualCenter = rail === "center" && visible.length >= 2;
    const isSideRail = rail === "left" || rail === "right";

    if (equalDualCenter) {
      const dual = visible.slice(0, 2);
      const commandContent = renderOverseerCenterView(centerView);
      const showCommand = centerView !== "media" && commandContent != null;

      return (
        <div
          data-col={rail}
          data-equal-dual-monitors="true"
          data-center-view={centerView}
          style={{
            flex: 1,
            minWidth: 0,
            alignSelf: "stretch",
            height: "auto",
            overflowX: "hidden",
            paddingRight: 2,
            perspective: 1400,
          }}
        >
          <div
            key={flipKey}
            style={{
              transformStyle: "preserve-3d",
              animation: "overseer-center-flip 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            {showCommand ? (
              <div
                data-center-command-viewport
                style={{
                  minHeight: "min(70vh, 720px)",
                  aspectRatio: "16 / 9",
                  width: "100%",
                  borderRadius: 12,
                  border: "2px solid #D4AF37",
                  overflow: "hidden",
                  background: "#020210",
                  boxShadow: "0 0 24px rgba(0,255,255,0.12), inset 0 0 30px rgba(0,0,0,0.65)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "6px 10px",
                    borderBottom: "1px solid rgba(255,215,0,0.25)",
                    background: "rgba(0,0,0,0.65)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.14em",
                      color: "#00FFFF",
                      textTransform: "uppercase",
                    }}
                  >
                    Command Viewport · {centerView.replace(/-/g, " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectCenterView("media")}
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      padding: "3px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                      border: "1px solid rgba(255,215,0,0.45)",
                      background: "rgba(255,215,0,0.12)",
                      color: "#FFD700",
                      fontFamily: "inherit",
                    }}
                  >
                    MEDIA MATRIX
                  </button>
                </div>
                <div style={{ height: "calc(100% - 32px)", minHeight: 0, overflow: "hidden" }}>
                  {commandContent}
                </div>
              </div>
            ) : (
              <CanonicalDualMonitorStack
                variant="gold"
                seriesLabel="BERNTOUTGLOBAL OVERSEER DECK · GOLD SERIES · DUAL HD MONITORS"
                controlledSplits={monitorSplits}
                onSplitsChange={setMonitorSplits}
                monitors={dual.map((panel, index) => ({
                  id: panel.id ?? `center-${index}`,
                  label: `MONITOR ${index + 1} — ${panel.title}`,
                  children: (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: 0,
                        background: "#020210",
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          padding: "4px 8px",
                          borderBottom: "1px solid rgba(255,215,0,0.2)",
                          background: "rgba(0,0,0,0.55)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 900,
                            letterSpacing: "0.12em",
                            color: panel.accent ?? "#FFD700",
                            textTransform: "uppercase",
                          }}
                        >
                          {panel.title}
                        </span>
                        {panel.fullscreenKey || panel.id ? (
                          <button
                            type="button"
                            onClick={() =>
                              toggleFullscreen(panel.fullscreenKey ?? panel.id ?? panel.title)
                            }
                            style={{
                              fontSize: 8,
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              padding: "2px 6px",
                              borderRadius: 4,
                              cursor: "pointer",
                              border: "1px solid rgba(255,215,0,0.4)",
                              background: "rgba(255,215,0,0.12)",
                              color: "#FFD700",
                              fontFamily: "inherit",
                            }}
                          >
                            FOCUS
                          </button>
                        ) : null}
                      </div>
                      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{panel.content}</div>
                    </div>
                  ),
                }))}
              />
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        data-col={rail}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minWidth: 0,
          alignSelf: "stretch",
          height: isSideRail ? "100%" : "auto",
          minHeight: isSideRail ? 0 : undefined,
          overflowY: isSideRail && !leftCollapsed && !rightCollapsed ? "auto" : isSideRail ? "hidden" : "visible",
          overflowX: "hidden",
          paddingRight: 2,
        }}
      >
        {visible.map((panel) =>
          renderPanelCanister(
            panel,
            isLeft ? leftCollapsed : isRight ? rightCollapsed : false,
            false,
            undefined,
            isSideRail,
          ),
        )}
      </div>
    );
  };

  const dockBtnStyle = (active = false): CSSProperties => ({
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: active
      ? "linear-gradient(180deg, #0a4a2a 0%, #063018 100%)"
      : "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
    border: active ? "2px solid #00FF88" : "2px solid #D4AF37",
    color: active ? "#00FF88" : "#ffe3a3",
    fontSize: 14,
    cursor: "pointer",
    boxShadow: active ? "0 0 12px rgba(0,255,136,0.45)" : "0 3px 8px rgba(0,0,0,0.5)",
  });

  return (
    <div
      data-overseer-flight-deck
      data-canon-overseer-shell
      data-two-deck="ops-ticker-intelligence"
      style={{
        minHeight: "100vh",
        height: "auto",
        maxHeight: "none",
        background:
          "radial-gradient(130% 90% at 50% -5%, rgba(92,26,74,0.45) 0%, rgba(28,10,32,0.85) 46%, rgba(7,3,12,1) 100%)",
        border: "14px solid transparent",
        borderImage:
          "linear-gradient(135deg, #ffd700 0%, #b8860b 35%, #ffd700 50%, #b8860b 65%, #ffd700 100%) 14",
        boxShadow:
          "inset 0 0 90px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,215,0,0.15), 0 16px 40px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 10,
        paddingBottom: 24,
        fontFamily: "inherit",
        position: "relative",
        overflow: "visible",
      }}
    >
      <div style={{ ...gemStyle(), top: 2, left: 2 }} />
      <div style={{ ...gemStyle(), top: 2, right: 2 }} />
      <div style={{ ...gemStyle(), bottom: 2, left: 2 }} />
      <div style={{ ...gemStyle(), bottom: 2, right: 2 }} />

      {/* Minimal header — brand + LIVE only (no oval congestion) */}
      <header
        data-row="flight-header"
        style={{
          position: "relative",
          zIndex: 100,
          border: "2px solid #D4AF37",
          borderRadius: 10,
          background: "linear-gradient(180deg, #2b1822 0%, #150910 100%)",
          padding: "8px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.6), inset 0 0 10px rgba(255,215,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
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
              fontWeight: 900,
            }}
          >
            B
          </div>
          <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 900, letterSpacing: "0.05em" }}>
            BerntttGlobal
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.14em",
            }}
          >
            OVERSEER DECK
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid rgba(255,0,136,0.4)",
              background: "rgba(255,0,136,0.1)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#FF0088",
                boxShadow: "0 0 6px #FF0088",
              }}
            />
            <span style={{ color: "#FF8FBE", fontSize: 8, fontWeight: 900 }}>LIVE</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.05em" }}>
            {clock || "—"}
          </span>
          <button
            type="button"
            onClick={openBotIntel}
            style={{
              borderRadius: 8,
              border: "1.5px solid #00FFFF",
              background: "linear-gradient(180deg, #1a3a4a 0%, #0a1520 100%)",
              color: "#9ef6ff",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "5px 12px",
              cursor: "pointer",
              boxShadow: "0 0 12px rgba(0,255,255,0.2)",
            }}
            title="Bot Activity — All Bots / Who's Who / NPC Journal"
          >
            Bot Intel
          </button>
          <button
            type="button"
            onClick={() => setConciergeOpen(true)}
            style={{
              borderRadius: 8,
              border: "1.5px solid #D4AF37",
              background: "linear-gradient(180deg, #5b217a 0%, #301042 100%)",
              color: "#ffe3a3",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            Admin
          </button>
        </div>
      </header>

      <style>{`
        @keyframes overseer-center-flip {
          0% { transform: rotateY(82deg) scale(0.96); opacity: 0.35; }
          55% { transform: rotateY(-8deg) scale(1.01); opacity: 0.95; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes overseer-merge-pulse {
          0%   { box-shadow: 0 0 0 rgba(0,255,255,0); }
          40%  { box-shadow: 0 0 20px rgba(0,255,255,0.7); }
          100% { box-shadow: 0 0 0 rgba(0,255,255,0); }
        }
      `}</style>

      <OverseerQuickControlRow
        activeView={centerView}
        onSelectView={selectCenterView}
        onOpsAction={handleOpsAction}
      />

      {activeWorkspace.ribbon ? (
        <Canister
          title={activeWorkspace.title.toUpperCase()}
          accent="#FFD700"
          style={{ borderRadius: 10, position: "relative", zIndex: 1 }}
        >
          {activeWorkspace.ribbon}
        </Canister>
      ) : null}

      {/* MONITOR CONTROL STRIP — MERGE ALL / per-split presets */}
      <div
        data-row="monitor-controls"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          border: "1px solid rgba(255,215,0,0.22)",
          borderRadius: 8,
          background: "linear-gradient(180deg, rgba(30,15,10,0.92), rgba(10,5,8,0.96))",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,215,0,0.6)", marginRight: 2 }}>
          MONITORS
        </span>
        {/* MERGE ALL */}
        <button
          type="button"
          onClick={mergeAllMonitors}
          title="Merge all media players into one large monitor"
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: `1px solid ${isMerging ? "#00FFFF" : "rgba(0,255,255,0.5)"}`,
            background: isMerging ? "rgba(0,255,255,0.25)" : "rgba(0,255,255,0.1)",
            color: "#00FFFF",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: isMerging ? "0 0 12px rgba(0,255,255,0.4)" : "none",
            animation: isMerging ? "overseer-merge-pulse 0.6s ease" : "none",
          }}
        >
          {isMerging ? "⟳ MERGING…" : "⊡ MERGE ALL → 1"}
        </button>
        <span aria-hidden style={{ width: 1, height: 18, background: "rgba(255,215,0,0.3)" }} />
        {/* Quick split presets for both monitors */}
        {([1, 2, 3, 4, 16] as MonitorSplitMode[]).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => expandAllMonitors(n)}
            title={`Set both monitors to ${n === 1 ? "single" : n === 16 ? "4×4 wall" : `${n}-pane`}`}
            style={{
              padding: "4px 9px",
              borderRadius: 6,
              border: `1px solid ${monitorSplits[0] === n && monitorSplits[1] === n ? "rgba(255,215,0,0.8)" : "rgba(255,215,0,0.25)"}`,
              background: monitorSplits[0] === n && monitorSplits[1] === n ? "rgba(255,215,0,0.2)" : "rgba(0,0,0,0.4)",
              color: monitorSplits[0] === n && monitorSplits[1] === n ? "#FFD700" : "rgba(255,255,255,0.55)",
              fontSize: 10,
              fontWeight: 900,
              cursor: "pointer",
              transition: "all 0.15s",
              minWidth: 28,
            }}
          >
            {n}
          </button>
        ))}
        <span aria-hidden style={{ flex: 1 }} />
        {/* Rail toggles — quick access */}
        <button
          type="button"
          onClick={() => drawerManager.toggleRail("left")}
          title={leftCollapsed ? "Expand left rail" : "Collapse left rail"}
          style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(255,215,0,0.3)", background: "rgba(0,0,0,0.4)", color: "#FFD700", fontSize: 10, fontWeight: 900, cursor: "pointer" }}
        >
          {leftCollapsed ? "◀▏" : "▏◀"}
        </button>
        <button
          type="button"
          onClick={() => drawerManager.toggleRail("right")}
          title={rightCollapsed ? "Expand right rail" : "Collapse right rail"}
          style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(255,215,0,0.3)", background: "rgba(0,0,0,0.4)", color: "#FFD700", fontSize: 10, fontWeight: 900, cursor: "pointer" }}
        >
          {rightCollapsed ? "▕▶" : "▶▕"}
        </button>
      </div>

      {/* OPERATIONS DECK — flexbox so rail widths can transition smoothly */}
      <div
        data-deck="operations"
        style={{
          position: "relative",
          zIndex: 1,
          flex: "0 0 auto",
          flexShrink: 0,
          height: "auto",
          maxHeight: "none",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 8,
          border: "1px solid rgba(255,215,0,0.18)",
          borderRadius: 10,
          padding: 8,
          background: "linear-gradient(180deg, rgba(255,215,0,0.04), rgba(255,255,255,0.02))",
        }}
      >
        {fullscreenPanel ? (
          <Canister
            title="FOCUS MODE"
            accent="#00FFFF"
            statusLabel="FOCUSED"
            onToggleFullscreen={() => setFullscreenPanel(null)}
            style={{
              minHeight: "min(70vh, 720px)",
              aspectRatio: "16 / 9",
              width: "100%",
            }}
          >
            {fullscreenMatch?.content ?? null}
          </Canister>
        ) : (
          <>
            {/* Left rail — smooth width transition */}
            <div
              style={{
                flexShrink: 0,
                width: leftWidth,
                minWidth: 0,
                overflow: "hidden",
                transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
                display: "flex",
                flexDirection: "column",
                alignSelf: "stretch",
              }}
            >
              {renderRail(activeWorkspace.leftRail, "left")}
            </div>
            {/* Center monitors */}
            {renderRail(activeWorkspace.center, "center")}
            {/* Right rail — smooth width transition */}
            <div
              style={{
                flexShrink: 0,
                width: rightWidth,
                minWidth: 0,
                overflow: "hidden",
                transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
                display: "flex",
                flexDirection: "column",
                alignSelf: "stretch",
              }}
            >
              {renderRail(activeWorkspace.rightRail, "right")}
            </div>
          </>
        )}
      </div>

      <LiveChannelTicker />

      {/* BRACER — divider between live feed and analytics */}
      <div
        data-row="ops-bracer"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 8px",
          height: 28,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, transparent, #B8860B 20%, #FFD700 50%, #B8860B 80%, transparent)", borderRadius: 1, boxShadow: "0 0 8px rgba(255,215,0,0.35)" }} />
        <span style={{ flexShrink: 0, fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,215,0,0.6)", textTransform: "uppercase", padding: "2px 10px", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 999, background: "rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>
          ▼ ANALYTICS
        </span>
        <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, transparent, #B8860B 20%, #FFD700 50%, #B8860B 80%, transparent)", borderRadius: 1, boxShadow: "0 0 8px rgba(255,215,0,0.35)" }} />
      </div>
      <div
        data-deck="control-desk"
        id="living-os-control-desk"
        style={{
          position: "relative",
          zIndex: 1,
          flex: "0 0 auto",
          flexShrink: 0,
        }}
      >
        <ObservatoryControlDesk />
      </div>

      {/* INTELLIGENCE DECK — below control desk / fold */}
      <div
        data-deck="intelligence"
        id="intelligence-deck"
        style={{
          position: "relative",
          zIndex: 1,
          flex: "0 0 auto",
          flexShrink: 0,
          minHeight: intelligenceMinHeight,
          height: bottomCollapsed ? intelligenceMinHeight : "auto",
          maxHeight: "none",
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, activeWorkspace.bottom.length)}, minmax(0, 1fr))`,
          gap: DECK_GAP,
          border: "2px solid rgba(255,45,170,0.35)",
          borderRadius: 12,
          padding: bottomCollapsed ? 6 : 18,
          background: "linear-gradient(180deg, rgba(255,45,170,0.08), rgba(255,215,0,0.05))",
          boxShadow: "inset 0 0 24px rgba(255,45,170,0.06), 0 8px 28px rgba(0,0,0,0.45)",
        }}
      >
        {!bottomCollapsed ? (
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                color: "#FF2DAA",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Intelligence Deck
            </span>
            <button
              type="button"
              onClick={() => drawerManager.toggleRail("bottom")}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(170,45,255,0.35)",
                background: "rgba(170,45,255,0.06)",
                color: "rgba(216,135,255,0.75)",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "3px 8px",
                cursor: "pointer",
              }}
            >
              Collapse
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => drawerManager.toggleRail("bottom")}
            style={{
              gridColumn: "1 / -1",
              borderRadius: 8,
              border: "1px solid rgba(255,45,170,0.4)",
              background: "rgba(255,45,170,0.08)",
              color: "#FF2DAA",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            Expand Intelligence Deck
          </button>
        )}
        {!bottomCollapsed
          ? activeWorkspace.bottom
              .filter((panel) => !isFloatingPanel(panel))
              .map((panel) =>
                renderPanelCanister(
                  panel,
                  false,
                  false,
                  {
                    minHeight: 480,
                    flex: "0 0 auto",
                    height: "auto",
                    overflow: "visible",
                  },
                  true,
                ),
              )
          : null}
      </div>

      {/* Sticky bottom gem dock */}
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
          position: "sticky",
          bottom: 8,
          zIndex: 40,
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setConciergeOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "linear-gradient(180deg, #5b217a 0%, #301042 100%)",
              border: "2px solid #D4AF37",
              borderRadius: 10,
              color: "#ffe3a3",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
            }}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => drawerManager.toggleRail("left")}
            title="Toggle left rail"
            style={dockBtnStyle()}
          >
            {leftCollapsed ? "◀" : "◁"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => drawerManager.toggleRail("right")}
            title="Toggle right rail"
            style={dockBtnStyle()}
          >
            {rightCollapsed ? "▶" : "▷"}
          </button>
          <Link
            href="/admin"
            style={{
              ...dockBtnStyle(),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
            title="Admin home"
          >
            ◀
          </Link>
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

      <AdminConciergePanel
        open={conciergeOpen}
        onClose={() => setConciergeOpen(false)}
        includeWorkspaces={false}
        operatorLabel={operatorLabel}
        fullControl={fullControl}
        canAutoApplyFixes={canAutoApplyFixes}
        onSuggestFix={handleSuggestFix}
        submittingFix={submittingFix || localSubmittingFix}
      />

      {botIntelOpen ? (
        <div
          role="dialog"
          aria-label="Bot Activity Switcher"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            background: "rgba(3,2,14,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            pointerEvents: "auto",
          }}
          onClick={() => setBotIntelOpen(false)}
        >
          <div
            id="bot-activity"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(720px, 96vw)",
              height: "min(640px, 88vh)",
              borderRadius: 16,
              border: "1.5px solid rgba(255,215,0,0.4)",
              background: "linear-gradient(165deg, rgba(10,6,24,0.98), rgba(5,5,16,0.99))",
              boxShadow: "0 0 40px rgba(0,255,255,0.15), 0 20px 60px rgba(0,0,0,0.65)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderBottom: "1px solid rgba(255,215,0,0.25)",
                background: "rgba(0,0,0,0.45)",
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
                  BOT ACTIVITY SWITCHER
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  All Bots · Who&apos;s Who · NPC Journal (Revenue Businessman + team included)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBotIntelOpen(false)}
                style={{
                  border: "1px solid rgba(255,45,170,0.5)",
                  background: "rgba(255,45,170,0.12)",
                  color: "#FF2DAA",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <BotActivitySwitcherPanel />
            </div>
          </div>
        </div>
      ) : null}

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
                  background:
                    "linear-gradient(180deg, rgba(255,215,0,0.16), rgba(255,215,0,0.06))",
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

      </OverlayHost>
    </div>
  );
}

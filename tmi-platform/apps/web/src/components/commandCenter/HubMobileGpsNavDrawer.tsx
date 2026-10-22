"use client";

/**
 * HubMobileGpsNavDrawer — GPS navigation suite.
 * Overlay placement is a shell-level fixed side drawer (portaled), never in-flow content.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { OperatingCenter } from "@/lib/drawers/operatingCenterRegistry";
import type { CommandCenterPanelId } from "./commandCenterRegistry";
import {
  GPS_OVERLAY_WIDTH,
  useMobileGpsMonitorLayoutStore,
  type MobileMonitorLayoutState,
} from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import {
  getMobileQuickPanelCapabilities,
  type MobileCommandCenterRole,
} from "@/lib/commandCenter/mobileCommandCenterCapabilities";
import { runQuickToolAction } from "@/lib/commandCenter/quickToolsActions";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import { useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import { ProductShellIcon } from "@/components/shell/ProductShellIcon";
import { gpsDestinationById, isGpsReleaseDestinationVisible } from "@/lib/commandCenter/gpsReleaseAllowlist";
import type { HubCommunicationsTab } from "./HubCommunicationsRail";

export interface HubMobileGpsNavDrawerProps {
  role: MobileCommandCenterRole;
  centers: OperatingCenter[];
  activePanel: CommandCenterPanelId | null;
  onOpenPanel: (id: CommandCenterPanelId) => void;
  onOpenWorkspace?: (id: UniversalWorkspaceId) => void;
  onOpenYourPage?: () => void;
  onOpenPerformerPage?: () => void;
  onOpenArticleEditor?: () => void;
  onOpenArticles?: () => void;
  onOpenMagazine?: () => void;
  displayName?: string;
  layout: MobileMonitorLayoutState;
  /** Compact left rail over the monitor stage, matching the approved screenshot. */
  placement?: "flow" | "overlay";
  onCloseActivePanel?: () => void;
  onOpenSocial?: (tab: HubCommunicationsTab) => void;
}

const RAIL: Array<{
  id: string;
  label: string;
  workspace?: UniversalWorkspaceId;
  roles?: Array<"fan" | "performer">;
  kind?: "your-page" | "publics" | "article" | "profile" | "camera" | "go-live" | "promote" | "social" | "guide";
  socialTab?: HubCommunicationsTab;
  panel?: CommandCenterPanelId;
}> = [
  { id: "gps-guide", label: "GPS GUIDE", kind: "guide" },
  { id: "your-page", label: "YOUR PAGE", kind: "your-page" },
  { id: "publics", label: "PUBLICS", kind: "publics" },
  { id: "profile", label: "PROFILE", kind: "profile" },
  { id: "messages", label: "MESSAGES", kind: "social", socialTab: "messages" },
  { id: "friends", label: "FRIENDS", kind: "social", socialTab: "people" },
  { id: "community", label: "COMMUNITY", kind: "social", socialTab: "community" },
  { id: "articles", label: "ARTICLES", kind: "article", roles: ["performer"] },
  { id: "yopho", label: "YOPHO", workspace: "yopho" },
  { id: "playlists", label: "PLAYLISTS", workspace: "playlist-studio" },
  { id: "avatar", label: "AVATAR", workspace: "avatar-quick", roles: ["fan"] },
  { id: "avatar-live", label: "AVATAR LIVE", roles: ["fan"] },
  { id: "biography", label: "BIOGRAPHY", kind: "article", roles: ["performer"] },
  { id: "lobby", label: "LOBBY", workspace: "lobby" },
  { id: "go-live", label: "GO LIVE", kind: "go-live", roles: ["performer"] },
  { id: "camera", label: "CAMERA", kind: "camera" },
  { id: "stage-tools", label: "STAGE TOOLS", panel: "stage_tools", roles: ["performer"] },
  { id: "videos", label: "VIDEOS" },
  { id: "media", label: "MEDIA LOCKER", workspace: "media-locker", roles: ["performer"] },
  { id: "memory-wall", label: "MEMORY WALL", workspace: "memory-wall" },
  { id: "inventory", label: "INVENTORY", workspace: "inventory", roles: ["fan"] },
  { id: "store", label: "STORE", workspace: "store" },
  { id: "rewards", label: "REWARDS", workspace: "prize-vault", roles: ["fan"] },
  { id: "booking", label: "BOOKING", workspace: "booking", roles: ["performer"] },
  { id: "promote", label: "PROMOTE", kind: "promote" },
  { id: "commerce", label: "COMMERCE", panel: "commerce_center", roles: ["performer"] },
  { id: "submissions", label: "SUBMISSIONS", panel: "submissions", roles: ["performer"] },
  { id: "beat-lab", label: "BEAT LAB", panel: "beat_lab", roles: ["performer"] },
  { id: "settings", label: "SETTINGS", workspace: "settings" },
  { id: "notifications", label: "NOTIFICATIONS", panel: "notifications" },
  { id: "scores", label: "SCORES", panel: "scores" },
];

/** Updated GPS button treatment already used by the rail: white label, dark fill. */
export const hubGpsButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  minHeight: 48,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,229,255,0.28)",
  background: "rgba(8,10,18,0.92)",
  color: "rgba(255,255,255,0.9)",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textAlign: "left",
};

const TILE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  minHeight: 64,
  minWidth: 72,
  padding: "10px 8px",
  borderRadius: 10,
  border: "1px solid rgba(0,229,255,0.28)",
  background: "linear-gradient(180deg, rgba(20,28,44,0.95) 0%, rgba(8,10,18,0.98) 100%)",
  color: "rgba(255,255,255,0.88)",
  cursor: "pointer",
  fontFamily: "inherit",
  flex: "1 1 30%",
  maxWidth: "48%",
};

export default function HubMobileGpsNavDrawer({
  role,
  centers,
  activePanel,
  onOpenPanel,
  onOpenWorkspace,
  onOpenYourPage,
  onOpenPerformerPage,
  onOpenArticleEditor,
  onOpenArticles,
  onOpenMagazine,
  displayName,
  layout,
  placement = "flow",
  onCloseActivePanel,
  onOpenSocial,
}: HubMobileGpsNavDrawerProps) {
  const restoreMonitor2 = useMobileGpsMonitorLayoutStore((s) => s.restoreMonitor2);
  const closeGpsDrawer = useMobileGpsMonitorLayoutStore((s) => s.closeGpsDrawer);
  const railScrollTop = useMobileGpsMonitorLayoutStore((s) => s.railScrollTop);
  const setRailScrollTop = useMobileGpsMonitorLayoutStore((s) => s.setRailScrollTop);
  const railShiftY = useMobileGpsMonitorLayoutStore((s) => s.railShiftY);
  const setRailShiftY = useMobileGpsMonitorLayoutStore((s) => s.setRailShiftY);
  const setDrawerDock = useMobileGpsMonitorLayoutStore((s) => s.setDrawerDock);
  const closeSurface = useWorkspacePresentationStore((s) => s.closeSurface);
  const accent = role === "performer" ? "#FFD700" : "#00FF88";
  const router = useRouter();
  const { activePanel: qpPanel, togglePanel, openPanel, closePanel } = useCompactQuickPanelStore();
  const { primary } = getMobileQuickPanelCapabilities(role);

  // Phone presentation: dock the rail to the LEFT edge so it never covers the
  // top-right account/avatar control. Desktop keeps the right-side rail.
  const [phonePortrait, setPhonePortrait] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const sync = () => setPhonePortrait(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);
  const dockLeft = placement === "overlay" && phonePortrait;

  const showMonitorBack = layout === "DRAWER_REPLACES_MONITOR_2";
  const drawerRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ y: number; shift: number } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeTimerRef = useRef<number | null>(null);
  const swipeConsumedRef = useRef(false);
  const [scrollMax, setScrollMax] = useState(1);
  const [scrollTop, setScrollTop] = useState(railScrollTop);
  const [swipeClosing, setSwipeClosing] = useState(false);
  const [soonId, setSoonId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const releaseNoteId = useMobileGpsMonitorLayoutStore((s) => s.releaseNoteId);
  const clearReleaseNote = useMobileGpsMonitorLayoutStore((s) => s.clearReleaseNote);
  const railItems = RAIL.filter((item) => isGpsReleaseDestinationVisible(item.id)).filter(
    (item) => !item.roles || item.roles.includes(role === "performer" ? "performer" : "fan"),
  );
  const soon = soonId ? gpsDestinationById(soonId) : undefined;

  const measureRail = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    setScrollMax(Math.max(1, node.scrollHeight - node.clientHeight));
    setScrollTop(node.scrollTop);
    setRailScrollTop(node.scrollTop);
  }, [setRailScrollTop]);

  useEffect(() => {
    if (!releaseNoteId) return;
    setGuideOpen(false);
    setSoonId(releaseNoteId);
    clearReleaseNote();
  }, [releaseNoteId, clearReleaseNote]);

  useEffect(() => {
    if (placement !== "overlay") return;
    document.documentElement.setAttribute("data-gps-rail-open", "1");
    measureRail();
    const node = scrollerRef.current;
    if (!node) {
      return () => document.documentElement.removeAttribute("data-gps-rail-open");
    }
    node.scrollTop = useMobileGpsMonitorLayoutStore.getState().railScrollTop;
    measureRail();
    node.addEventListener("scroll", measureRail, { passive: true });
    window.addEventListener("resize", measureRail);
    return () => {
      document.documentElement.removeAttribute("data-gps-rail-open");
      node.removeEventListener("scroll", measureRail);
      window.removeEventListener("resize", measureRail);
    };
  }, [placement, railItems.length, measureRail]);

  useEffect(() => () => {
    if (swipeTimerRef.current != null) window.clearTimeout(swipeTimerRef.current);
  }, []);

  const beginGpsSwipe = (event: ReactPointerEvent<HTMLElement>) => {
    if (placement !== "overlay" || swipeClosing || (event.target as HTMLElement).closest("button,a,input,[data-testid='hub-gps-close'],[data-testid='hub-gps-monitor-back']")) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const finishGpsSwipe = (event: ReactPointerEvent<HTMLElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || swipeClosing) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    // Swipe off the docked edge to close: LEFT-docked closes on a left swipe,
    // RIGHT-docked closes on a right swipe.
    const closesLeft = dockLeft && deltaX <= -64 && Math.abs(deltaX) >= Math.abs(deltaY) * 1.5;
    const closesRight = !dockLeft && deltaX >= 64 && deltaX >= Math.abs(deltaY) * 1.5;
    if (!closesLeft && !closesRight) return;
    swipeConsumedRef.current = true;
    setSwipeClosing(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    swipeTimerRef.current = window.setTimeout(() => {
      closeGpsDrawer();
      setSwipeClosing(false);
      swipeTimerRef.current = null;
      window.setTimeout(() => { swipeConsumedRef.current = false; }, 0);
    }, reducedMotion ? 0 : 150);
  };

  const chooseDock = (_event: { currentTarget: EventTarget & Element }) => {
    setDrawerDock("under-b");
  };

  const onRailDragDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragRef.current = { y: event.clientY, shift: railShiftY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onRailDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setRailShiftY(dragRef.current.shift + (event.clientY - dragRef.current.y));
  };
  const onRailDragUp = () => {
    dragRef.current = null;
  };

  const drawer = (
    <section
      ref={drawerRef}
      id="hub-mobile-gps-drawer"
      data-hub-mobile-gps-drawer="1"
      data-gps-layout={layout}
      data-testid="hub-mobile-gps-drawer"
      data-gps-placement={placement}
      data-gps-overlay-root={placement === "overlay" ? "shell" : undefined}
      data-gps-side={placement === "overlay" ? (dockLeft ? "left" : "right") : undefined}
      data-gps-swipe-closing={swipeClosing ? "1" : "0"}
      aria-label="GPS navigation"
      onPointerDown={beginGpsSwipe}
      onPointerUp={finishGpsSwipe}
      onPointerCancel={() => { swipeStartRef.current = null; }}
      onClickCapture={(event) => {
        if (!swipeConsumedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      style={
        placement === "overlay"
          ? {
              position: "fixed",
              top: "max(8px, env(safe-area-inset-top))",
              ...(dockLeft
                ? { left: "max(8px, env(safe-area-inset-left))" }
                : { right: "max(8px, env(safe-area-inset-right))" }),
              bottom: "max(8px, env(safe-area-inset-bottom))",
              transform: swipeClosing ? (dockLeft ? "translateX(calc(-100% - 16px))" : "translateX(calc(100% + 16px))") : "none",
              transition: swipeClosing ? "transform 150ms ease-in" : "none",
              // Same portal stack as HubMobileCommunicationsDrawer (9400); under Snips (9370) and camera (9500).
              zIndex: 9360,
              width: GPS_OVERLAY_WIDTH,
              height: "auto",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRadius: 12,
              border: "1px solid rgba(170,45,255,0.4)",
              background: "rgba(10,13,24,0.9)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
              padding: 6,
              pointerEvents: swipeClosing ? "none" : "auto",
              touchAction: "pan-y",
            }
          : {
              flexShrink: 0,
              width: "100%",
              maxWidth: "100%",
              overflowX: "hidden",
              minHeight: layout === "DRAWER_REPLACES_MONITOR_2" ? 200 : 160,
              maxHeight: layout === "DRAWER_REPLACES_MONITOR_2" ? "70vh" : "62vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderTop: `1px solid ${accent}55`,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(6,8,16,0.96)",
              backdropFilter: "blur(16px)",
              padding: "8px 10px 12px",
              paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            }
      }
    >
      <div
        data-testid="hub-gps-drag"
        onPointerDown={placement === "overlay" ? onRailDragDown : undefined}
        onPointerMove={placement === "overlay" ? onRailDragMove : undefined}
        onPointerUp={placement === "overlay" ? onRailDragUp : undefined}
        onPointerCancel={placement === "overlay" ? onRailDragUp : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 10,
          cursor: placement === "overlay" ? "grab" : undefined,
          touchAction: placement === "overlay" ? "none" : undefined,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: accent,
            }}
          >
            MAIN MENU
          </span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
            SAME DESTINATIONS AS THE DESKTOP RAIL
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {showMonitorBack ? (
            <button
              type="button"
              data-testid="hub-gps-monitor-back"
              onClick={() => restoreMonitor2()}
              style={{
                minHeight: 44,
                minWidth: 44,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,229,255,0.55)",
                background: "rgba(0,229,255,0.12)",
                color: "#00E5FF",
                fontWeight: 900,
                fontSize: 9,
                letterSpacing: "0.06em",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ⧉ MONITOR BACK
            </button>
          ) : null}
          <button
            type="button"
            data-testid="hub-gps-close"
            onClick={() => closeGpsDrawer()}
            aria-label="Close GPS"
            style={{
              minHeight: 44,
              minWidth: 44,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.8)",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: placement === "overlay" ? 1 : undefined, minHeight: 0, gap: 4 }}>
      <div ref={scrollerRef} data-testid="hub-gps-rail" style={{ display: "flex", flexDirection: "column", gap: placement === "overlay" ? 4 : 8, marginBottom: 10, overflowY: placement === "overlay" ? "auto" : undefined, minHeight: 0, flex: 1, scrollbarWidth: "none" }}>
        {guideOpen ? (
          <div data-testid="gps-guide" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 4px" }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", color: "#00E5FF" }}>GPS GUIDE</span>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.86)" }}>This drawer is the map. Scroll it to reach every button.</p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>OPEN means this feature has just opened and is ready to use.</p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>A button with no badge is a normal available feature.</p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>COMING SOON means you can see what is coming, and it is not active yet.</p>
            <button type="button" data-testid="gps-guide-close" onClick={() => setGuideOpen(false)} style={{ ...hubGpsButtonStyle, justifyContent: "center" }}>GOT IT</button>
          </div>
        ) : soon ? (
          <div data-testid="gps-coming-soon" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 4px" }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>{soon.label}</span>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", color: "#fff" }}>COMING SOON</span>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>{soon.building}</p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.62)" }}>You can keep using everything that&apos;s already live.</p>
            <button
              type="button"
              data-testid="gps-coming-soon-close"
              onClick={() => setSoonId(null)}
              style={{ ...hubGpsButtonStyle, justifyContent: "center" }}
            >
              GOT IT
            </button>
          </div>
        ) : railItems.map((item, index) => {
          const release = gpsDestinationById(item.id);
          const previous = index > 0 ? gpsDestinationById(railItems[index - 1]!.id) : undefined;
          const showGroup = release && release.group !== previous?.group;
          return (
          <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {showGroup ? (
            // Pure group label — never a control. It must not take taps meant
            // for the destination tile below it (label-overlap collision found
            // on compact screens where the label rect overlaps the launcher).
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", padding: "6px 4px 0", pointerEvents: "none" }}>{release.group === "GUIDE" ? "GPS" : release.group}</span>
          ) : null}
          <button
            type="button"
            data-testid={`hub-gps-rail-${item.id}`}
            data-gps-state={release?.state ?? "HIDDEN"}
            onClick={(event) => {
              if (item.kind === "guide") {
                setGuideOpen(true);
                setSoonId(null);
                return;
              }
              const release = gpsDestinationById(item.id);
              if (!release || release.state !== "LIVE") {
                setSoonId(item.id);
                return;
              }
              chooseDock(event);
              onCloseActivePanel?.();
              closeGpsDrawer();
              if (item.kind === "your-page") {
                document.documentElement.setAttribute("data-gps-last-command", "your-page");
                closeSurface("DRAWER");
                closeGpsDrawer();
                if (role === "performer" && onOpenPerformerPage) onOpenPerformerPage();
                else onOpenYourPage?.();
                return;
              }
              if (item.kind === "article") {
                if (item.id === "biography") onOpenArticleEditor?.();
                if (item.id === "articles") onOpenArticles?.();
                return;
              }
              if (item.kind === "social" && item.socialTab) {
                document.documentElement.setAttribute("data-gps-last-command", `social:${item.socialTab}`);
                onOpenSocial?.(item.socialTab);
                return;
              }
              if (item.kind === "profile" || item.kind === "publics") {
                // PROFILE → the account/profile experience. PUBLICS → the canonical
                // unified discovery surface (/search finds public profiles, live rooms,
                // articles, tracks). /profiles does not exist (was a 404 on Galaxy).
                const dest = item.kind === "profile" ? "/profile" : "/search";
                document.documentElement.setAttribute("data-gps-last-command", `${item.kind}:${dest}`);
                window.location.assign(dest);
                return;
              }
              if (item.kind === "camera") { router.push("/camera"); return; }
              if (item.kind === "go-live") { router.push("/hub/performer?golive=1"); return; }
              if (item.kind === "promote") {
                window.dispatchEvent(new CustomEvent("tmi:hub-promote-toggle"));
                return;
              }
              if (item.panel) { onOpenPanel(item.panel); return; }
              if (item.workspace) {
                if (item.workspace === "avatar-quick" && role !== "fan") return;
                if (onOpenWorkspace) onOpenWorkspace(item.workspace);
                else presentCanonicalWorkspace(item.workspace, "DRAWER");
              }
            }}
            style={{ ...hubGpsButtonStyle, minHeight: placement === "overlay" ? 40 : hubGpsButtonStyle.minHeight, fontSize: placement === "overlay" ? 9 : hubGpsButtonStyle.fontSize, opacity: release?.state === "COMING_SOON" ? 0.72 : 1 }}
          >
            <span style={{ flex: 1 }}>{item.label}</span>
            {release?.state === "LIVE" && release.openBadge ? (
              <span data-gps-open-badge="1" style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: "#00E5FF" }}>OPEN</span>
            ) : null}
            {release?.state === "COMING_SOON" ? (
              /* SOON is the release hold, including friends while the list query is unavailable. */
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: "#FFD700" }}>SOON</span>
            ) : null}
          </button>
          </div>
          );
        })}
        {placement === "overlay" ? (
          <div data-testid="hub-gps-operating-centers" style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", padding: "4px 4px" }}>
              OPERATING CENTERS
            </span>
            {centers.map((center) => {
              const active = activePanel === center.primaryModule;
              return (
                <button
                  key={center.id}
                  type="button"
                  data-testid={`hub-gps-nav-${center.id}`}
                  data-gps-center-id={center.id}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    closeSurface("DRAWER");
                    onOpenPanel(center.primaryModule);
                  }}
                  style={{
                    ...hubGpsButtonStyle,
                    minHeight: 44,
                    fontSize: 9,
                    borderColor: active ? center.accent : "rgba(0,229,255,0.28)",
                    background: active ? `${center.accent}22` : hubGpsButtonStyle.background,
                  }}
                >
                  <span style={{ display: "grid", placeItems: "center", width: 20, height: 20, marginRight: 8 }} aria-hidden>
                    <ProductShellIcon name={center.id} size={18} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{center.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {placement === "overlay" ? (
        <input
          data-testid="hub-gps-slider"
          aria-label="Scroll GPS"
          type="range"
          min={0}
          max={scrollMax}
          value={Math.min(scrollTop, scrollMax)}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (scrollerRef.current) scrollerRef.current.scrollTop = next;
            setScrollTop(next);
                setRailScrollTop(next);
          }}
          style={{ writingMode: "vertical-lr", direction: "rtl", width: 18, flexShrink: 0 }}
        />
      ) : null}
      </div>
      {placement === "overlay" ? null : (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {centers.map((center) => {
          const active = activePanel === center.primaryModule;
          return (
            <button
              key={center.id}
              type="button"
              data-testid={`hub-gps-nav-${center.id}`}
              onClick={(event) => {
                chooseDock(event);
                closeSurface("DRAWER");
                onOpenPanel(center.primaryModule);
              }}
              style={{
                ...TILE,
                border: active ? `1px solid ${center.accent}` : TILE.border,
                background: active
                  ? `linear-gradient(180deg, ${center.accent}44 0%, ${center.accent}18 55%, #0a0e16 100%)`
                  : TILE.background,
              }}
            >
              <span style={{ display: "grid", placeItems: "center", width: 22, height: 22 }} aria-hidden>
                <ProductShellIcon name={center.id} size={20} />
              </span>
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", textAlign: "center" }}>
                {center.label}
              </span>
            </button>
          );
        })}
        {role === "performer" && onOpenPerformerPage ? (
          <button type="button" data-testid="hub-gps-performer-page" onClick={onOpenPerformerPage} style={TILE}>PERFORMER PAGE</button>
        ) : null}
        {role === "performer" && onOpenArticleEditor ? (
          <button type="button" data-testid="hub-gps-article-editor" onClick={onOpenArticleEditor} style={TILE}>BIOGRAPHY</button>
        ) : null}
        {onOpenMagazine ? (
          <button type="button" data-testid="hub-gps-magazine" onClick={onOpenMagazine} style={TILE}>MAGAZINE</button>
        ) : null}
      </div>
      )}
      {placement === "overlay" ? null : (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {primary.map((item) => {
          const btn = (
            <button
              key={item.id}
              type="button"
              data-testid={`hub-gps-tool-${item.id}`}
              onClick={() =>
                runQuickToolAction(item.id, {
                  role,
                  router,
                  activePanel: qpPanel,
                  togglePanel,
                  openPanel,
                  closePanel,
                })
              }
              style={TILE}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
                {item.label.split(" ")[0]}
              </span>
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.06em", textAlign: "center" }}>
                {item.label.replace(/^[^\s]+\s/, "") || item.label}
              </span>
            </button>
          );
          if (item.id === "avatar" || item.id === "inventory") {
            return (
              <RoleGate key={item.id} allow={["FAN", "ADMIN", "STAFF"]}>
                {btn}
              </RoleGate>
            );
          }
          return btn;
        })}
      </div>
      )}
      {placement === "overlay" ? null : (
      <div
        data-testid="hub-gps-member-card"
        style={{
          marginTop: 10,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,215,0,0.35)",
          background: "rgba(8,10,18,0.92)",
          color: "rgba(255,255,255,0.9)",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {displayName?.trim() || "Signed in"}
      </div>
      )}
    </section>
  );

  if (placement === "overlay") {
    if (typeof document === "undefined") return null;
    return createPortal(drawer, document.body);
  }
  return drawer;
}

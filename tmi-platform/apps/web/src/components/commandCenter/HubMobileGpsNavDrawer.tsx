"use client";

/**
 * HubMobileGpsNavDrawer — compact thumb rail over the monitor workspace.
 * GPS opens this rail. A tap opens one canonical drawer. It does not leave the hub.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { OperatingCenter } from "@/lib/drawers/operatingCenterRegistry";
import type { CommandCenterPanelId } from "./commandCenterRegistry";
import {
  useMobileGpsMonitorLayoutStore,
  type MobileMonitorLayoutState,
} from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import type { MobileCommandCenterRole } from "@/lib/commandCenter/mobileCommandCenterCapabilities";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";

export interface HubMobileGpsNavDrawerProps {
  role: MobileCommandCenterRole;
  centers: OperatingCenter[];
  activePanel: CommandCenterPanelId | null;
  onOpenPanel: (id: CommandCenterPanelId) => void;
  onCloseActivePanel?: () => void;
  onOpenYourPage?: () => void;
  onOpenPerformerPage?: () => void;
  onOpenArticleEditor?: () => void;
  onOpenMagazine?: () => void;
  onOpenSettings?: () => void;
  onOpenFriends?: () => void;
  onCloseFriends?: () => void;
  displayName?: string;
  layout: MobileMonitorLayoutState;
}

const DISCOVERY: Array<{ id: string; icon: string; label: string; subtitle: string; workspace: UniversalWorkspaceId }> = [
  { id: "live-rooms", icon: "🎥", label: "LIVE ROOMS", subtitle: "Direct view", workspace: "live-destinations" },
  { id: "lobby", icon: "🧱", label: "LOBBY", subtitle: "Live wall", workspace: "lobby" },
  { id: "messages", icon: "💬", label: "MESSAGES", subtitle: "Inbox", workspace: "messaging" },
  { id: "memory-wall", icon: "🧠", label: "MEMORY", subtitle: "Memory wall", workspace: "memory-wall" },
  { id: "playlists", icon: "🎵", label: "PLAYLISTS", subtitle: "Studio", workspace: "playlist-studio" },
  { id: "store", icon: "🛍", label: "STORE", subtitle: "Shop", workspace: "store" },
];

const ROW: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  width: "100%",
  minHeight: 44,
  padding: "4px 6px",
  borderRadius: 8,
  border: "1px solid rgba(170,45,255,0.28)",
  background: "transparent",
  color: "rgba(255,255,255,0.92)",
  cursor: "pointer",
  fontFamily: "inherit",
  textAlign: "left",
};

export default function HubMobileGpsNavDrawer({
  role,
  centers,
  activePanel,
  onOpenPanel,
  onCloseActivePanel,
  onOpenYourPage,
  onOpenPerformerPage,
  onOpenArticleEditor,
  onOpenMagazine,
  onOpenSettings,
  onOpenFriends,
  onCloseFriends,
  displayName,
  layout,
}: HubMobileGpsNavDrawerProps) {
  const closeGpsDrawer = useMobileGpsMonitorLayoutStore((s) => s.closeGpsDrawer);
  const drawerWorkspace = useWorkspacePresentationStore((s) => s.drawerWorkspace);
  const closeSurface = useWorkspacePresentationStore((s) => s.closeSurface);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const [scrollMax, setScrollMax] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const discovery = DISCOVERY;

  const measureRail = () => {
    const node = scrollerRef.current;
    if (!node) return;
    setScrollMax(Math.max(1, node.scrollHeight - node.clientHeight));
    setScrollTop(node.scrollTop);
  };

  useEffect(() => {
    measureRail();
    const node = scrollerRef.current;
    if (!node) return;
    node.addEventListener("scroll", measureRail, { passive: true });
    window.addEventListener("resize", measureRail);
    return () => {
      node.removeEventListener("scroll", measureRail);
      window.removeEventListener("resize", measureRail);
    };
  }, [centers.length]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const root = asideRef.current;
      const target = event.target as Node | null;
      if (!root || !target || root.contains(target)) return;
      if (target instanceof Element && target.closest("[data-testid='hub-header-gps']")) return;
      closeGpsDrawer();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [closeGpsDrawer]);

  const openWorkspace = (workspace: UniversalWorkspaceId) => {
    onCloseFriends?.();
    if (drawerWorkspace === workspace) {
      closeSurface("DRAWER");
      return;
    }
    onCloseActivePanel?.();
    presentCanonicalWorkspace(workspace, "DRAWER");
  };

  const openCenter = (center: OperatingCenter) => {
    onCloseFriends?.();
    if (activePanel === center.primaryModule) {
      onCloseActivePanel?.();
      return;
    }
    closeSurface("DRAWER");
    onOpenPanel(center.primaryModule);
  };

  return (
    <aside
      ref={asideRef}
      data-hub-mobile-gps-drawer="1"
      data-gps-layout={layout}
      data-testid="hub-mobile-gps-drawer"
      aria-label={displayName ? `${displayName} GPS` : "GPS navigation"}
      style={{
        position: "absolute",
        left: 8,
        bottom: 8,
        zIndex: 40,
        width: "clamp(118px, 34vw, 142px)",
        height: "62%",
        maxHeight: "70%",
        overflow: "hidden",
        borderRadius: 12,
        border: "1px solid rgba(170,45,255,0.4)",
        background: "rgba(10,13,24,0.9)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        padding: 6,
        display: "flex",
        flexDirection: "row",
        gap: 2,
        pointerEvents: "auto",
      }}
    >
      <style>{`
        [data-testid="hub-gps-rail"]::-webkit-scrollbar { width: 0; }
        [data-testid="hub-gps-slider"] { writing-mode: vertical-lr; direction: rtl; }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4, padding: "2px 2px 4px" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: "#C084FC", lineHeight: 1.2 }}>LIVE ROOMS</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", lineHeight: 1.2 }}>Tap for direct view</div>
        </div>
        <button
          type="button"
          data-testid="hub-gps-close"
          onClick={() => closeGpsDrawer()}
          aria-label="Close GPS"
          style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 900, cursor: "pointer", minWidth: 28, minHeight: 28 }}
        >
          ×
        </button>
      </div>
      <div
        ref={scrollerRef}
        data-testid="hub-gps-rail"
        style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", minHeight: 0, flex: 1, scrollbarWidth: "none", overscrollBehavior: "contain", touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
      >
        {onOpenFriends ? (
          <button
            type="button"
            data-testid="hub-gps-rail-friends"
            aria-label="Friends"
            onClick={() => {
              onCloseActivePanel?.();
              closeSurface("DRAWER");
              onOpenFriends();
            }}
            style={ROW}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>👥</span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.04em" }}>FRIENDS</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>People</span>
            </span>
          </button>
        ) : null}
        {discovery.map((item) => {
          const active = drawerWorkspace === item.workspace;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`hub-gps-rail-${item.id}`}
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => openWorkspace(item.workspace)}
              style={{
                ...ROW,
                borderColor: active ? "#00FFFF" : ROW.border as string,
                background: active ? "rgba(0,255,255,0.16)" : ROW.background,
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>{item.icon}</span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.04em" }}>{item.label}</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{item.subtitle}</span>
              </span>
            </button>
          );
        })}
        {centers.map((center) => {
          const active = activePanel === center.primaryModule;
          return (
            <button
              key={center.id}
              type="button"
              data-testid={`hub-gps-nav-${center.id}`}
              aria-label={center.label}
              aria-pressed={active}
              onClick={() => openCenter(center)}
              style={{
                ...ROW,
                borderColor: active ? center.accent : (ROW.border as string),
                background: active ? `${center.accent}22` : ROW.background,
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>{center.icon}</span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.02em" }}>{center.label}</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{center.info}</span>
              </span>
            </button>
          );
        })}
        {onOpenYourPage ? (
          <button type="button" data-testid="hub-gps-your-page" aria-label="Your Page" onClick={onOpenYourPage} style={ROW}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>🏠</span>
            <span style={{ fontSize: 9, fontWeight: 800 }}>YOUR PAGE</span>
          </button>
        ) : null}
        {role === "performer" && onOpenPerformerPage ? (
          <button type="button" data-testid="hub-gps-performer-page" aria-label="Performer Page" onClick={onOpenPerformerPage} style={ROW}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>🎤</span>
            <span style={{ fontSize: 9, fontWeight: 800 }}>PERFORMER</span>
          </button>
        ) : null}
        {role === "performer" && onOpenArticleEditor ? (
          <button type="button" data-testid="hub-gps-article-editor" aria-label="Article Editor" onClick={onOpenArticleEditor} style={ROW}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>✍️</span>
            <span style={{ fontSize: 9, fontWeight: 800 }}>ARTICLE</span>
          </button>
        ) : null}
        {onOpenMagazine ? (
          <button type="button" data-testid="hub-gps-magazine" aria-label="Magazine" onClick={onOpenMagazine} style={ROW}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>📰</span>
            <span style={{ fontSize: 9, fontWeight: 800 }}>MAGAZINE</span>
          </button>
        ) : null}
        {onOpenSettings ? (
          <button type="button" data-testid="hub-gps-rail-settings" aria-label="Settings" onClick={onOpenSettings} style={ROW}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }} aria-hidden>⚙️</span>
            <span style={{ fontSize: 9, fontWeight: 800 }}>SETTINGS</span>
          </button>
        ) : null}
      </div>
      </div>
      <input
        data-testid="hub-gps-slider"
        type="range"
        min={0}
        max={scrollMax}
        value={Math.min(scrollTop, scrollMax)}
        aria-label="Scroll GPS commands"
        aria-valuemin={0}
        aria-valuemax={scrollMax}
        aria-valuenow={Math.round(scrollTop)}
        onChange={(event) => {
          const next = Number(event.target.value);
          const node = scrollerRef.current;
          if (node) node.scrollTop = next;
          setScrollTop(next);
        }}
        style={{
          width: 18,
          flex: "0 0 18px",
          alignSelf: "stretch",
          accentColor: "#AA2DFF",
          cursor: "pointer",
        }}
      />
    </aside>
  );
}

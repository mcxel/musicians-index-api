"use client";

/**
 * HubMobileGpsNavDrawer — GPS (ex-OPS) navigation suite for mobile.
 * Occupies Monitor 2 visual slot OR drops below dual monitors (layout store).
 */

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { OperatingCenter } from "@/lib/drawers/operatingCenterRegistry";
import type { CommandCenterPanelId } from "./commandCenterRegistry";
import {
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

export interface HubMobileGpsNavDrawerProps {
  role: MobileCommandCenterRole;
  centers: OperatingCenter[];
  activePanel: CommandCenterPanelId | null;
  onOpenPanel: (id: CommandCenterPanelId) => void;
  onOpenYourPage?: () => void;
  onOpenPerformerPage?: () => void;
  onOpenArticleEditor?: () => void;
  onOpenMagazine?: () => void;
  onOpenSettings?: () => void;
  displayName?: string;
  layout: MobileMonitorLayoutState;
}

const RAIL: Array<{ id: string; label: string; workspace?: UniversalWorkspaceId; href?: string }> = [
  { id: "live-rooms", label: "LIVE ROOMS", href: "/live/rooms" },
  { id: "lobby", label: "LOBBY", workspace: "lobby" },
  { id: "messages", label: "MESSAGES", workspace: "messaging" },
  { id: "friends", label: "FRIENDS", href: "/friends" },
  { id: "inventory", label: "INVENTORY", workspace: "inventory" },
  { id: "memory-wall", label: "MEMORY WALL", workspace: "memory-wall" },
  { id: "playlists", label: "PLAYLISTS", workspace: "playlist-studio" },
  { id: "store", label: "STORE", workspace: "store" },
];

const ROW: CSSProperties = {
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
  onOpenYourPage,
  onOpenPerformerPage,
  onOpenArticleEditor,
  onOpenMagazine,
  onOpenSettings,
  displayName,
  layout,
}: HubMobileGpsNavDrawerProps) {
  const restoreMonitor2 = useMobileGpsMonitorLayoutStore((s) => s.restoreMonitor2);
  const closeGpsDrawer = useMobileGpsMonitorLayoutStore((s) => s.closeGpsDrawer);
  const accent = role === "performer" ? "#FFD700" : "#00FF88";
  const router = useRouter();
  const { activePanel: qpPanel, togglePanel, openPanel, closePanel } = useCompactQuickPanelStore();
  const { primary } = getMobileQuickPanelCapabilities(role);

  const showMonitorBack = layout === "DRAWER_REPLACES_MONITOR_2";
  const drawerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const node = drawerRef.current;
    if (!node) return;
    let frame = 0;
    let raf = 0;
    const reveal = () => {
      let parent = node.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        if (parent.scrollHeight > parent.clientHeight + 1 && /(auto|scroll|overlay)/.test(style.overflowY)) {
          const delta = node.getBoundingClientRect().top - parent.getBoundingClientRect().top;
          if (delta > 8) parent.scrollTop += delta;
        }
        parent = parent.parentElement;
      }
      const top = node.getBoundingClientRect().top;
      if (top > 24) window.scrollBy(0, top - 8);
      node.dataset.gpsRevealTop = String(Math.round(node.getBoundingClientRect().top));
      frame += 1;
      if (frame < 24 && node.getBoundingClientRect().top > 80) raf = requestAnimationFrame(reveal);
    };
    reveal();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={drawerRef}
      data-hub-mobile-gps-drawer="1"
      data-gps-layout={layout}
      data-testid="hub-mobile-gps-drawer"
      aria-label="GPS navigation"
      style={{
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
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 10,
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

      <div data-testid="hub-gps-rail" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        {RAIL.filter((item) => item.id !== "inventory" || role !== "performer").map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`hub-gps-rail-${item.id}`}
            style={ROW}
            onClick={() => {
              if (item.workspace) presentCanonicalWorkspace(item.workspace, "DRAWER");
              else if (item.href) router.push(item.href);
            }}
          >
            {item.label}
          </button>
        ))}
        {onOpenSettings ? (
          <button type="button" data-testid="hub-gps-rail-settings" onClick={onOpenSettings} style={ROW}>SETTINGS</button>
        ) : null}
        {onOpenYourPage ? (
          <button type="button" data-testid="hub-gps-your-page" onClick={onOpenYourPage} style={ROW}>YOUR PAGE</button>
        ) : null}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {centers.map((center) => {
          const active = activePanel === center.primaryModule;
          return (
            <button
              key={center.id}
              type="button"
              data-testid={`hub-gps-nav-${center.id}`}
              onClick={() => onOpenPanel(center.primaryModule)}
              style={{
                ...TILE,
                border: active ? `1px solid ${center.accent}` : TILE.border,
                background: active
                  ? `linear-gradient(180deg, ${center.accent}44 0%, ${center.accent}18 55%, #0a0e16 100%)`
                  : TILE.background,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
                {center.icon}
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
          <button type="button" data-testid="hub-gps-article-editor" onClick={onOpenArticleEditor} style={TILE}>ARTICLE EDITOR</button>
        ) : null}
        {onOpenMagazine ? (
          <button type="button" data-testid="hub-gps-magazine" onClick={onOpenMagazine} style={TILE}>MAGAZINE</button>
        ) : null}
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
    </section>
  );
}

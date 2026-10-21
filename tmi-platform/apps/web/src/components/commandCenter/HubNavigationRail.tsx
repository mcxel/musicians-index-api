"use client";

/**
 * HubNavigationRail — desktop left navigation surface (blueprint restoration).
 * Operating Centers from operatingCenterRegistry + identity block at bottom.
 * Mobile: use MobileQuickPanelBar / dock — do not mount this rail.
 */

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { OperatingCenter } from "@/lib/drawers/operatingCenterRegistry";
import type { CommandCenterPanelId } from "./commandCenterRegistry";
import { useCompactQuickPanelStore, type CompactQuickPanelId } from "@/lib/hud/compactQuickPanelStore";
import { ProductShellIcon } from "@/components/shell/ProductShellIcon";
import { openWelcomeCommand } from "@/lib/welcome/welcomeBriefingPreference";

export interface HubNavigationRailProps {
  role: "fan" | "performer";
  centers: OperatingCenter[];
  activePanel: CommandCenterPanelId | null;
  onOpenPanel: (id: CommandCenterPanelId) => void;
  onOpenYourPage: () => void;
  onOpenPerformerPage?: () => void;
  onOpenArticleEditor?: () => void;
  onOpenArticles?: () => void;
  onOpenMagazine: () => void;
  onOpenSettings: () => void;
  identity?: ReactNode;
}

export default function HubNavigationRail({
  role,
  centers,
  activePanel,
  onOpenPanel,
  onOpenYourPage,
  onOpenPerformerPage,
  onOpenArticleEditor,
  onOpenArticles,
  onOpenMagazine,
  onOpenSettings,
  identity,
}: HubNavigationRailProps) {
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controlsRef.current?.scrollTo({ top: 0 });
  }, []);

  function scrollTools(delta: number) {
    controlsRef.current?.scrollBy({ top: delta, behavior: "smooth" });
  }

  return (
    <aside
      data-hub-navigation-rail
      data-shell-role={role}
      aria-label={`${role === "performer" ? "Performer" : "Fan"} hub navigation`}
      style={{
        width: 200,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 4,
        padding: "8px 6px",
        height: "100%",
        maxHeight: "calc(100dvh - 96px)",
        alignSelf: "flex-start",
        borderRight: "1px solid rgba(0,229,255,0.12)",
        background: "rgba(5,5,16,0.72)",
        backdropFilter: "blur(10px)",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <button type="button" data-testid="hub-nav-up" aria-label="Scroll tools up" onClick={() => scrollTools(-160)} style={chevronStyle}>▲</button>
      <div
        ref={controlsRef}
        data-hub-navigation-controls
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); scrollTools(120); }
          if (event.key === "ArrowUp") { event.preventDefault(); scrollTools(-120); }
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 2,
        }}
      >
        {centers.map((center) => {
          const active = activePanel === center.primaryModule;
          const quickPanel: CompactQuickPanelId = center.primaryModule === "yopho" ? "yopho"
            : center.primaryModule === "memory" ? "memory-wall"
            : center.id === "avatar" && role === "fan" ? "avatar" : null;
          return (
            <div
              key={center.id}
              data-testid={`hub-nav-${center.id}`}
              data-hub-nav-module={center.primaryModule}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "10px 4px",
                borderRadius: 8,
                border: active ? `1px solid ${center.accent}` : "1px solid rgba(190,210,235,0.22)",
                background: active
                  ? `linear-gradient(180deg, ${center.accent}44 0%, ${center.accent}18 55%, #0a0e16 100%)`
                  : "linear-gradient(180deg, rgba(28,34,44,0.92) 0%, rgba(10,12,18,0.94) 100%)",
                color: active ? "#fff" : "rgba(255,255,255,0.7)",
                fontFamily: "inherit",
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
                minHeight: 64,
                boxShadow: active
                  ? `0 0 12px ${center.accent}44, inset 0 1px 0 rgba(255,255,255,0.25)`
                  : "inset 0 1px 0 rgba(255,255,255,0.14)",
              }}
            >
              {quickPanel ? (
                <button type="button" aria-label={`Quick ${center.label}`} title={`Quick ${center.label}`}
                  onClick={() => useCompactQuickPanelStore.getState().openPanel(quickPanel, "bottom-left")}
                  style={{ border: 0, background: "none", color: "inherit", cursor: "pointer", display: "grid", placeItems: "center", minWidth: 40, minHeight: 32 }}>
                  <ProductShellIcon name={center.id} size={18} />
                </button>
              ) : (
                <span style={{ display: "grid", placeItems: "center", width: 22, height: 22, color: "rgba(226,232,240,0.92)" }} aria-hidden>
                  <ProductShellIcon name={center.id} size={18} />
                </span>
              )}
              <button type="button" title={`${center.label} — ${center.info}`} aria-label={`Open ${center.label} drawer`}
                onClick={() => onOpenPanel(center.primaryModule)}
                style={{ border: 0, background: "none", color: "inherit", cursor: "pointer", fontSize: 7, fontWeight: 900, letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.2, wordBreak: "break-word", width: "100%", minHeight: 26 }}>
                {center.label}
              </button>
            </div>
          );
        })}
        <AuthorButton testId="hub-nav-your-page" label="YOUR PAGE" onClick={onOpenYourPage} />
        {role === "performer" && onOpenPerformerPage ? (
          <AuthorButton testId="hub-nav-performer-page" label="PERFORMER PAGE" onClick={onOpenPerformerPage} />
        ) : null}
        {role === "performer" && onOpenArticleEditor ? (
          <AuthorButton testId="hub-nav-article-editor" label="BIOGRAPHY" onClick={onOpenArticleEditor} />
        ) : null}
        {role === "performer" && onOpenArticles ? (
          <AuthorButton testId="hub-nav-articles" label="ARTICLES" onClick={onOpenArticles} />
        ) : null}
        <AuthorButton testId="hub-nav-magazine" label="MAGAZINE" onClick={onOpenMagazine} />
        <AuthorButton testId="hub-nav-settings" label="SETTINGS" onClick={onOpenSettings} />
        <AuthorButton testId="hub-nav-welcome" label="WELCOME" onClick={() => openWelcomeCommand()} />
      </div>
      <button type="button" data-testid="hub-nav-down" aria-label="Scroll tools down" onClick={() => scrollTools(160)} style={chevronStyle}>▼</button>
      {identity ? (
        <div data-testid="hub-nav-identity" style={{ flexShrink: 0, minHeight: 0 }}>
          {identity}
        </div>
      ) : null}
    </aside>
  );
}

function AuthorButton({ testId, label, onClick }: { testId: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      style={{
        minHeight: 44,
        borderRadius: 8,
        border: "1px solid rgba(0,255,255,0.45)",
        background: "linear-gradient(180deg, rgba(28,34,44,0.92) 0%, rgba(10,12,18,0.94) 100%)",
        color: "#f4f1ff",
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

const chevronStyle: CSSProperties = {
  flexShrink: 0,
  minHeight: 28,
  border: "1px solid rgba(0,255,255,0.35)",
  borderRadius: 8,
  background: "transparent",
  color: "#00FFFF",
  fontWeight: 900,
  cursor: "pointer",
};

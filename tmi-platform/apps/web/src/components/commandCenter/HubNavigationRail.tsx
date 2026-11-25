"use client";

/**
 * HubNavigationRail — canonical dark left rail with white Lucide icons.
 * Restored from approved white-button authority (solid #1B2430 / #FFFFFF).
 *
 * Split-action law (owner P0, 2026-11-21 — recover dual-zone from 266ec212 / p0-fast-launch):
 *   MAIN BODY → full drawer via onOpenPanel
 *   TOP-RIGHT CHEVRON → quick panel only (Avatar / Memory / YoPho), stopPropagation
 * Never fire both on one click.
 *
 * Mobile: use MobileQuickPanelBar / dock — do not mount this rail.
 */

import { useEffect, useRef, type CSSProperties, type ReactNode, type MouseEvent } from "react";
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

const RAIL_BTN: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 5px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#1B2430",
  color: "#F9FAFB",
  cursor: "pointer",
  fontFamily: "inherit",
  minHeight: 56,
  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  width: "100%",
  position: "relative",
};

function resolveQuickPanel(
  center: OperatingCenter,
  role: "fan" | "performer",
): CompactQuickPanelId | null {
  if (center.primaryModule === "yopho") return "yopho";
  if (center.primaryModule === "memory") return "memory-wall";
  if (center.id === "avatar" && role === "fan") return "avatar";
  return null;
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
      data-hub-rail-icon-authority="ProductShellIcon"
      data-hub-rail-chrome="dark-white-canonical"
      data-hub-rail-split-action="drawer-body-chevron-quick"
      data-shell-role={role}
      data-hub-navigation-inventory-count={centers.length}
      aria-label={`${role === "performer" ? "Performer" : "Fan"} hub navigation`}
      style={{
        width: 96,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 6,
        padding: "8px 7px",
        height: "100%",
        maxHeight: "calc(100dvh - 96px)",
        alignSelf: "flex-start",
        borderRight: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(12,16,24,0.96)",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        data-testid="hub-nav-up"
        aria-label="Scroll tools up"
        onClick={() => scrollTools(-160)}
        style={scrollChevronStyle}
      >
        ▲
      </button>
      <div
        ref={controlsRef}
        data-hub-navigation-controls
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            scrollTools(120);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            scrollTools(-120);
          }
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "2px 3px 8px 0",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.42) rgba(255,255,255,0.08)",
        }}
      >
        {centers.map((center) => {
          const active = activePanel === center.primaryModule;
          const quickPanel = resolveQuickPanel(center, role);

          const openDrawer = () => {
            onOpenPanel(center.primaryModule);
          };

          const openQuick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!quickPanel) return;
            useCompactQuickPanelStore.getState().openPanel(quickPanel, "bottom-left");
          };

          return (
            <div
              key={center.id}
              data-testid={`hub-nav-${center.id}`}
              data-hub-nav-module={center.primaryModule}
              data-hub-nav-split={quickPanel ? "1" : "0"}
              style={{
                ...RAIL_BTN,
                border: active ? "1px solid #FFFFFF" : RAIL_BTN.border,
                background: active ? "#303B4B" : "#1B2430",
                boxShadow: active
                  ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
                  : "0 1px 2px rgba(0,0,0,0.2)",
                padding: 0,
                overflow: "hidden",
              }}
            >
              {/* ZONE A — main body opens full drawer only */}
              <button
                type="button"
                title={`${center.label} — ${center.info}`}
                aria-label={`Open ${center.label} drawer`}
                data-hub-nav-zone="drawer"
                onClick={openDrawer}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "9px 5px",
                  paddingRight: quickPanel ? 18 : 5,
                  border: "none",
                  background: "transparent",
                  color: "#F9FAFB",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  width: "100%",
                  minHeight: 56,
                }}
              >
                <span
                  data-hub-nav-icon={center.id}
                  aria-hidden="true"
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 28,
                    height: 28,
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <ProductShellIcon name={center.id} size={18} />
                </span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: 0,
                    textAlign: "center",
                    lineHeight: 1.2,
                    overflowWrap: "anywhere",
                    color: "#F9FAFB",
                  }}
                >
                  {center.label}
                </span>
              </button>

              {/* ZONE B — top-right chevron opens quick panel only */}
              {quickPanel ? (
                <button
                  type="button"
                  data-hub-nav-zone="quick-panel"
                  data-quick-panel-chevron={quickPanel}
                  aria-label={`Open ${center.label} quick panel`}
                  title={`Quick ${center.label}`}
                  onClick={openQuick}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 22,
                    height: 22,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background: "transparent",
                    color: "rgba(249,250,251,0.85)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    zIndex: 2,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 0,
                      height: 0,
                      borderStyle: "solid",
                      borderWidth: "0 22px 22px 0",
                      borderColor: "transparent rgba(255,255,255,0.22) transparent transparent",
                      position: "absolute",
                      top: 0,
                      right: 0,
                    }}
                  />
                  <span
                    aria-hidden
                    style={{
                      position: "relative",
                      fontSize: 8,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginTop: 2,
                      marginRight: 2,
                      color: "#F9FAFB",
                      textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                    }}
                  >
                    ▸
                  </span>
                </button>
              ) : null}
            </div>
          );
        })}
        <div
          data-hub-navigation-shortcuts
          style={{
            display: "grid",
            gap: 4,
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 8,
            marginTop: 4,
          }}
        >
          <AuthorButton testId="hub-nav-your-page" label="YOUR PAGE" onClick={onOpenYourPage} />
          {role === "performer" && onOpenPerformerPage ? (
            <AuthorButton
              testId="hub-nav-performer-page"
              label="PERFORMER PAGE"
              onClick={onOpenPerformerPage}
            />
          ) : null}
          {role === "performer" && onOpenArticleEditor ? (
            <AuthorButton
              testId="hub-nav-article-editor"
              label="BIOGRAPHY"
              onClick={onOpenArticleEditor}
            />
          ) : null}
          {role === "performer" && onOpenArticles ? (
            <AuthorButton testId="hub-nav-articles" label="ARTICLES" onClick={onOpenArticles} />
          ) : null}
          <AuthorButton testId="hub-nav-magazine" label="MAGAZINE" onClick={onOpenMagazine} />
          <AuthorButton testId="hub-nav-settings" label="SETTINGS" onClick={onOpenSettings} />
          <AuthorButton
            testId="hub-nav-welcome"
            label="WELCOME"
            onClick={() => openWelcomeCommand()}
          />
        </div>
      </div>
      <button
        type="button"
        data-testid="hub-nav-down"
        aria-label="Scroll tools down"
        onClick={() => scrollTools(160)}
        style={scrollChevronStyle}
      >
        ▼
      </button>
      {identity ? (
        <div data-testid="hub-nav-identity" style={{ flexShrink: 0, minHeight: 0 }}>
          {identity}
        </div>
      ) : null}
    </aside>
  );
}

function AuthorButton({
  testId,
  label,
  onClick,
}: {
  testId: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" data-testid={testId} onClick={onClick} style={RAIL_BTN} title={label}>
      <span
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: 0,
          textAlign: "center",
          lineHeight: 1.2,
          overflowWrap: "anywhere",
          color: "#F9FAFB",
        }}
      >
        {label}
      </span>
    </button>
  );
}

const scrollChevronStyle: CSSProperties = {
  flexShrink: 0,
  minHeight: 28,
  border: "1px solid rgba(255,255,255,0.28)",
  borderRadius: 6,
  background: "#1B2430",
  color: "#F9FAFB",
  fontWeight: 900,
  cursor: "pointer",
};

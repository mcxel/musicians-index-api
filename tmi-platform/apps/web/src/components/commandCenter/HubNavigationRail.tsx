"use client";

/**
 * HubNavigationRail — desktop left navigation surface (blueprint restoration).
 * Operating Centers from operatingCenterRegistry + identity block at bottom.
 * Mobile: use MobileQuickPanelBar / dock — do not mount this rail.
 */

import { useEffect, useRef } from "react";
import type { OperatingCenter } from "@/lib/drawers/operatingCenterRegistry";
import type { CommandCenterPanelId } from "./commandCenterRegistry";

export interface HubNavigationRailProps {
  role: "fan" | "performer";
  centers: OperatingCenter[];
  activePanel: CommandCenterPanelId | null;
  onOpenPanel: (id: CommandCenterPanelId) => void;
}

export default function HubNavigationRail({
  role,
  centers,
  activePanel,
  onOpenPanel,
}: HubNavigationRailProps) {
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controlsRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <aside
      data-hub-navigation-rail
      data-shell-role={role}
      aria-label={`${role === "performer" ? "Performer" : "Fan"} hub navigation`}
      style={{
        width: 76,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 4,
        padding: "8px 6px",
        // Align with Monitor A rather than the header/control rows. The parent
        // lane bounds this sticky travel to the dual-monitor workspace.
        marginTop: 224,
        position: "sticky",
        top: 96,
        maxHeight: "min(760px, calc(100dvh - 116px))",
        alignSelf: "flex-start",
        borderRight: "1px solid rgba(0,229,255,0.12)",
        background: "rgba(5,5,16,0.72)",
        backdropFilter: "blur(10px)",
        minHeight: 0,
        overflow: "hidden",
        overflowX: "hidden",
      }}
    >
      <div
        ref={controlsRef}
        data-hub-navigation-controls
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
          return (
            <button
              key={center.id}
              type="button"
              data-testid={`hub-nav-${center.id}`}
              data-hub-nav-module={center.primaryModule}
              title={`${center.label} — ${center.info}`}
              onClick={() => onOpenPanel(center.primaryModule)}
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
                  : "linear-gradient(180deg, #3a4254 0%, #1a1f2c 55%, #0e1218 100%)",
                color: active ? "#fff" : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
                minHeight: 64,
                boxShadow: active
                  ? `0 0 12px ${center.accent}44, inset 0 1px 0 rgba(255,255,255,0.25)`
                  : "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.35)",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>{center.icon}</span>
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textAlign: "center",
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                }}
              >
                {center.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

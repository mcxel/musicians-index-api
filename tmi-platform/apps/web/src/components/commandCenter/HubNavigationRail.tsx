"use client";

/**
 * HubNavigationRail — desktop left navigation surface (blueprint restoration).
 * Operating Centers from operatingCenterRegistry + identity block at bottom.
 * Mobile: use MobileQuickPanelBar / dock — do not mount this rail.
 */

import type { OperatingCenter } from "@/lib/drawers/operatingCenterRegistry";
import CommandCenterIdentityCard from "./CommandCenterIdentityCard";
import type { CommandCenterPanelId } from "./commandCenterRegistry";

export interface HubNavigationRailProps {
  role: "fan" | "performer";
  userId: string;
  displayName: string;
  centers: OperatingCenter[];
  activePanel: CommandCenterPanelId | null;
  onOpenPanel: (id: CommandCenterPanelId) => void;
}

export default function HubNavigationRail({
  role,
  userId,
  displayName,
  centers,
  activePanel,
  onOpenPanel,
}: HubNavigationRailProps) {
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
        borderRight: "1px solid rgba(0,229,255,0.12)",
        background: "rgba(5,5,16,0.72)",
        backdropFilter: "blur(10px)",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minHeight: 0 }}>
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
                gap: 4,
                padding: "8px 4px",
                borderRadius: 10,
                border: active ? `1px solid ${center.accent}` : "1px solid transparent",
                background: active ? `${center.accent}18` : "transparent",
                color: active ? center.accent : "rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
                minHeight: 56,
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
      <div style={{ flexShrink: 0, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <CommandCenterIdentityCard userId={userId} displayName={displayName} role={role} />
      </div>
    </aside>
  );
}

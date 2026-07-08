"use client";

import type { ReactNode } from "react";

type CanisterProps = {
  id?: string;
  title: string;
  accent?: string;
  statusLabel?: string;
  children: ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onToggleFullscreen?: () => void;
  style?: React.CSSProperties;
};

export default function Canister({
  id,
  title,
  accent = "#00FFFF",
  statusLabel = "LIVE",
  children,
  collapsed = false,
  onToggleCollapse,
  onToggleFullscreen,
  style,
}: CanisterProps) {
  return (
    <section
      id={id}
      data-canister={title}
      style={{
        position: "relative",
        background:
          "linear-gradient(155deg, rgba(38,9,36,0.94) 0%, rgba(17,6,22,0.96) 52%, rgba(8,3,13,0.98) 100%)",
        border: `1px solid ${accent}55`,
        borderRadius: 10,
        boxShadow:
          "0 0 0 1px rgba(255,215,0,0.14), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 24px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.48)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        ...style,
      }}
    >
      <span style={{ position: "absolute", top: 3, left: 3, width: 10, height: 10, borderTop: "2px solid #FFD700", borderLeft: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", top: 3, right: 3, width: 10, height: 10, borderTop: "2px solid #FFD700", borderRight: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: 3, left: 3, width: 10, height: 10, borderBottom: "2px solid #FFD700", borderLeft: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: 3, right: 3, width: 10, height: 10, borderBottom: "2px solid #FFD700", borderRight: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />

      <div
        style={{
          padding: "7px 10px",
          borderBottom: `1px solid ${accent}45`,
          background: `linear-gradient(to right, ${accent}20, rgba(255,215,0,0.08) 60%, transparent)`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, boxShadow: `0 0 7px ${accent}` }} />
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.2em",
              color: accent,
              textTransform: "uppercase",
              textShadow: `0 0 8px ${accent}66`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          <span
            style={{
              marginLeft: 6,
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand canister" : "Collapse canister"}
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.8)",
                borderRadius: 6,
                width: 18,
                height: 18,
                fontSize: 10,
                lineHeight: "16px",
                cursor: "pointer",
              }}
            >
              {collapsed ? "+" : "-"}
            </button>
          )}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label="Toggle fullscreen canister"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.8)",
                borderRadius: 6,
                width: 18,
                height: 18,
                fontSize: 10,
                lineHeight: "16px",
                cursor: "pointer",
              }}
            >
              □
            </button>
          )}
        </div>
      </div>

      {!collapsed && <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</div>}
    </section>
  );
}

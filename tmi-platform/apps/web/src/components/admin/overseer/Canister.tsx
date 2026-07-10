"use client";

import type { ReactNode } from "react";
import { BezelFrame } from "@/components/admin/overseer/AdminDesignSystem";

type CanisterProps = {
  id?: string;
  title: string;
  accent?: string;
  statusLabel?: string;
  children: ReactNode;
  collapsed?: boolean;
  floating?: boolean;
  onToggleCollapse?: () => void;
  onToggleFloat?: () => void;
  onCloseWindow?: () => void;
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
  floating = false,
  onToggleCollapse,
  onToggleFloat,
  onCloseWindow,
  onToggleFullscreen,
  style,
}: CanisterProps) {
  return (
    <BezelFrame
      variant="ornate-gold"
      outerStyle={{
        position: "relative",
        zIndex: floating ? 1000 : 1,
        boxShadow: floating
          ? "0 20px 50px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,215,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 0 0 1px rgba(255,215,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 30px rgba(0,0,0,0.72), 0 10px 24px rgba(0,0,0,0.55)",
        ...style,
      }}
      innerStyle={{
        border: "1px solid rgba(184,134,11,0.56)",
        background: "linear-gradient(180deg, rgba(13,10,10,0.96), rgba(8,7,8,0.98))",
      }}
    >
      <section
        id={id}
        data-canister={title}
        style={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
        }}
      >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 10,
          border: "1px solid rgba(255,215,0,0.08)",
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "absolute", top: 3, left: 3, width: 10, height: 10, borderTop: "2px solid #FFD700", borderLeft: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", top: 3, right: 3, width: 10, height: 10, borderTop: "2px solid #FFD700", borderRight: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: 3, left: 3, width: 10, height: 10, borderBottom: "2px solid #FFD700", borderLeft: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: 3, right: 3, width: 10, height: 10, borderBottom: "2px solid #FFD700", borderRight: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />

      <div
        style={{
          padding: "8px 10px",
          borderBottom: "1px solid rgba(255,191,82,0.42)",
          background: "linear-gradient(180deg, rgba(37,23,15,0.9), rgba(22,15,12,0.94))",
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
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#D6A54A",
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(214,165,74,0.45)",
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
              fontSize: 8,
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
          {onToggleFloat && (
            <button
              type="button"
              onClick={onToggleFloat}
              aria-label={floating ? "Dock window" : "Float window"}
              title={floating ? "Dock window" : "Float window"}
              style={{
                border: "1px solid rgba(255,215,0,0.22)",
                background: floating ? "rgba(0,255,255,0.14)" : "rgba(255,215,0,0.1)",
                color: floating ? "#73FFFF" : "#FFD88F",
                borderRadius: 6,
                width: 18,
                height: 18,
                fontSize: 10,
                lineHeight: "16px",
                cursor: "pointer",
              }}
            >
              ❐
            </button>
          )}
          {onCloseWindow && (
            <button
              type="button"
              onClick={onCloseWindow}
              aria-label="Close window"
              title="Close window"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,68,68,0.12)",
                color: "#FF8A8A",
                borderRadius: 6,
                width: 18,
                height: 18,
                fontSize: 10,
                lineHeight: "16px",
                cursor: "pointer",
              }}
            >
              ×
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

      {!collapsed && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: 10,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0) 18%, rgba(0,0,0,0.15) 100%)",
          }}
        >
          {children}
        </div>
      )}
      </section>
    </BezelFrame>
  );
}

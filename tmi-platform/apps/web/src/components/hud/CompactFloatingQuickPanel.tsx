"use client";

import React, { useState, type ReactNode } from "react";
import { digitalQuickPanelFrameStyle } from "@/lib/ui/digitalQuickPanelChrome";
import type { CompactQuickPanelCorner } from "@/lib/hud/compactQuickPanelStore";

export const QUICK_PANEL_WIDTH = "min(88vw, 380px)";
export const QUICK_PANEL_MAX_HEIGHT = "min(56dvh, 50vh)";

export interface CompactFloatingQuickPanelProps {
  title: string;
  accentColor?: string;
  corner?: CompactQuickPanelCorner;
  onClose: () => void;
  onOpenDeep?: () => void;
  deepLabel?: string;
  /** Optional tab row (e.g. REMOTE two-sided). */
  tabs?: ReactNode;
  children: ReactNode;
  /** Bottom offset above nav — defaults to safe-area + nav + 12px. */
  bottomOffset?: number;
}

export default function CompactFloatingQuickPanel({
  title,
  accentColor = "#00E5FF",
  corner = "bottom-right",
  onClose,
  onOpenDeep,
  deepLabel,
  tabs,
  children,
  bottomOffset = 72,
}: CompactFloatingQuickPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const horizontal = corner === "bottom-left" ? { left: 12 } : { right: 12 };

  return (
    <div
      role="dialog"
      aria-label={title}
      data-compact-floating-quick-panel={title}
      style={{
        position: "fixed",
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px) + 12px)`,
        ...horizontal,
        width: QUICK_PANEL_WIDTH,
        maxHeight: collapsed ? "auto" : QUICK_PANEL_MAX_HEIGHT,
        zIndex: 9360,
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        ...digitalQuickPanelFrameStyle(accentColor),
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 10px",
          borderBottom: collapsed ? "none" : `1px solid ${accentColor}44`,
          background: "rgba(2,8,22,0.94)",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
          style={{
            background: "transparent",
            border: "none",
            color: accentColor,
            cursor: "pointer",
            fontSize: 12,
            padding: "0 2px",
            lineHeight: 1,
          }}
        >
          {collapsed ? "˄" : "˅"}
        </button>
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: accentColor,
            letterSpacing: "0.1em",
            flex: 1,
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        {onOpenDeep ? (
          <button
            type="button"
            onClick={onOpenDeep}
            style={{
              fontSize: 7,
              fontWeight: 800,
              padding: "3px 6px",
              borderRadius: 4,
              border: `1px solid ${accentColor}`,
              background: `${accentColor}18`,
              color: accentColor,
              cursor: "pointer",
            }}
          >
            {deepLabel ?? "FULL"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          style={{ background: "transparent", border: "none", color: "#7878AA", cursor: "pointer", fontSize: 13 }}
        >
          ✕
        </button>
      </div>

      {!collapsed ? (
        <>
          {tabs ? (
            <div style={{ flexShrink: 0, borderBottom: `1px solid ${accentColor}22`, background: "rgba(2,8,22,0.9)" }}>
              {tabs}
            </div>
          ) : null}
          <div
            style={{
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              flex: 1,
              minHeight: 0,
            }}
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}

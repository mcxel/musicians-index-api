"use client";

import React from "react";
import type { ChatWidgetId } from "@/lib/chat/ChatWidgetDockingEngine";

type ChatWidgetHandleProps = {
  widgetId: ChatWidgetId;
  title: string;
  onStartDrag: (event: React.MouseEvent<HTMLDivElement>) => void;
  onOpenSettings: () => void;
  onToggleMinimize: () => void;
  onHide: () => void;
  minimized: boolean;
};

export function ChatWidgetHandle({
  widgetId,
  title,
  onStartDrag,
  onOpenSettings,
  onToggleMinimize,
  onHide,
  minimized,
}: ChatWidgetHandleProps) {
  return (
    <div
      onMouseDown={onStartDrag}
      style={{
        cursor: "grab",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "8px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(90deg, rgba(15,23,42,0.9), rgba(30,41,59,0.86))",
      }}
      aria-label={`${title} drag handle`}
      data-widget-id={widgetId}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>::</span>
        <span
          style={{
            color: "#e2e8f0",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          onClick={onToggleMinimize}
          style={buttonStyle}
          aria-label={minimized ? "Restore widget" : "Minimize widget"}
        >
          {minimized ? "+" : "-"}
        </button>
        <button type="button" onClick={onOpenSettings} style={buttonStyle} aria-label="Open widget settings">
          S
        </button>
        <button type="button" onClick={onHide} style={buttonStyle} aria-label="Hide widget">
          X
        </button>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,0.4)",
  background: "rgba(15,23,42,0.8)",
  color: "#cbd5e1",
  borderRadius: 6,
  width: 22,
  height: 22,
  fontSize: 11,
  lineHeight: "20px",
  cursor: "pointer",
};

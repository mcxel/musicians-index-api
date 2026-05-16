"use client";
import React, { useState } from "react";

interface DashboardPanelProps {
  panelId: string;
  label: string;
  accentColor?: string;
  defaultCollapsed?: boolean;
  width?: "full" | "half" | "third";
  children: React.ReactNode;
}

export default function DashboardPanel({
  label,
  accentColor = "#00FFFF",
  defaultCollapsed = false,
  children,
}: DashboardPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#fff",
        }}
      >
        <span style={{ fontSize: 9, letterSpacing: "0.3em", fontWeight: 800, color: accentColor }}>
          {label.toUpperCase()}
        </span>
        <span style={{ fontSize: 14, color: accentColor, opacity: 0.6 }}>{collapsed ? "+" : "−"}</span>
      </button>

      {!collapsed && (
        <div style={{ padding: "0 18px 18px" }}>{children}</div>
      )}
    </div>
  );
}

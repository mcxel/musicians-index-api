"use client";

import { useState } from "react";
import AdminLiveFeedExplorer from "@/components/admin/AdminLiveFeedExplorer";

type AdminLiveFeedGridProps = {
  collapsed?: boolean;
};

export default function AdminLiveFeedGrid({ collapsed: defaultCollapsed = false }: AdminLiveFeedGridProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshRate, setRefreshRate] = useState(12);

  return (
    <aside
      data-admin-rail="live-feed"
      style={{
        border: "1px solid rgba(0,255,255,0.3)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(5,30,40,0.65), rgba(3,8,16,0.92))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: collapsed ? "none" : "1px solid rgba(0,255,255,0.15)",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#00FFFF",
            boxShadow: "0 0 8px #00FFFF",
            display: "inline-block",
            flexShrink: 0,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <strong
          style={{
            color: "#99f6e4",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          LIVE FEED GRID
        </strong>
        <span
          style={{
            background: "rgba(239,68,68,0.2)",
            border: "1px solid rgba(239,68,68,0.5)",
            color: "#fca5a5",
            fontSize: 9,
            letterSpacing: "0.12em",
            padding: "1px 6px",
            borderRadius: 3,
            fontWeight: 800,
          }}
        >
          LIVE
        </span>
        <span style={{ color: "#00FFFF", fontSize: 12, lineHeight: 1, marginLeft: 4 }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 10px 4px" }}>
          <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#67e8f9", fontSize: 10, letterSpacing: "0.1em" }}>AUTO REFRESH</span>
              <button
                type="button"
                onClick={() => setAutoRefresh((value) => !value)}
                style={{
                  borderRadius: 6,
                  border: "1px solid rgba(34,211,238,0.35)",
                  background: "rgba(6,78,59,0.35)",
                  color: autoRefresh ? "#86efac" : "#fda4af",
                  fontSize: 9,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                {autoRefresh ? "ENABLED" : "DISABLED"}
              </button>
            </div>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "#99f6e4", fontSize: 10, letterSpacing: "0.1em" }}>
                REFRESH RATE {refreshRate}s
              </span>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={refreshRate}
                onChange={(event) => setRefreshRate(Number(event.target.value))}
                style={{ accentColor: "#06b6d4" }}
              />
            </label>
          </div>

          <AdminLiveFeedExplorer />
        </div>
      )}
    </aside>
  );
}

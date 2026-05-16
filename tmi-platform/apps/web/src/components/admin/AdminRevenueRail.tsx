"use client";

import { useState } from "react";
import RevenueAnalytics from "@/components/admin/overseer/RevenueAnalytics";

type AdminRevenueRailProps = {
  collapsed?: boolean;
};

export default function AdminRevenueRail({ collapsed: defaultCollapsed = false }: AdminRevenueRailProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [autoPayout, setAutoPayout] = useState(65);

  return (
    <aside
      data-admin-rail="revenue"
      style={{
        border: "1px solid rgba(251,191,36,0.5)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(69,39,5,0.6), rgba(15,10,3,0.92))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: collapsed ? "none" : "1px solid rgba(251,191,36,0.2)",
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
            background: "#fcd34d",
            boxShadow: "0 0 8px rgba(250,204,21,0.8)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <strong
          style={{
            color: "#fde68a",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          REVENUE RAIL
        </strong>
        <span style={{ color: "#fcd34d", fontSize: 12, lineHeight: 1 }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 10px 4px" }}>
          <div style={{ display: "grid", gap: 5, marginBottom: 10 }}>
            {["Subscription control", "Billboard approval", "Sponsor settlements"].map((item) => (
              <p key={item} style={{ margin: 0, fontSize: 10, color: "#fcd34d" }}>
                • {item}
              </p>
            ))}
          </div>

          <label style={{ display: "grid", gap: 4, marginBottom: 10 }}>
            <span style={{ color: "#fde68a", fontSize: 10, letterSpacing: "0.1em" }}>
              AUTO PAYOUT INTENSITY {autoPayout}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={autoPayout}
              onChange={(event) => setAutoPayout(Number(event.target.value))}
              style={{ accentColor: "#f59e0b" }}
            />
          </label>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {["Approve Batch", "Hold Queue", "Push Audit"].map((label) => (
              <button
                key={label}
                type="button"
                style={{
                  borderRadius: 6,
                  border: "1px solid rgba(251,191,36,0.32)",
                  background: "rgba(120,53,15,0.35)",
                  color: "#fde68a",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  padding: "5px 8px",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <RevenueAnalytics />
        </div>
      )}
    </aside>
  );
}

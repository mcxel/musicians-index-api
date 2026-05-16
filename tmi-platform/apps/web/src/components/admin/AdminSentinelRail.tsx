"use client";

import { useState } from "react";

type AdminSentinelRailProps = {
  collapsed?: boolean;
};

export default function AdminSentinelRail({ collapsed: defaultCollapsed = false }: AdminSentinelRailProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [threatLevel, setThreatLevel] = useState(34);
  const [autoModeration, setAutoModeration] = useState(true);
  const [queueLock, setQueueLock] = useState(false);

  return (
    <aside
      data-admin-rail="sentinel"
      style={{
        border: "1px solid rgba(239,68,68,0.45)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(69,10,10,0.55), rgba(15,5,5,0.88))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: collapsed ? "none" : "1px solid rgba(239,68,68,0.25)",
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
            background: "#ef4444",
            boxShadow: "0 0 8px #ef4444",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <strong
          style={{
            color: "#fca5a5",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          SENTINEL WALL
        </strong>
        <span style={{ color: "#ef4444", fontSize: 12, lineHeight: 1 }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 12px", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
            <span style={{ color: "#fca5a5", letterSpacing: "0.12em" }}>Threat Meter</span>
            <span style={{ color: "#fecaca" }}>{threatLevel}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={threatLevel}
            onChange={(event) => setThreatLevel(Number(event.target.value))}
            style={{ accentColor: "#ef4444" }}
          />

          {[{ label: "Auto Moderation", enabled: autoModeration, set: setAutoModeration }, { label: "Queue Lock", enabled: queueLock, set: setQueueLock }].map((toggle) => (
            <button
              key={toggle.label}
              type="button"
              onClick={() => toggle.set(!toggle.enabled)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 7,
                border: "1px solid rgba(239,68,68,0.28)",
                background: "rgba(127,29,29,0.35)",
                color: "#fecaca",
                padding: "7px 9px",
                fontSize: 10,
                cursor: "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {toggle.label}
              <span style={{ color: toggle.enabled ? "#86efac" : "#fca5a5" }}>{toggle.enabled ? "ON" : "OFF"}</span>
            </button>
          ))}

          <div style={{ borderTop: "1px solid rgba(239,68,68,0.22)", paddingTop: 8 }}>
            <p style={{ margin: "0 0 6px", fontSize: 9, color: "#fca5a5", letterSpacing: "0.14em" }}>Sentinel Wall</p>
            {[
              "Bot impersonation ping on Room Alpha",
              "Rapid vote spike flagged in Top 10",
              "Manual review requested by Host Routing",
            ].map((item) => (
              <p key={item} style={{ margin: "0 0 5px", fontSize: 10, color: "#fca5a5" }}>
                • {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

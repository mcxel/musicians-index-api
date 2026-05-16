"use client";

import { useState } from "react";
import BotOperationsWall from "@/components/admin/BotOperationsWall";

type HubRole = "admin" | "big-ace" | "mc" | "marcel-root";

type AdminBotRosterRailProps = {
  hubRole?: HubRole;
  collapsed?: boolean;
};

export default function AdminBotRosterRail({
  hubRole = "admin",
  collapsed: defaultCollapsed = false,
}: AdminBotRosterRailProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      data-admin-rail="bot-roster"
      style={{
        border: "1px solid rgba(56,189,248,0.4)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(5,20,40,0.65), rgba(3,8,20,0.92))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: collapsed ? "none" : "1px solid rgba(56,189,248,0.2)",
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
            background: "#38bdf8",
            boxShadow: "0 0 8px #38bdf8",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <strong
          style={{
            color: "#7dd3fc",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          BOT ROSTER RAIL
        </strong>
        <span
          style={{
            color: "#94a3b8",
            fontSize: 9,
            letterSpacing: "0.06em",
            padding: "1px 6px",
            border: "1px solid rgba(148,163,184,0.3)",
            borderRadius: 3,
          }}
        >
          {hubRole.toUpperCase()}
        </span>
        <span style={{ color: "#38bdf8", fontSize: 12, lineHeight: 1, marginLeft: 4 }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "4px 0" }}>
          <BotOperationsWall adminRole={hubRole} />
        </div>
      )}
    </aside>
  );
}

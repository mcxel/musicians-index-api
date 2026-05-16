"use client";

import { useState } from "react";
import UnifiedInbox from "@/components/admin/overseer/UnifiedInbox";

type AdminInboxRailProps = {
  collapsed?: boolean;
};

export default function AdminInboxRail({ collapsed: defaultCollapsed = false }: AdminInboxRailProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      data-admin-rail="inbox"
      style={{
        border: "1px solid rgba(251,191,36,0.4)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(28,20,5,0.6), rgba(10,8,3,0.92))",
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
            boxShadow: "0 0 8px rgba(250,204,21,0.7)",
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
          UNIFIED INBOX
        </strong>
        <span style={{ color: "#fcd34d", fontSize: 12, lineHeight: 1 }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "4px 0" }}>
          <UnifiedInbox />
        </div>
      )}
    </aside>
  );
}

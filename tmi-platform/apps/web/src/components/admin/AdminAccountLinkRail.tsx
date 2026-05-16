"use client";

import { useState } from "react";
import AccountLinker from "@/components/admin/overseer/AccountLinker";

type AdminAccountLinkRailProps = {
  collapsed?: boolean;
};

export default function AdminAccountLinkRail({ collapsed: defaultCollapsed = false }: AdminAccountLinkRailProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [authorityLevel, setAuthorityLevel] = useState(86);

  return (
    <aside
      data-admin-rail="account-link"
      style={{
        border: "1px solid rgba(34,197,94,0.4)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(5,30,15,0.6), rgba(3,10,6,0.9))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: collapsed ? "none" : "1px solid rgba(34,197,94,0.2)",
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
            background: "#22c55e",
            boxShadow: "0 0 8px #22c55e",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <strong
          style={{
            color: "#86efac",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          ACCOUNT LINK RAIL
        </strong>
        <span style={{ color: "#22c55e", fontSize: 12, lineHeight: 1 }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 10px 4px" }}>
          <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "#86efac", fontSize: 10, letterSpacing: "0.1em" }}>
                ACCOUNT AUTHORITY {authorityLevel}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={authorityLevel}
                onChange={(event) => setAuthorityLevel(Number(event.target.value))}
                style={{ accentColor: "#22c55e" }}
              />
            </label>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Link Profile", "Promote Role", "Audit Chain"].map((label) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    borderRadius: 6,
                    border: "1px solid rgba(34,197,94,0.32)",
                    background: "rgba(22,101,52,0.32)",
                    color: "#bbf7d0",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    padding: "5px 8px",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <AccountLinker />
        </div>
      )}
    </aside>
  );
}

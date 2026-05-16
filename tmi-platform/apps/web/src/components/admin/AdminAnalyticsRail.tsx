"use client";

import { useState } from "react";
import ArtistAnalyticsPanel from "@/components/admin/ArtistAnalyticsPanel";
import MagazineAnalytics from "@/components/admin/overseer/MagazineAnalytics";

type AnalyticsTab = "artists" | "magazine";

type AdminAnalyticsRailProps = {
  defaultTab?: AnalyticsTab;
};

export default function AdminAnalyticsRail({ defaultTab = "artists" }: AdminAnalyticsRailProps) {
  const [tab, setTab] = useState<AnalyticsTab>(defaultTab);
  const [collapsed, setCollapsed] = useState(false);
  const [windowHours, setWindowHours] = useState(24);

  return (
    <aside
      data-admin-rail="analytics"
      style={{
        border: "1px solid rgba(168,85,247,0.45)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(44,14,69,0.55), rgba(10,5,20,0.9))",
        overflow: "hidden",
      }}
    >
      {/* Rail header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: "1px solid rgba(168,85,247,0.25)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#a855f7",
            boxShadow: "0 0 8px #a855f7",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <strong
          style={{
            color: "#c4b5fd",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            flex: 1,
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setCollapsed((c) => !c)}
        >
          ANALYTICS RAIL
        </strong>

        {/* Tab switchers */}
        {!collapsed && (
          <div style={{ display: "flex", gap: 4 }}>
            {(["artists", "magazine"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  borderRadius: 4,
                  border: tab === t
                    ? "1px solid rgba(168,85,247,0.75)"
                    : "1px solid rgba(168,85,247,0.25)",
                  background: tab === t ? "rgba(168,85,247,0.25)" : "rgba(168,85,247,0.06)",
                  color: tab === t ? "#c4b5fd" : "#6b7280",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  padding: "3px 8px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <span
          style={{ color: "#a855f7", fontSize: 12, lineHeight: 1, cursor: "pointer", userSelect: "none" }}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 10px 4px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {[
              { label: "Sessions", value: "3.2K" },
              { label: "Retention", value: "74%" },
              { label: "Uptime", value: "99.3%" },
            ].map((metric) => (
              <div
                key={metric.label}
                style={{
                  border: "1px solid rgba(168,85,247,0.22)",
                  borderRadius: 7,
                  padding: "6px 7px",
                  background: "rgba(30,10,49,0.38)",
                }}
              >
                <p style={{ margin: 0, fontSize: 9, color: "#a78bfa", letterSpacing: "0.1em" }}>{metric.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#e9d5ff", fontWeight: 800 }}>{metric.value}</p>
              </div>
            ))}
          </div>

          <label style={{ display: "grid", gap: 4, marginBottom: 10 }}>
            <span style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.1em" }}>
              VIEW WINDOW {windowHours}h
            </span>
            <input
              type="range"
              min={6}
              max={72}
              step={6}
              value={windowHours}
              onChange={(event) => setWindowHours(Number(event.target.value))}
              style={{ accentColor: "#a855f7" }}
            />
          </label>

          {tab === "artists" ? <ArtistAnalyticsPanel /> : <MagazineAnalytics />}
        </div>
      )}
    </aside>
  );
}

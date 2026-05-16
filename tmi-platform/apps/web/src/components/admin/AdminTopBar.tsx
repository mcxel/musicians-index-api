"use client";

import { useState } from "react";
import Link from "next/link";

type AdminTopBarProps = {
  hubId: string;
  hubTitle: string;
  hubSubtitle?: string;
  backHref?: string;
  liveLabel?: string;
};

export default function AdminTopBar({
  hubId,
  hubTitle,
  hubSubtitle,
  backHref = "/admin",
  liveLabel,
}: AdminTopBarProps) {
  const [power, setPower] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(72);
  const [automationLevel, setAutomationLevel] = useState(58);

  return (
    <header
      data-admin-topbar={hubId}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        borderBottom: "1px solid rgba(251,191,36,0.45)",
        background:
          "linear-gradient(90deg, rgba(31,15,55,0.97), rgba(14,9,27,0.98) 55%, rgba(15,31,36,0.94))",
        backdropFilter: "blur(12px)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Back */}
      <Link
        href={backHref}
        style={{
          color: "#fcd34d",
          fontSize: 10,
          textDecoration: "none",
          border: "1px solid rgba(251,191,36,0.4)",
          borderRadius: 6,
          padding: "4px 10px",
          letterSpacing: "0.1em",
          fontWeight: 800,
          background: "rgba(251,191,36,0.07)",
        }}
      >
        ← BACK
      </Link>

      {/* Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: power ? "#22c55e" : "#ef4444",
            boxShadow: power ? "0 0 7px #22c55e" : "0 0 7px #ef4444",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <strong
          style={{
            color: "#fcd34d",
            letterSpacing: "0.18em",
            fontSize: 12,
            textTransform: "uppercase",
            textShadow: "0 0 10px rgba(250,204,21,0.4)",
          }}
        >
          {hubTitle}
        </strong>
        {hubSubtitle && (
          <span style={{ color: "#c4b5fd", letterSpacing: "0.12em", fontSize: 10 }}>
            {hubSubtitle}
          </span>
        )}
        {liveLabel && (
          <span
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.6)",
              color: "#fca5a5",
              fontSize: 9,
              letterSpacing: "0.14em",
              padding: "2px 7px",
              borderRadius: 4,
              textTransform: "uppercase",
              fontWeight: 800,
              animation: "pulse 2s infinite",
            }}
          >
            {liveLabel}
          </span>
        )}
      </div>

      {/* Controls */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em" }}>
          HUB: {hubId.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={() => setPower((p) => !p)}
          style={{
            borderRadius: 6,
            border: power
              ? "1px solid rgba(34,197,94,0.55)"
              : "1px solid rgba(239,68,68,0.55)",
            background: power ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: power ? "#86efac" : "#fca5a5",
            fontSize: 10,
            letterSpacing: "0.1em",
            padding: "5px 10px",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {power ? "PWR ON" : "PWR OFF"}
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen((s) => !s)}
          aria-label="Hub settings"
          style={{
            borderRadius: 6,
            border: settingsOpen
              ? "1px solid rgba(168,85,247,0.75)"
              : "1px solid rgba(168,85,247,0.4)",
            background: settingsOpen
              ? "rgba(168,85,247,0.2)"
              : "rgba(168,85,247,0.08)",
            color: "#c4b5fd",
            fontSize: 13,
            padding: "4px 9px",
            cursor: "pointer",
          }}
        >
          ⚙
        </button>
      </div>

      {settingsOpen && (
        <div
          style={{
            width: "100%",
            borderTop: "1px solid rgba(168,85,247,0.25)",
            paddingTop: 8,
            marginTop: 4,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Notifications", "Display", "Permissions", "API Keys", "Audit Log"].map((item) => (
              <button
                key={item}
                type="button"
                style={{
                  borderRadius: 5,
                  border: "1px solid rgba(196,181,253,0.3)",
                  background: "rgba(168,85,247,0.1)",
                  color: "#c4b5fd",
                  fontSize: 10,
                  padding: "3px 9px",
                  cursor: "pointer",
                  letterSpacing: "0.07em",
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "#fcd34d", fontSize: 10, letterSpacing: "0.12em" }}>
                SECURITY THRESHOLD {securityLevel}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={securityLevel}
                onChange={(event) => setSecurityLevel(Number(event.target.value))}
                style={{ accentColor: "#f59e0b" }}
              />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.12em" }}>
                AUTOMATION LOAD {automationLevel}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={automationLevel}
                onChange={(event) => setAutomationLevel(Number(event.target.value))}
                style={{ accentColor: "#8b5cf6" }}
              />
            </label>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import type { ArtistShowState } from "./ArtistCurtainShell";

type ArtistCommandRailProps = {
  showState: ArtistShowState;
  slug: string;
  onStateChange: (next: ArtistShowState) => void;
};

const QUICK_ACTIONS = [
  { label: "Manage Setlist",   icon: "♫",  color: "#FF2DAA" },
  { label: "Revenue Report",   icon: "$",  color: "#FFD700" },
  { label: "Backstage Crew",   icon: "◈",  color: "#00FFFF" },
  { label: "Fan Club",         icon: "❤",  color: "#AA2DFF" },
  { label: "Broadcast Alert",  icon: "📢", color: "#FF9200" },
];

const SIGNAL_ROWS = [
  { label: "Stream Health",  value: "98%",    color: "#00FF88" },
  { label: "Audio Level",    value: "-6 dB",  color: "#00FFFF" },
  { label: "Latency",        value: "42ms",   color: "#FFD700" },
  { label: "Active Screens", value: "3",      color: "#FF2DAA" },
];

export default function ArtistCommandRail({
  showState,
  slug,
  onStateChange,
}: ArtistCommandRailProps) {
  const isLive = showState === "live";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Signal monitor */}
      <div
        style={{
          borderRadius: 12,
          border: "1px solid rgba(0,255,255,0.18)",
          background: "linear-gradient(160deg, rgba(5,14,32,0.98), rgba(3,8,18,0.98))",
          padding: "14px 16px",
          boxShadow: isLive ? "0 0 20px rgba(0,255,136,0.08)" : "none",
        }}
      >
        <div
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#5ad7ff",
            marginBottom: 12,
          }}
        >
          ◉ Signal Status
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SIGNAL_ROWS.map((row) => (
            <div
              key={row.label}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{row.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: row.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div
        style={{
          borderRadius: 12,
          border: "1px solid rgba(255,45,170,0.18)",
          background: "linear-gradient(160deg, rgba(5,14,32,0.98), rgba(3,8,18,0.98))",
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#FF2DAA",
            marginBottom: 12,
          }}
        >
          ⚡ Quick Actions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: `1px solid ${action.color}22`,
                background: `${action.color}0a`,
                color: "rgba(255,255,255,0.72)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 13, color: action.color, width: 16, textAlign: "center", flexShrink: 0 }}>
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Artist slug badge */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid rgba(0,255,255,0.1)",
          background: "rgba(0,255,255,0.03)",
          padding: "10px 14px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
          Artist ID
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#5ad7ff", letterSpacing: "0.06em" }}>
          @{slug}
        </div>
      </div>
    </div>
  );
}

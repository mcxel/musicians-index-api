"use client";

/**
 * SaveCounter
 * Shows the user's annual save quota: "SAVED THIS YEAR: X / 10"
 * Props drive the display — parent fetches from GET /api/recordings.
 */

interface SaveCounterProps {
  used: number;
  limit?: number;
  accentColor?: string;
}

export default function SaveCounter({ used, limit = 10, accentColor = "#00FFFF" }: SaveCounterProps) {
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const almostFull = remaining <= 2;

  const barColor = almostFull ? "#FF2DAA" : accentColor;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${almostFull ? "rgba(255,45,170,0.35)" : "rgba(0,255,255,0.2)"}`,
        borderRadius: 10,
        padding: "12px 16px",
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.25em",
          color: almostFull ? "#FF2DAA" : "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        SAVED THIS YEAR
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: barColor }}>{used}</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>/ {limit}</span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 2,
            background: barColor,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      {almostFull && (
        <div
          style={{
            marginTop: 6,
            fontSize: 9,
            color: "#FF2DAA",
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          {remaining === 0
            ? "⚠ LIMIT REACHED"
            : `⚠ ${remaining} SAVE${remaining === 1 ? "" : "S"} REMAINING`}
        </div>
      )}
    </div>
  );
}

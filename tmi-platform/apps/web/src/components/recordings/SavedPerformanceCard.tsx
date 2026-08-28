"use client";

import { useState } from "react";

interface SavedPerformanceCardProps {
  id: string;
  title: string;
  durationSeconds: number;
  createdAt: string | Date;
  expiresAt: string | Date;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
  renewalCount?: number;
  accentColor?: string;
  onRenew?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPlay?: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SavedPerformanceCard({
  id,
  title,
  durationSeconds,
  createdAt,
  expiresAt,
  daysRemaining,
  isExpiringSoon,
  renewalCount = 0,
  accentColor = "#00FFFF",
  onRenew,
  onDelete,
  onPlay,
}: SavedPerformanceCardProps) {
  const [confirming, setConfirming] = useState(false);

  const urgent = isExpiringSoon || (daysRemaining !== undefined && daysRemaining <= 7);
  const expiredOrGone = daysRemaining !== undefined && daysRemaining === 0;
  const borderColor = expiredOrGone ? "#FF4444" : urgent ? "#FF2DAA" : accentColor;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${borderColor}30`,
        borderRadius: 12,
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: borderColor,
        }}
      />

      {/* Expiry warning banner */}
      {urgent && !expiredOrGone && (
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "#FF2DAA",
            background: "rgba(255,45,170,0.07)",
            border: "1px solid rgba(255,45,170,0.2)",
            borderRadius: 4,
            padding: "3px 8px",
            display: "inline-block",
            marginBottom: 8,
          }}
        >
          ⚠ EXPIRES IN {daysRemaining} DAY{daysRemaining === 1 ? "" : "S"}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#fff",
          marginBottom: 6,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          ⏱ {formatDuration(durationSeconds)}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          📅 Saved {formatDate(createdAt)}
        </span>
        <span
          style={{
            fontSize: 11,
            color: expiredOrGone ? "#FF4444" : "rgba(255,255,255,0.4)",
          }}
        >
          🗓 Expires {formatDate(expiresAt)}
          {daysRemaining !== undefined && !expiredOrGone
            ? ` (${daysRemaining}d)`
            : expiredOrGone
            ? " (expired)"
            : ""}
        </span>
        {renewalCount > 0 && (
          <span style={{ fontSize: 11, color: accentColor }}>🔄 Renewed ×{renewalCount}</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {onPlay && !expiredOrGone && (
          <button
            onClick={() => onPlay(id)}
            style={{
              padding: "7px 14px",
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}50`,
              borderRadius: 7,
              color: accentColor,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            ▶ PLAY
          </button>
        )}

        {onRenew && (
          <button
            onClick={() => onRenew(id)}
            style={{
              padding: "7px 14px",
              background: "rgba(0,255,136,0.1)",
              border: "1px solid rgba(0,255,136,0.35)",
              borderRadius: 7,
              color: "#00FF88",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            🔄 KEEP / RENEW (+90 days)
          </button>
        )}

        {onDelete && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            style={{
              padding: "7px 14px",
              background: "rgba(255,68,68,0.08)",
              border: "1px solid rgba(255,68,68,0.25)",
              borderRadius: 7,
              color: "#FF4444",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            🗑 DELETE
          </button>
        )}

        {onDelete && confirming && (
          <>
            <button
              onClick={() => { onDelete(id); setConfirming(false); }}
              style={{
                padding: "7px 14px",
                background: "#FF4444",
                border: "none",
                borderRadius: 7,
                color: "#fff",
                fontSize: 11,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              CONFIRM DELETE
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                padding: "7px 14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 7,
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              CANCEL
            </button>
          </>
        )}
      </div>
    </div>
  );
}

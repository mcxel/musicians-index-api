"use client";

// Canon source: Adminisratation Hub.jpg — Security Sentinel · Threat Level indicator
// Structure: Threat Level badge (STABLE/ELEVATED/CRITICAL) + bot sentinel count
//            + recent alert feed + active threat bars

import React, { useState } from "react";
import Link from "next/link";

type ThreatLevel = "STABLE" | "ELEVATED" | "CRITICAL";

interface ThreatEvent {
  id: string;
  type: string;
  message: string;
  ts: string;
  severity: "low" | "medium" | "high" | "critical";
}

const THREAT_STYLE: Record<ThreatLevel, { color: string; bg: string; glow: string }> = {
  STABLE:   { color: "#00FF88", bg: "rgba(0,255,136,0.1)",  glow: "#00FF88" },
  ELEVATED: { color: "#FFD700", bg: "rgba(255,215,0,0.1)",  glow: "#FFD700" },
  CRITICAL: { color: "#FF4444", bg: "rgba(255,68,68,0.12)", glow: "#FF4444" },
};

const SEV_COLOR: Record<ThreatEvent["severity"], string> = {
  low:      "rgba(255,255,255,0.3)",
  medium:   "#FFD700",
  high:     "#FF6B00",
  critical: "#FF4444",
};

const SEED_EVENTS: ThreatEvent[] = [
  { id: "t1", type: "FRAUD",      message: "Multi-account ticket fraud",   ts: "2m",  severity: "critical" },
  { id: "t2", type: "AUTH",       message: "Unusual rapid login pattern",  ts: "5m",  severity: "high"     },
  { id: "t3", type: "RATE",       message: "Rate limit bypass — /api/vote",ts: "8m",  severity: "high"     },
  { id: "t4", type: "CHAT",       message: "Bot-pattern flood in Room 3",  ts: "12m", severity: "medium"   },
  { id: "t5", type: "MODERATION", message: "Hate speech flagged — Room 12",ts: "18m", severity: "medium"   },
];

export default function ThreatPulseRail({
  threatLevel = "STABLE",
  sentinelCount = 100,
}: {
  threatLevel?: ThreatLevel;
  sentinelCount?: number;
}) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const style = THREAT_STYLE[threatLevel];

  function resolve(id: string) {
    setResolved((prev) => new Set([...prev, id]));
  }

  const activeEvents = SEED_EVENTS.filter((e) => !resolved.has(e.id));

  return (
    <div
      data-threat-pulse-rail
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Threat level + sentinel count */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            flex: 1,
            padding: "8px 12px",
            background: style.bg,
            border: `1px solid ${style.color}40`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: `0 0 10px ${style.glow}20`,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: style.color,
              boxShadow: `0 0 6px ${style.color}`,
              flexShrink: 0,
            }}
          />
          <div>
            <p style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>THREAT LEVEL</p>
            <p style={{ fontSize: 13, fontWeight: 900, color: style.color, letterSpacing: "0.1em" }}>{threatLevel}</p>
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            background: "rgba(170,45,255,0.08)",
            border: "1px solid rgba(170,45,255,0.25)",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 900, color: "#AA2DFF" }}>{sentinelCount}</p>
          <p style={{ fontSize: 6, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>SENTINELS</p>
        </div>
      </div>

      {/* Active threat feed */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)" }}>
            ACTIVE THREATS · {activeEvents.length}
          </p>
          <Link href="/admin/security" style={{ fontSize: 7, color: "#FF4444", textDecoration: "none", letterSpacing: "0.1em" }}>
            VIEW ALL →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {activeEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                background: "rgba(5,5,16,0.6)",
                border: `1px solid ${SEV_COLOR[evt.severity]}25`,
                borderRadius: 6,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: SEV_COLOR[evt.severity], flexShrink: 0 }} />
              <span style={{ fontSize: 6, fontWeight: 900, color: SEV_COLOR[evt.severity], letterSpacing: "0.12em", flexShrink: 0, minWidth: 60 }}>
                {evt.type}
              </span>
              <span style={{ flex: 1, fontSize: 7, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {evt.message}
              </span>
              <span style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{evt.ts}ago</span>
              <button
                onClick={() => resolve(evt.id)}
                style={{
                  fontSize: 6,
                  color: "#00FF88",
                  background: "rgba(0,255,136,0.08)",
                  border: "1px solid rgba(0,255,136,0.2)",
                  borderRadius: 4,
                  padding: "1px 6px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                RESOLVE
              </button>
            </div>
          ))}
          {activeEvents.length === 0 && (
            <p style={{ fontSize: 8, color: "#00FF88", textAlign: "center", padding: "12px 0", letterSpacing: "0.15em" }}>
              ALL CLEAR
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

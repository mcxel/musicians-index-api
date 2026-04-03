"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SENTINEL_BOTS } from "@/lib/botRegistry";

interface SentinelEvent {
  id: string; type: string; surface: string; severity: "LOW" | "MEDIUM" | "HIGH"; ts: string;
}

const MOCK_EVENTS: SentinelEvent[] = [
  { id: "e1", type: "Suspicious signup pattern", surface: "auth", severity: "LOW", ts: "2m ago" },
  { id: "e2", type: "Vote anomaly detected", surface: "voting", severity: "MEDIUM", ts: "4m ago" },
  { id: "e3", type: "Rate limit triggered", surface: "rooms", severity: "LOW", ts: "9m ago" },
];

const SEV_COLOR = { LOW: "#FFD700", MEDIUM: "#FF9500", HIGH: "#FF3C3C" };

export default function SentinelPanel() {
  const [events, setEvents] = useState<SentinelEvent[]>(MOCK_EVENTS);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: "rgba(255,60,60,0.04)", border: "1px solid rgba(255,60,60,0.2)",
      borderRadius: 10, padding: "14px 16px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: 14 }}
        >🛡️</motion.span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FF3C3C", textTransform: "uppercase" }}>
          Sentinel Security Layer
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <motion.div
            animate={{ opacity: pulse ? 1 : 0.3 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88" }}
          />
          <span style={{ fontSize: 9, color: "#00FF88", fontWeight: 700 }}>ACTIVE</span>
        </div>
      </div>

      {/* Bot count row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { label: "Sentinels", value: SENTINEL_BOTS.length, color: "#FF3C3C" },
          { label: "Alerts", value: events.filter(e => e.severity === "HIGH").length, color: "#FF3C3C" },
          { label: "Warnings", value: events.filter(e => e.severity === "MEDIUM").length, color: "#FF9500" },
          { label: "Notices", value: events.filter(e => e.severity === "LOW").length, color: "#FFD700" },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center", flex: 1, minWidth: 50 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{stat.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {events.slice(0, 4).map(ev => (
          <div key={ev.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 6,
            background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,60,60,0.1)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: SEV_COLOR[ev.severity], flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", flex: 1 }}>{ev.type}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{ev.ts}</span>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div style={{ textAlign: "center", padding: "12px 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          All clear — no active threats
        </div>
      )}

      <button
        onClick={() => setEvents([])}
        style={{
          marginTop: 10, width: "100%", padding: "6px", fontSize: 9,
          fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,60,60,0.6)",
          background: "transparent", border: "1px solid rgba(255,60,60,0.15)",
          borderRadius: 5, cursor: "pointer",
        }}
      >
        CLEAR EVENTS
      </button>
    </div>
  );
}

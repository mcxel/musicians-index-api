"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type RevenueStream = {
  id: string;
  label: string;
  valueCents: number;
  color: string;
  icon: string;
};

function fmtCents(c: number): string {
  if (c >= 100000) return `$${(c / 100000).toFixed(1)}K`;
  if (c >= 10000)  return `$${(c / 100).toFixed(0)}`;
  return `$${(c / 100).toFixed(2)}`;
}

function StreamTile({ stream }: { stream: RevenueStream }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      minWidth: 60, flexShrink: 0,
      padding: "7px 8px", borderRadius: 8,
      border: `1px solid ${stream.color}22`,
      background: `${stream.color}07`,
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{stream.icon}</span>
      <motion.div
        initial={{ y: -4, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18 }}
        style={{ fontSize: 10, fontWeight: 900, color: stream.color, letterSpacing: "0.02em" }}
      >
        {fmtCents(stream.valueCents)}
      </motion.div>
      <div style={{ fontSize: 5, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
        {stream.label}
      </div>
    </div>
  );
}

export default function RevenuePulseTicker() {
  const [streams, setStreams] = useState<RevenueStream[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!data || typeof data !== "object") {
          setLoading(false);
          return;
        }
        const d = data as Record<string, number>;
        const calculatedStreams: RevenueStream[] = [];
        const colorMap: Record<string, string> = {
          tips: "#00FF88",
          sponsors: "#FFD700",
          ad_rev: "#00FFFF",
          battles: "#CC0000",
          placements: "#AA2DFF",
          tickets: "#FF2DAA",
        };
        const iconMap: Record<string, string> = {
          tips: "💸",
          sponsors: "🏷️",
          ad_rev: "📺",
          battles: "⚔️",
          placements: "📌",
          tickets: "🎟️",
        };
        const labels: Record<string, string> = {
          tips: "Tips",
          sponsors: "Sponsors",
          ad_rev: "Ad Rev",
          battles: "Battles",
          placements: "Placements",
          tickets: "Tickets",
        };
        let sum = 0;
        for (const [key, value] of Object.entries(d)) {
          if (typeof value === "number" && key in colorMap) {
            calculatedStreams.push({
              id: key,
              label: labels[key] || key,
              valueCents: Math.round(value),
              color: colorMap[key],
              icon: iconMap[key],
            });
            sum += value;
          }
        }
        setStreams(calculatedStreams);
        setTotal(sum);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(0,0,0,0.5)",
      padding: "8px 12px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88" }}
        />
        <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
          {loading ? "LOADING" : streams.length === 0 ? "NO REVENUE" : "LIVE REVENUE"}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontWeight: 900, color: "#00FF88" }}>{fmtCents(total)}</span>
        <span style={{ fontSize: 5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>TODAY</span>
      </div>

      {/* Stream tiles */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", minHeight: "60px", alignItems: "center" }}>
        {loading ? (
          <div style={{ flex: 1, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Loading...</div>
        ) : streams.length === 0 ? (
          <div style={{ flex: 1, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>No revenue data available</div>
        ) : (
          streams.map((s) => (
            <StreamTile key={s.id} stream={s} />
          ))
        )}
      </div>
    </div>
  );
}

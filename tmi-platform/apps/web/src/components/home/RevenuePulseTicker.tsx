"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type RevenueStream = {
  id: string;
  label: string;
  valueCents: number;
  deltaCentsPerTick: number;
  color: string;
  icon: string;
};

const STREAMS: RevenueStream[] = [
  { id: "tips",        label: "Tips",        valueCents: 8420,   deltaCentsPerTick: 15,  color: "#00FF88", icon: "💸" },
  { id: "sponsors",    label: "Sponsors",    valueCents: 14200,  deltaCentsPerTick: 42,  color: "#FFD700", icon: "🏷️" },
  { id: "ad_rev",      label: "Ad Rev",      valueCents: 3180,   deltaCentsPerTick: 8,   color: "#00FFFF", icon: "📺" },
  { id: "battle_fees", label: "Battles",     valueCents: 2240,   deltaCentsPerTick: 6,   color: "#CC0000", icon: "⚔️" },
  { id: "placements",  label: "Placements",  valueCents: 9750,   deltaCentsPerTick: 20,  color: "#AA2DFF", icon: "📌" },
  { id: "tickets",     label: "Tickets",     valueCents: 5410,   deltaCentsPerTick: 12,  color: "#FF2DAA", icon: "🎟️" },
];

function fmtCents(c: number): string {
  if (c >= 100000) return `$${(c / 100000).toFixed(1)}K`;
  if (c >= 10000)  return `$${(c / 100).toFixed(0)}`;
  return `$${(c / 100).toFixed(2)}`;
}

function StreamTile({ stream }: { stream: RevenueStream }) {
  const [value, setValue] = useState(stream.valueCents);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const interval = 1800 + Math.random() * 1200;
    const t = setInterval(() => {
      setValue((v) => v + stream.deltaCentsPerTick + Math.floor(Math.random() * stream.deltaCentsPerTick));
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    }, interval);
    return () => clearInterval(t);
  }, [stream.deltaCentsPerTick]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      minWidth: 60, flexShrink: 0,
      padding: "7px 8px", borderRadius: 8,
      border: `1px solid ${stream.color}22`,
      background: flash ? `${stream.color}14` : `${stream.color}07`,
      transition: "background 200ms ease",
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{stream.icon}</span>
      <motion.div
        key={value}
        initial={{ y: -4, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18 }}
        style={{ fontSize: 10, fontWeight: 900, color: stream.color, letterSpacing: "0.02em" }}
      >
        {fmtCents(value)}
      </motion.div>
      <div style={{ fontSize: 5, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
        {stream.label}
      </div>
      {/* Mini activity bar */}
      <motion.div
        animate={{ scaleX: [0.6, 1, 0.7, 1, 0.6] }}
        transition={{ duration: 2.4 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: 2, borderRadius: 1, background: stream.color, transformOrigin: "left" }}
      />
    </div>
  );
}

export default function RevenuePulseTicker() {
  const [total, setTotal] = useState(() =>
    STREAMS.reduce((s, r) => s + r.valueCents, 0)
  );

  useEffect(() => {
    const t = setInterval(() => {
      setTotal((v) => v + STREAMS.reduce((s, r) => s + r.deltaCentsPerTick, 0));
    }, 2000);
    return () => clearInterval(t);
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
          LIVE REVENUE PULSE
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontWeight: 900, color: "#00FF88" }}>{fmtCents(total)}</span>
        <span style={{ fontSize: 5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>TODAY</span>
      </div>

      {/* Stream tiles */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
        {STREAMS.map((s) => (
          <StreamTile key={s.id} stream={s} />
        ))}
      </div>
    </div>
  );
}

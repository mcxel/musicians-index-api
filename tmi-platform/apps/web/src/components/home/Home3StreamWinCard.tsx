"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const SESSION_DURATION_S = 25 * 60; // 25-minute session
const POINTS_PER_MINUTE = 12;

export default function Home3StreamWinCard({ accentColor = "#AA2DFF", href = "/cypher" }: { accentColor?: string; href?: string }) {
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setElapsed((e) => Math.min(e + 1, SESSION_DURATION_S)), 1000);
    return () => clearInterval(t);
  }, [active]);

  const points = Math.floor((elapsed / 60) * POINTS_PER_MINUTE);
  const pct = Math.round((elapsed / SESSION_DURATION_S) * 100);
  const minsRemaining = Math.floor((SESSION_DURATION_S - elapsed) / 60);
  const secsRemaining = (SESSION_DURATION_S - elapsed) % 60;

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${accentColor}33`, background: `${accentColor}08`, position: "relative" }}>
      {/* Top pulsing bar */}
      <motion.div
        animate={{ scaleX: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, transformOrigin: "50% 50%" }}
      />

      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 6 }}>
          STREAM &amp; WIN
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {active && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88", flexShrink: 0 }}
              />
            )}
            <span style={{ fontSize: 8, fontWeight: 900, color: active ? "#00FF88" : "rgba(255,255,255,0.4)" }}>
              {active ? "SESSION LIVE" : "SESSION READY"}
            </span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 900, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
            {active ? `${minsRemaining}:${String(secsRemaining).padStart(2, "0")}` : "25:00"}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 8 }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${accentColor}, #00FF88)`, boxShadow: `0 0 8px ${accentColor}` }}
          />
        </div>

        {/* Points + rewards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          {[
            { label: "Points", value: points.toLocaleString(), color: accentColor },
            { label: "+XP / min", value: `+${POINTS_PER_MINUTE}`, color: "#FFD700" },
            { label: "Rewards", value: "3", color: "#00FF88" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "6px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 5, color: "rgba(255,255,255,0.35)", marginTop: 1, letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!active ? (
          <button
            type="button"
            onClick={() => setActive(true)}
            style={{
              width: "100%", padding: "7px 0", borderRadius: 8,
              background: `linear-gradient(135deg, ${accentColor}, #AA2DFF)`,
              border: "none", cursor: "pointer",
              fontSize: 7, fontWeight: 900, letterSpacing: "0.16em",
              color: "#fff", textTransform: "uppercase",
            }}
          >
            START EARNING
          </button>
        ) : (
          <Link href={href} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "7px 0", borderRadius: 8, textAlign: "center",
              background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
              fontSize: 7, fontWeight: 900, letterSpacing: "0.16em",
              color: accentColor, textTransform: "uppercase", cursor: "pointer",
            }}>
              ENTER LIVE ROOM →
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type PremiereEntry = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  accent: string;
  emoji: string;
  releaseMs: number;
};

function pad(n: number) { return String(n).padStart(2, "0"); }

function countdown(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, diff };
}

const NOW = Date.now();
const PREMIERES: PremiereEntry[] = [
  { id: "p1", title: "Soul Is Rising", artist: "KOVA", genre: "R&B · Soul", accent: "#FF2DAA", emoji: "🎤", releaseMs: NOW + 2 * 3600000 + 14 * 60000 },
  { id: "p2", title: "Night Vision", artist: "Nera Vex", genre: "Neo Soul", accent: "#00FFFF", emoji: "🎹", releaseMs: NOW + 5 * 3600000 + 42 * 60000 },
  { id: "p3", title: "The Comeback", artist: "Mako Rise", genre: "Trap", accent: "#AA2DFF", emoji: "🎸", releaseMs: NOW + 11 * 3600000 + 7 * 60000 },
];

function DigitBlock({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <motion.div
        key={value}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18 }}
        style={{
          width: 28, height: 24, borderRadius: 4,
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {value}
      </motion.div>
      <span style={{ fontSize: 5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

export default function Home3WorldPremiereCard() {
  const [active, setActive] = useState(0);
  const [time, setTime] = useState(() => countdown(PREMIERES[0]!.releaseMs));

  useEffect(() => {
    const premiere = PREMIERES[active]!;
    const t = setInterval(() => setTime(countdown(premiere.releaseMs)), 1000);
    return () => clearInterval(t);
  }, [active]);

  const premiere = PREMIERES[active]!;

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${premiere.accent}33`, background: `${premiere.accent}08`, position: "relative" }}>
      {/* Accent bar */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${premiere.accent}, transparent)` }} />

      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: premiere.accent, textTransform: "uppercase", marginBottom: 6 }}>
          WORLD PREMIERE
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          {/* Album cover placeholder */}
          <motion.div
            animate={{ boxShadow: [`0 0 8px ${premiere.accent}33`, `0 0 18px ${premiere.accent}66`, `0 0 8px ${premiere.accent}33`] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 52, height: 52, borderRadius: 8, flexShrink: 0,
              background: `radial-gradient(circle at 40% 40%, ${premiere.accent}44, ${premiere.accent}1a)`,
              border: `1.5px solid ${premiere.accent}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}
          >
            {premiere.emoji}
          </motion.div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{premiere.title}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>{premiere.artist}</div>
            <div style={{ display: "inline-block", padding: "1px 6px", borderRadius: 999, background: `${premiere.accent}14`, border: `1px solid ${premiere.accent}33`, fontSize: 6, fontWeight: 700, color: premiere.accent }}>{premiere.genre}</div>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <DigitBlock value={pad(time.h)} label="HRS" />
          <span style={{ fontSize: 14, fontWeight: 900, color: premiere.accent, marginBottom: 8 }}>:</span>
          <DigitBlock value={pad(time.m)} label="MIN" />
          <span style={{ fontSize: 14, fontWeight: 900, color: premiere.accent, marginBottom: 8 }}>:</span>
          <DigitBlock value={pad(time.s)} label="SEC" />
        </div>

        {/* Premiere switcher */}
        <div style={{ display: "flex", gap: 4 }}>
          {PREMIERES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              style={{
                flex: i === active ? 3 : 1, height: 4, borderRadius: 999, padding: 0, border: "none", cursor: "pointer",
                background: i === active ? premiere.accent : "rgba(255,255,255,0.14)",
                transition: "all 220ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

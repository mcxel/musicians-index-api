"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const PULSE_HISTORY_LEN = 20;

function generatePulse(base: number): number {
  return Math.max(30, Math.min(100, base + (Math.random() - 0.5) * 20));
}

const CROWD_MOODS = [
  { label: "HYPED",   color: "#FF2DAA", min: 80 },
  { label: "LOCKED",  color: "#00FFFF", min: 60 },
  { label: "WARM",    color: "#FFD700", min: 40 },
  { label: "COOLING", color: "#666",    min: 0  },
];

function getMood(pulse: number) {
  return CROWD_MOODS.find(m => pulse >= m.min) ?? CROWD_MOODS[CROWD_MOODS.length - 1];
}

const METRIC_ROWS = [
  { label: "Live Viewers",   value: "2,847", delta: "+12", color: "#00FFFF" },
  { label: "Reactions/Min",  value: "348",   delta: "+28", color: "#FF2DAA" },
  { label: "Tips This Hour", value: "$640",  delta: "+$85", color: "#FFD700" },
  { label: "Share Events",   value: "91",    delta: "+7",  color: "#AA2DFF" },
];

export default function ArtistPulseRail() {
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: PULSE_HISTORY_LEN }, () => generatePulse(70))
  );
  const current = history[history.length - 1] ?? 70;
  const mood = getMood(current);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHistory(h => {
        const last = h[h.length - 1] ?? 70;
        const next = generatePulse(last);
        return [...h.slice(-PULSE_HISTORY_LEN + 1), next];
      });
    }, 1200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const maxH = 48;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,45,170,0.04) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(255,45,170,0.12)",
        borderLeft: "3px solid #FF2DAA",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FF2DAA" }}>
          ⚡ CROWD PULSE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              width: 6, height: 6, borderRadius: "50%", background: mood.color,
              boxShadow: `0 0 8px ${mood.color}`,
            }}
          />
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: mood.color }}>
            {mood.label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: mood.color }}>
            {Math.round(current)}%
          </div>
        </div>
      </div>

      {/* Pulse waveform */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: maxH + 4, marginBottom: 18 }}>
        {history.map((v, i) => {
          const isLast = i === history.length - 1;
          const barH = Math.round((v / 100) * maxH);
          const alpha = 0.2 + (i / history.length) * 0.8;
          return (
            <motion.div
              key={i}
              animate={{ height: barH }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                flex: 1,
                borderRadius: "2px 2px 0 0",
                background: isLast ? mood.color : `rgba(255,45,170,${alpha * 0.6})`,
                boxShadow: isLast ? `0 0 10px ${mood.color}60` : "none",
                minWidth: 4,
              }}
            />
          );
        })}
      </div>

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {METRIC_ROWS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            style={{
              padding: "10px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${m.color}15`,
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              {m.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "rgba(255,255,255,0.9)" }}>{m.value}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: m.color }}>{m.delta}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

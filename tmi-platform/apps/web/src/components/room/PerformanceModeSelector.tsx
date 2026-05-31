"use client";

/**
 * PerformanceModeSelector — Private / Community / Performance mode toggle.
 * Drives the performer's room state. Each mode activates different audience routing,
 * discovery, and monetization features.
 */

import { motion, AnimatePresence } from "framer-motion";

export type PerformanceMode = "private" | "community" | "performance";

interface Mode {
  id: PerformanceMode;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  features: string[];
}

const MODES: Mode[] = [
  {
    id: "private",
    icon: "🔒",
    label: "PRIVATE",
    sublabel: "Backstage Mode",
    color: "#6b7280",
    features: ["Video calls", "DMs", "Invite-only", "No audience routing"],
  },
  {
    id: "community",
    icon: "👥",
    label: "COMMUNITY",
    sublabel: "Lounge Mode",
    color: "#60a5fa",
    features: ["Followers notified", "Small audience", "Chat + voice", "Q&A / Hangout"],
  },
  {
    id: "performance",
    icon: "🎭",
    label: "PERFORMANCE",
    sublabel: "Stage Mode",
    color: "#AA2DFF",
    features: ["Global discovery", "Tips + XP open", "Rankings active", "Fan Theater routing"],
  },
];

interface PerformanceModeSelectorProps {
  mode: PerformanceMode;
  onChange: (mode: PerformanceMode) => void;
  accentColor?: string;
  compact?: boolean;
}

export default function PerformanceModeSelector({
  mode,
  onChange,
  accentColor = "#AA2DFF",
  compact = false,
}: PerformanceModeSelectorProps) {
  const current = MODES.find(m => m.id === mode)!;

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => onChange(m.id)} style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 9, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.08em",
            background: mode === m.id ? `${m.color}25` : "rgba(255,255,255,0.04)",
            border: `1px solid ${mode === m.id ? m.color + "55" : "rgba(255,255,255,0.08)"}`,
            color: mode === m.id ? m.color : "rgba(255,255,255,0.35)",
          }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(5,5,18,0.9)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Mode tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              flex: 1,
              padding: "10px 6px",
              background: mode === m.id ? `${m.color}18` : "transparent",
              border: "none",
              borderBottom: `2px solid ${mode === m.id ? m.color : "transparent"}`,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 2 }}>{m.icon}</div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: mode === m.id ? m.color : "rgba(255,255,255,0.3)" }}>
              {m.label}
            </div>
          </button>
        ))}
      </div>

      {/* Mode detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          style={{ padding: "10px 14px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: current.color,
              boxShadow: `0 0 6px ${current.color}`,
            }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: current.color }}>{current.sublabel}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {current.features.map(f => (
              <span key={f} style={{
                fontSize: 9, padding: "2px 8px", borderRadius: 10,
                background: `${current.color}12`,
                border: `1px solid ${current.color}28`,
                color: `${current.color}cc`,
              }}>{f}</span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

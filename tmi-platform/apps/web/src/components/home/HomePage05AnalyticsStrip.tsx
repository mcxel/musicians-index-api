"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Metric = {
  label: string;
  value: number;
  suffix: string;
  change: string;  // "+12%" or "-3%"
  color: string;
  positive: boolean;
};

const BASE_METRICS: Metric[] = [
  { label: "VOTES",    value: 14820, suffix: "",   change: "+18%", color: "#00FFFF", positive: true },
  { label: "ENGAGE",   value: 92,    suffix: "%",  change: "+6%",  color: "#FFD700", positive: true },
  { label: "WINS",     value: 47,    suffix: "",   change: "+3",   color: "#00FF88", positive: true },
  { label: "ENERGY",   value: 87,    suffix: "%",  change: "+11%", color: "#FF2DAA", positive: true },
  { label: "SHARES",   value: 3210,  suffix: "",   change: "+24%", color: "#AA2DFF", positive: true },
  { label: "TIPS",     value: 1840,  suffix: "",   change: "+9%",  color: "#FFD700", positive: true },
  { label: "BOOSTS",   value: 512,   suffix: "",   change: "+15%", color: "#FF6B35", positive: true },
];

function AnimatedCount({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const step = target / 28;
    let current = 0;
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplay(Math.round(current));
      if (current >= target) clearInterval(t);
    }, 32);
    return () => clearInterval(t);
  }, [target]);

  return (
    <span>{display >= 1000 ? `${(display / 1000).toFixed(1)}K` : display}{suffix}</span>
  );
}

function SparkLine({ color }: { color: string }) {
  const pts = [3, 8, 5, 12, 9, 15, 11, 18, 14, 20];
  const max = Math.max(...pts);
  const w = 44, h = 18;
  const coords = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - (v / max) * h}`).join(" ");

  return (
    <svg width={w} height={h} style={{ flexShrink: 0 }}>
      <motion.polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.circle
        cx={(pts.length - 1) / (pts.length - 1) * w}
        cy={h - (pts[pts.length - 1]! / max) * h}
        r={2.5}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ delay: 1.1, duration: 0.3 }}
      />
    </svg>
  );
}

export default function HomePage05AnalyticsStrip() {
  return (
    <div style={{
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(0,0,0,0.5)",
      padding: "8px 12px",
    }}>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>
        LIVE PERFORMANCE ANALYTICS
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
        {BASE_METRICS.map((m) => (
          <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 56, flexShrink: 0 }}>
            <SparkLine color={m.color} />
            <div style={{ fontSize: 12, fontWeight: 900, color: m.color, letterSpacing: "0.03em" }}>
              <AnimatedCount target={m.value} suffix={m.suffix} />
            </div>
            <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{m.label}</div>
            <div style={{ fontSize: 6, color: m.positive ? "#00FF88" : "#ef4444", fontWeight: 700 }}>{m.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

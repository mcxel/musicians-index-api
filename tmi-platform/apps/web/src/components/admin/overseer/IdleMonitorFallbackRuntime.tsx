"use client";

import { useState, useEffect } from "react";
import { getGovernedIdleFallbackPolicy } from "@/lib/adaptiveWorldRuntime/IdleFallbackGovernor";

export interface IdleMonitorFallbackProps {
  monitorId: string | number;
  seedIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

const FALLBACK_SCENES = [
  {
    id: "3d-brand",
    title: "TMI 3D BRAND ENVIRONMENT",
    subtitle: "Living OS Core Broadcast Stream",
    accent: "#FF2DAA",
    gradient: "linear-gradient(135deg, rgba(255,45,170,0.18), rgba(0,255,255,0.05))",
    icon: "🌐",
    tag: "LIVE ENVIRONMENT",
  },
  {
    id: "open-match",
    title: "OPEN MATCH & CYPHER RECRUITMENT",
    subtitle: "Active Performers Queueing Live",
    accent: "#00FFFF",
    gradient: "linear-gradient(135deg, rgba(0,255,255,0.18), rgba(170,45,255,0.05))",
    icon: "🎤",
    tag: "OPEN MATCH",
  },
  {
    id: "sponsor-promo",
    title: "TMI HOUSE & SPONSOR SPOTLIGHT",
    subtitle: "Official Brand & Merchandise Showcase",
    accent: "#FFD700",
    gradient: "linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,45,170,0.05))",
    icon: "🏆",
    tag: "SPONSOR DROP",
  },
  {
    id: "ambient-loop",
    title: "CINEMATIC AMBIENT MOTION",
    subtitle: "Universal Stage Audio & Visual Sync",
    accent: "#AA2DFF",
    gradient: "linear-gradient(135deg, rgba(170,45,255,0.18), rgba(0,255,255,0.05))",
    icon: "✨",
    tag: "STAGE AMBIENT",
  },
];

export default function IdleMonitorFallbackRuntime({
  monitorId,
  seedIndex = 0,
  className = "",
  style = {},
}: IdleMonitorFallbackProps) {
  const initialIdx = typeof seedIndex === "number" ? Math.abs(seedIndex) % FALLBACK_SCENES.length : 0;
  const [sceneIdx, setSceneIdx] = useState(initialIdx);

  useEffect(() => {
    const tick = () => {
      setSceneIdx((prev) => (prev + 1) % FALLBACK_SCENES.length);
    };
    const schedule = () => {
      const ms = getGovernedIdleFallbackPolicy().rotationIntervalMs;
      return window.setInterval(tick, ms);
    };
    let timer = schedule();
    const resync = window.setInterval(() => {
      window.clearInterval(timer);
      timer = schedule();
    }, 12000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(resync);
    };
  }, []);

  const scene = FALLBACK_SCENES[sceneIdx] ?? FALLBACK_SCENES[0]!;

  return (
    <div
      data-idle-monitor-fallback={monitorId}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 180,
        borderRadius: 8,
        background: scene.gradient,
        border: `1px solid ${scene.accent}44`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 16,
        boxSizing: "border-box",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: scene.accent,
            background: `${scene.accent}20`,
            border: `1px solid ${scene.accent}40`,
            padding: "2px 8px",
            borderRadius: 4,
            textTransform: "uppercase",
          }}
        >
          {scene.tag}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
          MONITOR {monitorId}
        </span>
      </div>

      <div style={{ textAlign: "center", margin: "12px 0" }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{scene.icon}</div>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#fff",
            margin: "0 0 4px",
            textTransform: "uppercase",
          }}
        >
          {scene.title}
        </h3>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: 0 }}>
          {scene.subtitle}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: scene.accent,
              boxShadow: `0 0 8px ${scene.accent}`,
            }}
          />
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
            FALLBACK ROTATION ACTIVE
          </span>
        </div>
        <span style={{ fontSize: 8, color: scene.accent, fontWeight: 800 }}>
          STANDBY
        </span>
      </div>
    </div>
  );
}

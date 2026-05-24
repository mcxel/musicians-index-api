"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ArenaDistrict } from "@/lib/arena/BillboardArenaEngine";

// Module-level keyframes injected once
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = `
@keyframes districtPulse {
  0%,100% { opacity: 0.5; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.18); }
}
@keyframes districtFloat {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes pullGlow {
  0%,100% { box-shadow: 0 0 24px var(--dc), 0 0 60px var(--dg); }
  50%      { box-shadow: 0 0 48px var(--dc), 0 0 100px var(--dg); }
}
@keyframes emoteRise {
  0%   { opacity: 0; transform: translateY(0) scale(0.7); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-72px) scale(1.1); }
}
`;
  document.head.appendChild(s);
}

interface Props {
  district: ArenaDistrict;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (district: ArenaDistrict) => void;
  zIndex?: number;
}

export default function BillboardDistrictCard({ district: d, isHovered, onHover, onClick, zIndex = 1 }: Props) {
  const [emotes, setEmotes] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const emoteId = useRef(0);

  useEffect(() => { injectCSS(); }, []);

  // Periodically spawn ambient emotes when hovered
  useEffect(() => {
    if (!isHovered) return;
    const iv = setInterval(() => {
      const emoji = d.ambientEmotes[Math.floor(d.ambientEmotes.length * ((emoteId.current * 7) % d.ambientEmotes.length / d.ambientEmotes.length))] ?? "✨";
      const id = ++emoteId.current;
      setEmotes((prev) => [...prev.slice(-6), { id, emoji, x: 20 + (id * 17) % 60 }]);
      setTimeout(() => setEmotes((p) => p.filter((e) => e.id !== id)), 1200);
    }, 280);
    return () => clearInterval(iv);
  }, [isHovered, d.ambientEmotes]);

  const energyBarWidth = `${d.energyLevel}%`;
  const viewerLabel = d.viewerCount >= 1000
    ? `${(d.viewerCount / 1000).toFixed(1)}k`
    : String(d.viewerCount);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Enter ${d.name}`}
      onClick={() => onClick(d)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(d)}
      onMouseEnter={() => onHover(d.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: "relative",
        background: isHovered
          ? `linear-gradient(145deg, ${d.color}18, ${d.color}08, #050510)`
          : "linear-gradient(145deg, rgba(255,255,255,0.03), #050510)",
        border: `1px solid ${isHovered ? d.color + "60" : d.color + "22"}`,
        borderRadius: 20,
        padding: "28px 22px 22px",
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-color 0.25s, background 0.25s, transform 0.2s",
        transform: isHovered ? "scale(1.03) translateY(-4px)" : "scale(1)",
        zIndex,
        // @ts-expect-error custom properties
        "--dc": d.color,
        "--dg": d.glowColor,
        animation: d.pullSignal && !isHovered ? "pullGlow 2s ease-in-out infinite" : undefined,
        boxShadow: isHovered
          ? `0 0 40px ${d.glowColor}, 0 8px 32px rgba(0,0,0,0.6)`
          : d.pullSignal
          ? `0 0 24px ${d.glowColor}`
          : "none",
      }}
    >
      {/* District header strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: d.color, opacity: isHovered ? 1 : 0.4, transition: "opacity 0.25s" }} />

      {/* Pull signal badge */}
      {d.pullSignal && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          fontSize: 8, fontWeight: 900, letterSpacing: "0.12em",
          color: "#050510", background: d.color,
          padding: "3px 8px", borderRadius: 4,
          animation: "districtPulse 1.5s ease-in-out infinite",
        }}>
          🔥 HAPPENING NOW
        </div>
      )}

      {/* Live status */}
      {!d.pullSignal && d.liveStatus === "LIVE" && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FF88", animation: "districtPulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em" }}>LIVE</span>
        </div>
      )}

      {/* Emoji */}
      <div style={{
        fontSize: "clamp(36px, 4vw, 52px)",
        marginBottom: 10,
        animation: isHovered ? "districtFloat 1.8s ease-in-out infinite" : "none",
      }}>
        {d.emoji}
      </div>

      {/* District name */}
      <div style={{ fontSize: 9, fontWeight: 800, color: d.color, letterSpacing: "0.28em", marginBottom: 6 }}>
        {d.name.toUpperCase()}
      </div>

      <h2 style={{ fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>
        {d.tagline}
      </h2>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
          👥 {viewerLabel}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>·</span>
        <span style={{ fontSize: 10, color: d.liveStatus === "LIVE" ? "#00FF88" : "rgba(255,255,255,0.35)", fontWeight: 700 }}>
          {d.liveStatus}
        </span>
      </div>

      {/* Energy bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 18, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: energyBarWidth,
          background: `linear-gradient(90deg, ${d.color}80, ${d.color})`,
          borderRadius: 2,
          transition: "width 0.6s ease",
        }} />
      </div>

      {/* CTA */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
        background: isHovered ? d.color + "18" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isHovered ? d.color + "40" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 10,
        transition: "background 0.2s, border-color 0.2s",
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: isHovered ? d.color : "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
          ENTER DISTRICT
        </span>
        <span style={{ fontSize: 16, color: isHovered ? d.color : "rgba(255,255,255,0.3)", transform: isHovered ? "translateX(3px)" : "none", display: "inline-block", transition: "all 0.2s" }}>→</span>
      </div>

      {/* Ambient emotes on hover */}
      {emotes.map((e) => (
        <div key={e.id} style={{
          position: "absolute", bottom: 60, left: `${e.x}%`,
          fontSize: 16, pointerEvents: "none",
          animation: "emoteRise 1.1s ease-out forwards",
        }}>
          {e.emoji}
        </div>
      ))}
    </article>
  );
}

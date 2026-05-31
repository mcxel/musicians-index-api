"use client";

/**
 * RocketSkin — Space rocket playlist artifact.
 * Based on Playlist Base 16: dark blue rocket with orange fins,
 * monitor window in body, audio visualizer bars, star field background,
 * exhaust flame when playing.
 */

import type { ReactNode } from "react";

interface RocketSkinProps {
  monitor:   ReactNode;
  isPlaying: boolean;
  isOpen:    boolean;
  onToggle:  () => void;
  accent?:   string;
}

function Star({ x: left, y: top, size }: { x: string; y: string; size: number }) {
  return (
    <div style={{
      position: "absolute", left, top,
      width: size, height: size,
      background: "#FFD700",
      borderRadius: "50%",
      boxShadow: "0 0 3px #FFD700",
      animation: `starTwinkle ${1 + size * 0.3}s ease-in-out infinite`,
    }} />
  );
}

const STARS = [
  { x: "8%",  y: "10%", size: 2 },
  { x: "85%", y: "15%", size: 1 },
  { x: "15%", y: "45%", size: 2 },
  { x: "90%", y: "40%", size: 1 },
  { x: "5%",  y: "70%", size: 2 },
  { x: "80%", y: "65%", size: 2 },
  { x: "50%", y: "8%",  size: 1 },
];

export default function RocketSkin({ monitor, isPlaying, isOpen, onToggle, accent = "#FF9500" }: RocketSkinProps) {
  const BODY    = "#1a4a6a";
  const BODY_L  = "#2a6a8a";
  const FIN     = "#cc3300";
  const FIN_L   = "#ee5500";
  const NOSE    = "#cc3300";

  return (
    <div style={{ position: "relative", width: 200, minHeight: 340, userSelect: "none" }}>

      {/* Stars */}
      {STARS.map((s, i) => <Star key={i} {...s} />)}

      {/* ── NOSE CONE ── */}
      <div style={{
        width: 0, height: 0,
        borderLeft:  "30px solid transparent",
        borderRight: "30px solid transparent",
        borderBottom: `60px solid ${NOSE}`,
        margin: "0 auto",
        filter: "drop-shadow(0 -4px 8px rgba(255,100,0,0.3))",
      }} />
      {/* Cone highlight */}
      <div style={{
        width: 0, height: 0,
        borderLeft:  "6px solid transparent",
        borderRight: "0 solid transparent",
        borderBottom: "30px solid rgba(255,255,255,0.15)",
        position: "absolute",
        top: 8, left: "50%", transform: "translateX(-70%)",
      }} />

      {/* ── BODY ── */}
      <div
        style={{
          position: "relative",
          width: "60%",
          margin: "0 auto",
          height: 180,
          background: `linear-gradient(180deg, ${BODY_L} 0%, ${BODY} 100%)`,
          borderRadius: "8px 8px 4px 4px",
          cursor: "pointer",
          boxShadow: `0 0 ${isPlaying ? 20 : 8}px rgba(0,150,255,${isPlaying ? 0.4 : 0.1})`,
          transition: "box-shadow 0.5s",
        }}
        onClick={onToggle}
      >
        {/* Rivets */}
        {[0, 1].map((col) => [0, 1, 2, 3].map((row) => (
          <div key={`${col}-${row}`} style={{
            position: "absolute",
            width: 4, height: 4, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            left: col === 0 ? 6 : "auto",
            right: col === 1 ? 6 : "auto",
            top: 20 + row * 36,
          }} />
        )))}

        {/* Monitor window */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 6,
          border: `2px solid rgba(255,255,255,0.2)`,
          overflow: "hidden",
          boxShadow: "0 0 12px rgba(0,0,0,0.9)",
        }}>
          {monitor}
        </div>

        {/* Chevron */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%",
          transform: `translateX(-50%) rotate(${isOpen ? 180 : 0}deg)`,
          fontSize: 10, color: "rgba(255,255,255,0.4)", transition: "transform 0.3s",
        }}>▼</div>
      </div>

      {/* ── FINS ── */}
      {/* Left fin */}
      <div style={{
        position: "absolute",
        bottom: 80,
        left: "8%",
        width: 0, height: 0,
        borderRight: `30px solid ${FIN}`,
        borderTop:   "0 solid transparent",
        borderBottom:`50px solid transparent`,
        filter: `drop-shadow(0 0 4px ${FIN_L})`,
      }} />
      {/* Right fin */}
      <div style={{
        position: "absolute",
        bottom: 80,
        right: "8%",
        width: 0, height: 0,
        borderLeft: `30px solid ${FIN}`,
        borderTop:  "0 solid transparent",
        borderBottom:`50px solid transparent`,
        filter: `drop-shadow(0 0 4px ${FIN_L})`,
      }} />

      {/* ── EXHAUST (when playing) ── */}
      <div style={{
        width: "40%",
        margin: "0 auto",
        height: isPlaying ? 40 : 10,
        background: isPlaying
          ? "radial-gradient(ellipse at 50% 0%, #FF9500 0%, #FF4400 40%, transparent 80%)"
          : "none",
        borderRadius: "0 0 50% 50%",
        transition: "height 0.3s, opacity 0.3s",
        opacity: isPlaying ? 1 : 0,
        animation: isPlaying ? "flameFlicker 0.2s ease-in-out infinite" : "none",
      }} />

      {/* ── CONTROLS ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
        {[
          { icon: "⏮", id: "prev" },
          { icon: isPlaying ? "⏸" : "▶", id: "play", big: true },
          { icon: "⏭", id: "next" },
          { icon: "❤", id: "like" },
          { icon: "+", id: "add"  },
        ].map((b) => (
          <button key={b.id} type="button" data-action={b.id}
            style={{
              width:  b.big ? 36 : 28, height: b.big ? 36 : 28,
              borderRadius: "50%",
              background: b.big ? accent : "rgba(255,150,0,0.12)",
              border: b.big ? "none" : "2px solid rgba(255,150,0,0.3)",
              color: b.big ? "#000" : accent,
              fontSize: b.big ? 14 : 11, fontWeight: 900,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: b.big ? `0 0 14px ${accent}88` : "none",
            }}>
            {b.icon}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes flameFlicker {
          0%,100% { transform: scaleX(1) scaleY(1); opacity: 1; }
          50%      { transform: scaleX(0.9) scaleY(1.1); opacity: 0.85; }
        }
        @keyframes starTwinkle {
          0%,100% { opacity: 0.3; } 50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

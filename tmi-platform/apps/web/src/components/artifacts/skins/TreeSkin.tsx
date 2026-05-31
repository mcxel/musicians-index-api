"use client";

/**
 * TreeSkin — Glowing tree playlist artifact.
 * Based on Playlist Bases 3, 14, 17, 18: dark tree with amber glow lights,
 * monitor panel in trunk/center, star progress bar, points badge.
 */

import type { ReactNode } from "react";

interface TreeSkinProps {
  monitor:   ReactNode;
  isPlaying: boolean;
  isOpen:    boolean;
  onToggle:  () => void;
  accent?:   string;
}

function GlowDot({ top, left, size, delay }: { top: string; left: string; size: number; delay: number }) {
  return (
    <div style={{
      position: "absolute",
      top, left,
      width: size, height: size,
      borderRadius: "50%",
      background: "#FFB84A",
      boxShadow: "0 0 6px #FFB84A, 0 0 12px #FF8800",
      animation: `leafGlow 2s ease-in-out infinite ${delay}s`,
    }} />
  );
}

export default function TreeSkin({ monitor, isPlaying, isOpen, onToggle, accent = "#FFD700" }: TreeSkinProps) {
  const BROWN       = "#4a2800";
  const DARK_GREEN  = "#1a4010";
  const MID_GREEN   = "#2a6018";
  const LIGHT_GREEN = "#3a7820";

  const glowDots = [
    { top: "8%",  left: "40%", size: 7,  delay: 0    },
    { top: "15%", left: "20%", size: 5,  delay: 0.4  },
    { top: "18%", left: "65%", size: 8,  delay: 0.8  },
    { top: "28%", left: "10%", size: 6,  delay: 0.2  },
    { top: "30%", left: "78%", size: 5,  delay: 1.0  },
    { top: "35%", left: "50%", size: 9,  delay: 0.6  },
    { top: "42%", left: "30%", size: 6,  delay: 1.2  },
    { top: "45%", left: "72%", size: 7,  delay: 0.3  },
    { top: "55%", left: "18%", size: 5,  delay: 0.9  },
    { top: "50%", left: "85%", size: 6,  delay: 1.4  },
  ];

  return (
    <div style={{ position: "relative", width: 220, userSelect: "none" }}>

      {/* ── TREE CANOPY ── */}
      <div style={{
        position: "relative",
        width: "100%",
        height: 200,
        cursor: "pointer",
      }} onClick={onToggle}>

        {/* Canopy layers */}
        {[
          { w: "55%", h: 80, top: 0,   ml: "22%" },
          { w: "75%", h: 80, top: 55,  ml: "12%" },
          { w: "90%", h: 80, top: 100, ml: "5%"  },
        ].map((layer, i) => (
          <div key={i} style={{
            position: "absolute",
            top: layer.top,
            left: layer.ml,
            width: layer.w,
            height: layer.h,
            background: i === 0 ? LIGHT_GREEN : i === 1 ? MID_GREEN : DARK_GREEN,
            borderRadius: "50% 50% 45% 45% / 55% 55% 45% 45%",
            boxShadow: `0 0 ${isPlaying ? 20 : 8}px rgba(50,120,20,${isPlaying ? 0.4 : 0.2})`,
            transition: "box-shadow 0.5s",
          }} />
        ))}

        {/* Glow dots (light up when playing) */}
        {glowDots.map((d, i) => (
          <div key={i} style={{ ...d, position: "absolute", opacity: isPlaying ? 1 : 0.4, transition: "opacity 0.5s" }}>
            <GlowDot {...d} />
          </div>
        ))}

        {/* ── MONITOR in canopy center ── */}
        <div style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0.85)",
          borderRadius: 8,
          border: `3px solid ${BROWN}`,
          overflow: "hidden",
          boxShadow: "0 0 16px rgba(0,0,0,0.9)",
          zIndex: 3,
        }}>
          {monitor}
        </div>

        {/* Chevron */}
        <div style={{
          position: "absolute",
          bottom: 8, left: "50%", transform: `translateX(-50%) rotate(${isOpen ? 180 : 0}deg)`,
          fontSize: 11, color: LIGHT_GREEN, transition: "transform 0.3s", zIndex: 4,
        }}>▼</div>
      </div>

      {/* ── TRUNK ── */}
      <div style={{
        width: "22%",
        height: 50,
        background: `linear-gradient(180deg, ${BROWN} 0%, #2a1800 100%)`,
        borderRadius: "4px 4px 8px 8px",
        margin: "0 auto",
        boxShadow: `0 4px 12px rgba(0,0,0,0.6)`,
      }} />

      {/* ── GROUND / BASE ── */}
      <div style={{
        width: "65%", height: 12,
        margin: "0 auto",
        background: `linear-gradient(90deg, transparent, #1a1008, transparent)`,
        borderRadius: "50%",
      }} />

      {/* ── CONTROL BUTTONS ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
        {[
          { icon: "⏮", id: "prev" },
          { icon: "▶", id: "play", big: true },
          { icon: "⏭", id: "next" },
          { icon: "❤", id: "like" },
          { icon: "+", id: "add"  },
        ].map((b) => (
          <button key={b.id} type="button" data-action={b.id}
            style={{
              width:  b.big ? 36 : 28, height: b.big ? 36 : 28,
              borderRadius: "50%",
              background: b.big ? accent : `rgba(255,180,50,0.15)`,
              border: b.big ? "none" : `2px solid rgba(255,180,50,0.4)`,
              color:  b.big ? "#000" : accent,
              fontSize: b.big ? 14 : 11, fontWeight: 900,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: b.big ? `0 0 12px ${accent}66` : "none",
            }}>
            {b.icon}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes leafGlow {
          0%,100% { transform: scale(1); opacity: 0.7; }
          50%      { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

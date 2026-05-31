"use client";

/**
 * SubmarineSkin — Yellow submarine playlist artifact character.
 * Based on Playlist Bases 9, 10, 11: yellow body, blue porthole,
 * orange propeller, periscope, bubbles, dark monitor screen.
 */

import type { ReactNode } from "react";

interface SubmarineSkinProps {
  monitor:     ReactNode;   // MediaMonitorDisplay rendered inside
  isPlaying:   boolean;
  isOpen:      boolean;
  onToggle:    () => void;
  accent?:     string;
}

function Bubble({ size, left, delay }: { size: number; left: string; delay: number }) {
  return (
    <div style={{
      position: "absolute",
      bottom: "60%",
      left,
      width: size,
      height: size,
      borderRadius: "50%",
      background: "rgba(100,200,255,0.3)",
      border: "1px solid rgba(100,200,255,0.5)",
      animation: `subBubble ${1.8 + delay}s ease-in infinite ${delay}s`,
    }} />
  );
}

export default function SubmarineSkin({ monitor, isPlaying, isOpen, onToggle, accent = "#FFD700" }: SubmarineSkinProps) {
  const YELLOW = "#E8A020";
  const YELLOW_DARK = "#C07010";
  const YELLOW_LIGHT = "#F0B030";

  return (
    <div style={{ position: "relative", width: 260, userSelect: "none" }}>
      {/* Bubbles (above the sub) */}
      {[
        { size: 8,  left: "15%",  delay: 0    },
        { size: 12, left: "30%",  delay: 0.5  },
        { size: 6,  left: "60%",  delay: 0.2  },
        { size: 10, left: "75%",  delay: 0.8  },
        { size: 7,  left: "45%",  delay: 1.1  },
        { size: 14, left: "85%",  delay: 0.3  },
        { size: 5,  left: "20%",  delay: 1.4  },
        { size: 9,  left: "52%",  delay: 0.7  },
      ].map((b, i) => isPlaying && <Bubble key={i} {...b} />)}

      {/* ── PERISCOPE ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "38%",
        width: 14,
        height: 36,
        background: `linear-gradient(180deg, ${YELLOW_DARK} 0%, ${YELLOW} 100%)`,
        borderRadius: "6px 6px 0 0",
        zIndex: 2,
      }}>
        {/* Periscope head */}
        <div style={{
          position: "absolute",
          top: -8,
          left: -4,
          width: 22,
          height: 12,
          background: `linear-gradient(135deg, ${YELLOW_LIGHT}, ${YELLOW_DARK})`,
          borderRadius: 6,
        }} />
        {/* Periscope lens */}
        <div style={{
          position: "absolute",
          top: -6,
          right: -6,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#1a3a5a",
          border: "2px solid #2a5a8a",
          boxShadow: "0 0 4px rgba(0,150,255,0.5)",
        }} />
      </div>

      {/* ── MAIN BODY ── */}
      <div
        style={{
          position: "relative",
          marginTop: 30,
          width: "100%",
          height: 140,
          background: `linear-gradient(180deg, ${YELLOW_LIGHT} 0%, ${YELLOW} 40%, ${YELLOW_DARK} 100%)`,
          borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%",
          boxShadow: `0 8px 24px rgba(0,0,0,0.5), inset 0 2px 6px rgba(255,255,255,0.2)`,
          cursor: "pointer",
          overflow: "visible",
        }}
        onClick={onToggle}
      >
        {/* ── LEFT PORTHOLE ── */}
        <div style={{
          position: "absolute",
          left: 18,
          top: "30%",
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #2a6a9a, #0a2a4a)",
          border: `3px solid ${YELLOW_DARK}`,
          boxShadow: "0 0 8px rgba(0,100,200,0.5)",
        }}>
          {/* Porthole cross */}
          <div style={{ position: "absolute", inset: 2, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
        </div>

        {/* ── MONITOR WINDOW (center) ── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-40%, -50%)",
            borderRadius: 8,
            border: `3px solid ${YELLOW_DARK}`,
            overflow: "hidden",
            boxShadow: "0 0 12px rgba(0,0,0,0.8)",
            zIndex: 1,
          }}
        >
          {monitor}
        </div>

        {/* ── PROPELLER (right side) ── */}
        <div style={{
          position: "absolute",
          right: -20,
          top: "50%",
          transform: "translateY(-50%)",
        }}>
          {/* Hub */}
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            background: YELLOW_DARK,
            border: `2px solid ${YELLOW_LIGHT}`,
            position: "relative", zIndex: 2,
          }} />
          {/* Blades */}
          {[0, 120, 240].map((rot) => (
            <div key={rot} style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 22, height: 10,
              transformOrigin: "0% 50%",
              transform: `translate(0, -50%) rotate(${rot}deg)`,
              background: `linear-gradient(90deg, #CC5500, #FF8844)`,
              borderRadius: "0 50% 50% 0",
              animation: isPlaying ? `propSpin 0.8s linear infinite` : "none",
            }} />
          ))}
        </div>

        {/* ── CHEVRON TOGGLE ── */}
        <div style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "rgba(255,255,255,0.6)",
          transition: "transform 0.3s",
          rotate: isOpen ? "180deg" : "0deg",
        }}>
          ▼
        </div>
      </div>

      {/* ── CONTROL BUTTONS (below hull) ── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 10, marginTop: 8,
      }}>
        {[
          { icon: "⏮", id: "prev"  },
          { icon: "▶", id: "play", big: true },
          { icon: "⏭", id: "next"  },
          { icon: "❤", id: "like"  },
          { icon: "+", id: "add"   },
        ].map((b) => (
          <button
            key={b.id}
            type="button"
            data-action={b.id}
            style={{
              width:  b.big ? 36 : 28,
              height: b.big ? 36 : 28,
              borderRadius: "50%",
              background:  b.big ? accent : `${YELLOW}22`,
              border:      b.big ? "none" : `2px solid ${YELLOW_DARK}`,
              color:       b.big ? "#000" : YELLOW_LIGHT,
              fontSize:    b.big ? 14 : 11,
              fontWeight:  900,
              cursor:      "pointer",
              display:     "flex",
              alignItems:  "center",
              justifyContent: "center",
              boxShadow:   b.big ? `0 0 12px ${accent}66` : "none",
              transition:  "transform 0.1s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
            onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
          >
            {b.icon}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes subBubble {
          0%   { transform: translateY(0) translateX(0);   opacity: 0.8; }
          50%  { transform: translateY(-30px) translateX(4px); opacity: 0.5; }
          100% { transform: translateY(-70px) translateX(0); opacity: 0; }
        }
        @keyframes propSpin {
          from { transform: translate(0,-50%) rotate(var(--rot,0deg)) rotateZ(0deg); }
          to   { transform: translate(0,-50%) rotate(var(--rot,0deg)) rotateZ(360deg); }
        }
      `}</style>
    </div>
  );
}

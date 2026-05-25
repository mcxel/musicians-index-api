"use client";

import React from "react";

interface HomeAtmosphereEngineProps {
  primary: string;
  secondary: string;
}

/**
 * HomeAtmosphereEngine — the animated underlay for Home 1.
 * Renders: drifting gradient pulse, grid, Memphis dots, halftone, color blocks,
 * neon rails, confetti squares, SVG shapes, lightning bolts, film grain,
 * and corner trim lines. z-indexes 0-8, never above content.
 */
export default function HomeAtmosphereEngine({ primary, secondary }: HomeAtmosphereEngineProps) {
  return (
    <>
      <style>{`
        @keyframes atmoDrift {
          0%   { opacity:0.72; transform:scale(1)    rotate(0deg);   }
          25%  { opacity:0.85; transform:scale(1.04) rotate(0.6deg); }
          50%  { opacity:0.78; transform:scale(1.06) rotate(-0.4deg);}
          75%  { opacity:0.88; transform:scale(1.02) rotate(0.8deg); }
          100% { opacity:0.72; transform:scale(1)    rotate(0deg);   }
        }
        @keyframes atmoRailDrift {
          0%,100% { opacity:0.5; transform:translateX(-10px) translateY(0px);   }
          50%     { opacity:0.95; transform:translateX(10px) translateY(-8px);  }
        }
        @keyframes atmoConfettiFloat {
          0%   { transform:translateY(0)   rotate(0deg)   scale(1);   opacity:0.9; }
          100% { transform:translateY(70px) rotate(360deg) scale(0.6); opacity:0;  }
        }
        @keyframes atmoLightningFlash {
          0%,88%,100% { opacity:0.7; }
          90% { opacity:1; filter:brightness(2.2); }
          94% { opacity:0.4; }
        }
        @keyframes atmoGrainMove {
          0%  { background-position:0% 0%;    }
          20% { background-position:40% 60%;  }
          40% { background-position:100% 30%; }
          60% { background-position:60% 100%; }
          80% { background-position:10% 70%;  }
          100%{ background-position:0% 0%;    }
        }
        @keyframes atmoShapeDrift {
          0%,100% { transform:translateY(0px) rotate(0deg)   scale(1);   opacity:0.18; }
          33%     { transform:translateY(-18px) rotate(6deg) scale(1.06); opacity:0.3;  }
          66%     { transform:translateY(12px) rotate(-4deg) scale(0.95); opacity:0.22; }
        }
        @keyframes atmoShapeDrift2 {
          0%,100% { transform:translateY(0px) rotate(0deg)   scale(1);   opacity:0.22; }
          40%     { transform:translateY(20px) rotate(-8deg) scale(1.08); opacity:0.35; }
          70%     { transform:translateY(-12px) rotate(5deg) scale(0.92); opacity:0.18; }
        }
        @keyframes atmoShapeDrift3 {
          0%,100% { transform:translateY(0px) rotate(0deg)   scale(1);   opacity:0.15; }
          50%     { transform:translateY(-22px) rotate(12deg) scale(1.1); opacity:0.28; }
        }
      `}</style>

      {/* ── Animated gradient background pulse ─────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `
            radial-gradient(ellipse at 20% 30%, ${primary}44 0%, transparent 55%),
            radial-gradient(ellipse at 80% 70%, ${secondary}33 0%, transparent 55%),
            radial-gradient(ellipse at 50% 50%, ${primary}18 0%, transparent 65%)
          `,
          animation: "atmoDrift 18s ease-in-out infinite",
        }}
      />

      {/* ── Grid underlay ─────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Memphis confetti dots ──────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          backgroundImage: `
            radial-gradient(circle, #FFD70088 2px, transparent 2px),
            radial-gradient(circle, #ffffff55 1px, transparent 1px),
            radial-gradient(circle, #FF2DAA66 2px, transparent 2px),
            radial-gradient(circle, #00FF8844 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px, 80px 80px, 95px 95px, 60px 60px",
          backgroundPosition: "10px 15px, 45px 55px, 70px 30px, 20px 70px",
          opacity: 0.55,
        }}
      />

      {/* ── Halftone screen ───────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 1.5px), " +
            "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.32) 1px, transparent 1.5px)",
          backgroundSize: "12px 12px, 18px 18px",
          mixBlendMode: "soft-light",
          opacity: 0.18,
        }}
      />

      {/* ── Memphis color blocks behind orbit ─────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute", left: "50%", top: "46%",
          transform: "translate(-50%,-50%)",
          width: "min(900px, 90vw)", height: "min(640px, 64vh)",
          pointerEvents: "none", zIndex: 4,
        }}
      >
        <div style={{ position: "absolute", left: "2%", top: "6%", width: "22%", height: "24%", background: "linear-gradient(135deg,#FF2DAA55,#AA2DFF33)", clipPath: "polygon(0 0,100% 0,86% 100%,0 100%)", animation: "atmoShapeDrift 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", right: "3%", top: "12%", width: "26%", height: "18%", background: "linear-gradient(135deg,#00FFFF55,#00FF8833)", clipPath: "polygon(0 0,100% 0,100% 100%,12% 100%)", animation: "atmoShapeDrift2 19s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", left: "7%", bottom: "8%", width: "30%", height: "20%", background: "linear-gradient(135deg,#FFD70044,#FF6B3533)", clipPath: "polygon(8% 0,100% 0,92% 100%,0 100%)", animation: "atmoShapeDrift3 25s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", right: "7%", bottom: "5%", width: "24%", height: "22%", background: "linear-gradient(135deg,#AA2DFF44,#00FFFF22)", clipPath: "polygon(0 0,100% 0,100% 100%,18% 100%)", animation: "atmoShapeDrift 20s ease-in-out infinite 3s" }} />
        {/* Extra center glow block */}
        <div style={{ position: "absolute", left: "35%", top: "30%", width: "30%", height: "40%", background: `radial-gradient(ellipse at 50% 50%, ${primary}18 0%, transparent 60%)`, animation: "atmoDrift 15s ease-in-out infinite 1s" }} />
      </div>

      {/* ── Neon lightning rails ─────────────────────────────────── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
        <div style={{ position: "absolute", left: "3%", top: "30%", width: "26%", height: 2, background: "linear-gradient(90deg,#00FFFF,transparent)", transform: "rotate(-14deg)", animation: "atmoRailDrift 4.4s ease-in-out infinite", boxShadow: "0 0 14px #00FFFF" }} />
        <div style={{ position: "absolute", right: "2%", top: "57%", width: "28%", height: 2, background: "linear-gradient(90deg,#FF2DAA,transparent)", transform: "rotate(13deg)", animation: "atmoRailDrift 4.9s ease-in-out infinite 0.8s", boxShadow: "0 0 14px #FF2DAA" }} />
        <div style={{ position: "absolute", left: "37%", bottom: "13%", width: "22%", height: 2, background: "linear-gradient(90deg,#FFD700,transparent)", transform: "rotate(-9deg)", animation: "atmoRailDrift 3.9s ease-in-out infinite 0.4s", boxShadow: "0 0 14px #FFD700" }} />
        {/* Extra rails */}
        <div style={{ position: "absolute", left: "55%", top: "15%", width: "18%", height: 1.5, background: "linear-gradient(90deg,#AA2DFF,transparent)", transform: "rotate(7deg)", animation: "atmoRailDrift 5.2s ease-in-out infinite 1.2s", boxShadow: "0 0 10px #AA2DFF" }} />
        <div style={{ position: "absolute", left: "10%", top: "62%", width: "20%", height: 1.5, background: "linear-gradient(90deg,#00FF88,transparent)", transform: "rotate(-6deg)", animation: "atmoRailDrift 4.1s ease-in-out infinite 0.6s", boxShadow: "0 0 10px #00FF88" }} />
      </div>

      {/* ── Floating confetti squares ─────────────────────────────── */}
      {([
        { c: "#FFD700", x: "7%",  y: "11%", s: 9,  r: 25,  d: "atmoConfettiFloat 3.2s ease-in-out infinite" },
        { c: "#FF2DAA", x: "14%", y: "34%", s: 6,  r: -15, d: "atmoConfettiFloat 4.1s ease-in-out infinite 0.5s" },
        { c: "#00FF88", x: "82%", y: "17%", s: 7,  r: 40,  d: "atmoConfettiFloat 3.7s ease-in-out infinite 0.2s" },
        { c: "#FFD700", x: "77%", y: "47%", s: 5,  r: -30, d: "atmoConfettiFloat 4.5s ease-in-out infinite 1s" },
        { c: "#ffffff", x: "92%", y: "61%", s: 6,  r: 55,  d: "atmoConfettiFloat 3.9s ease-in-out infinite 0.7s" },
        { c: "#FF6B35", x: "4%",  y: "71%", s: 8,  r: -45, d: "atmoConfettiFloat 4.3s ease-in-out infinite 0.3s" },
        { c: "#00FFFF", x: "41%", y: "7%",  s: 5,  r: 70,  d: "atmoConfettiFloat 3.5s ease-in-out infinite 1.2s" },
        { c: "#FFD700", x: "61%", y: "84%", s: 7,  r: 20,  d: "atmoConfettiFloat 4.8s ease-in-out infinite 0.8s" },
        { c: "#FF2DAA", x: "24%", y: "89%", s: 6,  r: -60, d: "atmoConfettiFloat 3.3s ease-in-out infinite 1.5s" },
        { c: "#AA2DFF", x: "87%", y: "29%", s: 9,  r: 35,  d: "atmoConfettiFloat 4.0s ease-in-out infinite 0.4s" },
        { c: "#FFD700", x: "54%", y: "3%",  s: 5,  r: -25, d: "atmoConfettiFloat 3.6s ease-in-out infinite 0.9s" },
        { c: "#00FF88", x: "34%", y: "77%", s: 7,  r: 50,  d: "atmoConfettiFloat 4.2s ease-in-out infinite 0.6s" },
        { c: "#FF6B35", x: "68%", y: "55%", s: 6,  r: -35, d: "atmoConfettiFloat 3.8s ease-in-out infinite 1.1s" },
        { c: "#00FFFF", x: "22%", y: "52%", s: 5,  r: 62,  d: "atmoConfettiFloat 4.4s ease-in-out infinite 0.15s" },
      ] as const).map((dot, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute", left: dot.x, top: dot.y,
            width: dot.s, height: dot.s, background: dot.c,
            borderRadius: 1, transform: `rotate(${dot.r}deg)`,
            animation: dot.d, zIndex: 3, pointerEvents: "none",
          }}
        />
      ))}

      {/* ── SVG decorative shapes ─────────────────────────────────── */}
      <svg
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3, overflow: "visible" }}
      >
        {/* Corner triangles */}
        <polygon points="0,0 200,0 0,200" fill="#7C3AED" opacity="0.5" />
        <polygon points="100%,0 100%,180 calc(100% - 180px),0" fill="#6D28D9" opacity="0.4" />
        {/* Small scattered triangles */}
        <polygon points="76%,8%  79%,8%  77.5%,11%" fill="#FFD700" opacity="0.75" />
        <polygon points="22%,4%  25%,4%  23.5%,7%"  fill="#FFD700" opacity="0.65" />
        <polygon points="90%,22% 93%,22% 91.5%,25%" fill="#00FFFF" opacity="0.55" />
        <polygon points="4%,55%  7%,55%  5.5%,58%"  fill="#FFD700" opacity="0.6" />
        <polygon points="12%,80% 15%,80% 13.5%,83%" fill="#00FFFF" opacity="0.5" />
        <polygon points="88%,72% 91%,72% 89.5%,75%" fill="#FFD700" opacity="0.65" />
        <polygon points="48%,94% 51%,94% 49.5%,97%" fill="#FF2DAA" opacity="0.55" />
        <polygon points="60%,40% 63%,40% 61.5%,43%" fill="#AA2DFF" opacity="0.5" />
        <polygon points="30%,60% 33%,60% 31.5%,63%" fill="#00FF88" opacity="0.45" />
        {/* Star outlines */}
        <polygon points="88%,38% 89.5%,43% 94%,43% 90.5%,46% 92%,51% 88%,48% 84%,51% 85.5%,46% 82%,43% 86.5%,43%" fill="none" stroke="#AA2DFF" strokeWidth="2" opacity="0.8" />
        <polygon points="38%,2%  39%,5%  42%,5%  39.5%,7% 40.5%,10% 38%,8%  35.5%,10% 36.5%,7% 34%,5%  37%,5%" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.7" />
        <polygon points="8%,45%  9.5%,50% 14%,50% 10.5%,53% 12%,58%  8%,55%  4%,58%  5.5%,53% 2%,50%  6.5%,50%" fill="none" stroke="#FF2DAA" strokeWidth="1.5" opacity="0.6" />
        {/* Zigzag accent */}
        <polyline points="0%,96% 4%,90% 8%,96% 12%,90% 16%,96%" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.35" />
        <polyline points="84%,5% 88%,11% 92%,5% 96%,11% 100%,5%" fill="none" stroke="#00FFFF" strokeWidth="1.5" opacity="0.3" />
      </svg>

      {/* ── Lightning bolts ──────────────────────────────────────── */}
      {([
        { x: "5%",  y: "88%", size: 22, color: "#FFD700", delay: 0 },
        { x: "94%", y: "88%", size: 22, color: "#FFD700", delay: 0.6 },
        { x: "2%",  y: "40%", size: 16, color: "#AA2DFF", delay: 1.1 },
        { x: "94%", y: "55%", size: 16, color: "#00FFFF", delay: 0.4 },
        { x: "17%", y: "92%", size: 13, color: "#FFD700", delay: 0.8 },
        { x: "80%", y: "92%", size: 13, color: "#FFD700", delay: 1.4 },
        { x: "47%", y: "1%",  size: 14, color: "#FFD700", delay: 0.2 },
        { x: "72%", y: "6%",  size: 11, color: "#FF2DAA", delay: 1.7 },
      ] as const).map((bolt, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute", left: bolt.x, top: bolt.y,
            fontSize: bolt.size, color: bolt.color,
            animation: `atmoLightningFlash 2.4s ease-in-out infinite`,
            animationDelay: `${bolt.delay}s`,
            pointerEvents: "none", zIndex: 3,
            filter: `drop-shadow(0 0 6px ${bolt.color})`,
            lineHeight: 1,
          }}
        >
          ⚡
        </div>
      ))}

      {/* ── Film grain ───────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4,
          opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          animation: "atmoGrainMove 0.14s steps(1) infinite",
        }}
      />

      {/* ── Purple corner trim lines ──────────────────────────────── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, border: "4px solid #6D28D9", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden style={{ position: "absolute", inset: 6, border: "1.5px solid rgba(255,215,0,0.28)", pointerEvents: "none", zIndex: 8 }} />
    </>
  );
}

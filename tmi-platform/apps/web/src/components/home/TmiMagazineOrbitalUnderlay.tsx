"use client";

import { motion } from "framer-motion";
import { useState } from "react";

// ── Scrolling tabloid panels — bold, colorful, full visibility ──────────────
// Each panel repeats so the scroll is seamless (×3 for loop)
const PANELS = [
  {
    title:    "WHO TOOK THE CROWN",
    sub:      "VOTE NOW · CROWN UPDATING",
    color:    "#FFD700",
    bg:       "rgba(255,215,0,0.12)",
    border:   "rgba(255,215,0,0.3)",
    href:     "/vote",
  },
  {
    title:    "FREE GLOBAL PROMOTION",
    sub:      "ARTISTS · PERFORMERS · VENUES",
    color:    "#FF2DAA",
    bg:       "rgba(255,45,170,0.1)",
    border:   "rgba(255,45,170,0.25)",
    href:     "/subscribe",
  },
  {
    title:    "BATTLE NIGHT",
    sub:      "1V1 · WINNER STAYS · LIVE NOW",
    color:    "#FF6B35",
    bg:       "rgba(255,107,53,0.1)",
    border:   "rgba(255,107,53,0.25)",
    href:     "/battles/live",
  },
  {
    title:    "CYPHER ARENA",
    sub:      "OPEN MIC · ALL GENRES · 2,730 SEATS",
    color:    "#00FFFF",
    bg:       "rgba(0,255,255,0.08)",
    border:   "rgba(0,255,255,0.2)",
    href:     "/rooms/cypher?autoSeat=1",
  },
  {
    title:    "CHALLENGE THE CROWN",
    sub:      "SONG VS SONG · WINNER STAYS · NONSTOP",
    color:    "#00FF88",
    bg:       "rgba(0,255,136,0.08)",
    border:   "rgba(0,255,136,0.2)",
    href:     "/rooms/challenge-arena",
  },
  {
    title:    "FREE GLOBAL PROMOTION",
    sub:      "CLAIM YOUR SLOT · GET FEATURED",
    color:    "#AA2DFF",
    bg:       "rgba(170,45,255,0.1)",
    border:   "rgba(170,45,255,0.25)",
    href:     "/hub/performer",
  },
];

export default function TmiMagazineOrbitalUnderlay() {
  const [direction, setDirection] = useState(1);

  return (
    <section
      className="relative w-full overflow-hidden border-y border-white/10 bg-[#020205] z-10 flex items-center justify-center"
      style={{ minHeight: "60vh", willChange: "transform" }}
    >
      {/* ── SCROLLING TABLOID UNDERLAY ── */}
      <div className="absolute inset-0 flex items-center overflow-hidden">
        <motion.div
          animate={{ x: direction > 0 ? [0, "-50%"] : ["-50%", 0] }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity }}
          className="flex"
          style={{ willChange: "transform", backfaceVisibility: "hidden" }}
        >
          {/* Panels ×2 for seamless loop */}
          {[...PANELS, ...PANELS].map((p, i) => (
            <a
              key={i}
              href={p.href}
              className="flex-shrink-0 flex flex-col items-center justify-center border-r border-white/5"
              style={{
                width: 320, minWidth: 320, height: "60vh",
                background: p.bg,
                borderLeft: `1px solid ${p.border}`,
                textDecoration: "none",
                padding: "0 20px",
              }}
            >
              {/* BIG HEADLINE */}
              <div
                style={{
                  fontFamily: "'Anton', 'Impact', sans-serif",
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  lineHeight: 1.05,
                  textAlign: "center",
                  color: p.color,
                  textShadow: `0 0 30px ${p.color}44`,
                  letterSpacing: "0.01em",
                  marginBottom: 10,
                  willChange: "transform",
                }}
              >
                {p.title}
              </div>
              {/* Subtitle */}
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  color: `${p.color}99`,
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                {p.sub}
              </div>
              {/* CTA pill */}
              <div
                style={{
                  marginTop: 14,
                  padding: "4px 14px",
                  borderRadius: 20,
                  border: `1px solid ${p.color}55`,
                  fontSize: 8,
                  fontWeight: 900,
                  color: p.color,
                  letterSpacing: "0.14em",
                  background: `${p.color}10`,
                }}
              >
                ENTER →
              </div>
            </a>
          ))}
        </motion.div>
      </div>

      {/* Edge vignettes — lighter so panels show through */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(2,2,5,0.82) 0%, transparent 14%, transparent 86%, rgba(2,2,5,0.82) 100%)" }}
      />

      {/* ── ORBITAL WHEEL (floats above underlay) ── */}
      <div
        className="relative z-20 flex items-center justify-center"
        style={{ width: 320, height: 320, willChange: "transform" }}
      >
        {/* Outer spinning dashed ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{ border: "1px dashed rgba(255,215,0,0.25)", willChange: "transform", backfaceVisibility: "hidden" }}
        />
        {/* Inner spinning ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full"
          style={{ inset: 20, border: "1px dashed rgba(255,45,170,0.2)", willChange: "transform", backfaceVisibility: "hidden" }}
        />

        {/* Hub circle */}
        <div
          className="relative z-10 rounded-full flex flex-col items-center justify-center text-center"
          style={{
            width: 170, height: 170,
            background: "rgba(2,2,5,0.95)",
            border: "1.5px solid rgba(0,255,255,0.4)",
            boxShadow: "0 0 40px rgba(0,255,255,0.12), inset 0 0 20px rgba(0,0,0,0.8)",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 4 }}>👑</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.18em", lineHeight: 1.3 }}>
            WEEKLY<br />CROWN<br />ORBIT
          </div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginTop: 4, letterSpacing: "0.1em" }}>TOP 10 · LIVE</div>
        </div>
      </div>

      {/* Direction controls */}
      <div className="absolute bottom-4 right-4 z-30 flex gap-2">
        <button
          onClick={() => setDirection(-1)}
          className="text-xs font-bold tracking-widest transition-colors"
          style={{ padding: "4px 10px", background: direction === -1 ? "rgba(255,215,0,0.2)" : "rgba(0,0,0,0.5)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4, color: "#FFD700", cursor: "pointer" }}
        >
          ◀ SCROLL
        </button>
        <button
          onClick={() => setDirection(1)}
          className="text-xs font-bold tracking-widest transition-colors"
          style={{ padding: "4px 10px", background: direction === 1 ? "rgba(255,215,0,0.2)" : "rgba(0,0,0,0.5)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4, color: "#FFD700", cursor: "pointer" }}
        >
          SCROLL ▶
        </button>
      </div>
    </section>
  );
}

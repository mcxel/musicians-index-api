"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

const HEADLINES = [
  { artist: "NOVA REIGN", genre: "Neo-Soul", title: "\"Frequencies\" — New Album Out Now", tag: "FEATURED DROP" },
  { artist: "CYPHER KINGS", genre: "Hip-Hop / Trap", title: "\"Crown the Undiscovered\" — Weekly Cypher Open", tag: "LIVE CYPHER" },
  { artist: "DIANA CROSS", genre: "R&B / Pop", title: "\"Mirror Language\" — Chart Debut #1", tag: "CHARTING NOW" },
];

export default function HeroBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HEADLINES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const h = HEADLINES[idx];

  return (
    <div style={{
      position: "relative",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      minHeight: 340,
      background: "linear-gradient(135deg, #0A0A1A 0%, #0F0A1F 40%, #0A1A0F 100%)",
      border: "1px solid rgba(0,255,255,0.2)",
      boxShadow: "0 0 60px rgba(0,255,255,0.08), 0 0 100px rgba(170,45,255,0.05)",
    }}>
      {/* Background geometric shapes */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(170,45,255,0.1)" }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(0,255,255,0.08)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(170,45,255,0.12) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 80%, rgba(0,255,255,0.08) 0%, transparent 50%)" }} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "40px 40px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 340 }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", color: "#00FFFF", textTransform: "uppercase" }}
          >
            ◈ THE MUSICIAN&apos;S INDEX — LIVE
          </motion.div>
          <div style={{ display: "flex", gap: 20 }}>
            {["HIP-HOP", "R&B", "SOUL", "TRAP", "POP"].map(g => (
              <span key={g} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#FF2DAA")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>{g}</span>
            ))}
          </div>
        </div>

        {/* Main headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <AnimatePresence mode="wait">
            <motion.div key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: "#FF2DAA", textTransform: "uppercase", marginBottom: 10, textShadow: "0 0 10px #FF2DAA" }}>
                ◆ {h.tag}
              </div>
              <h1 style={{ margin: "0 0 6px", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.1, color: "white", letterSpacing: "-0.02em" }}>
                {h.artist}
              </h1>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>{h.genre}</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 500 }}>{h.title}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom action row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/contest" style={{
              display: "inline-block", padding: "10px 24px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
              background: "linear-gradient(90deg, #00FFFF, #AA2DFF)",
              color: "#000", borderRadius: 6,
            }}>
              Enter Contest
            </Link>
            <Link href="/live" style={{
              display: "inline-block", padding: "10px 24px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
              border: "1px solid rgba(0,255,255,0.4)", color: "#00FFFF", borderRadius: 6,
            }}>
              Go Live
            </Link>
          </div>
          {/* Dot nav */}
          <div style={{ display: "flex", gap: 8 }}>
            {HEADLINES.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
                background: i === idx ? "#00FFFF" : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

const GENRES = ["Hip-Hop", "R&B / Soul", "Neo-Soul", "Trap", "Afrobeats", "Gospel", "Jazz Fusion", "Lo-Fi"];

const CROWN_WINNERS = [
  { name: "JAYLEN CROSS", genre: "Hip-Hop", title: "\"Crown Season\" Vol. 3", votes: "24,881", week: "Week 14" },
  { name: "AMIRAH WELLS", genre: "R&B / Soul", title: "\"Midnight Frequencies\"", votes: "19,440", week: "Week 13" },
  { name: "DESTINED", genre: "Neo-Soul", title: "\"Unwritten Maps\"", votes: "17,220", week: "Week 12" },
];

function CrownIcon() {
  return (
    <motion.svg
      width="48" height="40" viewBox="0 0 48 40" fill="none"
      animate={{ filter: ["drop-shadow(0 0 8px #FFD700)", "drop-shadow(0 0 20px #FFD700)", "drop-shadow(0 0 8px #FFD700)"] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.path
        d="M4 36 L8 14 L16 26 L24 6 L32 26 L40 14 L44 36 Z"
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth="1.5"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="4" cy="14" r="3" fill="#FF2DAA" />
      <circle cx="24" cy="6" r="3.5" fill="#00FFFF" />
      <circle cx="44" cy="14" r="3" fill="#FF2DAA" />
      <rect x="4" y="36" width="40" height="4" rx="2" fill="#AA6600" />
    </motion.svg>
  );
}

export default function WeeklyCrownBelt() {
  const [genreIdx, setGenreIdx] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setGenreIdx(i => (i + 1) % GENRES.length), 2000);
    return () => clearInterval(t);
  }, []);

  const winner = CROWN_WINNERS[winnerIdx];

  return (
    <div style={{
      background: "linear-gradient(135deg, #0F0A00 0%, #100800 50%, #0A0A1A 100%)",
      border: "1px solid rgba(255,215,0,0.25)",
      borderRadius: 12,
      padding: "28px 28px 24px",
      marginBottom: 20,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 0 40px rgba(255,215,0,0.06), 0 0 80px rgba(255,45,170,0.04)",
    }}>
      {/* Gold radial glow behind crown */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, position: "relative", zIndex: 1 }}>
        {/* Left: winner spotlight */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <SectionTitle title="Weekly Crown" accent="gold" badge={winner.week} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <CrownIcon />
            <div>
              <AnimatePresence mode="wait">
                <motion.div key={winnerIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", marginBottom: 4 }}>
                    ♛ CROWNED
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 4 }}>
                    {winner.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{winner.title}</div>
                  <div style={{ fontSize: 11, color: "#FFD700" }}>
                    {winner.votes} votes · {winner.genre}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Link href="/contest" style={{ padding: "7px 18px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", background: "#FFD700", color: "#000", borderRadius: 5 }}>
                  Vote Now
                </Link>
                <Link href="/winners" style={{ padding: "7px 18px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", border: "1px solid rgba(255,215,0,0.4)", color: "#FFD700", borderRadius: 5 }}>
                  All Winners
                </Link>
              </div>
            </div>
          </div>

          {/* Past winners */}
          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
            {CROWN_WINNERS.map((w, i) => (
              <button key={i} onClick={() => setWinnerIdx(i)} style={{
                padding: "5px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                border: `1px solid ${i === winnerIdx ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 5, background: i === winnerIdx ? "rgba(255,215,0,0.1)" : "transparent",
                color: i === winnerIdx ? "#FFD700" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}>{w.week}</button>
            ))}
          </div>
        </div>

        {/* Right: genre wheel */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 160 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
            Genre Crown
          </div>
          <div style={{
            width: 130, height: 130, borderRadius: "50%",
            border: "2px solid rgba(255,215,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 70%)",
            position: "relative",
          }}>
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px dashed rgba(255,215,0,0.15)" }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={genreIdx}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: "center" }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700", textAlign: "center", lineHeight: 1.2 }}>
                  {GENRES[genreIdx]}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 160 }}>
            {GENRES.slice(0, 6).map((g, i) => (
              <span key={g} style={{
                fontSize: 8, padding: "2px 7px", borderRadius: 3,
                background: i === genreIdx % 6 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                color: i === genreIdx % 6 ? "#FFD700" : "rgba(255,255,255,0.3)",
                border: `1px solid ${i === genreIdx % 6 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)"}`,
                letterSpacing: "0.08em",
              }}>{g}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

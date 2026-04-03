"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const PHASES = ["AUDITIONS", "ROUND 1", "QUARTERFINALS", "SEMIFINALS", "FINALE", "CROWNED"] as const;
type Phase = typeof PHASES[number];

const CONTESTANTS = [
  { id: 1, name: "NeonVoice_X", genre: "R&B", score: 934, qualified: true, city: "Atlanta" },
  { id: 2, name: "LaserLyrics", genre: "Hip-Hop", score: 912, qualified: true, city: "Houston" },
  { id: 3, name: "MidnightMelody", genre: "Soul", score: 889, qualified: true, city: "Detroit" },
  { id: 4, name: "CrownSeekerV2", genre: "Trap", score: 862, qualified: true, city: "Chicago" },
  { id: 5, name: "PinkDiva99", genre: "Pop R&B", score: 841, qualified: true, city: "Miami" },
  { id: 6, name: "GoldenVibez", genre: "Neo-Soul", score: 807, qualified: false, city: "LA" },
];

const SPONSOR_GIFTS = [
  { sponsor: "Crown Audio", prize: "Pro Studio Time (4hrs)", icon: "🎙️" },
  { sponsor: "Glow Apparel", prize: "Full Outfit Collection", icon: "👗" },
  { sponsor: "Power Boost Energy", prize: "$500 + Year Supply", icon: "⚡" },
];

export default function MonthlyIdolPage() {
  const [phase, setPhase] = useState<Phase>("ROUND 1");
  const [watching, setWatching] = useState(5841);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "28px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800 }}>HOSTED BY GREGORY MARCEL</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  MONTHLY IDOL
                </h1>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#00FFFF" }}>{watching.toLocaleString()}</div>
                <div style={{ fontSize: 8, letterSpacing: 3, color: "#888" }}>WATCHING</div>
              </div>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                style={{ background: "#FFD700", borderRadius: 20, padding: "4px 14px", fontSize: 9, fontWeight: 900, letterSpacing: 3, color: "#050510" }}>
                LIVE
              </motion.div>
            </div>

            {/* Phase nav */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 20, overflowX: "auto" }}>
              {PHASES.map(p => (
                <button key={p} onClick={() => setPhase(p)} style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
                  background: phase === p ? "rgba(255,215,0,0.2)" : "transparent",
                  border: `1px solid ${phase === p ? "#FFD700" : "rgba(255,255,255,0.1)"}`,
                  color: phase === p ? "#FFD700" : "#666", fontSize: 9, fontWeight: 700, letterSpacing: 2,
                }}>{p}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, padding: "24px 32px" }}>

            {/* Contestant grid */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>CONTESTANTS — {phase}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {CONTESTANTS.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      background: "rgba(255,215,0,0.04)", border: `1px solid ${c.qualified ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 12, padding: 18,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: `rgba(255,215,0,0.15)`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22,
                      }}>🎤</div>
                      {c.qualified && <div style={{
                        background: "rgba(0,255,136,0.15)", border: "1px solid #00FF88",
                        borderRadius: 20, padding: "2px 8px", fontSize: 7, color: "#00FF88", fontWeight: 800, letterSpacing: 2, height: "fit-content",
                      }}>QUALIFIED</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>{c.genre} · {c.city}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{c.score}</div>
                      <motion.button whileTap={{ scale: 0.93 }} style={{
                        padding: "5px 14px", borderRadius: 20,
                        background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
                        color: "#FFD700", fontSize: 9, fontWeight: 700, cursor: "pointer",
                      }}>VOTE</motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Host card */}
              <div style={{
                background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 42, marginBottom: 8 }}>🎩</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700", marginBottom: 3 }}>Gregory Marcel</div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#888", marginBottom: 12 }}>MAIN HOST</div>
                <div style={{
                  padding: "8px 12px", borderRadius: 8,
                  background: "rgba(0,0,0,0.3)", fontSize: 11, color: "#ccc", lineHeight: 1.5, textAlign: "left",
                }}>
                  "Welcome to Monthly Idol — where legends are made and the world is watching. Give it everything."
                </div>
              </div>

              {/* Sponsor gifts */}
              <div style={{
                background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 14 }}>🎁 SPONSOR PRIZES</div>
                {SPONSOR_GIFTS.map(g => (
                  <div key={g.sponsor} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 0", borderBottom: "1px solid rgba(170,45,255,0.1)",
                  }}>
                    <div style={{ fontSize: 20 }}>{g.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{g.prize}</div>
                      <div style={{ fontSize: 9, color: "#AA2DFF" }}>by {g.sponsor}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Qualification rules */}
              <div style={{
                background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.12)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>QUALIFICATION RULES</div>
                {[
                  "Top 50% advance to next round",
                  "Audience vote = 60% of score",
                  "Judge vote = 40% of score",
                  "Min 500 votes to qualify",
                  "1 vote per account per round",
                ].map(r => (
                  <div key={r} style={{ fontSize: 10, color: "#aaa", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid rgba(0,255,255,0.2)" }}>
                    {r}
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}

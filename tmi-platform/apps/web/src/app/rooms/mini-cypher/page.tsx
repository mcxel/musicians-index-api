"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const MODES = ["1V1", "2V2", "CIRCLE", "OPEN MIC"] as const;
type Mode = typeof MODES[number];

const QUEUE = [
  { id: 1, name: "LaserMouth_X", style: "Trap Flow", wait: "UP NEXT", rank: "B1" },
  { id: 2, name: "GhostWriter44", style: "Boom Bap", wait: "2 min", rank: "B2" },
  { id: 3, name: "NeonKing", style: "Melodic", wait: "4 min", rank: "B3" },
  { id: 4, name: "CrownSeeker", style: "Punchlines", wait: "6 min", rank: "B4" },
  { id: 5, name: "SilentBolt", style: "Metaphors", wait: "8 min", rank: "B5" },
  { id: 6, name: "RicochetMC", style: "Speed Rap", wait: "10 min", rank: "B6" },
  { id: 7, name: "DarkMirror9", style: "Storytelling", wait: "12 min", rank: "B7" },
  { id: 8, name: "FireBrand88", style: "Multi-Syllabic", wait: "14 min", rank: "B8" },
];

export default function MiniCypherPage() {
  const [mode, setMode] = useState<Mode>("1V1");
  const [battling, setBattling] = useState({ a: "CurrentChamp_X", b: "LaserMouth_X" });
  const [queueCount, setQueueCount] = useState(247);
  const [barCount, setBarCount] = useState(8);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "28px 32px 0", borderBottom: "1px solid rgba(0,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#00FFFF", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#00FFFF", fontWeight: 800 }}>OPEN FORMAT BATTLE — CO-HOSTED BY JULIUS</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  MINI CYPHER
                </h1>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#00FFFF" }}>{queueCount}</div>
                <div style={{ fontSize: 8, letterSpacing: 3, color: "#888" }}>IN QUEUE</div>
              </div>
            </div>

            {/* Mode selector */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 20 }}>
              {MODES.map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  padding: "6px 18px", borderRadius: 20, cursor: "pointer",
                  background: mode === m ? "rgba(0,255,255,0.2)" : "transparent",
                  border: `1px solid ${mode === m ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                  color: mode === m ? "#00FFFF" : "#666", fontSize: 10, fontWeight: 700, letterSpacing: 2,
                }}>{m}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, padding: "24px 32px" }}>

            {/* Battle area */}
            <div>
              {/* Active battle */}
              <div style={{
                background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.2)",
                borderRadius: 16, padding: 28, marginBottom: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>
                  🎤 ACTIVE BATTLE — {mode} MODE
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 20, marginBottom: 24 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,255,255,0.15)", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎤</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#00FFFF", marginBottom: 4 }}>{battling.a}</div>
                    <div style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}>CHAMPION</div>
                    <motion.button whileTap={{ scale: 0.93 }} style={{
                      marginTop: 10, padding: "7px 20px", borderRadius: 20,
                      background: "rgba(0,255,255,0.1)", border: "1px solid #00FFFF",
                      color: "#00FFFF", fontSize: 9, fontWeight: 700, cursor: "pointer",
                    }}>VOTE A</motion.button>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#FFD700", marginBottom: 8 }}>VS</div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>BARS</div>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      {[...Array(barCount)].map((_, i) => (
                        <div key={i} style={{ width: 4, height: 24, borderRadius: 2, background: i < 4 ? "#00FFFF" : "rgba(255,255,255,0.15)" }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
                      {[4, 8, 16].map(n => (
                        <button key={n} onClick={() => setBarCount(n)} style={{
                          padding: "3px 9px", borderRadius: 10, cursor: "pointer",
                          background: barCount === n ? "rgba(255,215,0,0.2)" : "transparent",
                          border: `1px solid ${barCount === n ? "#FFD700" : "rgba(255,255,255,0.1)"}`,
                          color: barCount === n ? "#FFD700" : "#555", fontSize: 9, fontWeight: 700,
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,45,170,0.15)", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎤</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#FF2DAA", marginBottom: 4 }}>{battling.b}</div>
                    <div style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}>CHALLENGER</div>
                    <motion.button whileTap={{ scale: 0.93 }} style={{
                      marginTop: 10, padding: "7px 20px", borderRadius: 20,
                      background: "rgba(255,45,170,0.1)", border: "1px solid #FF2DAA",
                      color: "#FF2DAA", fontSize: 9, fontWeight: 700, cursor: "pointer",
                    }}>VOTE B</motion.button>
                  </div>
                </div>

                {/* Battle ref + controls */}
                <div style={{
                  display: "flex", gap: 10, padding: "14px 16px", borderRadius: 10,
                  background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(0,255,255,0.1)",
                  alignItems: "center",
                }}>
                  <div style={{ fontSize: 9, color: "#888" }}>🤖 Battle Ref Bot:</div>
                  <div style={{ flex: 1, fontSize: 10, color: "#aaa" }}>
                    "Round 1 complete. {battling.b} advances — 58% crowd vote. Next: {QUEUE[0]?.name} vs winner."
                  </div>
                </div>
              </div>

              {/* Join queue */}
              <div style={{
                background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)",
                borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 10 }}>JOIN THE QUEUE</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
                  Up to 1,000 emcees can queue. Your spot is held for 10 minutes.
                </div>
                <motion.button whileTap={{ scale: 0.97 }} style={{
                  padding: "12px 40px", borderRadius: 25,
                  background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)",
                  border: "none", color: "#fff", fontWeight: 900, fontSize: 12, letterSpacing: 3, cursor: "pointer",
                }}>
                  🎤 JOIN QUEUE (#{queueCount + 1})
                </motion.button>
              </div>
            </div>

            {/* Queue list */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#888", fontWeight: 800, marginBottom: 16 }}>BATTLE QUEUE</div>
              {QUEUE.map((q, i) => (
                <div key={q.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 4, background: "rgba(0,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "#00FFFF",
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{q.name}</div>
                    <div style={{ fontSize: 9, color: "#666" }}>{q.style}</div>
                  </div>
                  <div style={{ fontSize: 9, color: i === 0 ? "#FFD700" : "#666", fontWeight: i === 0 ? 700 : 400 }}>
                    {q.wait}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 10, color: "#444", marginTop: 12, textAlign: "center" }}>
                +{queueCount - QUEUE.length} more in queue
              </div>
            </div>

          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}

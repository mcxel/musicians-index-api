"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const CONTESTANTS = [
  { id: 1, name: "SmoothTalk_99", score: 487, rank: 1, badge: "🏆" },
  { id: 2, name: "CrowdKing_X", score: 412, rank: 2, badge: "🥈" },
  { id: 3, name: "FireMouth44", score: 389, rank: 3, badge: "🥉" },
  { id: 4, name: "JokeSlayer", score: 321, rank: 4, badge: "" },
  { id: 5, name: "NightmareLevel", score: 298, rank: 5, badge: "" },
  { id: 6, name: "BitterButReal", score: 244, rank: 6, badge: "" },
];

const JUDGE_PANEL = [
  { name: "Julius", role: "HEAD JUDGE", icon: "👑", color: "#FFD700" },
  { name: "Crowd Hype Bot", role: "CROWD METER", icon: "🔊", color: "#FF2DAA" },
  { name: "Triage Bot", role: "VIOLATION CHECK", icon: "🛡️", color: "#AA2DFF" },
];

const ROUNDS = ["WARM UP", "ROUND 1", "ROUND 2", "SEMI-FINAL", "FINAL", "CHAMPION"];

export default function DirtyDozensPage() {
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [crowdMeter, setCrowdMeter] = useState(72);
  const [isLive, setIsLive] = useState(true);
  const [currentPair, setCurrentPair] = useState({ a: "SmoothTalk_99", b: "CrowdKing_X" });

  useEffect(() => {
    if (!isLive || timeLeft <= 0) return;
    const t = setTimeout(() => {
      setTimeLeft(s => s - 1);
      setCrowdMeter(m => Math.min(100, Math.max(30, m + (Math.random() * 8 - 4))));
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, isLive]);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Top */}
          <div style={{ padding: "28px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800 }}>BATTLE ROOM — HOSTED BY JULIUS</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  DIRTY DOZENS
                </h1>
              </div>
              {isLive && (
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  style={{ background: "#FF2DAA", borderRadius: 20, padding: "4px 14px", fontSize: 9, fontWeight: 900, letterSpacing: 3 }}>
                  LIVE
                </motion.div>
              )}
            </div>

            {/* Round nav */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 20, overflowX: "auto" }}>
              {ROUNDS.map((r, i) => (
                <button key={r} onClick={() => setRound(i)} style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
                  background: round === i ? "rgba(255,215,0,0.2)" : "transparent",
                  border: `1px solid ${round === i ? "#FFD700" : "rgba(255,255,255,0.1)"}`,
                  color: round === i ? "#FFD700" : "#666", fontSize: 9, fontWeight: 700, letterSpacing: 2,
                }}>{r}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, padding: "24px 32px" }}>

            {/* Main battle area */}
            <div>
              {/* Active match */}
              <div style={{
                background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)",
                borderRadius: 16, padding: 28, marginBottom: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 20 }}>⚔️ CURRENT BATTLE — {ROUNDS[round]}</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 20, marginBottom: 24 }}>
                  {/* Contestant A */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,45,170,0.2)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>😤</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#FF2DAA" }}>{currentPair.a}</div>
                    <motion.button whileTap={{ scale: 0.93 }} style={{
                      marginTop: 12, padding: "8px 24px", borderRadius: 20,
                      background: "rgba(255,45,170,0.15)", border: "1px solid #FF2DAA",
                      color: "#FF2DAA", fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}>VOTE A</motion.button>
                  </div>

                  {/* VS + Timer */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700", marginBottom: 8 }}>VS</div>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: `conic-gradient(#FF2DAA ${(timeLeft / 45) * 360}deg, rgba(255,255,255,0.1) 0deg)`,
                      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: timeLeft <= 10 ? "#FF2DAA" : "#fff" }}>
                        {timeLeft}s
                      </div>
                    </div>
                  </div>

                  {/* Contestant B */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(170,45,255,0.2)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>😤</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#AA2DFF" }}>{currentPair.b}</div>
                    <motion.button whileTap={{ scale: 0.93 }} style={{
                      marginTop: 12, padding: "8px 24px", borderRadius: 20,
                      background: "rgba(170,45,255,0.15)", border: "1px solid #AA2DFF",
                      color: "#AA2DFF", fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}>VOTE B</motion.button>
                  </div>
                </div>

                {/* Crowd meter */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 9, letterSpacing: 3, color: "#888" }}>CROWD METER</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#FFD700" }}>{Math.round(crowdMeter)}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <motion.div
                      animate={{ width: `${crowdMeter}%` }}
                      transition={{ type: "spring", stiffness: 60 }}
                      style={{ height: "100%", background: "linear-gradient(90deg, #FF2DAA, #FFD700)", borderRadius: 4 }}
                    />
                  </div>
                </div>
              </div>

              {/* Judge Panel */}
              <div style={{
                background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)",
                borderRadius: 12, padding: 20, marginBottom: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>JUDGE PANEL</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {JUDGE_PANEL.map(j => (
                    <div key={j.name} style={{
                      flex: 1, padding: "14px", borderRadius: 10,
                      background: `${j.color}08`, border: `1px solid ${j.color}25`, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{j.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{j.name}</div>
                      <div style={{ fontSize: 8, letterSpacing: 2, color: j.color, marginTop: 3 }}>{j.role}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Leaderboard */}
            <div>
              <div style={{
                background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>🏆 LEADERBOARD</div>
                {CONTESTANTS.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                      background: i === 0 ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${i === 0 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.05)"}`,
                    }}
                  >
                    <div style={{ width: 20, fontSize: 14, textAlign: "center" }}>{c.badge || `#${c.rank}`}</div>
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700" }}>{c.score}</div>
                  </motion.div>
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

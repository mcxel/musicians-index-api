"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const DANCE_FLOOR_COLORS = [
  "#FF2DAA", "#00FFFF", "#AA2DFF", "#FFD700", "#FF9500", "#00FF88",
];
const DJ_TRACKS = [
  { title: "Crown Up — Remix", artist: "DJ Sentinel", bpm: 142, genre: "Trap" },
  { title: "Neon Kingdom", artist: "LaserFlow", bpm: 128, genre: "EDM" },
  { title: "Midnight Cypher", artist: "Julius ft. Crew", bpm: 95, genre: "Hip-Hop" },
  { title: "World Dance Anthem", artist: "TMI House Band", bpm: 138, genre: "Dance" },
];

export default function WorldDancePartyPage() {
  const [bpm, setBpm] = useState(142);
  const [isLive, setIsLive] = useState(true);
  const [activeColor, setActiveColor] = useState(0);
  const [dancers, setDancers] = useState(2847);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tipAmount, setTipAmount] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveColor(c => (c + 1) % DANCE_FLOOR_COLORS.length);
      setDancers(d => d + Math.floor(Math.random() * 5) - 2);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80, overflow: "hidden" }}>

          {/* BPM-reactive header glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 60 / bpm * 2, ease: "easeInOut" }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, height: "100vh",
              background: `radial-gradient(ellipse at 50% 30%, ${DANCE_FLOOR_COLORS[activeColor]}15 0%, transparent 60%)`,
              pointerEvents: "none", zIndex: 0,
            }}
          />

          {/* Top HUD */}
          <div style={{ position: "relative", zIndex: 1, padding: "28px 32px 0", borderBottom: "1px solid rgba(255,45,170,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#FF2DAA", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800 }}>LIVE ROOM</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  WORLD DANCE PARTY
                </h1>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#FF2DAA" }}>{dancers.toLocaleString()}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "#888" }}>DANCERS</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#00FFFF" }}>{bpm}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "#888" }}>BPM</div>
                </div>
                {isLive && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{
                      background: "#FF2DAA", borderRadius: 20, padding: "4px 12px",
                      fontSize: 9, fontWeight: 900, letterSpacing: 3, color: "#fff",
                    }}
                  >LIVE</motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, padding: "24px 32px" }}>

            {/* Dance floor / Main stage */}
            <div>
              {/* DJ Stream area */}
              <div style={{
                background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)",
                borderRadius: 16, padding: 24, marginBottom: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 14 }}>🎧 DJ STREAM</div>
                <div style={{ background: "#0a0a1a", borderRadius: 10, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60 / bpm * 2, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 100, height: 100, borderRadius: "50%",
                      background: `conic-gradient(${DANCE_FLOOR_COLORS[activeColor]}, #0a0a1a, ${DANCE_FLOOR_COLORS[(activeColor + 2) % 6]})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#050510" }} />
                  </motion.div>
                </div>

                {/* Track list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {DJ_TRACKS.map((track, i) => (
                    <div key={track.title} onClick={() => setCurrentTrack(i)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      borderRadius: 8, cursor: "pointer",
                      background: currentTrack === i ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${currentTrack === i ? "rgba(255,45,170,0.3)" : "rgba(255,255,255,0.05)"}`,
                    }}>
                      {currentTrack === i && (
                        <motion.div animate={{ scaleY: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.5 }}
                          style={{ display: "flex", gap: 2 }}>
                          {[1, 2, 3].map(b => (
                            <div key={b} style={{ width: 2, height: 14, background: "#FF2DAA", borderRadius: 1 }} />
                          ))}
                        </motion.div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: currentTrack === i ? "#fff" : "#aaa" }}>{track.title}</div>
                        <div style={{ fontSize: 10, color: "#666" }}>{track.artist}</div>
                      </div>
                      <div style={{ fontSize: 9, color: "#FF2DAA" }}>{track.bpm} BPM</div>
                      <div style={{ fontSize: 9, color: "#888" }}>{track.genre}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dance cam + voting */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{
                  background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)",
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>🎥 DANCE CAM</div>
                  <div style={{ background: "#0a0a1a", borderRadius: 8, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>💃</div>
                      <div style={{ fontSize: 10, color: "#666" }}>Dance cams loading…</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)",
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 14 }}>🏆 VOTE BEST DANCER</div>
                  {["CrownQueen44", "SmooveStyles", "NeonKing_X", "MidnightMover"].map(dancer => (
                    <div key={dancer} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(170,45,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>👤</div>
                      <div style={{ flex: 1, fontSize: 11, color: "#ccc" }}>{dancer}</div>
                      <motion.button whileTap={{ scale: 0.93 }} style={{
                        padding: "4px 12px", borderRadius: 20,
                        background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.3)",
                        color: "#AA2DFF", fontSize: 9, fontWeight: 700, cursor: "pointer",
                      }}>VOTE</motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel — Tip + Light controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Tip dancer */}
              <div style={{
                background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>💰 TIP A DANCER</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[1, 5, 10, 25, 50, 100].map(amt => (
                    <motion.button key={amt} whileTap={{ scale: 0.94 }} onClick={() => setTipAmount(amt)} style={{
                      padding: "8px 0", borderRadius: 8, cursor: "pointer",
                      background: tipAmount === amt ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.06)",
                      border: `1px solid ${tipAmount === amt ? "#FFD700" : "rgba(255,215,0,0.15)"}`,
                      color: tipAmount === amt ? "#FFD700" : "#aaa",
                      fontSize: 13, fontWeight: 700,
                    }}>${amt}</motion.button>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.97 }} disabled={!tipAmount} style={{
                  width: "100%", padding: "11px 0", borderRadius: 8, cursor: tipAmount ? "pointer" : "default",
                  background: tipAmount ? "linear-gradient(135deg, #FFD700, #FF9500)" : "rgba(255,255,255,0.05)",
                  border: "none", color: tipAmount ? "#050510" : "#444",
                  fontWeight: 900, fontSize: 11, letterSpacing: 2,
                }}>
                  {tipAmount ? `TIP $${tipAmount}` : "SELECT AMOUNT"}
                </motion.button>
              </div>

              {/* Lighting mood */}
              <div style={{
                background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 14 }}>💡 ROOM LIGHTS</div>
                {[
                  { label: "DANCE MODE", icon: "🕺", color: "#FF2DAA" },
                  { label: "STROBE (SAFE)", icon: "⚡", color: "#00FFFF" },
                  { label: "CROWD WASH", icon: "🌊", color: "#AA2DFF" },
                  { label: "BEAM SWEEP", icon: "🔦", color: "#FFD700" },
                ].map(mode => (
                  <motion.button key={mode.label} whileTap={{ scale: 0.96 }} style={{
                    display: "block", width: "100%", padding: "10px 14px", borderRadius: 8,
                    marginBottom: 6, background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: mode.color, fontSize: 10, fontWeight: 700, letterSpacing: 2,
                    cursor: "pointer", textAlign: "left",
                  }}>
                    {mode.icon} {mode.label}
                  </motion.button>
                ))}
              </div>

              {/* Quick nav */}
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#888", fontWeight: 800, marginBottom: 14 }}>OTHER ROOMS</div>
                {[
                  { label: "Cypher Arena", href: "/rooms/cypher" },
                  { label: "Monday Stage", href: "/rooms/monday-stage" },
                  { label: "Dirty Dozens", href: "/rooms/dirty-dozens" },
                  { label: "Monthly Idol", href: "/rooms/monthly-idol" },
                ].map(r => (
                  <Link key={r.label} href={r.href} style={{
                    display: "block", padding: "8px 0",
                    color: "#888", fontSize: 11, textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>→ {r.label}</Link>
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

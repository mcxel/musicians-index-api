"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const TARGET = new Date(Date.now() + 4 * 60 * 60 * 1000 + 22 * 60 * 1000);

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setDiff(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function WorldPremierePage() {
  const { h, m, s } = useCountdown(TARGET);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80, overflow: "hidden" }}>

          {/* Stage curtain animation */}
          <AnimatePresence>
            {!curtainOpen && (
              <motion.div
                initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", pointerEvents: "none" }}
              >
                <motion.div exit={{ x: "-100%" }} transition={{ duration: 1.2, ease: "easeInOut" }}
                  style={{ flex: 1, background: "linear-gradient(180deg, #1a0030 0%, #050510 100%)" }} />
                <motion.div exit={{ x: "100%" }} transition={{ duration: 1.2, ease: "easeInOut" }}
                  style={{ flex: 1, background: "linear-gradient(180deg, #1a0030 0%, #050510 100%)" }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div style={{ position: "relative", zIndex: 1, padding: "28px 32px 0", borderBottom: "1px solid rgba(170,45,255,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#AA2DFF", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800 }}>WORLD PREMIERE — HOSTED BY GREGORY MARCEL</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  WORLD PREMIERE
                </h1>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, padding: "40px 32px", textAlign: "center" }}>

            {/* Countdown */}
            {!revealed ? (
              <div>
                <div style={{ fontSize: 11, letterSpacing: 5, color: "#888", marginBottom: 28 }}>DROPS IN</div>
                <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 40 }}>
                  {[
                    { val: String(h).padStart(2, "0"), label: "HOURS" },
                    { val: String(m).padStart(2, "0"), label: "MINUTES" },
                    { val: String(s).padStart(2, "0"), label: "SECONDS" },
                  ].map(({ val, label }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <motion.div
                        key={val}
                        initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        style={{ fontSize: "clamp(48px,8vw,80px)", fontWeight: 900, color: "#AA2DFF", lineHeight: 1 }}
                      >{val}</motion.div>
                      <div style={{ fontSize: 8, letterSpacing: 4, color: "#555", marginTop: 6 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Artist teaser */}
                <div style={{
                  maxWidth: 480, margin: "0 auto 32px",
                  background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)",
                  borderRadius: 16, padding: "28px 32px",
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>MYSTERY ARTIST</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                    The world is about to hear something that will change the culture.<br />
                    Be here when the curtain drops.
                  </div>
                </div>

                {/* Reminders + sponsor reveal */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <motion.button whileTap={{ scale: 0.96 }} style={{
                    padding: "12px 28px", borderRadius: 25,
                    background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)",
                    border: "none", color: "#fff", fontWeight: 800, fontSize: 11, letterSpacing: 3, cursor: "pointer",
                  }}>🔔 SET REMINDER</motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => setCurtainOpen(true)} style={{
                    padding: "12px 28px", borderRadius: 25,
                    background: "transparent", border: "1px solid rgba(170,45,255,0.4)",
                    color: "#AA2DFF", fontWeight: 800, fontSize: 11, letterSpacing: 3, cursor: "pointer",
                  }}>OPEN CURTAIN</motion.button>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 4, color: "#AA2DFF" }}>IT'S LIVE</div>
              </motion.div>
            )}

            {/* Sponsor reveal */}
            <div style={{ marginTop: 40, maxWidth: 480, margin: "40px auto 0" }}>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#888", fontWeight: 800, marginBottom: 16 }}>BROUGHT TO YOU BY</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                {["Crown Audio", "Glow Apparel", "Power Boost Energy"].map(s => (
                  <div key={s} style={{
                    padding: "8px 20px", borderRadius: 20,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 10, color: "#888", fontWeight: 600,
                  }}>{s}</div>
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

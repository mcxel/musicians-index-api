"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SEED_FEEDS } from "@/lib/broadcast/BroadcastRotationEngine";

const SEEN_KEY = "tmi_seen_entry";

function useCountUp(target: number, active: boolean, duration = 1000): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let current = 0;
    const steps = 30;
    const step = target / steps;
    const interval = duration / steps;
    const id = setInterval(() => {
      current += step;
      if (current >= target) { setValue(target); clearInterval(id); }
      else setValue(Math.floor(current));
    }, interval);
    return () => clearInterval(id);
  }, [target, active, duration]);
  return value;
}

export default function WelcomeArenaOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const linkRef = useRef<string>("/live/lobby");

  useEffect(() => {
    if (pathname?.startsWith('/home')) return;
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) setVisible(true);
  }, [pathname]);

  const liveFeeds   = SEED_FEEDS.filter(f => f.status === "live");
  const liveRooms   = liveFeeds.length;
  const totalWatch  = liveFeeds.reduce((s, f) => s + (f.viewerCount ?? 0), 0);
  const performers  = SEED_FEEDS.filter(f =>
    f.kind === "battle" || f.kind === "live-camera" || f.kind === "cypher" || f.kind === "concert"
  ).length;

  const displayRooms    = useCountUp(liveRooms, visible);
  const displayWatching = useCountUp(totalWatch > 0 ? totalWatch : 47, visible, 1400);
  const displayPerf     = useCountUp(performers, visible, 800);

  function enter(href: string) {
    linkRef.current = href;
    localStorage.setItem(SEEN_KEY, "1");
    setExiting(true);
    const dest = href === "/live/lobby" ? "/live/lobby?entered=1" : href;
    setTimeout(() => {
      setVisible(false);
      window.location.href = dest;
    }, 320);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="arena-overlay"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9600,
            background: "rgba(5,5,16,0.97)",
            backdropFilter: "blur(14px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter',sans-serif",
            padding: "clamp(24px,5vw,64px)",
          }}
        >
          <style>{`
            @keyframes tmiEnterGlow {
              0%, 100% { box-shadow: 0 0 0 0 rgba(0,200,255,0.5), 0 8px 32px rgba(0,0,0,0.6); }
              50% { box-shadow: 0 0 0 12px rgba(0,200,255,0), 0 8px 32px rgba(0,0,0,0.6); }
            }
            @keyframes tmiBlink {
              0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; }
            }
          `}</style>

          {/* Eyebrow */}
          <div style={{
            fontSize: 8, fontWeight: 900, letterSpacing: "0.5em",
            color: "#FF2DAA", textTransform: "uppercase",
            marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#FF2020", display: "inline-block",
              boxShadow: "0 0 8px #FF2020",
              animation: "tmiBlink 1s step-end infinite",
            }} />
            OPEN STAGE · BETA
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Bebas Neue','Impact',sans-serif",
            fontSize: "clamp(48px,10vw,96px)",
            letterSpacing: "0.04em",
            color: "#fff",
            textAlign: "center",
            lineHeight: 0.95,
            margin: "0 0 8px",
            textShadow: "0 0 40px rgba(0,200,255,0.3)",
          }}>
            THIS IS<br />
            <span style={{ color: "#00C8FF" }}>YOUR STAGE</span>
          </h1>

          <p style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(13px,2vw,16px)",
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
            margin: "0 0 8px",
            letterSpacing: "0.02em",
          }}>
            Go public — appear on the Lobby Wall and get discovered by real fans right now.
          </p>

          {/* Count-up stats */}
          <div style={{
            display: "flex",
            gap: "clamp(20px,4vw,48px)",
            margin: "28px 0 36px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            {[
              { value: displayRooms,    label: "ROOMS LIVE",    color: "#FF2DAA" },
              { value: displayWatching, label: "PEOPLE INSIDE", color: "#00C8FF" },
              { value: displayPerf,     label: "PERFORMERS",    color: "#FFD700"  },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Bebas Neue','Impact',sans-serif",
                  fontSize: "clamp(32px,5vw,52px)",
                  color: stat.color,
                  lineHeight: 1,
                  textShadow: `0 0 20px ${stat.color}60`,
                  minWidth: 60,
                }}>
                  {stat.value.toLocaleString()}
                </div>
                <div style={{
                  fontSize: 8, fontWeight: 900, letterSpacing: "0.25em",
                  color: "rgba(255,255,255,0.35)", marginTop: 4,
                  textTransform: "uppercase",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => enter("/live/lobby")}
            style={{
              padding: "18px 48px",
              background: "linear-gradient(135deg, #00C8FF, #AA2DFF)",
              color: "#050510",
              fontFamily: "'Bebas Neue','Impact',sans-serif",
              fontSize: "clamp(18px,3vw,26px)",
              letterSpacing: "0.1em",
              border: "none",
              cursor: "pointer",
              fontWeight: 900,
              animation: "tmiEnterGlow 1.8s ease-in-out infinite",
              marginBottom: 10,
              minWidth: 280,
            }}
          >
            🎥 START BROADCASTING
          </motion.button>

          <div style={{
            fontSize: 9, color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.12em", marginBottom: 16,
          }}>
            Your profile hits the Lobby Wall the moment you go live
          </div>

          {/* Secondary */}
          <button
            onClick={() => enter("/live/lobby")}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.55)",
              padding: "10px 28px",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.15em",
              cursor: "pointer",
              fontFamily: "'Inter',sans-serif",
              marginBottom: 8,
            }}
          >
            ⚡ ENTER LIVE ARENA
          </button>

          <button
            onClick={() => enter("/")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.25)",
              padding: "6px 20px",
              fontSize: 9, fontWeight: 700,
              letterSpacing: "0.15em",
              cursor: "pointer",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            EXPLORE FIRST →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

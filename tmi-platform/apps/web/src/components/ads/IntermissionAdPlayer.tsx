"use client";

/**
 * IntermissionAdPlayer — shown during show breaks/intermissions.
 * Tier-aware: Diamond users never see this. Free users get full sponsored content.
 * Has countdown timer. Premium users can skip after 5s.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type UserTier = "free" | "pro-RUBY" | "gold-platinum" | "diamond";

interface IntermissionAdPlayerProps {
  isActive: boolean;
  userTier?: UserTier;
  onClose?: () => void;
  accentColor?: string;
  performerName?: string;
  returnInSeconds?: number;
}

const SPONSORS = [
  { name: "BeatBox Studio", tagline: "Pro beats for every genre", color: "#AA2DFF", cta: "TRY FREE" },
  { name: "SoundGear Pro",  tagline: "Gear that moves with you",  color: "#00FFFF", cta: "SHOP NOW" },
  { name: "ViralMix Labs",  tagline: "Go viral with your sound",  color: "#FFD700", cta: "LEARN MORE" },
];

export default function IntermissionAdPlayer({
  isActive,
  userTier = "free",
  onClose,
  accentColor = "#AA2DFF",
  performerName = "The Artist",
  returnInSeconds = 300,
}: IntermissionAdPlayerProps) {
  const [countdown, setCountdown]   = useState(returnInSeconds);
  const [skipTimer, setSkipTimer]   = useState(5);
  const [canSkip, setCanSkip]       = useState(userTier !== "free");
  const [sponsorIdx, setSponsorIdx] = useState(0);
  const [adPhase, setAdPhase]       = useState<"break" | "sponsor" | "countdown">("break");

  const sponsor = SPONSORS[sponsorIdx % SPONSORS.length]!;
  const isDiamond = userTier === "diamond";
  const isGold    = userTier === "gold-platinum";

  useEffect(() => {
    if (!isActive || isDiamond) return;
    const t = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [isActive, isDiamond]);

  useEffect(() => {
    if (!isActive || canSkip || isDiamond) return;
    let st = 5;
    const t = setInterval(() => {
      st--;
      setSkipTimer(st);
      if (st <= 0) { setCanSkip(true); clearInterval(t); }
    }, 1000);
    return () => clearInterval(t);
  }, [isActive, canSkip, isDiamond]);

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => {
      setSponsorIdx(i => i + 1);
    }, 8000);
    return () => clearInterval(t);
  }, [isActive]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!isActive || isDiamond) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intermission"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "absolute", inset: 0, zIndex: 80,
          background: "rgba(0,0,0,0.92)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Intermission header */}
        <motion.div
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.25em", color: accentColor, marginBottom: 8 }}
        >
          ⏸ INTERMISSION
        </motion.div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
          {performerName} returns in <span style={{ color: accentColor, fontWeight: 800 }}>{fmt(countdown)}</span>
        </div>

        {/* Sponsor card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sponsorIdx}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "min(400px, 92vw)",
              background: `linear-gradient(135deg, ${sponsor.color}0a, rgba(0,0,0,0.8))`,
              border: `1px solid ${sponsor.color}44`,
              borderRadius: 14,
              padding: "20px 24px",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", marginBottom: 8 }}>SPONSORED BY</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: sponsor.color, letterSpacing: "0.06em", marginBottom: 6 }}>
              {sponsor.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
              {sponsor.tagline}
            </div>
            <button style={{
              padding: "8px 24px", borderRadius: 8, fontSize: 11, fontWeight: 900,
              background: sponsor.color, color: "#000", border: "none", cursor: "pointer",
              letterSpacing: "0.1em",
            }}>{sponsor.cta} ›</button>
          </motion.div>
        </AnimatePresence>

        {/* Sponsor dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {SPONSORS.map((_, i) => (
            <div key={i} style={{
              width: i === sponsorIdx % SPONSORS.length ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i === sponsorIdx % SPONSORS.length ? accentColor : "rgba(255,255,255,0.15)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        {/* Gold users: reduced ad + early skip */}
        {isGold && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
            Gold member — limited ads
          </div>
        )}

        {/* Skip button */}
        {canSkip ? (
          <button onClick={onClose} style={{
            padding: "6px 20px", borderRadius: 8, fontSize: 10, fontWeight: 800,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", letterSpacing: "0.08em",
          }}>SKIP AD ›</button>
        ) : (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
            Skip available in {skipTimer}s
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

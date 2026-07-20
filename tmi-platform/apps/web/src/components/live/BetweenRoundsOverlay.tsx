"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { RoomShard, CompetitionTheme } from "@/lib/live/LivingRoomEngine";

interface BetweenRoundsOverlayProps {
  shard: RoomShard;
  onJoinQueue: () => void;
  onWatch: () => void;
  onLeave: () => void;
  /** Called when the countdown expires and the next round begins */
  onRoundStart: () => void;
}

function useCountdown(targetMs: number): { seconds: number; done: boolean } {
  const [seconds, setSeconds] = useState(Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)));
  const [done, setDone] = useState(seconds === 0);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetMs - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        setDone(true);
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, [targetMs, done]);

  return { seconds, done };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function BetweenRoundsOverlay({
  shard,
  onJoinQueue,
  onWatch,
  onLeave,
  onRoundStart,
}: BetweenRoundsOverlayProps) {
  const { seconds, done } = useCountdown(shard.nextRoundStartsAt);
  const [mysteryRevealed, setMysteryRevealed] = useState(false);

  // Reveal the mystery at 10 seconds left
  useEffect(() => {
    if (!shard.isMysteryNext) { setMysteryRevealed(true); return; }
    if (seconds <= 10) setMysteryRevealed(true);
  }, [seconds, shard.isMysteryNext]);

  useEffect(() => {
    if (done) onRoundStart();
  }, [done, onRoundStart]);

  const next: Pick<CompetitionTheme, "label" | "emoji" | "accentColor"> =
    shard.nextCompetition ?? {
      label: "Mystery Event",
      emoji: "🎲",
      accentColor: "#00FF88",
    };

  const displayLabel = shard.isMysteryNext && !mysteryRevealed ? "???" : next.label;
  const displayEmoji = shard.isMysteryNext && !mysteryRevealed ? "🎲" : next.emoji;
  const accent = shard.currentCompetition.accentColor;
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(5,5,16,0.92)",
        backdropFilter: "blur(18px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Winner banner */}
      <AnimatePresence>
        {shard.winnerName && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              marginBottom: 24,
              padding: "16px 32px",
              background: `linear-gradient(135deg, ${accent}22, rgba(5,5,16,0.95))`,
              border: `1px solid ${accent}55`,
              borderRadius: 12,
              minWidth: 280,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 6 }}>🏆</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: accent, letterSpacing: "0.2em", marginBottom: 4 }}>
              WINNER ANNOUNCED
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{shard.winnerName}</div>
            {shard.xpAwarded > 0 && (
              <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, marginTop: 6 }}>
                +{shard.xpAwarded.toLocaleString()} XP · +15 Coins
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div style={{ width: 240, height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 28 }} />

      {/* Next event */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 12 }}>
          NEXT EVENT
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={displayLabel}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35 }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>{displayEmoji}</div>
            <div
              style={{
                fontSize: displayLabel === "???" ? 42 : 20,
                fontWeight: 900,
                color: shard.isMysteryNext && !mysteryRevealed ? "rgba(255,255,255,0.35)" : "#fff",
                letterSpacing: displayLabel === "???" ? "0.3em" : "0.02em",
              }}
            >
              {displayLabel}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Countdown */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 6 }}>
            BEGINS IN
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: seconds <= 10 ? "#FF2DAA" : "#FFD700",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.05em",
              textShadow: `0 0 20px ${seconds <= 10 ? "#FF2DAA" : "#FFD700"}`,
            }}
          >
            {pad(mm)}:{pad(ss)}
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onJoinQueue}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
            border: "none",
            color: "#050510",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Join Queue
        </button>
        <button
          onClick={onWatch}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Watch
        </button>
        <button
          onClick={onLeave}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Leave Room
        </button>
      </div>

      {/* Room label */}
      <div style={{ marginTop: 32, fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
        {shard.label.toUpperCase()}
      </div>
    </motion.div>
  );
}

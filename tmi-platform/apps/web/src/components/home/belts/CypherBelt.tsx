"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getHomeLive, type HomeLiveRoom } from "@/components/home/data/getHomeLive";
import { CONTEST_ROUTES } from "@/config/contest.routes";

// ─── Mode definitions ────────────────────────────────────────────────────────
const MODES = [
  {
    id: "contest",
    label: "Contest",
    icon: "🏆",
    accent: "#FFD700",
    description: "Ranked elimination. Top score wins.",
    prize: "Cash + Crown Title",
    instruments: ["🎤 Vocals", "🎹 Keys", "🥁 Drums"],
    nextLabel: "Next Round",
  },
  {
    id: "cypher",
    label: "Cypher",
    icon: "🔄",
    accent: "#00FFFF",
    description: "Open circle. Every bar counts.",
    prize: "Feature Slot + XP",
    instruments: ["🎤 Rap", "🎵 Freestyle", "🎷 Jazz"],
    nextLabel: "Next Rotation",
  },
  {
    id: "battle",
    label: "Battle",
    icon: "⚔️",
    accent: "#FF2DAA",
    description: "Head-to-head. Crowd votes the winner.",
    prize: "Championship Badge + Tips",
    instruments: ["🎤 Bars", "🎧 Beats", "🎸 Guitar"],
    nextLabel: "Next Match",
  },
  {
    id: "beat",
    label: "Beat Challenge",
    icon: "🎛️",
    accent: "#AA2DFF",
    description: "Producers submit. Artists rate.",
    prize: "Beat Pack + Placement",
    instruments: ["🎛️ Production", "🥁 Drums", "🎹 Melody"],
    nextLabel: "Next Drop",
  },
] as const;

type ModeId = (typeof MODES)[number]["id"];

// ─── Countdown timer ─────────────────────────────────────────────────────────
function useCountdown(startSeconds: number) {
  const [secs, setSecs] = useState(startSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s <= 1 ? startSeconds : s - 1)), 1000);
    return () => clearInterval(id);
  }, [startSeconds]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Mini lobby room card ─────────────────────────────────────────────────────
function MiniRoomCard({
  room,
  accent,
  capacity = 25,
}: {
  room: HomeLiveRoom;
  accent: string;
  capacity?: number;
}) {
  const fillPct = Math.min(100, Math.round((room.viewers / capacity) * 100));
  const almostFull = fillPct >= 80;
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: `0 8px 24px ${accent}30` }}
      style={{
        background: "#0a0812",
        border: `1px solid ${accent}${almostFull ? "88" : "33"}`,
        borderRadius: 10,
        padding: "12px 14px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow blob */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Live dot + viewers */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3333", flexShrink: 0 }}
        />
        <span style={{ fontSize: 8, fontWeight: 900, color: "#FF3333", letterSpacing: "0.2em", textTransform: "uppercase" }}>LIVE</span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
          👁 {room.viewers}/{capacity}
        </span>
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3, lineHeight: 1.2 }}>
        {room.name}
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
        {room.host} · {room.genre}
      </div>

      {/* Fill bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
        <motion.div
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: almostFull ? "#FF3333" : accent, borderRadius: 2 }}
        />
      </div>
      {almostFull && (
        <div style={{ fontSize: 8, color: "#FF3333", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>
          ALMOST FULL · NEW ROOM OPENING
        </div>
      )}

      <Link
        href={`/live/rooms/${room.id}`}
        style={{
          display: "inline-block", fontSize: 8, fontWeight: 900, letterSpacing: "0.16em",
          textTransform: "uppercase", padding: "5px 14px", borderRadius: 4,
          background: accent, color: "#000", textDecoration: "none",
          boxShadow: `0 0 10px ${accent}50`,
        }}
      >
        JOIN →
      </Link>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CypherBelt() {
  const [activeMode, setActiveMode] = useState<ModeId>("contest");
  const [rooms, setRooms] = useState<HomeLiveRoom[]>([]);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdown = useCountdown(24 * 60 + 37); // 24:37 stub — will be real data

  // Auto-rotate modes every 12s
  useEffect(() => {
    autoRef.current = setTimeout(() => {
      setActiveMode((cur) => {
        const idx = MODES.findIndex((m) => m.id === cur);
        return MODES[(idx + 1) % MODES.length]!.id;
      });
    }, 12000);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [activeMode]);

  useEffect(() => {
    getHomeLive(3, 3)
      .then((result) => setRooms(result.data.rooms.slice(0, 3)))
      .catch(() => {});
  }, []);

  const mode = MODES.find((m) => m.id === activeMode)!;

  return (
    <div
      style={{
        background: `linear-gradient(170deg, #080612 0%, #0a0618 100%)`,
        border: `1px solid ${mode.accent}22`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.6s ease",
      }}
    >
      {/* ── Header bar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px 12px",
          borderBottom: `1px solid ${mode.accent}22`,
          background: `${mode.accent}08`,
          transition: "background 0.6s ease",
        }}
      >
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: mode.accent, textTransform: "uppercase", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)", marginBottom: 2 }}>
            TMI ARENA · HOME 5
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-tmi-bungee,'Bungee',sans-serif)", lineHeight: 1 }}>
            {mode.icon} {mode.label}
          </div>
        </div>

        {/* Countdown */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>
            {mode.nextLabel} In
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: mode.accent, fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)", letterSpacing: "0.04em", textShadow: `0 0 20px ${mode.accent}80` }}>
            {countdown}
          </div>
        </div>
      </div>

      {/* ── Mode tabs ── */}
      <div style={{ display: "flex", padding: "10px 20px", gap: 6, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMode(m.id)}
            style={{
              flex: 1,
              padding: "7px 4px",
              borderRadius: 6,
              border: `1px solid ${activeMode === m.id ? m.accent : "rgba(255,255,255,0.1)"}`,
              background: activeMode === m.id ? `${m.accent}1a` : "rgba(255,255,255,0.03)",
              color: activeMode === m.id ? m.accent : "rgba(255,255,255,0.45)",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 0 }}>

        {/* LEFT: mode info + instruments + prize */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3 }}
            style={{ padding: "18px 20px", borderRight: `1px solid rgba(255,255,255,0.06)` }}
          >
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 14, lineHeight: 1.5 }}>
              {mode.description}
            </div>

            {/* Instruments */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.18em", color: mode.accent, textTransform: "uppercase", marginBottom: 8 }}>
                In This Round
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {mode.instruments.map((inst) => (
                  <div
                    key={inst}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: `${mode.accent}0d`, borderRadius: 6,
                      padding: "7px 10px", border: `1px solid ${mode.accent}22`,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{inst.split(" ")[0]}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.06em" }}>
                      {inst.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prize */}
            <div
              style={{
                background: `${mode.accent}12`,
                border: `1px solid ${mode.accent}44`,
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 8, letterSpacing: "0.16em", color: mode.accent, textTransform: "uppercase", marginBottom: 4 }}>
                Prize
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {mode.prize}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={CONTEST_ROUTES.qualify}
                style={{
                  flex: 1, textAlign: "center", display: "block",
                  padding: "9px 0", borderRadius: 6,
                  background: mode.accent, color: "#000",
                  fontSize: 9, fontWeight: 900, letterSpacing: "0.14em",
                  textTransform: "uppercase", textDecoration: "none",
                  boxShadow: `0 0 16px ${mode.accent}50`,
                }}
              >
                Enter Now
              </Link>
              <Link
                href={CONTEST_ROUTES.rules}
                style={{
                  flex: 1, textAlign: "center", display: "block",
                  padding: "9px 0", borderRadius: 6,
                  border: `1px solid ${mode.accent}55`,
                  color: mode.accent,
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", textDecoration: "none",
                }}
              >
                Rules
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* RIGHT: mini lobby wall */}
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
              Live Lobby Wall
            </div>
            <Link
              href="/live"
              style={{ fontSize: 8, color: mode.accent, textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              All Rooms →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rooms.length > 0
              ? rooms.map((room, i) => (
                  <MiniRoomCard key={room.id} room={room} accent={mode.accent} capacity={25 - i * 3} />
                ))
              : Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 80, borderRadius: 10,
                      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmerLoading 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
          </div>

          {/* Room spawn notice */}
          <div
            style={{
              marginTop: 10, padding: "8px 10px", borderRadius: 6,
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.1)",
              fontSize: 8, color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.08em", lineHeight: 1.5,
            }}
          >
            Rooms auto-spawn when capacity is reached. Genre rotates after each round ends.
          </div>
        </div>
      </div>

      {/* ── Leaderboard teaser ── */}
      <div
        style={{
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Season standings · updated live
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={CONTEST_ROUTES.leaderboard} style={{ fontSize: 9, color: mode.accent, textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Leaderboard →
          </Link>
          <Link href={CONTEST_ROUTES.home} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            All Contests →
          </Link>
        </div>
      </div>
    </div>
  );
}

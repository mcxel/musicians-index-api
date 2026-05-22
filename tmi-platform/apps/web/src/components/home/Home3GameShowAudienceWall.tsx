"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TMILiveMediaWidget from "@/components/media/TMILiveMediaWidget";

// ─── Game show definitions ────────────────────────────────────────────────────

const GAME_SHOWS = [
  {
    id: "dealer-feud-1000",
    name: "Dealer Feud 1000",
    tagline: "Survey Says — Beat the Board!",
    href: "/live/rooms/dealer-feud-1000",
    accent: "#FFD700",
    icon: "🎯",
    audienceSize: 2400,
    prizePool: "$1,000",
    status: "LIVE",
    roomId: "dealer-feud-1000",
    performerId: "gameshow-dealer-feud",
    performerName: "Dealer Feud 1000",
    emotes: ["🔥", "💰", "🎯", "👑", "🎉"],
  },
  {
    id: "monthly-idol",
    name: "Monthly Idol",
    tagline: "America's Got Talent Meets Hip Hop",
    href: "/live/rooms/monthly-idol",
    accent: "#FF2DAA",
    icon: "⭐",
    audienceSize: 3100,
    prizePool: "$5,000",
    status: "LIVE",
    roomId: "monthly-idol",
    performerId: "gameshow-monthly-idol",
    performerName: "Monthly Idol",
    emotes: ["⭐", "🎤", "💃", "👏", "🌟"],
  },
  {
    id: "circles-and-squares",
    name: "Circles & Squares",
    tagline: "Trivia Meets Music Challenge",
    href: "/live/rooms/circles-and-squares",
    accent: "#AA2DFF",
    icon: "⬛",
    audienceSize: 1800,
    prizePool: "$1,000",
    status: "LIVE",
    roomId: "circles-and-squares",
    performerId: "gameshow-circles-squares",
    performerName: "Circles & Squares",
    emotes: ["🟣", "⬜", "🎲", "🧩", "🔮"],
  },
  {
    id: "monday-night-stage",
    name: "Monday Night Stage",
    tagline: "The Weekly Live Showcase",
    href: "/live/rooms/monday-night-stage",
    accent: "#00FFFF",
    icon: "🎶",
    audienceSize: 4200,
    prizePool: "$3,500",
    status: "NEXT MON",
    roomId: "monday-night-stage",
    performerId: "gameshow-monday-stage",
    performerName: "Monday Night Stage",
    emotes: ["🎶", "🎸", "🥁", "🎺", "🎵"],
  },
  {
    id: "world-dance-party",
    name: "World Dance Party",
    tagline: "60+ Countries. One Floor.",
    href: "/live/rooms/world-dance-party",
    accent: "#FF6B35",
    icon: "💃",
    audienceSize: 5800,
    prizePool: "$4,000",
    status: "LIVE",
    roomId: "world-dance-party",
    performerId: "gameshow-world-dance",
    performerName: "World Dance Party",
    emotes: ["💃", "🕺", "🌍", "🎊", "🌈"],
  },
  {
    id: "name-that-tune",
    name: "Name That Tune",
    tagline: "Guess Fast. Win Big.",
    href: "/live/rooms/name-that-tune",
    accent: "#00FF88",
    icon: "🎵",
    audienceSize: 2200,
    prizePool: "$1,500",
    status: "FRIDAY",
    roomId: "name-that-tune",
    performerId: "gameshow-name-that-tune",
    performerName: "Name That Tune",
    emotes: ["🎵", "🎼", "🎧", "💡", "🏆"],
  },
];

// ─── Floating avatar seat emotes ──────────────────────────────────────────────

type FloatingEmote = { id: number; emoji: string; x: number; delay: number; duration: number };

function AudienceSeatLayer({ emotes, accent }: { emotes: string[]; accent: string }) {
  const [floaters, setFloaters] = useState<FloatingEmote[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const emoji = emotes[Math.floor(Math.random() * emotes.length)]!;
      const id = Date.now() + Math.random();
      setFloaters((f) => [
        ...f.slice(-12),
        { id, emoji, x: 10 + Math.random() * 80, delay: 0, duration: 2.2 + Math.random() * 1.2 },
      ]);
    }, 800);
    return () => clearInterval(t);
  }, [emotes]);

  // Audience avatars (static seats)
  const seats = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 4 + (i % 6) * 16 + (Math.floor(i / 6) * 8),
    y: i < 6 ? 60 : 80,
    emoji: ["👤", "🎭", "🤩", "😮", "🙌", "🔥"][i % 6]!,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Audience seat row */}
      {seats.map((seat) => (
        <div
          key={seat.id}
          style={{
            position: "absolute",
            left: `${seat.x}%`,
            top: `${seat.y}%`,
            fontSize: 11,
            opacity: 0.55,
          }}
        >
          {seat.emoji}
        </div>
      ))}
      {/* Floating emotes */}
      <AnimatePresence>
        {floaters.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 0, x: `${f.x}%` }}
            animate={{ opacity: [0, 1, 1, 0], y: -70 }}
            transition={{ duration: f.duration, ease: "easeOut" }}
            onAnimationComplete={() => setFloaters((fl) => fl.filter((x) => x.id !== f.id))}
            style={{ position: "absolute", bottom: "15%", fontSize: 18, pointerEvents: "none" }}
          >
            {f.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
      {/* Glow overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
        background: `linear-gradient(to top, ${accent}18, transparent)`,
      }} />
    </div>
  );
}

// ─── Game show card ───────────────────────────────────────────────────────────

function GameShowCard({ show, featured }: { show: typeof GAME_SHOWS[0]; featured?: boolean }) {
  const isLive = show.status === "LIVE";

  return (
    <Link href={show.href} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${show.accent}44` }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: "relative",
          borderRadius: 14,
          overflow: "hidden",
          border: `1.5px solid ${show.accent}${isLive ? "66" : "33"}`,
          background: "linear-gradient(145deg, rgba(8,8,20,0.96), rgba(5,5,16,0.98))",
          minHeight: featured ? 300 : 220,
          cursor: "pointer",
        }}
      >
        {/* Live media window (audience view) */}
        <div style={{ height: featured ? 180 : 130, position: "relative", overflow: "hidden" }}>
          <TMILiveMediaWidget
            performerId={show.performerId}
            performerName={show.performerName}
            roomId={show.roomId}
            isLive={isLive}
            accentColor={show.accent}
            variant="homepage"
            size="full"
            showOverlay={false}
          />
          {/* Audience seat layer on top */}
          <AudienceSeatLayer emotes={show.emotes} accent={show.accent} />
          {/* "AUDIENCE VIEW" watermark */}
          <div style={{
            position: "absolute", top: 8, left: 8,
            fontSize: 7, fontWeight: 900, letterSpacing: "0.15em",
            background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.5)",
            borderRadius: 4, padding: "2px 6px", pointerEvents: "none",
          }}>
            AUDIENCE VIEW
          </div>
        </div>

        {/* Info panel */}
        <div style={{ padding: "14px 16px 16px" }}>
          {/* Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{show.icon}</span>
            {isLive ? (
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: show.accent, display: "inline-block", boxShadow: `0 0 8px ${show.accent}` }} />
                <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: show.accent }}>LIVE</span>
              </motion.div>
            ) : (
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>
                {show.status}
              </span>
            )}
          </div>

          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 4, letterSpacing: "0.02em" }}>
            {show.name}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
            {show.tagline}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 9, color: show.accent, fontWeight: 800 }}>
              👁 {show.audienceSize.toLocaleString()} watching
            </div>
            <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800 }}>
              🏆 {show.prizePool} prize
            </div>
          </div>

          {/* Join CTA */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: isLive ? show.accent : "rgba(255,255,255,0.08)",
              color: isLive ? (show.accent === "#FFD700" || show.accent === "#00FFFF" || show.accent === "#00FF88" ? "#000" : "#fff") : "rgba(255,255,255,0.5)",
              borderRadius: 8, padding: "8px 16px",
              fontSize: 9, fontWeight: 900, letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              boxShadow: isLive ? `0 0 16px ${show.accent}50` : "none",
              width: "100%",
            }}
          >
            {isLive ? "JOIN AUDIENCE →" : `REMIND ME — ${show.status}`}
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Prize winner flash ───────────────────────────────────────────────────────

const PRIZE_FLASHES = [
  { name: "DJ Kreach", prize: "$500", show: "Dealer Feud", emoji: "💰" },
  { name: "Nova Wave", prize: "Gold Pass", show: "Monthly Idol", emoji: "⭐" },
  { name: "Bass Republic", prize: "$250", show: "Name That Tune", emoji: "🎵" },
  { name: "Soul Fix", prize: "$1,000", show: "Circles & Squares", emoji: "🏆" },
  { name: "Lyrix Queen", prize: "Platinum Pass", show: "World Dance Party", emoji: "👑" },
];

function PrizeWinnerFlash() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % PRIZE_FLASHES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const flash = PRIZE_FLASHES[idx]!;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "linear-gradient(90deg, rgba(255,215,0,0.15), rgba(5,5,16,0.8))",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: 8, padding: "8px 16px",
          }}
        >
          <span style={{ fontSize: 18 }}>{flash.emoji}</span>
          <div>
            <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 900, letterSpacing: "0.1em" }}>
              JUST WON {flash.prize}
            </div>
            <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>
              {flash.name} — {flash.show}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Home3GameShowAudienceWall() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 6 }}>
            Game Shows &amp; Live Events — Audience View
          </div>
          <div style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 900, color: "#fff", letterSpacing: "0.04em", fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)" }}>
            SEE WHAT&apos;S HAPPENING INSIDE
          </div>
        </div>
        <PrizeWinnerFlash />
      </div>

      {/* Featured show (first) + grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <style>{`
          @media (max-width: 767px) {
            [data-home3-gameshows] {
              grid-template-columns: 1fr !important;
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            [data-home3-gameshows] {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
        <div data-home3-gameshows style={{ gridColumn: "1 / 2" }}>
          <GameShowCard show={GAME_SHOWS[0]!} featured />
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <GameShowCard show={GAME_SHOWS[1]!} />
          <GameShowCard show={GAME_SHOWS[2]!} />
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <GameShowCard show={GAME_SHOWS[3]!} />
          <GameShowCard show={GAME_SHOWS[4]!} />
        </div>
      </div>

      {/* 6th show — full width strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <GameShowCard show={GAME_SHOWS[5]!} />
        {/* "Be in the audience" CTA */}
        <Link href="/auth" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 0 50px #FF2DAA44" }}
            style={{
              borderRadius: 14,
              background: "linear-gradient(145deg, rgba(255,45,170,0.22), rgba(5,5,16,0.96))",
              border: "1.5px solid #FF2DAA55",
              minHeight: 220,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", padding: "32px 24px", cursor: "pointer", gap: 14,
            }}
          >
            <div style={{ fontSize: 36 }}>🎭</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)", letterSpacing: "0.04em" }}>
              BE IN THE AUDIENCE
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              Join live shows, use emotes, win prizes, and cheer your favorite artists in real time.
            </div>
            <motion.div
              animate={{ boxShadow: ["0 0 12px #FF2DAA40", "0 0 28px #FF2DAA90", "0 0 12px #FF2DAA40"] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: "#FF2DAA", color: "#fff",
                borderRadius: 8, padding: "12px 28px",
                fontSize: 11, fontWeight: 900, letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
              }}
            >
              JOIN FREE →
            </motion.div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}

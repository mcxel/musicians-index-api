"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Per-page rotating hype copy — contextual to each homepage surface.
// Bots can extend these banks over time.

const COPY_BANKS: Record<string, string[]> = {
  "home-1": [
    "👑 CROWN COVER DROPS THIS WEEK — WHO WILL WEAR IT?",
    "🔥 ISSUE 1 IS LIVE — THE COVER ARTIST IS BREAKING RECORDS",
    "⭐ FAN VOTE CLOSES SUNDAY MIDNIGHT — CAST YOURS NOW",
    "💥 THIS WEEK'S RANKED ARTIST IS TRENDING GLOBALLY",
    "🎤 NEW EDITORIAL DROP — SEE WHO'S BUZZING ON THE INDEX",
  ],
  "home-2": [
    "📡 ARTISTS ARE BROADCASTING LIVE RIGHT NOW — JOIN IN",
    "🎶 THE EDITORIAL IS HOT — SEE WHO'S BUZZING THIS WEEK",
    "🔴 MAIN LOBBY IS 84% FULL — SECURE YOUR SPOT",
    "⭐ NOVA WAVE IS ON THE COVER — READ THE FULL STORY",
    "💿 3 NEW ARTIST DROPS THIS WEEK ON TMI",
  ],
  "home-3": [
    "🏆 LAST WEEK'S WINNER: DJ KREACH — $500 CASH PRIZE",
    "🎯 DEALER FEUD 1000 IS LIVE NOW — WATCH THE AUDIENCE",
    "👁 WORLD DANCE PARTY: 5,800 FANS WATCHING LIVE",
    "🥊 MONTHLY IDOL FINALE THIS SATURDAY — GET YOUR SEAT",
    "🎉 WEEKLY CONTEST RESETS IN 14 HOURS — ENTER FREE",
  ],
  "home-4": [
    "💰 SPONSOR A LOCAL ARTIST FOR $25/MONTH — START TODAY",
    "🏪 YOUR STORE GETS SEEN BY THOUSANDS OF FANS DAILY",
    "🎯 ADVERTISE IN THE MAGAZINE — FROM $14.99/WEEK",
    "📣 10 LOCAL SPONSOR SLOTS AVAILABLE — GRAB YOURS NOW",
    "🤝 ARTISTS + SPONSORS = EVERYBODY WINS — JOIN THE CYCLE",
  ],
  "home-5": [
    "🎤 PUT YOUR SONG AGAINST THEIRS — ENTER THE CHALLENGE",
    "🥊 BATTLE OF THE BAND CHAMPIONSHIP DROPS THIS MONTH",
    "🎭 ALL STYLES WELCOME IN THE CYPHER — NO BEEF, JUST LOVE",
    "👑 WIN THE BELT, WIN THE PRIZE, WIN THE YEAR",
    "💥 ACTIVE BATTLES HAPPENING RIGHT NOW — VOTE FOR YOUR PICK",
  ],
};

type Props = {
  pageId: keyof typeof COPY_BANKS;
  intervalMs?: number;
  accent?: string;
};

export default function LiveMagazineVoiceTicker({ pageId, intervalMs = 5000, accent = "#00FFFF" }: Props) {
  const bank = COPY_BANKS[pageId] ?? COPY_BANKS["home-1"]!;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % bank.length), intervalMs);
    return () => clearInterval(t);
  }, [bank.length, intervalMs]);

  return (
    <div style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "6px 24px",
      overflow: "hidden",
      height: 34,
      display: "flex",
      alignItems: "center",
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: accent,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {bank[idx]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export type { Props as LiveMagazineVoiceTickerProps };

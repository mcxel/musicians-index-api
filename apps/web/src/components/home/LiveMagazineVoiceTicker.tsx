"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHome4PriceVoiceMessages,
  getPublicPriceAcquisitionTickerItems,
} from "@/lib/commerce/publicPriceAcquisitionMessages";

// Per-page rotating hype copy — price-led items come from canonical pricing authorities.

const COPY_BANKS: Record<string, string[]> = {
  "home-1": [
    ...getPublicPriceAcquisitionTickerItems().slice(0, 2),
    "👑 CROWN COVER DROPS THIS WEEK — WHO WILL WEAR IT?",
    "🔥 ISSUE 1 IS LIVE — THE COVER ARTIST IS BREAKING RECORDS",
    "⭐ FAN VOTE CLOSES SUNDAY MIDNIGHT — CAST YOURS NOW",
    "🎤 NEW EDITORIAL DROP — SEE WHO'S BUZZING ON THE INDEX",
  ],
  "home-2": [
    ...getPublicPriceAcquisitionTickerItems().slice(0, 2),
    "📡 ARTISTS ARE BROADCASTING LIVE RIGHT NOW — JOIN IN",
    "🎶 THE EDITORIAL IS HOT — SEE WHO'S BUZZING THIS WEEK",
    "⭐ NOVA WAVE IS ON THE COVER — READ THE FULL STORY",
    "💿 3 NEW ARTIST DROPS THIS WEEK ON TMI",
  ],
  "home-3": [
    ...getPublicPriceAcquisitionTickerItems(),
    "🥊 MONTHLY IDOL FINALE THIS SATURDAY — GET YOUR SEAT",
    "🎉 WEEKLY CONTEST RESETS IN 14 HOURS — ENTER FREE",
  ],
  "home-4": [
    ...getHome4PriceVoiceMessages(),
    "🏪 YOUR STORE GETS SEEN BY THOUSANDS OF FANS DAILY",
    "🤝 ARTISTS + SPONSORS = EVERYBODY WINS — JOIN THE CYCLE",
  ],
  "home-5": [
    ...getPublicPriceAcquisitionTickerItems().slice(0, 2),
    "🎤 PUT YOUR SONG AGAINST THEIRS — ENTER THE CHALLENGE",
    "🥊 BATTLE OF THE BAND CHAMPIONSHIP DROPS THIS MONTH",
    "🎭 ALL STYLES WELCOME IN THE CYPHER — NO BEEF, JUST LOVE",
    "👑 WIN THE BELT, WIN THE PRIZE, WIN THE YEAR",
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
  // framer-motion's <AnimatePresence> does its own DOM bookkeeping for
  // enter/exit that the SSR pass can't replicate, which was producing a
  // real "Text content does not match server-rendered HTML" hydration
  // mismatch (React #425/#422) on every load of this component. Render a
  // plain, static version (same text/styling, no motion wrapper) until
  // after mount — that's what SSR and the client's first paint both see,
  // so they match exactly — then upgrade to the animated version.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % bank.length), intervalMs);
    return () => clearInterval(t);
  }, [bank.length, intervalMs]);

  const textStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.12em",
    color: accent,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "6px 24px",
      overflow: "hidden",
      height: 34,
      display: "flex",
      alignItems: "center",
    }}>
      {mounted ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={textStyle}
          >
            {bank[idx] ?? bank[0] ?? "MAGAZINE • ISSUE 1 — SPECIAL EDITION"}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div style={textStyle}>{bank[idx] ?? bank[0] ?? "MAGAZINE • ISSUE 1 — SPECIAL EDITION"}</div>
      )}
    </div>
  );
}

export type { Props as LiveMagazineVoiceTickerProps };

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type BidSlot = {
  id: string;
  slotLabel: string;
  topBid: number;
  topBidder: string;
  spotsLeft: number;
  accent: string;
  weeklyRate: number;
};

const INITIAL_SLOTS: BidSlot[] = [
  { id: "hero",     slotLabel: "Hero Billboard",   topBid: 840,  topBidder: "Crown Energy",    spotsLeft: 1, accent: "#FFD700", weeklyRate: 2400 },
  { id: "featured", slotLabel: "Featured Slot",    topBid: 380,  topBidder: "SoundWave Audio", spotsLeft: 2, accent: "#00FFFF", weeklyRate: 850 },
  { id: "battle",   slotLabel: "Battle Badge",      topBid: 450,  topBidder: "BeatVault Pro",   spotsLeft: 2, accent: "#CC0000", weeklyRate: 1200 },
  { id: "cypher",   slotLabel: "Cypher Chip",       topBid: 210,  topBidder: "TMI Merch Hub",   spotsLeft: 3, accent: "#AA2DFF", weeklyRate: 650 },
  { id: "sidebar",  slotLabel: "Sidebar",           topBid: 95,   topBidder: "Open",            spotsLeft: 5, accent: "#00FF88", weeklyRate: 250 },
];

function fmtBid(n: number): string {
  return `$${n.toLocaleString()}`;
}

export default function SponsorBidBoard() {
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [flashId, setFlashId] = useState<string | null>(null);

  // Simulate live bid updates
  useEffect(() => {
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * INITIAL_SLOTS.length);
      const slot = INITIAL_SLOTS[idx];
      if (!slot) return;
      setSlots((prev) =>
        prev.map((s, i) =>
          i === idx ? { ...s, topBid: s.topBid + 10 + Math.floor(Math.random() * 40) } : s
        )
      );
      setFlashId(slot.id);
      setTimeout(() => setFlashId(null), 400);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6 }}>
        SPONSOR BID BOARD · LIVE
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {slots.map((slot) => (
          <motion.div
            key={slot.id}
            layout
            animate={{ background: flashId === slot.id ? `${slot.accent}18` : "rgba(0,0,0,0.35)" }}
            transition={{ duration: 0.3 }}
            style={{
              borderRadius: 8, border: `1px solid ${slot.accent}2a`,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "7px 10px", display: "flex", alignItems: "center", gap: 8 }}>
              {/* Slot label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 8, fontWeight: 900, color: "#fff" }}>{slot.slotLabel}</div>
                <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>
                  {slot.spotsLeft} spot{slot.spotsLeft !== 1 ? "s" : ""} left · {fmtBid(slot.weeklyRate)}/wk
                </div>
              </div>
              {/* Top bid */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <motion.div
                  key={slot.topBid}
                  initial={{ y: -4, opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  style={{ fontSize: 11, fontWeight: 900, color: slot.accent }}
                >
                  {fmtBid(slot.topBid)}
                </motion.div>
                <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)" }}>{slot.topBidder}</div>
              </div>
              {/* Bid pulse */}
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: slot.accent, flexShrink: 0 }}
              />
            </div>
            {/* Bid bar */}
            <motion.div
              animate={{ scaleX: Math.min(slot.topBid / slot.weeklyRate, 1) }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ height: 2, background: `linear-gradient(90deg, ${slot.accent}, transparent)`, transformOrigin: "left" }}
            />
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <Link href="/advertise" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              padding: "7px", borderRadius: 8, textAlign: "center",
              background: "linear-gradient(90deg, #FFD700, #FF6B35)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: "#000", textTransform: "uppercase" }}>
              ⚡ PLACE A BID
            </span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}

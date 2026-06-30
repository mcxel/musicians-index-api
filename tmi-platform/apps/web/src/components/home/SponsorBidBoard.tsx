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

function fmtBid(n: number): string {
  return `$${n.toLocaleString()}`;
}

export default function SponsorBidBoard() {
  const [slots, setSlots] = useState<BidSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sponsors/bid-board")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }
        setSlots(
          (data as Array<any>).map((slot) => ({
            id: slot.id ?? "unknown",
            slotLabel: slot.slotLabel ?? "Ad Slot",
            topBid: Math.round(slot.topBid ?? 0),
            topBidder: slot.topBidder ?? "Open",
            spotsLeft: slot.spotsLeft ?? 0,
            accent: slot.accent ?? "#FFD700",
            weeklyRate: Math.round(slot.weeklyRate ?? 0),
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6 }}>
        SPONSOR BID BOARD · {loading ? "LOADING" : slots.length === 0 ? "AVAILABLE" : "LIVE"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {loading ? (
          <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            Loading bid board...
          </div>
        ) : slots.length === 0 ? (
          <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            No active bids. Place the first bid below.
          </div>
        ) : (
          slots.map((slot) => (
            <motion.div
              key={slot.id}
              layout
              style={{
                borderRadius: 8, border: `1px solid ${slot.accent}2a`,
                background: "rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "7px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 900, color: "#fff" }}>{slot.slotLabel}</div>
                  <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>
                    {slot.spotsLeft} spot{slot.spotsLeft !== 1 ? "s" : ""} left · {fmtBid(slot.weeklyRate)}/wk
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: slot.accent }}>
                    {fmtBid(slot.topBid)}
                  </div>
                  <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)" }}>{slot.topBidder}</div>
                </div>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: slot.accent, flexShrink: 0 }}
                />
              </div>
              <motion.div
                animate={{ scaleX: Math.min(slot.topBid / slot.weeklyRate, 1) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ height: 2, background: `linear-gradient(90deg, ${slot.accent}, transparent)`, transformOrigin: "left" }}
              />
            </motion.div>
          ))
        )}
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

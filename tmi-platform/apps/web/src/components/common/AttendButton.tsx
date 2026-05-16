"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface AttendButtonProps {
  roomSlug: string;
  eventTitle?: string;
  isFree?: boolean;
  price?: string;
  compact?: boolean;
}

export default function AttendButton({ roomSlug, eventTitle, isFree = true, price, compact = false }: AttendButtonProps) {
  const [attending, setAttending] = useState(false);
  const [loading,   setLoading]   = useState(false);

  async function handleAttend() {
    if (attending) return;
    setLoading(true);
    try {
      if (!isFree) {
        window.location.href = `/api/stripe/checkout?product=TICKET_STANDARD&room=${roomSlug}`;
        return;
      }
      await fetch("/api/stage/attend", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body: JSON.stringify({ roomSlug }),
      });
      setAttending(true);
      setTimeout(() => { window.location.href = `/rooms/${roomSlug}`; }, 600);
    } finally {
      setLoading(false);
    }
  }

  const label = attending ? "HEADING IN ✓" : isFree ? "ATTEND FREE" : `ATTEND — ${price ?? "$5"}`;
  const color  = attending ? "#00FF88" : "#FF9500";

  return (
    <motion.button
      whileHover={{ scale: loading || attending ? 1 : 1.04 }}
      whileTap={{ scale: loading || attending ? 1 : 0.96 }}
      onClick={handleAttend}
      disabled={loading || attending}
      aria-label={`Attend ${eventTitle ?? roomSlug}`}
      style={{ display:"flex", alignItems:"center", gap:5, padding: compact ? "6px 12px" : "9px 18px", fontSize: compact ? 8 : 10, fontWeight:800, letterSpacing:"0.12em", color: attending ? "#050510" : "#fff", background: attending ? "#00FF88" : `rgba(255,149,0,0.12)`, border:`1px solid ${color}40`, borderRadius: compact ? 16 : 8, cursor: loading || attending ? "not-allowed" : "pointer" }}>
      🎟️ {label}
    </motion.button>
  );
}

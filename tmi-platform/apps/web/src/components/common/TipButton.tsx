"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIP_AMOUNTS = [
  { label:"$1",  cents:100 },
  { label:"$5",  cents:500 },
  { label:"$10", cents:1000 },
  { label:"$25", cents:2500 },
];

interface TipButtonProps {
  artistSlug: string;
  artistName?: string;
  compact?: boolean;
}

export default function TipButton({ artistSlug, artistName, compact = false }: TipButtonProps) {
  const [open,    setOpen]    = useState(false);
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);

  async function sendTip(cents: number) {
    setSending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product: "TIP", artistSlug, amount: cents }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setDone(true);
        setTimeout(() => { setDone(false); setOpen(false); }, 2000);
      }
    } finally {
      setSending(false);
    }
  }

  if (compact) {
    return (
      <a href={`/tip/${artistSlug}`}
        style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", fontSize:9, fontWeight:800, letterSpacing:"0.1em", color:"#FF2DAA", background:"rgba(255,45,170,0.08)", border:"1px solid rgba(255,45,170,0.2)", borderRadius:20, cursor:"pointer", textDecoration:"none" }}
        aria-label={`Tip ${artistName ?? artistSlug}`}>
        💸 TIP
      </a>
    );
  }

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <motion.button
        whileHover={{ scale:1.05 }}
        whileTap={{ scale:0.95 }}
        onClick={() => setOpen(o => !o)}
        aria-label={`Tip ${artistName ?? artistSlug}`}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", fontSize:10, fontWeight:800, letterSpacing:"0.12em", color:"#FF2DAA", background:"rgba(255,45,170,0.08)", border:"1px solid rgba(255,45,170,0.25)", borderRadius:8, cursor:"pointer" }}>
        💸 {done ? "SENT! ✓" : "TIP"}
      </motion.button>

      <AnimatePresence>
        {open && !done && (
          <motion.div
            initial={{ opacity:0, y:-8, scale:0.95 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.95 }}
            style={{ position:"absolute", top:"calc(100% + 8px)", left:0, zIndex:100, background:"#0a0b18", border:"1px solid rgba(255,45,170,0.25)", borderRadius:9, padding:10, display:"flex", gap:6, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
            {TIP_AMOUNTS.map(t => (
              <motion.button key={t.label} whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
                onClick={() => sendTip(t.cents)} disabled={sending}
                aria-label={`Tip ${t.label} to ${artistName ?? artistSlug}`}
                style={{ padding:"8px 12px", fontSize:11, fontWeight:900, color:"#fff", background:"rgba(255,45,170,0.12)", border:"1px solid rgba(255,45,170,0.2)", borderRadius:7, cursor:sending?"not-allowed":"pointer" }}>
                {t.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

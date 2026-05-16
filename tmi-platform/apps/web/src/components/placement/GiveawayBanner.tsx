"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface GiveawayBannerProps {
  eventId?: string;
  prize?: string;
  endsAt?: number;
  sponsorName?: string;
  isActive?: boolean;
}

export default function GiveawayBanner({ eventId = "current", prize = "TMI Season Pass", endsAt, sponsorName, isActive = true }: GiveawayBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isActive || dismissed) return null;

  const timeLeft = endsAt ? Math.max(0, endsAt - Date.now()) : null;
  const minsLeft = timeLeft ? Math.floor(timeLeft / 60000) : null;

  return (
    <AnimatePresence>
      <motion.div initial={{ y:-48, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:-48, opacity:0 }}
        style={{ position:"fixed", top:0, left:0, right:0, zIndex:500, background:"linear-gradient(90deg,#AA2DFF,#FF2DAA)", padding:"10px 16px", display:"flex", alignItems:"center", gap:12 }}>
        <motion.span animate={{ scale:[1,1.15,1] }} transition={{ duration:1.5, repeat:Infinity }} style={{ fontSize:18, flexShrink:0 }}>🎁</motion.span>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#fff", letterSpacing:"0.08em" }}>GIVEAWAY LIVE — </span>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.85)" }}>Win {prize}{sponsorName ? ` sponsored by ${sponsorName}` : ""}</span>
          {minsLeft !== null && <span style={{ fontSize:9, color:"rgba(255,255,255,0.6)", marginLeft:8 }}>{minsLeft}m left</span>}
        </div>
        <Link href={`/giveaway/${eventId}`} aria-label="Enter giveaway"
          style={{ padding:"6px 14px", fontSize:9, fontWeight:800, letterSpacing:"0.12em", color:"#AA2DFF", background:"#fff", borderRadius:5, textDecoration:"none", flexShrink:0 }}>
          ENTER NOW
        </Link>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss giveaway banner"
          style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:16, padding:"0 4px", flexShrink:0 }}>✕</button>
      </motion.div>
    </AnimatePresence>
  );
}

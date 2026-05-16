"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export type BillboardEntry = {
  id: string;
  type: "sponsor" | "advertiser" | "artist-spotlight" | "event-promo" | "game-promo";
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href: string;
  color: string;
  cta: string;
  priority: number;
};

// Seed/fallback billboard entries — replaced by live data from API
const SEED_ENTRIES: BillboardEntry[] = [
  { id:"s1", type:"artist-spotlight", title:"Ray Journey",      subtitle:"New single out now",    href:"/artists/ray-journey",    color:"#FF2DAA", cta:"LISTEN NOW",   priority:10, imageUrl:"" },
  { id:"s2", type:"event-promo",      title:"Monday Stage",     subtitle:"Live every Monday 8PM", href:"/rooms/monday-stage",     color:"#00FFFF", cta:"JOIN LIVE",    priority:9,  imageUrl:"" },
  { id:"s3", type:"game-promo",       title:"Name That Tune",   subtitle:"Win prizes weekly",     href:"/rooms/name-that-tune",   color:"#FFD700", cta:"PLAY NOW",     priority:8,  imageUrl:"" },
  { id:"s4", type:"sponsor",          title:"Sponsor Slot",     subtitle:"Your brand here",       href:"/spotlight",              color:"#AA2DFF", cta:"SPONSOR THIS", priority:1,  imageUrl:"" },
];

interface BillboardSlotProps {
  zone?: "homepage-top" | "homepage-belt" | "sidebar" | "room" | "article";
  autoRotate?: boolean;
  rotateIntervalMs?: number;
  compact?: boolean;
}

export default function BillboardSlot({ zone = "homepage-belt", autoRotate = true, rotateIntervalMs = 8000, compact = false }: BillboardSlotProps) {
  const [entries, setEntries] = useState<BillboardEntry[]>(SEED_ENTRIES);
  const [idx,     setIdx]     = useState(0);

  useEffect(() => {
    fetch(`/api/placements?zone=${zone}`)
      .then(r => r.json())
      .then((d: unknown) => {
        const data = d as { entries?: BillboardEntry[] };
        if (data.entries?.length) setEntries(data.entries);
      })
      .catch(() => {});
  }, [zone]);

  useEffect(() => {
    if (!autoRotate || entries.length <= 1) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % entries.length), rotateIntervalMs);
    return () => clearInterval(timer);
  }, [entries.length, autoRotate, rotateIntervalMs]);

  const entry = entries[idx];
  if (!entry) return null;

  if (compact) {
    return (
      <Link href={entry.href} aria-label={entry.title}
        style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", background:`${entry.color}12`, border:`1px solid ${entry.color}25`, borderRadius:8, textDecoration:"none" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, fontWeight:800, color:entry.color, letterSpacing:"0.1em" }}>{entry.title}</div>
          {entry.subtitle && <div style={{ fontSize:8, color:"rgba(255,255,255,0.4)" }}>{entry.subtitle}</div>}
        </div>
        <span style={{ fontSize:8, fontWeight:800, color:entry.color }}>{entry.cta} →</span>
      </Link>
    );
  }

  return (
    <div style={{ position:"relative", overflow:"hidden", borderRadius:10, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
      <AnimatePresence mode="wait">
        <motion.div key={entry.id}
          initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
          style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:`${entry.color}20`, border:`1px solid ${entry.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
            {entry.type === "artist-spotlight" ? "⭐" : entry.type === "event-promo" ? "🎭" : entry.type === "game-promo" ? "🎮" : "📣"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:10, fontWeight:900, color:entry.color, letterSpacing:"0.08em", textTransform:"uppercase" }}>{entry.title}</div>
            {entry.subtitle && <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{entry.subtitle}</div>}
          </div>
          <Link href={entry.href} aria-label={entry.cta}
            style={{ padding:"7px 13px", fontSize:8, fontWeight:800, letterSpacing:"0.12em", color:"#050510", background:`linear-gradient(135deg,${entry.color},${entry.color}AA)`, borderRadius:6, textDecoration:"none", whiteSpace:"nowrap", flexShrink:0 }}>
            {entry.cta} →
          </Link>
        </motion.div>
      </AnimatePresence>

      {entries.length > 1 && (
        <div style={{ display:"flex", gap:4, justifyContent:"center", paddingBottom:8 }}>
          {entries.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`Billboard slide ${i+1}`}
              style={{ width: i===idx ? 14 : 5, height:4, borderRadius:2, background: i===idx ? entry.color : "rgba(255,255,255,0.15)", border:"none", cursor:"pointer", transition:"all 0.3s" }} />
          ))}
        </div>
      )}
    </div>
  );
}

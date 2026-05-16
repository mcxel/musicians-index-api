"use client";
import { motion } from "framer-motion";

interface LiveBadgeProps {
  isLive?: boolean;
  room?: string;
  viewerCount?: number;
  size?: "sm" | "md" | "lg";
}

export default function LiveBadge({ isLive = false, room, viewerCount, size = "md" }: LiveBadgeProps) {
  if (!isLive) return null;

  const sizes = { sm:{ dot:6, text:7, pad:"2px 7px" }, md:{ dot:8, text:8, pad:"3px 9px" }, lg:{ dot:10, text:10, pad:"4px 12px" } };
  const s = sizes[size];

  return (
    <a href={room ?? "/live"} aria-label="Live now — click to join"
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:s.pad, background:"rgba(255,45,45,0.15)", border:"1px solid rgba(255,45,45,0.35)", borderRadius:20, textDecoration:"none", cursor:"pointer" }}>
      <motion.span
        animate={{ scale:[1,1.4,1], opacity:[1,0.5,1] }}
        transition={{ duration:1.2, repeat:Infinity }}
        style={{ display:"block", width:s.dot, height:s.dot, borderRadius:"50%", background:"#FF3C3C", flexShrink:0 }} />
      <span style={{ fontSize:s.text, fontWeight:800, letterSpacing:"0.15em", color:"#FF3C3C" }}>LIVE</span>
      {viewerCount !== undefined && (
        <span style={{ fontSize:s.text, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>{viewerCount}</span>
      )}
    </a>
  );
}

"use client";
import { motion } from "framer-motion";

interface XPBarProps {
  xp: number;
  xpToNext: number;
  level?: number;
  compact?: boolean;
}

export default function XPBar({ xp, xpToNext, level = 1, compact = false }: XPBarProps) {
  const pct = Math.min((xp / xpToNext) * 100, 100);

  if (compact) {
    return (
      <div title={`${xp} / ${xpToNext} XP — Level ${level}`} aria-label={`Level ${level}, ${xp} of ${xpToNext} XP`}
        style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontSize:8, fontWeight:900, color:"#FFD700", letterSpacing:"0.08em" }}>LV{level}</span>
        <div style={{ width:64, height:4, background:"rgba(255,213,0,0.15)", borderRadius:2, overflow:"hidden" }}>
          <motion.div initial={{ width:"0%" }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, ease:"easeOut" }}
            style={{ height:"100%", background:"linear-gradient(90deg,#FFD700,#FF9500)", borderRadius:2 }} />
        </div>
      </div>
    );
  }

  return (
    <div aria-label={`Level ${level}, ${xp} of ${xpToNext} XP`}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:8, fontWeight:900, color:"#FFD700", letterSpacing:"0.1em" }}>LEVEL {level}</span>
        <span style={{ fontSize:8, color:"rgba(255,213,0,0.6)" }}>{xp.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
      </div>
      <div style={{ width:"100%", height:6, background:"rgba(255,213,0,0.12)", borderRadius:3, overflow:"hidden" }}>
        <motion.div initial={{ width:"0%" }} animate={{ width:`${pct}%` }} transition={{ duration:0.9, ease:"easeOut" }}
          style={{ height:"100%", background:"linear-gradient(90deg,#FFD700,#FF9500,#FF2DAA)", borderRadius:3 }} />
      </div>
    </div>
  );
}

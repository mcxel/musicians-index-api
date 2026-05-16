"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SurpriseType = "gift" | "xp-bonus" | "crown" | "badge" | "merch" | "spotlight";

interface SurpriseOverlayProps {
  type?: SurpriseType;
  value?: string;
  from?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

const SURPRISE_CONFIG: Record<SurpriseType, { icon: string; color: string; title: string }> = {
  "gift":       { icon:"🎁", color:"#FF2DAA", title:"YOU GOT A GIFT!" },
  "xp-bonus":   { icon:"⭐", color:"#FFD700", title:"XP BONUS!" },
  "crown":      { icon:"👑", color:"#FFD700", title:"YOU EARNED A CROWN!" },
  "badge":      { icon:"🏅", color:"#00FFFF", title:"NEW BADGE UNLOCKED!" },
  "merch":      { icon:"👕", color:"#AA2DFF", title:"FREE MERCH DROP!" },
  "spotlight":  { icon:"✨", color:"#00FF88", title:"ARTIST SPOTLIGHT!" },
};

export default function SurpriseOverlay({ type = "gift", value, from, onClose, isOpen = true }: SurpriseOverlayProps) {
  const [visible, setVisible] = useState(isOpen);
  const cfg = SURPRISE_CONFIG[type];

  function close() {
    setVisible(false);
    onClose?.();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          onClick={close}
          style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <motion.div
            initial={{ scale:0.7, y:40 }} animate={{ scale:1, y:0 }} exit={{ scale:0.7, y:40 }}
            onClick={e => e.stopPropagation()}
            style={{ background:"#0a0b18", border:`1px solid ${cfg.color}40`, borderRadius:16, padding:"32px 28px", textAlign:"center", maxWidth:380, width:"100%", boxShadow:`0 0 60px ${cfg.color}30` }}>

            <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:0.6 }} style={{ fontSize:60, marginBottom:16 }}>{cfg.icon}</motion.div>

            <div style={{ fontSize:9, letterSpacing:"0.3em", color:cfg.color, fontWeight:800, marginBottom:8 }}>SURPRISE!</div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing:1, marginBottom:8 }}>{cfg.title}</div>
            {value && <div style={{ fontSize:14, fontWeight:700, color:cfg.color, marginBottom:6 }}>{value}</div>}
            {from && <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:20 }}>From {from}</div>}

            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={close}
              style={{ padding:"12px 28px", fontSize:10, fontWeight:800, letterSpacing:"0.15em", color:"#050510", background:`linear-gradient(135deg,${cfg.color},${cfg.color}AA)`, border:"none", borderRadius:8, cursor:"pointer" }}>
              CLAIM IT ✓
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

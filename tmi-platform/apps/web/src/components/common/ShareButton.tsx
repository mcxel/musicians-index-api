"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
  url?: string;
  title?: string;
  compact?: boolean;
}

export default function ShareButton({ url, title, compact = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open,   setOpen]   = useState(false);

  const shareUrl   = url   ?? (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title ?? "Check this out on TMI";

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
  }

  const itemStyle = { display:"flex", alignItems:"center", gap:8, padding:"8px 10px", fontSize:10, color:"rgba(255,255,255,0.7)", borderRadius:5, textDecoration:"none", cursor:"pointer", background:"none", border:"none", width:"100%" } as const;

  const platforms: Array<{ label: string; icon: string; href?: string; onClick?: () => void }> = [
    { label:"Twitter/X", icon:"𝕏",  href:`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}` },
    { label:"Facebook",  icon:"f",   href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label:"Email",     icon:"✉",   href:`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareTitle + '\n\n' + shareUrl)}` },
    { label:"Instagram — Copy",  icon:"IG", onClick: async () => { await navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`); setCopied(true); setOpen(false); setTimeout(() => setCopied(false), 2000); } },
    { label:"TikTok — Copy",     icon:"TT", onClick: async () => { await navigator.clipboard.writeText(`${shareTitle} 🎤 ${shareUrl}`); setCopied(true); setOpen(false); setTimeout(() => setCopied(false), 2000); } },
  ];

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <motion.button
        whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
        onClick={() => setOpen(o => !o)}
        aria-label="Share"
        style={{ display:"flex", alignItems:"center", gap:5, padding: compact ? "5px 10px" : "8px 14px", fontSize: compact ? 8 : 10, fontWeight:800, letterSpacing:"0.1em", color:"rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, cursor:"pointer" }}>
        ↗ {compact ? "" : "SHARE"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            style={{ position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:100, background:"#0a0b18", border:"1px solid rgba(255,255,255,0.10)", borderRadius:9, padding:10, minWidth:180, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
            {platforms.map(p => p.href ? (
              <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
                style={itemStyle} onClick={() => setOpen(false)}>
                <span style={{ width:18, textAlign:"center", fontWeight:900, fontSize:11 }}>{p.icon}</span>
                {p.label}
              </a>
            ) : (
              <button key={p.label} onClick={p.onClick} style={itemStyle}>
                <span style={{ width:18, textAlign:"center", fontWeight:900, fontSize:11 }}>{p.icon}</span>
                {p.label}
              </button>
            ))}
            <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"6px 0" }} />
            <button onClick={copyLink} aria-label="Copy link"
              style={{ ...itemStyle, color: copied ? "#00FF88" : "rgba(255,255,255,0.7)" }}>
              <span style={{ width:18, textAlign:"center" }}>{copied ? "✓" : "🔗"}</span>
              {copied ? "Copied!" : "Copy link"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

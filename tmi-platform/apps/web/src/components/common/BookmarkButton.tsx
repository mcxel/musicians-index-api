"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface BookmarkButtonProps {
  itemId: string;
  itemType: "article" | "artist" | "room" | "show";
  initialSaved?: boolean;
  compact?: boolean;
}

export default function BookmarkButton({ itemId, itemType, initialSaved = false, compact = false }: BookmarkButtonProps) {
  const [saved,   setSaved]   = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch("/api/rewards", {
        method: "POST",
        headers: { "content-type":"application/json" },
        body: JSON.stringify({ action: saved ? "unsave" : "save", itemId, itemType }),
      });
      setSaved(s => !s);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.1 }}
      whileTap={{ scale: loading ? 1 : 0.9 }}
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove bookmark" : "Bookmark this"}
      title={saved ? "Remove bookmark" : "Bookmark"}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", padding: compact ? "5px" : "8px", fontSize: compact ? 14 : 16, background: saved ? "rgba(255,213,0,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${saved ? "rgba(255,213,0,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius:8, cursor: loading ? "not-allowed" : "pointer", lineHeight:1 }}>
      {saved ? "🔖" : "🔖"}
      {!compact && <span style={{ marginLeft:5, fontSize:9, fontWeight:700, letterSpacing:"0.1em", color: saved ? "#FFD700" : "rgba(255,255,255,0.4)" }}>{saved ? "SAVED" : "SAVE"}</span>}
    </motion.button>
  );
}

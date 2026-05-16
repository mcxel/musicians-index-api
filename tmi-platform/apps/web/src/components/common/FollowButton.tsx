"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface FollowButtonProps {
  artistSlug: string;
  artistName?: string;
  initialFollowing?: boolean;
  compact?: boolean;
}

export default function FollowButton({ artistSlug, artistName, initialFollowing = false, compact = false }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading,   setLoading]   = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/artist/follow`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ artistSlug, action: following ? "unfollow" : "follow" }),
      });
      setFollowing(f => !f);
    } finally {
      setLoading(false);
    }
  }

  const label = following ? "FOLLOWING ✓" : "FOLLOW";
  const color = following ? "#00FF88" : "#00FFFF";

  return (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.05 }}
      whileTap={{ scale: loading ? 1 : 0.95 }}
      onClick={toggle}
      disabled={loading}
      aria-label={`${following ? "Unfollow" : "Follow"} ${artistName ?? artistSlug}`}
      style={{
        display:"flex", alignItems:"center", gap:5,
        padding: compact ? "5px 10px" : "9px 16px",
        fontSize: compact ? 8 : 10,
        fontWeight:800, letterSpacing:"0.12em",
        color: following ? "#050510" : color,
        background: following ? "#00FF88" : "rgba(0,255,255,0.08)",
        border:`1px solid ${color}40`,
        borderRadius: compact ? 16 : 8,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition:"all 0.2s",
      }}>
      {following ? "✓" : "+"} {label}
    </motion.button>
  );
}

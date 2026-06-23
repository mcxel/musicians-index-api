"use client";

import { useState, useCallback } from "react";

export interface FollowButtonProps {
  targetUserId: string;
  targetName: string;
  initialFollowing?: boolean;
  initialFollowers?: number;
  /** Compact pill vs full button */
  variant?: "pill" | "button" | "icon";
  onFollowChange?: (following: boolean) => void;
  accent?: string;
}

export default function FollowButton({
  targetUserId,
  targetName,
  initialFollowing = false,
  initialFollowers = 0,
  variant = "button",
  onFollowChange,
  accent = "#FF2DAA",
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const next = !following;

    // Optimistic update
    setFollowing(next);
    setFollowers((f) => f + (next ? 1 : -1));
    onFollowChange?.(next);

    try {
      await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: targetUserId, action: next ? "follow" : "unfollow" }),
      });
    } catch {
      // Revert on network failure
      setFollowing(!next);
      setFollowers((f) => f + (next ? -1 : 1));
      onFollowChange?.(!next);
    } finally {
      setLoading(false);
    }
  }, [following, loading, targetUserId, onFollowChange]);

  const label = following ? (hovered ? "Unfollow" : "Following") : `Follow ${targetName}`;
  const bg    = following ? (hovered ? "rgba(255,68,68,0.15)" : "rgba(255,255,255,0.06)") : accent;
  const color = following ? (hovered ? "#ff6666"              : "rgba(255,255,255,0.7)")  : "#fff";
  const border= following ? `1px solid ${hovered ? "#ff666644" : "rgba(255,255,255,0.15)"}` : "none";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        title={following ? `Unfollow ${targetName}` : `Follow ${targetName}`}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: following ? `${accent}22` : "rgba(255,255,255,0.07)",
          border: `1px solid ${following ? accent + "55" : "rgba(255,255,255,0.1)"}`,
          fontSize: 16, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {following ? "✓" : "+"}
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "4px 14px", borderRadius: 20,
          background: bg, border, color,
          fontSize: 11, fontWeight: 800, cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1, transition: "all 0.2s",
          letterSpacing: "0.04em",
        }}
      >
        {following ? (hovered ? "− Unfollow" : "✓ Following") : `+ Follow`}
        {followers > 0 && (
          <span style={{ marginLeft: 6, opacity: 0.5, fontWeight: 400 }}>
            {followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : followers}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "9px 22px", borderRadius: 9,
        background: bg, border, color,
        fontSize: 12, fontWeight: 800, cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.6 : 1, transition: "all 0.2s",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}
    >
      {loading ? "…" : label}
    </button>
  );
}

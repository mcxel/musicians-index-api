"use client";

import { useState } from "react";
import type { FeedbackReaction } from "@/lib/economy/StreamAndWinEngine";

interface SongFeedbackOrbProps {
  songId: string;
  accentColor?: string;
  onReact: (songId: string, reaction: FeedbackReaction) => void;
}

const REACTIONS: { reaction: FeedbackReaction; label: string; emoji: string; color: string }[] = [
  { reaction: "hard",     label: "Hard",       emoji: "🔥", color: "#FF2DAA" },
  { reaction: "replay",   label: "Replay",     emoji: "🎧", color: "#00C8FF" },
  { reaction: "original", label: "Original",   emoji: "💡", color: "#FFD700" },
  { reaction: "skip",     label: "Not for me", emoji: "❌", color: "#555" },
];

export default function SongFeedbackOrb({ songId, accentColor = "#00C8FF", onReact }: SongFeedbackOrbProps) {
  const [selected, setSelected] = useState<FeedbackReaction | null>(null);

  function handleReact(reaction: FeedbackReaction) {
    setSelected(reaction);
    onReact(songId, reaction);
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 6,
      padding: "8px 0",
    }}>
      {REACTIONS.map(r => {
        const isSelected = selected === r.reaction;
        return (
          <button
            key={r.reaction}
            onClick={() => handleReact(r.reaction)}
            disabled={selected !== null}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              background: isSelected ? `${r.color}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${isSelected ? r.color : "rgba(255,255,255,0.08)"}`,
              color: isSelected ? r.color : "rgba(255,255,255,0.6)",
              fontFamily: "'Inter',sans-serif",
              fontSize: 11,
              fontWeight: isSelected ? 800 : 500,
              cursor: selected ? "default" : "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ fontSize: 14 }}>{r.emoji}</span>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

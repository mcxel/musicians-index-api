"use client";

import { useState } from "react";
import { memoryModalStore } from "@/lib/memory/useMemoryModalStore";
import type { MemoryItem } from "@/types/memory";

interface Props {
  item: MemoryItem;
}

export default function AvatarPocketReveal({ item }: Props) {
  const [digging, setDigging] = useState(false);

  function handleReveal() {
    if (digging) return;
    setDigging(true);
    // Brief "dig" delay before fullscreen pop
    setTimeout(() => {
      memoryModalStore.open(item);
      setDigging(false);
    }, 650);
  }

  return (
    <button
      onClick={handleReveal}
      disabled={digging}
      style={{
        background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
        padding: "7px 12px", color: "rgba(255,255,255,0.7)", fontSize: 11, cursor: digging ? "not-allowed" : "pointer",
        letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6,
        animation: digging ? "tmiPocketDig 0.65s ease" : "none",
        transition: "opacity 0.2s",
        opacity: digging ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: 16, display: "inline-block", animation: digging ? "tmiPocketShake 0.65s ease" : "none" }}>
        🎒
      </span>
      {digging ? "Grabbing..." : "Show Item"}
      <style>{`
        @keyframes tmiPocketDig {
          0% { transform: scale(1); }
          30% { transform: scale(1.08) rotate(-4deg); }
          60% { transform: scale(1.04) rotate(2deg); }
          100% { transform: scale(1); }
        }
        @keyframes tmiPocketShake {
          0%,100% { transform: translateY(0); }
          25% { transform: translateY(-3px) rotate(-8deg); }
          75% { transform: translateY(2px) rotate(6deg); }
        }
      `}</style>
    </button>
  );
}

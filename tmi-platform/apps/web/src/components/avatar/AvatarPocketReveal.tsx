"use client";

import { useState } from "react";
import { memoryModalStore } from "@/lib/memory/useMemoryModalStore";
import type { AnyMemoryItem } from "@/types/memory";

interface Props {
  item: AnyMemoryItem;
  /** For business users — uses smoother "presentation" animation */
  mode?: "performer" | "business";
}

export default function AvatarPocketReveal({ item, mode = "performer" }: Props) {
  const [digging, setDigging] = useState(false);
  const isBusiness = mode === "business";

  function handleReveal() {
    if (digging) return;
    setDigging(true);
    setTimeout(() => {
      memoryModalStore.open(item);
      setDigging(false);
    }, isBusiness ? 400 : 650);
  }

  const label = item.itemType === "pro-legacy"
    ? (digging ? "Presenting..." : "Show Impact")
    : (digging ? "Grabbing..." : "Show Item");

  return (
    <button
      onClick={handleReveal}
      disabled={digging}
      style={{
        background: isBusiness ? "rgba(0,200,255,0.06)" : "none",
        border: `1px solid ${isBusiness ? "rgba(0,200,255,0.3)" : "rgba(255,255,255,0.15)"}`,
        borderRadius: 8,
        padding: "7px 14px",
        color: isBusiness ? "#00FFFF" : "rgba(255,255,255,0.7)",
        fontSize: 11,
        cursor: digging ? "not-allowed" : "pointer",
        letterSpacing: "0.08em",
        display: "flex", alignItems: "center", gap: 6,
        animation: digging && !isBusiness ? "tmiPocketDig 0.65s ease" : "none",
        transition: "opacity 0.2s",
        opacity: digging ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: 16, display: "inline-block", animation: digging ? (isBusiness ? "tmiBusinessReveal 0.4s ease" : "tmiPocketShake 0.65s ease") : "none" }}>
        {isBusiness ? "💼" : "🎒"}
      </span>
      {label}
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
        @keyframes tmiBusinessReveal {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </button>
  );
}

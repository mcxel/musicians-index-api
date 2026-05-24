"use client";

import { useEffect, useRef, useState } from "react";
import type { MemoryItem } from "@/lib/profiles/MemoryWallEngine";
import type { MemoryCardLayout } from "@/lib/profiles/MemoryLayoutGenerator";
import { getAmbientAudioEngine } from "@/lib/audio/AmbientAudioEngine";

const ICONS: Record<string, string> = {
  photo:           "🖼",
  video:           "🎥",
  screenshot:      "📸",
  achievement:     "🏆",
  "ticket-stub":   "🎫",
  "battle-win":    "⚔️",
  "cypher-moment": "🎤",
  "meet-and-greet":"🤝",
  "event-attendance":"🎪",
  merchandise:     "👕",
  nft:             "💎",
  sponsored:       "💼",
};

const ACCENT: Record<string, string> = {
  photo:           "#00FFFF",
  video:           "#FF2DAA",
  screenshot:      "#AA2DFF",
  achievement:     "#FFD700",
  "ticket-stub":   "#00FF88",
  "battle-win":    "#FF4444",
  "cypher-moment": "#FF8800",
  "meet-and-greet":"#00FFFF",
  "event-attendance":"#AA2DFF",
  merchandise:     "#FF2DAA",
  nft:             "#FFD700",
  sponsored:       "rgba(255,215,0,0.7)",
};

let cssInjected = false;
const CSS = `
@keyframes memCardFloat {
  0%,100% { transform-origin: center; }
  50%      { margin-top: -3px; }
}
@keyframes memPinPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
  50%      { box-shadow: 0 0 0 6px rgba(255,215,0,0.25); }
}
`;

interface MemoryCardProps {
  memory: MemoryItem;
  layout: MemoryCardLayout;
  onLike?: (id: string) => void;
  onPin?: (id: string) => void;
}

const DWELL_MS = 1400;

export default function MemoryCard({ memory, layout, onLike, onPin }: MemoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const [localLikes, setLocalLikes] = useState(memory.likes);
  const dwellRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellingRef = useRef(false);
  const accent = ACCENT[memory.contentType] ?? "#00FFFF";
  const icon   = ICONS[memory.contentType]  ?? "📌";

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const handleMouseEnter = () => {
    setHovered(true);
    const engine = getAmbientAudioEngine();
    if (engine) engine.triggerMemoryAudio(false); // preview vol
    dwellRef.current = setTimeout(() => {
      dwellingRef.current = true;
      if (engine) engine.triggerMemoryAudio(true); // full dwell vol
    }, DWELL_MS);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (dwellRef.current) clearTimeout(dwellRef.current);
    dwellingRef.current = false;
    const engine = getAmbientAudioEngine();
    if (engine) engine.releaseMemoryAudio();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalLikes(p => p + 1);
    onLike?.(memory.memoryId);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.(memory.memoryId);
  };

  const transform = `
    rotate(${layout.rotation}deg)
    scale(${hovered ? layout.scale * 1.08 : layout.scale})
  `;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position:   "absolute",
        left:       layout.x,
        top:        layout.y,
        width:      layout.cardWidth,
        height:     layout.cardHeight,
        zIndex:     hovered ? 999 : layout.zIndex,
        transform,
        transition: "transform 0.25s cubic-bezier(.22,.61,.36,1), box-shadow 0.25s ease",
        borderRadius: 10,
        overflow:   "hidden",
        cursor:     "pointer",
        background: `linear-gradient(145deg, rgba(12,8,28,0.92), rgba(6,4,18,0.97))`,
        border:     `1px solid ${hovered ? accent : "rgba(255,255,255,0.08)"}`,
        boxShadow:  hovered
          ? `0 8px 40px rgba(0,0,0,0.7), 0 0 20px ${accent}22`
          : layout.isPinned
            ? `0 0 0 2px ${accent}66`
            : "0 4px 18px rgba(0,0,0,0.5)",
        animation: layout.isPinned ? "memPinPulse 3s ease-in-out infinite" : undefined,
      }}
    >
      {/* Background fill / thumbnail placeholder */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 30% 30%, ${accent}18, transparent 60%)`,
      }} />

      {/* Actual media when URL exists */}
      {memory.contentUrl && memory.contentType === "photo" && (
        <img
          src={memory.contentUrl}
          alt={memory.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
        />
      )}
      {memory.contentUrl && memory.contentType === "video" && (
        <video
          src={memory.contentUrl}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
          muted
          loop
          playsInline
          autoPlay={hovered}
        />
      )}

      {/* Center icon when no media URL */}
      {!memory.contentUrl && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 42,
          opacity: 0.4,
        }}>
          {icon}
        </div>
      )}

      {/* Pinned crown */}
      {layout.isPinned && (
        <div style={{
          position: "absolute", top: 8, left: 8,
          fontSize: 11, color: "#FFD700", fontWeight: 900,
          letterSpacing: "0.05em",
        }}>
          📌
        </div>
      )}

      {/* Sponsored badge */}
      {layout.isSponsored && (
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          fontSize: 8, color: "rgba(255,215,0,0.6)", fontWeight: 800,
          letterSpacing: "0.1em", background: "rgba(0,0,0,0.6)", borderRadius: 4,
          padding: "2px 6px",
        }}>
          SPONSORED
        </div>
      )}

      {/* Hover overlay */}
      {hovered && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "12px 12px 10px",
        }}>
          <div style={{ fontSize: 10, color: accent, fontWeight: 900, letterSpacing: "0.1em", marginBottom: 3 }}>
            {icon} {memory.contentType.toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
            {memory.title}
          </div>
          {memory.description && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8, lineHeight: 1.4 }}>
              {memory.description}
            </div>
          )}
          {layout.isSponsored && memory.ctaLabel && (
            <div style={{
              fontSize: 10, fontWeight: 800, color: "#FFD700",
              marginBottom: 8, letterSpacing: "0.08em",
            }}>
              {memory.ctaLabel}
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleLike}
              style={{
                padding: "4px 10px", fontSize: 10, fontWeight: 800,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6, color: "rgba(255,255,255,0.7)", cursor: "pointer",
              }}
            >
              ❤ {localLikes}
            </button>
            {onPin && (
              <button
                onClick={handlePin}
                style={{
                  padding: "4px 10px", fontSize: 10, fontWeight: 800,
                  background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)",
                  borderRadius: 6, color: "rgba(255,215,0,0.7)", cursor: "pointer",
                }}
              >
                {layout.isPinned ? "Unpin" : "Pin"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

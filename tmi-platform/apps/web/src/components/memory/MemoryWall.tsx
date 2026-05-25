"use client";

import { useState } from "react";
import type { MemoryItem } from "@/types/memory";
import AvatarPocketReveal from "@/components/avatar/AvatarPocketReveal";
import { useMemoryModalStore } from "@/lib/memory/useMemoryModalStore";

// Deterministic rotation/offset per item so layout is stable
function getItemStyle(index: number): React.CSSProperties {
  const rotations = [-3, 1.5, -1, 2.5, -2, 0.8, -1.8, 2, -0.5, 1.2];
  const rotation = rotations[index % rotations.length] ?? 0;
  return {
    transform: `rotate(${rotation}deg)`,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };
}

const KIND_ICON: Record<MemoryItem["kind"], string> = {
  polaroid: "📸",
  ticket: "🎟️",
  nft: "◈",
  prize: "🏆",
  "video-clip": "🎬",
  badge: "🌟",
  "event-poster": "🎭",
};

const KIND_ACCENT: Record<MemoryItem["kind"], string> = {
  polaroid: "#FF2DAA",
  ticket: "#00FF88",
  nft: "#38bdf8",
  prize: "#FFD700",
  "video-clip": "#FF6B35",
  badge: "#AA2DFF",
  "event-poster": "#00FFFF",
};

interface Props {
  items: MemoryItem[];
  title?: string;
}

export default function MemoryWall({ items, title = "MEMORY WALL" }: Props) {
  const { last, open } = useMemoryModalStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const lastMemory = last?.itemType === "memory" ? last.item : null;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px", color: "rgba(255,255,255,0.25)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
        <p style={{ fontSize: 13, margin: 0 }}>No memories yet. Attend events, buy tickets, or capture live moments.</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800 }}>{title}</div>
        {last && (
          <button
            onClick={() => open(last)}
            style={{ background: "none", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 6, padding: "4px 12px", color: "rgba(255,255,255,0.4)", fontSize: 9, cursor: "pointer", letterSpacing: "0.1em" }}
          >
            🔁 VIEW LAST
          </button>
        )}
      </div>

      {/* Collage grid — magazine wall feel */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 20,
        padding: "4px 0 24px",
      }}>
        {items.map((item, i) => {
          const accent = KIND_ACCENT[item.kind] ?? "#00FFFF";
          const icon = KIND_ICON[item.kind] ?? "🎤";
          const isHovered = hoveredId === item.id;
          const isPolaroid = item.kind === "polaroid";

          return (
            <div
              key={item.id}
              style={{
                ...getItemStyle(i),
                cursor: "pointer",
                ...(isHovered ? { transform: "rotate(0deg) scale(1.05)", boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 0 2px ${accent}55` } : {}),
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => open({ itemType: "memory", item })}
            >
              {/* Polaroid-style card */}
              <div style={{
                background: isPolaroid ? "#fff" : "rgba(255,255,255,0.04)",
                borderRadius: isPolaroid ? 2 : 10,
                border: isPolaroid ? "none" : `1px solid ${accent}22`,
                padding: isPolaroid ? "10px 10px 36px" : "12px",
                boxShadow: isPolaroid ? "0 6px 20px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.4)",
              }}>
                {/* Image or placeholder */}
                <div style={{
                  width: "100%",
                  paddingBottom: "100%",
                  position: "relative",
                  background: item.mediaUrl ? "transparent" : `linear-gradient(135deg,${accent}14,rgba(5,5,16,0.8))`,
                  borderRadius: isPolaroid ? 1 : 6,
                  overflow: "hidden",
                }}>
                  {item.mediaUrl ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <span style={{ fontSize: 32 }}>{icon}</span>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div style={{ marginTop: isPolaroid ? 8 : 10, textAlign: isPolaroid ? "center" : "left" }}>
                  <p style={{ margin: 0, fontSize: isPolaroid ? 11 : 12, fontWeight: 900, color: isPolaroid ? "#333" : "#fff", lineHeight: 1.3, fontFamily: isPolaroid ? "Georgia, serif" : "inherit" }}>
                    {item.title}
                  </p>
                  {item.date && (
                    <p style={{ margin: "3px 0 0", fontSize: 9, color: isPolaroid ? "#999" : "rgba(255,255,255,0.4)" }}>
                      {item.date}
                    </p>
                  )}
                </div>
              </div>

              {/* Kind chip below card */}
              {!isPolaroid && (
                <div style={{
                  marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 8, color: accent, letterSpacing: "0.15em", fontWeight: 800,
                }}>
                  {icon} {item.kind.toUpperCase().replace("-", " ")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Replay button for last memory item */}
      {lastMemory && (
        <div style={{
          position: "fixed", bottom: 90, right: 18, zIndex: 900,
          background: "linear-gradient(135deg,#0a0818,#1a0a2e)",
          border: "1px solid rgba(255,45,170,0.3)",
          borderRadius: 10, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }} onClick={() => open({ itemType: "memory", item: lastMemory })}>
          <span style={{ fontSize: 18 }}>{KIND_ICON[lastMemory.kind]}</span>
          <div>
            <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.15em", color: "#FF2DAA", fontWeight: 800 }}>LAST ITEM</p>
            <p style={{ margin: 0, fontSize: 11, color: "#fff", fontWeight: 700 }}>{lastMemory.title}</p>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>🔁</span>
        </div>
      )}
    </div>
  );
}

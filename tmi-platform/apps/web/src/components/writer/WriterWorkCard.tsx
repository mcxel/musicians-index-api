"use client";

import type { WriterWorkItem } from "@/types/memory";

const KIND_ICON: Record<WriterWorkItem["kind"], string> = {
  article: "📰", interview: "🎙️", review: "⭐", feature: "✨",
  "past-work": "📂", image: "🖼️", draft: "✏️", assignment: "💼",
};

const KIND_COLOR: Record<WriterWorkItem["kind"], string> = {
  article: "#FF2DAA", interview: "#00FFFF", review: "#FFD700", feature: "#AA2DFF",
  "past-work": "#FFA500", image: "#00FF88", draft: "#94a3b8", assignment: "#00FFFF",
};

// Deterministic rotation — same item always tilts the same way
function cardRotation(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return ((h % 7) - 3) * 0.6;
}

interface Props {
  item: WriterWorkItem;
  onClick?: () => void;
}

export default function WriterWorkCard({ item, onClick }: Props) {
  const accent = KIND_COLOR[item.kind] ?? "#FF2DAA";
  const icon   = KIND_ICON[item.kind] ?? "📄";
  const rot    = cardRotation(item.id);
  const m      = item.metrics;

  const isClipping = item.kind === "article" || item.kind === "interview" || item.kind === "feature" || item.kind === "review";

  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        display: "block",
        cursor: "pointer",
        transform: `rotate(${rot}deg)`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transformOrigin: "center center",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "rotate(0deg) scale(1.04)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${accent}44`;
        (e.currentTarget as HTMLElement).style.zIndex = "10";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = `rotate(${rot}deg) scale(1)`;
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.zIndex = "1";
      }}
    >
      {/* Card face — clipping vs portfolio */}
      <div style={{
        width: 180,
        background: isClipping ? "#f5f0e8" : "#0d0c1f",
        border: isClipping ? "1px solid #d4c9b0" : `1px solid ${accent}33`,
        borderRadius: isClipping ? 2 : 10,
        overflow: "hidden",
        boxShadow: isClipping
          ? "2px 3px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)"
          : `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px ${accent}18`,
        fontFamily: isClipping ? "'Georgia', serif" : "sans-serif",
        position: "relative",
      }}>
        {/* Tape strip — only for clippings */}
        {isClipping && (
          <div style={{
            position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
            width: 40, height: 16,
            background: "rgba(200,190,160,0.55)",
            border: "1px solid rgba(180,170,140,0.4)",
            borderRadius: 1,
          }} />
        )}

        {/* Category badge */}
        <div style={{
          padding: isClipping ? "14px 12px 4px" : "12px 12px 4px",
          borderBottom: isClipping ? "1px solid rgba(0,0,0,0.08)" : `1px solid ${accent}22`,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.2em",
            color: isClipping ? "#8a7a5a" : accent,
            fontFamily: "sans-serif",
            textTransform: "uppercase",
          }}>
            {item.kind.replace("-", " ")}
          </span>
          {item.verified && (
            <span style={{ marginLeft: "auto", fontSize: 8, color: isClipping ? "#4a7c4a" : "#00FF88", fontFamily: "sans-serif" }}>✓</span>
          )}
        </div>

        {/* Title */}
        <div style={{ padding: "8px 12px 6px" }}>
          <div style={{
            fontSize: 11,
            fontWeight: isClipping ? 700 : 800,
            color: isClipping ? "#1a1208" : "#fff",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {item.title}
          </div>
          {item.publication && (
            <div style={{ marginTop: 4, fontSize: 8, color: isClipping ? "#8a7a5a" : "rgba(255,255,255,0.35)", fontFamily: "sans-serif", letterSpacing: "0.08em" }}>
              {item.publication}
            </div>
          )}
        </div>

        {/* Metrics strip */}
        {m && (m.views != null || m.paidAmount != null) && (
          <div style={{
            padding: "6px 12px 10px",
            borderTop: isClipping ? "1px solid rgba(0,0,0,0.07)" : `1px solid ${accent}18`,
            display: "flex", gap: 10,
          }}>
            {m.views != null && (
              <div style={{ fontSize: 9, color: isClipping ? "#6a5a3a" : "rgba(255,255,255,0.45)", fontFamily: "sans-serif" }}>
                👁 {m.views >= 1000 ? `${(m.views / 1000).toFixed(1)}k` : m.views}
              </div>
            )}
            {m.paidAmount != null && (
              <div style={{ fontSize: 9, color: isClipping ? "#3a6a3a" : "#00FF88", fontWeight: 700, fontFamily: "sans-serif" }}>
                ${m.paidAmount}
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

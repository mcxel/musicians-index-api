"use client";

import { useEffect } from "react";
import { useMemoryModalStore } from "@/lib/memory/useMemoryModalStore";
import type { MemoryItem } from "@/types/memory";

const KIND_ICON: Record<MemoryItem["kind"], string> = {
  polaroid: "📸",
  ticket: "🎟️",
  nft: "◈",
  prize: "🏆",
  "video-clip": "🎬",
  badge: "🌟",
  "event-poster": "🎭",
};

export default function MemoryItemModal() {
  const { item, isOpen, close } = useMemoryModalStore();

  // Auto-close after 7 seconds
  useEffect(() => {
    if (!isOpen || !item) return;
    const t = setTimeout(close, 7000);
    return () => clearTimeout(t);
  }, [isOpen, item, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  if (!isOpen || !item) return null;

  const icon = KIND_ICON[item.kind] ?? "🎤";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(5,5,16,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(12px)",
        animation: "tmiModalFadeIn 0.25s ease",
      }}
      onClick={close}
    >
      <div
        style={{
          maxWidth: "min(90vw, 600px)", width: "100%",
          animation: "tmiModalSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Polaroid frame */}
        <div style={{
          background: "#fff",
          borderRadius: 4,
          padding: item.kind === "polaroid" ? "14px 14px 48px" : "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)",
          transform: `rotate(${Math.random() > 0.5 ? 1.5 : -1.5}deg)`,
        }}>
          {item.mediaUrl ? (
            item.kind === "video-clip" ? (
              <video
                src={item.mediaUrl}
                autoPlay
                controls
                style={{ width: "100%", display: "block", borderRadius: 2 }}
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.title}
                style={{ width: "100%", display: "block", borderRadius: 2, maxHeight: "60vh", objectFit: "contain" }}
              />
            )
          ) : (
            <div style={{
              height: 300, background: "linear-gradient(135deg,#0a0818,#1a0a2e)",
              borderRadius: 2, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <span style={{ fontSize: 64 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>{item.title}</span>
            </div>
          )}
          {item.kind === "polaroid" && (
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "#333", textAlign: "center", fontFamily: "Georgia, serif" }}>
              {item.title}
            </p>
          )}
        </div>

        {/* Caption below polaroid */}
        {item.kind !== "polaroid" && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#fff" }}>{icon} {item.title}</p>
            {item.subtitle && <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{item.subtitle}</p>}
            {item.date && <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{item.date}</p>}
          </div>
        )}

        <button
          onClick={close}
          style={{
            display: "block", margin: "18px auto 0", padding: "8px 24px",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          CLOSE ✕
        </button>
      </div>

      <style>{`
        @keyframes tmiModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tmiModalSlideUp { from { opacity: 0; transform: scale(0.85) rotate(-3deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
      `}</style>
    </div>
  );
}

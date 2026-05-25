"use client";

import { useEffect } from "react";
import { useMemoryModalStore } from "@/lib/memory/useMemoryModalStore";
import type { MemoryItem, ProLegacyItem } from "@/types/memory";

const KIND_ICON: Record<MemoryItem["kind"], string> = {
  polaroid: "📸",
  ticket: "🎟️",
  nft: "◈",
  prize: "🏆",
  "video-clip": "🎬",
  badge: "🌟",
  "event-poster": "🎭",
};

function ProLegacyView({ item, close }: { item: ProLegacyItem; close: () => void }) {
  const m = item.metricImpact;
  const kindLabel: Record<ProLegacyItem["kind"], string> = {
    "sponsor-gift": "🤝 Sponsorship Impact",
    "advertiser-milestone": "📢 Advertiser Milestone",
    "promoter-win": "🎟️ Promoter Win",
    "crowd-favorite": "👥 Crowd Favorite",
  };

  return (
    <div style={{ maxWidth: "min(90vw, 520px)", width: "100%" }} onClick={(e) => e.stopPropagation()}>
      {/* Holographic card */}
      <div style={{
        background: "linear-gradient(135deg,rgba(0,200,255,0.12),rgba(170,45,255,0.1),rgba(0,255,136,0.08))",
        border: "1px solid rgba(0,200,255,0.45)",
        borderRadius: 16,
        padding: 28,
        boxShadow: "0 0 60px rgba(0,200,255,0.2), 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Scanline overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,200,255,0.03) 3px,rgba(0,200,255,0.03) 4px)", pointerEvents: "none" }} />

        {item.verified && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.35)", borderRadius: 20, padding: "3px 10px", fontSize: 9, color: "#00FF88", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 14 }}>
            ✓ VERIFIED IMPACT
          </div>
        )}

        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(0,200,255,0.7)", fontWeight: 800, marginBottom: 8 }}>
          {kindLabel[item.kind]}
        </div>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{item.title}</h2>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {m.totalPaidOut != null && (
            <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 4 }}>PAID OUT</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88" }}>${m.totalPaidOut.toLocaleString()}</div>
            </div>
          )}
          {m.audienceReached != null && (
            <div style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 4 }}>FANS REACHED</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#00FFFF" }}>{m.audienceReached.toLocaleString()}</div>
            </div>
          )}
          {m.engagementRate != null && (
            <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 4 }}>ENGAGEMENT</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#AA2DFF" }}>+{m.engagementRate}%</div>
            </div>
          )}
          {m.ticketsSold != null && (
            <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 4 }}>TICKETS SOLD</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>{m.ticketsSold.toLocaleString()}</div>
            </div>
          )}
        </div>

        {item.eventTitle && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
            Event: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{item.eventTitle}</strong>
          </div>
        )}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <button onClick={close} style={{ display: "block", margin: "16px auto 0", padding: "8px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em" }}>
        CLOSE ✕
      </button>
    </div>
  );
}

export default function MemoryItemModal() {
  const { active, isOpen, close } = useMemoryModalStore();

  useEffect(() => {
    if (!isOpen || !active) return;
    const t = setTimeout(close, 9000);
    return () => clearTimeout(t);
  }, [isOpen, active, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  if (!isOpen || !active) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,5,16,0.92)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)", animation: "tmiModalFadeIn 0.25s ease" }}
      onClick={close}
    >
      {active.itemType === "pro-legacy" ? (
        <ProLegacyView item={active.item} close={close} />
      ) : (
        <div style={{ maxWidth: "min(90vw, 600px)", width: "100%", animation: "tmiModalSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)" }} onClick={(e) => e.stopPropagation()}>
          {/* Polaroid / memory frame */}
          <div style={{ background: "#fff", borderRadius: 4, padding: active.item.kind === "polaroid" ? "14px 14px 48px" : "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", transform: "rotate(-1.5deg)" }}>
            {active.item.mediaUrl ? (
              active.item.kind === "video-clip" ? (
                <video src={active.item.mediaUrl} autoPlay controls style={{ width: "100%", display: "block", borderRadius: 2 }} />
              ) : (
                <img src={active.item.mediaUrl} alt={active.item.title} style={{ width: "100%", display: "block", borderRadius: 2, maxHeight: "60vh", objectFit: "contain" }} />
              )
            ) : (
              <div style={{ height: 280, background: "linear-gradient(135deg,#0a0818,#1a0a2e)", borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span style={{ fontSize: 64 }}>{KIND_ICON[active.item.kind] ?? "🎤"}</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.6)" }}>{active.item.title}</span>
              </div>
            )}
            {active.item.kind === "polaroid" && <p style={{ margin: "12px 0 0", fontSize: 12, color: "#333", textAlign: "center", fontFamily: "Georgia, serif" }}>{active.item.title}</p>}
          </div>

          {active.item.kind !== "polaroid" && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#fff" }}>{KIND_ICON[active.item.kind]} {active.item.title}</p>
              {active.item.subtitle && <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{active.item.subtitle}</p>}
              {active.item.date && <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{active.item.date}</p>}
            </div>
          )}
          <button onClick={close} style={{ display: "block", margin: "18px auto 0", padding: "8px 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em" }}>
            CLOSE ✕
          </button>
        </div>
      )}
      <style>{`
        @keyframes tmiModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tmiModalSlideUp { from { opacity: 0; transform: scale(0.85) rotate(-3deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
      `}</style>
    </div>
  );
}

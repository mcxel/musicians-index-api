"use client";

import { useState } from "react";
import type { ProLegacyItem } from "@/types/memory";
import AvatarPocketReveal from "@/components/avatar/AvatarPocketReveal";

const KIND_ICON: Record<ProLegacyItem["kind"], string> = {
  "sponsor-gift": "🤝",
  "advertiser-milestone": "📢",
  "promoter-win": "🎟️",
  "crowd-favorite": "👥",
};

const KIND_COLOR: Record<ProLegacyItem["kind"], string> = {
  "sponsor-gift": "#00FF88",
  "advertiser-milestone": "#FF2DAA",
  "promoter-win": "#FFD700",
  "crowd-favorite": "#00FFFF",
};

interface Props {
  item: ProLegacyItem;
  compact?: boolean;
}

export default function HolographicCard({ item, compact = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const accent = KIND_COLOR[item.kind] ?? "#00FFFF";
  const icon = KIND_ICON[item.kind] ?? "⭐";
  const m = item.metricImpact;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 14,
        border: `1px solid ${item.verified ? accent + "55" : "rgba(255,255,255,0.12)"}`,
        background: hovered
          ? `linear-gradient(135deg,rgba(0,200,255,0.12),rgba(170,45,255,0.1),rgba(0,255,136,0.06))`
          : `linear-gradient(135deg,rgba(0,200,255,0.06),rgba(170,45,255,0.05),rgba(5,5,16,0.9))`,
        padding: compact ? "14px 16px" : "20px",
        boxShadow: hovered
          ? `0 0 40px ${accent}22, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 4px 20px rgba(0,0,0,0.4)`,
        transition: "all 0.28s ease",
        transform: hovered ? "translateY(-2px) scale(1.01)" : "translateY(0) scale(1)",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* Scanlines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,200,255,0.02) 3px,rgba(0,200,255,0.02) 4px)", pointerEvents: "none", borderRadius: 14 }} />

      {/* Gloss reflection */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(180deg,rgba(255,255,255,0.06),transparent)", borderRadius: "14px 14px 0 0", pointerEvents: "none" }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: compact ? 8 : 14 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accent, fontWeight: 800, marginBottom: 4 }}>
            {icon} {item.kind.toUpperCase().replace("-", " ")}
          </div>
          <h3 style={{ margin: 0, fontSize: compact ? 13 : 16, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            {item.title}
          </h3>
        </div>
        {item.verified && (
          <div style={{ flexShrink: 0, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.35)", borderRadius: 20, padding: "3px 8px", fontSize: 8, color: "#00FF88", fontWeight: 900, letterSpacing: "0.15em", marginLeft: 8 }}>
            ✓ VERIFIED
          </div>
        )}
      </div>

      {/* Metrics — shown on hover or when not compact */}
      {(!compact || hovered) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {m.totalPaidOut != null && (
            <div style={{ background: "rgba(0,255,136,0.07)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 2 }}>PAID OUT</div>
              <div style={{ fontSize: compact ? 16 : 20, fontWeight: 900, color: "#00FF88" }}>${m.totalPaidOut.toLocaleString()}</div>
            </div>
          )}
          {m.audienceReached != null && (
            <div style={{ background: "rgba(0,200,255,0.07)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 2 }}>REACHED</div>
              <div style={{ fontSize: compact ? 16 : 20, fontWeight: 900, color: "#00FFFF" }}>{m.audienceReached.toLocaleString()}</div>
            </div>
          )}
          {m.ticketsSold != null && (
            <div style={{ background: "rgba(255,215,0,0.07)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 2 }}>TICKETS SOLD</div>
              <div style={{ fontSize: compact ? 16 : 20, fontWeight: 900, color: "#FFD700" }}>{m.ticketsSold.toLocaleString()}</div>
            </div>
          )}
          {m.engagementRate != null && (
            <div style={{ background: "rgba(170,45,255,0.07)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 2 }}>ENGAGEMENT</div>
              <div style={{ fontSize: compact ? 16 : 20, fontWeight: 900, color: "#AA2DFF" }}>+{m.engagementRate}%</div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
          {item.eventTitle ? item.eventTitle + " · " : ""}
          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </div>
        {hovered && (
          <AvatarPocketReveal item={{ itemType: "pro-legacy", item }} mode="business" />
        )}
      </div>
    </div>
  );
}

"use client";

import type { WriterWorkItem } from "@/types/memory";

interface Props {
  items: WriterWorkItem[];
  compact?: boolean;
}

export default function ArticleAnalyticsPanel({ items, compact = false }: Props) {
  const published = items.filter((i) => i.kind === "article" && i.status === "published");
  const totalViews    = published.reduce((s, i) => s + (i.metrics?.views ?? 0), 0);
  const avgRead       = published.filter((i) => i.metrics?.readTimeMinutes != null);
  const avgReadTime   = avgRead.length
    ? (avgRead.reduce((s, i) => s + (i.metrics?.readTimeMinutes ?? 0), 0) / avgRead.length).toFixed(1)
    : "—";
  const totalEarned   = items.reduce((s, i) => s + (i.metrics?.paidAmount ?? 0), 0);
  const sponsorCount  = items.filter((i) => i.metrics?.sponsorLinked).length;

  const stats = [
    { label: "TOTAL VIEWS",     value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews), color: "#FF2DAA", icon: "👁" },
    { label: "ARTICLES LIVE",   value: String(published.length), color: "#00FFFF", icon: "📰" },
    { label: "AVG READ TIME",   value: avgReadTime === "—" ? "—" : `${avgReadTime}m`, color: "#FFD700", icon: "⏱" },
    { label: "TOTAL EARNED",    value: totalEarned > 0 ? `$${totalEarned.toLocaleString()}` : "$0", color: "#00FF88", icon: "💵" },
    { label: "SPONSOR PIECES",  value: String(sponsorCount), color: "#FFA500", icon: "🤝" },
  ];

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.icon} {s.value}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>ARTICLE PERFORMANCE</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.icon} {s.value}</div>
          </div>
        ))}
      </div>

      {/* Top article */}
      {published.length > 0 && (() => {
        const top = [...published].sort((a, b) => (b.metrics?.views ?? 0) - (a.metrics?.views ?? 0))[0]!;
        return (
          <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(255,45,170,0.05)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 8 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>TOP ARTICLE</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{top.title}</div>
            <div style={{ fontSize: 10, color: "#FF2DAA", marginTop: 2 }}>
              {(top.metrics?.views ?? 0).toLocaleString()} views
              {top.metrics?.readTimeMinutes != null ? ` · ${top.metrics.readTimeMinutes}m avg read` : ""}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

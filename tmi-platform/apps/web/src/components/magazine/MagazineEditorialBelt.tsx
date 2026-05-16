"use client";

// Canon source: Tmi Homepage 2.png — Editorial Belt
// Structure: Article Feature card + Music News ticker (Last Hour) + Interviews card + Studio Recaps

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface ArticleRef {
  id: string;
  category: "feature" | "news" | "interview" | "recap";
  title: string;
  excerpt?: string;
  author?: string;
  timeAgo?: string;
  href: string;
  hot?: boolean;
}

const DEFAULT_ARTICLES: ArticleRef[] = [
  { id: "a1", category: "feature",   title: "KOVA Takes The Crown: Inside The Rise of Afrobeat's New King", excerpt: "From underground cyphers to the main stage — KOVA's journey to the top of the Index.", author: "TMI Editorial", timeAgo: "2h ago", href: "/magazine/kova-crown", hot: true },
  { id: "a2", category: "interview", title: "Blaze Cartel: 'The Battle Never Ends'", excerpt: "The Trap heavyweight on staying hungry after reaching #2.", author: "Jules T.", timeAgo: "4h ago", href: "/magazine/blaze-cartel" },
  { id: "a3", category: "recap",     title: "Cypher Highlights: Week 12 Best Bars", excerpt: "The bars that moved the crowd and the scores that shook the leaderboard.", author: "Studio Crew", timeAgo: "6h ago", href: "/magazine/cypher-week-12" },
];

const NEWS_TICKER: string[] = [
  "KOVA overtakes Blaze Cartel in this week's Crown voting — gap: 230 pts",
  "New Cypher Arena opens Saturday 9PM — 500 spots available",
  "Drift Sound drops surprise track in Room 7 — 12K listening now",
  "Season Pass Level 15 unlocked by first 3 artists — Main Stage access live",
  "Asha Wave joins Monday Night Stage lineup — booking open",
  "TMI Issue 002 drops next Monday — submit your track for coverage",
];

// ─── News ticker ──────────────────────────────────────────────────────────────

function NewsTicker({ headlines }: { headlines: string[] }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % headlines.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        background: "rgba(255,45,170,0.06)",
        border: "1px solid rgba(255,45,170,0.18)",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.2em",
          color: "#FF2DAA",
          whiteSpace: "nowrap",
          flexShrink: 0,
          background: "rgba(255,45,170,0.12)",
          border: "1px solid rgba(255,45,170,0.3)",
          borderRadius: 3,
          padding: "2px 6px",
        }}
      >
        LAST HOUR
      </span>

      {/* Headline */}
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.04em",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {headlines[idx]}
      </span>
    </div>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────

function EditorialCard({
  article,
  size = "normal",
}: {
  article: ArticleRef;
  size?: "feature" | "normal";
}) {
  const accentColor =
    article.category === "feature"   ? "#FF2DAA" :
    article.category === "interview" ? "#00FFFF" :
    article.category === "recap"     ? "#FFD700" : "#AA2DFF";

  const categoryLabel =
    article.category === "feature"   ? "FEATURE" :
    article.category === "interview" ? "INTERVIEW" :
    article.category === "recap"     ? "STUDIO RECAP" : "NEWS";

  return (
    <Link
      href={article.href}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "rgba(5,5,16,0.82)",
          border: `1px solid ${accentColor}20`,
          borderRadius: 10,
          padding: size === "feature" ? "16px 14px" : "12px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          height: "100%",
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}50`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}20`; }}
      >
        {/* Category label + hot badge */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.2em",
              color: accentColor,
              textTransform: "uppercase",
            }}
          >
            {categoryLabel}
          </span>
          {article.hot && (
            <span style={{ fontSize: 7, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.1em" }}>
              🔥 HOT
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: size === "feature" ? 14 : 11,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.03em",
            lineHeight: 1.3,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: "auto", paddingTop: 4 }}>
          {article.author && (
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
              {article.author}
            </span>
          )}
          {article.timeAgo && (
            <span style={{ fontSize: 7, color: `${accentColor}80`, letterSpacing: "0.1em", marginLeft: "auto" }}>
              {article.timeAgo}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Belt ─────────────────────────────────────────────────────────────────────

interface MagazineEditorialBeltProps {
  articles?: ArticleRef[];
  newsTicker?: string[];
  label?: string;
}

export default function MagazineEditorialBelt({
  articles = DEFAULT_ARTICLES,
  newsTicker = NEWS_TICKER,
  label = "EDITORIAL",
}: MagazineEditorialBeltProps) {
  const feature    = articles.find((a) => a.category === "feature") ?? articles[0];
  const supporting = articles.filter((a) => a.id !== feature?.id).slice(0, 2);

  return (
    <section data-belt="editorial" style={{ width: "100%" }}>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.28em",
            color: "#FF2DAA",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(255,45,170,0.3), transparent)" }} />
      </div>

      {/* News ticker */}
      <div style={{ marginBottom: 14 }}>
        <NewsTicker headlines={newsTicker} />
      </div>

      {/* Card grid: feature (large) + 2 supporting */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        {/* Feature takes 2 columns */}
        <div style={{ gridColumn: "1 / 3" }}>
          {feature && <EditorialCard article={feature} size="feature" />}
        </div>

        {/* Supporting cards stack in column 3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {supporting.map((a) => (
            <EditorialCard key={a.id} article={a} size="normal" />
          ))}
        </div>
      </div>
    </section>
  );
}

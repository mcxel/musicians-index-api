"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SnippetArticle = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  heroColor: string;
  icon: string;
  author: string;
};

const SPONSORS = [
  { name: "PrimeWave Audio",   desc: "Official TMI sound partner",      color: "#00FFFF", badge: "PLATINUM SPONSOR" },
  { name: "BeatLink Studio",   desc: "Pro beats for independent artists", color: "#FF2DAA", badge: "GOLD SPONSOR"     },
  { name: "StageGear Pro",     desc: "Live performance gear & rentals",   color: "#FFD700", badge: "SPONSOR"         },
];

const ISSUE_NAV = [
  { id: "1", label: "Issue 1 — April 2026", active: true,  href: "/magazine/1" },
  { id: "2", label: "Issue 2 — May 2026",   active: false, href: "/issues"     },
];

const CATEGORY_LABEL: Record<string, string> = {
  feature: "FEATURE", interview: "INTERVIEW", review: "REVIEW", news: "NEWS", editorial: "EDITORIAL",
};

export default function MagazineRotatingSnippets({ articles }: { articles: SnippetArticle[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (articles.length < 2) return;
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % articles.length);
    }, 4200);
    return () => clearInterval(id);
  }, [articles.length]);

  const article = articles[current];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

      {/* Issue rotation nav */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        {ISSUE_NAV.map(issue => (
          <Link
            key={issue.id}
            href={issue.href}
            style={{
              padding: "8px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textDecoration: "none",
              borderRadius: 20, border: issue.active ? "1px solid rgba(0,255,255,0.6)" : "1px solid rgba(255,255,255,0.12)",
              color:      issue.active ? "#00FFFF" : "rgba(255,255,255,0.3)",
              background: issue.active ? "rgba(0,255,255,0.06)" : "transparent",
            }}
          >
            {issue.active ? "● " : ""}{issue.label}{!issue.active ? " — COMING SOON" : ""}
          </Link>
        ))}
      </div>

      {/* Rotating snippet */}
      {article && (
        <section style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${article.heroColor}25`, borderRadius: 16, padding: "28px 32px", marginBottom: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${article.heroColor},${article.heroColor}44,transparent)` }} />

          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", writingMode: "vertical-rl", transform: "rotate(180deg)", flexShrink: 0 }}>
              ROTATING STORIES
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: article.heroColor, marginBottom: 10 }}>
                {CATEGORY_LABEL[article.category] ?? article.category.toUpperCase()}
              </div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{article.icon}</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.3, marginBottom: 8, color: "#fff" }}>{article.title}</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 18 }}>{article.subtitle}</p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Link
                  href={`/magazine/article/${article.slug}`}
                  style={{ padding: "8px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "#050510", background: article.heroColor, borderRadius: 8, textDecoration: "none" }}
                >
                  READ STORY →
                </Link>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{article.author}</span>
                <span style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "2px 7px" }}>NEW</span>
              </div>
            </div>
          </div>

          {/* Dot navigation */}
          <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Story ${i + 1}`}
                style={{ height: 5, width: i === current ? 22 : 5, borderRadius: 3, background: i === current ? article.heroColor : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", transition: "width 0.3s, background 0.3s", padding: 0 }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sponsor slots */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 16 }}>SPONSORS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
          {SPONSORS.map(sp => (
            <Link
              key={sp.name}
              href="/sponsors"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${sp.color}20`, borderRadius: 12, padding: "16px 20px", cursor: "pointer" }}>
                <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.15em", color: sp.color, marginBottom: 6 }}>{sp.badge}</div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{sp.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{sp.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

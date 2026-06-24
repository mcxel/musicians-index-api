"use client";
import Link from "next/link";
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

// Show real magazine articles as trending issues — grouped by category
const TRENDING = MAGAZINE_ISSUE_1
  .filter((a) => a.category === 'feature' || a.category === 'editorial')
  .slice(0, 3);

export default function Home2TrendingIssueRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#aa2dff", fontWeight: 800, marginBottom: 16 }}>
        TRENDING ARTICLES
      </div>
      {TRENDING.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {TRENDING.map((article) => (
            <Link
              key={article.slug}
              href={`/magazine/article/${article.slug}`}
              style={{ textDecoration: "none", color: "white", padding: "16px 14px", borderRadius: 10, background: "rgba(170,45,255,0.03)", border: "1px solid rgba(170,45,255,0.2)" }}
            >
              <div style={{ fontSize: 8, color: "#aa2dff", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                {article.category}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                {article.title.length > 60 ? article.title.slice(0, 60) + '…' : article.title}
              </div>
              <div style={{ fontSize: 10, color: "#aa2dff", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Read Article →</div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", padding: "20px 0" }}>No trending articles yet.</div>
      )}
    </section>
  );
}

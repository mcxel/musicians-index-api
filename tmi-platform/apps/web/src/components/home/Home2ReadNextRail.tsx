"use client";
import Link from "next/link";
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

// Real "read next" — pick the 3 most recent articles (any category)
const READ_NEXT = MAGAZINE_ISSUE_1.slice(0, 3);

const CATEGORY_COLOR: Record<string, string> = {
  feature:   '#00FFFF',
  interview: '#FF2DAA',
  review:    '#AA2DFF',
  editorial: '#FFD700',
  news:      '#00FF88',
};

export default function Home2ReadNextRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ffff", fontWeight: 800, marginBottom: 16 }}>
        READ NEXT
      </div>
      {READ_NEXT.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {READ_NEXT.map((article) => {
            const color = CATEGORY_COLOR[article.category] ?? '#00FFFF';
            return (
              <Link
                key={article.slug}
                href={`/magazine/article/${article.slug}`}
                style={{ textDecoration: "none", color: "white", padding: "16px 14px", borderRadius: 10, background: `${color}06`, border: `1px solid ${color}30` }}
              >
                <div style={{ fontSize: 8, color, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>
                  {article.category}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                  {article.title.length > 55 ? article.title.slice(0, 55) + '…' : article.title}
                </div>
                <div style={{ fontSize: 10, color, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Read Article →</div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", padding: "20px 0" }}>No articles published yet.</div>
      )}
    </section>
  );
}

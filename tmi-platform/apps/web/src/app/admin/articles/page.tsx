import Link from "next/link";
import type { Metadata } from "next";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata: Metadata = { title: "Article Monitor | TMI Admin" };

export default function AdminArticlesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← ADMIN
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 20, marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Article Monitor</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Magazine issues, editorial content, and article performance.</p>
          </div>
          <Link href="/magazine" style={{ padding: "8px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            VIEW MAGAZINE →
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Total Articles",   value: MAGAZINE_ISSUE_1.length, color: "#00FFFF" },
            { label: "Active Issues",    value: "1",                      color: "#FF2DAA" },
            { label: "Article Views",    value: "48.2K",                  color: "#00FF88" },
            { label: "Shares",           value: "2,840",                  color: "#FFD700" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Article list */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>
          ISSUE 1 — ALL ARTICLES ({MAGAZINE_ISSUE_1.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MAGAZINE_ISSUE_1.map((article, i) => (
            <div key={article.slug} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 22 }}>{i + 1}</span>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{article.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{article.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{article.author} · {article.publishedAt}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: article.heroColor, flexShrink: 0, textTransform: "uppercase" }}>
                {article.category}
              </span>
              <Link href={`/magazine/article/${article.slug}`} style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em", flexShrink: 0 }}>
                VIEW →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

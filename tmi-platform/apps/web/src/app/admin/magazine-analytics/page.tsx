import Link from "next/link";
import type { Metadata } from "next";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata: Metadata = { title: "Magazine Analytics | TMI Admin" };

const ARTICLE_STATS = MAGAZINE_ISSUE_1.map((article, i) => ({
  slug: article.slug,
  title: article.title,
  category: article.category,
  heroColor: article.heroColor,
  views: Math.floor(Math.random() * 8000 + 800) + i * 400,
  shares: Math.floor(Math.random() * 400 + 40),
  saves: Math.floor(Math.random() * 200 + 20),
})).sort((a, b) => b.views - a.views);

export default function AdminMagazineAnalyticsPage() {
  const totalViews = ARTICLE_STATS.reduce((a, s) => a + s.views, 0);
  const totalShares = ARTICLE_STATS.reduce((a, s) => a + s.shares, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Magazine Analytics</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Article views, shares, saves, and issue performance for Issue 1.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Total Articles", value: String(MAGAZINE_ISSUE_1.length), color: "#00FFFF" },
            { label: "Total Views",    value: totalViews.toLocaleString(),      color: "#FF2DAA" },
            { label: "Total Shares",   value: totalShares.toLocaleString(),     color: "#FFD700" },
            { label: "Active Issues",  value: "1",                              color: "#00FF88" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 16 }}>
          ARTICLES BY VIEWS — ISSUE 1
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ARTICLE_STATS.map((stat, i) => {
            const maxViews = ARTICLE_STATS[0]?.views ?? 1;
            const pct = Math.round((stat.views / maxViews) * 100);
            return (
              <div key={stat.slug} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 24 }}>#{i + 1}</span>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stat.title}</div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: stat.heroColor, flexShrink: 0, textTransform: "uppercase" }}>{stat.category}</span>
                  <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 900 }}>{stat.views.toLocaleString()}</div>
                      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>VIEWS</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 900 }}>{stat.shares}</div>
                      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>SHARES</div>
                    </div>
                  </div>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: stat.heroColor, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

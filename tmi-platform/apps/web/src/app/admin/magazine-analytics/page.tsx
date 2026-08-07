import Link from "next/link";
import type { Metadata } from "next";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata: Metadata = { title: "Magazine Analytics | TMI Admin" };

/** Rule 20: Issue 1 inventory only — no Math.random vanity views/shares. */
export default function AdminMagazineAnalyticsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Magazine Analytics</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>
          Issue 1 article inventory. View/share telemetry is not wired yet — no fabricated counts.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Total Articles", value: String(MAGAZINE_ISSUE_1.length), color: "#00FFFF" },
            { label: "Total Views", value: "—", color: "#FF2DAA" },
            { label: "Total Shares", value: "—", color: "#FFD700" },
            { label: "Active Issues", value: MAGAZINE_ISSUE_1.length > 0 ? "1" : "0", color: "#00FF88" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 16 }}>
          ISSUE 1 — PUBLISHED TITLES
        </div>

        {MAGAZINE_ISSUE_1.length === 0 ? (
          <div style={{ padding: "28px 20px", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            No Issue 1 articles in magazineIssueData yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MAGAZINE_ISSUE_1.map((article, i) => (
              <div key={article.slug} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 24 }}>#{i + 1}</span>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{article.title}</div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: article.heroColor, flexShrink: 0, textTransform: "uppercase" }}>{article.category}</span>
                  <Link href={`/magazine/article/${article.slug}`} style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700, flexShrink: 0 }}>
                    Read →
                  </Link>
                </div>
                <div style={{ marginTop: 6, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  Views / shares: unavailable until analytics store is connected
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

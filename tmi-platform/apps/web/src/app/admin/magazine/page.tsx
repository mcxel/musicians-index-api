"use client";

import { useState } from "react";
import Link from "next/link";

const MOCK_ISSUES = [
  { id: "i01", title: "Issue 01 — Apr 2026", articles: 12, status: "published", cover: "🎤", views: 18420 },
  { id: "i02", title: "Issue 02 — May 2026", articles: 7,  status: "draft",     cover: "🎸", views: 0 },
  { id: "i03", title: "Issue 03 — Jun 2026", articles: 0,  status: "scheduled", cover: "🥁", views: 0 },
];

const MOCK_ARTICLES = [
  { id: "a01", title: "The Rise of Battle Rap Culture", issue: "i01", author: "Wavetek",     status: "published", views: 4210 },
  { id: "a02", title: "How AI is Shaping Beats",        issue: "i01", author: "Nova Cipher", status: "published", views: 2980 },
  { id: "a03", title: "Interview: Crown Holder Vol.7",  issue: "i01", author: "TMI Staff",   status: "published", views: 6100 },
  { id: "a04", title: "Top 10 Venues of 2026",          issue: "i02", author: "TMI Staff",   status: "draft",     views: 0 },
  { id: "a05", title: "New Wave: Afrobeats x Hip-Hop",  issue: "i02", author: "Krypt",       status: "draft",     views: 0 },
];

const STATUS_COLOR: Record<string, string> = {
  published:  "#00FF88",
  draft:      "#FFD700",
  scheduled:  "#00FFFF",
};

export default function AdminMagazinePage() {
  const [activeTab, setActiveTab] = useState<"issues" | "articles">("issues");
  const [filter, setFilter] = useState("all");

  const articles = filter === "all" ? MOCK_ARTICLES : MOCK_ARTICLES.filter(a => a.issue === filter);

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800 }}>ADMIN</div>
            <h1 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, margin: "4px 0 0" }}>MAGAZINE EDITOR</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/magazine/new-issue" style={{ padding: "10px 18px", background: "#FF2DAA", color: "#fff", borderRadius: 8, fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.1em" }}>+ NEW ISSUE</Link>
            <Link href="/magazine/new-article" style={{ padding: "10px 18px", background: "rgba(255,45,170,0.15)", color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.1em" }}>+ NEW ARTICLE</Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 0 }}>
          {(["issues", "articles"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", border: "none", borderRadius: "6px 6px 0 0", background: activeTab === tab ? "rgba(255,45,170,0.15)" : "transparent", color: activeTab === tab ? "#FF2DAA" : "rgba(255,255,255,0.4)", fontWeight: 800, fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: activeTab === tab ? "2px solid #FF2DAA" : "2px solid transparent" }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "issues" && (
          <div style={{ display: "grid", gap: 12 }}>
            {MOCK_ISSUES.map(issue => (
              <div key={issue.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 28 }}>{issue.cover}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{issue.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{issue.articles} articles · {issue.views.toLocaleString()} views</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: STATUS_COLOR[issue.status] ?? "#fff", background: `${STATUS_COLOR[issue.status] ?? "#fff"}18`, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.1em" }}>{issue.status.toUpperCase()}</span>
                  <Link href={`/magazine/${issue.id}/edit`} style={{ fontSize: 10, color: "#00FFFF", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", padding: "4px 12px", borderRadius: 6 }}>EDIT</Link>
                  <Link href={`/magazine`} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textDecoration: "none" }}>VIEW →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "articles" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", alignSelf: "center" }}>Filter:</span>
              {[{ id: "all", label: "All Issues" }, ...MOCK_ISSUES.map(i => ({ id: i.id, label: i.title.split("—")[0].trim() }))].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 9, fontWeight: 800, border: "none", cursor: "pointer", background: filter === f.id ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.05)", color: filter === f.id ? "#00FFFF" : "rgba(255,255,255,0.4)", outline: filter === f.id ? "1px solid rgba(0,255,255,0.3)" : "none" }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {articles.map(a => (
                <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>by {a.author} · {a.views.toLocaleString()} views</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 900, color: STATUS_COLOR[a.status] ?? "#fff", background: `${STATUS_COLOR[a.status] ?? "#fff"}18`, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.1em" }}>{a.status.toUpperCase()}</span>
                  <Link href={`/magazine/article/${a.id}/edit`} style={{ fontSize: 10, color: "#00FFFF", fontWeight: 700, textDecoration: "none" }}>EDIT →</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 32, padding: "16px 20px", background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.12)", borderRadius: 12, display: "flex", gap: 32, flexWrap: "wrap" }}>
          {[
            { label: "TOTAL ISSUES", value: MOCK_ISSUES.length.toString() },
            { label: "PUBLISHED", value: MOCK_ISSUES.filter(i => i.status === "published").length.toString() },
            { label: "TOTAL ARTICLES", value: MOCK_ARTICLES.length.toString() },
            { label: "TOTAL VIEWS", value: MOCK_ARTICLES.reduce((s, a) => s + a.views, 0).toLocaleString() },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#FF2DAA" }}>{s.value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";

const ACCENT = "#FF2DAA";

const DRAFT_ARTICLES = [
  { id: "d1", title: "The Rise of Battle Culture in 2026", category: "culture", status: "draft",    words: 1240, updated: "2h ago" },
  { id: "d2", title: "Nova Cipher: Behind the 8-Streak",   category: "artist",  status: "review",   words: 2100, updated: "1d ago" },
  { id: "d3", title: "TMI Season 2 — What to Expect",      category: "news",    status: "approved", words: 800,  updated: "3d ago" },
];

const QUICK_ACTIONS = [
  { label: "NEW ARTICLE",     icon: "✏️", href: "/editorial/write",        color: "#FF2DAA", desc: "Start a new piece" },
  { label: "MY DRAFTS",       icon: "📝", href: "/editorial/drafts",        color: "#AA2DFF", desc: "View all drafts" },
  { label: "MY WORK WALL",    icon: "📌", href: "/hub/writer/works",        color: "#00FFFF", desc: "Portfolio + published articles" },
  { label: "PITCH ARTICLE",   icon: "🚀", href: "/hub/writer/pitches",      color: "#FFD700", desc: "Submit article idea to editors" },
  { label: "SUBMISSIONS",     icon: "📬", href: "/hub/writer/submissions",  color: "#00FF88", desc: "Track pitch + submission status" },
  { label: "MAGAZINE",        icon: "📰", href: "/magazine",                color: "#00FFFF", desc: "Live magazine issue" },
  { label: "EDITORIAL DESK",  icon: "🗞️", href: "/editorial",              color: "#FFD700", desc: "Full editorial suite" },
  { label: "ARTICLE HEALTH",  icon: "🔍", href: "/admin/articles",         color: "#00FF88", desc: "Sync status check" },
  { label: "CONTRIBUTORS",    icon: "👥", href: "/editorial/contributors",  color: "#FF2DAA", desc: "Writer roster" },
  { label: "ANALYTICS",       icon: "📊", href: "/editorial/analytics",     color: "#AA2DFF", desc: "Reads, shares, time-on-page" },
  { label: "SETTINGS",        icon: "⚙️", href: "/settings",               color: "#555",    desc: "Account preferences" },
];

const CATEGORIES = [
  { label: "Artist Spotlight",    count: 4, href: "/articles/artist",    color: "#00FFFF" },
  { label: "Performer Features",  count: 3, href: "/articles/performer", color: "#AA2DFF" },
  { label: "Culture & News",      count: 7, href: "/articles/news",      color: "#FFD700" },
  { label: "Reviews",             count: 2, href: "/articles/reviews",   color: "#FF2DAA" },
  { label: "Interviews",          count: 1, href: "/articles/interviews",color: "#00FF88" },
];

const STATS = [
  { label: "Articles Published", value: "17",    icon: "📰", color: "#FF2DAA" },
  { label: "Drafts In Progress", value: "3",     icon: "✏️", color: "#AA2DFF" },
  { label: "Total Reads",        value: "24.3K", icon: "👁️", color: "#00FFFF" },
  { label: "Avg. Read Time",     value: "4.2m",  icon: "⏱️", color: "#FFD700" },
];

const STATUS_COLOR: Record<string, string> = {
  draft: "#64748b",
  review: "#FFD700",
  approved: "#00FF88",
};

export default function WriterHubPage() {
  const [filter, setFilter] = useState<"all" | "draft" | "review" | "approved">("all");
  const visible = DRAFT_ARTICLES.filter((a) => filter === "all" || a.status === filter);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.88)", borderBottom: "1px solid rgba(255,45,170,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>EDITORIAL HUB</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>Writer Command Center</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <PersonaSwitcher currentRole="writer" compact />
          <Link href="/dashboard/writer" style={{ fontSize: 10, color: ACCENT, border: "1px solid rgba(255,45,170,0.3)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>DASHBOARD</Link>
          <Link href="/editorial" style={{ fontSize: 10, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.25)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>EDITORIAL DESK</Link>
          <Link href="/magazine" style={{ fontSize: 10, color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>MAGAZINE</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 32 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}30`, borderRadius: 12, padding: "18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA hero */}
        <div style={{ background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(170,45,255,0.08))", border: "1.5px solid rgba(255,45,170,0.35)", borderRadius: 16, padding: "24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>✏️ READY TO PUBLISH</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Shape the Culture. Tell the Story.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Write, edit, and publish articles to the TMI Magazine reaching thousands of music fans.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Link href="/editorial/write" style={{ padding: "13px 28px", background: `linear-gradient(90deg,${ACCENT},#AA2DFF)`, borderRadius: 9, color: "#fff", fontWeight: 900, fontSize: 13, textDecoration: "none", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>NEW ARTICLE</Link>
            <Link href="/magazine" style={{ padding: "13px 20px", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 9, color: ACCENT, fontWeight: 800, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>VIEW MAGAZINE</Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.label} href={a.href} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 10, textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: a.color, letterSpacing: "0.1em" }}>{a.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Articles + Categories */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>

          {/* Article Queue */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 14, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ARTICLE QUEUE</div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["all", "draft", "review", "approved"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${filter === f ? ACCENT : "rgba(255,255,255,0.1)"}`, background: filter === f ? `${ACCENT}18` : "transparent", color: filter === f ? ACCENT : "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visible.map((a) => (
                <Link key={a.id} href={`/editorial/drafts/${a.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, textDecoration: "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{a.category} · {a.words.toLocaleString()} words · {a.updated}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: STATUS_COLOR[a.status] ?? "#fff", letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${STATUS_COLOR[a.status] ?? "#fff"}30`, padding: "3px 8px", borderRadius: 4 }}>
                    {a.status}
                  </span>
                </Link>
              ))}
              {visible.length === 0 && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "20px 0" }}>No articles in this state.</div>
              )}
            </div>
            <Link href="/editorial/write" style={{ display: "block", marginTop: 12, textAlign: "center", padding: "10px", background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: 8, color: ACCENT, fontWeight: 800, fontSize: 11, textDecoration: "none", letterSpacing: "0.1em" }}>
              + START NEW ARTICLE
            </Link>
          </div>

          {/* Categories */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>CATEGORIES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <Link key={c.label} href={c.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: `${c.color}08`, border: `1px solid ${c.color}20`, borderRadius: 8, textDecoration: "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.label}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{c.count} articles</span>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>QUICK LINKS</div>
              <Link href="/admin/articles" style={{ display: "block", padding: "8px 12px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 7, color: "#00FF88", fontSize: 11, fontWeight: 700, textDecoration: "none", marginBottom: 6 }}>
                Article Health Check →
              </Link>
              <Link href="/admin/editorial" style={{ display: "block", padding: "8px 12px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 7, color: "#AA2DFF", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                Editorial Admin →
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

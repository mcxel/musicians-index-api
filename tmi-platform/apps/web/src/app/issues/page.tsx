import Link from "next/link";
import type { Metadata } from "next";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata: Metadata = {
  title: "Issues | TMI Magazine",
  description: "Browse every issue of The Musician's Index Magazine.",
};

export default function IssuesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>
          THE MUSICIAN&apos;S INDEX
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, letterSpacing: -1, marginBottom: 12 }}>
          All Issues
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto" }}>
          Every issue of TMI Magazine — features, interviews, reviews, and industry news from the forefront of music.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        {/* Issue 1 card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 16, padding: 32, marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 120, height: 160, background: "linear-gradient(145deg,#0a0a1a,#1a0a2a)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>📖</div>
                <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#AA2DFF", fontWeight: 800, marginTop: 8 }}>ISSUE 1</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.25em", color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>
                APRIL 2026 — ISSUE 1
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
                Crown Season
              </h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                The launch issue. Top artists, platform milestones, battle recaps, Fan Club revenue breakdowns, and the story of TMI&apos;s first year in music.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{MAGAZINE_ISSUE_1.length} articles</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>·</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Features · Interviews · Reviews · News · Editorial</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Link href="/magazine/1" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
                  OPEN ISSUE
                </Link>
                <Link href="/magazine" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
                  BROWSE ARTICLES
                </Link>
              </div>
            </div>
          </div>

          {/* Article list preview */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 16 }}>IN THIS ISSUE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
              {MAGAZINE_ISSUE_1.slice(0, 6).map(article => (
                <Link key={article.slug} href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 16 }}>{article.icon}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.3, flex: 1 }}>{article.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Coming soon — Issue 2 */}
        <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32, textAlign: "center", opacity: 0.5 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>ISSUE 2 — MAY 2026</div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>Coming soon. Subscribe for early access.</p>
        </div>
      </section>
    </main>
  );
}

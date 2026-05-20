import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getMagazineArticleBySlug,
  listMagazineArticlesByCategory,
} from "@/lib/magazine/MagazineArticleResolver";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getMagazineArticleBySlug(slug);
  if (!article) return { title: "News | TMI Magazine" };
  return {
    title: `${article.title} | TMI News`,
    description: article.summary,
  };
}

export default async function MagazineNewsSlugPage({ params }: Props) {
  const { slug } = await params;
  const article = getMagazineArticleBySlug(slug);
  if (!article) notFound();

  const related = listMagazineArticlesByCategory("news")
    .filter(a => a.slug !== slug)
    .slice(0, 4);

  const accentColor = "#00FFFF";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ padding: "14px 24px", borderBottom: "1px solid rgba(0,255,255,0.1)", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/magazine" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← MAGAZINE
        </Link>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: accentColor }}>NEWS</span>
      </nav>

      {/* Dateline bar */}
      <div style={{ padding: "8px 24px", background: `${accentColor}08`, borderBottom: `1px solid ${accentColor}14` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", gap: 16, fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.12em" }}>
          <span>TMI EDITORIAL</span>
          <span>·</span>
          <span>{new Date(article.publishedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase()}</span>
        </div>
      </div>

      {/* Hero */}
      <header style={{ maxWidth: 820, margin: "0 auto", padding: "44px 24px 32px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {article.tags.map(tag => (
            <span key={tag} style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: accentColor, background: `${accentColor}0d`, border: `1px solid ${accentColor}20`, borderRadius: 4, padding: "2px 8px" }}>
              {tag.toUpperCase()}
            </span>
          ))}
        </div>

        <h1 style={{ fontSize: "clamp(22px, 4.5vw, 42px)", fontWeight: 900, lineHeight: 1.12, margin: "0 0 14px", letterSpacing: "-0.015em" }}>
          {article.title}
        </h1>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, marginBottom: 18 }}>
          {article.summary}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderTop: `1px solid ${accentColor}18`, borderBottom: `1px solid ${accentColor}18` }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            By <strong style={{ color: "rgba(255,255,255,0.75)" }}>{article.author}</strong>
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
            {Math.ceil(article.minimumReadSeconds / 60)} MIN READ
          </span>
          {article.engagementValue >= 70 && (
            <>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA" }}>🔥 TRENDING</span>
            </>
          )}
        </div>
      </header>

      {/* Article body */}
      <article style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.78)" }}>
          {article.body.split("\n\n").map((para, i) => {
            // First paragraph gets a drop-cap treatment
            if (i === 0) {
              return (
                <p key={i} style={{ marginBottom: 22, fontSize: 16 }}>
                  <span style={{ float: "left", fontSize: 56, lineHeight: 0.85, fontWeight: 900, color: accentColor, marginRight: 10, marginTop: 6 }}>
                    {para[0]}
                  </span>
                  {para.slice(1)}
                </p>
              );
            }
            return <p key={i} style={{ marginBottom: 22 }}>{para}</p>;
          })}
        </div>

        {/* Reading reward */}
        {article.payoutEligible && (
          <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.18)", borderRadius: 20 }}>
            <span style={{ fontSize: 13 }}>📖</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em" }}>
              +{article.rewardPoints} XP FOR READING THIS ARTICLE
            </span>
          </div>
        )}
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px 80px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.3)", margin: "24px 0 14px" }}>RELATED NEWS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
            {related.map(r => (
              <Link
                key={r.slug}
                href={`/magazine/news/${r.slug}`}
                style={{
                  padding: "12px 14px", borderRadius: 8, textDecoration: "none", color: "inherit",
                  background: "rgba(255,255,255,0.02)", border: `1px solid ${accentColor}10`,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5, lineHeight: 1.3 }}>{r.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{r.summary.slice(0, 70)}…</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

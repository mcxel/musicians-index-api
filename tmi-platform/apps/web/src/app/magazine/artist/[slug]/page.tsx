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

export function generateStaticParams() {
  return listMagazineArticlesByCategory("artist").map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getMagazineArticleBySlug(slug);
  if (!article) return { title: "Artist Feature | TMI Magazine" };
  return {
    title: `${article.title} | TMI Magazine`,
    description: article.summary,
  };
}

export default async function MagazineArtistSlugPage({ params }: Props) {
  const { slug } = await params;
  const article = getMagazineArticleBySlug(slug);
  if (!article) notFound();

  const related = listMagazineArticlesByCategory("artist")
    .filter(a => a.slug !== slug)
    .slice(0, 3);

  const accentColor = "#FF2DAA";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,45,170,0.12)", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 10 }}>📖</span>
          <Link href="/magazine/1" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            ← ISSUE 1
          </Link>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: accentColor }}>ARTIST FEATURE</span>
        </div>
        <Link href="/home/1" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>
          EXIT PLATFORM
        </Link>
      </nav>

      {/* Hero */}
      <header
        style={{
          padding: "52px 24px 40px",
          background: `radial-gradient(ellipse at 20% 50%, ${accentColor}14 0%, transparent 60%), linear-gradient(180deg, rgba(5,5,16,0) 0%, #050510 100%)`,
          borderBottom: `1px solid ${accentColor}18`,
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          {article.tags.map(tag => (
            <span key={tag} style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: accentColor, background: `${accentColor}10`, border: `1px solid ${accentColor}25`, borderRadius: 4, padding: "2px 8px" }}>
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 46px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          {article.title}
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 20 }}>
          {article.summary}
        </p>
        <div style={{ display: "flex", gap: 20, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          <span>By <strong style={{ color: "rgba(255,255,255,0.7)" }}>{article.author}</strong></span>
          <span>{new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          {article.sponsorAttached && <span style={{ color: "#FFD700" }}>★ SPONSORED</span>}
        </div>
      </header>

      {/* Body */}
      <article style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.8)" }}>
          {article.body.split("\n\n").map((para, i) => (
            <p key={i} style={{ marginBottom: 20 }}>{para}</p>
          ))}
        </div>

        {/* Reward pill */}
        {article.payoutEligible && (
          <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 20 }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em" }}>
              +{article.rewardPoints} XP FOR READING
            </span>
          </div>
        )}
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>MORE ARTIST FEATURES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {related.map(r => (
              <Link
                key={r.slug}
                href={`/magazine/artist/${r.slug}`}
                style={{
                  display: "flex", gap: 14, padding: "12px 16px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: `1px solid ${accentColor}12`,
                  textDecoration: "none", color: "inherit",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{r.summary.slice(0, 90)}…</div>
                </div>
                <span style={{ fontSize: 9, color: accentColor, fontWeight: 800, letterSpacing: "0.1em", alignSelf: "center", flexShrink: 0 }}>READ →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

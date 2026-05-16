import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocalArticleBySlug, getLocalArticlesByCategory } from "@/lib/editorial/localArticleCatalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getLocalArticlesByCategory("artist").map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getLocalArticleBySlug(slug);
  if (!article || article.category !== "artist") return { title: "Not Found | TMI" };
  return {
    title: `${article.title} | TMI Artist Articles`,
    description: article.subtitle,
  };
}

export default async function ArtistArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getLocalArticleBySlug(slug);
  if (!article || article.category !== "artist") return notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/artist-articles" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← ARTIST ARTICLES
        </Link>
      </div>

      <header style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 40 }}>{article.icon}</span>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.25em", color: article.heroColor, background: `${article.heroColor}18`, border: `1px solid ${article.heroColor}30`, borderRadius: 4, padding: "3px 8px" }}>
            ARTIST ARTICLE
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.2rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
          {article.title}
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 20 }}>
          {article.subtitle}
        </p>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>By {article.author}</span>
          <span>{article.publishedAt}</span>
        </div>
      </header>

      <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        {article.body.map((para, i) => (
          <p key={i} style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.78)", marginBottom: 24 }}>
            {para}
          </p>
        ))}

        <div style={{ marginTop: 48, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {article.tags.map(tag => (
            <span key={tag} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "3px 8px" }}>
              #{tag}
            </span>
          ))}
        </div>
      </article>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 32 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <Link href="/artist-articles" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            MORE ARTIST ARTICLES
          </Link>
          <Link href="/hub/artist" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
            ARTIST HUB →
          </Link>
        </div>
      </div>
    </main>
  );
}

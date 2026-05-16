import Link from "next/link";
import type { Metadata } from "next";
import { getLocalArticlesByCategory } from "@/lib/editorial/localArticleCatalog";

export const metadata: Metadata = {
  title: "Artist Articles | TMI",
  description: "In-depth articles written by and for artists on the TMI platform.",
};

export default function ArtistArticlesPage() {
  const articles = getLocalArticlesByCategory("artist");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>
          TMI EDITORIAL
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, marginBottom: 12 }}>
          Artist Articles
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 24px" }}>
          Breakdowns, playbooks, and success stories written for artists building careers on TMI.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/articles" style={{ padding: "7px 18px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>All Articles</Link>
          <Link href="/performer-articles" style={{ padding: "7px 18px", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 20, color: "#FF2DAA", textDecoration: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>Performer Articles</Link>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        {articles.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 60 }}>No artist articles yet. Check back soon.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {articles.map(article => (
              <Link key={article.slug} href={`/artist-articles/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ display: "flex", gap: 20, alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: `1px solid ${article.heroColor}18`, borderRadius: 14, padding: "24px 28px", cursor: "pointer" }}>
                  <span style={{ fontSize: 36, flexShrink: 0 }}>{article.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: article.heroColor, marginBottom: 6 }}>
                      ARTIST ARTICLE · {article.publishedAt}
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3, marginBottom: 8, color: "#fff" }}>{article.title}</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 12 }}>{article.subtitle}</p>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>By {article.author}</div>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

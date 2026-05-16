import Link from "next/link";
import {
  getLocalArticlesByCategory,
  type LocalArticle,
} from "@/lib/editorial/localArticleCatalog";

function byPublishedAtDesc(left: LocalArticle, right: LocalArticle) {
  return left.publishedAt < right.publishedAt ? 1 : -1;
}

export default function NewsArticlesPage() {
  const newsArticles = getLocalArticlesByCategory("news").sort(byPublishedAtDesc);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,45,170,0.16), transparent 30%), linear-gradient(180deg, #120716 0%, #050510 100%)",
        color: "#fff",
        padding: "48px 24px 96px",
      }}
    >
      <section style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "#FFD700",
              fontWeight: 900,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            TMI News Control
          </div>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: "0 0 10px", fontWeight: 900 }}>
            News Desk
          </h1>
          <p style={{ maxWidth: 620, color: "rgba(255,255,255,0.68)", fontSize: 15, lineHeight: 1.6 }}>
            Platform news, standings, issue drops, and movement across the TMI world.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {newsArticles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/news/${article.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <article
                style={{
                  height: "100%",
                  border: `1px solid ${article.heroColor}33`,
                  background: "rgba(7, 8, 18, 0.92)",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: `0 0 0 1px ${article.heroColor}10 inset, 0 18px 40px rgba(0,0,0,0.28)`,
                }}
              >
                <div
                  style={{
                    padding: "18px 18px 14px",
                    background: `linear-gradient(135deg, ${article.heroColor}22, transparent 72%)`,
                    borderBottom: `1px solid ${article.heroColor}22`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        fontWeight: 900,
                        color: article.heroColor,
                      }}
                    >
                      {article.category}
                    </span>
                    <span style={{ fontSize: 20 }}>{article.icon}</span>
                  </div>
                  <h2 style={{ fontSize: 24, lineHeight: 1.1, margin: "14px 0 8px", fontWeight: 900 }}>
                    {article.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>
                    {article.subtitle}
                  </p>
                </div>
                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>
                      {article.author}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      {article.publishedAt}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 18px", fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
                    {article.body[0] ?? article.subtitle}
                  </p>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: article.heroColor,
                    }}
                  >
                    Open Article
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
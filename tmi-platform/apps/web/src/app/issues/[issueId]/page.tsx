import Link from "next/link";
import { MAGAZINE_ISSUE_1, getArticlesByCategory } from "@/lib/magazine/magazineIssueData";

type Props = { params: Promise<{ issueId: string }> };

export async function generateStaticParams() {
  return [{ issueId: "1" }];
}

export async function generateMetadata({ params }: Props) {
  const { issueId } = await params;
  return {
    title: `Issue ${issueId} | TMI Magazine`,
    description: `The Musician's Index Magazine — Issue ${issueId}. Features, interviews, reviews, and news.`,
  };
}

const CATEGORY_COLOR: Record<string, string> = {
  feature:   "#FF2DAA",
  interview: "#00FFFF",
  review:    "#AA2DFF",
  news:      "#FFD700",
  editorial: "#00FF88",
};

export default async function IssueDetailPage({ params }: Props) {
  const { issueId } = await params;

  if (issueId !== "1") {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Issue {issueId}</h1>
          <p style={{ color: "rgba(255,255,255,0.35)" }}>This issue is not yet available.</p>
          <Link href="/issues" style={{ display: "inline-block", marginTop: 24, padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            ALL ISSUES
          </Link>
        </div>
      </main>
    );
  }

  const features = getArticlesByCategory("feature");
  const interviews = getArticlesByCategory("interview");
  const news = getArticlesByCategory("news");
  const reviews = getArticlesByCategory("review");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/issues" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← ALL ISSUES
        </Link>
      </div>

      <header style={{ textAlign: "center", padding: "40px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>
          ISSUE 1 — APRIL 2026
        </div>
        <h1 style={{ fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, letterSpacing: -1, marginBottom: 10 }}>
          CROWN SEASON
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto" }}>
          {MAGAZINE_ISSUE_1.length} articles · Features · Interviews · Reviews · News · Editorial
        </p>
      </header>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 20 }}>COVER FEATURES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginBottom: 48 }}>
          {features.map(article => (
            <Link key={article.slug} href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${article.heroColor}18`, borderRadius: 12, padding: 22 }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{article.icon}</div>
                <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: article.heroColor, marginBottom: 6 }}>FEATURE</div>
                <h2 style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>{article.title}</h2>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{article.subtitle}</p>
              </article>
            </Link>
          ))}
        </div>

        {/* Two column: interviews + news */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>INTERVIEWS</div>
            {interviews.map(article => (
              <Link key={article.slug} href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 18 }}>{article.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{article.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{article.author}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>NEWS</div>
            {news.map(article => (
              <Link key={article.slug} href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 18 }}>{article.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{article.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{article.author}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 16 }}>REVIEWS</div>
        {reviews.map(article => (
          <Link key={article.slug} href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>{article.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{article.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{article.subtitle}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, color: CATEGORY_COLOR[article.category], letterSpacing: "0.1em" }}>READ →</span>
            </div>
          </Link>
        ))}
      </section>

      <div style={{ textAlign: "center", padding: "48px 24px 0" }}>
        <Link href="/magazine" style={{ padding: "10px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
          VIEW FULL MAGAZINE →
        </Link>
      </div>
    </main>
  );
}

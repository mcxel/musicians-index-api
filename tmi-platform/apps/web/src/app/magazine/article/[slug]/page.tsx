import { redirect } from "next/navigation";
import { getArticleBySlug, MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import MagazineSpreadRenderer from "@/components/editorial/MagazineSpreadRenderer";
import XPTrigger from "@/components/common/XPTrigger";
import AdRailSlot from "@/components/ads/AdRailSlot";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return MAGAZINE_ISSUE_1.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article | TMI Magazine" };
  return {
    title: `${article.title} | TMI Magazine`,
    description: article.subtitle,
    openGraph: { title: article.title, description: article.subtitle, type: "article" },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    const editorial = getEditorialArticleBySlug(slug);
    if (editorial) {
      const dest = editorial.category === "artist"
        ? `/articles/artist/${slug}`
        : editorial.category === "performer"
        ? `/articles/performer/${slug}`
        : `/articles/news/${slug}`;
      redirect(dest);
    }
    redirect("/magazine");
  }

  const allArticles = MAGAZINE_ISSUE_1;
  const currentIdx = allArticles.findIndex((a) => a.slug === slug);
  const prevArticle = currentIdx > 0 ? allArticles[currentIdx - 1] : null;
  const nextArticle = currentIdx < allArticles.length - 1 ? allArticles[currentIdx + 1] : null;
  const relatedArticles = allArticles.filter((a) => a.slug !== slug);

  return (
    <>
      <XPTrigger action="READ_ARTICLE" delayMs={8000} />

      {/* Issue identity bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(5,5,16,0.92)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,45,170,0.15)",
        padding: "9px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10 }}>📖</span>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: "#FF2DAA" }}>ISSUE 1 — THE MUSICIAN&apos;S INDEX</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/magazine/1" style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.1em" }}>
            BACK TO ISSUE
          </Link>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>·</span>
          <Link href="/home/1" style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em" }}>
            EXIT PLATFORM
          </Link>
        </div>
      </div>

      {/* ── AD — leaderboard before article ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "8px 24px 0" }}>
        <UnifiedAdSlot venue="magazine" slotKey="magazineLeaderboard" format="horizontal" label="ADVERTISEMENT" style={{ minHeight: 90 }} accentColor="#FF2DAA" />
      </div>

      <MagazineSpreadRenderer article={article} issueNumber={1} related={relatedArticles} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <AdRailSlot slotId="magazine-article-rail" hasSponsor={false} hasAdvertiser={false} title="Article Rail" />
        {/* ── AD — end of article ── */}
        <UnifiedAdSlot venue="magazine" slotKey="magazineArticleEnd" format="rectangle" label="ADVERTISEMENT" style={{ marginTop: 16, minHeight: 250 }} accentColor="#FF2DAA" />
      </div>

      {/* Reader continuity footer */}
      <nav style={{
        background: "rgba(5,5,16,0.95)", borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "20px 24px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 12, alignItems: "center",
        maxWidth: 900, margin: "0 auto",
      }}>
        <div>
          {prevArticle && (
            <Link href={`/magazine/article/${prevArticle.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>← PREVIOUS</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{prevArticle.title}</span>
            </Link>
          )}
        </div>
        <Link href="/magazine/1" style={{
          padding: "8px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
          color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 6,
          textDecoration: "none", whiteSpace: "nowrap",
        }}>
          FULL ISSUE
        </Link>
        <div style={{ textAlign: "right" }}>
          {nextArticle && (
            <Link href={`/magazine/article/${nextArticle.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>NEXT →</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{nextArticle.title}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

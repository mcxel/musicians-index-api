import type { Metadata } from "next";
import EditorialMagazineShell from "@/components/editorial/EditorialMagazineShell";
import EditorialPageFrame from "@/components/editorial/EditorialPageFrame";
import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import { injectAds } from "@/lib/editorial/editorialAdInjector";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "news") return { title: "News | TMI" };
  return {
    title: `${article.title} | News | The Musician's Index`,
    description: article.headline,
    alternates: { canonical: `/articles/news/${params.slug}` },
  };
}
import { categoryToSectionLabel } from "@/lib/editorial/editorialRoutingResolver";
import { resolveTemplate } from "@/lib/editorial/editorialPageEngine";

interface Props {
  params: { slug: string };
}

function ArticleNotFoundFallback({ slug }: { slug: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>STORY LOADING</div>
      <h1 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, marginBottom: 12, maxWidth: 560 }}>
        This story is being prepared for the current issue
      </h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 480, lineHeight: 1.7, marginBottom: 32 }}>
        The article <strong style={{ color: "#FFD700" }}>/{slug}</strong> is queued for the magazine. In the meantime, explore live rooms, the current issue, or featured stories below.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/articles" style={{ padding: "10px 22px", background: "#FFD700", color: "#050510", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none", letterSpacing: 1 }}>ALL STORIES</a>
        <a href="/magazine" style={{ padding: "10px 22px", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none", letterSpacing: 1 }}>MAGAZINE</a>
        <a href="/live/lobby" style={{ padding: "10px 22px", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, borderRadius: 8, textDecoration: "none", letterSpacing: 1 }}>WATCH LIVE</a>
        <a href="/join" style={{ padding: "10px 22px", background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none", letterSpacing: 1 }}>JOIN TMI</a>
      </div>
    </div>
  );
}

export default function NewsArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "news") return <ArticleNotFoundFallback slug={params.slug} />;

  const accentColor = "#FFD700";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("news")}
      backRoute="/articles"
      backLabel="← News"
      category="news"
    >
      <EditorialPageFrame
        article={article}
        templateType={template}
        accentColor={accentColor}
        profileRoute={null}
        ads={ads}
      />
    </EditorialMagazineShell>
  );
}

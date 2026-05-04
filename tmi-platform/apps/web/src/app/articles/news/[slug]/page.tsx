import { notFound } from "next/navigation";
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

export default function NewsArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "news") notFound();

  const accentColor = "#FFD700";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("news")}
      backRoute="/articles"
      backLabel="← News"
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

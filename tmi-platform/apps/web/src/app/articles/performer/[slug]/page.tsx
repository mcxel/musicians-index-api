import { notFound } from "next/navigation";
import EditorialMagazineShell from "@/components/editorial/EditorialMagazineShell";
import EditorialPageFrame from "@/components/editorial/EditorialPageFrame";
import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import { injectAds } from "@/lib/editorial/editorialAdInjector";
import { articleToProfileRoute, categoryToSectionLabel } from "@/lib/editorial/editorialRoutingResolver";
import { resolveTemplate } from "@/lib/editorial/editorialPageEngine";

interface Props {
  params: { slug: string };
}

export default function PerformerArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "performer") notFound();

  const accentColor = "#FF2DAA";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const profileRoute = articleToProfileRoute("performer", article.relatedPerformerSlug);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("performer")}
      backRoute="/performers"
      backLabel="← Performers"
      category="performer"
    >
      <EditorialPageFrame
        article={article}
        templateType={template}
        accentColor={accentColor}
        profileRoute={profileRoute}
        ads={ads}
      />
    </EditorialMagazineShell>
  );
}

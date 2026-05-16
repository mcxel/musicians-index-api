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

export default function AdArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "advertiser") notFound();

  const accentColor = "#00E5FF";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const profileRoute = articleToProfileRoute("advertiser", article.relatedAdvertiserSlug);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("advertiser")}
      backRoute="/advertisers"
      backLabel="← Advertisers"
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

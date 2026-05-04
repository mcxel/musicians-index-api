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

export default function SponsorArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "sponsor") notFound();

  const accentColor = "#AA2DFF";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const profileRoute = articleToProfileRoute("sponsor", article.relatedSponsorSlug);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("sponsor")}
      backRoute="/sponsors"
      backLabel="← Sponsors"
      category="sponsor"
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

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

export default function ArtistArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "artist") notFound();

  const accentColor = "#00FFFF";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const profileRoute = articleToProfileRoute("artist", article.relatedArtistSlug);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("artist")}
      backRoute="/artists"
      backLabel="← Artists"
      category="artist"
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

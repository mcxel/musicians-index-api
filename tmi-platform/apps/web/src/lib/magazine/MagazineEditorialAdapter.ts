import type { NewsArticle } from "@/lib/editorial/NewsArticleModel";
import type { MagazineArticle } from "@/lib/magazine/MagazineArticleResolver";

const categoryMap: Record<string, NewsArticle["category"]> = {
  artist: "artist",
  performer: "performer",
  sponsor: "sponsor",
  news: "news",
  interview: "interview",
  advertiser: "advertiser",
};

function toCategory(category: string): NewsArticle["category"] {
  return categoryMap[category] ?? "news";
}

function toTemplateType(category: NewsArticle["category"]): NewsArticle["templateType"] {
  if (category === "news") return "D";
  if (category === "sponsor") return "C";
  return "A";
}

function toAccentColor(category: NewsArticle["category"]): string {
  if (category === "artist") return "#00FFFF";
  if (category === "performer") return "#FF2DAA";
  if (category === "sponsor") return "#AA2DFF";
  if (category === "news") return "#FFD700";
  return "#00FFFF";
}

export function magazineToEditorialArticle(article: MagazineArticle): NewsArticle {
  const category = toCategory(article.category);
  const accentColor = toAccentColor(category);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    headline: article.title,
    snippet: article.summary,
    body: article.body.split(/\n\n+/).filter(Boolean),
    category,
    templateType: toTemplateType(category),
    publishedAt: article.publishedAt,
    author: article.author,
    heroImage: article.coverMedia,
    heroColor: accentColor,
    accentColor,
    relatedArtistSlug: category === "artist" ? article.slug : undefined,
    relatedPerformerSlug: category === "performer" ? article.slug : undefined,
    relatedSponsorSlug: category === "sponsor" ? article.slug : undefined,
    sponsorPlacementIds: article.sponsorAttached ? ["sp-tmi-official-001"] : [],
    advertiserPlacementIds: article.monetized ? ["ad-beatmarket-001"] : [],
    tags: article.tags,
  };
}

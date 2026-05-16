import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { MAGAZINE_ISSUE_1 } from "./magazineIssueData";

export type MagazineArticleSourceType = "staff" | "writer" | "bot" | "artist" | "performer" | "sponsor";

export type MagazineArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverMedia: string;
  author: string;
  source: string;
  sourceType: MagazineArticleSourceType;
  category: string;
  genre: string;
  tags: string[];
  monetized: boolean;
  payoutEligible: boolean;
  rewardPoints: number;
  sponsorAttached: boolean;
  engagementValue: number;
  trustScore: number;
  publishedAt: string;
  minimumReadSeconds: number;
};

const FALLBACK_COVER = "/artists/artist-01.png";

function fromEditorial() {
  return EDITORIAL_ARTICLES.map<MagazineArticle>((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.snippet,
    body: article.body.join("\n\n"),
    coverMedia: article.heroImage ?? FALLBACK_COVER,
    author: article.author,
    source: "TMI Editorial",
    sourceType:
      article.category === "artist"
        ? "artist"
        : article.category === "performer"
          ? "performer"
          : article.category === "sponsor"
            ? "sponsor"
            : "staff",
    category: article.category,
    genre: article.tags[0] ?? "music",
    tags: article.tags,
    monetized: true,
    payoutEligible: true,
    rewardPoints: 5,
    sponsorAttached: article.sponsorPlacementIds.length > 0,
    engagementValue: Math.min(100, 35 + article.tags.length * 8),
    trustScore: 88,
    publishedAt: article.publishedAt,
    minimumReadSeconds: 40,
  }));
}

function fromMagazineIssue() {
  return MAGAZINE_ISSUE_1.map<MagazineArticle>((article, index) => ({
    id: `mag-${index + 1}`,
    title: article.title,
    slug: article.slug,
    summary: article.subtitle,
    body: article.blocks.map((block) => block.text).filter(Boolean).join("\n\n"),
    coverMedia: FALLBACK_COVER,
    author: article.author,
    source: "TMI Magazine",
    sourceType: "staff",
    category: article.category,
    genre: article.tags[0] ?? "editorial",
    tags: article.tags,
    monetized: true,
    payoutEligible: true,
    rewardPoints: 4,
    sponsorAttached: article.category === "editorial",
    engagementValue: Math.min(100, 30 + article.tags.length * 7),
    trustScore: 92,
    publishedAt: article.publishedAt,
    minimumReadSeconds: 35,
  }));
}

const canonicalArticleMap = new Map<string, MagazineArticle>();

for (const article of [...fromEditorial(), ...fromMagazineIssue()]) {
  if (!canonicalArticleMap.has(article.slug)) {
    canonicalArticleMap.set(article.slug, article);
  }
}

export function getMagazineArticleBySlug(slug: string): MagazineArticle | null {
  return canonicalArticleMap.get(slug) ?? null;
}

export function listMagazineArticles(): MagazineArticle[] {
  return [...canonicalArticleMap.values()].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function listMagazineArticlesByCategory(category: string): MagazineArticle[] {
  return listMagazineArticles().filter((article) => article.category === category);
}

export function resolveMagazineArticleRoute(slug: string, category?: string): string {
  if (category === "news") return `/articles/news/${slug}`;
  if (category === "artist") return `/articles/artist/${slug}`;
  if (category === "performer") return `/articles/performer/${slug}`;
  if (category === "sponsor") return `/articles/sponsor/${slug}`;
  return `/magazine/article/${slug}`;
}

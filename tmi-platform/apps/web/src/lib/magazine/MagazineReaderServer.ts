import "server-only";

import { buildCanonicalMagazineIssueSlots } from "@/lib/magazine/MagazineRotationEngine";
import { getArticleBySlug } from "@/lib/magazine/getArticleBySlug";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import { MAGAZINE_DEFAULT_START_PAGE } from "@/lib/magazine/MagazineReaderUrls";

/**
 * Server magazine reader helpers (page index + crawl text).
 * Keep out of client entry paths — use MagazineReaderUrls for URL builders.
 */
export async function findMagazineArticlePageIndex(slug: string, issueKey = "current"): Promise<number> {
  const slots = await buildCanonicalMagazineIssueSlots(issueKey);
  const slotIndex = slots.findIndex((slot) => slot.articleSlug === slug);
  if (slotIndex >= 0) return slotIndex + 1;

  const registryIndex = MAGAZINE_ISSUE_1.findIndex((article) => article.slug === slug);
  if (registryIndex >= 0) {
    return Math.min(registryIndex + 1, Math.max(slots.length, 1));
  }

  return MAGAZINE_DEFAULT_START_PAGE;
}

export async function resolveMagazineReaderPageIndex(
  slug: string | undefined,
  explicitPage: number | undefined,
  issueKey = "current",
): Promise<number> {
  if (explicitPage !== undefined && Number.isFinite(explicitPage) && explicitPage >= 0) {
    return explicitPage;
  }
  if (slug) {
    return findMagazineArticlePageIndex(slug, issueKey);
  }
  return MAGAZINE_DEFAULT_START_PAGE;
}

export async function getMagazineArticleCrawlText(slug: string): Promise<{
  title: string;
  deck: string;
  author: string;
  publishedAt: string;
  body: string;
} | null> {
  const article = await getArticleBySlug(slug);
  if (!article) return null;

  const body = article.blocks
    .map((block) => {
      if (block.type === "heading" && block.text) return block.text;
      if ((block.type === "paragraph" || block.type === "pullquote") && block.text) {
        return block.text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");

  return {
    title: article.title,
    deck: article.subtitle,
    author: article.author,
    publishedAt: article.publishedAt,
    body,
  };
}

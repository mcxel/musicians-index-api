import { buildCanonicalMagazineIssueSlots } from "@/lib/magazine/MagazineRotationEngine";
import { getArticleBySlug, MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

/** Canonical magazine reader — one-action entry for all magazine content. */
export const MAGAZINE_CANONICAL_READER = "/magazine/issue/current";

/** First interior spread (skip cover landing). */
export const MAGAZINE_DEFAULT_START_PAGE = 1;

export function magazineReaderArticleUrl(
  slug: string,
  options?: { from?: string; page?: number },
): string {
  const params = new URLSearchParams({ article: slug });
  if (options?.page !== undefined && options.page > 0) {
    params.set("page", String(options.page));
  }
  if (options?.from) {
    params.set("from", options.from);
  }
  return `${MAGAZINE_CANONICAL_READER}?${params.toString()}`;
}

export function magazineReaderUrl(options?: { from?: string; page?: number }): string {
  if (!options?.from && options?.page === undefined) {
    return `${MAGAZINE_CANONICAL_READER}?page=${MAGAZINE_DEFAULT_START_PAGE}`;
  }
  const params = new URLSearchParams();
  if (options.page !== undefined && options.page > 0) {
    params.set("page", String(options.page));
  } else {
    params.set("page", String(MAGAZINE_DEFAULT_START_PAGE));
  }
  if (options?.from) params.set("from", options.from);
  return `${MAGAZINE_CANONICAL_READER}?${params.toString()}`;
}

/**
 * Resolve spread index for an article slug inside the current issue layout.
 * Returns cover (0) when unknown.
 */
export function findMagazineArticlePageIndex(slug: string, issueKey = "current"): number {
  const slots = buildCanonicalMagazineIssueSlots(issueKey);
  const slotIndex = slots.findIndex((slot) => slot.articleSlug === slug);
  if (slotIndex >= 0) return slotIndex + 1;

  const registryIndex = MAGAZINE_ISSUE_1.findIndex((article) => article.slug === slug);
  if (registryIndex >= 0) {
    return Math.min(registryIndex + 1, Math.max(slots.length, 1));
  }

  return MAGAZINE_DEFAULT_START_PAGE;
}

export function resolveMagazineReaderPageIndex(
  slug: string | undefined,
  explicitPage: number | undefined,
  issueKey = "current",
): number {
  if (explicitPage !== undefined && Number.isFinite(explicitPage) && explicitPage >= 0) {
    return explicitPage;
  }
  if (slug) {
    return findMagazineArticlePageIndex(slug, issueKey);
  }
  return MAGAZINE_DEFAULT_START_PAGE;
}

export function getMagazineArticleCrawlText(slug: string): {
  title: string;
  deck: string;
  author: string;
  publishedAt: string;
  body: string;
} | null {
  const article = getArticleBySlug(slug);
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

/**
 * Client-safe magazine reader URL helpers.
 * Must never import Prisma, editorial engines, or MagazineRotationEngine.
 * Server page-index / crawl helpers live in MagazineReaderServer.ts.
 */

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
  if (options?.page !== undefined && options.page > 0) {
    params.set("page", String(options.page));
  } else {
    params.set("page", String(MAGAZINE_DEFAULT_START_PAGE));
  }
  if (options?.from) params.set("from", options.from);
  return `${MAGAZINE_CANONICAL_READER}?${params.toString()}`;
}

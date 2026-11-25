/**
 * MagazineNewsStoryPresentation — decide IMAGE vs TEXT_ONLY for a news story.
 * Never invent photography. Never use mag-* stock. Never show tmi-placeholder
 * as if it were the article photo — text-only styled container instead.
 */

import type { MagazineArticle } from "./magazineIssueData";
import {
  isUnauthorizedMagazineStockPath,
  resolveAuthorizedMagazineImageUrl,
} from "./MagazineImageProvenance";
import {
  displayImageUrlForRecord,
  readableBodyForRecord,
  type MagazineIngestedNewsRecord,
} from "./MagazineNewsIngestionContract";

export type NewsStoryVisualMode = "IMAGE" | "TEXT_ONLY";

export type PresentedNewsStory = {
  id: string;
  headline: string;
  deck: string | null;
  body: string | null;
  visualMode: NewsStoryVisualMode;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  editorialReviewRequired: boolean;
  /** In-platform route or publisher URL used for the primary CTA. */
  href: string;
  /**
   * True when the primary full-article CTA must open the original publisher
   * (referral law). False for TMI-owned EditorialSubmission reading.
   */
  isExternalSource: boolean;
};

/** External http(s) publisher URL suitable for referral CTA. */
export function resolveExternalArticleUrl(story: {
  sourceUrl: string | null;
  href: string;
  isExternalSource: boolean;
}): string | null {
  if (!story.isExternalSource) return null;
  const candidate = story.sourceUrl?.trim() || story.href.trim();
  if (!candidate) return null;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function firstAuthorizedArticleImage(article: MagazineArticle): string | null {
  for (const b of article.blocks) {
    if (b.type === "image" && b.url && !isUnauthorizedMagazineStockPath(b.url)) {
      const r = resolveAuthorizedMagazineImageUrl(b.url);
      if (r.classification === "AUTHORIZED") return r.url;
    }
  }
  for (const g of article.galleryImages ?? []) {
    if (!isUnauthorizedMagazineStockPath(g.url)) {
      const r = resolveAuthorizedMagazineImageUrl(g.url);
      if (r.classification === "AUTHORIZED") return r.url;
    }
  }
  return null;
}

export function presentMagazineArticleAsNewsStory(
  article: MagazineArticle,
  href: string,
): PresentedNewsStory {
  const imageUrl = firstAuthorizedArticleImage(article);
  const body =
    article.blocks
      .filter((b) => b.type === "paragraph" || b.type === "heading")
      .map((b) => b.text)
      .filter(Boolean)
      .join("\n\n") || article.subtitle;

  return {
    id: article.slug,
    headline: article.title,
    deck: article.subtitle,
    body,
    visualMode: imageUrl ? "IMAGE" : "TEXT_ONLY",
    imageUrl,
    sourceName: article.isSystemSource ? "TMI Newsroom" : null,
    sourceUrl: article.sourceUrls?.[0] ?? null,
    author: article.author,
    publishedAt: article.publishedAt,
    editorialReviewRequired: !imageUrl,
    href,
    // Staff / EditorialSubmission articles read in-platform; sourceUrls are attribution.
    isExternalSource: false,
  };
}

export function presentIngestedNewsRecord(
  record: MagazineIngestedNewsRecord,
): PresentedNewsStory {
  const rawImage = displayImageUrlForRecord(record);
  const imageUrl =
    rawImage && !isUnauthorizedMagazineStockPath(rawImage)
      ? resolveAuthorizedMagazineImageUrl(rawImage).classification === "AUTHORIZED"
        ? rawImage
        : null
      : null;

  return {
    id: record.recordId,
    headline: record.headline,
    deck: record.excerpt,
    body: readableBodyForRecord(record),
    visualMode: imageUrl ? "IMAGE" : "TEXT_ONLY",
    imageUrl,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    author: record.author,
    publishedAt: record.publishedAt,
    editorialReviewRequired: record.editorialReviewRequired || !imageUrl,
    // Referral law: canonicalUrl / sourceUrl are the publisher's article URL.
    href: record.canonicalUrl,
    isExternalSource: true,
  };
}

/** Pack 2–4 stories per magazine news page (deterministic chunking). */
export function chunkNewsStoriesForPages<T>(stories: T[], perPage = 3): T[][] {
  const size = Math.min(4, Math.max(2, Math.floor(perPage)));
  const pages: T[][] = [];
  for (let i = 0; i < stories.length; i += size) {
    const chunk = stories.slice(i, i + size);
    if (chunk.length) pages.push(chunk);
  }
  return pages;
}

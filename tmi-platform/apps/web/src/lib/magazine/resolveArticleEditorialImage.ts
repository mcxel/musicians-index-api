/**
 * Distinct editorial stills for Home 2 boards / Magazine Network.
 * Prefer performer registry media; else stable per-slug curated still.
 * Never reuse one shared carousel for every category (kills blueprint flash).
 */

import type { MagazineArticle } from "./magazineIssueData";
import { getPerformerBySlug } from "@/lib/performers/PerformerRegistry";

/** Distinct curated stills — indexed by stable slug hash, not shared across boards. */
const EDITORIAL_STILL_POOL = [
  "/tmi-curated/mag-20.jpg",
  "/tmi-curated/mag-28.jpg",
  "/tmi-curated/mag-35.jpg",
  "/tmi-curated/mag-42.jpg",
  "/tmi-curated/mag-50.jpg",
  "/tmi-curated/mag-58.jpg",
  "/tmi-curated/mag-66.jpg",
  "/tmi-curated/mag-74.jpg",
  "/tmi-curated/mag-82.jpg",
] as const;

function stableIndex(key: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return mod > 0 ? h % mod : 0;
}

export function resolveArticleEditorialImage(article: MagazineArticle): string {
  if (article.performerSlug) {
    const p = getPerformerBySlug(article.performerSlug);
    if (p) {
      if (p.coverImageUrl) return p.coverImageUrl;
      if (p.profileImageUrl) return p.profileImageUrl;
    }
  }

  const blockImage = article.blocks.find((b) => b.type === "image" && b.url)?.url;
  if (blockImage) return blockImage;

  return EDITORIAL_STILL_POOL[stableIndex(article.slug, EDITORIAL_STILL_POOL.length)]!;
}

export function resolveArticleAnimatedUrl(article: MagazineArticle): string | null {
  if (!article.performerSlug) return null;
  const p = getPerformerBySlug(article.performerSlug);
  return p?.motionPosterUrl ?? null;
}

export function resolveArticleVideoUrl(article: MagazineArticle): string | null {
  if (!article.performerSlug) return null;
  const p = getPerformerBySlug(article.performerSlug);
  return p?.introVideoUrl ?? null;
}

/** One distinct lead image per category board (latest article in that category). */
export function resolveCategoryBoardImages(
  articles: MagazineArticle[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of articles) {
    const img = resolveArticleEditorialImage(a);
    if (seen.has(img)) continue;
    seen.add(img);
    out.push(img);
    if (out.length >= 3) break;
  }
  // Pad with slug-stable pool picks that are still distinct from what we have.
  let i = 0;
  while (out.length < 3 && i < EDITORIAL_STILL_POOL.length) {
    const img = EDITORIAL_STILL_POOL[(stableIndex(articles[0]?.slug ?? "board", EDITORIAL_STILL_POOL.length) + i) % EDITORIAL_STILL_POOL.length]!;
    if (!seen.has(img)) {
      seen.add(img);
      out.push(img);
    }
    i++;
  }
  return out;
}

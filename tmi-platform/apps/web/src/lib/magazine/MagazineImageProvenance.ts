/**
 * MagazineImageProvenance — owner law 2026-11-12
 *
 * Never present unrelated curated/stock stills as authentic performer photography.
 * Missing approved media → platform placeholder + editorial-review flag.
 */

export const PLATFORM_MAGAZINE_PLACEHOLDER = "/images/tmi-placeholder.jpg";

/** Paths/hosts treated as non-authentic editorial substitutes. */
const STOCK_OR_SYNTHETIC_PATTERNS: RegExp[] = [
  /\/tmi-curated\/mag-\d+\.(jpe?g|png|webp)/i,
  /\/tmi-curated\/sponsor-placeholder\.(jpe?g|png|webp)/i,
  /unsplash\.com/i,
  /images\.unsplash\.com/i,
  /pexels\.com/i,
  /picsum\.photos/i,
  /via\.placeholder\.com/i,
  /placehold\.co/i,
  /loremflickr\.com/i,
  /dummyimage\.com/i,
];

export type MagazineImageClass =
  | "AUTHORIZED"
  | "PLATFORM_PLACEHOLDER"
  | "STOCK_BLOCKED";

export type MagazineImageProvenanceResult = {
  url: string;
  /** Original candidate before stock block (for audit only). */
  sourceUrl: string | null;
  classification: MagazineImageClass;
  needsEditorialReview: boolean;
  reason: string;
};

export function isUnauthorizedMagazineStockPath(url: string | null | undefined): boolean {
  if (!url) return false;
  return STOCK_OR_SYNTHETIC_PATTERNS.some((re) => re.test(url));
}

/**
 * Resolve a display URL for magazine surfaces.
 * Stock/curated-as-photo substitutes become the platform placeholder.
 */
export function resolveAuthorizedMagazineImageUrl(
  candidate: string | null | undefined,
): MagazineImageProvenanceResult {
  if (!candidate) {
    return {
      url: PLATFORM_MAGAZINE_PLACEHOLDER,
      sourceUrl: null,
      classification: "PLATFORM_PLACEHOLDER",
      needsEditorialReview: true,
      reason: "NO_IMAGE_CANDIDATE",
    };
  }

  if (candidate.includes("tmi-placeholder")) {
    return {
      url: PLATFORM_MAGAZINE_PLACEHOLDER,
      sourceUrl: candidate,
      classification: "PLATFORM_PLACEHOLDER",
      needsEditorialReview: true,
      reason: "EXPLICIT_PLATFORM_PLACEHOLDER",
    };
  }

  if (isUnauthorizedMagazineStockPath(candidate)) {
    return {
      url: PLATFORM_MAGAZINE_PLACEHOLDER,
      sourceUrl: candidate,
      classification: "STOCK_BLOCKED",
      needsEditorialReview: true,
      reason: "CURATED_OR_STOCK_SUBSTITUTE_BLOCKED",
    };
  }

  return {
    url: candidate,
    sourceUrl: candidate,
    classification: "AUTHORIZED",
    needsEditorialReview: false,
    reason: "AUTHORIZED_MEDIA_PATH",
  };
}

export type ArticleImageProvenanceRow = {
  articleSlug: string;
  performerSlug: string | null;
  classification: MagazineImageClass;
  displayUrl: string;
  sourceUrl: string | null;
  needsEditorialReview: boolean;
  reason: string;
};

// SectionPlacementValidator
// Validates that articles are placed in correct sections.
// Artist articles → artist surfaces. News → news surfaces. Sponsors → sponsor surfaces.

import type { ArticleClass, PlacementSurface } from "./types";
import { isArticleAllowedOnSurface } from "./ContentRotationAuthorityEngine";

export interface PlacementRequest {
  articleId: string;
  articleClass: ArticleClass;
  targetSurface: PlacementSurface;
}

export interface PlacementResult {
  valid: boolean;
  reason?: string;
  suggestion?: PlacementSurface;
}

// Maps article class → best default surfaces
const CLASS_DEFAULT_SURFACES: Record<ArticleClass, PlacementSurface[]> = {
  news:           ["homepage-2", "magazine-spread", "trending-rail", "news-rail"],
  artist:         ["artist-page", "magazine-spread", "discovery-rail", "homepage-5"],
  performer:      ["performer-page", "magazine-spread", "battle-page", "cypher-page"],
  sponsor:        ["sponsor-page", "magazine-spread", "homepage-4"],
  advertiser:     ["advertiser-page", "magazine-spread", "homepage-4"],
  venue:          ["venue-page", "magazine-spread", "homepage-4", "discovery-rail"],
  "battle-recap": ["battle-page", "homepage-5", "magazine-spread", "trending-rail"],
  "cypher-recap": ["cypher-page", "homepage-5", "magazine-spread", "trending-rail"],
  community:      ["homepage-2", "magazine-spread", "news-rail"],
  culture:        ["homepage-2", "magazine-spread", "trending-rail", "news-rail"],
  industry:       ["homepage-2", "news-rail", "magazine-spread"],
  "creator-tools":["magazine-spread", "artist-page", "performer-page"],
  "global-news":  ["homepage-2", "news-rail", "magazine-spread"],
  interview:      ["artist-page", "performer-page", "magazine-spread"],
  cartoon:        ["magazine-spread"],
  poll:           ["magazine-spread", "homepage-2"],
};

export function validatePlacement(req: PlacementRequest): PlacementResult {
  const allowed = isArticleAllowedOnSurface(req.articleClass, req.targetSurface);
  if (allowed) return { valid: true };

  const suggestion = CLASS_DEFAULT_SURFACES[req.articleClass]?.[0];
  return {
    valid: false,
    reason: `Article class "${req.articleClass}" is not permitted on surface "${req.targetSurface}".`,
    suggestion,
  };
}

export function getDefaultSurfaces(articleClass: ArticleClass): PlacementSurface[] {
  return CLASS_DEFAULT_SURFACES[articleClass] ?? ["magazine-spread"];
}

export function validateBatch(requests: PlacementRequest[]): Map<string, PlacementResult> {
  const results = new Map<string, PlacementResult>();
  for (const req of requests) {
    results.set(req.articleId, validatePlacement(req));
  }
  return results;
}

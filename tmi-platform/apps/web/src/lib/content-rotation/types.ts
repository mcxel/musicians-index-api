// Content Rotation Authority — Shared Types

export type ArticleClass =
  | "news"
  | "artist"
  | "performer"
  | "sponsor"
  | "advertiser"
  | "venue"
  | "battle-recap"
  | "cypher-recap"
  | "community"
  | "culture"
  | "industry"
  | "creator-tools"
  | "global-news"
  | "interview"
  | "cartoon"
  | "poll";

export type PlacementSurface =
  | "homepage-1" | "homepage-2" | "homepage-3" | "homepage-4" | "homepage-5"
  | "magazine-spread"
  | "artist-page"
  | "performer-page"
  | "battle-page"
  | "cypher-page"
  | "venue-page"
  | "sponsor-page"
  | "advertiser-page"
  | "trending-rail"
  | "news-rail"
  | "discovery-rail";

export type PlacementZone = "early" | "mid" | "late";

export interface RotationEntry {
  articleId: string;
  articleClass: ArticleClass;
  weight: number;
  lastShownAt?: number; // unix timestamp
  shownCount: number;
  surface?: PlacementSurface;
  score: number;
}

export interface FrequencyCap {
  articleId: string;
  surface: PlacementSurface;
  maxPerPeriod: number;
  periodMs: number; // e.g. 24 * 3600 * 1000
  shownTimestamps: number[];
}

export interface SurfaceClassRule {
  surface: PlacementSurface;
  allowedClasses: ArticleClass[];
  forbiddenClasses: ArticleClass[];
}

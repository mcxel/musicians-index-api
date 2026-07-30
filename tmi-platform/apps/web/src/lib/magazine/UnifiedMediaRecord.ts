/**
 * UnifiedMediaRecord — Home 2 Magazine Network media contract.
 *
 * Living magazine television rotates real sources (articles, YoPho, interviews,
 * reviews, live when applicable, sponsor, video_boost when eligible).
 * Isolated from Ranking Engine / orbital Home 1 surfaces.
 */

export type MagazineMediaKind =
  | "music_video_of_the_day"
  | "yopho_spotlight"
  | "interview"
  | "magazine_feature"
  | "review"
  | "new_release"
  | "snip"
  | "live_performance"
  | "video_boost"
  | "organic"
  | "sponsor";

/** Resolved presentation layer after fallback chain (never blueprint). */
export type MagazineMediaSurface =
  | "live"
  | "video"
  | "animated"
  | "editorial_image"
  | "empty";

export interface UnifiedMediaRecord {
  id: string;
  kind: MagazineMediaKind;
  title: string;
  subtitle?: string;
  /** Real article / YoPho / sponsor / live destination — never "#". */
  route: string;
  accentColor: string;
  sourceLabel: string;
  categoryKey: string;
  publishedAt?: string;
  performerSlug?: string;
  articleSlug?: string;
  /** Live stream URL when the source is actually live. */
  liveUrl?: string | null;
  /** Playable video (music video, snip, interview clip). */
  videoUrl?: string | null;
  /** Motion poster / short loop (Rule 2 animated layer). */
  animatedUrl?: string | null;
  /** Editorial still — last visual resort before honest empty. */
  editorialImageUrl?: string | null;
  /** Video Boost path — only set when an active boost purchase exists. */
  boostEligible?: boolean;
  boostWeight?: number;
  boostExpiresAt?: number;
}

export const MAGAZINE_KIND_LABELS: Record<MagazineMediaKind, string> = {
  music_video_of_the_day: "Music Video of the Day",
  yopho_spotlight: "YoPho Spotlight",
  interview: "Interview",
  magazine_feature: "Magazine Feature",
  review: "Review",
  new_release: "New Release",
  snip: "Snip",
  live_performance: "Live Performance",
  video_boost: "Video Boost",
  organic: "Organic",
  sponsor: "Sponsor",
};

/** Mix order for MagazineRotationScheduler (editorial → organic → boosted → interview…). */
export const MAGAZINE_KIND_MIX_ORDER: MagazineMediaKind[] = [
  "magazine_feature",
  "organic",
  "video_boost",
  "interview",
  "music_video_of_the_day",
  "yopho_spotlight",
  "review",
  "new_release",
  "live_performance",
  "snip",
  "sponsor",
];

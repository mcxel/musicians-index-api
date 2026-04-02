// packages/recommendations/src/recommendation.engine.ts
// Personalized discovery: collaborative filter + content-based + trending boost.

export type RecommendationType =
  | "artist"   | "article"  | "event"    | "venue"
  | "playlist" | "game"     | "item"     | "room";

export interface RecommendationResult {
  entityId: string;
  entityType: RecommendationType;
  score: number;          // 0-1 recommendation strength
  strategy: RecommendationStrategy;
  reason: string;         // human-readable: "Because you follow Hip Hop"
}

export type RecommendationStrategy =
  | "collaborative_filter"  // users like you also liked
  | "content_based"         // similar to your history
  | "trending_boost"        // trending in your genres
  | "local_first"           // your city/region
  | "sponsor_relevance"     // local sponsor matching
  | "discovery_first"       // never-seen zero-viewer rooms
  | "friend_activity"       // friends are here
  | "editorial_pick"        // human curated
  | "new_to_platform";      // recently joined artists

// ── DISCOVERY-FIRST INTEGRATION (Platform Law #1) ────────
// Recommendations for rooms MUST respect discovery-first.
// Zero-viewer rooms rank FIRST in room recommendations.
export function sortRoomsDiscoveryFirst(
  rooms: Array<{ roomId: string; viewerCount: number; score: number }>
): typeof rooms {
  return [...rooms].sort((a, b) => {
    // 0 viewers always first (Platform Law #1)
    if (a.viewerCount === 0 && b.viewerCount > 0) return -1;
    if (b.viewerCount === 0 && a.viewerCount > 0) return 1;
    // Among non-zero: sort by recommendation score
    return b.score - a.score;
  });
}

// ── RECOMMENDATION API ROUTES ─────────────────────────────
export const RECOMMENDATION_ROUTES = {
  "GET /api/recommendations/feed":       "Personalized home feed",
  "GET /api/recommendations/artists":    "Artists to follow",
  "GET /api/recommendations/rooms":      "Rooms to join (discovery-first ordered)",
  "GET /api/recommendations/events":     "Events near you",
  "GET /api/recommendations/items":      "Shop items you might like",
  "GET /api/recommendations/similar/:id":"Similar to this entity",
  "GET /api/recommendations/local":      "Local artists/venues/events",
};

// ── LOCAL SPONSOR MATCHING ─────────────────────────────────
// The core business model: local store → local artist → local community
export function matchLocalSponsor(
  artistCity: string,
  artistGenres: string[],
  sponsorCategory: string,
  sponsorCity: string
): number {
  let score = 0;
  if (artistCity === sponsorCity) score += 50;             // same city = strong match
  if (sponsorCategory === "music_gear") score += 20;       // music gear fits any artist
  if (sponsorCategory === "clothing") score += 15;         // merch-friendly
  const genreBoosts: Record<string, string[]> = {
    "hip_hop": ["streetwear", "headphones", "recording"],
    "jazz":    ["instruments", "vinyl", "venue"],
    "edm":     ["tech", "lighting", "energy_drinks"],
  };
  artistGenres.forEach(genre => {
    if (genreBoosts[genre]?.includes(sponsorCategory)) score += 10;
  });
  return Math.min(score, 100);
}

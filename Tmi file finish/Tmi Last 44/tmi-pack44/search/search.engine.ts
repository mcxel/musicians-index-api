// packages/search/src/search.engine.ts
// Meilisearch full-text search for artists, articles, events, venues, items.

export type SearchEntityType = "artist" | "article" | "event" | "venue" | "item" | "playlist" | "game";

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  slug?: string;
  imageUrl?: string;
  tags?: string[];
  score: number;       // relevance score
  highlight?: Record<string, string[]>; // matched text snippets
}

export interface SearchQuery {
  q: string;
  types?: SearchEntityType[];
  genres?: string[];
  city?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// ── MEILISEARCH INDEX CONFIGS ─────────────────────────────
export const SEARCH_INDEXES = {
  artists: {
    name: "tmi_artists",
    primaryKey: "id",
    searchableAttributes: ["stageName", "slug", "bio", "genres", "city", "state"],
    filterableAttributes: ["genres", "city", "state", "tier", "isVerified"],
    sortableAttributes: ["memberSince", "followerCount"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  },
  articles: {
    name: "tmi_articles",
    primaryKey: "id",
    searchableAttributes: ["title", "subtitle", "excerpt", "authorName", "tags"],
    filterableAttributes: ["status", "tags", "issueId", "authorId"],
    sortableAttributes: ["publishedAt", "views", "likes"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  },
  events: {
    name: "tmi_events",
    primaryKey: "id",
    searchableAttributes: ["title", "description", "venueName", "city", "artistNames"],
    filterableAttributes: ["status", "city", "state", "isVirtual", "isLivestreamed"],
    sortableAttributes: ["startsAt", "soldTickets"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  },
  venues: {
    name: "tmi_venues",
    primaryKey: "id",
    searchableAttributes: ["name", "slug", "city", "state", "venueType", "amenities"],
    filterableAttributes: ["city", "state", "venueType", "isVerified"],
    sortableAttributes: ["totalCapacity"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  },
  items: {
    name: "tmi_items",
    primaryKey: "id",
    searchableAttributes: ["name", "description", "tags", "category"],
    filterableAttributes: ["category", "rarity", "sourceType"],
    sortableAttributes: ["pointCost"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  },
} as const;

// ── SEARCH API ROUTES ────────────────────────────────────
export const SEARCH_ROUTES = {
  "GET /api/search":                  "Multi-entity search with type filter",
  "GET /api/search/artists":          "Artist-specific search",
  "GET /api/search/articles":         "Article search",
  "GET /api/search/events":           "Event search with date/location filters",
  "GET /api/search/venues":           "Venue search",
  "GET /api/search/items":            "Shop item search",
  "GET /api/search/suggestions":      "Autocomplete suggestions",
  "POST /api/search/index/:entity":   "Admin: trigger re-index",
};

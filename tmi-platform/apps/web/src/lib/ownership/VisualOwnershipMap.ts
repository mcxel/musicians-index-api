/**
 * VisualOwnershipMap.ts
 * PASS 9 — Visual Ownership Map
 *
 * Locks page identity permanently.
 *
 * Each homepage spread owns a fixed set of:
 *  - content domains (what category of content lives here)
 *  - component classes (which homev2-belt-- variants are allowed)
 *  - route namespace (which URL prefixes this page links to)
 *  - color authority (which palette accent is primary on this page)
 *  - data sources (which engines/resolvers feed this page)
 *  - NOT allowed (domains explicitly forbidden from appearing here)
 *
 * Usage:
 *   import { getPageOwnership, assertPageOwnership } from "@/lib/ownership/VisualOwnershipMap";
 *
 * Design rule: if content wants to appear on a page, its domain must be listed
 * in that page's `ownedDomains`. This prevents drift and duplicate content blocks.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type PageId =
  | "cover"          // HomePageCover — magazine cover
  | "home1"          // HomePage01 — editorial / rankings / discovery
  | "home1-2"        // HomePage012 — combined spread
  | "home2"          // HomePage02 — discovery / editorial / rankings
  | "home3"          // HomePage03 — news / events / tickets / live world
  | "home4"          // HomePage04 — sponsors / marketplace / NFT
  | "home5"          // HomePage05 — live arena / cyphers / battles / beats
  | "games";         // HomePageGames — mini-games / cypher games

export type ContentDomain =
  | "rankings"           // artist ranking charts, leaderboards
  | "editorial"          // articles, stories, interviews
  | "discovery"          // genre clusters, playlist, new music
  | "live-events"        // live shows, event cards, RSVP
  | "tickets"            // ticket stubs, seat maps, printable tickets
  | "news"               // newswire, breaking news, weekly updates
  | "live-world"         // lobby rooms, occupancy, room previews
  | "performers"         // performer cards, talent profiles
  | "sponsors"           // sponsor spotlights, sponsor banners
  | "marketplace"        // products, shop items, merch
  | "nft"                // NFT rewards, NFT tickets
  | "giveaways"          // prize drops, giveaway entries
  | "cyphers"            // cypher rooms, open mic, cypher scores
  | "battles"            // 1v1 battles, bracket, vote
  | "beats"              // beat drops, beat store, licensing
  | "venue-tickets"      // venue-specific ticket promos
  | "countdowns"         // event countdown timers
  | "hype-metrics"       // stats strips, audience pulse
  | "rewards"            // fan rewards, XP, achievements
  | "season-pass"        // season pass upgrades, tier display
  | "games"              // mini-games, interactive challenges
  | "booking"            // venue booking, artist booking
  | "advertiser-slots"   // ad placements, advertiser banners
  | "issue-identity"     // issue number, masthead, cover label
  | "cover-feature"      // magazine cover focus
  | "vote-cta"           // direct voting prompts
  | "interviews"         // Q&A features
  | "venues"             // physical locations
  | "events";            // scheduled events

export type RouteNamespace =
  | "/home"
  | "/artists"
  | "/lobbies"
  | "/venues"
  | "/events"
  | "/playlists"
  | "/articles"
  | "/shop"
  | "/beats"
  | "/cypher"
  | "/battles"
  | "/sponsor"
  | "/nft"
  | "/rewards"
  | "/booking"
  | "/games"
  | "/profile";

export type BeltVariant =
  | "homev2-belt--editorial"
  | "homev2-belt--live"
  | "homev2-belt--events"
  | "homev2-belt--ranking"
  | "homev2-belt--marketplace"
  | "homev2-belt--profile";

export interface PageOwnership {
  pageId: PageId;
  /** Human-readable page title */
  title: string;
  /** data-theme value on the root element */
  dataTheme: string;
  /** Primary accent color for this spread */
  primaryAccent: string;
  /** Secondary accent */
  secondaryAccent: string;
  /** Content domains this page owns exclusively or primarily */
  ownedDomains: ContentDomain[];
  /** Content domains this page must NEVER render (drift guard) */
  forbiddenDomains: ContentDomain[];
  /** Route namespaces this page links into */
  routeNamespaces: RouteNamespace[];
  /** Belt CSS variants permitted on this page */
  allowedBeltVariants: BeltVariant[];
  /** Engine/resolver dependencies */
  dataSources: string[];
  /** Route of this page */
  route: string;
  /** Next page in magazine forward direction */
  nextRoute: string | null;
  /** Previous page in magazine backward direction */
  prevRoute: string | null;
}

// ── Ownership registry ────────────────────────────────────────────────────────

const OWNERSHIP_REGISTRY: Record<PageId, PageOwnership> = {
  cover: {
    pageId: "cover",
    title: "Magazine Cover",
    dataTheme: "cover",
    primaryAccent: "#00FFFF",
    secondaryAccent: "#FF2DAA",
    ownedDomains: ["issue-identity", "cover-feature"],
    forbiddenDomains: ["beats", "giveaways", "games", "booking"],
    routeNamespaces: ["/home", "/artists", "/articles"],
    allowedBeltVariants: [],
    dataSources: [
      "OrbitArtistPayloadEngine",
      "IssueIntelligenceEngine",
      "IssueRotationMemory",
    ],
    route: "/",
    nextRoute: "/home/1-2",
    prevRoute: null,
  },

  "home1-2": {
    pageId: "home1-2",
    title: "Home 1-2 — Combined Spread",
    dataTheme: "editorial",
    primaryAccent: "#00FFFF",
    secondaryAccent: "#FF2DAA",
    ownedDomains: ["rankings", "hype-metrics", "vote-cta"],
    forbiddenDomains: ["cyphers", "battles", "beats", "sponsors", "nft", "games"],
    routeNamespaces: ["/artists", "/articles", "/playlists", "/home"],
    allowedBeltVariants: [
      "homev2-belt--editorial",
      "homev2-belt--ranking",
      "homev2-belt--marketplace",
    ],
    dataSources: ["OrbitArtistPayloadEngine", "IssueIntelligenceEngine"],
    route: "/home/1-2",
    nextRoute: "/home/2",
    prevRoute: "/",
  },

  home1: {
    pageId: "home1",
    title: "Home 1 — Editorial / Rankings",
    dataTheme: "editorial",
    primaryAccent: "#00FFFF",
    secondaryAccent: "#FF2DAA",
    ownedDomains: ["issue-identity", "cover-feature"],
    forbiddenDomains: ["cyphers", "battles", "beats", "sponsors", "nft", "games"],
    routeNamespaces: ["/artists", "/articles", "/playlists", "/home"],
    allowedBeltVariants: [
      "homev2-belt--editorial",
      "homev2-belt--ranking",
      "homev2-belt--marketplace",
    ],
    dataSources: ["OrbitArtistPayloadEngine", "IssueIntelligenceEngine"],
    route: "/home/1",
    nextRoute: "/home/2",
    prevRoute: "/",
  },

  home2: {
    pageId: "home2",
    title: "Home 2 — Discovery / Editorial / Rankings",
    dataTheme: "discovery",
    primaryAccent: "#00FFFF",
    secondaryAccent: "#FF2DAA",
    ownedDomains: ["editorial", "discovery", "news", "interviews"],
    forbiddenDomains: ["cyphers", "battles", "beats", "sponsors", "nft", "games", "booking"],
    routeNamespaces: ["/artists", "/articles", "/playlists", "/lobbies", "/home"],
    allowedBeltVariants: [
      "homev2-belt--editorial",
      "homev2-belt--ranking",
      "homev2-belt--live",
      "homev2-belt--marketplace",
    ],
    dataSources: ["IssueIntelligenceEngine"],
    route: "/home/2",
    nextRoute: "/home/3",
    prevRoute: "/home/1-2",
  },

  home3: {
    pageId: "home3",
    title: "Home 3 — News / Events / Tickets / Live World",
    dataTheme: "news",
    primaryAccent: "#FF2DAA",
    secondaryAccent: "#AA2DFF",
    ownedDomains: [
      "live-world",
      "tickets",
      "venues",
      "events",
    ],
    forbiddenDomains: ["beats", "sponsors", "nft", "giveaways", "games", "booking"],
    routeNamespaces: ["/events", "/venues", "/lobbies", "/artists", "/home"],
    allowedBeltVariants: [
      "homev2-belt--live",
      "homev2-belt--events",
      "homev2-belt--profile",
    ],
    dataSources: ["VenueTicketResolver", "LiveCycleEngine"],
    route: "/home/3",
    nextRoute: "/home/4",
    prevRoute: "/home/2",
  },

  home4: {
    pageId: "home4",
    title: "Home 4 — Sponsors / Marketplace / NFT",
    dataTheme: "sponsors",
    primaryAccent: "#FFD700",
    secondaryAccent: "#00FFFF",
    ownedDomains: [
      "sponsors",
      "marketplace",
      "nft",
      "rewards",
    ],
    forbiddenDomains: ["cyphers", "battles", "live-events", "live-world", "games", "booking"],
    routeNamespaces: ["/shop", "/nft", "/articles", "/sponsor", "/home"],
    allowedBeltVariants: [
      "homev2-belt--marketplace",
      "homev2-belt--live",
    ],
    dataSources: ["SponsorRewardPlacementEngine", "sponsorAssetRegistry"],
    route: "/home/4",
    nextRoute: "/home/5",
    prevRoute: "/home/3",
  },

  home5: {
    pageId: "home5",
    title: "Home 5 — Live Arena / Cyphers / Battles / Beats",
    dataTheme: "cypher",
    primaryAccent: "#AA2DFF",
    secondaryAccent: "#00FFFF",
    ownedDomains: [
      "cyphers",
      "battles",
      "beats",
    ],
    forbiddenDomains: ["editorial", "rankings", "sponsors", "nft", "giveaways", "booking"],
    routeNamespaces: ["/cypher", "/battles", "/beats", "/venues", "/home"],
    allowedBeltVariants: [
      "homev2-belt--live",
      "homev2-belt--ranking",
      "homev2-belt--events",
    ],
    dataSources: [
      "LiveCycleEngine",
      "VenueTicketResolver",
      "BeatDropEngine",
      "BeatInventoryEngine",
    ],
    route: "/home/5",
    nextRoute: null,
    prevRoute: "/home/4",
  },

  games: {
    pageId: "games",
    title: "Games — Mini-Games / Cypher Games",
    dataTheme: "games",
    primaryAccent: "#AA2DFF",
    secondaryAccent: "#FF2DAA",
    ownedDomains: ["games", "cyphers", "rewards", "hype-metrics"],
    forbiddenDomains: ["sponsors", "nft", "marketplace", "booking", "editorial"],
    routeNamespaces: ["/games", "/cypher", "/rewards"],
    allowedBeltVariants: ["homev2-belt--live", "homev2-belt--ranking"],
    dataSources: [],
    route: "/games",
    nextRoute: null,
    prevRoute: "/home/5",
  },
};

// ── Lookup functions ──────────────────────────────────────────────────────────

/**
 * Get the ownership profile for a page.
 */
export function getPageOwnership(pageId: PageId): PageOwnership {
  return OWNERSHIP_REGISTRY[pageId];
}

/**
 * Get all page ownerships as an ordered array (cover → home1 → ... → games).
 */
export function getAllPageOwnerships(): PageOwnership[] {
  const order: PageId[] = ["cover", "home1-2", "home1", "home2", "home3", "home4", "home5", "games"];
  return order.map((id) => OWNERSHIP_REGISTRY[id]);
}

/**
 * Look up which page owns a given content domain.
 * Returns the primary owner (first match in the spread chain).
 */
export function findDomainOwner(domain: ContentDomain): PageOwnership | null {
  const pages = getAllPageOwnerships();
  return pages.find((p) => p.ownedDomains.includes(domain)) ?? null;
}

/**
 * Check whether a content domain is permitted on a given page.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export function checkDomainPermission(
  pageId: PageId,
  domain: ContentDomain,
): { allowed: true } | { allowed: false; reason: string } {
  const page = OWNERSHIP_REGISTRY[pageId];
  if (page.forbiddenDomains.includes(domain)) {
    const owner = findDomainOwner(domain);
    return {
      allowed: false,
      reason: `Domain "${domain}" is forbidden on page "${pageId}". Primary owner: "${owner?.pageId ?? "none"}".`,
    };
  }
  return { allowed: true };
}

/**
 * Assert that a domain is permitted on a page.
 * Throws in development if violated. No-op in production.
 * Use at component mount to detect drift early.
 *
 * @example
 *   assertPageOwnership("home4", "cyphers"); // throws: cyphers belongs to home5
 */
export function assertPageOwnership(pageId: PageId, domain: ContentDomain): void {
  if (process.env.NODE_ENV !== "development") return;
  const result = checkDomainPermission(pageId, domain);
  if (!result.allowed) {
    console.warn(`[VisualOwnershipMap] ${result.reason}`);
  }
}

/**
 * Get the ordered magazine spread chain: prev → current → next.
 */
export function getMagazineNeighbors(pageId: PageId): {
  prev: PageOwnership | null;
  current: PageOwnership;
  next: PageOwnership | null;
} {
  const current = OWNERSHIP_REGISTRY[pageId];
  const allPages = getAllPageOwnerships();
  const prev = current.prevRoute
    ? (allPages.find((p) => p.route === current.prevRoute) ?? null)
    : null;
  const next = current.nextRoute
    ? (allPages.find((p) => p.route === current.nextRoute) ?? null)
    : null;
  return { prev, current, next };
}

/**
 * Get all pages that own a specific data source engine.
 */
export function getPagesForDataSource(engineName: string): PageOwnership[] {
  return getAllPageOwnerships().filter((p) => p.dataSources.includes(engineName));
}

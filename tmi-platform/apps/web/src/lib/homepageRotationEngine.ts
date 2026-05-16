/**
 * homepageRotationEngine.ts
 *
 * Provides seed-data rotation groups for top-ten, trending beat,
 * sponsor, games-billboard, and crown/artist rail slots.
 *
 * Architecture note:
 *   - This is a pure utility module — no React, no fetch.
 *   - All consumers call `getRotationGroup(key)` to get the current
 *     rotation slice based on a wall-clock tick index.
 *   - useHomepageRotation drives the actual React tick.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type RotationKey =
  | "topTen"
  | "trendingBeats"
  | "sponsors"
  | "gamesBillboard"
  | "crownArtists"
  | "genres"
  | "discovery"
  | "cyphers"
  | "venues"
  | "rewards";

export interface RotationConfig {
  /** How long each slide is visible in milliseconds. */
  holdMs: number;
  /** Items in this group — any serialisable shape. */
  items: unknown[];
  /** How many items to expose per rotation tick. */
  pageSize: number;
}

// ─── Seed data pools ─────────────────────────────────────────────────────────

const TOP_TEN_POOL = [
  { rank: 1,  name: "KOVA",        genre: "Afrobeat Fusion",  score: 98400 },
  { rank: 2,  name: "Nera Vex",    genre: "Neo Soul",         score: 91200 },
  { rank: 3,  name: "Blaze Cartel",genre: "Trap",             score: 87800 },
  { rank: 4,  name: "Lila Sun",    genre: "R&B",              score: 84100 },
  { rank: 5,  name: "Drift Sound", genre: "Electronic",       score: 79300 },
  { rank: 6,  name: "Mack Ferro",  genre: "Drill",            score: 75600 },
  { rank: 7,  name: "Asha Wave",   genre: "Dancehall",        score: 71200 },
  { rank: 8,  name: "Terron B",    genre: "Hip Hop",          score: 68900 },
  { rank: 9,  name: "Solara",      genre: "Alt Pop",          score: 64400 },
  { rank: 10, name: "Kase Duro",   genre: "Amapiano",         score: 61800 },
];

const BEAT_POOL = [
  { id: "b1", title: "Crown Energy",    bpm: 140, genre: "Trap",     badge: "HOT" },
  { id: "b2", title: "Afro Pressure",   bpm: 102, genre: "Afrobeat", badge: "A1" },
  { id: "b3", title: "Night Circuit",   bpm: 128, genre: "House",    badge: "NEW" },
  { id: "b4", title: "Soul Drift",      bpm:  88, genre: "R&B",      badge: "A2" },
  { id: "b5", title: "Drill Session",   bpm: 144, genre: "Drill",    badge: "TOP" },
  { id: "b6", title: "Amapiano Waves",  bpm:  96, genre: "Amapiano", badge: "HOT" },
];

const SPONSOR_POOL = [
  { id: "sp1", name: "SoundBridge Pro", tier: "platinum", cta: "Explore Gear",     href: "/shop/soundbridge" },
  { id: "sp2", name: "VoxStream",       tier: "gold",     cta: "Start Streaming",  href: "/shop/voxstream" },
  { id: "sp3", name: "Crown Energy",    tier: "gold",     cta: "Get Yours",        href: "/shop/crown-energy" },
  { id: "sp4", name: "BeatForge",       tier: "silver",   cta: "Beat Marketplace", href: "/shop/beatforge" },
];

const GAMES_POOL = [
  { id: "dirty-dozens", title: "Dirty Dozens",    status: "LIVE",        href: "/games/dirty-dozens" },
  { id: "battles",      title: "Battles",         status: "LIVE",        href: "/games/battle" },
  { id: "cypher",       title: "Cypher Arena",    status: "LIVE",        href: "/games/cypher-arena" },
  { id: "dance-offs",   title: "Dance-Offs",      status: "QUEUE OPEN",  href: "/games/dance-offs" },
  { id: "trivia",       title: "Trivia / Poll",   status: "LIVE",        href: "/games/trivia" },
  { id: "stream-win",   title: "Stream & Win",    status: "LIVE",        href: "/games/stream-and-win" },
];

const CROWN_ARTISTS_POOL = [
  { name: "KOVA",        crown: true,  streak: 3 },
  { name: "Drift Sound", crown: false, streak: 0, isNew: true },
  { name: "Nera Vex",    crown: false, streak: 1 },
  { name: "Blaze Cartel",crown: false, streak: 2 },
];

const GENRE_POOL = [
  { slug: "afrobeat-fusion", label: "Afrobeat Fusion", heatScore: 92, trend: "rising" },
  { slug: "neo-soul",        label: "Neo Soul",         heatScore: 87, trend: "stable" },
  { slug: "trap",            label: "Trap",             heatScore: 84, trend: "rising" },
  { slug: "rb",              label: "R&B",              heatScore: 80, trend: "stable" },
  { slug: "drill",           label: "Drill",            heatScore: 76, trend: "falling" },
  { slug: "alt-pop",         label: "Alt Pop",          heatScore: 71, trend: "rising" },
];

const DISCOVERY_POOL = [
  { id: "d1", type: "playlist", title: "New Arrivals: Afrobeats Pack",    curator: "TMI Editorial",  plays: "4.2K" },
  { id: "d2", type: "playlist", title: "Crown Picks — This Week",          curator: "Crown AI",       plays: "6.8K" },
  { id: "d3", type: "artist",   title: "Rising: KOVA — Afrobeat Fusion",  curator: "TMI Charts",     plays: "9.1K" },
  { id: "d4", type: "artist",   title: "Trending: Nera Vex — Neo Soul",   curator: "TMI Charts",     plays: "7.4K" },
  { id: "d5", type: "playlist", title: "Late Night Drill Sessions",        curator: "DJ Mack",        plays: "3.3K" },
  { id: "d6", type: "playlist", title: "Amapiano x Dancehall Mix",         curator: "Community",      plays: "5.5K" },
];

const CYPHER_POOL = [
  { id: "cy1", room: "Crown Qualifier — R4",  status: "LIVE",     viewers: 1840, href: "/cypher/crown-qualifier" },
  { id: "cy2", room: "Genre Wars: Drill",      status: "LIVE",     viewers: 920,  href: "/cypher/genre-wars-drill" },
  { id: "cy3", room: "Open Mic Saturday",      status: "QUEUE",    viewers: 0,    href: "/cypher/open-mic" },
  { id: "cy4", room: "Afrobeat Cipher Circle", status: "UPCOMING", viewers: 0,    href: "/cypher/afrobeat-circle" },
  { id: "cy5", room: "R&B Showcase Night",     status: "UPCOMING", viewers: 0,    href: "/cypher/rb-showcase" },
  { id: "cy6", room: "Trap Summit S2",          status: "LIVE",     viewers: 1120, href: "/cypher/trap-summit" },
];

const VENUE_POOL = [
  { id: "vn1", name: "Crown Stage NYC",         type: "Arena",       capacity: 4000, status: "OPEN" },
  { id: "vn2", name: "Electric Blue Club",       type: "Club",        capacity: 350,  status: "LIVE TONIGHT" },
  { id: "vn3", name: "Studio Arena Dallas",      type: "Studio",      capacity: 800,  status: "BOOKING" },
  { id: "vn4", name: "Neon Vault Miami",          type: "Lounge",      capacity: 200,  status: "SOLD OUT" },
  { id: "vn5", name: "Rooftop Sessions LA",       type: "Outdoor",     capacity: 600,  status: "BOOKING" },
  { id: "vn6", name: "The Signal Chicago",        type: "Theater",     capacity: 1200, status: "UPCOMING" },
];

const REWARDS_POOL = [
  { id: "rw1", title: "Crown Points Cashout",      category: "POINTS",  value: "500 pts → $5",        href: "/rewards/cashout" },
  { id: "rw2", title: "Season Pass Upgrade",        category: "PASS",    value: "Free 7-day trial",    href: "/season-pass" },
  { id: "rw3", title: "Beat Store: 20% Off Pack",  category: "DEAL",    value: "This Weekend Only",   href: "/beats/marketplace" },
  { id: "rw4", title: "NFT Fan Badge Drop",         category: "NFT",     value: "Limited 1000 mint",   href: "/nft-lab" },
  { id: "rw5", title: "Invite 3 → Get Premium",    category: "INVITE",  value: "Share your link",     href: "/invite" },
  { id: "rw6", title: "Cypher Winner Bonus",        category: "BONUS",   value: "+250 pts if placed",  href: "/cypher" },
];

// ─── Rotation configs ─────────────────────────────────────────────────────────

export const ROTATION_CONFIGS: Record<RotationKey, RotationConfig> = {
  topTen:        { holdMs: 5000, items: TOP_TEN_POOL,      pageSize: 5 },
  trendingBeats: { holdMs: 5000, items: BEAT_POOL,         pageSize: 3 },
  sponsors:      { holdMs: 6000, items: SPONSOR_POOL,      pageSize: 2 },
  gamesBillboard:{ holdMs: 5000, items: GAMES_POOL,        pageSize: 6 },
  crownArtists:  { holdMs: 5000, items: CROWN_ARTISTS_POOL,pageSize: 2 },
  genres:        { holdMs: 5000, items: GENRE_POOL,        pageSize: 3 },
  discovery:     { holdMs: 6000, items: DISCOVERY_POOL,    pageSize: 3 },
  cyphers:       { holdMs: 5000, items: CYPHER_POOL,       pageSize: 3 },
  venues:        { holdMs: 6000, items: VENUE_POOL,        pageSize: 3 },
  rewards:       { holdMs: 6000, items: REWARDS_POOL,      pageSize: 3 },
};

// ─── Core utility ─────────────────────────────────────────────────────────────

/**
 * Returns the page of items for a given rotation key at the supplied tick index.
 * Wraps around: tick is taken modulo the total page count.
 */
export function getRotationPage<T = unknown>(key: RotationKey, tickIndex: number): T[] {
  const config = ROTATION_CONFIGS[key];
  const { items, pageSize } = config;
  const totalPages = Math.ceil(items.length / pageSize);
  const safeTick = tickIndex % totalPages;
  return items.slice(safeTick * pageSize, safeTick * pageSize + pageSize) as T[];
}

/**
 * Total page count for a rotation key.
 */
export function getPageCount(key: RotationKey): number {
  const { items, pageSize } = ROTATION_CONFIGS[key];
  return Math.ceil(items.length / pageSize);
}

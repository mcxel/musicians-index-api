import { SEO_BRAND } from "./SeoBrandConfig";

export interface TrendingEntry {
  rank: number;
  name: string;
  slug: string;
  genre: string;
  location: string;
  stateCode?: string;
  countryCode: string;
  type: "artist" | "battle" | "cypher" | "venue" | "song";
  score: number;
  route: string;
  badge?: string;
}

export interface TrendingPage {
  scope: "global" | "us" | "state" | "genre";
  label: string;
  slug: string;
  description: string;
  entries: TrendingEntry[];
  canonical: string;
  updatedAt: string;
}

const TRENDING_ARTISTS: TrendingEntry[] = [
  { rank: 1,  name: "Ray Journey",    slug: "ray-journey",    genre: "Hip-Hop",   location: "Atlanta, GA",     stateCode: "GA", countryCode: "US", type: "artist",  score: 9800, route: "/artists/ray-journey",    badge: "🏆" },
  { rank: 2,  name: "Nova Cipher",    slug: "nova-cipher",    genre: "Trap",      location: "Houston, TX",     stateCode: "TX", countryCode: "US", type: "artist",  score: 9400, route: "/artists/nova-cipher",    badge: "⚡" },
  { rank: 3,  name: "Lena Sky",       slug: "lena-sky",       genre: "R&B",       location: "Los Angeles, CA", stateCode: "CA", countryCode: "US", type: "artist",  score: 9100, route: "/artists/lena-sky",       badge: "🌟" },
  { rank: 4,  name: "Marcus Wave",    slug: "marcus-wave",    genre: "Pop",       location: "Chicago, IL",     stateCode: "IL", countryCode: "US", type: "artist",  score: 8700, route: "/artists/marcus-wave" },
  { rank: 5,  name: "Krypt",          slug: "krypt",          genre: "Hip-Hop",   location: "Detroit, MI",     stateCode: "MI", countryCode: "US", type: "artist",  score: 8500, route: "/artists/krypt" },
  { rank: 6,  name: "Zuri Bloom",     slug: "zuri-bloom",     genre: "Afrobeats", location: "Atlanta, GA",     stateCode: "GA", countryCode: "US", type: "artist",  score: 8200, route: "/artists/zuri-bloom",     badge: "🌍" },
  { rank: 7,  name: "DJ Storm",       slug: "dj-storm",       genre: "Electronic",location: "Miami, FL",       stateCode: "FL", countryCode: "US", type: "artist",  score: 7900, route: "/artists/dj-storm" },
  { rank: 8,  name: "Wavetek",        slug: "wavetek",        genre: "Trap",      location: "New York, NY",    stateCode: "NY", countryCode: "US", type: "artist",  score: 7600, route: "/artists/wavetek" },
  { rank: 9,  name: "Neon Vibe",      slug: "neon-vibe",      genre: "EDM",       location: "Las Vegas, NV",   stateCode: "NV", countryCode: "US", type: "artist",  score: 7300, route: "/artists/neon-vibe" },
  { rank: 10, name: "Sol Carter",     slug: "sol-carter",     genre: "Country",   location: "Nashville, TN",   stateCode: "TN", countryCode: "US", type: "artist",  score: 7100, route: "/artists/sol-carter" },
];

const TRENDING_BATTLES: TrendingEntry[] = [
  { rank: 1, name: "Grand Battle Week 16",       slug: "grand-battle-week-16",       genre: "Hip-Hop",   location: "Atlanta, GA", stateCode: "GA", countryCode: "US", type: "battle", score: 5200, route: "/battles/grand-battle-week-16",       badge: "⚔️" },
  { rank: 2, name: "Monday Night Cypher Ep.12",  slug: "monday-night-cypher-ep12",   genre: "All",       location: "Houston, TX", stateCode: "TX", countryCode: "US", type: "cypher", score: 4800, route: "/cypher/monday-night-cypher-ep12",     badge: "🎤" },
  { rank: 3, name: "Beat Battle Vol.5",          slug: "beat-battle-vol5",           genre: "Producer",  location: "New York, NY",stateCode: "NY", countryCode: "US", type: "battle", score: 4400, route: "/battles/beat-battle-vol5" },
];

const US_STATES: Record<string, { name: string; cities: string[] }> = {
  GA: { name: "Georgia",     cities: ["Atlanta", "Savannah", "Augusta"] },
  TX: { name: "Texas",       cities: ["Houston", "Dallas", "Austin", "San Antonio"] },
  CA: { name: "California",  cities: ["Los Angeles", "San Francisco", "Oakland", "San Diego"] },
  NY: { name: "New York",    cities: ["New York City", "Brooklyn", "Bronx", "Queens"] },
  FL: { name: "Florida",     cities: ["Miami", "Orlando", "Tampa", "Jacksonville"] },
  IL: { name: "Illinois",    cities: ["Chicago", "Rockford", "Aurora"] },
  TN: { name: "Tennessee",   cities: ["Nashville", "Memphis", "Knoxville"] },
  MI: { name: "Michigan",    cities: ["Detroit", "Grand Rapids", "Ann Arbor"] },
  NC: { name: "North Carolina", cities: ["Charlotte", "Raleigh", "Durham"] },
  NV: { name: "Nevada",      cities: ["Las Vegas", "Reno"] },
};

export function getTrendingGlobal(): TrendingPage {
  return {
    scope: "global",
    label: "Trending Worldwide",
    slug: "worldwide",
    description: `Top trending artists, battles, and cyphers on ${SEO_BRAND.PRODUCT_NAME} right now`,
    entries: TRENDING_ARTISTS.slice(0, 10),
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/trending`,
    updatedAt: new Date().toISOString(),
  };
}

export function getTrendingByState(stateCode: string): TrendingPage | null {
  const state = US_STATES[stateCode.toUpperCase()];
  if (!state) return null;
  const entries = TRENDING_ARTISTS
    .filter(e => e.stateCode === stateCode.toUpperCase())
    .concat(TRENDING_BATTLES.filter(e => e.stateCode === stateCode.toUpperCase()));
  return {
    scope: "state",
    label: `Trending in ${state.name}`,
    slug: stateCode.toLowerCase(),
    description: `Top trending independent artists and live music events in ${state.name} on ${SEO_BRAND.PRODUCT_NAME}`,
    entries: entries.length > 0 ? entries : TRENDING_ARTISTS.slice(0, 5),
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/trending/${stateCode.toLowerCase()}`,
    updatedAt: new Date().toISOString(),
  };
}

export function getAllStatePages(): { stateCode: string; name: string }[] {
  return Object.entries(US_STATES).map(([code, data]) => ({ stateCode: code, name: data.name }));
}

export function getTrendingBattles(): TrendingEntry[] {
  return TRENDING_BATTLES;
}

export function getTrendingWeeklyWinner(): TrendingEntry | null {
  return TRENDING_ARTISTS[0] ?? null;
}

export function getTrendingByGenre(genre: string): TrendingEntry[] {
  return TRENDING_ARTISTS.filter(e => e.genre.toLowerCase() === genre.toLowerCase());
}

export function getAllTrendingEntries(): TrendingEntry[] {
  return [...TRENDING_ARTISTS, ...TRENDING_BATTLES].sort((a, b) => b.score - a.score);
}

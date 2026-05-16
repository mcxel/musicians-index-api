/**
 * Slice 6 — Brick 1: Data Adapter Layer
 *
 * All zone UI components must pull content exclusively through these adapters.
 * Layout code never imports raw data directly. Adapters are the single seam.
 *
 * Three tiers:
 *   1. Mock/stable fallback (always available — never empty)
 *   2. Client-side live fetch (replaces fallback when available)
 *   3. Server-side async variant (for RSC pages)
 */

// ─── Shared types ────────────────────────────────────────────────────────────

export type ArtistRankEntry = {
  rank: number;
  name: string;
  genre: string;
  score: number;
  delta: number; // positive = rising, negative = falling, 0 = stable
  badge: string;
  isNew?: boolean;
};

export type GenreEntry = {
  slug: string;
  label: string;
  heatScore: number;
  trend: "rising" | "stable" | "falling";
  color: "cyan" | "magenta" | "gold" | "green" | "red";
};

export type PlaylistEntry = {
  id: string;
  title: string;
  curator: string;
  trackCount: number;
  badge: string;
  glow: "cyan" | "magenta" | "gold" | "green";
};

export type LiveRoomEntry = {
  id: string;
  title: string;
  host: string;
  viewerCount: number;
  isLive: boolean;
  badge: string;
  genre: string;
};

export type CypherEntry = {
  id: string;
  title: string;
  participant1: string;
  participant2: string;
  status: "live" | "upcoming" | "ended";
  startAt: string;
  hype: number; // 0-100
};

export type EventEntry = {
  id: string;
  title: string;
  venue: string;
  startsAt: string;
  badge: string;
  isSoldOut: boolean;
};

export type SponsorEntry = {
  id: string;
  name: string;
  tier: "platinum" | "gold" | "silver";
  logoUrl?: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
};

export type AdPlacementEntry = {
  id: string;
  headline: string;
  subline: string;
  badge: string;
  tier: "premium" | "standard";
};

export type NewsAlertEntry = {
  id: string;
  headline: string;
  category: string;
  publishedAt: string;
  isBreaking: boolean;
};

// ─── Mock data (fallback-safe, never empty) ───────────────────────────────────

const MOCK_GLOBAL_RANKING: ArtistRankEntry[] = [
  { rank: 1, name: "KOVA", genre: "Afrobeat Fusion", score: 98400, delta: 12, badge: "CROWN" },
  { rank: 2, name: "Nera Vex", genre: "Neo Soul", score: 91200, delta: -3, badge: "TOP" },
  { rank: 3, name: "Blaze Cartel", genre: "Trap", score: 87800, delta: 8, badge: "TOP" },
  { rank: 4, name: "Lila Sun", genre: "R&B", score: 84100, delta: 0, badge: "TOP" },
  { rank: 5, name: "Drift Sound", genre: "Electronic", score: 79300, delta: 22, badge: "RISING", isNew: true },
  { rank: 6, name: "Mack Ferro", genre: "Drill", score: 75600, delta: -8, badge: "TOP" },
  { rank: 7, name: "Asha Wave", genre: "Dancehall", score: 71200, delta: 5, badge: "TOP" },
  { rank: 8, name: "Terron B", genre: "Hip Hop", score: 68900, delta: 3, badge: "TOP" },
  { rank: 9, name: "Solara", genre: "Alt Pop", score: 64400, delta: 19, badge: "RISING" },
  { rank: 10, name: "Kase Duro", genre: "Amapiano", score: 61800, delta: 0, badge: "TOP" },
];

const MOCK_GENRE_RANKING: Array<{ genre: string; leader: ArtistRankEntry; count: number; trend: "rising" | "stable" | "falling" }> = [
  { genre: "Afrobeat Fusion", leader: MOCK_GLOBAL_RANKING[0], count: 312, trend: "rising" },
  { genre: "Neo Soul", leader: MOCK_GLOBAL_RANKING[1], count: 278, trend: "stable" },
  { genre: "Trap", leader: MOCK_GLOBAL_RANKING[2], count: 445, trend: "rising" },
  { genre: "R&B", leader: MOCK_GLOBAL_RANKING[3], count: 390, trend: "stable" },
  { genre: "Drill", leader: MOCK_GLOBAL_RANKING[5], count: 228, trend: "falling" },
];

const MOCK_RISING: ArtistRankEntry[] = MOCK_GLOBAL_RANKING.filter((a) => a.delta > 10);

const MOCK_GENRES: GenreEntry[] = [
  { slug: "afrobeat-fusion", label: "Afrobeat Fusion", heatScore: 92, trend: "rising", color: "gold" },
  { slug: "neo-soul", label: "Neo Soul", heatScore: 87, trend: "stable", color: "cyan" },
  { slug: "trap", label: "Trap", heatScore: 84, trend: "rising", color: "magenta" },
  { slug: "rb", label: "R&B", heatScore: 80, trend: "stable", color: "green" },
  { slug: "drill", label: "Drill", heatScore: 76, trend: "falling", color: "red" },
  { slug: "alt-pop", label: "Alt Pop", heatScore: 71, trend: "rising", color: "cyan" },
];

const MOCK_PLAYLISTS: PlaylistEntry[] = [
  { id: "pl-001", title: "Midnight Rotation", curator: "TMI Editorial", trackCount: 24, badge: "A1", glow: "magenta" },
  { id: "pl-002", title: "Highway Hooks", curator: "DJ Fenix", trackCount: 18, badge: "A2", glow: "cyan" },
  { id: "pl-003", title: "Backstage Warmup", curator: "StudioCrew", trackCount: 12, badge: "A3", glow: "green" },
  { id: "pl-004", title: "Main Stage Energy", curator: "TMI Live", trackCount: 30, badge: "NEW", glow: "gold" },
];

const MOCK_LIVE_ROOMS: LiveRoomEntry[] = [
  { id: "rm-001", title: "Main Lobby Preview", host: "DJ Fenix", viewerCount: 1842, isLive: true, badge: "LIVE", genre: "Trap" },
  { id: "rm-002", title: "Neo Soul Lounge", host: "Asha Wave", viewerCount: 634, isLive: true, badge: "LIVE", genre: "Neo Soul" },
  { id: "rm-003", title: "Drill Cypher Room", host: "Mack Ferro", viewerCount: 291, isLive: false, badge: "SOON", genre: "Drill" },
  { id: "rm-004", title: "Afrobeat Arena", host: "KOVA", viewerCount: 3100, isLive: true, badge: "LIVE", genre: "Afrobeat Fusion" },
];

const MOCK_CYPHERS: CypherEntry[] = [
  { id: "cy-001", title: "Crown Qualifier Round 4", participant1: "KOVA", participant2: "Blaze Cartel", status: "live", startAt: "now", hype: 94 },
  { id: "cy-002", title: "Genre Wars: Drill vs Trap", participant1: "Mack Ferro", participant2: "Terron B", status: "upcoming", startAt: "+45m", hype: 82 },
  { id: "cy-003", title: "Rising Star Showcase", participant1: "Drift Sound", participant2: "Solara", status: "upcoming", startAt: "+2h", hype: 61 },
];

const MOCK_EVENTS: EventEntry[] = [
  { id: "ev-001", title: "TMI Monthly Idol Finale", venue: "Crown Stage", startsAt: "Saturday 8pm", badge: "FEATURED", isSoldOut: false },
  { id: "ev-002", title: "World Dance Party IV", venue: "Electric Blue Club", startsAt: "Friday 10pm", badge: "HOT", isSoldOut: false },
  { id: "ev-003", title: "Deal or Feud Season 3", venue: "Studio Arena", startsAt: "Sunday 7pm", badge: "NEW", isSoldOut: true },
];

const MOCK_SPONSORS: SponsorEntry[] = [
  { id: "sp-001", name: "SoundBridge Pro", tier: "platinum", tagline: "Professional studio gear for the next generation", ctaLabel: "Explore Gear", ctaHref: "/shop/soundbridge" },
  { id: "sp-002", name: "VoxStream", tier: "gold", tagline: "Stream your sound, anywhere", ctaLabel: "Start Streaming", ctaHref: "/shop/voxstream" },
  { id: "sp-003", name: "Crown Energy", tier: "gold", tagline: "Fuel your performance", ctaLabel: "Get Yours", ctaHref: "/shop/crown-energy" },
];

const MOCK_ADS: AdPlacementEntry[] = [
  { id: "ad-001", headline: "Book Your Stage Now", subline: "Premium venue slots opening for Q3 season", badge: "PREMIUM", tier: "premium" },
  { id: "ad-002", headline: "Artist Spotlight Available", subline: "50,000+ monthly reach. Limited slots.", badge: "ADS", tier: "standard" },
];

const MOCK_NEWS: NewsAlertEntry[] = [
  { id: "ns-001", headline: "KOVA clinches third straight Weekly Crown", category: "Rankings", publishedAt: "2h ago", isBreaking: false },
  { id: "ns-002", headline: "Drift Sound debuts at #5 — fastest riser this season", category: "Breaking", publishedAt: "45m ago", isBreaking: true },
  { id: "ns-003", headline: "World Dance Party IV: Full lineup confirmed", category: "Events", publishedAt: "4h ago", isBreaking: false },
  { id: "ns-004", headline: "SoundBridge Pro signs TMI Platinum sponsorship", category: "Sponsors", publishedAt: "1d ago", isBreaking: false },
];

// ─── Adapters (sync, fallback-safe) ──────────────────────────────────────────

export function getGlobalRanking(): ArtistRankEntry[] {
  return MOCK_GLOBAL_RANKING;
}

export function getCrownLeader(): ArtistRankEntry {
  return MOCK_GLOBAL_RANKING[0];
}

export function getTop10(): ArtistRankEntry[] {
  return MOCK_GLOBAL_RANKING.slice(0, 10);
}

export function getGenreRanking(): typeof MOCK_GENRE_RANKING {
  return MOCK_GENRE_RANKING;
}

export function getRisingArtists(): ArtistRankEntry[] {
  return MOCK_RISING;
}

export function getGenres(): GenreEntry[] {
  return MOCK_GENRES;
}

export function getPlaylists(): PlaylistEntry[] {
  return MOCK_PLAYLISTS;
}

export function getLiveRooms(): LiveRoomEntry[] {
  return MOCK_LIVE_ROOMS;
}

export function getLiveCyphers(): CypherEntry[] {
  return MOCK_CYPHERS;
}

export function getUpcomingEvents(): EventEntry[] {
  return MOCK_EVENTS;
}

export function getSponsors(): SponsorEntry[] {
  return MOCK_SPONSORS;
}

export function getAdPlacements(): AdPlacementEntry[] {
  return MOCK_ADS;
}

export function getNewsAlerts(): NewsAlertEntry[] {
  return MOCK_NEWS;
}

export function getDiscoveryBundle(): { genres: GenreEntry[]; playlists: PlaylistEntry[]; rising: ArtistRankEntry[] } {
  return { genres: getGenres(), playlists: getPlaylists(), rising: getRisingArtists() };
}

/**
 * Integrity guard — called during module init and by probe-slice6.
 * Returns `true` only when every adapter returns non-empty data.
 */
export function validateAdapters(): { ok: boolean; failures: string[] } {
  const checks: Array<[string, () => unknown[]]> = [
    ["getGlobalRanking", getGlobalRanking],
    ["getTop10", getTop10],
    ["getRisingArtists", getRisingArtists],
    ["getGenres", getGenres],
    ["getPlaylists", getPlaylists],
    ["getLiveRooms", getLiveRooms],
    ["getLiveCyphers", getLiveCyphers],
    ["getUpcomingEvents", getUpcomingEvents],
    ["getSponsors", getSponsors],
    ["getAdPlacements", getAdPlacements],
    ["getNewsAlerts", getNewsAlerts],
  ];

  const failures: string[] = [];
  for (const [name, fn] of checks) {
    const result = fn();
    if (!Array.isArray(result) || result.length === 0) {
      failures.push(name);
    }
  }

  return { ok: failures.length === 0, failures };
}

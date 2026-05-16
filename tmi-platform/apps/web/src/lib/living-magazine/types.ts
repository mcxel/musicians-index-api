// Living Magazine — Shared Types

export type MagazineModuleType =
  | "article"
  | "video"
  | "audio"
  | "interview"
  | "comic-strip"
  | "poll"
  | "ticket-card"
  | "merch-card"
  | "beat-player"
  | "nft-card"
  | "sponsor-card"
  | "ad-slot"
  | "venue-promo"
  | "battle-replay"
  | "cypher-replay"
  | "live-room-join"
  | "fan-thread"
  | "artist-discovery"
  | "ranking-rail"
  | "countdown";

export type SpreadLayout =
  | "full-spread"    // one module fills the spread
  | "split-50-50"    // two equal halves
  | "split-70-30"    // hero + sidebar
  | "collage-4"      // 4-tile grid
  | "collage-6"      // 6-tile grid
  | "editorial-A"    // text-dominant feature
  | "editorial-B"    // image-dominant feature
  | "promo-banner"   // sponsor/ad takeover (promo slots only)
  | "community-wall" // multiple fan threads + stats
  | "discovery-grid" // artist discovery grid
  | "battle-recap";  // battle replay + stats

export interface MagazineModule {
  id: string;
  type: MagazineModuleType;
  articleId?: string;
  artistId?: string;
  venueId?: string;
  sponsorId?: string;
  embedUrl?: string;
  embedType?: "youtube" | "spotify" | "soundcloud" | "tiktok" | "twitter";
  title?: string;
  body?: string;
  imageUrl?: string;
  accentColor: string;
  interactive: boolean;
  monetized: boolean;
}

export interface MagazineSpread {
  spreadIndex: number;
  layout: SpreadLayout;
  zone: "early" | "mid" | "late";
  modules: MagazineModule[];
  slotType: "editorial" | "discovery" | "sponsored-boost" | "battle-recap" | "venue-promo" | "wildcard";
}

export interface MagazineIssue {
  id: string;
  issueNumber: number;
  title: string;
  publishedAt: string;
  spreads: MagazineSpread[];
  totalSpreads: number;
  contributorIds: string[];
  revenueAttributed: number;
}

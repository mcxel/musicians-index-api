// Discovery Rotation — Shared Types

export type ArtistTier = "new" | "rising" | "active-performer" | "established" | "top10";
export type PromotionType = "none" | "paid-boost" | "sponsor-pick" | "editorial-pick" | "battle-winner" | "staff-pick";

export interface DiscoveryArtist {
  id: string;
  name: string;
  tier: ArtistTier;
  genres: string[];
  region: string;
  promotionType: PromotionType;
  exposureScore: number;    // earned re-entry score 0–100
  lastShownIssue?: number;  // issue number
  lastShownAt?: number;     // unix timestamp
  shownThisSession: boolean;
  shownThisIssue: boolean;
  battleWins: number;
  fanEngagement: number;    // 0–100
  articleTraction: number;  // 0–100
  tipActivity: number;      // 0–100
  attendanceScore: number;  // 0–100
  merchandiseScore: number; // 0–100
}

export interface IssueSlot {
  position: number;
  zone: "early" | "mid" | "late";
  artistId?: string;
  slotType: "editorial" | "discovery" | "sponsored-boost" | "battle-recap" | "venue-promo" | "wildcard";
}

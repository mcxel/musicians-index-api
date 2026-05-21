// packages/contracts/src/api-contracts.ts
// Complete TypeScript interfaces for every API response shape.
// UI uses these contracts. Blackbox fills in the implementation.
// Adapter layer switches between mock and real API without UI changes.

export interface ArtistGridItem {
  id: string;
  slug: string;
  stageName: string;
  genre: string;
  city: string;
  viewerCount: number;     // Platform Law #1: sort ASC by this
  isLive: boolean;
  isCrownHolder: boolean;
  weeklyVotes: number;
  avatarUrl?: string;
  motionCardUrl?: string;  // 3-second clip
  tier: string;
  stationSlug: string;     // Platform Law #9
}

export interface LobbyRoom {
  id: string;
  roomId: string;
  hostName: string;
  viewerCount: number;     // 0 = position 1 (Platform Law #1)
  isLive: boolean;
  scene: string;
  genre?: string;
  thumbnailUrl?: string;
  gameActive: boolean;
  gameType?: string;
  sponsorId?: string;
}

export interface AdSlotResponse {
  creative: {
    type: "BANNER" | "VIDEO" | "NATIVE" | "SPONSOR_CARD";
    assetUrl: string;
    ctaUrl: string;
    sponsorName?: string;
    isHouseAd: boolean;
    fallbackLevel: 1 | 2 | 3 | 4 | 5;
    zoneId: string;
  };
  isHouseAd: boolean;
}

export interface WalletBalance {
  userId: string;
  balanceCents: number;
  pendingCents: number;
  lifetimeEarnedCents: number;
  pointsBalance: number;
  requiresBigAce: boolean;  // Platform Law #5
  lastPayoutAt?: string;
  sponsorSlotsUsed: number;
  sponsorSlotsAvailable: number;
}

export interface HomepageEditorialData {
  featureArticle?: { title:string; excerpt:string; authorName:string; imageUrl?:string; slug:string };
  newsHeadlines: Array<{ headline:string; timeAgo:string }>;
  interview?: { guestName:string; title:string; thumbnailUrl?:string; slug:string };
  studioRecap?: { title:string; subtitle:string };
}

export interface HomepageDiscoveryData {
  genres: Array<{ name:string; color:string; artistCount:number; slug:string }>;
  charts: Array<{ rank:number; artistName:string; genre:string; slug:string; isHighlighted:boolean }>;
  playlists: Array<{ title:string; curatorName:string; trackCount:number; slug:string }>;
}

export interface CampaignDashboard {
  campaignId: string;
  name: string;
  status: "DRAFT" | "PENDING" | "ACTIVE" | "PAUSED" | "ENDED";
  impressions: number;
  clicks: number;
  ctr: number;
  watchTimeAvgSeconds: number;
  conversions: number;
  sales: number;
  roi: number;
  budgetSpentCents: number;
  budgetTotalCents: number;
  activeZones: string[];
  targetingConfig: Record<string, unknown>;
}

export interface BookingOffer {
  bookingId: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  artistId: string;
  artistName: string;
  proposedDate: string;
  offerAmountCents: number;
  depositPercent: number;
  status: "PENDING" | "OFFERED" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  expiresAt: string;
  notes?: string;
}

export interface SponsorSlotCapacity {
  tier: string;
  local: number;
  platform: number;
  total: number;
  used: number;
  available: number;
  upgradeUrl?: string;
}

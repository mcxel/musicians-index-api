/**
 * SponsorHubEngine
 * Central orchestration for the sponsor intelligence dashboard.
 */

import { SponsorVisibilityScore, SponsorVisibilityWeightEngine } from "./SponsorVisibilityWeightEngine";

export interface SponsorProfile {
  sponsorId: string;
  name: string;
  tier: "local" | "major" | "title";
  joinedAtMs: number;
}

export interface SponsoredArtistBrief {
  artistId: string;
  name: string;
  sponsoredSinceMs: number;
}

export interface SponsorCampaignBrief {
  campaignId: string;
  name: string;
  status: "active" | "paused" | "completed";
}

export interface SponsorHubDashboard {
  profile: SponsorProfile;
  activeSponsoredArtists: SponsoredArtistBrief[];
  activeCampaigns: SponsorCampaignBrief[];
  promotedProducts: string[];
  promotedEvents: string[];
  visibilityScore?: SponsorVisibilityScore;
  roiPerformanceGrade: "A" | "B" | "C" | "D";
  sponsorReadyArtistsRoute: string;
}

function toPerformanceGrade(priorityScore: number): "A" | "B" | "C" | "D" {
  if (priorityScore >= 1200) return "A";
  if (priorityScore >= 700) return "B";
  if (priorityScore >= 250) return "C";
  return "D";
}

export class SponsorHubEngine {
  static getSponsorHubDashboard(sponsorId: string): SponsorHubDashboard {
    const visibilityScore = SponsorVisibilityWeightEngine.calculateVisibility({
      sponsorId,
      totalSpendCents: 0, // In reality, pulled from SponsorPerformanceEngine
      campaignPerformanceScore: 0, // In reality, pulled from SponsorCampaignIntelligenceEngine
      activeCampaignsCount: 0,
      artistSponsorshipCount: 0,
      merchantProductCount: 0,
    });

    return {
      profile: { sponsorId, name: "TMI Verified Sponsor", tier: "local", joinedAtMs: Date.now() },
      activeSponsoredArtists: [],
      activeCampaigns: [],
      promotedProducts: [],
      promotedEvents: [],
      visibilityScore,
      roiPerformanceGrade: toPerformanceGrade(visibilityScore.sponsorPriorityScore),
      sponsorReadyArtistsRoute: "/artists?readyForSponsorship=1",
    };
  }
}
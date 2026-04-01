// Placement Engine Phase 2: Campaign, Advertiser, Analytics types

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface Campaign {
  id: string;
  advertiserId: string;
  name: string;
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  placements: string[];
  status: CampaignStatus;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
}

export interface AdvertiserAccount {
  id: string;
  companyName: string;
  contactEmail: string;
  balance: number;
  activeCampaigns: number;
  totalSpend: number;
  accountStatus: 'active' | 'suspended' | 'closed';
}

export interface PlacementAnalytics {
  placementId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  lastUpdated: string;
}

/**
 * RevenueEngine.ts
 * Purpose: Atomic revenue splits, payout calculations, and financial audit trail.
 * Placement: packages/engines/src/RevenueEngine.ts
 *            Import via @tmi/engines/RevenueEngine
 * Depends on: TierEngine
 */

import { Tier, TIER_ORDER } from './TierEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RevenueSource =
  | 'AD_IMPRESSION'
  | 'AD_CLICK'
  | 'AD_VIDEO_COMPLETE'
  | 'SPONSOR_CONTRACT'
  | 'SUBSCRIPTION'
  | 'TIP'
  | 'BEAT_SALE'
  | 'EVENT_TICKET'
  | 'REPLAY_MONETIZATION'
  | 'ITEM_PURCHASE';

export interface RevenueSplit {
  platformPct: number;      // TMI platform cut (0–100)
  artistPct: number;        // performing artist cut
  groupPct: number;         // band/crew split from artistPct
  sponsorPct: number;       // sponsor contribution/rebate
  reservePct: number;       // held in reserve pool
}

export interface RevenueEvent {
  id: string;
  source: RevenueSource;
  grossAmount: number;      // in cents
  split: RevenueSplit;
  artistId?: string;
  sponsorId?: string;
  eventId?: string;
  timestamp: Date;
  ledgerEntries: LedgerEntry[];
  status: 'PENDING' | 'SETTLED' | 'DISPUTED' | 'REFUNDED';
}

export interface LedgerEntry {
  recipientType: 'PLATFORM' | 'ARTIST' | 'GROUP_MEMBER' | 'SPONSOR' | 'RESERVE';
  recipientId: string;
  amount: number;           // in cents
  pct: number;
}

export interface PayoutRecord {
  id: string;
  recipientId: string;
  amount: number;
  currency: 'USD';
  method: 'STRIPE' | 'PAYPAL' | 'CHECK' | 'POINTS_CONVERSION';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  settledAt?: Date;
  revenueEventIds: string[];
}

// ─── Default Split Tables by Source ──────────────────────────────────────────

export const DEFAULT_SPLITS: Record<RevenueSource, RevenueSplit> = {
  AD_IMPRESSION:       { platformPct: 70, artistPct: 20, groupPct: 0, sponsorPct: 0,  reservePct: 10 },
  AD_CLICK:            { platformPct: 60, artistPct: 30, groupPct: 0, sponsorPct: 0,  reservePct: 10 },
  AD_VIDEO_COMPLETE:   { platformPct: 55, artistPct: 35, groupPct: 0, sponsorPct: 0,  reservePct: 10 },
  SPONSOR_CONTRACT:    { platformPct: 30, artistPct: 55, groupPct: 0, sponsorPct: 0,  reservePct: 15 },
  SUBSCRIPTION:        { platformPct: 80, artistPct: 10, groupPct: 0, sponsorPct: 0,  reservePct: 10 },
  TIP:                 { platformPct: 15, artistPct: 80, groupPct: 0, sponsorPct: 0,  reservePct: 5  },
  BEAT_SALE:           { platformPct: 20, artistPct: 75, groupPct: 0, sponsorPct: 0,  reservePct: 5  },
  EVENT_TICKET:        { platformPct: 25, artistPct: 65, groupPct: 0, sponsorPct: 0,  reservePct: 10 },
  REPLAY_MONETIZATION: { platformPct: 40, artistPct: 50, groupPct: 0, sponsorPct: 0,  reservePct: 10 },
  ITEM_PURCHASE:       { platformPct: 50, artistPct: 40, groupPct: 0, sponsorPct: 0,  reservePct: 10 },
};

// ─── Group Member Split ───────────────────────────────────────────────────────

export interface GroupMemberShare {
  userId: string;
  sharePercent: number;     // percent of groupPct, must sum to 100
  role: 'CAPTAIN' | 'MEMBER' | 'MANAGER';
}

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Calculate ledger entries from a gross amount and split */
export function calculateSplit(
  grossAmount: number,
  split: RevenueSplit,
  artistId: string,
  platformId: string = 'TMI_PLATFORM',
  reserveId: string = 'TMI_RESERVE',
  groupMembers?: GroupMemberShare[],
  sponsorId?: string,
): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  const round = (n: number) => Math.round(n);

  entries.push({
    recipientType: 'PLATFORM',
    recipientId: platformId,
    amount: round(grossAmount * split.platformPct / 100),
    pct: split.platformPct,
  });

  entries.push({
    recipientType: 'RESERVE',
    recipientId: reserveId,
    amount: round(grossAmount * split.reservePct / 100),
    pct: split.reservePct,
  });

  const artistTotal = round(grossAmount * split.artistPct / 100);

  if (groupMembers && groupMembers.length > 0) {
    // Distribute artist share across group members
    let distributed = 0;
    groupMembers.forEach((member, idx) => {
      const isLast = idx === groupMembers!.length - 1;
      const memberAmount = isLast
        ? artistTotal - distributed
        : round(artistTotal * member.sharePercent / 100);
      distributed += memberAmount;
      entries.push({
        recipientType: 'GROUP_MEMBER',
        recipientId: member.userId,
        amount: memberAmount,
        pct: (memberAmount / grossAmount) * 100,
      });
    });
  } else {
    entries.push({
      recipientType: 'ARTIST',
      recipientId: artistId,
      amount: artistTotal,
      pct: split.artistPct,
    });
  }

  if (split.sponsorPct > 0 && sponsorId) {
    entries.push({
      recipientType: 'SPONSOR',
      recipientId: sponsorId,
      amount: round(grossAmount * split.sponsorPct / 100),
      pct: split.sponsorPct,
    });
  }

  return entries;
}

/** Validate split percentages sum to 100 */
export function validateSplit(split: RevenueSplit): boolean {
  const total = split.platformPct + split.artistPct + split.groupPct
    + split.sponsorPct + split.reservePct;
  return Math.abs(total - 100) < 0.01;
}

/** Calculate sponsor ROI metrics */
export function calculateSponsorROI(
  totalSpend: number,
  impressions: number,
  clicks: number,
  conversions: number,
  averageOrderValue: number,
): {
  cpm: number;
  cpc: number;
  conversionRate: number;
  roas: number;
} {
  return {
    cpm: impressions > 0 ? (totalSpend / impressions) * 1000 : 0,
    cpc: clicks > 0 ? totalSpend / clicks : 0,
    conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    roas: totalSpend > 0 ? (conversions * averageOrderValue) / totalSpend : 0,
  };
}

/** Check if revenue event is within dispute window (48h) */
export function isDisputeWindowOpen(timestamp: Date): boolean {
  const DISPUTE_WINDOW_MS = 48 * 60 * 60 * 1000;
  return Date.now() - timestamp.getTime() < DISPUTE_WINDOW_MS;
}

/** Generate payout threshold check — only pay out if >= $25 */
export const MINIMUM_PAYOUT_CENTS = 2_500;

export function isPayoutEligible(balanceCents: number): boolean {
  return balanceCents >= MINIMUM_PAYOUT_CENTS;
}

// apps/api/src/bots/bot-orchestrator.ts
// The master controller for all 35+ platform bots.
// Runs every bot on its schedule and handles failures gracefully.

import { BotId, BOT_REGISTRY } from '../../../apps/web/src/config/bot-registry';

export type BotStatus = 'idle' | 'running' | 'success' | 'failed' | 'paused' | 'disabled';

export interface BotRunResult {
  botId: BotId;
  status: BotStatus;
  startedAt: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
  nextRunAt?: Date;
}

export interface OrchestratorState {
  runningBots: Set<BotId>;
  botHistory: Map<BotId, BotRunResult[]>;
  pausedBots: Set<BotId>;
  disabledBots: Set<BotId>;
}

// ── BOT EXECUTION ORDER (priority groups) ─────────────────
// Group 1 — Critical (billing, fraud, content)
export const PRIORITY_1_BOTS: BotId[] = [
  'billing-integrity',   // verifies Diamond users every 4h
  'fraud-sentinel',      // monitors suspicious transactions
  'brand-safety',        // checks new ad creatives
  'health-monitor',      // system health check every 5min
];

// Group 2 — Monetization (ads, sponsors, campaigns)
export const PRIORITY_2_BOTS: BotId[] = [
  'house-ad-fallback',   // fills empty ad slots instantly
  'ad-placement',        // fills new campaigns to slots
  'ad-rotation',         // rotates active creatives
  'sponsor-matching',    // matches local businesses to artists
  'campaign-expiration', // handles expiring campaigns
  'renewal',             // sends renewal offers 7d before end
];

// Group 3 — Content (homepage, magazine, editorial)
export const PRIORITY_3_BOTS: BotId[] = [
  'cover-generator',     // weekly Sunday cover refresh
  'editorial-assembly',  // every 30min editorial belt
  'homepage-rotation',   // every 15min all belts
  'featured-story',      // hourly magazine front
  'article-freshness',   // daily article freshness check
  'headline-ticker',     // every 5min news ticker
];

// Group 4 — Discovery and engagement
export const PRIORITY_4_BOTS: BotId[] = [
  'trending',
  'recommendation',
  'clip-highlight',
  'leaderboard',
  'ranking',
  'contest-ops',
  'station-activity',
];

// Group 5 — Operations (slow, non-critical)
export const PRIORITY_5_BOTS: BotId[] = [
  'notification',
  'timeline',
  'search-index',
  'analytics',
  'payout',           // Big Ace must approve first
  'owner-finance',    // Big Ace must approve first
  'media-qc',
  'scene-preset',
  'backup',
];

// ── ADVERTISER PROSPECTING SYSTEM ─────────────────────────
// These bots actively find new sponsors and advertisers
export interface LeadProspect {
  businessName: string;
  category: string;
  estimatedBudgetCents: number;
  region: string;
  artistGenreMatch?: string;
  contactMethod: 'email' | 'phone' | 'web';
  sourceSystem: string;
}

export interface DealProposal {
  prospectId: string;
  packageName: string;
  weeklyBudgetCents: number;
  zones: string[];         // from page-zone-registry
  durationWeeks: number;
  artistSlug?: string;     // for local sponsor matching
  discountPct: number;     // max 10% before Big Ace required
  requiresBigAce: boolean;
  autoApprove: boolean;    // true if under $99.99/week
}

// Bot capability matrix for deal making
export const DEAL_BOT_CAPABILITIES = {
  'prospect-scout': {
    canDiscover: true, canContact: false, canNegotiate: false,
    dailyLeadLimit: 50, budgetLimit: 0,
  },
  'outreach': {
    canDiscover: false, canContact: true, canNegotiate: false,
    maxFollowUps: 3, templatesOnly: true, budgetLimit: 0,
  },
  'proposal': {
    canDiscover: false, canContact: true, canNegotiate: true,
    maxDiscountPct: 10, maxAutoApproveCents: 9999, holdSlotHours: 24,
  },
  'renewal': {
    canDiscover: false, canContact: true, canNegotiate: true,
    loyaltyDiscountPct: 5, daysBeforeExpiry: 7,
  },
} as const;

// ── NEGOTIATION LEARNING ENGINE ────────────────────────────
// Bots learn what package/zone combinations close best
export interface DealLearning {
  packageType: string;
  zone: string;
  closedCount: number;
  avgDurationWeeks: number;
  avgBudgetCents: number;
  renewalRate: number;     // 0-1
  categoryPerformance: Record<string, number>; // category → close rate
  topRenewingArtistGenres: string[];
}

// ── BOT SAFETY RULES (always enforced) ────────────────────
export const BOT_SAFETY_RULES = {
  // Monetization
  maxAutoApproveWeeklyCents: 9999,   // $99.99 — over this needs Big Ace
  exclusivityNeedsBigAce: true,      // always
  maxDiscount: 0.10,                 // 10% max discount without Big Ace

  // Content
  kidsCannotSeeAdContent: true,      // canSendMessage enforcement
  noCompetitorAdAdjacency: true,     // brand safety rule

  // Operations
  payoutNeedsBigAce: true,           // never auto-release payout
  ownerFinanceNeedsBigAce: true,     // never auto-distribute profit

  // Discovery
  zeroViewersAlwaysPositionOne: true, // DISCOVERY LAW — never change
  diamondUsersNeverBilled: true,      // Marcel + BJ M Beat's permanent
} as const;

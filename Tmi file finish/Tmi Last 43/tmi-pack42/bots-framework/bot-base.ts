// apps/bots/src/bot-base.ts
// Base class for all 55 platform bots.
// Every bot MUST extend this and implement run().

import { PLATFORM_LAWS } from "../../packages/integration/final/PLATFORM_LAWS_ENFORCEMENT";

export interface BotResult {
  botId: string;
  ranAt: Date;
  duration: number;
  success: boolean;
  itemsProcessed: number;
  itemsSkipped: number;
  errors: string[];
  notes: string[];
  nextRunAt?: Date;
}

export interface BotConfig {
  id: string;
  name: string;
  family: BotFamily;
  schedule?: string;      // cron expression if scheduled
  maxRunTimeSeconds: number;
  retryOnError: boolean;
  alertOnConsecutiveFailures: number;  // alert admin after N failures
  // Safety constraints
  canAutoApprovePayments: false;       // NEVER true for any bot
  canModifyLockedFiles: false;         // NEVER true
  canRemoveDiamondTier: false;         // NEVER true — Platform Law #2
  maxAutoApproveCents: number;         // max $99.99 without Big Ace
}

export type BotFamily =
  | "editorial" | "monetization" | "discovery" | "competition"
  | "platform" | "moderation" | "acquisition" | "economy"
  | "broadcast" | "archive" | "analytics" | "release";

// ── ALL 55 BOTS — REGISTRY ────────────────────────────
export const BOT_REGISTRY: Record<string, BotConfig> = {

  // EDITORIAL (6)
  "cover-generator":       { id: "cover-generator",       name: "Cover Generator",        family: "editorial",     maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "editorial-assembly":    { id: "editorial-assembly",    name: "Editorial Assembly",     family: "editorial",     maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "homepage-rotation":     { id: "homepage-rotation",     name: "Homepage Rotation",      family: "editorial",     maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "featured-story":        { id: "featured-story",        name: "Featured Story",         family: "editorial",     maxRunTimeSeconds: 20,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "article-freshness":     { id: "article-freshness",     name: "Article Freshness",      family: "editorial",     maxRunTimeSeconds: 120, retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "headline-ticker":       { id: "headline-ticker",       name: "Headline Ticker",        family: "editorial",     maxRunTimeSeconds: 10,  retryOnError: true,  alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // MONETIZATION (13)
  "house-ad-fallback":     { id: "house-ad-fallback",     name: "House Ad Fallback",      family: "monetization",  maxRunTimeSeconds: 5,   retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "ad-placement":          { id: "ad-placement",          name: "Ad Placement",           family: "monetization",  maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "ad-rotation":           { id: "ad-rotation",           name: "Ad Rotation",            family: "monetization",  maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "sponsor-matching":      { id: "sponsor-matching",      name: "Sponsor Matching",       family: "monetization",  maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 9999 },
  "campaign-expiration":   { id: "campaign-expiration",   name: "Campaign Expiration",    family: "monetization",  maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "renewal":               { id: "renewal",               name: "Renewal Bot",            family: "monetization",  maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 9999 },
  "prospect-scout":        { id: "prospect-scout",        name: "Prospect Scout",         family: "monetization",  maxRunTimeSeconds: 120, retryOnError: false, alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "outreach":              { id: "outreach",              name: "Outreach Bot",           family: "monetization",  maxRunTimeSeconds: 60,  retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "proposal":              { id: "proposal",              name: "Proposal Bot",           family: "monetization",  maxRunTimeSeconds: 60,  retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 9999 },
  "brand-safety":          { id: "brand-safety",          name: "Brand Safety",           family: "monetization",  maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "ctr-optimizer":         { id: "ctr-optimizer",         name: "CTR Optimizer",          family: "monetization",  maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "billing-integrity":     { id: "billing-integrity",     name: "Billing Integrity",      family: "monetization",  maxRunTimeSeconds: 10,  retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "fraud-sentinel":        { id: "fraud-sentinel",        name: "Fraud Sentinel",         family: "monetization",  maxRunTimeSeconds: 10,  retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // DISCOVERY (4)
  "trending":              { id: "trending",              name: "Trending Bot",           family: "discovery",     maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "recommendation":        { id: "recommendation",        name: "Recommendation Bot",     family: "discovery",     maxRunTimeSeconds: 300, retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "clip-highlight":        { id: "clip-highlight",        name: "Clip Highlight Bot",     family: "discovery",     maxRunTimeSeconds: 120, retryOnError: false, alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "search-index":          { id: "search-index",          name: "Search Index Bot",       family: "discovery",     maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // COMPETITION (4)
  "contest-ops":           { id: "contest-ops",           name: "Contest Ops",            family: "competition",   maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "leaderboard":           { id: "leaderboard",           name: "Leaderboard Bot",        family: "competition",   maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "ranking":               { id: "ranking",               name: "Ranking Bot",            family: "competition",   maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "crown":                 { id: "crown",                 name: "Crown Bot",              family: "competition",   maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // PLATFORM (10)
  "notification":          { id: "notification",          name: "Notification Bot",       family: "platform",      maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "timeline":              { id: "timeline",              name: "Timeline Bot",           family: "platform",      maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "analytics":             { id: "analytics",             name: "Analytics Bot",          family: "platform",      maxRunTimeSeconds: 120, retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "payout":                { id: "payout",                name: "Payout Bot",             family: "platform",      maxRunTimeSeconds: 60,  retryOnError: false, alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "owner-finance":         { id: "owner-finance",         name: "Owner Finance Bot",      family: "platform",      maxRunTimeSeconds: 120, retryOnError: false, alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "media-qc":              { id: "media-qc",              name: "Media QC Bot",           family: "platform",      maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "station-activity":      { id: "station-activity",      name: "Station Activity Bot",   family: "platform",      maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "backup":                { id: "backup",                name: "Backup Bot",             family: "platform",      maxRunTimeSeconds: 600, retryOnError: false, alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "health-monitor":        { id: "health-monitor",        name: "Health Monitor",         family: "platform",      maxRunTimeSeconds: 10,  retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "readme-sync":           { id: "readme-sync",           name: "README Sync Bot",        family: "platform",      maxRunTimeSeconds: 30,  retryOnError: false, alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // MODERATION (5)
  "moderation":            { id: "moderation",            name: "Moderation Bot",         family: "moderation",    maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "guardian":              { id: "guardian",              name: "Guardian Bot",           family: "moderation",    maxRunTimeSeconds: 10,  retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "spam-filter":           { id: "spam-filter",           name: "Spam Filter Bot",        family: "moderation",    maxRunTimeSeconds: 5,   retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "upload-scanner":        { id: "upload-scanner",        name: "Upload Scanner Bot",     family: "moderation",    maxRunTimeSeconds: 30,  retryOnError: false, alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "age-gate":              { id: "age-gate",              name: "Age Gate Bot",           family: "moderation",    maxRunTimeSeconds: 5,   retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // ACQUISITION (8)
  "venue-scout":           { id: "venue-scout",           name: "Venue Scout Bot",        family: "acquisition",   maxRunTimeSeconds: 120, retryOnError: false, alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "venue-outreach":        { id: "venue-outreach",        name: "Venue Outreach Bot",     family: "acquisition",   maxRunTimeSeconds: 60,  retryOnError: false, alertOnConsecutiveFailures: 5, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "booking-ops":           { id: "booking-ops",           name: "Booking Ops Bot",        family: "acquisition",   maxRunTimeSeconds: 60,  retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "onboarding":            { id: "onboarding",            name: "Onboarding Bot",         family: "acquisition",   maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "artist-onboarding":     { id: "artist-onboarding",     name: "Artist Onboarding Bot",  family: "acquisition",   maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "fan-onboarding":        { id: "fan-onboarding",        name: "Fan Onboarding Bot",     family: "acquisition",   maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "support-triage":        { id: "support-triage",        name: "Support Triage Bot",     family: "acquisition",   maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "referral":              { id: "referral",              name: "Referral Bot",           family: "acquisition",   maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // ECONOMY (6)
  "item-generator":        { id: "item-generator",        name: "Item Generator Bot",     family: "economy",       maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "daily-drop":            { id: "daily-drop",            name: "Daily Drop Bot",         family: "economy",       maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "seasonal-catalog":      { id: "seasonal-catalog",      name: "Seasonal Catalog Bot",   family: "economy",       maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "reward-allocation":     { id: "reward-allocation",     name: "Reward Allocation Bot",  family: "economy",       maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "economy-health":        { id: "economy-health",        name: "Economy Health Bot",     family: "economy",       maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "points-cap-enforcer":   { id: "points-cap-enforcer",   name: "Points Cap Enforcer",    family: "economy",       maxRunTimeSeconds: 10,  retryOnError: true,  alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // BROADCAST (4)
  "broadcaster-script":    { id: "broadcaster-script",    name: "Broadcaster Script Bot", family: "broadcast",     maxRunTimeSeconds: 5,   retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "lower-thirds":          { id: "lower-thirds",          name: "Lower Thirds Bot",       family: "broadcast",     maxRunTimeSeconds: 5,   retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "commercial-break":      { id: "commercial-break",      name: "Commercial Break Bot",   family: "broadcast",     maxRunTimeSeconds: 5,   retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "fail-safe":             { id: "fail-safe",             name: "Fail-Safe Broadcast Bot", family: "broadcast",    maxRunTimeSeconds: 60,  retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // ARCHIVE (3)
  "archivist":             { id: "archivist",             name: "Archivist Bot",          family: "archive",       maxRunTimeSeconds: 120, retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "issue-packager":        { id: "issue-packager",        name: "Issue Packager Bot",     family: "archive",       maxRunTimeSeconds: 180, retryOnError: false, alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "replay-packager":       { id: "replay-packager",       name: "Replay Packager Bot",    family: "archive",       maxRunTimeSeconds: 300, retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // ANALYTICS (2)
  "analytics-aggregator":  { id: "analytics-aggregator",  name: "Analytics Aggregator",   family: "analytics",     maxRunTimeSeconds: 120, retryOnError: true,  alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "report-generator":      { id: "report-generator",      name: "Report Generator Bot",   family: "analytics",     maxRunTimeSeconds: 300, retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },

  // RELEASE/QA (3)
  "compat-qa":             { id: "compat-qa",             name: "Compat QA Bot",          family: "release",       maxRunTimeSeconds: 120, retryOnError: false, alertOnConsecutiveFailures: 3, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "smoke-test":            { id: "smoke-test",            name: "Smoke Test Bot",         family: "release",       maxRunTimeSeconds: 60,  retryOnError: false, alertOnConsecutiveFailures: 2, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
  "rollback-sentinel":     { id: "rollback-sentinel",     name: "Rollback Sentinel Bot",  family: "release",       maxRunTimeSeconds: 30,  retryOnError: true,  alertOnConsecutiveFailures: 1, canAutoApprovePayments: false, canModifyLockedFiles: false, canRemoveDiamondTier: false, maxAutoApproveCents: 0 },
};

// TOTAL: 55 bots across 12 families
export type BotId = keyof typeof BOT_REGISTRY;

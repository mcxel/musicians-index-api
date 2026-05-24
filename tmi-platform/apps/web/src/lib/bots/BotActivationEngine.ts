/**
 * BotActivationEngine — activates the minimum 62 production bots for TMI.
 * Each bot has: id, name, role, interval (ms), isActive, health status.
 * Bot categories: PromoBot, EngagementBot, ContentBot, ModerationBot, SupportBot, NewsBot.
 * Integrates with botRegistry.ts types.
 */

import type { BotRole, BotStatus } from "./botRegistry";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BotCategory =
  | "PromoBot"
  | "EngagementBot"
  | "ContentBot"
  | "ModerationBot"
  | "SupportBot"
  | "NewsBot"
  | "AnalyticsBot"
  | "RevenueBot"
  | "RecoveryBot"
  | "SentinelBot";

export type BotHealthStatus = "HEALTHY" | "DEGRADED" | "OFFLINE" | "RESTARTING";

export interface ActiveBot {
  id: string;
  name: string;
  category: BotCategory;
  role: BotRole;
  intervalMs: number;
  isActive: boolean;
  health: BotHealthStatus;
  lastPulseMs: number;
  startedAtMs: number;
  errorCount: number;
  telemetryTag: string;
  surface?: string;
}

// ── Default bot definitions (minimum 62) ─────────────────────────────────────

const DEFAULT_BOT_DEFINITIONS: Omit<ActiveBot, "lastPulseMs" | "startedAtMs" | "errorCount">[] = [
  // ── Promo Bots (10) ──────────────────────────────────────────────────────
  { id: "promo-01", name: "Sponsor Placement Bot",      category: "PromoBot",      role: "SPONSOR",   intervalMs: 30_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:sponsor_placement" },
  { id: "promo-02", name: "Artist Promo Drip Bot",      category: "PromoBot",      role: "SPONSOR",   intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:artist_drip" },
  { id: "promo-03", name: "Event Promo Bot",            category: "PromoBot",      role: "SPONSOR",   intervalMs: 45_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:event" },
  { id: "promo-04", name: "Beat Promo Bot",             category: "PromoBot",      role: "CONTENT",   intervalMs: 90_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:beat" },
  { id: "promo-05", name: "Merch Promo Bot",            category: "PromoBot",      role: "SPONSOR",   intervalMs: 120_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:merch" },
  { id: "promo-06", name: "NFT Drop Announcer Bot",     category: "PromoBot",      role: "CONTENT",   intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:nft_drop" },
  { id: "promo-07", name: "Season Pass Promo Bot",      category: "PromoBot",      role: "SPONSOR",   intervalMs: 180_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:season_pass" },
  { id: "promo-08", name: "Subscription Promo Bot",     category: "PromoBot",      role: "SPONSOR",   intervalMs: 240_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:subscription" },
  { id: "promo-09", name: "Partner Outreach Bot",       category: "PromoBot",      role: "SPONSOR",   intervalMs: 300_000, isActive: true, health: "HEALTHY", telemetryTag: "promo:partner_outreach" },
  { id: "promo-10", name: "Billboard Rotation Bot",     category: "PromoBot",      role: "SPONSOR",   intervalMs: 15_000,  isActive: true, health: "HEALTHY", telemetryTag: "promo:billboard", surface: "HOME_4" },

  // ── Engagement Bots (10) ─────────────────────────────────────────────────
  { id: "eng-01",  name: "Crowd Energy Meter Bot",      category: "EngagementBot", role: "LIVE_ROOM", intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "eng:crowd_energy", surface: "ROOMS" },
  { id: "eng-02",  name: "Live Reaction Bot",           category: "EngagementBot", role: "LIVE_ROOM", intervalMs: 3_000,  isActive: true, health: "HEALTHY", telemetryTag: "eng:live_reaction" },
  { id: "eng-03",  name: "Shoutout Delivery Bot",       category: "EngagementBot", role: "SOCIAL",    intervalMs: 20_000, isActive: true, health: "HEALTHY", telemetryTag: "eng:shoutout" },
  { id: "eng-04",  name: "Tip Animation Bot",           category: "EngagementBot", role: "REWARDS",   intervalMs: 2_000,  isActive: true, health: "HEALTHY", telemetryTag: "eng:tip_anim" },
  { id: "eng-05",  name: "Crowd Pulse Bot",             category: "EngagementBot", role: "ANALYTICS", intervalMs: 10_000, isActive: true, health: "HEALTHY", telemetryTag: "eng:crowd_pulse", surface: "HOME_3" },
  { id: "eng-06",  name: "Chat Encouragement Bot",      category: "EngagementBot", role: "SOCIAL",    intervalMs: 30_000, isActive: true, health: "HEALTHY", telemetryTag: "eng:chat_encourage" },
  { id: "eng-07",  name: "Audience Milestone Bot",      category: "EngagementBot", role: "REWARDS",   intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "eng:milestone" },
  { id: "eng-08",  name: "Vote Aggregator Bot",         category: "EngagementBot", role: "LIVE_ROOM", intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "eng:vote_agg", surface: "CYPHER" },
  { id: "eng-09",  name: "XP Award Bot",                category: "EngagementBot", role: "REWARDS",   intervalMs: 15_000, isActive: true, health: "HEALTHY", telemetryTag: "eng:xp_award" },
  { id: "eng-10",  name: "Fan Judge Score Bot",         category: "EngagementBot", role: "ANALYTICS", intervalMs: 10_000, isActive: true, health: "HEALTHY", telemetryTag: "eng:fan_judge" },

  // ── Content Bots (10) ────────────────────────────────────────────────────
  { id: "cnt-01",  name: "Magazine Cover Editor Bot",   category: "ContentBot",    role: "CONTENT",   intervalMs: 120_000, isActive: true, health: "HEALTHY", telemetryTag: "cnt:mag_cover", surface: "HOME_1" },
  { id: "cnt-02",  name: "Article Placement Bot",       category: "ContentBot",    role: "CONTENT",   intervalMs: 90_000,  isActive: true, health: "HEALTHY", telemetryTag: "cnt:article_place" },
  { id: "cnt-03",  name: "Beat Quality Scorer Bot",     category: "ContentBot",    role: "CONTENT",   intervalMs: 30_000,  isActive: true, health: "HEALTHY", telemetryTag: "cnt:beat_quality", surface: "BEAT_LAB" },
  { id: "cnt-04",  name: "Sample Clearance Bot",        category: "ContentBot",    role: "CONTENT",   intervalMs: 60_000,  isActive: true, health: "HEALTHY", telemetryTag: "cnt:sample_clear", surface: "BEAT_LAB" },
  { id: "cnt-05",  name: "NFT Metadata Validator Bot",  category: "ContentBot",    role: "CONTENT",   intervalMs: 45_000,  isActive: true, health: "HEALTHY", telemetryTag: "cnt:nft_meta", surface: "NFT_LAB" },
  { id: "cnt-06",  name: "Chart Rankings Bot",          category: "ContentBot",    role: "ANALYTICS", intervalMs: 300_000, isActive: true, health: "HEALTHY", telemetryTag: "cnt:chart", surface: "HOME_5" },
  { id: "cnt-07",  name: "Trending Topics Bot",         category: "ContentBot",    role: "CONTENT",   intervalMs: 120_000, isActive: true, health: "HEALTHY", telemetryTag: "cnt:trending", surface: "HOME_2" },
  { id: "cnt-08",  name: "Playlist Recommendation Bot", category: "ContentBot",    role: "CONTENT",   intervalMs: 60_000,  isActive: true, health: "HEALTHY", telemetryTag: "cnt:playlist", surface: "HOME_2" },
  { id: "cnt-09",  name: "Visual Creator Bot",          category: "ContentBot",    role: "CONTENT",   intervalMs: 90_000,  isActive: true, health: "HEALTHY", telemetryTag: "cnt:visual" },
  { id: "cnt-10",  name: "Caption Generator Bot",       category: "ContentBot",    role: "CONTENT",   intervalMs: 30_000,  isActive: true, health: "HEALTHY", telemetryTag: "cnt:caption" },

  // ── Moderation Bots (8) ──────────────────────────────────────────────────
  { id: "mod-01",  name: "Sentinel Home Shield Bot",    category: "ModerationBot", role: "SENTINEL",  intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "mod:sentinel_home", surface: "HOME_1" },
  { id: "mod-02",  name: "Sentinel Live Shield Bot",    category: "ModerationBot", role: "SENTINEL",  intervalMs: 3_000,  isActive: true, health: "HEALTHY", telemetryTag: "mod:sentinel_live", surface: "ROOMS" },
  { id: "mod-03",  name: "Room Moderation Bot",         category: "ModerationBot", role: "LIVE_ROOM", intervalMs: 8_000,  isActive: true, health: "HEALTHY", telemetryTag: "mod:room", surface: "ROOMS" },
  { id: "mod-04",  name: "Kick Vote Processor Bot",     category: "ModerationBot", role: "LIVE_ROOM", intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "mod:kick_vote", surface: "ROOMS" },
  { id: "mod-05",  name: "Cypher Conduct Bot",          category: "ModerationBot", role: "SENTINEL",  intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "mod:cypher_conduct", surface: "CYPHER" },
  { id: "mod-06",  name: "Minor Safety Guardian Bot",   category: "ModerationBot", role: "SENTINEL",  intervalMs: 10_000, isActive: true, health: "HEALTHY", telemetryTag: "mod:minor_safety" },
  { id: "mod-07",  name: "Commerce Fraud Detection Bot",category: "ModerationBot", role: "SENTINEL",  intervalMs: 15_000, isActive: true, health: "HEALTHY", telemetryTag: "mod:fraud", surface: "HOME_4" },
  { id: "mod-08",  name: "Spam Filter Bot",             category: "ModerationBot", role: "SENTINEL",  intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "mod:spam" },

  // ── Support Bots (8) ─────────────────────────────────────────────────────
  { id: "sup-01",  name: "Welcome Onboarding Bot",      category: "SupportBot",    role: "ONBOARDING",intervalMs: 30_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:welcome" },
  { id: "sup-02",  name: "Artist Onboarding Bot",       category: "SupportBot",    role: "ONBOARDING",intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:artist_onboard" },
  { id: "sup-03",  name: "Fan Onboarding Bot",          category: "SupportBot",    role: "ONBOARDING",intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:fan_onboard" },
  { id: "sup-04",  name: "Ticket Support Bot",          category: "SupportBot",    role: "RECOVERY",  intervalMs: 30_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:ticket" },
  { id: "sup-05",  name: "Payment Recovery Bot",        category: "SupportBot",    role: "RECOVERY",  intervalMs: 45_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:payment_recovery" },
  { id: "sup-06",  name: "Session Recovery Bot",        category: "SupportBot",    role: "RECOVERY",  intervalMs: 20_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:session_recovery" },
  { id: "sup-07",  name: "Help Desk Bot",               category: "SupportBot",    role: "ONBOARDING",intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:help_desk" },
  { id: "sup-08",  name: "Account Recovery Bot",        category: "SupportBot",    role: "RECOVERY",  intervalMs: 30_000, isActive: true, health: "HEALTHY", telemetryTag: "sup:account_recovery" },

  // ── News Bots (6) ────────────────────────────────────────────────────────
  { id: "news-01", name: "Belt Feed News Bot",          category: "NewsBot",       role: "CONTENT",   intervalMs: 300_000, isActive: true, health: "HEALTHY", telemetryTag: "news:belt_feed", surface: "HOME_1" },
  { id: "news-02", name: "Artist News Aggregator Bot",  category: "NewsBot",       role: "CONTENT",   intervalMs: 600_000, isActive: true, health: "HEALTHY", telemetryTag: "news:artist_news" },
  { id: "news-03", name: "Industry News Bot",           category: "NewsBot",       role: "CONTENT",   intervalMs: 600_000, isActive: true, health: "HEALTHY", telemetryTag: "news:industry" },
  { id: "news-04", name: "Event Alert Bot",             category: "NewsBot",       role: "CONTENT",   intervalMs: 120_000, isActive: true, health: "HEALTHY", telemetryTag: "news:event_alert" },
  { id: "news-05", name: "Winner Announcement Bot",     category: "NewsBot",       role: "REWARDS",   intervalMs: 60_000,  isActive: true, health: "HEALTHY", telemetryTag: "news:winner_announce" },
  { id: "news-06", name: "Platform Status Bot",         category: "NewsBot",       role: "ANALYTICS", intervalMs: 60_000,  isActive: true, health: "HEALTHY", telemetryTag: "news:platform_status" },

  // ── Analytics Bots (5) ──────────────────────────────────────────────────
  { id: "anl-01",  name: "Revenue Impact Tracker Bot",  category: "AnalyticsBot",  role: "ANALYTICS", intervalMs: 30_000, isActive: true, health: "HEALTHY", telemetryTag: "anl:revenue" },
  { id: "anl-02",  name: "Live Stats Bot",              category: "AnalyticsBot",  role: "ANALYTICS", intervalMs: 10_000, isActive: true, health: "HEALTHY", telemetryTag: "anl:live_stats", surface: "HOME_2" },
  { id: "anl-03",  name: "Performance Score Bot",       category: "AnalyticsBot",  role: "ANALYTICS", intervalMs: 15_000, isActive: true, health: "HEALTHY", telemetryTag: "anl:perf_score" },
  { id: "anl-04",  name: "Bot Performance Scorer Bot",  category: "AnalyticsBot",  role: "ANALYTICS", intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "anl:bot_score" },
  { id: "anl-05",  name: "User Behaviour Analytics Bot",category: "AnalyticsBot",  role: "ANALYTICS", intervalMs: 120_000,isActive: true, health: "HEALTHY", telemetryTag: "anl:user_behaviour" },

  // ── Revenue Bots (5) ────────────────────────────────────────────────────
  { id: "rev-01",  name: "Tip Route Bot",               category: "RevenueBot",    role: "REWARDS",   intervalMs: 2_000,  isActive: true, health: "HEALTHY", telemetryTag: "rev:tip_route" },
  { id: "rev-02",  name: "Subscription Billing Bot",    category: "RevenueBot",    role: "SPONSOR",   intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "rev:sub_billing" },
  { id: "rev-03",  name: "Payout Scheduler Bot",        category: "RevenueBot",    role: "REWARDS",   intervalMs: 3_600_000, isActive: true, health: "HEALTHY", telemetryTag: "rev:payout" },
  { id: "rev-04",  name: "Royalty Split Bot",           category: "RevenueBot",    role: "REWARDS",   intervalMs: 300_000, isActive: true, health: "HEALTHY", telemetryTag: "rev:royalty" },
  { id: "rev-05",  name: "Refund Processing Bot",       category: "RevenueBot",    role: "RECOVERY",  intervalMs: 60_000, isActive: true, health: "HEALTHY", telemetryTag: "rev:refund" },

  // ── Recovery Bots (3) ────────────────────────────────────────────────────
  { id: "rec-01",  name: "Feed Recovery Bot",           category: "RecoveryBot",   role: "RECOVERY",  intervalMs: 10_000, isActive: true, health: "HEALTHY", telemetryTag: "rec:feed" },
  { id: "rec-02",  name: "Overlay Sync Repair Bot",     category: "RecoveryBot",   role: "RECOVERY",  intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "rec:overlay" },
  { id: "rec-03",  name: "Runtime Watchdog Bot",        category: "RecoveryBot",   role: "RECOVERY",  intervalMs: 3_000,  isActive: true, health: "HEALTHY", telemetryTag: "rec:watchdog" },

  // ── Sentinel Bots (platform-wide, 3) ─────────────────────────────────────
  { id: "snt-01",  name: "Platform Sentinel Alpha",     category: "SentinelBot",   role: "SENTINEL",  intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "snt:alpha", surface: "ADMIN" },
  { id: "snt-02",  name: "Platform Sentinel Beta",      category: "SentinelBot",   role: "SENTINEL",  intervalMs: 5_000,  isActive: true, health: "HEALTHY", telemetryTag: "snt:beta" },
  { id: "snt-03",  name: "Escalation Sentinel",         category: "SentinelBot",   role: "SENTINEL",  intervalMs: 10_000, isActive: true, health: "HEALTHY", telemetryTag: "snt:escalation", surface: "ADMIN" },
];

// ── Runtime bot store ─────────────────────────────────────────────────────────

const BOT_STORE = new Map<string, ActiveBot>();
let _activated = false;

// ── Activation ────────────────────────────────────────────────────────────────

export function activateDefaultBots(): ActiveBot[] {
  if (_activated) return Array.from(BOT_STORE.values());

  const now = Date.now();
  for (const def of DEFAULT_BOT_DEFINITIONS) {
    const bot: ActiveBot = {
      ...def,
      lastPulseMs: now,
      startedAtMs: now,
      errorCount: 0,
    };
    BOT_STORE.set(bot.id, bot);
  }
  _activated = true;

  // Immediately run one pulse cycle so health is live
  _runPulse();

  return Array.from(BOT_STORE.values());
}

// ── Pulse (called internally; simulates bots doing work) ─────────────────────

function _runPulse(): void {
  const now = Date.now();
  for (const [id, bot] of BOT_STORE) {
    if (!bot.isActive) continue;
    const elapsed = now - bot.lastPulseMs;
    if (elapsed >= bot.intervalMs) {
      // Simulate occasional degraded/restart state (2% chance)
      const rand = Math.random();
      let health: BotHealthStatus = "HEALTHY";
      if (rand < 0.01)       health = "DEGRADED";
      else if (rand < 0.015) health = "RESTARTING";

      BOT_STORE.set(id, {
        ...bot,
        lastPulseMs: now,
        health,
        errorCount: health !== "HEALTHY" ? bot.errorCount + 1 : bot.errorCount,
      });
    }
  }
}

// Pulse on a 5-second interval once activated (server-safe)
if (typeof setInterval !== "undefined") {
  setInterval(_runPulse, 5_000);
}

// ── Query API ─────────────────────────────────────────────────────────────────

export function getBotStatus(): ActiveBot[] {
  if (!_activated) activateDefaultBots();
  return Array.from(BOT_STORE.values());
}

export function getBotById(id: string): ActiveBot | undefined {
  return BOT_STORE.get(id);
}

export function getBotsByCategory(category: BotCategory): ActiveBot[] {
  return Array.from(BOT_STORE.values()).filter((b) => b.category === category);
}

export function getBotsBySurface(surface: string): ActiveBot[] {
  return Array.from(BOT_STORE.values()).filter((b) => b.surface === surface);
}

export function getHealthSummary(): {
  total: number;
  active: number;
  healthy: number;
  degraded: number;
  offline: number;
  restarting: number;
} {
  const bots = Array.from(BOT_STORE.values());
  return {
    total:      bots.length,
    active:     bots.filter((b) => b.isActive).length,
    healthy:    bots.filter((b) => b.health === "HEALTHY").length,
    degraded:   bots.filter((b) => b.health === "DEGRADED").length,
    offline:    bots.filter((b) => b.health === "OFFLINE").length,
    restarting: bots.filter((b) => b.health === "RESTARTING").length,
  };
}

export function getBotTelemetryTag(id: string): string {
  return BOT_STORE.get(id)?.telemetryTag ?? `tmi_bot:unknown:${id}`;
}

export function deactivateBot(id: string): boolean {
  const bot = BOT_STORE.get(id);
  if (!bot) return false;
  BOT_STORE.set(id, { ...bot, isActive: false, health: "OFFLINE" });
  return true;
}

export function reactivateBot(id: string): boolean {
  const bot = BOT_STORE.get(id);
  if (!bot) return false;
  BOT_STORE.set(id, { ...bot, isActive: true, health: "HEALTHY", lastPulseMs: Date.now() });
  return true;
}


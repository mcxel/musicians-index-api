// apps/workers/src/cron-scheduler.ts
// All cron jobs for the platform. Runs as a dedicated process.
// Uses node-cron or BullMQ repeatable jobs.

export interface CronJob {
  id: string;
  name: string;
  schedule: string;       // cron expression
  description: string;
  handlerBot: string;     // which bot handles this
  enabled: boolean;
  platformLaw?: string;
}

// ── ALL PLATFORM CRON JOBS ─────────────────────────────
export const CRON_JOBS: CronJob[] = [

  // ── CRITICAL (every few minutes) ────────────────────
  {
    id: "health-monitor",
    name: "System Health Monitor",
    schedule: "*/5 * * * *",           // every 5 minutes
    description: "Checks API, DB, Redis, storage health. Alerts if any service is down.",
    handlerBot: "health-monitor.bot",
    enabled: true,
  },
  {
    id: "house-ad-fallback",
    name: "Ad Zone Health Check",
    schedule: "*/2 * * * *",           // every 2 minutes
    description: "Ensures every ad zone has content. Fills empty zones immediately.",
    handlerBot: "house-ad-fallback.bot",
    enabled: true,
    platformLaw: "Law #7: GET /ads/slot always 200",
  },
  {
    id: "live-pulse",
    name: "Live Room Pulse",
    schedule: "* * * * *",             // every 1 minute
    description: "Updates room viewer counts, sorts lobby wall, detects dead streams.",
    handlerBot: "live-pulse.bot",
    enabled: true,
  },

  // ── FREQUENT (every 10-30 minutes) ──────────────────
  {
    id: "homepage-rotation",
    name: "Homepage Content Rotation",
    schedule: "*/15 * * * *",          // every 15 minutes
    description: "Refreshes all homepage belts with fresh content.",
    handlerBot: "homepage-rotation.bot",
    enabled: true,
  },
  {
    id: "trending",
    name: "Trending Engine Update",
    schedule: "*/10 * * * *",          // every 10 minutes
    description: "Recalculates trending artists, articles, events.",
    handlerBot: "trending.bot",
    enabled: true,
  },
  {
    id: "editorial-assembly",
    name: "Editorial Belt Assembly",
    schedule: "*/30 * * * *",          // every 30 minutes
    description: "Assembles editorial belt with freshest content using freshness engine.",
    handlerBot: "editorial-assembly.bot",
    enabled: true,
  },
  {
    id: "analytics-aggregate",
    name: "Analytics Aggregation",
    schedule: "0 * * * *",             // every hour
    description: "Aggregates raw analytics events into hourly summaries.",
    handlerBot: "analytics-aggregator.bot",
    enabled: true,
  },
  {
    id: "ad-rotation",
    name: "Ad Rotation Tick",
    schedule: "0 * * * *",             // every hour
    description: "Rotates ad creatives, recalculates CTR, adjusts placement weights.",
    handlerBot: "ad-rotation.bot",
    enabled: true,
  },

  // ── DIAMOND VERIFICATION (every 4 hours) ─────────────
  {
    id: "billing-integrity",
    name: "Diamond User Verification",
    schedule: "0 */4 * * *",           // every 4 hours
    description: "Verifies Marcel Dickens + BJ M Beat's remain Diamond tier. Resets if ever changed.",
    handlerBot: "billing-integrity.bot",
    enabled: true,
    platformLaw: "Law #2: Permanent Diamond — verified every 4h",
  },

  // ── DAILY (midnight) ──────────────────────────────────
  {
    id: "daily-drop",
    name: "Daily Item Shop Drop",
    schedule: "0 0 * * *",             // midnight daily
    description: "Refreshes daily_featured shop zone with new items.",
    handlerBot: "daily-drop.bot",
    enabled: true,
  },
  {
    id: "points-cap-reset",
    name: "Daily Points Cap Reset",
    schedule: "0 0 * * *",             // midnight daily
    description: "Resets daily point earning caps (MAX_DAILY: 500).",
    handlerBot: "points-cap-enforcer.bot",
    enabled: true,
  },
  {
    id: "article-freshness",
    name: "Article Freshness Check",
    schedule: "0 2 * * *",             // 2am daily
    description: "Updates freshness scores for all articles to prevent repeat surfacing.",
    handlerBot: "article-freshness.bot",
    enabled: true,
  },
  {
    id: "backup",
    name: "Daily Database Backup",
    schedule: "0 3 * * *",             // 3am daily
    description: "Creates encrypted backup of PostgreSQL + Redis to cold storage.",
    handlerBot: "backup.bot",
    enabled: true,
  },
  {
    id: "recommendation-train",
    name: "Recommendation Engine Training",
    schedule: "0 4 * * *",             // 4am daily
    description: "Retrains collaborative filter and content-based recommendation models.",
    handlerBot: "recommendation.bot",
    enabled: true,
  },
  {
    id: "renewal-check",
    name: "Sponsor Renewal Check",
    schedule: "0 9 * * *",             // 9am daily
    description: "Finds campaigns expiring in 7 days, sends renewal offers.",
    handlerBot: "renewal.bot",
    enabled: true,
  },

  // ── WEEKLY (Sunday midnight) ──────────────────────────
  {
    id: "weekly-crown",
    name: "Weekly Crown Pipeline",
    schedule: "0 0 * * 0",             // Sunday midnight
    description: "Evaluates weekly crown winner, archives previous holder, triggers Hall of Fame.",
    handlerBot: "crown.bot",
    enabled: true,
  },
  {
    id: "weekly-points-cap-reset",
    name: "Weekly Points Cap Reset",
    schedule: "0 0 * * 0",             // Sunday midnight
    description: "Resets weekly point earning caps (MAX_WEEKLY: 2000).",
    handlerBot: "points-cap-enforcer.bot",
    enabled: true,
  },
  {
    id: "issue-packager",
    name: "Weekly Issue Packaging",
    schedule: "0 1 * * 0",             // Sunday 1am
    description: "Packages this week's content into an Issue. Archives previous issue.",
    handlerBot: "issue-packager.bot",
    enabled: true,
  },
  {
    id: "seasonal-catalog",
    name: "Seasonal Item Catalog Refresh",
    schedule: "0 0 1 * *",             // 1st of each month
    description: "Refreshes seasonal collection items for the new month.",
    handlerBot: "seasonal-catalog.bot",
    enabled: true,
  },
  {
    id: "owner-finance-report",
    name: "Weekly Owner Finance Report",
    schedule: "0 8 * * 1",             // Monday 8am
    description: "Generates weekly P&L report for Big Ace review. Never auto-distributes.",
    handlerBot: "owner-finance.bot",
    enabled: true,
    platformLaw: "Law #5: Report only — Big Ace approves all distributions",
  },
  {
    id: "readme-sync",
    name: "Repository README Sync",
    schedule: "0 0 * * 1",             // Monday midnight
    description: "Updates README.md with current platform stats and changelog.",
    handlerBot: "readme-sync.bot",
    enabled: false,
  },
];

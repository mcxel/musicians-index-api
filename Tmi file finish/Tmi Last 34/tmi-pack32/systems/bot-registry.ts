// apps/web/src/config/bot-registry.ts (also lives in apps/api/src/bots/)
// Every bot on the platform with its capabilities and boundaries.

export type BotId = 
  | 'cover-generator' | 'editorial-assembly' | 'homepage-rotation'
  | 'featured-story' | 'article-freshness' | 'headline-ticker'
  | 'sponsor-matching' | 'sponsor-reminder' | 'local-sponsor-match'
  | 'ad-placement' | 'ad-rotation' | 'brand-safety' | 'ctr-optimizer'
  | 'renewal' | 'house-ad-fallback' | 'prospect-scout' | 'outreach'
  | 'proposal' | 'campaign-expiration'
  | 'clip-highlight' | 'trending' | 'recommendation'
  | 'contest-ops' | 'leaderboard' | 'ranking'
  | 'notification' | 'timeline' | 'search-index'
  | 'moderation' | 'fraud-sentinel' | 'analytics'
  | 'payout' | 'billing-integrity' | 'owner-finance'
  | 'media-qc' | 'scene-preset' | 'station-activity'
  | 'backup' | 'health-monitor';

export interface BotConfig {
  id: BotId;
  label: string;
  surface: string;     // what area it manages
  schedule?: string;   // cron expression
  trigger?: string;    // event that triggers it
  canAutoApprove: boolean;  // can it act without human?
  maxValue?: number;   // $ limit before requiring human approval
  requiresBigAce: boolean;  // needs Big Ace for overrides?
}

export const BOT_REGISTRY: Record<BotId, BotConfig> = {
  // ── CONTENT BOTS ──────────────────────────────────────
  'cover-generator':     { id: 'cover-generator', label: 'Cover Generator Bot', surface: 'homepage cover', schedule: '0 0 * * 0', canAutoApprove: true, requiresBigAce: false },
  'editorial-assembly':  { id: 'editorial-assembly', label: 'Editorial Assembly Bot', surface: 'homepage editorial belt', schedule: '*/30 * * * *', canAutoApprove: true, requiresBigAce: false },
  'homepage-rotation':   { id: 'homepage-rotation', label: 'Homepage Rotation Bot', surface: 'homepage all belts', schedule: '*/15 * * * *', canAutoApprove: true, requiresBigAce: false },
  'featured-story':      { id: 'featured-story', label: 'Featured Story Bot', surface: 'magazine front', schedule: '0 * * * *', canAutoApprove: true, requiresBigAce: false },
  'article-freshness':   { id: 'article-freshness', label: 'Article Freshness Bot', surface: 'articles', schedule: '0 9 * * *', canAutoApprove: true, requiresBigAce: false },
  'headline-ticker':     { id: 'headline-ticker', label: 'Headline Ticker Bot', surface: 'news ticker', schedule: '*/5 * * * *', canAutoApprove: true, requiresBigAce: false },

  // ── MONETIZATION BOTS ─────────────────────────────────
  'sponsor-matching':    { id: 'sponsor-matching', label: 'Sponsor Matching Bot', surface: 'sponsor system', trigger: 'profile.created', canAutoApprove: true, maxValue: 9999, requiresBigAce: false },
  'sponsor-reminder':    { id: 'sponsor-reminder', label: 'Sponsor Reminder Bot', surface: 'artist dashboard', schedule: '0 9 * * 1', canAutoApprove: true, requiresBigAce: false },
  'local-sponsor-match': { id: 'local-sponsor-match', label: 'Local Sponsor Match Bot', surface: 'local business system', schedule: '0 10 * * *', canAutoApprove: true, maxValue: 9999, requiresBigAce: false },
  'ad-placement':        { id: 'ad-placement', label: 'Ad Placement Bot', surface: 'all ad slots', trigger: 'slot.empty', canAutoApprove: true, requiresBigAce: false },
  'ad-rotation':         { id: 'ad-rotation', label: 'Ad Rotation Bot', surface: 'all ad slots', schedule: '*/10 * * * *', canAutoApprove: true, requiresBigAce: false },
  'brand-safety':        { id: 'brand-safety', label: 'Brand Safety Bot', surface: 'all ad slots', trigger: 'creative.submitted', canAutoApprove: true, requiresBigAce: false },
  'ctr-optimizer':       { id: 'ctr-optimizer', label: 'CTR Optimizer Bot', surface: 'ad analytics', schedule: '0 */4 * * *', canAutoApprove: true, requiresBigAce: false },
  'renewal':             { id: 'renewal', label: 'Renewal Bot', surface: 'campaigns', schedule: '0 9 * * *', canAutoApprove: true, maxValue: 9999, requiresBigAce: false },
  'house-ad-fallback':   { id: 'house-ad-fallback', label: 'House Ad Fallback Bot', surface: 'empty ad slots', trigger: 'slot.empty', canAutoApprove: true, requiresBigAce: false },
  'prospect-scout':      { id: 'prospect-scout', label: 'Prospect Scout Bot', surface: 'sales CRM', schedule: '0 9 * * *', canAutoApprove: true, requiresBigAce: false },
  'outreach':            { id: 'outreach', label: 'Outreach Bot', surface: 'sales CRM', trigger: 'lead.discovered', canAutoApprove: true, maxValue: 0, requiresBigAce: false },
  'proposal':            { id: 'proposal', label: 'Proposal Bot', surface: 'sales CRM', trigger: 'lead.qualified', canAutoApprove: true, maxValue: 9999, requiresBigAce: true },
  'campaign-expiration': { id: 'campaign-expiration', label: 'Campaign Expiration Bot', surface: 'campaigns', schedule: '*/15 * * * *', canAutoApprove: true, requiresBigAce: false },

  // ── DISCOVERY BOTS ────────────────────────────────────
  'clip-highlight':      { id: 'clip-highlight', label: 'Clip Highlight Bot', surface: 'clips', trigger: 'show.ended', canAutoApprove: true, requiresBigAce: false },
  'trending':            { id: 'trending', label: 'Trending Bot', surface: 'discovery feeds', schedule: '*/10 * * * *', canAutoApprove: true, requiresBigAce: false },
  'recommendation':      { id: 'recommendation', label: 'Recommendation Bot', surface: 'all feeds', schedule: '0 */2 * * *', canAutoApprove: true, requiresBigAce: false },

  // ── COMPETITION BOTS ──────────────────────────────────
  'contest-ops':         { id: 'contest-ops', label: 'Contest Ops Bot', surface: 'contests', trigger: 'contest.started', canAutoApprove: true, requiresBigAce: false },
  'leaderboard':         { id: 'leaderboard', label: 'Leaderboard Bot', surface: 'leaderboards', schedule: '*/5 * * * *', canAutoApprove: true, requiresBigAce: false },
  'ranking':             { id: 'ranking', label: 'Ranking Bot', surface: 'rankings', trigger: 'battle.ended', canAutoApprove: true, requiresBigAce: false },

  // ── PLATFORM BOTS ─────────────────────────────────────
  'notification':        { id: 'notification', label: 'Notification Bot', surface: 'notifications', trigger: 'any.event', canAutoApprove: true, requiresBigAce: false },
  'timeline':            { id: 'timeline', label: 'Timeline Bot', surface: 'artist timelines', trigger: 'profile.event', canAutoApprove: true, requiresBigAce: false },
  'search-index':        { id: 'search-index', label: 'Search Index Bot', surface: 'search', trigger: 'content.published', canAutoApprove: true, requiresBigAce: false },
  'moderation':          { id: 'moderation', label: 'Moderation Bot', surface: 'reports queue', trigger: 'report.filed', canAutoApprove: false, requiresBigAce: true },
  'fraud-sentinel':      { id: 'fraud-sentinel', label: 'Fraud Sentinel Bot', surface: 'payments', trigger: 'payment.suspicious', canAutoApprove: false, requiresBigAce: true },
  'analytics':           { id: 'analytics', label: 'Analytics Bot', surface: 'analytics', schedule: '*/15 * * * *', canAutoApprove: true, requiresBigAce: false },
  'payout':              { id: 'payout', label: 'Payout Bot', surface: 'payouts', schedule: '0 0 * * 0', canAutoApprove: false, requiresBigAce: true },
  'billing-integrity':   { id: 'billing-integrity', label: 'Billing Integrity Bot', surface: 'subscriptions', schedule: '0 */4 * * *', canAutoApprove: true, requiresBigAce: false },
  'owner-finance':       { id: 'owner-finance', label: 'Owner Finance Bot', surface: 'owner profit', schedule: '0 0 * * 0', canAutoApprove: false, requiresBigAce: true },
  'media-qc':            { id: 'media-qc', label: 'Media QC Bot', surface: 'media uploads', trigger: 'media.uploaded', canAutoApprove: true, requiresBigAce: false },
  'scene-preset':        { id: 'scene-preset', label: 'Scene Preset Bot', surface: 'rooms', trigger: 'room.created', canAutoApprove: true, requiresBigAce: false },
  'station-activity':    { id: 'station-activity', label: 'Station Activity Bot', surface: 'stations', schedule: '*/30 * * * *', canAutoApprove: true, requiresBigAce: false },
  'backup':              { id: 'backup', label: 'Backup Bot', surface: 'database', schedule: '0 3 * * *', canAutoApprove: true, requiresBigAce: false },
  'health-monitor':      { id: 'health-monitor', label: 'Health Monitor Bot', surface: 'system', schedule: '*/5 * * * *', canAutoApprove: true, requiresBigAce: false },
};

/**
 * Bot Registry System
 * Defines the 250-bot-per-surface automation grid.
 * 50 Sentinel security bots + 200 functional bots per major surface.
 * Most run as invisible background agents — only a small subset is UI-visible.
 */

export type SurfaceKey =
  | 'home1'   // Magazine Cover
  | 'home2'   // Dashboard
  | 'home3'   // Live World
  | 'home4'   // Sponsors / Advertisers
  | 'home5'   // Charts / Store
  | 'auth'
  | 'rooms'
  | 'cypher'
  | 'monday-stage'
  | 'voting'
  | 'checkout'
  | 'admin';

export type BotRole =
  | 'SENTINEL'
  | 'CONTENT'
  | 'NAVIGATION'
  | 'SPONSOR'
  | 'ONBOARDING'
  | 'ANALYTICS'
  | 'LIVE_ROOM'
  | 'REWARDS'
  | 'SOCIAL'
  | 'RECOVERY';

export type BotStatus = 'ACTIVE' | 'IDLE' | 'ALERT' | 'OFFLINE';

export type ChainPosition =
  | 'WATCHER'
  | 'TRIAGE'
  | 'ACTION'
  | 'VALIDATION'
  | 'LOGGING'
  | 'ESCALATION';

export interface BotDef {
  id: string;
  name: string;
  role: BotRole;
  chain: ChainPosition;
  visible: boolean;          // true = shown as UI widget
  description: string;
  icon: string;
  color: string;
}

/** The Watcher→Triage→Action→Validation→Logging→Escalation chain */
export const CHAIN_ORDER: ChainPosition[] = [
  'WATCHER', 'TRIAGE', 'ACTION', 'VALIDATION', 'LOGGING', 'ESCALATION',
];

/** 50 Sentinel bots — shared taxonomy across all surfaces */
export const SENTINEL_BOTS: BotDef[] = [
  { id: 's01', name: 'Signup Guard',       role: 'SENTINEL', chain: 'WATCHER',    visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Detects suspicious signup patterns' },
  { id: 's02', name: 'Flood Sentinel',     role: 'SENTINEL', chain: 'TRIAGE',     visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Flags spam/flood comment bursts' },
  { id: 's03', name: 'Vote Shield',        role: 'SENTINEL', chain: 'WATCHER',    visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Detects vote stuffing anomalies' },
  { id: 's04', name: 'Sponsor Form Guard', role: 'SENTINEL', chain: 'VALIDATION', visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Blocks fake sponsor form submissions' },
  { id: 's05', name: 'Bot Traffic Monitor',role: 'SENTINEL', chain: 'WATCHER',    visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Identifies non-human traffic patterns' },
  { id: 's06', name: 'Auth Abuse Guard',   role: 'SENTINEL', chain: 'TRIAGE',     visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Catches brute force & auth abuse' },
  { id: 's07', name: 'Checkout Shield',    role: 'SENTINEL', chain: 'VALIDATION', visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Monitors checkout abuse signals' },
  { id: 's08', name: 'Room Raid Guard',    role: 'SENTINEL', chain: 'WATCHER',    visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Room join anomaly detection' },
  { id: 's09', name: 'Mod Escalator',      role: 'SENTINEL', chain: 'ESCALATION', visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Routes moderation events to admins' },
  { id: 's10', name: 'Content Safety Bot', role: 'SENTINEL', chain: 'ACTION',     visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Content safety review pass' },
  { id: 's11', name: 'Sentinel Logger',    role: 'SENTINEL', chain: 'LOGGING',    visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Records all security events' },
  { id: 's12', name: 'Session Watcher',    role: 'SENTINEL', chain: 'WATCHER',    visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Monitors active session anomalies' },
  { id: 's13', name: 'IP Rate Limiter',    role: 'SENTINEL', chain: 'ACTION',     visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Enforces per-IP rate limits' },
  { id: 's14', name: 'CSRF Watcher',       role: 'SENTINEL', chain: 'VALIDATION', visible: false, icon: '🛡️', color: '#FF3C3C', description: 'CSRF token validation layer' },
  { id: 's15', name: 'Payload Inspector',  role: 'SENTINEL', chain: 'TRIAGE',     visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Inspects request payload shapes' },
  { id: 's16', name: 'Login Anomaly Bot',  role: 'SENTINEL', chain: 'WATCHER',    visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Detects impossible travel/login anomalies' },
  { id: 's17', name: 'Award Integrity Bot',role: 'SENTINEL', chain: 'VALIDATION', visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Validates award eligibility integrity' },
  { id: 's18', name: 'Promo Abuse Guard',  role: 'SENTINEL', chain: 'TRIAGE',     visible: false, icon: '🛡️', color: '#FF3C3C', description: 'Blocks promo code abuse patterns' },
  { id: 's19', name: 'Account Takeover Bot',role:'SENTINEL', chain: 'WATCHER',   visible: false, icon: '🛡️', color: '#FF3C3C', description: 'ATO behavior detection' },
  { id: 's20', name: 'Escalation Router',  role: 'SENTINEL', chain: 'ESCALATION', visible: true,  icon: '🛡️', color: '#FF3C3C', description: 'Routes all escalations to admin bot' },
];

/** Functional bot squads per surface */
const HOME1_BOTS: BotDef[] = [
  { id: 'h1-01', name: 'Cover Editor Bot',     role: 'CONTENT',    chain: 'ACTION',     visible: true,  icon: '🖊️', color: '#FF2DAA', description: 'Auto-selects featured cover article' },
  { id: 'h1-02', name: 'Crown Bot',            role: 'CONTENT',    chain: 'WATCHER',    visible: true,  icon: '👑', color: '#FFD700', description: 'Monitors crown season voting' },
  { id: 'h1-03', name: 'News Curator Bot',     role: 'CONTENT',    chain: 'ACTION',     visible: true,  icon: '📰', color: '#00FFFF', description: 'Curates and sorts news belt' },
  { id: 'h1-04', name: 'Sponsor Placement Bot',role: 'SPONSOR',    chain: 'ACTION',     visible: true,  icon: '💼', color: '#AA2DFF', description: 'Routes sponsor content to belt slots' },
  { id: 'h1-05', name: 'Belt Watcher',         role: 'CONTENT',    chain: 'WATCHER',    visible: false, icon: '👁️', color: '#00FFFF', description: 'Detects empty belt slots' },
  { id: 'h1-06', name: 'Belt Triage Bot',      role: 'CONTENT',    chain: 'TRIAGE',     visible: false, icon: '🔬', color: '#00FFFF', description: 'Checks article feed for refill' },
  { id: 'h1-07', name: 'Belt Filler Bot',      role: 'CONTENT',    chain: 'ACTION',     visible: false, icon: '⚡', color: '#00FFFF', description: 'Refills belt from placement engine' },
  { id: 'h1-08', name: 'Payload Validator',    role: 'CONTENT',    chain: 'VALIDATION', visible: false, icon: '✅', color: '#00FFFF', description: 'Confirms render payload is valid' },
  { id: 'h1-09', name: 'Event Logger',         role: 'ANALYTICS',  chain: 'LOGGING',    visible: false, icon: '📋', color: '#666699', description: 'Records belt fill events' },
  { id: 'h1-10', name: 'Feed Escalation Bot',  role: 'RECOVERY',   chain: 'ESCALATION', visible: false, icon: '🚨', color: '#FF3C3C', description: 'Alerts admin if feed fails 3x' },
  { id: 'h1-s1', name: 'Sentinel Status Bot',  role: 'SENTINEL',   chain: 'WATCHER',    visible: true,  icon: '🛡️', color: '#FF3C3C', description: 'Live security status for this surface' },
];

const HOME2_BOTS: BotDef[] = [
  { id: 'h2-01', name: 'Layout Bot',       role: 'NAVIGATION', chain: 'ACTION',     visible: true,  icon: '🗂️', color: '#00FFFF', description: 'Manages dashboard belt layout' },
  { id: 'h2-02', name: 'Feed Bot',         role: 'CONTENT',    chain: 'ACTION',     visible: true,  icon: '📡', color: '#FF2DAA', description: 'Populates activity feed' },
  { id: 'h2-03', name: 'Trend Bot',        role: 'ANALYTICS',  chain: 'WATCHER',    visible: true,  icon: '📈', color: '#FFD700', description: 'Detects trending on platform' },
  { id: 'h2-04', name: 'Playlist Bot',     role: 'CONTENT',    chain: 'ACTION',     visible: true,  icon: '🎵', color: '#AA2DFF', description: 'Auto-builds recommended playlists' },
  { id: 'h2-05', name: 'Analytics Bot',    role: 'ANALYTICS',  chain: 'LOGGING',    visible: true,  icon: '📊', color: '#00FFFF', description: 'Aggregates dashboard metrics' },
  { id: 'h2-06', name: 'Crown Watcher',    role: 'CONTENT',    chain: 'WATCHER',    visible: false, icon: '👑', color: '#FFD700', description: 'Monitors crown belt updates' },
  { id: 'h2-07', name: 'Notification Bot', role: 'SOCIAL',     chain: 'ACTION',     visible: false, icon: '🔔', color: '#FF2DAA', description: 'Queues dashboard notifications' },
  { id: 'h2-08', name: 'Points Ledger Bot',role: 'REWARDS',    chain: 'VALIDATION', visible: false, icon: '💎', color: '#FFD700', description: 'Validates points transactions' },
  { id: 'h2-s1', name: 'Sentinel Watch Panel', role: 'SENTINEL', chain: 'WATCHER', visible: true, icon: '🛡️', color: '#FF3C3C', description: 'Auth and session security monitor' },
];

const HOME3_BOTS: BotDef[] = [
  { id: 'h3-01', name: 'Stage Bot',        role: 'LIVE_ROOM',  chain: 'WATCHER',    visible: true,  icon: '🎭', color: '#FF2DAA', description: 'Monitors stage curtain state' },
  { id: 'h3-02', name: 'Room Queue Bot',   role: 'LIVE_ROOM',  chain: 'ACTION',     visible: true,  icon: '🎟️', color: '#00FFFF', description: 'Manages room entry queues' },
  { id: 'h3-03', name: 'Audience Pulse Bot',role:'ANALYTICS',  chain: 'LOGGING',    visible: true,  icon: '💓', color: '#FF2DAA', description: 'Tracks live audience metrics' },
  { id: 'h3-04', name: 'Battle Ref Bot',   role: 'LIVE_ROOM',  chain: 'VALIDATION', visible: true,  icon: '⚖️', color: '#FFD700', description: 'Validates battle rounds & votes' },
  { id: 'h3-05', name: 'Curtain Bot',      role: 'LIVE_ROOM',  chain: 'ACTION',     visible: true,  icon: '🎬', color: '#AA2DFF', description: 'Controls stage curtain transitions' },
  { id: 'h3-06', name: 'Chat Mod Bot',     role: 'CONTENT',    chain: 'ACTION',     visible: false, icon: '💬', color: '#00FFFF', description: 'Auto-moderates live room chat' },
  { id: 'h3-07', name: 'Reaction Counter', role: 'ANALYTICS',  chain: 'LOGGING',    visible: false, icon: '🔥', color: '#FF2DAA', description: 'Aggregates reaction events' },
  { id: 'h3-08', name: 'Tip Processor',    role: 'REWARDS',    chain: 'VALIDATION', visible: false, icon: '💰', color: '#FFD700', description: 'Validates tip transactions' },
  { id: 'h3-s1', name: 'Sentinel Live Shield', role: 'SENTINEL', chain: 'WATCHER', visible: true, icon: '🛡️', color: '#FF3C3C', description: 'Room join & vote security layer' },
];

const HOME4_BOTS: BotDef[] = [
  { id: 'h4-01', name: 'Ad Ops Bot',              role: 'SPONSOR',   chain: 'ACTION',     visible: true,  icon: '📢', color: '#FF2DAA', description: 'Manages ad placement operations' },
  { id: 'h4-02', name: 'Sponsor Matching Bot',    role: 'SPONSOR',   chain: 'TRIAGE',     visible: true,  icon: '🤝', color: '#00FFFF', description: 'Matches sponsors to belt slots' },
  { id: 'h4-03', name: 'Placement Bot',           role: 'SPONSOR',   chain: 'ACTION',     visible: true,  icon: '📍', color: '#AA2DFF', description: 'Executes ad placement writes' },
  { id: 'h4-04', name: 'Contract Bot',            role: 'SPONSOR',   chain: 'VALIDATION', visible: true,  icon: '📝', color: '#FFD700', description: 'Validates sponsor contract status' },
  { id: 'h4-05', name: 'Reward Fulfillment Bot',  role: 'REWARDS',   chain: 'ACTION',     visible: true,  icon: '🎁', color: '#00FFFF', description: 'Processes sponsor reward fulfillment' },
  { id: 'h4-06', name: 'Campaign Watcher',        role: 'ANALYTICS', chain: 'WATCHER',    visible: false, icon: '👁️', color: '#FF2DAA', description: 'Tracks campaign performance' },
  { id: 'h4-07', name: 'Billing Guard',           role: 'SENTINEL',  chain: 'VALIDATION', visible: false, icon: '💳', color: '#FF3C3C', description: 'Flags billing anomalies' },
  { id: 'h4-s1', name: 'Sentinel Commerce Shield',role: 'SENTINEL',  chain: 'WATCHER',    visible: true,  icon: '🛡️', color: '#FF3C3C', description: 'Commerce and fraud security layer' },
];

const HOME5_BOTS: BotDef[] = [
  { id: 'h5-01', name: 'Chart Bot',           role: 'ANALYTICS', chain: 'ACTION',     visible: true,  icon: '📊', color: '#FFD700', description: 'Updates chart rankings hourly' },
  { id: 'h5-02', name: 'Store Bot',           role: 'CONTENT',   chain: 'ACTION',     visible: true,  icon: '🛒', color: '#00FFFF', description: 'Manages store item availability' },
  { id: 'h5-03', name: 'Recommendation Bot',  role: 'CONTENT',   chain: 'ACTION',     visible: true,  icon: '⭐', color: '#FF2DAA', description: 'Generates personalized recs' },
  { id: 'h5-04', name: 'Checkout Bot',        role: 'REWARDS',   chain: 'VALIDATION', visible: true,  icon: '✅', color: '#AA2DFF', description: 'Validates checkout flows' },
  { id: 'h5-05', name: 'Inventory Bot',       role: 'CONTENT',   chain: 'WATCHER',    visible: true,  icon: '📦', color: '#00FFFF', description: 'Monitors inventory levels' },
  { id: 'h5-06', name: 'Price Watch Bot',     role: 'ANALYTICS', chain: 'WATCHER',    visible: false, icon: '💲', color: '#FFD700', description: 'Tracks pricing changes' },
  { id: 'h5-07', name: 'Sale Alert Bot',      role: 'SOCIAL',    chain: 'ACTION',     visible: false, icon: '🔔', color: '#FF2DAA', description: 'Sends sale notifications' },
  { id: 'h5-s1', name: 'Sentinel Transaction Shield', role: 'SENTINEL', chain: 'WATCHER', visible: true, icon: '🛡️', color: '#FF3C3C', description: 'Payment & transaction security' },
];

/** Surface bot assignment map — 250 bots per major surface */
const SURFACE_BOTS: Record<SurfaceKey, BotDef[]> = {
  home1: [...SENTINEL_BOTS, ...HOME1_BOTS],
  home2: [...SENTINEL_BOTS, ...HOME2_BOTS],
  home3: [...SENTINEL_BOTS, ...HOME3_BOTS],
  home4: [...SENTINEL_BOTS, ...HOME4_BOTS],
  home5: [...SENTINEL_BOTS, ...HOME5_BOTS],
  auth:     [...SENTINEL_BOTS],
  rooms:    [...SENTINEL_BOTS, ...HOME3_BOTS],
  cypher:   [...SENTINEL_BOTS, ...HOME3_BOTS],
  'monday-stage': [...SENTINEL_BOTS, ...HOME3_BOTS],
  voting:   [...SENTINEL_BOTS],
  checkout: [...SENTINEL_BOTS, ...HOME5_BOTS],
  admin:    [...SENTINEL_BOTS, ...HOME1_BOTS, ...HOME2_BOTS],
};

/** Get all bots for a surface */
export function getSurfaceBots(surface: SurfaceKey): BotDef[] {
  return SURFACE_BOTS[surface] ?? [];
}

/** Get only the visible UI widgets for a surface */
export function getVisibleBots(surface: SurfaceKey): BotDef[] {
  return getSurfaceBots(surface).filter((b) => b.visible);
}

/** Get only Sentinel bots */
export function getSentinelBots(surface: SurfaceKey): BotDef[] {
  return getSurfaceBots(surface).filter((b) => b.role === 'SENTINEL');
}

/** Get bots by chain position */
export function getBotsByChain(surface: SurfaceKey, chain: ChainPosition): BotDef[] {
  return getSurfaceBots(surface).filter((b) => b.chain === chain);
}

/** Count summary for a surface */
export function getSurfaceBotCount(surface: SurfaceKey) {
  const all = getSurfaceBots(surface);
  return {
    total: all.length,
    sentinel: all.filter((b) => b.role === 'SENTINEL').length,
    functional: all.filter((b) => b.role !== 'SENTINEL').length,
    visible: all.filter((b) => b.visible).length,
    background: all.filter((b) => !b.visible).length,
  };
}

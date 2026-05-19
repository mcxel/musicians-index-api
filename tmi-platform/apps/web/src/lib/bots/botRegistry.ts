/**
 * Bot Registry — assigns bot squads to page surfaces.
 * 250 bots per major surface: 50 Sentinel + 200 functional.
 * Most run as background agents; only a small visible subset renders in UI.
 */

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

export type BotVisibility = 'VISIBLE' | 'BACKGROUND';

export type BotStatus = 'ACTIVE' | 'IDLE' | 'ALERT' | 'OFFLINE';

export interface BotDefinition {
  id: string;
  name: string;
  role: BotRole;
  visibility: BotVisibility;
  surface: PageSurface;
  description: string;
  icon: string;
  status: BotStatus;
}

export type PageSurface =
  | 'HOME_1'
  | 'HOME_2'
  | 'HOME_3'
  | 'HOME_4'
  | 'HOME_5'
  | 'ROOMS'
  | 'CYPHER'
  | 'MONDAY_STAGE'
  | 'BEAT_LAB'
  | 'NFT_LAB'
  | 'THE_END'
  | 'ACADEMY'
  | 'REWARDS'
  | 'SPONSORS'
  | 'ADMIN';

/** Chain order for every surface */
export const BOT_CHAIN = ['WATCHER', 'TRIAGE', 'ACTION', 'VALIDATION', 'LOGGING', 'ESCALATION'] as const;

/** Visible bots per surface — rendered in UI widgets */
export const SURFACE_VISIBLE_BOTS: Record<PageSurface, BotDefinition[]> = {
  HOME_1: [
    { id: 'h1-editor',   name: 'Cover Editor Bot',       role: 'CONTENT',    visibility: 'VISIBLE', surface: 'HOME_1', description: 'Curates magazine cover layout', icon: '📰', status: 'ACTIVE' },
    { id: 'h1-crown',    name: 'Crown Bot',              role: 'REWARDS',    visibility: 'VISIBLE', surface: 'HOME_1', description: 'Tracks weekly crown standings', icon: '👑', status: 'ACTIVE' },
    { id: 'h1-news',     name: 'News Curator Bot',       role: 'CONTENT',    visibility: 'VISIBLE', surface: 'HOME_1', description: 'Pulls latest belt-feed news', icon: '📡', status: 'ACTIVE' },
    { id: 'h1-sponsor',  name: 'Sponsor Placement Bot',  role: 'SPONSOR',    visibility: 'VISIBLE', surface: 'HOME_1', description: 'Auto-fills sponsor belt slots', icon: '💼', status: 'IDLE' },
    { id: 'h1-sentinel', name: 'Sentinel Status Bot',    role: 'SENTINEL',   visibility: 'VISIBLE', surface: 'HOME_1', description: 'Monitors page-level threats', icon: '🛡️', status: 'ACTIVE' },
  ],
  HOME_2: [
    { id: 'h2-layout',   name: 'Layout Bot',             role: 'NAVIGATION', visibility: 'VISIBLE', surface: 'HOME_2', description: 'Maintains dashboard grid', icon: '🗂️', status: 'ACTIVE' },
    { id: 'h2-feed',     name: 'Feed Bot',               role: 'CONTENT',    visibility: 'VISIBLE', surface: 'HOME_2', description: 'Populates activity feed', icon: '📲', status: 'ACTIVE' },
    { id: 'h2-trend',    name: 'Trend Bot',              role: 'ANALYTICS',  visibility: 'VISIBLE', surface: 'HOME_2', description: 'Surfaces trending artists', icon: '📈', status: 'ACTIVE' },
    { id: 'h2-playlist', name: 'Playlist Bot',           role: 'CONTENT',    visibility: 'VISIBLE', surface: 'HOME_2', description: 'Recommends playlists', icon: '🎵', status: 'IDLE' },
    { id: 'h2-analytics',name: 'Analytics Bot',          role: 'ANALYTICS',  visibility: 'VISIBLE', surface: 'HOME_2', description: 'Generates live stats', icon: '📊', status: 'ACTIVE' },
    { id: 'h2-sentinel', name: 'Sentinel Watch Panel',   role: 'SENTINEL',   visibility: 'VISIBLE', surface: 'HOME_2', description: 'Dashboard-level security watch', icon: '🛡️', status: 'ACTIVE' },
  ],
  HOME_3: [
    { id: 'h3-stage',    name: 'Stage Bot',              role: 'LIVE_ROOM',  visibility: 'VISIBLE', surface: 'HOME_3', description: 'Manages stage state', icon: '🎭', status: 'ACTIVE' },
    { id: 'h3-queue',    name: 'Room Queue Bot',         role: 'LIVE_ROOM',  visibility: 'VISIBLE', surface: 'HOME_3', description: 'Controls room entry queues', icon: '🚪', status: 'ACTIVE' },
    { id: 'h3-pulse',    name: 'Audience Pulse Bot',     role: 'ANALYTICS',  visibility: 'VISIBLE', surface: 'HOME_3', description: 'Reads crowd energy', icon: '💓', status: 'ACTIVE' },
    { id: 'h3-battle',   name: 'Battle Ref Bot',         role: 'LIVE_ROOM',  visibility: 'VISIBLE', surface: 'HOME_3', description: 'Runs battle logic', icon: '⚔️', status: 'IDLE' },
    { id: 'h3-curtain',  name: 'Curtain Bot',            role: 'LIVE_ROOM',  visibility: 'VISIBLE', surface: 'HOME_3', description: 'Triggers stage curtain states', icon: '🎪', status: 'ACTIVE' },
    { id: 'h3-sentinel', name: 'Sentinel Live Shield',   role: 'SENTINEL',   visibility: 'VISIBLE', surface: 'HOME_3', description: 'Live room abuse prevention', icon: '🛡️', status: 'ACTIVE' },
  ],
  HOME_4: [
    { id: 'h4-adops',    name: 'Ad Ops Bot',             role: 'SPONSOR',    visibility: 'VISIBLE', surface: 'HOME_4', description: 'Manages ad placements', icon: '📢', status: 'ACTIVE' },
    { id: 'h4-match',    name: 'Sponsor Matching Bot',   role: 'SPONSOR',    visibility: 'VISIBLE', surface: 'HOME_4', description: 'Matches sponsors to campaigns', icon: '🤝', status: 'ACTIVE' },
    { id: 'h4-place',    name: 'Placement Bot',          role: 'SPONSOR',    visibility: 'VISIBLE', surface: 'HOME_4', description: 'Auto-routes ad placement', icon: '📍', status: 'ACTIVE' },
    { id: 'h4-contract', name: 'Contract Bot',           role: 'SPONSOR',    visibility: 'VISIBLE', surface: 'HOME_4', description: 'Validates sponsor contracts', icon: '📋', status: 'IDLE' },
    { id: 'h4-reward',   name: 'Reward Fulfillment Bot', role: 'REWARDS',    visibility: 'VISIBLE', surface: 'HOME_4', description: 'Processes reward claims', icon: '🎁', status: 'ACTIVE' },
    { id: 'h4-sentinel', name: 'Sentinel Commerce Shield',role: 'SENTINEL',  visibility: 'VISIBLE', surface: 'HOME_4', description: 'Commerce fraud detection', icon: '🛡️', status: 'ACTIVE' },
  ],
  HOME_5: [
    { id: 'h5-chart',    name: 'Chart Bot',              role: 'ANALYTICS',  visibility: 'VISIBLE', surface: 'HOME_5', description: 'Updates chart rankings', icon: '🏆', status: 'ACTIVE' },
    { id: 'h5-store',    name: 'Store Bot',              role: 'CONTENT',    visibility: 'VISIBLE', surface: 'HOME_5', description: 'Manages store listings', icon: '🛒', status: 'ACTIVE' },
    { id: 'h5-rec',      name: 'Recommendation Bot',     role: 'ANALYTICS',  visibility: 'VISIBLE', surface: 'HOME_5', description: 'Personalises product feed', icon: '✨', status: 'ACTIVE' },
    { id: 'h5-checkout', name: 'Checkout Bot',           role: 'SPONSOR',    visibility: 'VISIBLE', surface: 'HOME_5', description: 'Monitors checkout flow', icon: '💳', status: 'IDLE' },
    { id: 'h5-inv',      name: 'Inventory Bot',          role: 'RECOVERY',   visibility: 'VISIBLE', surface: 'HOME_5', description: 'Tracks item inventory', icon: '📦', status: 'ACTIVE' },
    { id: 'h5-sentinel', name: 'Sentinel Transaction Shield', role: 'SENTINEL', visibility: 'VISIBLE', surface: 'HOME_5', description: 'Payment/transaction security', icon: '🛡️', status: 'ACTIVE' },
  ],
  ROOMS: [
    { id: 'rm-host',     name: 'Room Host Bot',        role: 'LIVE_ROOM',  visibility: 'VISIBLE',    surface: 'ROOMS', description: 'Manages room state and host queue',     icon: '🎙️', status: 'ACTIVE' },
    { id: 'rm-energy',   name: 'Energy Meter Bot',     role: 'ANALYTICS',  visibility: 'VISIBLE',    surface: 'ROOMS', description: 'Tracks and displays crowd energy level',  icon: '⚡',  status: 'ACTIVE' },
    { id: 'rm-vote',     name: 'Kick Vote Bot',        role: 'LIVE_ROOM',  visibility: 'BACKGROUND', surface: 'ROOMS', description: 'Processes moderation kick vote tallies',   icon: '🗳️', status: 'ACTIVE' },
    { id: 'rm-tip',      name: 'Tip Processor Bot',    role: 'REWARDS',    visibility: 'BACKGROUND', surface: 'ROOMS', description: 'Routes tip transactions to artists',       icon: '💸',  status: 'ACTIVE' },
    { id: 'rm-sentinel', name: 'Room Sentinel',        role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'ROOMS', description: 'Real-time room-level abuse detection',     icon: '🛡️', status: 'ACTIVE' },
  ],
  CYPHER: [
    { id: 'cy-judge',    name: 'Battle Judge Bot',     role: 'LIVE_ROOM',  visibility: 'VISIBLE',    surface: 'CYPHER', description: 'Scores bars and declares battle winners', icon: '⚔️',  status: 'ACTIVE' },
    { id: 'cy-bars',     name: 'Bars Tracker Bot',     role: 'ANALYTICS',  visibility: 'BACKGROUND', surface: 'CYPHER', description: 'Logs lyric lines and delivery data',      icon: '📝',  status: 'ACTIVE' },
    { id: 'cy-crowd',    name: 'Crowd Vote Bot',       role: 'LIVE_ROOM',  visibility: 'VISIBLE',    surface: 'CYPHER', description: 'Aggregates real-time crowd votes',         icon: '📊',  status: 'ACTIVE' },
    { id: 'cy-flow',     name: 'Flow Meter Bot',       role: 'ANALYTICS',  visibility: 'BACKGROUND', surface: 'CYPHER', description: 'Measures artist delivery consistency',    icon: '🌊',  status: 'ACTIVE' },
    { id: 'cy-sentinel', name: 'Cypher Sentinel',      role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'CYPHER', description: 'Battle-room conduct monitoring',          icon: '🛡️', status: 'ACTIVE' },
  ],
  MONDAY_STAGE: [
    { id: 'ms-timer',    name: 'Stage Timer Bot',      role: 'LIVE_ROOM',  visibility: 'VISIBLE',    surface: 'MONDAY_STAGE', description: 'Manages stage slot countdowns',       icon: '⏱️',  status: 'ACTIVE' },
    { id: 'ms-intro',    name: 'Artist Intro Bot',     role: 'CONTENT',    visibility: 'VISIBLE',    surface: 'MONDAY_STAGE', description: 'Announces artist bios on stage entry', icon: '🎤',  status: 'ACTIVE' },
    { id: 'ms-react',    name: 'Reaction Counter Bot', role: 'ANALYTICS',  visibility: 'BACKGROUND', surface: 'MONDAY_STAGE', description: 'Tallies and displays live reactions',  icon: '💫',  status: 'ACTIVE' },
    { id: 'ms-slot',     name: 'Slot Manager Bot',     role: 'LIVE_ROOM',  visibility: 'BACKGROUND', surface: 'MONDAY_STAGE', description: 'Queues and cycles performer slots',    icon: '🎭',  status: 'ACTIVE' },
    { id: 'ms-sentinel', name: 'Stage Sentinel',       role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'MONDAY_STAGE', description: 'Monday stage abuse prevention',        icon: '🛡️', status: 'ACTIVE' },
  ],
  BEAT_LAB: [
    { id: 'bl-quality',  name: 'Beat Quality Bot',     role: 'CONTENT',    visibility: 'VISIBLE',    surface: 'BEAT_LAB', description: 'Scores uploaded beat quality',          icon: '🎚️', status: 'ACTIVE' },
    { id: 'bl-sample',   name: 'Sample Check Bot',     role: 'CONTENT',    visibility: 'BACKGROUND', surface: 'BEAT_LAB', description: 'Scans uploads for cleared samples',    icon: '🔍',  status: 'ACTIVE' },
    { id: 'bl-loop',     name: 'Loop Tracker Bot',     role: 'ANALYTICS',  visibility: 'BACKGROUND', surface: 'BEAT_LAB', description: 'Tracks loop play counts per beat',      icon: '🔁',  status: 'ACTIVE' },
    { id: 'bl-rank',     name: 'Producer Rank Bot',    role: 'REWARDS',    visibility: 'VISIBLE',    surface: 'BEAT_LAB', description: 'Updates producer leaderboard rankings', icon: '🏅',  status: 'ACTIVE' },
    { id: 'bl-sentinel', name: 'Beat Lab Sentinel',    role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'BEAT_LAB', description: 'Upload fraud and piracy detection',     icon: '🛡️', status: 'ACTIVE' },
  ],
  NFT_LAB: [
    { id: 'nft-guard',   name: 'Mint Guard Bot',       role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'NFT_LAB', description: 'Validates NFT mint eligibility',       icon: '🔐',  status: 'ACTIVE' },
    { id: 'nft-rarity',  name: 'Rarity Bot',           role: 'ANALYTICS',  visibility: 'VISIBLE',    surface: 'NFT_LAB', description: 'Calculates and assigns rarity scores',  icon: '💎',  status: 'ACTIVE' },
    { id: 'nft-auction', name: 'Auction Monitor Bot',  role: 'LIVE_ROOM',  visibility: 'VISIBLE',    surface: 'NFT_LAB', description: 'Tracks live auction bids in real time',  icon: '🔨',  status: 'ACTIVE' },
    { id: 'nft-vault',   name: 'Vault Sentinel',       role: 'SENTINEL',   visibility: 'BACKGROUND', surface: 'NFT_LAB', description: 'NFT vault access and transfer security', icon: '🛡️', status: 'ACTIVE' },
  ],
  THE_END: [
    { id: 'te-credits',  name: 'Closing Credits Bot',  role: 'CONTENT',    visibility: 'VISIBLE',    surface: 'THE_END', description: 'Renders end-of-event closing sequence',  icon: '🎬',  status: 'ACTIVE' },
    { id: 'te-score',    name: 'Fan Score Bot',         role: 'REWARDS',    visibility: 'VISIBLE',    surface: 'THE_END', description: 'Computes final audience participation XP', icon: '🏆',  status: 'ACTIVE' },
    { id: 'te-reel',     name: 'Highlight Reel Bot',   role: 'CONTENT',    visibility: 'BACKGROUND', surface: 'THE_END', description: 'Assembles best-moment highlight clips',   icon: '🎞️', status: 'ACTIVE' },
    { id: 'te-sentinel', name: 'Exit Sentinel',        role: 'SENTINEL',   visibility: 'BACKGROUND', surface: 'THE_END', description: 'Ensures clean session teardown',          icon: '🛡️', status: 'ACTIVE' },
  ],
  ACADEMY: [
    { id: 'ac-lesson',   name: 'Lesson Tracker Bot',   role: 'CONTENT',    visibility: 'VISIBLE',    surface: 'ACADEMY', description: 'Tracks lesson completion and progress',   icon: '📚',  status: 'ACTIVE' },
    { id: 'ac-quiz',     name: 'Quiz Bot',             role: 'CONTENT',    visibility: 'VISIBLE',    surface: 'ACADEMY', description: 'Delivers and scores knowledge quizzes',   icon: '❓',  status: 'ACTIVE' },
    { id: 'ac-progress', name: 'Progress Bot',         role: 'ANALYTICS',  visibility: 'BACKGROUND', surface: 'ACADEMY', description: 'Generates learning velocity stats',       icon: '📈',  status: 'ACTIVE' },
    { id: 'ac-cert',     name: 'Certification Bot',    role: 'REWARDS',    visibility: 'VISIBLE',    surface: 'ACADEMY', description: 'Issues skill certifications on completion', icon: '🎓', status: 'ACTIVE' },
    { id: 'ac-sentinel', name: 'Academy Sentinel',     role: 'SENTINEL',   visibility: 'BACKGROUND', surface: 'ACADEMY', description: 'Prevents cheating and certificate fraud',  icon: '🛡️', status: 'ACTIVE' },
  ],
  REWARDS: [
    { id: 'rw-drop',     name: 'Reward Drop Bot',      role: 'REWARDS',    visibility: 'VISIBLE',    surface: 'REWARDS', description: 'Triggers timed reward drops for users',   icon: '🎁',  status: 'ACTIVE' },
    { id: 'rw-quest',    name: 'Quest Tracker Bot',    role: 'REWARDS',    visibility: 'VISIBLE',    surface: 'REWARDS', description: 'Monitors and advances quest progress',     icon: '🗺️', status: 'ACTIVE' },
    { id: 'rw-streak',   name: 'Streak Bot',           role: 'ANALYTICS',  visibility: 'BACKGROUND', surface: 'REWARDS', description: 'Tracks consecutive login and action streaks', icon: '🔥', status: 'ACTIVE' },
    { id: 'rw-board',    name: 'Leaderboard Bot',      role: 'ANALYTICS',  visibility: 'VISIBLE',    surface: 'REWARDS', description: 'Updates XP and credit leaderboard rankings', icon: '🏅', status: 'ACTIVE' },
    { id: 'rw-sentinel', name: 'Rewards Sentinel',     role: 'SENTINEL',   visibility: 'BACKGROUND', surface: 'REWARDS', description: 'Detects reward farming and duplication',   icon: '🛡️', status: 'ACTIVE' },
  ],
  SPONSORS: [
    { id: 'sp-impress',  name: 'Impression Tracker',   role: 'SPONSOR',    visibility: 'BACKGROUND', surface: 'SPONSORS', description: 'Counts ad impression events per campaign', icon: '👁️', status: 'ACTIVE' },
    { id: 'sp-click',    name: 'Click Tracker Bot',    role: 'SPONSOR',    visibility: 'BACKGROUND', surface: 'SPONSORS', description: 'Logs sponsor ad click-through events',     icon: '🖱️', status: 'ACTIVE' },
    { id: 'sp-roi',      name: 'ROI Bot',              role: 'ANALYTICS',  visibility: 'VISIBLE',    surface: 'SPONSORS', description: 'Computes campaign ROI for sponsor reports', icon: '📊',  status: 'ACTIVE' },
    { id: 'sp-place',    name: 'Placement Optimizer',  role: 'SPONSOR',    visibility: 'BACKGROUND', surface: 'SPONSORS', description: 'Optimizes ad slot selection by engagement', icon: '📍',  status: 'ACTIVE' },
    { id: 'sp-sentinel', name: 'Sponsor Sentinel',     role: 'SENTINEL',   visibility: 'BACKGROUND', surface: 'SPONSORS', description: 'Fraud detection on ad clicks and spends',  icon: '🛡️', status: 'ACTIVE' },
  ],
  ADMIN: [
    { id: 'ad-audit',    name: 'Audit Bot',            role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'ADMIN', description: 'Logs all admin actions to immutable audit trail', icon: '📋', status: 'ACTIVE' },
    { id: 'ad-log',      name: 'Log Compressor Bot',   role: 'ANALYTICS',  visibility: 'BACKGROUND', surface: 'ADMIN', description: 'Compresses and indexes system logs',           icon: '🗜️', status: 'ACTIVE' },
    { id: 'ad-health',   name: 'Health Monitor Bot',   role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'ADMIN', description: 'Monitors platform uptime and API health',       icon: '💓',  status: 'ACTIVE' },
    { id: 'ad-anomaly',  name: 'Anomaly Detector Bot', role: 'SENTINEL',   visibility: 'BACKGROUND', surface: 'ADMIN', description: 'Flags unusual user or payment patterns',        icon: '⚠️',  status: 'ACTIVE' },
    { id: 'ad-sentinel', name: 'Admin Sentinel Prime', role: 'SENTINEL',   visibility: 'VISIBLE',    surface: 'ADMIN', description: 'Master sentinel for all admin surfaces',        icon: '🛡️', status: 'ACTIVE' },
  ],
};

export function getVisibleBots(surface: PageSurface): BotDefinition[] {
  return SURFACE_VISIBLE_BOTS[surface] ?? [];
}

export function getSentinelBots(surface: PageSurface): BotDefinition[] {
  return getVisibleBots(surface).filter((b) => b.role === 'SENTINEL');
}

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
  ROOMS:        [],
  CYPHER:       [],
  MONDAY_STAGE: [],
  BEAT_LAB:     [],
  NFT_LAB:      [],
  THE_END:      [],
  ACADEMY:      [],
  REWARDS:      [],
  SPONSORS:     [],
  ADMIN:        [],
};

export function getVisibleBots(surface: PageSurface): BotDefinition[] {
  return SURFACE_VISIBLE_BOTS[surface] ?? [];
}

export function getSentinelBots(surface: PageSurface): BotDefinition[] {
  return getVisibleBots(surface).filter((b) => b.role === 'SENTINEL');
}

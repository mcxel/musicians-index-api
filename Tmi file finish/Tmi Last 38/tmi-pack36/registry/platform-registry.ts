// apps/web/src/config/platform-registry.ts
// The single central registry for the entire platform.
// Every world, route, scene, game, room type, reward, and feature lives here.

import { GAME_DEFINITIONS } from '../../../apps/api/src/modules/games/game.engine';
import { SCENE_REGISTRY } from './scene-registry';
import { FEATURE_FLAGS } from './feature-flags';

// ── WORLDS ────────────────────────────────────────────────
export const WORLD_REGISTRY = {
  home1: { id: 'home1', label: 'Magazine Cover',         route: '/',          icon: '📰', scene: 'magazine',     accentColor: '#FFB800', order: 1 },
  home2: { id: 'home2', label: 'Magazine Dashboard',     route: '/editorial', icon: '🎵', scene: 'dashboard',    accentColor: '#00E5FF', order: 2 },
  home3: { id: 'home3', label: 'Live World',             route: '/lobby',     icon: '🔴', scene: 'live-stage',   accentColor: '#FF2D78', order: 3 },
  home4: { id: 'home4', label: 'Sponsors & Ads',         route: '/advertise', icon: '📢', scene: 'sponsor-showcase', accentColor: '#FF8C00', order: 4 },
} as const;

// ── ROOM TYPES ────────────────────────────────────────────
export const ROOM_TYPE_REGISTRY = {
  main_lobby:        { scene: 'lobby',              lighting: 'neon_purple',   maxOccupancy: 500, requiresTicket: false },
  waiting_room:      { scene: 'backstage',          lighting: 'dim_intimate',  maxOccupancy: 100, requiresTicket: false },
  live_stage:        { scene: 'live-stage',         lighting: 'concert_white', maxOccupancy: 500, requiresTicket: false },
  cypher_arena:      { scene: 'underground-cypher', lighting: 'battle_red',    maxOccupancy: 200, requiresTicket: false },
  dirty_dozens:      { scene: 'underground-cypher', lighting: 'battle_red',    maxOccupancy: 200, requiresTicket: false },
  deal_or_feud:      { scene: 'game-night',         lighting: 'rainbow_party', maxOccupancy: 50,  requiresTicket: false },
  game_room:         { scene: 'game-night',         lighting: 'neon_purple',   maxOccupancy: 50,  requiresTicket: false },
  green_room:        { scene: 'backstage',          lighting: 'dim_intimate',  maxOccupancy: 20,  requiresTicket: false },
  backstage:         { scene: 'backstage',          lighting: 'dim_intimate',  maxOccupancy: 30,  requiresTicket: false },
  vip_lounge:        { scene: 'sponsor-showcase',   lighting: 'dim_intimate',  maxOccupancy: 50,  requiresTicket: true },
  sponsor_lounge:    { scene: 'sponsor-showcase',   lighting: 'sponsor_spotlight', maxOccupancy: 20, requiresTicket: true },
  audience:          { scene: 'concert-arena',      lighting: 'concert_white', maxOccupancy: 2000, requiresTicket: false },
  judge_room:        { scene: 'admin-command',      lighting: 'standard',      maxOccupancy: 10,  requiresTicket: false },
  control_room:      { scene: 'admin-command',      lighting: 'standard',      maxOccupancy: 10,  requiresTicket: false },
  replay_room:       { scene: 'backstage',          lighting: 'dim_intimate',  maxOccupancy: 100, requiresTicket: false },
  afterparty:        { scene: 'neon-club',          lighting: 'afterparty',    maxOccupancy: 200, requiresTicket: true },
  broadcast_booth:   { scene: 'admin-command',      lighting: 'standard',      maxOccupancy: 5,   requiresTicket: false },
  meet_and_greet:    { scene: 'backstage',          lighting: 'dim_intimate',  maxOccupancy: 25,  requiresTicket: true },
  venue_lobby:       { scene: 'venue',              lighting: 'standard',      maxOccupancy: 300, requiresTicket: false },
} as const;

// ── BELT REGISTRY ─────────────────────────────────────────
export const BELT_REGISTRY = {
  // Home 2 belts
  editorial:     { id: 'editorial',   label: 'Editorial Belt',            worldId: 'home2', order: 1, botOwner: 'editorial-assembly',  refreshMinutes: 30 },
  discovery:     { id: 'discovery',   label: 'Discovery Belt',            worldId: 'home2', order: 2, botOwner: 'recommendation',      refreshMinutes: 60 },
  marketplace:   { id: 'marketplace', label: 'Platform & Marketplace',    worldId: 'home2', order: 3, botOwner: 'none',                refreshMinutes: 240 },
  
  // Home 3 belts
  activity:      { id: 'activity',    label: 'Live World Activity Belt',  worldId: 'home3', order: 1, botOwner: 'lobby-assembly',      refreshMinutes: 1 },
  trending:      { id: 'trending',    label: 'Discovery / Trends Belt',   worldId: 'home3', order: 2, botOwner: 'trending',            refreshMinutes: 10 },
  cypher:        { id: 'cypher',      label: 'Cypher / Stream & Win',     worldId: 'home3', order: 3, botOwner: 'contest-ops',         refreshMinutes: 5 },
  
  // Home 4 belts
  premium_ads:   { id: 'premium_ads',  label: 'Premium Ads Spotlight',   worldId: 'home4', order: 1, botOwner: 'ad-rotation',         refreshMinutes: 60 },
  ad_market:     { id: 'ad_market',    label: 'Advertising Marketplace',  worldId: 'home4', order: 2, botOwner: 'none',               refreshMinutes: 0 },
  inventory:     { id: 'inventory',    label: 'Inventory & Placements',   worldId: 'home4', order: 3, botOwner: 'ad-placement',        refreshMinutes: 30 },
  analytics:     { id: 'analytics',   label: 'Analytics & Performance',   worldId: 'home4', order: 4, botOwner: 'analytics',           refreshMinutes: 15 },
  deals:         { id: 'deals',       label: 'Deals & Contracts',         worldId: 'home4', order: 5, botOwner: 'proposal',            refreshMinutes: 0 },
} as const;

// ── GAME REGISTRY (references game-engine.ts) ─────────────
export const GAME_REGISTRY = GAME_DEFINITIONS;

// ── REWARD CATALOG TYPES ─────────────────────────────────
export const REWARD_TYPES = {
  points:          { label: 'Points',             icon: '⚡', category: 'currency' },
  avatar_item:     { label: 'Avatar Item',        icon: '👤', category: 'cosmetic' },
  profile_frame:   { label: 'Profile Frame',      icon: '🖼️', category: 'cosmetic' },
  badge:           { label: 'Badge',              icon: '🏅', category: 'prestige' },
  achievement:     { label: 'Achievement',        icon: '🏆', category: 'prestige' },
  crown:           { label: 'Weekly Crown',       icon: '👑', category: 'prestige' },
  loot_drop:       { label: 'Loot Drop',          icon: '📦', category: 'loot' },
  game_token:      { label: 'Game Token',         icon: '🎮', category: 'utility' },
  sponsor_gift:    { label: 'Sponsor Gift',       icon: '🎁', category: 'sponsor' },
  collectible:     { label: 'Collectible',        icon: '✨', category: 'collectible' },
  ticket_upgrade:  { label: 'Ticket Upgrade',     icon: '🎫', category: 'event' },
} as const;

// ── ROUTE CONSTANTS ───────────────────────────────────────
export const ROUTES = {
  // Public
  home: '/',
  editorial: '/editorial',
  lobby: '/lobby',
  advertise: '/advertise',
  magazine: '/magazine',
  articles: '/articles',
  article: (slug: string) => `/articles/${slug}`,
  artists: '/artists',
  artist: (slug: string) => `/artists/${slug}`,
  stations: '/stations',
  station: (slug: string) => `/stations/${slug}`,
  
  // Live / Games
  live: '/live',
  games: '/games',
  game: (id: string) => `/games/${id}`,
  dirtyDozens: '/dirty-dozens',
  dirtyDozensMatch: (id: string) => `/dirty-dozens/${id}`,
  dealOrFeud: '/deal-or-feud',
  dealOrFeudGame: (id: string) => `/deal-or-feud/${id}`,
  cypher: '/cypher',
  cypherBattle: (id: string) => `/cypher/${id}`,
  venues: '/venues',
  venue: (id: string) => `/venues/${id}`,
  events: '/events',
  event: (id: string) => `/events/${id}`,
  
  // Economy
  shop: '/shop',
  inventory: '/inventory',
  rewards: '/rewards',
  wallet: '/wallet',
  points: '/points',
  
  // Social
  leaderboards: '/leaderboards',
  hallOfFame: '/hall-of-fame',
  
  // Dashboard
  dashboard: '/dashboard/artist',
  
  // Admin
  admin: '/admin',
  adminCommandCenter: '/admin/command-center',
  adminFinance: '/admin/finance/profit',
} as const;

// ── FEATURE FLAG GATE ─────────────────────────────────────
// Helper: check if a feature is enabled before rendering
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag] === true;
}

export { SCENE_REGISTRY, FEATURE_FLAGS };

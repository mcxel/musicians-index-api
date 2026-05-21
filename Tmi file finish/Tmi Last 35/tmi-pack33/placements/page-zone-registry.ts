// apps/web/src/config/page-zone-registry.ts
// Every ad/sponsor zone on every page surface.

export type ZoneId = string;
export type SurfaceType = 
  | 'homepage' | 'magazine' | 'article' | 'profile'
  | 'station' | 'live' | 'lobby' | 'contest'
  | 'game' | 'dashboard' | 'search';

export interface PageZone {
  id: ZoneId;
  surface: SurfaceType;
  label: string;
  position: 'hero' | 'header' | 'rail' | 'inline' | 'sidebar'
          | 'overlay' | 'lower-third' | 'footer' | 'sticky' | 'endscreen';
  allowPaid: boolean;        // paid advertiser campaigns
  allowSponsor: boolean;     // sponsor placements (prestige)
  allowHouseAd: boolean;     // house/internal fallback
  maxWidthPx: number;
  aspectRatio?: string;
  mobileVisible: boolean;
  tierRequired: 'free' | 'starter' | 'pro' | 'gold' | 'platinum' | 'diamond' | null; // viewer tier to see ads here
  cooldownMinutes: number;   // same ad can't appear here more than once per N minutes
  frequencyCapPerSession: number;  // max times same campaign shown per session
  weeklyPriceCents: number;
}

export const PAGE_ZONES: PageZone[] = [
  // ── HOMEPAGE ──────────────────────────────────────────
  { id:'HOME_EDITORIAL_SPONSOR_STRIP', surface:'homepage', label:'Editorial Belt Sponsor Strip', position:'header', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:960, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:19999 },
  { id:'HOME_EDITORIAL_INLINE_1', surface:'homepage', label:'Editorial Inline Ad', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:320, mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:3, weeklyPriceCents:4999 },
  { id:'HOME_DISCOVERY_GENRE_SPONSOR', surface:'homepage', label:'Genre Cluster Branded Hex', position:'inline', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:80, mobileVisible:false, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:7999 },
  { id:'HOME_MARKETPLACE_PRIMARY', surface:'homepage', label:'Marketplace Primary Sponsor', position:'rail', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:240, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:24999 },
  { id:'HOME_TRENDS_COUNTDOWN_SPONSOR', surface:'homepage', label:'Countdown Wrapper Sponsor', position:'header', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:400, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:9999 },
  { id:'HOME_ADV_HERO_STRIP', surface:'homepage', label:'Advertiser Hero Strip', position:'hero', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:960, aspectRatio:'8/1', mobileVisible:false, tierRequired:null, cooldownMinutes:60, frequencyCapPerSession:2, weeklyPriceCents:9999 },
  { id:'HOME_ADV_TILE_1', surface:'homepage', label:'Advertiser Large Tile', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:240, aspectRatio:'4/3', mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:3, weeklyPriceCents:4999 },
  { id:'HOME_ADV_TILE_2', surface:'homepage', label:'Advertiser Medium Tile', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:160, aspectRatio:'1/1', mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:3, weeklyPriceCents:2999 },
  { id:'HOME_ADV_TILE_3', surface:'homepage', label:'Advertiser Medium Tile', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:160, aspectRatio:'1/1', mobileVisible:false, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:3, weeklyPriceCents:2999 },
  { id:'HOME_ADV_LOCAL', surface:'homepage', label:'Local Business Geo Ad', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:160, mobileVisible:true, tierRequired:null, cooldownMinutes:120, frequencyCapPerSession:2, weeklyPriceCents:1999 },

  // ── ARTICLE ───────────────────────────────────────────
  { id:'ART_PRESENTED_BY', surface:'article', label:'"Presented by" Header', position:'header', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:960, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:14999 },
  { id:'ART_HEADER_SPONSOR', surface:'article', label:'Article Header Sponsor Strip', position:'header', allowPaid:true, allowSponsor:true, allowHouseAd:true, maxWidthPx:728, mobileVisible:false, tierRequired:null, cooldownMinutes:60, frequencyCapPerSession:2, weeklyPriceCents:3999 },
  { id:'ART_INLINE_1', surface:'article', label:'Article Inline Ad (after P2)', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:580, mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:3, weeklyPriceCents:2499 },
  { id:'ART_INLINE_2', surface:'article', label:'Article Inline Ad (after P5)', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:580, mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:3, weeklyPriceCents:2499 },
  { id:'ART_VIDEO_BREAK', surface:'article', label:'Article Video Ad Break', position:'inline', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:580, aspectRatio:'16/9', mobileVisible:true, tierRequired:null, cooldownMinutes:60, frequencyCapPerSession:1, weeklyPriceCents:4999 },
  { id:'ART_SIDEBAR_TOP', surface:'article', label:'Article Sidebar Top', position:'sidebar', allowPaid:true, allowSponsor:true, allowHouseAd:true, maxWidthPx:300, mobileVisible:false, tierRequired:null, cooldownMinutes:60, frequencyCapPerSession:3, weeklyPriceCents:2999 },
  { id:'ART_ENDCAP_CTA', surface:'article', label:'Article End CTA', position:'footer', allowPaid:true, allowSponsor:true, allowHouseAd:true, maxWidthPx:580, mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:3, weeklyPriceCents:3499 },
  { id:'ART_STICKY_MOBILE', surface:'article', label:'Article Mobile Sticky', position:'sticky', allowPaid:true, allowSponsor:false, allowHouseAd:true, maxWidthPx:320, mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:5, weeklyPriceCents:1499 },

  // ── LIVE SHOW ─────────────────────────────────────────
  { id:'SHOW_PRE_SPLASH', surface:'live', label:'Pre-Show Splash (3s)', position:'overlay', allowPaid:true, allowSponsor:true, allowHouseAd:false, maxWidthPx:1920, aspectRatio:'16/9', mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:1, weeklyPriceCents:7999 },
  { id:'SHOW_COUNTDOWN_SPONSOR', surface:'live', label:'Countdown Sponsor Brand', position:'overlay', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:400, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:4999 },
  { id:'SHOW_LOWER_THIRD', surface:'live', label:'Live Lower Third', position:'lower-third', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:640, mobileVisible:false, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:9999 },
  { id:'SHOW_TIP_MATCH', surface:'live', label:'Tip Match Sponsor', position:'inline', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:240, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:14999 },
  { id:'SHOW_END_SCREEN', surface:'live', label:'End Screen CTA', position:'endscreen', allowPaid:true, allowSponsor:true, allowHouseAd:true, maxWidthPx:640, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:1, weeklyPriceCents:3999 },

  // ── GAME ──────────────────────────────────────────────
  { id:'GAME_LOBBY', surface:'game', label:'Game Lobby Sponsor', position:'header', allowPaid:true, allowSponsor:true, allowHouseAd:true, maxWidthPx:480, mobileVisible:true, tierRequired:null, cooldownMinutes:30, frequencyCapPerSession:2, weeklyPriceCents:7999 },
  { id:'GAME_ROUND_SPONSOR', surface:'game', label:'Round Start Sponsor (1s)', position:'overlay', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:400, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:4999 },
  { id:'GAME_INTERMISSION', surface:'game', label:'Intermission Ad (5s max)', position:'overlay', allowPaid:true, allowSponsor:true, allowHouseAd:true, maxWidthPx:640, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:2, weeklyPriceCents:4999 },
  { id:'GAME_END_SCREEN', surface:'game', label:'End Screen CTA', position:'endscreen', allowPaid:true, allowSponsor:true, allowHouseAd:true, maxWidthPx:640, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:1, weeklyPriceCents:3999 },

  // ── CONTEST ───────────────────────────────────────────
  { id:'CONTEST_TITLE_SPONSOR', surface:'contest', label:'Contest Title Sponsor', position:'hero', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:960, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:49999 },
  { id:'CONTEST_BRACKET_SPONSOR', surface:'contest', label:'Bracket View Sponsor', position:'header', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:480, mobileVisible:false, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:99, weeklyPriceCents:24999 },
  { id:'CONTEST_WINNER_REVEAL', surface:'contest', label:'Winner Reveal Sponsor', position:'overlay', allowPaid:false, allowSponsor:true, allowHouseAd:false, maxWidthPx:640, mobileVisible:true, tierRequired:null, cooldownMinutes:0, frequencyCapPerSession:1, weeklyPriceCents:29999 },
];

export function getZonesByPage(surface: SurfaceType): PageZone[] {
  return PAGE_ZONES.filter(z => z.surface === surface);
}

export function getPaidZones(surface: SurfaceType): PageZone[] {
  return PAGE_ZONES.filter(z => z.surface === surface && z.allowPaid);
}

export function getSponsorZones(surface: SurfaceType): PageZone[] {
  return PAGE_ZONES.filter(z => z.surface === surface && z.allowSponsor);
}

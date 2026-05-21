// apps/api/src/modules/venues/venue.engine.ts
// Complete venue system: hosts, co-hosts, DJs, lighting, seating sections.

// ── VENUE ROLES ───────────────────────────────────────────
export type VenueRole =
  | 'owner'       // venue owner/manager
  | 'host'        // event host (MC, emcee)
  | 'co-host'     // secondary host
  | 'dj'          // DJ — controls music
  | 'headliner'   // main performing artist
  | 'opener'      // opening act
  | 'judge'       // contest/battle judge
  | 'moderator'   // room moderator
  | 'security'    // bouncer/room security bot
  | 'sponsor-rep' // sponsor representative
  | 'vip-guest';  // verified VIP attendee

export interface VenueStaffAssignment {
  userId: string;
  role: VenueRole;
  eventId: string;
  venueId: string;
  isActive: boolean;
  canControlLighting: boolean;
  canControlAudio: boolean;
  canMuteAttendees: boolean;
  canRemoveAttendees: boolean;
  canStartRound: boolean; // for battles/games
  canAnnounceWinner: boolean;
  bio?: string;
  stageName?: string;
}

// ── SEATING SECTIONS ──────────────────────────────────────
export type SeatingSectionType =
  | 'general_admission' | 'reserved' | 'vip' | 'front_row'
  | 'backstage' | 'press' | 'sponsor_box' | 'standing'
  | 'balcony' | 'pit' | 'accessible' | 'crew';

export interface VenueSection {
  id: string;
  name: string;
  type: SeatingSectionType;
  capacity: number;
  currentOccupancy: number;
  ticketTierId: string;
  priceMultiplier: number;  // 1.0 = base price, 2.5 = VIP 2.5×
  row?: string;             // "A" through "Z" for reserved seating
  seatNumbers?: number[];
  features: string[];       // ["closest_to_stage", "best_view", "includes_meet_greet"]
  colorCode: string;        // for seat map display
  isVisible: boolean;
  allowsStanding: boolean;
  requiresTicketUpgrade: boolean;
}

export const VENUE_SECTION_PRESETS: Record<SeatingSectionType, Partial<VenueSection>> = {
  general_admission: { priceMultiplier: 1.0, allowsStanding: true, features: ["open_floor"] },
  reserved:          { priceMultiplier: 1.5, allowsStanding: false, features: ["numbered_seat"] },
  vip:               { priceMultiplier: 2.5, allowsStanding: false, features: ["premium_view", "dedicated_entrance", "vip_lounge_access"] },
  front_row:         { priceMultiplier: 3.0, allowsStanding: false, features: ["closest_to_stage", "eye_contact_with_artist", "post_show_access"] },
  backstage:         { priceMultiplier: 5.0, allowsStanding: true, features: ["backstage_access", "meet_greet", "sound_check_access"] },
  press:             { priceMultiplier: 0, allowsStanding: false, features: ["press_pass", "photo_pit_access"] },
  sponsor_box:       { priceMultiplier: 10.0, allowsStanding: false, features: ["private_box", "catering", "dedicated_staff"] },
  standing:          { priceMultiplier: 0.8, allowsStanding: true, features: ["floor_access"] },
  balcony:           { priceMultiplier: 1.2, allowsStanding: false, features: ["elevated_view", "reduced_crowd"] },
  pit:               { priceMultiplier: 2.0, allowsStanding: true, features: ["front_of_stage", "photo_access"] },
  accessible:        { priceMultiplier: 1.0, allowsStanding: false, features: ["wheelchair_access", "companion_seat", "accessible_facilities"] },
  crew:              { priceMultiplier: 0, allowsStanding: true, features: ["crew_access", "backstage_corridor"] },
};

// ── LIGHTING SYSTEM ───────────────────────────────────────
export type LightingPreset =
  | 'standard' | 'neon_purple' | 'concert_white' | 'battle_red'
  | 'victory_gold' | 'cypher_cyan' | 'sponsor_spotlight' | 'afterparty'
  | 'dim_intimate' | 'rainbow_party' | 'strobe_hype' | 'off_air';

export interface LightingConfig {
  preset: LightingPreset;
  primaryColor: string;   // hex
  secondaryColor: string; // hex
  intensity: number;      // 0-100
  strobeEnabled: boolean;
  followSpotEnabled: boolean;   // spotlight that tracks the performer
  audioBeatSync: boolean;       // lights pulse with music BPM
  sponsorLogoProjection: boolean;
}

export const LIGHTING_PRESETS: Record<LightingPreset, LightingConfig> = {
  standard:          { preset: 'standard',          primaryColor: '#FFFFFF', secondaryColor: '#FFB800', intensity: 70, strobeEnabled: false, followSpotEnabled: false, audioBeatSync: false, sponsorLogoProjection: false },
  neon_purple:       { preset: 'neon_purple',        primaryColor: '#7B2FBE', secondaryColor: '#00E5FF', intensity: 80, strobeEnabled: false, followSpotEnabled: true,  audioBeatSync: true,  sponsorLogoProjection: false },
  concert_white:     { preset: 'concert_white',      primaryColor: '#FFFFFF', secondaryColor: '#00E5FF', intensity: 90, strobeEnabled: false, followSpotEnabled: true,  audioBeatSync: true,  sponsorLogoProjection: false },
  battle_red:        { preset: 'battle_red',         primaryColor: '#FF2020', secondaryColor: '#FF8C00', intensity: 85, strobeEnabled: true,  followSpotEnabled: true,  audioBeatSync: true,  sponsorLogoProjection: false },
  victory_gold:      { preset: 'victory_gold',       primaryColor: '#FFB800', secondaryColor: '#FFD700', intensity: 95, strobeEnabled: false, followSpotEnabled: true,  audioBeatSync: false, sponsorLogoProjection: false },
  cypher_cyan:       { preset: 'cypher_cyan',        primaryColor: '#00E5FF', secondaryColor: '#7B2FBE', intensity: 80, strobeEnabled: false, followSpotEnabled: true,  audioBeatSync: true,  sponsorLogoProjection: false },
  sponsor_spotlight: { preset: 'sponsor_spotlight',  primaryColor: '#FFB800', secondaryColor: '#FFFFFF', intensity: 75, strobeEnabled: false, followSpotEnabled: false, audioBeatSync: false, sponsorLogoProjection: true  },
  afterparty:        { preset: 'afterparty',         primaryColor: '#FF2D78', secondaryColor: '#7B2FBE', intensity: 60, strobeEnabled: true,  followSpotEnabled: false, audioBeatSync: true,  sponsorLogoProjection: false },
  dim_intimate:      { preset: 'dim_intimate',       primaryColor: '#FFB800', secondaryColor: '#2A1452', intensity: 30, strobeEnabled: false, followSpotEnabled: false, audioBeatSync: false, sponsorLogoProjection: false },
  rainbow_party:     { preset: 'rainbow_party',      primaryColor: '#FF2D78', secondaryColor: '#00E5FF', intensity: 85, strobeEnabled: true,  followSpotEnabled: false, audioBeatSync: true,  sponsorLogoProjection: false },
  strobe_hype:       { preset: 'strobe_hype',        primaryColor: '#FFFFFF', secondaryColor: '#FF2020', intensity: 100, strobeEnabled: true, followSpotEnabled: false, audioBeatSync: true,  sponsorLogoProjection: false },
  off_air:           { preset: 'off_air',            primaryColor: '#0D0520', secondaryColor: '#150830', intensity: 10, strobeEnabled: false, followSpotEnabled: false, audioBeatSync: false, sponsorLogoProjection: false },
};

// ── VENUE TYPES ───────────────────────────────────────────
export type VenueType =
  | 'club' | 'concert_hall' | 'stadium' | 'outdoor_festival'
  | 'studio_stage' | 'theater' | 'underground' | 'virtual_stage'
  | 'rooftop' | 'warehouse' | 'arena' | 'broadcast_studio';

export interface VenueProfile {
  id: string;
  name: string;
  slug: string;
  type: VenueType;
  city: string;
  state: string;
  country: string;
  totalCapacity: number;
  sections: VenueSection[];
  supportedRoles: VenueRole[];
  defaultLighting: LightingPreset;
  djBoothEnabled: boolean;
  livestreamEnabled: boolean;
  replayEnabled: boolean;
  sponsorBoardEnabled: boolean;
  ticketingEnabled: boolean;
  bookingEnabled: boolean;
  greenRoomEnabled: boolean;
  backstageEnabled: boolean;
  controlRoomEnabled: boolean;
  images: string[];
  currentEvent?: string;    // active eventId or null
  isVerified: boolean;
  isActive: boolean;
}

// ── DJ SYSTEM ─────────────────────────────────────────────
export interface DJSession {
  djUserId: string;
  venueId: string;
  eventId: string;
  currentTrackId?: string;
  bpm?: number;
  volume: number;        // 0-100
  crossfadePosition: number; // 0-100
  eqSettings: { low: number; mid: number; high: number };
  effectsEnabled: string[];
  audioBeatSyncActive: boolean; // syncs stage lighting to BPM
  setList: string[];     // track IDs queued
  setHistory: string[];  // played track IDs
}

// ── ROOM STATE FOR VENUES ─────────────────────────────────
export type VenueRoomType =
  | 'main_stage' | 'green_room' | 'backstage' | 'control_room'
  | 'vip_lounge' | 'sponsor_lounge' | 'press_room' | 'afterparty'
  | 'waiting_room' | 'rehearsal' | 'dj_booth' | 'merch_room'
  | 'meet_and_greet' | 'broadcast_booth' | 'judge_room';

export interface VenueRoom {
  id: string;
  venueId: string;
  eventId: string;
  type: VenueRoomType;
  name: string;
  maxOccupancy: number;
  currentOccupancy: number;
  allowedRoles: VenueRole[];
  lighting: LightingPreset;
  isLive: boolean;
  isAccessible: boolean;
  chatEnabled: boolean;
  cameraEnabled: boolean;
  djEnabled: boolean;
  sponsorOverlayZone?: string; // PageZone ID from zone registry
}

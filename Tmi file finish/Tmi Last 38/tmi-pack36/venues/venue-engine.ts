// apps/api/src/modules/venues/venue-engine.ts
// Complete venue management — hosts, co-hosts, DJs, lighting, seating sections.

export type VenueType =
  | 'club' | 'concert_hall' | 'stadium' | 'arena' | 'outdoor_festival'
  | 'studio_stage' | 'theater' | 'underground' | 'rooftop' | 'virtual';

export type SectionType =
  | 'general_admission' | 'reserved_seating' | 'vip' | 'front_row'
  | 'balcony' | 'floor_pit' | 'box' | 'backstage' | 'press' | 'sponsor_lounge';

export type RoomRole =
  | 'host' | 'co_host' | 'dj' | 'artist' | 'judge'
  | 'moderator' | 'sponsor_rep' | 'advertiser_rep' | 'press' | 'audience';

export type LightingPreset =
  | 'stage_white' | 'neon_pulse' | 'party_strobes' | 'spotlight_gold'
  | 'cypher_blue' | 'romantic_dim' | 'hype_red' | 'victory_rainbow'
  | 'crowd_surf' | 'off_air_dark' | 'standby_amber';

// ── SEATING SECTION ────────────────────────────────────
export interface SeatingSection {
  id: string;
  venueId: string;
  type: SectionType;
  label: string;            // e.g. "Front Row", "VIP Lounge", "General"
  capacity: number;
  rowCount?: number;
  seatsPerRow?: number;
  priceTierName: string;    // ticket tier associated
  priceCents: number;
  amenities: string[];      // ["bar", "dedicated_bathrooms", "early_entry"]
  visibilityToStage: 'excellent' | 'good' | 'standard' | 'obstructed';
  requiresTier: string | null; // min platform tier (free, starter, pro, etc.)
  x: number; y: number;    // position on venue map (for seat map UI)
  color: string;            // for seat map color coding
}

// ── VENUE ROLE ASSIGNMENT ──────────────────────────────
export interface VenueRoleAssignment {
  userId: string;
  venueId: string;
  eventId: string;
  role: RoomRole;
  permissions: RoomPermission[];
  assignedAt: Date;
  assignedBy: string;       // Big Ace or venue owner
}

export type RoomPermission =
  | 'start_show' | 'end_show' | 'mute_audience' | 'eject_member'
  | 'control_lighting' | 'play_music' | 'manage_queue' | 'approve_entries'
  | 'view_analytics' | 'manage_sponsors' | 'manage_ads' | 'open_voting'
  | 'declare_winner' | 'trigger_effects' | 'manage_seats';

// ── HOST SYSTEM ────────────────────────────────────────
// The HOST controls the show. CO-HOST assists. DJ controls music.
export const ROLE_PERMISSIONS: Record<RoomRole, RoomPermission[]> = {
  host: ['start_show','end_show','mute_audience','eject_member','control_lighting',
         'play_music','manage_queue','approve_entries','view_analytics','manage_sponsors',
         'open_voting','declare_winner','trigger_effects','manage_seats'],
  co_host: ['mute_audience','manage_queue','approve_entries','view_analytics',
             'trigger_effects','manage_seats'],
  dj: ['play_music','control_lighting','trigger_effects'],
  artist: ['start_show'],
  judge: ['open_voting','declare_winner','view_analytics'],
  moderator: ['mute_audience','eject_member','view_analytics'],
  sponsor_rep: ['manage_sponsors','view_analytics'],
  advertiser_rep: ['manage_ads','view_analytics'],
  press: ['view_analytics'],
  audience: [],
};

// ── VENUE CONFIG ───────────────────────────────────────
export interface VenueConfig {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  type: VenueType;
  city: string;
  region: string;
  country: string;
  capacity: number;
  sections: SeatingSection[];

  // Staffing config
  maxHosts: number;         // usually 1
  maxCoHosts: number;       // usually 1-2
  maxDJs: number;           // usually 1-3
  maxJudges: number;        // for battle/contest rooms

  // Lighting defaults
  defaultLighting: LightingPreset;
  availableLightingPresets: LightingPreset[];

  // Sponsor slots
  sponsorSlots: {
    stage: number;          // stage backdrop sponsor slots
    sectionBanners: number; // per section banners
    screens: number;        // digital screen slots
    lobbyCards: number;     // lobby sponsor cards
  };

  // Ticket config
  ticketTiers: {
    name: string;
    sectionId: string;
    priceCents: number;
    available: number;
  }[];

  // Virtual event settings
  supportsLivestream: boolean;
  supportsReplay: boolean;
  maxLivestreamViewers?: number;
}

// ── LIGHTING CONTROLLER ────────────────────────────────
export interface LightingState {
  preset: LightingPreset;
  intensity: number;     // 0-100
  followBeat: boolean;   // sync to music BPM
  spotlightTarget?: string; // userId to spotlight
  colorOverride?: string;
}

// WebSocket event for lighting control
export type LightingEvent =
  | { type: 'set_preset'; preset: LightingPreset }
  | { type: 'set_intensity'; value: number }
  | { type: 'spotlight'; userId: string }
  | { type: 'sync_beat'; bpm: number }
  | { type: 'trigger_effect'; effect: 'confetti' | 'strobe' | 'hype_surge' | 'victory_burst' };

// packages/venue-engine/src/venue.service.ts
// Booking, venues, staff, rooms, lighting, DJ sessions.

export interface BookingFlow {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  label: string;
  description: string;
}

export const BOOKING_FLOW: BookingFlow[] = [
  { step: 1, label: "ARTIST REQUEST",    description: "Artist submits booking request with proposed date + offer" },
  { step: 2, label: "VENUE REVIEW",      description: "Venue reviews request, checks calendar availability" },
  { step: 3, label: "OFFER / COUNTER",  description: "Venue sends offer or counter-proposal" },
  { step: 4, label: "CONTRACT",         description: "Both parties approve — contract auto-generated" },
  { step: 5, label: "EVENT CREATED",    description: "Event page created, ticket tiers configured" },
  { step: 6, label: "TICKETS LIVE",     description: "Tickets go on sale — max 8 per buyer (Platform Law #4)" },
  { step: 7, label: "SHOW DAY",         description: "Staff assigned, lighting set, DJ session configured" },
];

// ── STAFF PERMISSION MATRIX ───────────────────────────────
export const STAFF_PERMISSIONS = {
  OWNER:       { lighting: true,  audio: true,  mute: true,  remove: true,  startRound: true,  announceWinner: true  },
  HOST:        { lighting: true,  audio: false, mute: true,  remove: true,  startRound: true,  announceWinner: true  },
  CO_HOST:     { lighting: false, audio: false, mute: true,  remove: false, startRound: true,  announceWinner: false },
  DJ:          { lighting: true,  audio: true,  mute: false, remove: false, startRound: false, announceWinner: false },
  HEADLINER:   { lighting: false, audio: false, mute: false, remove: false, startRound: false, announceWinner: false },
  OPENER:      { lighting: false, audio: false, mute: false, remove: false, startRound: false, announceWinner: false },
  JUDGE:       { lighting: false, audio: false, mute: false, remove: false, startRound: false, announceWinner: true  },
  MODERATOR:   { lighting: false, audio: false, mute: true,  remove: true,  startRound: false, announceWinner: false },
  SECURITY:    { lighting: false, audio: false, mute: true,  remove: true,  startRound: false, announceWinner: false },
  SPONSOR_REP: { lighting: false, audio: false, mute: false, remove: false, startRound: false, announceWinner: false },
  VIP_GUEST:   { lighting: false, audio: false, mute: false, remove: false, startRound: false, announceWinner: false },
} as const;

// ── DJ AUDIO→LIGHTING SYNC ────────────────────────────────
// When DJ sets BPM, lighting engine pulses at that frequency
export interface DJLightingSync {
  bpm: number;
  pulseIntervalMs: number;  // 60000 / bpm
  followSpot: boolean;      // spotlight tracks performer
  strobeEnabled: boolean;   // only if preset allows
  colorCycle: boolean;      // rainbow cycle on beat
}

export function calculatePulseInterval(bpm: number): number {
  return Math.round(60000 / bpm);
}

// ── VENUE TICKET PIPELINE ─────────────────────────────────
export const TICKET_PIPELINE = [
  "ticket_created",      // tier + section assigned
  "ticket_listed",       // sale window opens
  "ticket_purchased",    // payment confirmed
  "ticket_issued",       // QR code generated, email sent
  "ticket_in_wallet",    // available in user's /tickets
  "ticket_scanned",      // QR scan at door, marks as USED
  "attendance_recorded", // increments analytics
  "event_analytics",     // feeds event revenue dashboard
  "ticket_archived",     // event over, archived
] as const;

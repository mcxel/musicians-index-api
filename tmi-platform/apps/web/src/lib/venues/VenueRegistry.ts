/**
 * VenueRegistry — single source of truth for venue identity on TMI.
 *
 * Wraps venueAssetRegistry image paths and adds capacity, category,
 * live state, and routing. Home 3, Home 4, venue profile pages,
 * and the booking engine all read from here.
 */

export type VenueTier = 'RUBY' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type VenueCategory = 'Club' | 'Arena' | 'Stadium' | 'Studio' | 'Lounge' | 'Outdoor' | 'Theater' | 'Virtual';

export interface VenueIdentity {
  id: string;
  slug: string;
  name: string;

  /** Images — paths must exist under /public */
  tileImage: string;
  profileImage: string;

  city: string;
  countryName: string;
  flag: string;

  category: VenueCategory;
  tier: VenueTier;

  capacity: number;
  occupancyPct: number;
  isLive: boolean;
  audienceCount: number;

  ticketPriceUsd: number;
  openTickets: number;

  roomId: string;
  profileRoute: string;
  ticketRoute: string;
  liveRoomRoute: string;

  upcomingEventIds: string[];
}

export const VENUE_REGISTRY: VenueIdentity[] = [
  {
    id: 'arena-prime-v',
    slug: 'arena-prime',
    name: 'Arena Prime',
    tileImage: '/assets/generated/venues/the-underground-tile.jpg',
    profileImage: '/assets/generated/venues/the-underground-profile.jpg',
    city: 'New York, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Arena', tier: 'Diamond',
    capacity: 12000, occupancyPct: 84, isLive: false, audienceCount: 10080,
    ticketPriceUsd: 45, openTickets: 1920,
    roomId: 'room-arena-prime',
    profileRoute: '/venues/arena-prime',
    ticketRoute: '/tickets/arena-prime',
    liveRoomRoute: '/live/rooms/room-arena-prime',
    upcomingEventIds: ['monthly-idol', 'cypher-season-1'],
  },
  {
    id: 'cypher-dome-v',
    slug: 'cypher-dome',
    name: 'Cypher Dome',
    tileImage: '/assets/generated/venues/cypher-dome-tile.jpg',
    profileImage: '/assets/generated/venues/cypher-dome-profile.jpg',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Theater', tier: 'Platinum',
    capacity: 2400, occupancyPct: 71, isLive: false, audienceCount: 1704,
    ticketPriceUsd: 25, openTickets: 696,
    roomId: 'room-cypher-dome',
    profileRoute: '/venues/cypher-dome',
    ticketRoute: '/tickets/cypher-dome',
    liveRoomRoute: '/live/rooms/room-cypher-dome',
    upcomingEventIds: ['cypher-season-1'],
  },
  {
    id: 'battle-amphitheater-v',
    slug: 'battle-amphitheater',
    name: 'Battle Amphitheater',
    tileImage: '/assets/generated/venues/battle-amphitheater-tile.jpg',
    profileImage: '/assets/generated/venues/battle-amphitheater-profile.jpg',
    city: 'Chicago, IL', countryName: 'United States', flag: '🇺🇸',
    category: 'Outdoor', tier: 'Gold',
    capacity: 5000, occupancyPct: 67, isLive: false, audienceCount: 0,
    ticketPriceUsd: 30, openTickets: 1650,
    roomId: 'room-battle-amp',
    profileRoute: '/venues/battle-amphitheater',
    ticketRoute: '/tickets/battle-amphitheater',
    liveRoomRoute: '/live/rooms/room-battle-amp',
    upcomingEventIds: ['battle-royale-2026'],
  },
  {
    id: 'neon-pit-v',
    slug: 'neon-pit',
    name: 'Neon Pit',
    tileImage: '/assets/generated/venues/neon-pit-tile.jpg',
    profileImage: '/assets/generated/venues/neon-pit-profile.jpg',
    city: 'Los Angeles', countryName: 'United States', flag: '🇺🇸',
    category: 'Club', tier: 'Gold',
    capacity: 800, occupancyPct: 90, isLive: false, audienceCount: 720,
    ticketPriceUsd: 20, openTickets: 80,
    roomId: 'room-neon-pit',
    profileRoute: '/venues/neon-pit',
    ticketRoute: '/tickets/neon-pit',
    liveRoomRoute: '/live/rooms/room-neon-pit',
    upcomingEventIds: [],
  },
  {
    id: 'rnb-basement-v',
    slug: 'rnb-basement',
    name: 'R&B Basement',
    tileImage: '/assets/generated/venues/rnb-basement-tile.jpg',
    profileImage: '/assets/generated/venues/rnb-basement-profile.jpg',
    city: 'Houston, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'Club', tier: 'Silver',
    capacity: 400, occupancyPct: 55, isLive: false, audienceCount: 0,
    ticketPriceUsd: 15, openTickets: 180,
    roomId: 'room-rnb-basement',
    profileRoute: '/venues/rnb-basement',
    ticketRoute: '/tickets/rnb-basement',
    liveRoomRoute: '/live/rooms/room-rnb-basement',
    upcomingEventIds: ['soul-sessions-01'],
  },
  {
    id: 'the-underground-v',
    slug: 'the-underground',
    name: 'The Underground',
    tileImage: '/assets/generated/venues/the-underground-tile.jpg',
    profileImage: '/assets/generated/venues/the-underground-profile.jpg',
    city: 'Detroit, MI', countryName: 'United States', flag: '🇺🇸',
    category: 'Studio', tier: 'RUBY',
    capacity: 200, occupancyPct: 40, isLive: false, audienceCount: 0,
    ticketPriceUsd: 10, openTickets: 120,
    roomId: 'room-underground',
    profileRoute: '/venues/the-underground',
    ticketRoute: '/tickets/the-underground',
    liveRoomRoute: '/live/rooms/room-underground',
    upcomingEventIds: [],
  },
  {
    id: 'crown-duel-stage-v',
    slug: 'crown-duel-stage',
    name: 'Crown Duel Stage',
    tileImage: '/assets/generated/venues/crown-duel-stage-tile.jpg',
    profileImage: '/assets/generated/venues/crown-duel-stage-profile.jpg',
    city: 'Miami, FL', countryName: 'United States', flag: '🇺🇸',
    category: 'Theater', tier: 'Platinum',
    capacity: 1200, occupancyPct: 78, isLive: false, audienceCount: 936,
    ticketPriceUsd: 35, openTickets: 264,
    roomId: 'room-crown-duel',
    profileRoute: '/venues/crown-duel-stage',
    ticketRoute: '/tickets/crown-duel-stage',
    liveRoomRoute: '/live/rooms/room-crown-duel',
    upcomingEventIds: ['crown-night-finals'],
  },
  {
    id: 'jakarta-arena-v',
    slug: 'jakarta-arena',
    name: 'Jakarta Arena',
    tileImage: '/assets/generated/venues/jakarta-arena-tile.jpg',
    profileImage: '/assets/generated/venues/jakarta-arena-profile.jpg',
    city: 'Jakarta, ID', countryName: 'Indonesia', flag: '🇮🇩',
    category: 'Stadium', tier: 'Diamond',
    capacity: 18000, occupancyPct: 62, isLive: false, audienceCount: 0,
    ticketPriceUsd: 55, openTickets: 6840,
    roomId: 'room-jakarta-arena',
    profileRoute: '/venues/jakarta-arena',
    ticketRoute: '/tickets/jakarta-arena',
    liveRoomRoute: '/live/rooms/room-jakarta-arena',
    upcomingEventIds: ['global-showcase-asia'],
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

const _byId = new Map(VENUE_REGISTRY.map((v) => [v.id, v]));
const _bySlug = new Map(VENUE_REGISTRY.map((v) => [v.slug, v]));

export function getVenueById(id: string): VenueIdentity | null {
  return _byId.get(id) ?? null;
}

export function getVenueBySlug(slug: string): VenueIdentity | null {
  return _bySlug.get(slug) ?? null;
}

export function getLiveVenues(): VenueIdentity[] {
  return VENUE_REGISTRY.filter((v) => v.isLive).sort((a, b) => b.audienceCount - a.audienceCount);
}

export function getAllVenues(): VenueIdentity[] {
  return [...VENUE_REGISTRY];
}

export function getVenuesByCategory(category: VenueCategory): VenueIdentity[] {
  return VENUE_REGISTRY.filter((v) => v.category === category);
}

// ── Home 1 booking panel adapter ──────────────────────────────────────────────

export interface VenueBookingSlot {
  day: string;
  venue: string;
  slug: string;
  bookRoute: string;
}

const BOOKING_DAY_LABELS = ['SAT', 'SUN', 'FRI'] as const;

// Returns up to `count` venues for Home 1's Venue Booking panel.
// Live venues appear first; each slot gets a day label (SAT/SUN/FRI).
export function getVenueBookingSlots(count = 3): VenueBookingSlot[] {
  const ordered = [
    ...VENUE_REGISTRY.filter((v) => v.isLive),
    ...VENUE_REGISTRY.filter((v) => !v.isLive),
  ];
  return ordered.slice(0, count).map((v, i) => ({
    day: BOOKING_DAY_LABELS[i] ?? BOOKING_DAY_LABELS[0]!,
    venue: v.name,
    slug: v.slug,
    bookRoute: `/venues/book?venue=${v.slug}`,
  }));
}

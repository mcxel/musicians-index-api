export interface SponsorSlot {
  id: string;
  zone: string;
  priceUsd: number;
  status: 'AVAILABLE' | 'SOLD' | 'PENDING';
}

// Active sponsor display data — populated when a sponsor purchases a zone.
// Zone key format: "${venue}-${slotKey}" (matches UnifiedAdSlot venue+slotKey props).
// When a sponsor is removed, delete its entry here; the slot auto-falls back to ad networks.
export interface ActiveSponsorDisplay {
  sponsorId: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  accentColor: string;
  ctaLabel: string;
  ctaHref: string;
}

// Registry of currently active sponsored slots.
// Keys: "${venue}-${slotKey}" — same convention as UnifiedAdSlot component.
export const ACTIVE_SPONSOR_ZONES: Record<string, ActiveSponsorDisplay> = {
  // Example (uncomment + fill in when a sponsor purchases this zone):
  // 'home-1-homepageBanner': {
  //   sponsorId: 'sp-beatlab',
  //   name: 'BeatLab Studios',
  //   tagline: 'Professional beats for professional artists',
  //   accentColor: '#00E5FF',
  //   ctaLabel: 'GET BEATS',
  //   ctaHref: '/sponsors/beatlab',
  // },
};

export function listActiveSponsorZones(): Record<string, ActiveSponsorDisplay> {
  return { ...ACTIVE_SPONSOR_ZONES };
}

export function upsertActiveSponsorZone(zone: string, sponsor: ActiveSponsorDisplay): ActiveSponsorDisplay {
  ACTIVE_SPONSOR_ZONES[zone] = sponsor;
  return ACTIVE_SPONSOR_ZONES[zone];
}

export function removeActiveSponsorZone(zone: string): boolean {
  if (!ACTIVE_SPONSOR_ZONES[zone]) return false;
  delete ACTIVE_SPONSOR_ZONES[zone];
  return true;
}

// Sync lookup — returns null when no active sponsor owns this zone.
// Called by UnifiedAdSlot; when null the slot renders normal ad networks.
export function getActiveSponsorForZone(zone: string): ActiveSponsorDisplay | null {
  return ACTIVE_SPONSOR_ZONES[zone] ?? null;
}

/**
 * getAdSlotForZone — Rule 12 (No Empty Inventory)
 *
 * Full fallback chain — a slot NEVER shows empty:
 *   1. Paid Sponsor      (from ACTIVE_SPONSOR_ZONES)
 *   2. Platform Promo    (internal TMI feature / upgrade CTA)
 *   3. Ad Network        (Google AdSense or programmatic — rendered by caller)
 *   4. Advertise Here    (direct link to /sponsors/advertise)
 *
 * Returns a canonical slot descriptor so callers don't need to implement the chain.
 */
export type AdSlotType = 'paid' | 'platform' | 'adnetwork' | 'advertise-cta';

export interface AdSlotDescriptor {
  type: AdSlotType;
  sponsor?: ActiveSponsorDisplay;
  platformPromo?: { headline: string; body: string; ctaLabel: string; ctaHref: string; accentColor: string };
}

const PLATFORM_PROMOS: AdSlotDescriptor['platformPromo'][] = [
  { headline: 'GO LIVE ON TMI', body: 'Reach thousands of fans in real time.', ctaLabel: 'START BROADCASTING', ctaHref: '/go-live', accentColor: '#00E5FF' },
  { headline: 'SELL YOUR BEATS', body: 'Producers earn 90% on every license sale.', ctaLabel: 'OPEN YOUR STORE', ctaHref: '/beats/sell', accentColor: '#FFD700' },
  { headline: 'JOIN A BATTLE', body: 'Weekly cyphers, monthly idol finals. Earn XP.', ctaLabel: 'SEE BATTLES', ctaHref: '/battles', accentColor: '#FF2DAA' },
  { headline: 'DIAMOND MEMBERSHIP', body: 'Ad-free. Priority queue. Exclusive rooms.', ctaLabel: 'UPGRADE NOW', ctaHref: '/pricing', accentColor: '#00E5FF' },
  { headline: 'WEEKLY CYPHER', body: 'Every Tuesday. All genres. Cash prizes.', ctaLabel: 'REGISTER NOW', ctaHref: '/live/rooms/cypher-arena', accentColor: '#AA2DFF' },
];

let _promoRotation = 0;

export function getAdSlotForZone(zone: string): AdSlotDescriptor {
  // Tier 1: paid sponsor
  const paid = ACTIVE_SPONSOR_ZONES[zone];
  if (paid) return { type: 'paid', sponsor: paid };

  // Tier 2: platform promo (rotate through promos to keep content fresh)
  const promo = PLATFORM_PROMOS[_promoRotation % PLATFORM_PROMOS.length];
  _promoRotation++;
  if (promo) return { type: 'platform', platformPromo: promo };

  // Tier 3: ad network — caller responsible for rendering AdSense/programmatic
  // (return type signals caller should render ad unit)
  if (zone.startsWith('home-') || zone.startsWith('magazine-')) {
    return { type: 'adnetwork' };
  }

  // Tier 4: advertise here CTA
  return { type: 'advertise-cta' };
}

export type RailSponsor = { id: string; name: string; logoUrl?: string; tagline?: string };

// Platform-level sponsor rail — shown when no paid sponsor has purchased the zone.
// Replace entries here as real sponsors sign contracts; getRailSponsors() picks them up automatically.
export const PLATFORM_SPONSOR_RAIL: RailSponsor[] = [
  { id: 'amplify',   name: 'AMPLIFY RECORDS',     tagline: 'Platinum Partner' },
  { id: 'beatlab',   name: 'BEATLAB STUDIOS',      tagline: 'Gold Partner'    },
  { id: 'velocity',  name: 'VELOCITY AUDIO',       tagline: 'Gold Partner'    },
  { id: 'nova',      name: 'NOVA MEDIA GROUP',     tagline: 'Silver Partner'  },
  { id: 'crown',     name: 'CROWN & CO.',          tagline: 'Silver Partner'  },
  { id: 'frequency', name: 'FREQUENCY LABS',       tagline: 'Bronze Partner'  },
  { id: 'vault',     name: 'THE VAULT COLLECTIVE', tagline: 'Bronze Partner'  },
  { id: 'sonic',     name: 'SONIC AXIS',           tagline: 'Bronze Partner'  },
];

// Returns paid sponsors for this zone prefix; falls back to PLATFORM_SPONSOR_RAIL.
// Removes the duplicate SEED_SPONSORS arrays from every page — one source of truth.
export function getRailSponsors(zonePrefix: string): RailSponsor[] {
  const paid = Object.entries(ACTIVE_SPONSOR_ZONES)
    .filter(([k]) => k.startsWith(zonePrefix))
    .map(([, v]) => ({ id: v.sponsorId, name: v.name, logoUrl: v.logoUrl, tagline: v.tagline }));
  return paid.length > 0 ? paid : PLATFORM_SPONSOR_RAIL;
}

export class SponsorSlotRegistry {
  static async getAvailableSlots(): Promise<SponsorSlot[]> {
    return [
      { id: 'slot-1', zone: 'home-1-homepageBanner',    priceUsd: 500, status: 'AVAILABLE' },
      { id: 'slot-2', zone: 'home-1-homepageMid',       priceUsd: 750, status: 'AVAILABLE' },
      { id: 'slot-3', zone: 'home-2-homepageBanner',    priceUsd: 400, status: 'AVAILABLE' },
      { id: 'slot-4', zone: 'home-3-liveLobbyBanner',   priceUsd: 600, status: 'AVAILABLE' },
      { id: 'slot-5', zone: 'magazine-magazineLeaderboard', priceUsd: 350, status: 'AVAILABLE' },
      { id: 'slot-6', zone: 'performer-hub',            priceUsd: 150, status: 'AVAILABLE' },
      { id: 'slot-7', zone: 'room-roomLeaderboard',     priceUsd: 200, status: 'AVAILABLE' },
      { id: 'slot-8', zone: 'dashboard-dashboardBanner', priceUsd: 300, status: 'AVAILABLE' },
    ];
  }
}

export class PerformerSponsorRegistry {
  static async getSponsorsForPerformer(performerId: string) {
    return [
      { id: 'sp-1', name: 'BeatLab Studios', targetId: performerId, amountUsd: 200, status: 'ACTIVE' },
      { id: 'sp-2', name: 'Velocity Audio', targetId: performerId, amountUsd: 500, status: 'ACTIVE' }
    ];
  }
}
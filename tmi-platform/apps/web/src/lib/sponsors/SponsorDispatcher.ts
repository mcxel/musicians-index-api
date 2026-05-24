/**
 * SponsorDispatcher
 * Billboard rotation engine — selects the active billboard creative based on
 * campaign priority, budget remaining, and impression/click performance.
 * Integrates with AdCampaign/AdCreative Prisma models via lightweight in-process store.
 */

export type BillboardSlot = 'HOME_HERO' | 'HOME_SIDEBAR' | 'ARENA_BANNER' | 'CYPHER_OVERLAY' | 'BEAT_LAB_TOP' | 'STAGE_LOWER_THIRD';

export interface BillboardCreative {
  id: string;
  campaignId: string;
  sponsorId: string;
  sponsorName: string;
  slot: BillboardSlot;
  headline: string;
  subtext?: string;
  ctaLabel: string;
  ctaUrl: string;
  imageEmoji?: string;
  primaryColor: string;
  accentColor: string;
  priority: number;
  budgetCents: number;
  spentCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  isActive: boolean;
  startsAt: number;
  endsAt: number;
}

type DispatchListener = (slot: BillboardSlot, creative: BillboardCreative | null) => void;

const creatives = new Map<string, BillboardCreative>();
const listeners = new Set<DispatchListener>();
const activeBySlot = new Map<BillboardSlot, string>();

let _rotationTimer: ReturnType<typeof setInterval> | null = null;
const ROTATION_INTERVAL_MS = 15_000;

// ── Seed creatives ────────────────────────────────────────────────────────────

const SEED_CREATIVES: Omit<BillboardCreative, 'impressions' | 'clicks' | 'conversions' | 'spentCents'>[] = [
  {
    id: 'bb-001', campaignId: 'camp-001', sponsorId: 'sponsor-001', sponsorName: 'BeatVault Pro',
    slot: 'HOME_HERO', headline: 'Unlock 50,000 Premium Beats', subtext: 'The beat marketplace for serious producers.',
    ctaLabel: 'Browse Now', ctaUrl: '/beat-marketplace', imageEmoji: '🎹',
    primaryColor: '#FFD700', accentColor: '#1a1a00', priority: 10,
    budgetCents: 100_000, isActive: true, startsAt: 0, endsAt: 9_999_999_999_999,
  },
  {
    id: 'bb-002', campaignId: 'camp-002', sponsorId: 'sponsor-002', sponsorName: 'ArtistUp Agency',
    slot: 'HOME_SIDEBAR', headline: 'Get Booked Tonight', subtext: '1,247 venues looking for talent right now.',
    ctaLabel: 'Start Booking', ctaUrl: '/dashboard/artist', imageEmoji: '🎭',
    primaryColor: '#AA2DFF', accentColor: '#1a0028', priority: 8,
    budgetCents: 75_000, isActive: true, startsAt: 0, endsAt: 9_999_999_999_999,
  },
  {
    id: 'bb-003', campaignId: 'camp-003', sponsorId: 'sponsor-003', sponsorName: 'TMI Season Pass',
    slot: 'ARENA_BANNER', headline: 'Season Pass — All Access', subtext: 'Every show. Every cypher. One pass.',
    ctaLabel: 'Get Your Pass', ctaUrl: '/billing', imageEmoji: '🏆',
    primaryColor: '#00FFFF', accentColor: '#001a1a', priority: 9,
    budgetCents: 50_000, isActive: true, startsAt: 0, endsAt: 9_999_999_999_999,
  },
  {
    id: 'bb-004', campaignId: 'camp-004', sponsorId: 'sponsor-004', sponsorName: 'Neon Merch Co.',
    slot: 'CYPHER_OVERLAY', headline: 'Drop Your Merch Today', subtext: 'Design → Ship → Sell. Zero inventory.',
    ctaLabel: 'Open Shop', ctaUrl: '/avatar/shop', imageEmoji: '👕',
    primaryColor: '#FF2DAA', accentColor: '#1a0010', priority: 7,
    budgetCents: 40_000, isActive: true, startsAt: 0, endsAt: 9_999_999_999_999,
  },
  {
    id: 'bb-005', campaignId: 'camp-005', sponsorId: 'sponsor-005', sponsorName: 'ProducerLink',
    slot: 'BEAT_LAB_TOP', headline: 'Collab With Top Producers', subtext: 'Direct sessions. Revenue splits built-in.',
    ctaLabel: 'Find a Producer', ctaUrl: '/beats/submit', imageEmoji: '🎚️',
    primaryColor: '#00FF88', accentColor: '#001a0a', priority: 6,
    budgetCents: 30_000, isActive: true, startsAt: 0, endsAt: 9_999_999_999_999,
  },
  {
    id: 'bb-006', campaignId: 'camp-006', sponsorId: 'sponsor-006', sponsorName: 'StageMax Lighting',
    slot: 'STAGE_LOWER_THIRD', headline: 'Professional Stage Lighting Kits', subtext: 'From home studio to arena.',
    ctaLabel: 'Shop Kits', ctaUrl: '/dashboard/performer', imageEmoji: '💡',
    primaryColor: '#FFD700', accentColor: '#1a1400', priority: 5,
    budgetCents: 20_000, isActive: true, startsAt: 0, endsAt: 9_999_999_999_999,
  },
];

// ── Initialize ────────────────────────────────────────────────────────────────

let _seeded = false;

export function seedDefaultCreatives(): void {
  if (_seeded) return;
  _seeded = true;
  for (const c of SEED_CREATIVES) {
    creatives.set(c.id, { ...c, impressions: 0, clicks: 0, conversions: 0, spentCents: 0 });
  }
  _rotate();
}

// ── Rotation ──────────────────────────────────────────────────────────────────

export function startRotation(): void {
  if (_rotationTimer) return;
  seedDefaultCreatives();
  _rotationTimer = setInterval(_rotate, ROTATION_INTERVAL_MS);
}

export function stopRotation(): void {
  if (_rotationTimer) { clearInterval(_rotationTimer); _rotationTimer = null; }
}

function _rotate(): void {
  const now = Date.now();
  const slots = new Set<BillboardSlot>();

  for (const c of creatives.values()) {
    if (c.isActive && c.budgetCents > c.spentCents && c.startsAt <= now && c.endsAt >= now) {
      slots.add(c.slot);
    }
  }

  for (const slot of slots) {
    const candidates = Array.from(creatives.values())
      .filter((c) => c.slot === slot && c.isActive && c.budgetCents > c.spentCents && c.endsAt >= now)
      .sort((a, b) => {
        // Score: priority (weighted) + CTR bonus
        const ctrA = a.impressions > 0 ? a.clicks / a.impressions : 0;
        const ctrB = b.impressions > 0 ? b.clicks / b.impressions : 0;
        return (b.priority + ctrB * 5) - (a.priority + ctrA * 5);
      });

    if (!candidates.length) {
      activeBySlot.delete(slot);
      _emit(slot, null);
      continue;
    }

    // Rotate through candidates to prevent the same ad always winning
    const current = activeBySlot.get(slot);
    const currentIdx = candidates.findIndex((c) => c.id === current);
    const next = candidates[(currentIdx + 1) % candidates.length];
    activeBySlot.set(slot, next.id);
    _emit(slot, next);
  }
}

// ── Impression / Click tracking ───────────────────────────────────────────────

export function recordImpression(creativeId: string, cpmCents = 10): void {
  const c = creatives.get(creativeId);
  if (!c) return;
  c.impressions++;
  c.spentCents += cpmCents;
}

export function recordClick(creativeId: string, cpcCents = 50): void {
  const c = creatives.get(creativeId);
  if (!c) return;
  c.clicks++;
  c.spentCents += cpcCents;
}

export function recordConversion(creativeId: string, cpaCents = 200): void {
  const c = creatives.get(creativeId);
  if (!c) return;
  c.conversions++;
  c.spentCents += cpaCents;
}

// ── Query ─────────────────────────────────────────────────────────────────────

export function getActiveCreative(slot: BillboardSlot): BillboardCreative | null {
  const id = activeBySlot.get(slot);
  return id ? (creatives.get(id) ?? null) : null;
}

export function getAllCreatives(): BillboardCreative[] {
  return Array.from(creatives.values());
}

export function getCampaignStats(campaignId: string) {
  const campaign = Array.from(creatives.values()).filter((c) => c.campaignId === campaignId);
  return {
    totalImpressions: campaign.reduce((s, c) => s + c.impressions, 0),
    totalClicks:      campaign.reduce((s, c) => s + c.clicks, 0),
    totalConversions: campaign.reduce((s, c) => s + c.conversions, 0),
    totalSpentCents:  campaign.reduce((s, c) => s + c.spentCents, 0),
    ctr: campaign.reduce((s, c) => s + c.impressions, 0) > 0
      ? campaign.reduce((s, c) => s + c.clicks, 0) / campaign.reduce((s, c) => s + c.impressions, 0)
      : 0,
  };
}

export function subscribeBillboard(fn: DispatchListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function _emit(slot: BillboardSlot, creative: BillboardCreative | null): void {
  for (const fn of listeners) {
    try { fn(slot, creative); } catch { /* ignore */ }
  }
}

// BeatRoyaltyEngine
// Tracks beat usage and computes royalty payouts for producers
// Covers: battle royalties, cypher royalties, sponsor splits
// Critical for monetization — producer pay is a revenue obligation

export type RoyaltyEventType =
  | "battle_use"      // beat used in a battle
  | "cypher_use"      // beat used in a cypher session
  | "sponsor_sync"    // beat licensed to a sponsor placement
  | "broadcast_use"   // beat used in a live broadcast
  | "sample_clear"    // sample clearance payment out
  | "payout";         // royalty paid out to producer

export type RoyaltySplit = {
  producerId: string;
  splitPercent: number; // 0–100
};

export type BeatRecord = {
  beatId: string;
  title: string;
  producerId: string;   // primary producer
  coProducers: RoyaltySplit[];
  bpm: number;
  genre: string;
  isCleared: boolean;   // sample clearance resolved
  totalUses: number;
  totalRoyaltiesEarned: number; // USD cents
  lastUsedAt?: number;
};

export type RoyaltyEvent = {
  eventId: string;
  beatId: string;
  producerId: string;
  eventType: RoyaltyEventType;
  grossAmount: number;    // USD cents
  platformCut: number;    // USD cents (TMI 20% default)
  producerPayout: number; // USD cents
  sponsorId?: string;
  sessionId?: string;
  occurredAt: number;
};

export type ProducerLedger = {
  producerId: string;
  name: string;
  totalEarned: number;      // USD cents
  totalPlatformCut: number; // USD cents
  pendingPayout: number;    // USD cents not yet disbursed
  paidOut: number;          // USD cents disbursed
  events: RoyaltyEvent[];
};

// Platform take rate
const PLATFORM_RATE = 0.20;

// Per-use royalty rates (USD cents)
const RATES: Record<RoyaltyEventType, number> = {
  battle_use:   250,   // $2.50
  cypher_use:   100,   // $1.00
  sponsor_sync: 5000,  // $50.00
  broadcast_use: 500,  // $5.00
  sample_clear: -1000, // -$10.00 (cost to producer if uncleared)
  payout:        0,    // payout event itself has no rate
};

// In-memory stores
const _beats: Record<string, BeatRecord> = {};
const _ledgers: Record<string, ProducerLedger> = {};
const _events: RoyaltyEvent[] = [];
let _eventCounter = 0;

// ── Beat registry ─────────────────────────────────────────────────────────────

export function registerBeat(
  beatId: string,
  title: string,
  producerId: string,
  bpm: number,
  genre: string,
  coProducers: RoyaltySplit[] = [],
  isCleared = true,
): BeatRecord {
  _beats[beatId] = {
    beatId,
    title,
    producerId,
    coProducers,
    bpm,
    genre,
    isCleared,
    totalUses: 0,
    totalRoyaltiesEarned: 0,
  };
  return _beats[beatId];
}

export function getBeat(beatId: string): BeatRecord | undefined {
  return _beats[beatId];
}

export function getAllBeats(): BeatRecord[] {
  return Object.values(_beats);
}

// ── Ledger helpers ────────────────────────────────────────────────────────────

function getOrInitLedger(producerId: string, name = ""): ProducerLedger {
  if (!_ledgers[producerId]) {
    _ledgers[producerId] = {
      producerId,
      name,
      totalEarned: 0,
      totalPlatformCut: 0,
      pendingPayout: 0,
      paidOut: 0,
      events: [],
    };
  }
  return _ledgers[producerId];
}

// ── Royalty computation ───────────────────────────────────────────────────────

function computePlatformCut(gross: number): number {
  return Math.round(gross * PLATFORM_RATE);
}

function splitRoyalty(
  beatId: string,
  gross: number,
  eventType: RoyaltyEventType,
  sessionId?: string,
  sponsorId?: string,
): RoyaltyEvent[] {
  const beat = _beats[beatId];
  if (!beat) return [];

  const platformCut = computePlatformCut(gross);
  const netForProducers = gross - platformCut;
  const events: RoyaltyEvent[] = [];

  // Primary producer gets remaining share after co-producers
  const coTotal = beat.coProducers.reduce((s, c) => s + c.splitPercent, 0);
  const primaryPct = Math.max(0, 100 - coTotal) / 100;
  const primaryPayout = Math.round(netForProducers * primaryPct);

  const primaryEvent: RoyaltyEvent = {
    eventId: `ev-${++_eventCounter}`,
    beatId,
    producerId: beat.producerId,
    eventType,
    grossAmount: gross,
    platformCut,
    producerPayout: primaryPayout,
    sponsorId,
    sessionId,
    occurredAt: Date.now(),
  };
  events.push(primaryEvent);

  // Co-producers
  for (const co of beat.coProducers) {
    const coPayout = Math.round(netForProducers * (co.splitPercent / 100));
    events.push({
      eventId: `ev-${++_eventCounter}`,
      beatId,
      producerId: co.producerId,
      eventType,
      grossAmount: gross,
      platformCut: 0,
      producerPayout: coPayout,
      sponsorId,
      sessionId,
      occurredAt: Date.now(),
    });
  }

  return events;
}

function applyEvents(events: RoyaltyEvent[]): void {
  for (const ev of events) {
    _events.push(ev);
    const ledger = getOrInitLedger(ev.producerId);
    ledger.totalEarned += ev.producerPayout;
    ledger.totalPlatformCut += ev.platformCut;
    ledger.pendingPayout += ev.producerPayout;
    ledger.events.push(ev);

    const beat = _beats[ev.beatId];
    if (beat && ev.eventType !== "payout") {
      beat.totalUses += 1;
      beat.totalRoyaltiesEarned += ev.producerPayout;
      beat.lastUsedAt = ev.occurredAt;
    }
  }
}

// ── Public event recorders ────────────────────────────────────────────────────

export function recordBattleUse(beatId: string, sessionId: string): RoyaltyEvent[] {
  const gross = RATES.battle_use;
  const events = splitRoyalty(beatId, gross, "battle_use", sessionId);
  applyEvents(events);
  return events;
}

export function recordCypherUse(beatId: string, sessionId: string): RoyaltyEvent[] {
  const gross = RATES.cypher_use;
  const events = splitRoyalty(beatId, gross, "cypher_use", sessionId);
  applyEvents(events);
  return events;
}

export function recordSponsorSync(beatId: string, sponsorId: string, customAmount?: number): RoyaltyEvent[] {
  const gross = customAmount ?? RATES.sponsor_sync;
  const events = splitRoyalty(beatId, gross, "sponsor_sync", undefined, sponsorId);
  applyEvents(events);
  return events;
}

export function recordBroadcastUse(beatId: string, sessionId: string): RoyaltyEvent[] {
  const gross = RATES.broadcast_use;
  const events = splitRoyalty(beatId, gross, "broadcast_use", sessionId);
  applyEvents(events);
  return events;
}

// ── Payout processing ─────────────────────────────────────────────────────────

export function processPayout(producerId: string): number {
  const ledger = _ledgers[producerId];
  if (!ledger || ledger.pendingPayout <= 0) return 0;
  const amount = ledger.pendingPayout;
  ledger.paidOut += amount;
  ledger.pendingPayout = 0;
  _events.push({
    eventId: `ev-${++_eventCounter}`,
    beatId: "",
    producerId,
    eventType: "payout",
    grossAmount: amount,
    platformCut: 0,
    producerPayout: amount,
    occurredAt: Date.now(),
  });
  return amount;
}

// ── Query API ─────────────────────────────────────────────────────────────────

export function getProducerLedger(producerId: string): ProducerLedger | undefined {
  return _ledgers[producerId];
}

export function getAllLedgers(): ProducerLedger[] {
  return Object.values(_ledgers);
}

export function getTopEarners(limit = 10): ProducerLedger[] {
  return getAllLedgers()
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, limit);
}

export function getMostUsedBeats(limit = 10): BeatRecord[] {
  return getAllBeats()
    .sort((a, b) => b.totalUses - a.totalUses)
    .slice(0, limit);
}

export function getTotalPlatformRevenue(): number {
  return _events.reduce((sum, ev) => sum + ev.platformCut, 0);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getPendingPayoutTotal(): number {
  return getAllLedgers().reduce((sum, l) => sum + l.pendingPayout, 0);
}

export function getBeatsByProducer(producerId: string): BeatRecord[] {
  return getAllBeats().filter((b) => b.producerId === producerId);
}

export function getSponsorSyncEvents(sponsorId: string): RoyaltyEvent[] {
  return _events.filter((ev) => ev.sponsorId === sponsorId && ev.eventType === "sponsor_sync");
}

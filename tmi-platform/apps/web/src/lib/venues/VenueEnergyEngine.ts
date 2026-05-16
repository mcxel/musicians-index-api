import { getRoomPopulation, recordRoomHeatEvent } from "@/lib/rooms/RoomPopulationEngine";
import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";

export type EnergyBand = "cold" | "warm" | "hot" | "electric";

export interface VenueEnergyState {
  venueId: string;
  occupancyPct: number;
  tipFlowRate: number;    // tips per minute (last window)
  reactionVolume: number; // reactions per minute
  chatSpeed: number;      // messages per minute
  energyScore: number;    // 0–100 composite
  band: EnergyBand;
  isFeatured: boolean;
  updatedAtMs: number;
}

export interface TipEvent {
  amount: number;
  ts: number;
}

export interface ChatEvent {
  ts: number;
}

type EnergySubscriber = (state: VenueEnergyState) => void;

// ── Config ────────────────────────────────────────────────────────────────────

const BAND_THRESHOLDS: Record<EnergyBand, number> = {
  cold:     0,
  warm:     25,
  hot:      55,
  electric: 80,
};

const WEIGHTS = {
  occupancy: 0.30,
  tipFlow:   0.25,
  reactions: 0.25,
  chat:      0.20,
};

const TIP_WINDOW_MS   = 60_000;
const CHAT_WINDOW_MS  = 60_000;

// ── State store ───────────────────────────────────────────────────────────────

interface VenueEnergyRecord {
  state: VenueEnergyState;
  capacity: number;
  roomId?: ChatRoomId;
  tipEvents: TipEvent[];
  chatEvents: ChatEvent[];
  reactionCount: number;
  reactionWindowStart: number;
}

const _venues: Map<string, VenueEnergyRecord> = new Map();
const _subs: Map<string, Set<EnergySubscriber>> = new Map();

function getBand(score: number): EnergyBand {
  if (score >= BAND_THRESHOLDS.electric) return "electric";
  if (score >= BAND_THRESHOLDS.hot)      return "hot";
  if (score >= BAND_THRESHOLDS.warm)     return "warm";
  return "cold";
}

function computeEnergy(record: VenueEnergyRecord): VenueEnergyState {
  const now = Date.now();

  // Occupancy: pull from RoomPopulationEngine if roomId is wired
  let occupancyPct = record.state.occupancyPct;
  if (record.roomId) {
    const pop = getRoomPopulation(record.roomId);
    const total = pop.audienceCount + pop.performerCount + pop.hostCount + pop.sponsorCount;
    occupancyPct = record.capacity > 0 ? Math.min(100, Math.round((total / record.capacity) * 100)) : 0;
  }

  // Tip flow: count tips in last minute
  const recentTips = record.tipEvents.filter((t) => now - t.ts < TIP_WINDOW_MS);
  const tipFlowRate = recentTips.length;

  // Chat speed: messages per minute
  const recentChat = record.chatEvents.filter((c) => now - c.ts < CHAT_WINDOW_MS);
  const chatSpeed = recentChat.length;

  // Reactions: rolling count
  const reactionVolume = Math.min(100, record.reactionCount);

  // Composite energy score (0–100 per dimension)
  const occupancyNorm  = occupancyPct;
  const tipNorm        = Math.min(100, tipFlowRate * 5);
  const reactionNorm   = Math.min(100, reactionVolume * 2);
  const chatNorm       = Math.min(100, chatSpeed * 3);

  const energyScore = Math.round(
    occupancyNorm  * WEIGHTS.occupancy +
    tipNorm        * WEIGHTS.tipFlow   +
    reactionNorm   * WEIGHTS.reactions +
    chatNorm       * WEIGHTS.chat
  );

  const band = getBand(energyScore);
  const isFeatured = energyScore >= BAND_THRESHOLDS.hot;

  return {
    venueId: record.state.venueId,
    occupancyPct,
    tipFlowRate,
    reactionVolume,
    chatSpeed,
    energyScore,
    band,
    isFeatured,
    updatedAtMs: now,
  };
}

function notify(venueId: string): void {
  const record = _venues.get(venueId);
  if (!record) return;
  const subs = _subs.get(venueId);
  if (!subs) return;
  for (const fn of subs) fn(record.state);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function registerVenue(venueId: string, capacity: number, roomId?: ChatRoomId): VenueEnergyState {
  const state: VenueEnergyState = {
    venueId, occupancyPct: 0, tipFlowRate: 0, reactionVolume: 0,
    chatSpeed: 0, energyScore: 0, band: "cold", isFeatured: false, updatedAtMs: Date.now(),
  };
  _venues.set(venueId, {
    state, capacity, roomId,
    tipEvents: [], chatEvents: [], reactionCount: 0,
    reactionWindowStart: Date.now(),
  });
  return state;
}

export function getEnergyState(venueId: string): VenueEnergyState | null {
  const record = _venues.get(venueId);
  if (!record) return null;
  return record.state;
}

export function tick(venueId: string): VenueEnergyState | null {
  const record = _venues.get(venueId);
  if (!record) return null;

  const updated = computeEnergy(record);
  record.state = updated;
  _venues.set(venueId, record);
  notify(venueId);

  // Sync heat event to RoomPopulationEngine if wired
  if (record.roomId && updated.energyScore > 60) {
    recordRoomHeatEvent(record.roomId, "reaction");
  }

  return updated;
}

export function recordTip(venueId: string, amount: number): void {
  const record = _venues.get(venueId);
  if (!record) return;
  record.tipEvents.push({ amount, ts: Date.now() });
  tick(venueId);
}

export function recordReaction(venueId: string, count = 1): void {
  const record = _venues.get(venueId);
  if (!record) return;
  record.reactionCount = Math.min(50, record.reactionCount + count);
  tick(venueId);
}

export function recordChatMessage(venueId: string): void {
  const record = _venues.get(venueId);
  if (!record) return;
  record.chatEvents.push({ ts: Date.now() });
  tick(venueId);
}

export function subscribeEnergy(venueId: string, fn: EnergySubscriber): () => void {
  if (!_subs.has(venueId)) _subs.set(venueId, new Set());
  _subs.get(venueId)!.add(fn);
  const current = _venues.get(venueId)?.state;
  if (current) fn(current);
  return () => _subs.get(venueId)?.delete(fn);
}

export function getFeaturedVenues(): VenueEnergyState[] {
  return Array.from(_venues.values())
    .map((r) => r.state)
    .filter((s) => s.isFeatured)
    .sort((a, b) => b.energyScore - a.energyScore);
}

export function getAllVenueEnergy(): VenueEnergyState[] {
  return Array.from(_venues.values())
    .map((r) => r.state)
    .sort((a, b) => b.energyScore - a.energyScore);
}

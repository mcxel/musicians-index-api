/**
 * VenueStateEngine
 * Central state machine for a live venue room.
 * Tracks show phase, capacity, active performers, and environmental conditions.
 */

export type VenuePhase =
  | "pre-doors"
  | "doors-open"
  | "warm-up"
  | "main-show"
  | "battle"
  | "encore"
  | "intermission"
  | "post-show"
  | "after-party"
  | "closed";

export type VenueType = "arena" | "theater" | "club" | "lounge" | "rooftop" | "virtual-stage" | "battle-pit";

export interface VenueCapacity {
  total: number;
  occupied: number;
  vipTotal: number;
  vipOccupied: number;
  standingRoom: number;
  overflow: boolean;
}

export interface ActivePerformer {
  performerId: string;
  displayName: string;
  role: "headliner" | "opener" | "dj" | "battle-contestant" | "co-host";
  onStageAt: number;
}

export interface VenueState {
  venueId: string;
  displayName: string;
  venueType: VenueType;
  phase: VenuePhase;
  capacity: VenueCapacity;
  activePerformers: ActivePerformer[];
  energyLevel: number;            // 0-100
  lightingPreset: string;
  ambientSoundLevel: number;      // 0-1
  isLive: boolean;
  streamStartedAt: number | null;
  lastPhaseChangeAt: number;
  metadata: Record<string, unknown>;
}

type VenueListener = (state: VenueState) => void;

const venues = new Map<string, VenueState>();
const venueListeners = new Map<string, Set<VenueListener>>();

function notify(venueId: string, state: VenueState): void {
  venueListeners.get(venueId)?.forEach(l => l(state));
}

export function registerVenue(
  venueId: string,
  displayName: string,
  venueType: VenueType,
  opts: {
    totalCapacity?: number;
    vipCapacity?: number;
  } = {}
): VenueState {
  const state: VenueState = {
    venueId,
    displayName,
    venueType,
    phase: "pre-doors",
    capacity: {
      total: opts.totalCapacity ?? 500,
      occupied: 0,
      vipTotal: opts.vipCapacity ?? 50,
      vipOccupied: 0,
      standingRoom: 0,
      overflow: false,
    },
    activePerformers: [],
    energyLevel: 0,
    lightingPreset: "pre-show",
    ambientSoundLevel: 0.3,
    isLive: false,
    streamStartedAt: null,
    lastPhaseChangeAt: Date.now(),
    metadata: {},
  };
  venues.set(venueId, state);
  notify(venueId, state);
  return state;
}

export function transitionPhase(venueId: string, phase: VenuePhase): VenueState | null {
  const state = venues.get(venueId);
  if (!state) return null;

  const LIGHTING_MAP: Partial<Record<VenuePhase, string>> = {
    "pre-doors":   "house-lights",
    "doors-open":  "lobby-warm",
    "warm-up":     "stage-blue",
    "main-show":   "full-production",
    "battle":      "strobe-red",
    "encore":      "encore-gold",
    "intermission":"half-house",
    "post-show":   "house-lights",
    "after-party": "party-mode",
    "closed":      "off",
  };

  const updated: VenueState = {
    ...state,
    phase,
    isLive: phase === "main-show" || phase === "battle" || phase === "encore" || phase === "warm-up",
    streamStartedAt: phase === "main-show" && !state.streamStartedAt ? Date.now() : state.streamStartedAt,
    lightingPreset: LIGHTING_MAP[phase] ?? state.lightingPreset,
    lastPhaseChangeAt: Date.now(),
  };
  venues.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function updateCapacity(
  venueId: string,
  opts: { occupied?: number; vipOccupied?: number; standingRoom?: number }
): VenueState | null {
  const state = venues.get(venueId);
  if (!state) return null;
  const occupied = opts.occupied ?? state.capacity.occupied;
  const updated: VenueState = {
    ...state,
    capacity: {
      ...state.capacity,
      occupied,
      vipOccupied: opts.vipOccupied ?? state.capacity.vipOccupied,
      standingRoom: opts.standingRoom ?? state.capacity.standingRoom,
      overflow: occupied > state.capacity.total,
    },
  };
  venues.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function addPerformer(venueId: string, performer: ActivePerformer): VenueState | null {
  const state = venues.get(venueId);
  if (!state) return null;
  const existing = state.activePerformers.filter(p => p.performerId !== performer.performerId);
  const updated = { ...state, activePerformers: [...existing, performer] };
  venues.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function removePerformer(venueId: string, performerId: string): VenueState | null {
  const state = venues.get(venueId);
  if (!state) return null;
  const updated = { ...state, activePerformers: state.activePerformers.filter(p => p.performerId !== performerId) };
  venues.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function setVenueEnergy(venueId: string, energyLevel: number): VenueState | null {
  const state = venues.get(venueId);
  if (!state) return null;
  const clamped = Math.max(0, Math.min(100, energyLevel));
  const updated = { ...state, energyLevel: clamped };
  venues.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function getVenueState(venueId: string): VenueState | null {
  return venues.get(venueId) ?? null;
}

export function getAllVenues(): VenueState[] {
  return [...venues.values()];
}

export function getLiveVenues(): VenueState[] {
  return [...venues.values()].filter(v => v.isLive);
}

export function subscribeToVenue(venueId: string, listener: VenueListener): () => void {
  if (!venueListeners.has(venueId)) venueListeners.set(venueId, new Set());
  venueListeners.get(venueId)!.add(listener);
  const current = venues.get(venueId);
  if (current) listener(current);
  return () => venueListeners.get(venueId)?.delete(listener);
}

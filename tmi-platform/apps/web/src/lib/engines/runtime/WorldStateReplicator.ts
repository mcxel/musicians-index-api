/**
 * WorldStateReplicator
 * Single-source-of-truth for shared world state across all rooms.
 * Rooms read from here; admin writes to here; distributor fans out changes.
 */

export type VibePreset =
  | 'midnight-afterparty'
  | 'neon-arena'
  | 'world-premiere'
  | 'golden-hour-chill'
  | 'cyber-battle'
  | 'retro-mtv'
  | 'underground-cypher'
  | 'festival-sunrise'
  | 'luxury-vip'
  | 'horror-event'
  | 'xmas-concert'
  | 'halloween-takeover';

export interface VibePresetConfig {
  id: VibePreset;
  label: string;
  accentColor: string;
  bgColor: string;
  pulseColor: string;
  bpm: number;
  strobeIntensity: number;  // 0–1
  crowdEnergy: number;      // 0–1
}

export const VIBE_PRESETS: Record<VibePreset, VibePresetConfig> = {
  'midnight-afterparty':  { id: 'midnight-afterparty',  label: 'Midnight Afterparty',  accentColor: '#AA2DFF', bgColor: '#0a0015', pulseColor: '#FF2DAA', bpm: 128, strobeIntensity: 0.7, crowdEnergy: 0.85 },
  'neon-arena':           { id: 'neon-arena',           label: 'Neon Arena',           accentColor: '#00FFFF', bgColor: '#020a10', pulseColor: '#00FF88', bpm: 140, strobeIntensity: 0.9, crowdEnergy: 0.95 },
  'world-premiere':       { id: 'world-premiere',       label: 'World Premiere',       accentColor: '#FFD700', bgColor: '#08060a', pulseColor: '#FF9500', bpm: 120, strobeIntensity: 0.5, crowdEnergy: 0.90 },
  'golden-hour-chill':    { id: 'golden-hour-chill',    label: 'Golden Hour Chill',    accentColor: '#FFD700', bgColor: '#120a02', pulseColor: '#FF9500', bpm: 90,  strobeIntensity: 0.2, crowdEnergy: 0.40 },
  'cyber-battle':         { id: 'cyber-battle',         label: 'Cyber Battle',         accentColor: '#00FFFF', bgColor: '#020a08', pulseColor: '#FF2DAA', bpm: 150, strobeIntensity: 1.0, crowdEnergy: 1.00 },
  'retro-mtv':            { id: 'retro-mtv',            label: 'Retro MTV',            accentColor: '#FF2DAA', bgColor: '#0a0204', pulseColor: '#FFD700', bpm: 110, strobeIntensity: 0.6, crowdEnergy: 0.70 },
  'underground-cypher':   { id: 'underground-cypher',   label: 'Underground Cypher',   accentColor: '#AA2DFF', bgColor: '#05010a', pulseColor: '#00FFFF', bpm: 95,  strobeIntensity: 0.4, crowdEnergy: 0.65 },
  'festival-sunrise':     { id: 'festival-sunrise',     label: 'Festival Sunrise',     accentColor: '#00FF88', bgColor: '#020a04', pulseColor: '#FFD700', bpm: 126, strobeIntensity: 0.5, crowdEnergy: 0.80 },
  'luxury-vip':           { id: 'luxury-vip',           label: 'Luxury VIP',           accentColor: '#FFD700', bgColor: '#080604', pulseColor: '#FF9500', bpm: 85,  strobeIntensity: 0.1, crowdEnergy: 0.30 },
  'horror-event':         { id: 'horror-event',         label: 'Horror Event',         accentColor: '#FF2DAA', bgColor: '#020002', pulseColor: '#AA2DFF', bpm: 100, strobeIntensity: 0.8, crowdEnergy: 0.75 },
  'xmas-concert':         { id: 'xmas-concert',         label: 'Xmas Concert',         accentColor: '#00FF88', bgColor: '#020a02', pulseColor: '#FF2DAA', bpm: 112, strobeIntensity: 0.3, crowdEnergy: 0.60 },
  'halloween-takeover':   { id: 'halloween-takeover',   label: 'Halloween Takeover',   accentColor: '#FF9500', bgColor: '#04020a', pulseColor: '#AA2DFF', bpm: 130, strobeIntensity: 0.9, crowdEnergy: 0.90 },
};

export interface WorldState {
  vibe: VibePreset;
  vibeConfig: VibePresetConfig;
  beatPhase: number;          // 0–1 within current beat cycle
  crowdEnergyOverride: number | null;  // null = use vibe default
  activeSponsorId: string | null;
  activePrizeId: string | null;
  syncToken: string;          // changes on every world-state update
  updatedAt: number;          // UTC ms
  updatedBy: 'admin' | 'system' | string;
}

let worldState: WorldState = {
  vibe: 'neon-arena',
  vibeConfig: VIBE_PRESETS['neon-arena'],
  beatPhase: 0,
  crowdEnergyOverride: null,
  activeSponsorId: null,
  activePrizeId: null,
  syncToken: `init-${Date.now()}`,
  updatedAt: Date.now(),
  updatedBy: 'system',
};

type WorldStateListener = (state: WorldState) => void;
const listeners = new Set<WorldStateListener>();

function newSyncToken(): string {
  return `wst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getWorldState(): Readonly<WorldState> {
  return worldState;
}

export function setVibe(preset: VibePreset, by: string = 'admin'): WorldState {
  worldState = {
    ...worldState,
    vibe: preset,
    vibeConfig: VIBE_PRESETS[preset],
    syncToken: newSyncToken(),
    updatedAt: Date.now(),
    updatedBy: by,
  };
  notifyListeners();
  return worldState;
}

export function setBeatPhase(phase: number): void {
  worldState = { ...worldState, beatPhase: Math.max(0, Math.min(1, phase)) };
  // beat-phase updates are high-frequency — don't notify listeners (avoids re-render storm)
}

export function setCrowdEnergyOverride(energy: number | null, by: string = 'admin'): WorldState {
  worldState = {
    ...worldState,
    crowdEnergyOverride: energy !== null ? Math.max(0, Math.min(1, energy)) : null,
    syncToken: newSyncToken(),
    updatedAt: Date.now(),
    updatedBy: by,
  };
  notifyListeners();
  return worldState;
}

export function setActiveSponsor(sponsorId: string | null, by: string = 'admin'): WorldState {
  worldState = {
    ...worldState,
    activeSponsorId: sponsorId,
    syncToken: newSyncToken(),
    updatedAt: Date.now(),
    updatedBy: by,
  };
  notifyListeners();
  return worldState;
}

export function subscribeWorldState(listener: WorldStateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  for (const l of listeners) {
    try { l(worldState); } catch { /* listener errors don't block state propagation */ }
  }
}

/**
 * World Dance Party Mirror Engine
 * Manages the holographic avatar/live-video overlay protocol.
 * Fans can toggle their camera; when on, their live feed floats over their avatar slot.
 * The DJ Spotlight Bot periodically surfaces a high-motion fan to the Jumbotron.
 */

export type FanVideoMode = 'avatar-only' | 'partial-video' | 'full-spotlight';

export interface DancerSlot {
  fanId: string;
  displayName: string;
  avatarUrl: string;
  seatPosition: { row: number; col: number };
  videoMode: FanVideoMode;
  /** true = camera is physically on and stream is available */
  cameraEnabled: boolean;
  /** 0–100 motion heat (from MotionHeatVisualizer) */
  motionHeat: number;
  /** true = currently shown on Jumbotron */
  onJumbotron: boolean;
  /** Ignition glow active when heat > IGNITION_THRESHOLD */
  ignitionActive: boolean;
}

export interface WorldDancePartyState {
  slots: DancerSlot[];
  jumbotronFanId: string | null;
  lastSpotlightAt: number;
  djSpotlightEnabled: boolean;
  /** BPM drives avatar dance animation speed */
  currentBpm: number;
  /** When true, all glow effects pulse in sync with the DJ's crossfader */
  crossfaderSyncActive: boolean;
}

const IGNITION_MOTION_THRESHOLD = 72;
// DJ Spotlight bot minimum interval between spotlights (ms)
const SPOTLIGHT_COOLDOWN_MS = 12_000;
// Spotlight automatically fades back to avatar after this duration (ms)
const SPOTLIGHT_HOLD_MS = 8_000;

export function createWorldDancePartyState(bpm = 128): WorldDancePartyState {
  return {
    slots: [],
    jumbotronFanId: null,
    lastSpotlightAt: 0,
    djSpotlightEnabled: true,
    currentBpm: bpm,
    crossfaderSyncActive: true,
  };
}

export function addDancerSlot(
  prev: WorldDancePartyState,
  slot: Omit<DancerSlot, 'onJumbotron' | 'ignitionActive'>,
): WorldDancePartyState {
  const hydrated: DancerSlot = {
    ...slot,
    onJumbotron: false,
    ignitionActive: slot.motionHeat >= IGNITION_MOTION_THRESHOLD,
  };
  return { ...prev, slots: [...prev.slots, hydrated] };
}

export function removeDancerSlot(prev: WorldDancePartyState, fanId: string): WorldDancePartyState {
  const slots = prev.slots.filter((s) => s.fanId !== fanId);
  const jumbotronFanId = prev.jumbotronFanId === fanId ? null : prev.jumbotronFanId;
  return { ...prev, slots, jumbotronFanId };
}

/** Fan toggles their camera on/off */
export function setFanCameraMode(
  prev: WorldDancePartyState,
  fanId: string,
  cameraEnabled: boolean,
  videoMode: FanVideoMode,
): WorldDancePartyState {
  return {
    ...prev,
    slots: prev.slots.map((s) =>
      s.fanId === fanId ? { ...s, cameraEnabled, videoMode } : s,
    ),
  };
}

/** Tick motion heat for all slots and update ignition states */
export function tickDanceFloor(
  prev: WorldDancePartyState,
  heatUpdates: Array<{ fanId: string; motionHeat: number }>,
  nowMs = Date.now(),
): WorldDancePartyState {
  const updatedSlots = prev.slots.map((slot) => {
    const patch = heatUpdates.find((u) => u.fanId === slot.fanId);
    if (!patch) return slot;
    return {
      ...slot,
      motionHeat: patch.motionHeat,
      ignitionActive: patch.motionHeat >= IGNITION_MOTION_THRESHOLD,
    };
  });

  // Auto-clear Jumbotron after hold duration
  let jumbotronFanId = prev.jumbotronFanId;
  if (jumbotronFanId && nowMs - prev.lastSpotlightAt > SPOTLIGHT_HOLD_MS) {
    jumbotronFanId = null;
  }

  const finalSlots = updatedSlots.map((s) => ({ ...s, onJumbotron: s.fanId === jumbotronFanId }));

  return { ...prev, slots: finalSlots, jumbotronFanId };
}

/**
 * DJ Spotlight Bot — finds the highest-motion fan with camera enabled and
 * puts them on the Jumbotron. Subject to cooldown.
 */
export function djSpotlight(
  prev: WorldDancePartyState,
  nowMs = Date.now(),
): WorldDancePartyState {
  if (!prev.djSpotlightEnabled) return prev;
  if (nowMs - prev.lastSpotlightAt < SPOTLIGHT_COOLDOWN_MS) return prev;

  const candidates = prev.slots.filter((s) => s.cameraEnabled && s.videoMode !== 'avatar-only');
  if (candidates.length === 0) return prev;

  const top = candidates.reduce<DancerSlot | null>((best, s) => {
    if (!best || s.motionHeat > best.motionHeat) return s;
    return best;
  }, null);

  if (!top) return prev;

  const slots = prev.slots.map((s) => ({ ...s, onJumbotron: s.fanId === top.fanId }));
  return { ...prev, slots, jumbotronFanId: top.fanId, lastSpotlightAt: nowMs };
}

/** DJ fires a crossfader cut — triggers flash pulse on all active glow frames */
export function fireCrossfaderSync(prev: WorldDancePartyState): WorldDancePartyState {
  // Toggle sync signal (consumers read this as a one-shot pulse)
  return { ...prev, crossfaderSyncActive: !prev.crossfaderSyncActive };
}

/** Update current BPM (drives avatar animation speed across all slots) */
export function setBpm(prev: WorldDancePartyState, bpm: number): WorldDancePartyState {
  return { ...prev, currentBpm: Math.max(60, Math.min(200, bpm)) };
}

/** Returns slots sorted by motion heat descending — for Director mosaic priority */
export function getRankedDancers(state: WorldDancePartyState): DancerSlot[] {
  return [...state.slots].sort((a, b) => b.motionHeat - a.motionHeat);
}

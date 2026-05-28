/**
 * CrowdRhythmEngine
 * The physical heartbeat of the venue.
 *
 * Avatars are not just socially aware — they physically feel the beat.
 * This engine governs per-avatar sway, bob, clap timing, shoulder bounce,
 * idle breathing cadence, and music-reactive motion, synchronized to the
 * BPM from WorldStateReplicator with organic human-variance drift.
 *
 * Without rhythm, a crowd is mentally alive but physically robotic.
 * This is the system that closes that gap.
 */

import { getWorldState, subscribeWorldState } from './WorldStateReplicator';
import { universalNow } from './UniversalClockRuntime';

// ── Types ─────────────────────────────────────────────────────────────────────

export type RhythmStyle =
  | 'headbob'          // vertical head nod, minimal body movement
  | 'sway'             // lateral torso sway, feet planted
  | 'shoulder-roll'    // alternating shoulder elevation
  | 'full-dance'       // high-amplitude full-body movement
  | 'clap'             // beat-synchronized clapping
  | 'breathing';       // ambient idle, not beat-synced

export interface RhythmTransform {
  translateY: number;    // pixels or units — vertical bob
  translateX: number;    // horizontal sway
  rotateZ: number;       // subtle lean angle (degrees)
  scaleX: number;        // shoulder width pulse
  scaleY: number;        // body compression on beat
  opacity: number;       // 1.0 for all rhythm states
}

export interface AvatarRhythmProfile {
  avatarId: string;
  style: RhythmStyle;
  phaseOffset: number;   // 0–1 — where in the beat this avatar naturally lands
  amplitudeScale: number; // 0.5–1.5 — individual expressiveness
  driftRate: number;      // how fast this avatar drifts off-beat (0.001–0.01)
  currentDrift: number;   // accumulated drift from the canonical beat
  lastSyncAt: number;     // last time this avatar was re-synced to the beat
  energy: number;         // current motion energy (0–1)
}

export interface RhythmSnapshot {
  bpm: number;
  beatPhase: number;     // 0–1
  msPerBeat: number;
  crowdEnergy: number;
  syncedAvatars: number;
  driftedAvatars: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DRIFT_RESYNC_THRESHOLD = 0.15;   // drift > 0.15 → resync on next drop
const BREATHING_PERIOD_MS = 4_200;     // resting breath cycle
const CLAP_WINDOW_MS = 80;             // how close to beat landing counts as "on-beat"
const MAX_DRIFT = 0.25;

// Style amplitude configs
const STYLE_AMPLITUDES: Record<RhythmStyle, { y: number; x: number; r: number; sy: number; sx: number }> = {
  headbob:       { y: 3,  x: 0,   r: 0,   sy: 0.02, sx: 0.00 },
  sway:          { y: 1,  x: 5,   r: 2,   sy: 0.01, sx: 0.02 },
  'shoulder-roll': { y: 2, x: 2,  r: 3,   sy: 0.02, sx: 0.03 },
  'full-dance':  { y: 6,  x: 8,   r: 5,   sy: 0.05, sx: 0.04 },
  clap:          { y: 2,  x: 0,   r: 0,   sy: 0.03, sx: 0.01 },
  breathing:     { y: 1.5, x: 0.5, r: 0.3, sy: 0.01, sx: 0.00 },
};

// ── State ─────────────────────────────────────────────────────────────────────

const profiles = new Map<string, AvatarRhythmProfile>();
let currentBpm = 128;
let rhythmRunning = false;
let rhythmFrameId: ReturnType<typeof setTimeout> | null = null;
const rhythmHandlers = new Set<(snapshots: Map<string, RhythmTransform>) => void>();

// ── Beat math ─────────────────────────────────────────────────────────────────

function msPerBeat(bpm: number): number {
  return 60_000 / bpm;
}

/**
 * Canonical beat phase 0–1 at the given timestamp, for the given BPM.
 * Phase 0 = beat landing, 0.5 = midpoint.
 */
function canonicalPhase(nowMs: number, bpm: number): number {
  return (nowMs % msPerBeat(bpm)) / msPerBeat(bpm);
}

/**
 * Each avatar has a personal phase = canonical + offset + drift.
 * Drift accumulates slowly over time; a drop event resets it.
 */
function avatarPhase(profile: AvatarRhythmProfile, nowMs: number, bpm: number): number {
  const base = canonicalPhase(nowMs, bpm);
  const personal = (base + profile.phaseOffset + profile.currentDrift) % 1;
  return personal < 0 ? personal + 1 : personal;
}

/**
 * Map beat phase (0–1) and style to a transform.
 * Each style has a characteristic waveform.
 */
function phaseToTransform(
  phase: number,
  style: RhythmStyle,
  amplitude: number,
  energy: number,
): RhythmTransform {
  const amp = STYLE_AMPLITUDES[style];
  const eff = amplitude * Math.max(0.3, energy);  // energy gates amplitude

  // Primary waveform per style
  let yWave = 0, xWave = 0, rWave = 0;

  switch (style) {
    case 'headbob':
      // Sharp downward bob on beat, smooth recovery
      yWave = -Math.abs(Math.sin(phase * Math.PI * 2)) * amp.y * eff;
      break;
    case 'sway':
      // Sinusoidal side-to-side, one full swing per beat
      xWave = Math.sin(phase * Math.PI * 2) * amp.x * eff;
      rWave = Math.sin(phase * Math.PI * 2) * amp.r * eff;
      break;
    case 'shoulder-roll':
      // Left shoulder up on 1, right shoulder up on 3 (half-beat alternation)
      rWave = Math.sin(phase * Math.PI * 4) * amp.r * eff;
      yWave = Math.sin(phase * Math.PI * 2) * amp.y * eff * 0.5;
      xWave = Math.sin(phase * Math.PI * 4) * amp.x * eff * 0.3;
      break;
    case 'full-dance':
      // Complex: compound sine at 2× and base frequency
      yWave = (Math.sin(phase * Math.PI * 2) * 0.6 + Math.sin(phase * Math.PI * 4) * 0.4) * amp.y * eff;
      xWave = Math.sin(phase * Math.PI * 2 + 0.3) * amp.x * eff;
      rWave = Math.sin(phase * Math.PI * 2 + 0.5) * amp.r * eff;
      break;
    case 'clap':
      // Sharp forward-lean on each beat, quick recovery
      yWave = -Math.pow(Math.abs(Math.sin(phase * Math.PI)), 4) * amp.y * eff;
      break;
    case 'breathing':
      // Slow, low-amplitude, independent of BPM
      yWave = -Math.sin((universalNow() / BREATHING_PERIOD_MS) * Math.PI * 2) * amp.y * eff;
      break;
  }

  const scaleY = 1 - Math.abs(yWave) * amp.sy;
  const scaleX = 1 + Math.abs(xWave) * amp.sx;

  return {
    translateY: yWave,
    translateX: xWave,
    rotateZ: rWave,
    scaleX, scaleY,
    opacity: 1,
  };
}

// ── Profile management ────────────────────────────────────────────────────────

export function initAvatarRhythm(
  avatarId: string,
  opts?: Partial<Pick<AvatarRhythmProfile, 'style' | 'amplitudeScale' | 'phaseOffset'>>,
): AvatarRhythmProfile {
  const style: RhythmStyle = opts?.style ?? pickDefaultStyle(avatarId);
  const profile: AvatarRhythmProfile = {
    avatarId,
    style,
    phaseOffset: opts?.phaseOffset ?? Math.random() * 0.08 - 0.04, // ±4% natural offset
    amplitudeScale: opts?.amplitudeScale ?? 0.8 + Math.random() * 0.4,
    driftRate: 0.001 + Math.random() * 0.005,
    currentDrift: 0,
    lastSyncAt: universalNow(),
    energy: 0.5,
  };
  profiles.set(avatarId, profile);
  return profile;
}

function pickDefaultStyle(avatarId: string): RhythmStyle {
  // Deterministic from avatarId so style is stable across renders
  const n = avatarId.charCodeAt(avatarId.length - 1) % 5;
  const styles: RhythmStyle[] = ['headbob', 'sway', 'shoulder-roll', 'full-dance', 'clap'];
  return styles[n]!;
}

export function setAvatarRhythmEnergy(avatarId: string, energy: number): void {
  const p = profiles.get(avatarId);
  if (p) profiles.set(avatarId, { ...p, energy: Math.max(0, Math.min(1, energy)) });
}

export function setAvatarStyle(avatarId: string, style: RhythmStyle): void {
  const p = profiles.get(avatarId) ?? initAvatarRhythm(avatarId, { style });
  profiles.set(avatarId, { ...p, style });
}

// ── Drop sync ─────────────────────────────────────────────────────────────────

/**
 * On a drop event, forcibly re-sync all drifted avatars to the canonical beat.
 * Avatars with high energy get tighter sync; low-energy avatars drift faster again.
 */
export function onDropSync(avatarIds?: string[]): void {
  const targets = avatarIds ?? [...profiles.keys()];
  for (const id of targets) {
    const p = profiles.get(id);
    if (!p) continue;
    if (Math.abs(p.currentDrift) > DRIFT_RESYNC_THRESHOLD || avatarIds) {
      profiles.set(id, {
        ...p,
        currentDrift: 0,
        lastSyncAt: universalNow(),
        // Drop boosts energy temporarily
        energy: Math.min(1, p.energy + 0.25),
      });
    }
  }
}

// ── Rhythm tick ───────────────────────────────────────────────────────────────

function rhythmTick(): void {
  if (!rhythmRunning) return;

  const now = universalNow();
  const worldState = getWorldState();
  const bpm = worldState.vibeConfig.bpm ?? currentBpm;
  currentBpm = bpm;

  const transforms = new Map<string, RhythmTransform>();

  for (const [id, profile] of profiles) {
    // Accumulate drift
    const dayFrac = (now - profile.lastSyncAt) / 1000;  // seconds, not days
    const newDrift = Math.min(MAX_DRIFT, Math.abs(profile.currentDrift + profile.driftRate * dayFrac * 0.1))
      * Math.sign(profile.currentDrift || 1);

    const updatedProfile: AvatarRhythmProfile = { ...profile, currentDrift: newDrift };
    profiles.set(id, updatedProfile);

    const phase = avatarPhase(updatedProfile, now, bpm);
    const transform = phaseToTransform(phase, updatedProfile.style, updatedProfile.amplitudeScale, updatedProfile.energy);
    transforms.set(id, transform);
  }

  for (const h of rhythmHandlers) {
    try { h(transforms); } catch { /* ignore */ }
  }

  // ~60fps rhythm tick
  rhythmFrameId = setTimeout(rhythmTick, 16);
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export function startRhythmEngine(): void {
  if (rhythmRunning) return;
  rhythmRunning = true;

  // Sync BPM when world state changes
  subscribeWorldState((ws) => {
    if (ws.vibeConfig.bpm) currentBpm = ws.vibeConfig.bpm;
  });

  rhythmTick();
}

export function stopRhythmEngine(): void {
  rhythmRunning = false;
  if (rhythmFrameId) { clearTimeout(rhythmFrameId); rhythmFrameId = null; }
}

export function onRhythmFrame(handler: (transforms: Map<string, RhythmTransform>) => void): () => void {
  rhythmHandlers.add(handler);
  return () => rhythmHandlers.delete(handler);
}

// ── Query API ─────────────────────────────────────────────────────────────────

/**
 * Get the current transform for a single avatar — for use in render loops.
 */
export function getAvatarTransform(avatarId: string, bpmOverride?: number): RhythmTransform {
  const profile = profiles.get(avatarId) ?? initAvatarRhythm(avatarId);
  const bpm = bpmOverride ?? currentBpm;
  const phase = avatarPhase(profile, universalNow(), bpm);
  return phaseToTransform(phase, profile.style, profile.amplitudeScale, profile.energy);
}

/**
 * Seed the rhythm engine with a set of avatar IDs.
 * Call once when a room populates.
 */
export function seedRoomRhythm(avatarIds: string[], bpm?: number): void {
  if (bpm) currentBpm = bpm;
  for (const id of avatarIds) {
    if (!profiles.has(id)) initAvatarRhythm(id);
  }
}

export function getRhythmSnapshot(avatarIds: string[]): RhythmSnapshot {
  const now = universalNow();
  const bpm = currentBpm;
  let synced = 0, drifted = 0;

  for (const id of avatarIds) {
    const p = profiles.get(id);
    if (!p) continue;
    if (Math.abs(p.currentDrift) < DRIFT_RESYNC_THRESHOLD) synced++;
    else drifted++;
  }

  const worldState = getWorldState();
  return {
    bpm,
    beatPhase: canonicalPhase(now, bpm),
    msPerBeat: msPerBeat(bpm),
    crowdEnergy: worldState.vibeConfig.crowdEnergy,
    syncedAvatars: synced,
    driftedAvatars: drifted,
  };
}

export function getRhythmProfile(avatarId: string): AvatarRhythmProfile | undefined {
  return profiles.get(avatarId);
}

'use client';

/**
 * CrowdAttentionEngine
 * Shared gaze is what separates a crowd from a collection of individuals.
 *
 * Controls where every avatar's attention is directed at any given moment —
 * head turns, performer focus, reaction orientation, synchronized gaze shifts,
 * applause direction, and crowd-wave propagation.
 *
 * Attention is contagious. When one avatar in a cluster turns, neighbors follow
 * within 80–300ms, with a probability proportional to their bond strength.
 */

import { universalNow } from './UniversalClockRuntime';
import { getTopBonds } from './EmotionalMemoryEngine';

interface BondLike {
  toUserId: string;
  strength: number;
}

function isBondLike(value: unknown): value is BondLike {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { toUserId?: unknown; strength?: unknown };
  return typeof candidate.toUserId === 'string' && typeof candidate.strength === 'number';
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type AttentionTarget =
  | { kind: 'performer'; performerId: string }
  | { kind: 'avatar';    avatarId: string }
  | { kind: 'stage' }
  | { kind: 'event';     eventId: string; position: Vec2 }
  | { kind: 'idle' };

export interface Vec2 { x: number; y: number; }

export interface AttentionState {
  avatarId: string;
  target: AttentionTarget;
  headYaw: number;        // -1 (full left) → 0 (stage) → 1 (full right)
  headPitch: number;      // -1 (down) → 0 (level) → 1 (up)
  intensity: number;      // 0–1 how locked-in the attention is
  lockedUntil: number;    // timestamp — attention can't be redirected before this
  updatedAt: number;
}

export interface AttentionVector {
  avatarId: string;
  yaw: number;
  pitch: number;
  intensity: number;
  targetLabel: string;
}

export type CrowdWaveDirection = 'left-to-right' | 'right-to-left' | 'front-to-back' | 'back-to-front' | 'radial-out';

export interface WaveEvent {
  id: string;
  direction: CrowdWaveDirection;
  originAvatarId: string;
  startedAt: number;
  propagationMs: number;   // how long each hop takes
  intensity: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MIN_LOCK_MS = 200;
const MAX_LOCK_MS = 8_000;
const IDLE_REPOINT_INTERVAL_MS = 3_000;
const CONTAGION_BASE_DELAY_MS = 120;
const CONTAGION_VARIANCE_MS = 180;
const APPLAUSE_DURATION_MS = 4_000;
const WAVE_HOP_MS = 180;

// ── State ─────────────────────────────────────────────────────────────────────

const attentionMap = new Map<string, AttentionState>();
const activeWaves = new Map<string, WaveEvent>();
const attentionHandlers = new Set<(vectors: AttentionVector[]) => void>();
let roomAvatarIndex = new Map<string, string[]>(); // roomId → avatarIds

// ── Helpers ───────────────────────────────────────────────────────────────────

function waveId(): string {
  return `wave-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

function targetToYaw(target: AttentionTarget, avatarId: string): number {
  switch (target.kind) {
    case 'stage':
    case 'performer': return 0;  // center-stage
    case 'event':     return Math.max(-1, Math.min(1, (target.position.x - 0.5) * 2));
    case 'avatar':    return (Math.random() - 0.5) * 0.6; // slight offset toward neighbor
    case 'idle':      return (Math.random() - 0.5) * 1.4;
    default: return 0;
  }
}

function targetToLabel(target: AttentionTarget): string {
  switch (target.kind) {
    case 'stage':     return 'stage';
    case 'performer': return `performer:${target.performerId}`;
    case 'avatar':    return `avatar:${target.avatarId}`;
    case 'event':     return `event:${target.eventId}`;
    case 'idle':      return 'idle';
  }
}

function getOrCreate(avatarId: string): AttentionState {
  if (!attentionMap.has(avatarId)) {
    attentionMap.set(avatarId, {
      avatarId,
      target: { kind: 'stage' },
      headYaw: 0, headPitch: 0,
      intensity: 0.5,
      lockedUntil: 0,
      updatedAt: universalNow(),
    });
  }
  return attentionMap.get(avatarId)!;
}

function emitVectors(avatarIds: string[]): void {
  if (!attentionHandlers.size) return;
  const vectors = avatarIds.map((id) => {
    const s = attentionMap.get(id);
    if (!s) return null;
    return {
      avatarId: id,
      yaw: s.headYaw,
      pitch: s.headPitch,
      intensity: s.intensity,
      targetLabel: targetToLabel(s.target),
    } satisfies AttentionVector;
  }).filter(Boolean) as AttentionVector[];
  for (const h of attentionHandlers) {
    try { h(vectors); } catch { /* ignore */ }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Direct one avatar's attention to a target.
 * Lock duration scales with intensity — a performer drop locks for up to 8s.
 */
export function directAttention(
  avatarId: string,
  target: AttentionTarget,
  intensity = 0.7,
  lockMs?: number,
): AttentionState {
  const now = universalNow();
  const existing = getOrCreate(avatarId);

  if (existing.lockedUntil > now && intensity < existing.intensity) {
    return existing;  // can't override a stronger lock
  }

  const lock = lockMs ?? Math.round(MIN_LOCK_MS + intensity * (MAX_LOCK_MS - MIN_LOCK_MS));
  const yaw = targetToYaw(target, avatarId);
  const pitch = target.kind === 'performer' ? 0.15 : target.kind === 'idle' ? -0.1 : 0;

  const state: AttentionState = {
    ...existing,
    target, headYaw: yaw, headPitch: pitch,
    intensity, lockedUntil: now + lock, updatedAt: now,
  };
  attentionMap.set(avatarId, state);
  emitVectors([avatarId]);
  return state;
}

/**
 * Focus the entire room on the stage/performer.
 * Used on drop, crowd surge, legendary detection.
 * Social bonds create micro-delays — bonded groups turn together.
 */
export function focusRoomOnStage(
  roomId: string,
  avatarIds: string[],
  performerId?: string,
  intensity = 0.9,
): void {
  roomAvatarIndex.set(roomId, avatarIds);
  const now = Date.now();
  const target: AttentionTarget = performerId
    ? { kind: 'performer', performerId }
    : { kind: 'stage' };

  // Group by bond clusters — bonded avatars turn within 50ms of each other
  const alreadyScheduled = new Set<string>();
  const delays: Array<{ avatarId: string; delayMs: number }> = [];

  for (const id of avatarIds) {
    if (alreadyScheduled.has(id)) continue;
    const baseDelay = Math.random() * 200;  // 0–200ms organic spread
    delays.push({ avatarId: id, delayMs: baseDelay });
    alreadyScheduled.add(id);

    // Pull bonded neighbors into the same attention wave, slightly after
    const bonds = getTopBonds(id, 3).filter(isBondLike);
    for (const bond of bonds) {
      const partnerId = bond.toUserId;
      if (alreadyScheduled.has(partnerId) || !avatarIds.includes(partnerId)) continue;
      const bondDelay = baseDelay + 20 + Math.random() * 60;  // tight cluster timing
      delays.push({ avatarId: partnerId, delayMs: bondDelay });
      alreadyScheduled.add(partnerId);
    }
  }

  for (const { avatarId, delayMs } of delays) {
    setTimeout(() => {
      directAttention(avatarId, target, intensity, 5_000 + Math.random() * 3_000);
    }, delayMs);
  }
}

/**
 * Applause direction — all avatars orient toward stage for APPLAUSE_DURATION_MS.
 * Intensity modulated by bond proximity (front clusters clap harder).
 */
export function triggerApplause(avatarIds: string[], intensity = 0.85): void {
  const base = intensity;
  for (let i = 0; i < avatarIds.length; i++) {
    const id = avatarIds[i]!;
    // Avatars at lower index (front rows) clap with higher intensity
    const rowFactor = 1 - (i / avatarIds.length) * 0.3;
    const clampedIntensity = Math.min(1, base * rowFactor);
    const jitter = Math.random() * 150;
    setTimeout(() => {
      directAttention(id, { kind: 'stage' }, clampedIntensity, APPLAUSE_DURATION_MS);
    }, jitter);
  }
}

/**
 * Crowd wave — attention propagates in a direction, each row delayed by WAVE_HOP_MS.
 * Avatars sorted by position in the wave direction; each group turns in sequence.
 */
export function triggerCrowdWave(
  avatarIds: string[],
  direction: CrowdWaveDirection,
  originAvatarId: string,
): WaveEvent {
  const wave: WaveEvent = {
    id: waveId(), direction, originAvatarId,
    startedAt: Date.now(), propagationMs: WAVE_HOP_MS, intensity: 0.7,
  };
  activeWaves.set(wave.id, wave);

  // Simple row-based propagation: avatarIds assumed ordered by position
  const groups = chunkBy(avatarIds, 5);  // 5 avatars per "row"
  let cumDelay = 0;
  for (const group of groups) {
    const delay = cumDelay;
    setTimeout(() => {
      for (const id of group) {
        const jitter = Math.random() * 60;
        setTimeout(() => {
          directAttention(id, { kind: 'stage' }, wave.intensity, 800);
        }, jitter);
      }
    }, delay);
    cumDelay += WAVE_HOP_MS;
  }

  // Clean up wave after propagation completes
  setTimeout(() => activeWaves.delete(wave.id), cumDelay + 1_000);
  return wave;
}

/**
 * Contagion: when avatar A looks at something interesting,
 * nearby bonded avatars follow with a probabilistic delay.
 */
export function propagateAttentionContagion(
  triggerAvatarId: string,
  target: AttentionTarget,
  intensity: number,
  roomAvatarIds: string[],
): void {
  const bonds = getTopBonds(triggerAvatarId, 6).filter(isBondLike);
  for (const bond of bonds) {
    const partnerId = bond.toUserId;
    if (!roomAvatarIds.includes(partnerId)) continue;

    // Probability scales with bond strength
    if (Math.random() > bond.strength * 0.8) continue;

    const delay = CONTAGION_BASE_DELAY_MS + Math.random() * CONTAGION_VARIANCE_MS;
    const reducedIntensity = intensity * (0.6 + bond.strength * 0.4);

    setTimeout(() => {
      directAttention(partnerId, target, reducedIntensity);
    }, delay);
  }
}

/**
 * Idle drift — avatars not locked onto anything look around naturally.
 * Called by the energy simulation tick.
 */
export function applyIdleDrift(avatarIds: string[], roomId: string): void {
  const now = universalNow();
  for (const id of avatarIds) {
    const state = getOrCreate(id);
    if (state.lockedUntil > now) continue;  // still locked, skip

    // Every IDLE_REPOINT_INTERVAL_MS, pick a new idle direction
    const msSinceLast = now - state.updatedAt;
    if (msSinceLast < IDLE_REPOINT_INTERVAL_MS) continue;

    // 70% chance to look at stage, 30% to look idle (social glance)
    const target: AttentionTarget = Math.random() > 0.3
      ? { kind: 'stage' }
      : { kind: 'idle' };
    directAttention(id, target, 0.3 + Math.random() * 0.3, 500 + Math.random() * 2_000);
  }
  void roomId;  // available for spatial sorting in future
}

// ── Registration + Query ──────────────────────────────────────────────────────

export function getAttentionState(avatarId: string): AttentionState {
  return getOrCreate(avatarId);
}

export function getRoomAttentionVectors(avatarIds: string[]): AttentionVector[] {
  return avatarIds.map((id) => {
    const s = getOrCreate(id);
    return {
      avatarId: id,
      yaw: s.headYaw,
      pitch: s.headPitch,
      intensity: s.intensity,
      targetLabel: targetToLabel(s.target),
    };
  });
}

export function onAttentionUpdate(handler: (vectors: AttentionVector[]) => void): () => void {
  attentionHandlers.add(handler);
  return () => attentionHandlers.delete(handler);
}

export function getAttentionStats(avatarIds: string[]): {
  stagePercent: number;
  idlePercent: number;
  avgIntensity: number;
  activeWaveCount: number;
} {
  const states = avatarIds.map(getOrCreate);
  const stageCount = states.filter((s) => s.target.kind === 'stage' || s.target.kind === 'performer').length;
  const idleCount = states.filter((s) => s.target.kind === 'idle').length;
  const avgIntensity = states.reduce((acc, s) => acc + s.intensity, 0) / (states.length || 1);
  return {
    stagePercent: Math.round((stageCount / (states.length || 1)) * 100),
    idlePercent: Math.round((idleCount / (states.length || 1)) * 100),
    avgIntensity: Math.round(avgIntensity * 100) / 100,
    activeWaveCount: activeWaves.size,
  };
}

// ── Utility ───────────────────────────────────────────────────────────────────

function chunkBy<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

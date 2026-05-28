/**
 * BeatPhaseRecovery
 * Calculates the exact beat phase a rejoining user should be on
 * so their lights, crowd sway, camera cuts, and emotes sync
 * to the room's live rhythm — not start from zero.
 *
 * This is what makes the world feel uninterrupted.
 */

import { universalNow } from './UniversalClockRuntime';
import { getWorldState } from './WorldStateReplicator';

export interface BeatPhaseSnapshot {
  capturedAt: number;    // UTC ms when beat phase was last authoritatively recorded
  phase: number;         // 0–1 at capturedAt
  bpm: number;
}

export interface RejoinBeatAlignment {
  currentPhase: number;      // 0–1 — where the beat is RIGHT NOW
  msUntilNextBeat: number;   // ms until phase wraps to 0
  msUntilHalfBeat: number;   // ms until next half-beat (upbeat)
  suggestedEntryPhase: number; // best phase to enter at (next clean beat boundary)
  entryDelayMs: number;      // how long to buffer before joining the stream
  bpm: number;
  confidence: 'exact' | 'estimated';
}

// Store of last-known authoritative beat phases per room
const roomPhaseSnapshots = new Map<string, BeatPhaseSnapshot>();

// Global fallback (when no room-specific snapshot exists)
let globalSnapshot: BeatPhaseSnapshot | null = null;

export function recordBeatPhase(roomId: string, phase: number, bpm: number): void {
  const snap: BeatPhaseSnapshot = { capturedAt: universalNow(), phase, bpm };
  roomPhaseSnapshots.set(roomId, snap);
  globalSnapshot = snap;  // always update global fallback
}

function interpolatePhase(snapshot: BeatPhaseSnapshot, nowMs: number): number {
  const elapsed = nowMs - snapshot.capturedAt;
  const beatMs = (60 / snapshot.bpm) * 1000;
  const phaseAdvance = (elapsed % beatMs) / beatMs;
  return (snapshot.phase + phaseAdvance) % 1;
}

export function computeRejoinAlignment(roomId: string): RejoinBeatAlignment {
  const now = universalNow();
  const snap = roomPhaseSnapshots.get(roomId) ?? globalSnapshot;
  const world = getWorldState();
  const bpm = world.vibeConfig.bpm;

  if (!snap) {
    // No phase data at all — estimate from universal clock
    const beatMs = (60 / bpm) * 1000;
    const phase = (now % beatMs) / beatMs;
    const msUntilNextBeat = beatMs - (now % beatMs);
    return {
      currentPhase: phase,
      msUntilNextBeat,
      msUntilHalfBeat: msUntilNextBeat < beatMs / 2 ? msUntilNextBeat + beatMs / 2 : msUntilNextBeat - beatMs / 2,
      suggestedEntryPhase: 0,
      entryDelayMs: msUntilNextBeat,
      bpm,
      confidence: 'estimated',
    };
  }

  const currentPhase = interpolatePhase(snap, now);
  const beatMs = (60 / snap.bpm) * 1000;
  const currentBeatMs = currentPhase * beatMs;
  const msUntilNextBeat = beatMs - currentBeatMs;
  const msUntilHalfBeat = currentPhase < 0.5
    ? (0.5 - currentPhase) * beatMs
    : (1.5 - currentPhase) * beatMs;

  // Suggest entry at the next clean beat boundary (phase = 0)
  // Buffer: at least 50ms, at most one full beat
  const entryDelayMs = Math.max(50, Math.min(msUntilNextBeat, beatMs));

  return {
    currentPhase,
    msUntilNextBeat,
    msUntilHalfBeat,
    suggestedEntryPhase: 0,
    entryDelayMs,
    bpm: snap.bpm,
    confidence: 'exact',
  };
}

// ── Per-avatar beat energy ────────────────────────────────────────────────────
// Maps beat phase to animation intensity for crowd sway / bob

export function beatPhaseToAvatarEnergy(phase: number, baseEnergy: number): number {
  // Peak at beat (0 / 1) and half-beat (0.5); dip between
  const beatPulse = Math.cos(phase * 2 * Math.PI) * 0.5 + 0.5;
  return Math.max(0, Math.min(1, baseEnergy * 0.6 + beatPulse * baseEnergy * 0.4));
}

// Returns CSS transform values for avatar bob animation at given beat phase
export function beatPhaseToTransform(phase: number, intensity: number): { translateY: number; scaleX: number; scaleY: number } {
  const beatPulse = Math.sin(phase * Math.PI * 2);
  return {
    translateY: beatPulse * intensity * 4,     // px — up/down bob
    scaleX: 1 + beatPulse * intensity * 0.02,  // subtle width pulse
    scaleY: 1 - beatPulse * intensity * 0.02,  // inverse height pulse
  };
}

export function getRoomPhaseSnapshot(roomId: string): BeatPhaseSnapshot | null {
  return roomPhaseSnapshots.get(roomId) ?? globalSnapshot ?? null;
}

export function clearRoomPhase(roomId: string): void {
  roomPhaseSnapshots.delete(roomId);
}

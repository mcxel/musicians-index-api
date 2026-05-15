/**
 * Laughter Frequency Monitor — Comedy event detection for Joke-Off battles.
 * Listens to crowd audio frequency profile to detect punchline hits.
 * Drives Ignition Frame triggers and Reaction-View camera cuts.
 */

export type ComedySignalLevel = 'silence' | 'chuckle' | 'laugh' | 'roar';

export interface CrowdAudioSnapshot {
  /** RMS energy of the crowd mic mix, 0–100 */
  rmsEnergy: number;
  /** Spectral centroid of the crowd audio — laughter skews high (1000–3000Hz range mapped 0–100) */
  spectralCentroid: number;
  /** Burst duration in ms — short bursts = chuckle, sustained = roar */
  burstDurationMs: number;
}

export interface LaughterEvent {
  level: ComedySignalLevel;
  triggeredAt: number;
  performerFeedId: string;
  intensityScore: number; // 0–100, drives ignition glow intensity
}

export interface LaughterMonitorState {
  performerFeedId: string;
  lastEvent: LaughterEvent | null;
  currentLevel: ComedySignalLevel;
  ignitionTriggered: boolean;
  reactionCutTriggered: boolean;
  eventHistory: LaughterEvent[];
  lastEventAt: number;
}

// Thresholds for classifying the crowd signal
const CHUCKLE_RMS = 20;
const LAUGH_RMS = 45;
const ROAR_RMS = 72;
const LAUGH_SPECTRAL_MIN = 40; // laughter has bright/high spectral energy
const ROAR_MIN_BURST_MS = 600;

// Ignition fires on a roar or sustained laugh above this intensity
const IGNITION_THRESHOLD = 65;
// Reaction-view cut fires on roar
const REACTION_CUT_THRESHOLD = 80;
// Minimum ms between registered events to avoid double-counting
const EVENT_DEBOUNCE_MS = 1200;

export function classifyLaughter(snapshot: CrowdAudioSnapshot): ComedySignalLevel {
  const { rmsEnergy, spectralCentroid, burstDurationMs } = snapshot;

  if (rmsEnergy < CHUCKLE_RMS) return 'silence';
  if (rmsEnergy >= ROAR_RMS && spectralCentroid >= LAUGH_SPECTRAL_MIN && burstDurationMs >= ROAR_MIN_BURST_MS) return 'roar';
  if (rmsEnergy >= LAUGH_RMS && spectralCentroid >= LAUGH_SPECTRAL_MIN) return 'laugh';
  return 'chuckle';
}

function computeIntensity(snapshot: CrowdAudioSnapshot, level: ComedySignalLevel): number {
  const base = snapshot.rmsEnergy;
  const spectralBoost = Math.max(0, snapshot.spectralCentroid - LAUGH_SPECTRAL_MIN) * 0.3;
  const durationBoost = level === 'roar' ? Math.min(20, snapshot.burstDurationMs / 100) : 0;
  return Math.min(100, base + spectralBoost + durationBoost);
}

export function createLaughterMonitorState(performerFeedId: string): LaughterMonitorState {
  return {
    performerFeedId,
    lastEvent: null,
    currentLevel: 'silence',
    ignitionTriggered: false,
    reactionCutTriggered: false,
    eventHistory: [],
    lastEventAt: 0,
  };
}

/**
 * Tick the monitor with a fresh crowd audio snapshot.
 * Returns updated state with ignitionTriggered / reactionCutTriggered flags.
 * Consumers should reset these flags after consuming them.
 */
export function tickLaughterMonitor(
  prev: LaughterMonitorState,
  snapshot: CrowdAudioSnapshot,
  nowMs = Date.now(),
): LaughterMonitorState {
  const level = classifyLaughter(snapshot);
  const intensity = computeIntensity(snapshot, level);

  const canRegister = level !== 'silence' && nowMs - prev.lastEventAt > EVENT_DEBOUNCE_MS;

  if (!canRegister) {
    return { ...prev, currentLevel: level, ignitionTriggered: false, reactionCutTriggered: false };
  }

  const event: LaughterEvent = {
    level,
    triggeredAt: nowMs,
    performerFeedId: prev.performerFeedId,
    intensityScore: intensity,
  };

  const ignitionTriggered = intensity >= IGNITION_THRESHOLD;
  const reactionCutTriggered = intensity >= REACTION_CUT_THRESHOLD;

  return {
    ...prev,
    currentLevel: level,
    lastEvent: event,
    ignitionTriggered,
    reactionCutTriggered,
    lastEventAt: nowMs,
    eventHistory: [...prev.eventHistory.slice(-49), event], // keep last 50
  };
}

/** Reset one-shot trigger flags after the consumer has acted on them. */
export function clearLaughterTriggers(prev: LaughterMonitorState): LaughterMonitorState {
  return { ...prev, ignitionTriggered: false, reactionCutTriggered: false };
}

/** Returns the performer's "hot streak" score based on recent event history (last 10 events). */
export function computeComedyStreakScore(state: LaughterMonitorState): number {
  const recent = state.eventHistory.slice(-10);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, e) => sum + e.intensityScore, 0) / recent.length;
}

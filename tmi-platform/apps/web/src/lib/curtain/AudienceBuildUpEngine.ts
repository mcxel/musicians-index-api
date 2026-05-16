/**
 * AudienceBuildUpEngine
 * Manages the pre-show audience anticipation arc.
 * Drives crowd energy, silhouette density, ambient audio cues, and countdown state.
 */

export type AudienceBuildPhase =
  | "empty"
  | "trickling_in"
  | "gathering"
  | "buzzing"
  | "electric"
  | "peak_anticipation";

export interface AudienceBuildState {
  roomId: string;
  phase: AudienceBuildPhase;
  crowdDensity: number;           // 0-1
  energyLevel: number;            // 0-100
  silhouetteCount: number;
  ambientSoundLevel: number;      // 0-1
  countdownMs: number;
  murmurIntensity: number;        // crowd murmur 0-1
  anticipationScore: number;      // composite 0-100
  chantActive: boolean;
  wavingActive: boolean;
  lightFlickerActive: boolean;
}

export interface AudienceBuildConfig {
  targetCrowdSize: number;
  buildDurationMs: number;
  startCountdownMs: number;
}

const buildStates = new Map<string, AudienceBuildState>();
type BuildListener = (state: AudienceBuildState) => void;
const buildListeners = new Map<string, Set<BuildListener>>();

function phaseFromDensity(density: number): AudienceBuildPhase {
  if (density < 0.1) return "empty";
  if (density < 0.25) return "trickling_in";
  if (density < 0.5) return "gathering";
  if (density < 0.7) return "buzzing";
  if (density < 0.9) return "electric";
  return "peak_anticipation";
}

function computeAnticipationScore(state: AudienceBuildState): number {
  const countdownFactor = Math.max(0, 1 - state.countdownMs / (10 * 60_000));
  return Math.round(
    state.crowdDensity * 30 +
    state.energyLevel * 0.4 +
    state.murmurIntensity * 15 +
    countdownFactor * 15
  );
}

function updateState(roomId: string, patch: Partial<AudienceBuildState>): AudienceBuildState {
  const current = buildStates.get(roomId) ?? defaultState(roomId);
  const updated = { ...current, ...patch };
  updated.phase = phaseFromDensity(updated.crowdDensity);
  updated.anticipationScore = computeAnticipationScore(updated);
  buildStates.set(roomId, updated);
  buildListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

function defaultState(roomId: string): AudienceBuildState {
  return {
    roomId, phase: "empty", crowdDensity: 0, energyLevel: 0,
    silhouetteCount: 0, ambientSoundLevel: 0, countdownMs: 0,
    murmurIntensity: 0, anticipationScore: 0, chantActive: false,
    wavingActive: false, lightFlickerActive: false,
  };
}

export function initAudienceBuild(roomId: string, config: AudienceBuildConfig): AudienceBuildState {
  return updateState(roomId, {
    countdownMs: config.startCountdownMs,
    crowdDensity: 0,
    energyLevel: 5,
    silhouetteCount: 0,
    ambientSoundLevel: 0.1,
    murmurIntensity: 0.05,
  });
}

export function tickCountdown(roomId: string, elapsedMs: number): AudienceBuildState {
  const current = buildStates.get(roomId) ?? defaultState(roomId);
  const newCountdown = Math.max(0, current.countdownMs - elapsedMs);
  const progress = 1 - newCountdown / Math.max(1, current.countdownMs + elapsedMs);

  const crowdDensity = Math.min(1, progress * 1.2);
  const energyLevel = Math.min(100, progress * 85 + Math.random() * 10);
  const murmurIntensity = Math.min(1, progress * 0.9);
  const ambientSoundLevel = Math.min(0.8, progress * 0.7);
  const silhouetteCount = Math.round(crowdDensity * 200);
  const chantActive = crowdDensity > 0.85 && newCountdown < 60_000;
  const wavingActive = crowdDensity > 0.6;
  const lightFlickerActive = newCountdown < 30_000;

  return updateState(roomId, {
    countdownMs: newCountdown,
    crowdDensity,
    energyLevel,
    murmurIntensity,
    ambientSoundLevel,
    silhouetteCount,
    chantActive,
    wavingActive,
    lightFlickerActive,
  });
}

export function surgeEnergy(roomId: string, amount: number): AudienceBuildState {
  const current = buildStates.get(roomId) ?? defaultState(roomId);
  return updateState(roomId, {
    energyLevel: Math.min(100, current.energyLevel + amount),
    murmurIntensity: Math.min(1, current.murmurIntensity + 0.1),
  });
}

export function getAudienceBuildState(roomId: string): AudienceBuildState {
  return buildStates.get(roomId) ?? defaultState(roomId);
}

export function subscribeToAudienceBuild(roomId: string, listener: BuildListener): () => void {
  if (!buildListeners.has(roomId)) buildListeners.set(roomId, new Set());
  buildListeners.get(roomId)!.add(listener);
  const current = buildStates.get(roomId);
  if (current) listener(current);
  return () => buildListeners.get(roomId)?.delete(listener);
}

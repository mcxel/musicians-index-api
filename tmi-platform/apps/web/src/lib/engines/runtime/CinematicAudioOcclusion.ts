/**
 * CinematicAudioOcclusion
 * Spatial audio model that gives the room physical presence.
 * Bass passes through walls. Crowd muffles mid-frequencies.
 * Directional pan follows stage position.
 * Voice attenuates faster than music.
 */

export interface RoomPosition {
  x: number;   // 0 (left) → 1 (right)
  y: number;   // 0 (front/stage) → 1 (back)
  z: number;   // 0 (floor) → 1 (upper deck)
}

export interface AudioSource {
  id: string;
  type: 'stage' | 'crowd' | 'voice' | 'ambient' | 'effects';
  position: RoomPosition;
  baseGain: number;    // 0–1
  baseFrequency: number; // Hz center frequency of the source
}

export interface OcclusionResult {
  sourceId: string;
  listenerPosition: RoomPosition;
  gain: number;                  // attenuated gain 0–1
  pan: number;                   // -1 (left) → 1 (right)
  filterFrequency: number;       // low-pass cutoff in Hz (crowd muffling)
  reverbMix: number;             // 0–1 how much room reverb to add
  bassBoost: number;             // 0–1 sub-bass enhancement for stage sources
  muffle: number;                // 0–1 crowd density muffling factor
}

// Physical room model constants
const SPEED_OF_SOUND_UNITS_PER_MS = 0.001; // room-normalized units
const MIN_GAIN = 0.02;
const CROWD_ABSORPTION_COEFFICIENT = 0.18;  // per unit of crowd density

export function computeOcclusion(
  source: AudioSource,
  listener: RoomPosition,
  crowdDensity: number,           // 0–1 occupancy at listener position
  roomSize: { width: number; depth: number; height: number } = { width: 1, depth: 1, height: 1 },
): OcclusionResult {
  const dx = (source.position.x - listener.x) * roomSize.width;
  const dy = (source.position.y - listener.y) * roomSize.depth;
  const dz = (source.position.z - listener.z) * roomSize.height;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Distance attenuation (inverse square with minimum)
  const rawGain = Math.max(MIN_GAIN, 1 / (1 + distance * distance * 3));

  // Crowd muffling: high density between source and listener absorbs mids
  const crowdAbsorption = crowdDensity * CROWD_ABSORPTION_COEFFICIENT * distance;
  const gain = Math.max(MIN_GAIN, rawGain * (1 - crowdAbsorption * 0.4));

  // Stereo pan: based on horizontal position relative to listener
  const pan = Math.max(-1, Math.min(1, (source.position.x - listener.x) * 2));

  // Low-pass filter: crowd absorbs highs, bass travels further
  // At max density and distance, cuts to ~400Hz. Stage always retains more bass.
  const baseCutoff = source.type === 'stage' ? 18000 : source.type === 'voice' ? 12000 : 15000;
  const densityRolloff = crowdDensity * distance * 8000;
  const distanceRolloff = distance * 3000;
  const filterFrequency = Math.max(300, baseCutoff - densityRolloff - distanceRolloff);

  // Reverb: back of room gets more room reflections
  const reverbMix = Math.min(0.8, listener.y * 0.5 + distance * 0.2);

  // Bass boost for stage sources — sub-bass is omni-directional
  const bassBoost = source.type === 'stage' ? Math.max(0, 1 - distance * 2) * 0.3 : 0;

  // Crowd muffling coefficient visible to renderer
  const muffle = Math.min(1, crowdAbsorption);

  return {
    sourceId: source.id,
    listenerPosition: listener,
    gain,
    pan,
    filterFrequency,
    reverbMix,
    bassBoost,
    muffle,
  };
}

/** Mix multiple sources at a listener position */
export function mixSources(
  sources: AudioSource[],
  listener: RoomPosition,
  crowdDensity: number,
): OcclusionResult[] {
  return sources.map((s) => computeOcclusion(s, listener, crowdDensity));
}

/** Standard stage audio source for a TMI room */
export function createStageSource(id = 'main-stage'): AudioSource {
  return {
    id, type: 'stage',
    position: { x: 0.5, y: 0, z: 0.3 },  // center stage, elevated
    baseGain: 1.0,
    baseFrequency: 1000,
  };
}

/** Crowd ambient murmur source */
export function createCrowdSource(id = 'crowd-ambient'): AudioSource {
  return {
    id, type: 'crowd',
    position: { x: 0.5, y: 0.5, z: 0 },  // center of crowd
    baseGain: 0.35,
    baseFrequency: 800,
  };
}

/** Estimate propagation delay for visualization sync */
export function propagationDelayMs(source: RoomPosition, listener: RoomPosition): number {
  const dx = source.x - listener.x;
  const dy = source.y - listener.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist / SPEED_OF_SOUND_UNITS_PER_MS;
}

/** CSS Web Audio API AudioNode parameters from occlusion result */
export function toWebAudioParams(result: OcclusionResult): {
  gain: number;
  pannerX: number;
  biquadFrequency: number;
  convolverMix: number;
} {
  return {
    gain: result.gain + result.bassBoost,
    pannerX: result.pan,
    biquadFrequency: result.filterFrequency,
    convolverMix: result.reverbMix,
  };
}

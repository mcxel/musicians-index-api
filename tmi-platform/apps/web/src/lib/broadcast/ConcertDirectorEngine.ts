/**
 * ConcertDirectorEngine — intelligent camera director for concerts.
 *
 * Analyzes performer count and roles, auto-selects camera sequence.
 * Solo → Medium → Close → Stage Spot → Crowd → repeat.
 * Full band → Wide → Singer Focus → Drummer Focus → Guitar Focus → Crowd → repeat.
 * Never manual intervention needed.
 */

export type CameraShot =
  | 'wide'          // full stage
  | 'medium'        // performer at mid-distance
  | 'close'         // tight on performer
  | 'stage-spot'    // performer + stage lighting
  | 'crowd'         // audience view
  | 'singer-focus'  // lead singer close-up
  | 'drummer-focus' // drummer close-up
  | 'guitar-focus'  // guitarist close-up
  | 'bass-focus'    // bassist close-up
  | 'keys-focus';   // keyboard player close-up

export type PerformerRole =
  | 'solo'
  | 'singer'
  | 'drummer'
  | 'bassist'
  | 'guitarist'
  | 'keys'
  | 'dj'
  | 'conductor'
  | 'dancer'
  | 'backing-vocals';

export interface ConcertPerformer {
  id: string;
  name: string;
  role: PerformerRole;
  isActive: boolean;
  hasCamera: boolean;
}

export interface ConcertCameraSequence {
  shots: CameraShot[];
  durations: number[]; // ms per shot
  totalCycleDurationMs: number;
}

// ─── Shot duration defaults (configurable per concert) ──────────────────────

const DEFAULT_SHOT_DURATIONS: Record<CameraShot, number> = {
  'wide':           8000,  // wide establisher
  'medium':         6000,  // medium performer shot
  'close':          4000,  // tight shot
  'stage-spot':     5000,  // lighting + performer
  'crowd':          3000,  // audience energy
  'singer-focus':   7000,  // lead vocal showcase
  'drummer-focus':  5000,  // rhythm driver
  'guitar-focus':   6000,  // lead instrument
  'bass-focus':     4000,  // bass runs (shorter)
  'keys-focus':     5000,  // keyboard flourishes
};

// ─── Solo performer camera sequence ──────────────────────────────────────────

function getSoloPerformerSequence(): ConcertCameraSequence {
  const sequence: CameraShot[] = [
    'wide',         // establish performer on stage
    'medium',       // medium distance performer shot
    'close',        // tight on performer's face/hands
    'stage-spot',   // performer + stage lighting (high energy moment)
    'crowd',        // cut to audience reaction
    'wide',         // pull back to full stage
  ];

  const durations = sequence.map(shot => DEFAULT_SHOT_DURATIONS[shot] ?? 5000);
  const totalCycleDurationMs = durations.reduce((a, b) => a + b, 0);

  return { shots: sequence, durations, totalCycleDurationMs };
}

// ─── Full band camera sequence ───────────────────────────────────────────────

function getFullBandSequence(performers: ConcertPerformer[]): ConcertCameraSequence {
  const hasRole = (role: PerformerRole) => performers.some(p => p.role === role && p.isActive);

  const sequence: CameraShot[] = [
    'wide',
    ...(hasRole('singer') ? ['singer-focus' as const] : []),
    ...(hasRole('drummer') ? ['drummer-focus' as const] : []),
    ...(hasRole('guitarist') ? ['guitar-focus' as const] : []),
    ...(hasRole('bassist') ? ['bass-focus' as const] : []),
    ...(hasRole('keys') ? ['keys-focus' as const] : []),
    'crowd',
    'wide',
  ];

  const durations = sequence.map(shot => DEFAULT_SHOT_DURATIONS[shot] ?? 5000);
  const totalCycleDurationMs = durations.reduce((a, b) => a + b, 0);

  return { shots: sequence, durations, totalCycleDurationMs };
}

// ─── DJ / Electronic Performance ─────────────────────────────────────────────

function getDJSequence(): ConcertCameraSequence {
  const sequence: CameraShot[] = [
    'wide',         // DJ booth overview
    'close',        // hands on equipment
    'crowd',        // dancing audience
    'stage-spot',   // lighting effects
    'medium',       // DJ back to medium
    'crowd',        // crowd again (peak moments)
  ];

  const durations = sequence.map(shot => DEFAULT_SHOT_DURATIONS[shot] ?? 5000);
  const totalCycleDurationMs = durations.reduce((a, b) => a + b, 0);

  return { shots: sequence, durations, totalCycleDurationMs };
}

// ─── Duo / Acoustic ──────────────────────────────────────────────────────────

function getDuoSequence(performers: ConcertPerformer[]): ConcertCameraSequence {
  const sequence: CameraShot[] = [
    'wide',         // both performers
    'close',        // performer 1 tight
    'close',        // performer 2 tight (alternating)
    'stage-spot',   // both + lighting
    'crowd',        // audience
    'wide',         // return wide
  ];

  const durations = sequence.map(shot => DEFAULT_SHOT_DURATIONS[shot] ?? 5000);
  const totalCycleDurationMs = durations.reduce((a, b) => a + b, 0);

  return { shots: sequence, durations, totalCycleDurationMs };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Analyzes performers and returns the optimal camera sequence for the concert.
 * Does NOT require manual configuration — pure logic based on performer composition.
 */
export function getOptimalCameraSequence(performers: ConcertPerformer[]): ConcertCameraSequence {
  const activePerformers = performers.filter(p => p.isActive && p.hasCamera);

  if (activePerformers.length === 0) {
    // Fallback: generic wide/medium/crowd if no performers detected
    return {
      shots: ['wide', 'medium', 'crowd', 'wide'],
      durations: [8000, 6000, 3000, 8000],
      totalCycleDurationMs: 25000,
    };
  }

  // Solo performer
  if (activePerformers.length === 1) {
    const solo = activePerformers[0]!;
    if (solo.role === 'dj') return getDJSequence();
    return getSoloPerformerSequence();
  }

  // Duo
  if (activePerformers.length === 2) {
    return getDuoSequence(activePerformers);
  }

  // Full band (3+)
  return getFullBandSequence(activePerformers);
}

/**
 * Given elapsed time in the cycle, returns which shot should be active.
 */
export function getCurrentShot(
  sequence: ConcertCameraSequence,
  elapsedMs: number
): { shot: CameraShot; shotIndex: number; timeIntoShotMs: number; totalShotDurationMs: number } {
  const cyclePosition = elapsedMs % sequence.totalCycleDurationMs;
  let accumulated = 0;

  for (let i = 0; i < sequence.shots.length; i++) {
    const shotDuration = sequence.durations[i] ?? 5000;
    if (cyclePosition < accumulated + shotDuration) {
      return {
        shot: sequence.shots[i]!,
        shotIndex: i,
        timeIntoShotMs: cyclePosition - accumulated,
        totalShotDurationMs: shotDuration,
      };
    }
    accumulated += shotDuration;
  }

  // Should not reach here, but fallback to first shot
  return {
    shot: sequence.shots[0] ?? 'wide',
    shotIndex: 0,
    timeIntoShotMs: 0,
    totalShotDurationMs: sequence.durations[0] ?? 8000,
  };
}

/**
 * Returns a smooth transition timing for shot changes.
 * Transitions can be: cut, fade, push, zoom, etc.
 */
export function getTransitionStyle(fromShot: CameraShot, toShot: CameraShot): 'cut' | 'fade' | 'push' | 'zoom' {
  // Close-ups to wide shots: fade (soft)
  if ((fromShot === 'close' || fromShot === 'stage-spot') && toShot === 'wide') return 'fade';

  // Wide to close: push (dynamic)
  if (fromShot === 'wide' && (toShot === 'close' || toShot === 'stage-spot')) return 'push';

  // Crowd reactions: cut (snappy)
  if (fromShot === 'crowd' || toShot === 'crowd') return 'cut';

  // Focus transitions: zoom (emphasis)
  if (
    (fromShot === 'singer-focus' || fromShot === 'drummer-focus' || fromShot === 'guitar-focus') &&
    (toShot === 'singer-focus' || toShot === 'drummer-focus' || toShot === 'guitar-focus')
  ) {
    return 'zoom';
  }

  // Default: fade
  return 'fade';
}

/**
 * Preset configurations for different concert types.
 * Can be overridden per-concert but provides sensible defaults.
 */
export const CONCERT_PRESETS = {
  acoustic: {
    solo: getSoloPerformerSequence,
    duo: getDuoSequence,
  },
  electronic: {
    dj: getDJSequence,
  },
  band: {
    trio: getFullBandSequence,
    quartet: getFullBandSequence,
    fullBand: getFullBandSequence,
  },
} as const;

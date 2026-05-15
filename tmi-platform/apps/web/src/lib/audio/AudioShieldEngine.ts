/**
 * Audio Shield Engine — Master bus protection for multi-performer sessions.
 * Brick-wall limiter, 3D HRTF spatializer, and intelligent EQ ducking.
 */

export interface AudioFeed {
  feedId: string;
  displayName: string;
  gainDb: number;       // current gain in dB (-60 to +12)
  peakDb: number;       // peak reading this frame
  isSpeaking: boolean;  // true = active voice detected
  positionAngleDeg: number; // 0–360, clockwise from front-center (HRTF)
  positionDepth: number;    // 0 (front) to 1 (back row) for reverb depth
  channelType: 'voice' | 'instrument' | 'music-bed' | 'sfx';
}

export interface MasterBusState {
  feeds: AudioFeed[];
  masterPeakDb: number;
  limitEngaged: boolean;
  spatializerEnabled: boolean;
  duckingActive: boolean;
  duckingTargetId: string | null; // feed being prioritized right now
}

// Brick-wall ceiling — nothing passes above this
const MASTER_CEILING_DB = -0.3;
// When sum energy exceeds this, start soft knee compression
const SOFT_KNEE_THRESHOLD_DB = -6;
// Voice channels get a frequency "hole" carved when they're speaking
const EQ_DUCK_GAIN_DB = -4.5;
// Minimum db delta before ducking kicks in (avoids ducking on whispers)
const DUCK_ACTIVATION_THRESHOLD_DB = -24;
// Distance model: max reverb tail at depth=1
const MAX_REVERB_MS = 220;

function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

function linearToDb(linear: number): number {
  return 20 * Math.log10(Math.max(linear, 1e-10));
}

function sumLinear(feeds: AudioFeed[]): number {
  return feeds.reduce((sum, f) => sum + dbToLinear(f.gainDb + f.peakDb), 0);
}

/** Apply brick-wall limiting to the master bus sum. Returns gain reduction in dB (negative). */
export function computeMasterLimiterReduction(feeds: AudioFeed[]): number {
  const sumLinearVal = sumLinear(feeds);
  const sumDb = linearToDb(sumLinearVal);

  if (sumDb <= SOFT_KNEE_THRESHOLD_DB) return 0;

  // Soft knee: proportional reduction between threshold and ceiling
  const overshootDb = sumDb - MASTER_CEILING_DB;
  if (overshootDb <= 0) return 0;

  // Ratio 8:1 in the knee, brick wall above ceiling
  const reduction = sumDb > MASTER_CEILING_DB
    ? -(sumDb - MASTER_CEILING_DB)
    : -(overshootDb / 8);

  return Math.min(reduction, 0);
}

/**
 * 3D HRTF spatializer — returns a {left, right} gain pair for a feed.
 * Uses a simplified equal-power panning law around the angle.
 * positionAngleDeg: 0=front-center, 90=right, 180=back, 270=left
 */
export function computeHRTFGain(feed: AudioFeed): { left: number; right: number } {
  const rad = (feed.positionAngleDeg * Math.PI) / 180;
  // Pan position: -1 (hard left) to +1 (hard right)
  const pan = Math.sin(rad);
  const left = Math.sqrt(0.5 * (1 - pan));
  const right = Math.sqrt(0.5 * (1 + pan));

  // Depth attenuation: performers further back are quieter and more reverberant
  const depthAtten = 1 - feed.positionDepth * 0.25;

  return { left: left * depthAtten, right: right * depthAtten };
}

/** Compute reverb tail duration (ms) for a given depth. */
export function computeReverbTailMs(positionDepth: number): number {
  return Math.round(positionDepth * MAX_REVERB_MS);
}

/**
 * Resolve which voice feed should trigger EQ ducking of the music bed.
 * Returns the feedId of the loudest active voice, or null if none qualify.
 */
export function resolveDuckingTarget(feeds: AudioFeed[]): string | null {
  const voices = feeds.filter(
    (f) => f.channelType === 'voice' && f.isSpeaking && f.peakDb > DUCK_ACTIVATION_THRESHOLD_DB,
  );
  if (voices.length === 0) return null;

  const loudest = voices.reduce<AudioFeed | null>((best, f) => {
    if (!best || f.peakDb > best.peakDb) return f;
    return best;
  }, null);

  return loudest?.feedId ?? null;
}

/**
 * Apply EQ ducking: reduce music-bed / instrument gain when a voice is active.
 * Returns updated feeds array with ducked gains where applicable.
 */
export function applyEQDucking(feeds: AudioFeed[], duckingTargetId: string | null): AudioFeed[] {
  if (!duckingTargetId) return feeds;

  return feeds.map((f) => {
    if (f.feedId === duckingTargetId) return f; // leave the speaking feed untouched
    if (f.channelType === 'music-bed' || f.channelType === 'instrument') {
      return { ...f, gainDb: f.gainDb + EQ_DUCK_GAIN_DB };
    }
    return f;
  });
}

/** Full tick: apply limiter, spatializer data, and ducking in one pass. */
export function tickAudioShield(prev: MasterBusState): MasterBusState {
  const duckingTargetId = resolveDuckingTarget(prev.feeds);
  const duckedFeeds = applyEQDucking(prev.feeds, duckingTargetId);

  const reductionDb = computeMasterLimiterReduction(duckedFeeds);
  const masterPeakDb = linearToDb(sumLinear(duckedFeeds)) + reductionDb;
  const limitEngaged = reductionDb < -0.1;

  return {
    feeds: duckedFeeds,
    masterPeakDb,
    limitEngaged,
    spatializerEnabled: prev.spatializerEnabled,
    duckingActive: duckingTargetId !== null,
    duckingTargetId,
  };
}

export function createAudioShieldState(feeds: Omit<AudioFeed, never>[] = []): MasterBusState {
  return {
    feeds: feeds as AudioFeed[],
    masterPeakDb: -60,
    limitEngaged: false,
    spatializerEnabled: true,
    duckingActive: false,
    duckingTargetId: null,
  };
}

/** Add a new performer feed to the shield (e.g., choir member joins) */
export function addAudioFeed(prev: MasterBusState, feed: AudioFeed): MasterBusState {
  return { ...prev, feeds: [...prev.feeds, feed] };
}

/** Remove a feed (performer disconnects) */
export function removeAudioFeed(prev: MasterBusState, feedId: string): MasterBusState {
  return { ...prev, feeds: prev.feeds.filter((f) => f.feedId !== feedId) };
}

/** Update live gain and peak for a specific feed */
export function updateFeedLevels(
  prev: MasterBusState,
  feedId: string,
  patch: Partial<Pick<AudioFeed, 'gainDb' | 'peakDb' | 'isSpeaking'>>,
): MasterBusState {
  return {
    ...prev,
    feeds: prev.feeds.map((f) => (f.feedId === feedId ? { ...f, ...patch } : f)),
  };
}

/**
 * Motion Heat Visualizer — Dance-Off motion detection and glow-frame scoring.
 * Tracks visual frame velocity to drive Ignition glow intensity and Director snap-zooms.
 */

export type DanceIntensityLevel = 'static' | 'groove' | 'active' | 'fire';

export interface MotionFrame {
  /** Optical flow magnitude, 0–100 (pixel displacement average across frame) */
  flowMagnitude: number;
  /** Estimated body region with most movement: 'feet' | 'hands' | 'full' */
  activeRegion: 'feet' | 'hands' | 'full' | 'none';
  /** Captured at timestamp */
  capturedAt: number;
}

export interface DancerMotionState {
  dancerFeedId: string;
  currentIntensity: DanceIntensityLevel;
  /** EMA-smoothed flow score, 0–100 */
  smoothedFlow: number;
  /** Glow intensity for the Ignition Frame, 0–1 */
  glowIntensity: number;
  /** True when a snap-zoom should be triggered (Director command) */
  snapZoomTriggered: boolean;
  /** The region the snap-zoom should target */
  snapZoomRegion: 'feet' | 'hands' | 'full' | null;
  /** Motion trail shader strength, 0–1 (applied by renderer) */
  motionTrailStrength: number;
  lastSnapZoomAt: number;
  frameHistory: MotionFrame[];
}

// EMA alpha — higher = more reactive, lower = smoother
const EMA_ALPHA = 0.35;

// Flow thresholds for intensity levels
const GROOVE_THRESHOLD = 15;
const ACTIVE_THRESHOLD = 40;
const FIRE_THRESHOLD = 68;

// Snap-zoom triggers when smoothedFlow crosses this AND region is technical (feet/hands)
const SNAP_ZOOM_FLOW_THRESHOLD = 55;
const SNAP_ZOOM_COOLDOWN_MS = 2000;

// Motion trail is proportional to flow above this baseline
const TRAIL_BASELINE = 35;

function classifyIntensity(smoothedFlow: number): DanceIntensityLevel {
  if (smoothedFlow >= FIRE_THRESHOLD) return 'fire';
  if (smoothedFlow >= ACTIVE_THRESHOLD) return 'active';
  if (smoothedFlow >= GROOVE_THRESHOLD) return 'groove';
  return 'static';
}

function computeGlow(smoothedFlow: number): number {
  return Math.min(1, smoothedFlow / 100);
}

function computeMotionTrail(smoothedFlow: number): number {
  if (smoothedFlow <= TRAIL_BASELINE) return 0;
  return Math.min(1, (smoothedFlow - TRAIL_BASELINE) / (100 - TRAIL_BASELINE));
}

export function createDancerMotionState(dancerFeedId: string): DancerMotionState {
  return {
    dancerFeedId,
    currentIntensity: 'static',
    smoothedFlow: 0,
    glowIntensity: 0,
    snapZoomTriggered: false,
    snapZoomRegion: null,
    motionTrailStrength: 0,
    lastSnapZoomAt: 0,
    frameHistory: [],
  };
}

/**
 * Tick the motion state with a new frame reading.
 * Returns updated state. Consumer should read snapZoomTriggered and then call clearSnapZoom().
 */
export function tickMotionHeat(
  prev: DancerMotionState,
  frame: MotionFrame,
  nowMs = Date.now(),
): DancerMotionState {
  const smoothedFlow = prev.smoothedFlow * (1 - EMA_ALPHA) + frame.flowMagnitude * EMA_ALPHA;
  const currentIntensity = classifyIntensity(smoothedFlow);
  const glowIntensity = computeGlow(smoothedFlow);
  const motionTrailStrength = computeMotionTrail(smoothedFlow);

  const canSnapZoom = nowMs - prev.lastSnapZoomAt > SNAP_ZOOM_COOLDOWN_MS;
  const snapZoomTriggered =
    canSnapZoom &&
    smoothedFlow >= SNAP_ZOOM_FLOW_THRESHOLD &&
    (frame.activeRegion === 'feet' || frame.activeRegion === 'hands');

  return {
    ...prev,
    currentIntensity,
    smoothedFlow,
    glowIntensity,
    motionTrailStrength,
    snapZoomTriggered,
    snapZoomRegion: snapZoomTriggered && frame.activeRegion !== 'none' ? frame.activeRegion : prev.snapZoomRegion,
    lastSnapZoomAt: snapZoomTriggered ? nowMs : prev.lastSnapZoomAt,
    frameHistory: [...prev.frameHistory.slice(-29), frame],
  };
}

/** Reset snap-zoom trigger after the Director has acted on it. */
export function clearSnapZoom(prev: DancerMotionState): DancerMotionState {
  return { ...prev, snapZoomTriggered: false, snapZoomRegion: null };
}

/**
 * Compare two dancers and return the id of the one with higher smoothedFlow.
 * Used by the Director to pick the featured dancer in a dance-off.
 */
export function resolveDominantDancer(
  a: DancerMotionState,
  b: DancerMotionState,
): string {
  return a.smoothedFlow >= b.smoothedFlow ? a.dancerFeedId : b.dancerFeedId;
}

/** Aggregate motion score for an ensemble of dancers (average smoothed flow). */
export function computeEnsembleMotionScore(dancers: DancerMotionState[]): number {
  if (dancers.length === 0) return 0;
  return dancers.reduce((sum, d) => sum + d.smoothedFlow, 0) / dancers.length;
}

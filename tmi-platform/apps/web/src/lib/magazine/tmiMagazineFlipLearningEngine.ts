import type { TmiFlipAdaptiveTuning, TmiPeelOrigin } from "@/lib/magazine/tmiMagazinePageFlipEngine";

type FlipGestureRecord = {
  velocity: number;
  distance: number;
  success: boolean;
  origin: TmiPeelOrigin;
};

type FlipLearningState = {
  sampleCount: number;
  successCount: number;
  avgVelocity: number;
  avgDistance: number;
  smoothness: number;
  preferredOrigin: TmiPeelOrigin;
};

const STORAGE_KEY = "tmi.magazine.flip.learning.v1";

const DEFAULT_STATE: FlipLearningState = {
  sampleCount: 0,
  successCount: 0,
  avgVelocity: 0.85,
  avgDistance: 90,
  smoothness: 0.35,
  preferredOrigin: "right-edge",
};

const ORIGINS: TmiPeelOrigin[] = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "left-edge",
  "right-edge",
  "top-edge",
  "bottom-edge",
];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function normalizeState(raw: unknown): FlipLearningState {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;
  const obj = raw as Partial<FlipLearningState>;
  const preferredOrigin = ORIGINS.includes(obj.preferredOrigin as TmiPeelOrigin)
    ? (obj.preferredOrigin as TmiPeelOrigin)
    : DEFAULT_STATE.preferredOrigin;

  return {
    sampleCount: typeof obj.sampleCount === "number" ? Math.max(0, Math.floor(obj.sampleCount)) : DEFAULT_STATE.sampleCount,
    successCount: typeof obj.successCount === "number" ? Math.max(0, Math.floor(obj.successCount)) : DEFAULT_STATE.successCount,
    avgVelocity: typeof obj.avgVelocity === "number" ? clamp(obj.avgVelocity, 0.2, 3.5) : DEFAULT_STATE.avgVelocity,
    avgDistance: typeof obj.avgDistance === "number" ? clamp(obj.avgDistance, 30, 220) : DEFAULT_STATE.avgDistance,
    smoothness: typeof obj.smoothness === "number" ? clamp(obj.smoothness, 0, 1) : DEFAULT_STATE.smoothness,
    preferredOrigin,
  };
}

export function readFlipLearningState(): FlipLearningState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    return normalizeState(JSON.parse(stored));
  } catch {
    return DEFAULT_STATE;
  }
}

export function writeFlipLearningState(state: FlipLearningState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-blocking persistence.
  }
}

function nextAverage(prev: number, sample: number, alpha = 0.18): number {
  return prev * (1 - alpha) + sample * alpha;
}

export function recordFlipGesture(record: FlipGestureRecord): FlipLearningState {
  const current = readFlipLearningState();
  const next: FlipLearningState = {
    ...current,
    sampleCount: current.sampleCount + 1,
    successCount: current.successCount + (record.success ? 1 : 0),
    avgVelocity: nextAverage(current.avgVelocity, record.velocity, 0.2),
    avgDistance: nextAverage(current.avgDistance, record.distance, 0.2),
    preferredOrigin: record.origin,
    smoothness: current.smoothness,
  };

  const successRatio = next.sampleCount > 0 ? next.successCount / next.sampleCount : 0.5;
  const velocityScore = clamp((next.avgVelocity - 0.6) / 1.6, 0, 1);
  const distanceScore = clamp((next.avgDistance - 70) / 90, 0, 1);

  const smoothnessTarget = clamp(successRatio * 0.55 + velocityScore * 0.3 + distanceScore * 0.15, 0.05, 0.96);
  next.smoothness = nextAverage(current.smoothness, smoothnessTarget, 0.14);

  writeFlipLearningState(next);
  return next;
}

export function toAdaptiveTuning(state: FlipLearningState): TmiFlipAdaptiveTuning {
  const s = clamp(state.smoothness, 0, 1);

  return {
    learnedSmoothness: s,
    // Smoother users get slightly faster, tighter flip timings.
    flipDurationMs: Math.round(560 - s * 140),
    // Lower threshold over time for more natural peel/commit behavior.
    minDistanceForFlip: Math.round(88 - s * 28),
    // Ramp into rapid skim sooner as confidence rises.
    minSwipeVelocityForRapid: Number((1.05 - s * 0.45).toFixed(3)),
  };
}

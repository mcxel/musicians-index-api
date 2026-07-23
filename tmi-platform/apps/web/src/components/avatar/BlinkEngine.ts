export type BlinkFrame = {
  openness: number;
};

export type BlinkConfig = {
  minIntervalMs?: number;
  maxIntervalMs?: number;
  closeMs?: number;
};

const DEFAULT_CONFIG: Required<BlinkConfig> = {
  minIntervalMs: 1800,
  maxIntervalMs: 4200,
  closeMs: 140,
};

// Deterministic per-instance offset so every avatar rendered at the same
// wall-clock moment doesn't compute the same blink phase (was previously
// keyed only on nowMs % 997, syncing every on-screen avatar's blink).
export function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function nextBlinkAt(nowMs: number, config: BlinkConfig = {}, seed = 0): number {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const span = merged.maxIntervalMs - merged.minIntervalMs;
  const phase = ((nowMs + seed) % 997) / 997;
  return nowMs + merged.minIntervalMs + Math.floor(span * phase);
}

export function getBlinkFrame(nowMs: number, blinkStartedAtMs: number, config: BlinkConfig = {}): BlinkFrame {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const elapsed = nowMs - blinkStartedAtMs;

  if (elapsed < 0 || elapsed > merged.closeMs * 2) {
    return { openness: 1 };
  }

  const half = merged.closeMs;
  if (elapsed <= half) {
    return { openness: Math.max(0, 1 - elapsed / half) };
  }

  const reopen = elapsed - half;
  return { openness: Math.min(1, reopen / half) };
}

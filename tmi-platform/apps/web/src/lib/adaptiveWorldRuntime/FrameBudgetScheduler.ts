/**
 * FrameBudgetScheduler — measures real rAF deltas (no fabricated FPS).
 */

import type { FrameBudgetSample } from "./types";

const MAX_SAMPLES = 90;
const samples: FrameBudgetSample[] = [];
let rafId: number | null = null;
let lastTs: number | null = null;
let listenerCount = 0;

function tick(ts: number): void {
  if (lastTs != null) {
    const deltaMs = ts - lastTs;
    if (deltaMs > 0 && deltaMs < 500) {
      samples.push({ deltaMs, timestamp: ts });
      if (samples.length > MAX_SAMPLES) samples.shift();
    }
  }
  lastTs = ts;
  rafId = requestAnimationFrame(tick);
}

export function startFrameBudgetScheduler(): void {
  if (typeof window === "undefined") return;
  listenerCount += 1;
  if (rafId != null) return;
  lastTs = null;
  rafId = requestAnimationFrame(tick);
}

export function stopFrameBudgetScheduler(): void {
  listenerCount = Math.max(0, listenerCount - 1);
  if (listenerCount > 0 || rafId == null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
  lastTs = null;
}

export function getFrameBudgetSamples(): readonly FrameBudgetSample[] {
  return samples;
}

export function getAverageFrameMs(): number | null {
  if (samples.length < 8) return null;
  const sum = samples.reduce((a, s) => a + s.deltaMs, 0);
  return sum / samples.length;
}

/** Derived from measured deltas only — null until enough samples exist. */
export function getEstimatedFpsFromSamples(): number | null {
  const avg = getAverageFrameMs();
  if (avg == null || avg <= 0) return null;
  return Math.round(1000 / avg);
}

export function clearFrameBudgetSamples(): void {
  samples.length = 0;
  lastTs = null;
}

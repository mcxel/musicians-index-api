// Self-correction layer — reads WarpEntryLog history and produces adaptive
// tuning parameters so the platform adjusts to real user behaviour over time.

import type { WarpEntry } from "@/lib/live/WarpEntryLog";

export interface WarpAdaptParams {
  settleWindowMs: number;              // spotlight block duration post-arrival
  ghostBoostActive: boolean;           // raise ghost energy scores to compensate low engagement
  spotlightPriorityBoost: boolean;     // sort recent arrivals first in spotlight queue
  warpDurationTarget: { min: number; max: number }; // target flying-phase duration
}

const DEFAULTS: WarpAdaptParams = {
  settleWindowMs: 2500,
  ghostBoostActive: false,
  spotlightPriorityBoost: false,
  warpDurationTarget: { min: 1800, max: 3200 },
};

export function computeWarpAdapt(entries: WarpEntry[]): WarpAdaptParams {
  if (entries.length < 3) return { ...DEFAULTS };

  const recent = entries.slice(-10);

  const stabilityValues = recent
    .filter((e) => e.arrivalStabilityMs !== null)
    .map((e) => e.arrivalStabilityMs as number);

  const avgStability =
    stabilityValues.length > 0
      ? stabilityValues.reduce((a, b) => a + b, 0) / stabilityValues.length
      : null;

  const engagement5sRate =
    recent.filter((e) => e.first5sEngagement).length / recent.length;

  const avgWarpMs =
    recent.reduce((a, e) => a + e.warpDurationMs, 0) / recent.length;

  // Settle window: shrink if users react fast, extend if they're slow to engage
  const settleWindowMs =
    avgStability !== null && avgStability < 1000
      ? Math.max(1200, 2500 - Math.round((2500 - avgStability) * 0.35))
      : avgStability !== null && avgStability > 4000
      ? 3200
      : 2500;

  // Ghost boost: inject higher-energy ghost scores when real engagement is low
  const ghostBoostActive = engagement5sRate < 0.2;

  // Priority boost: when crowd is engaged, surface new arrivals in spotlight sooner
  const spotlightPriorityBoost = engagement5sRate > 0.6;

  // Warp duration: tighten range based on observed cadence
  const warpDurationTarget =
    avgWarpMs > 3000
      ? { min: 1600, max: 2800 }
      : avgWarpMs < 1900
      ? { min: 2000, max: 3200 }
      : { min: 1800, max: 3200 };

  return { settleWindowMs, ghostBoostActive, spotlightPriorityBoost, warpDurationTarget };
}

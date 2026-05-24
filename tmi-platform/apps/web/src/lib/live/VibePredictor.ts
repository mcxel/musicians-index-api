// Pre-emptive vibe prediction — reads WarpEntryLog arrival cadence to signal
// HYPE mode before energy crosses the 80 threshold.

import type { WarpEntry } from "@/lib/live/WarpEntryLog";

export type VibeMode = "COLD" | "WARMING" | "HYPE" | "PEAK" | "LEGENDARY";

export interface VibePrediction {
  mode: VibeMode;
  arrivalVelocity: number;         // arrivals in the last 60s
  velocityTrend: "rising" | "stable" | "falling";
  predictedEnergyDelta: number;    // expected energy change in next ~60s
  confidence: number;              // 0.0–1.0 (higher with more history)
}

function countInWindow(entries: WarpEntry[], windowMs: number): number {
  const cutoff = Date.now() - windowMs;
  return entries.filter((e) => e.recordedAt > cutoff).length;
}

export function predictVibeMode(
  entries: WarpEntry[],
  currentEnergy: number,
): VibePrediction {
  const perMin   = countInWindow(entries, 60_000);
  const recent30 = countInWindow(entries, 30_000);
  const prior30  = perMin - recent30;

  const velocityTrend: "rising" | "stable" | "falling" =
    recent30 > prior30 + 1 ? "rising" :
    recent30 < prior30 - 1 ? "falling" : "stable";

  // Pre-emptive HYPE: rising velocity + moderate energy declares HYPE before threshold
  let mode: VibeMode;
  if      (currentEnergy >= 85) mode = "LEGENDARY";
  else if (currentEnergy >= 65 || (velocityTrend === "rising" && perMin >= 5 && currentEnergy >= 50)) mode = "PEAK";
  else if (currentEnergy >= 45 || (velocityTrend === "rising" && perMin >= 3 && currentEnergy >= 35)) mode = "HYPE";
  else if (currentEnergy >= 20 || perMin >= 2) mode = "WARMING";
  else mode = "COLD";

  const predictedEnergyDelta =
    velocityTrend === "rising"  ? Math.min(perMin * 2, 12) :
    velocityTrend === "falling" ? -3 : 0;

  return {
    mode,
    arrivalVelocity: perMin,
    velocityTrend,
    predictedEnergyDelta,
    confidence: Math.min(1.0, entries.length / 8),
  };
}

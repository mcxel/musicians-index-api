// CrowdMomentumEngine — crowd momentum tracking, energy scoring, heat detection

import { lobbyBehaviorEngine } from '@/lib/learning/LobbyBehaviorEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';

export type MomentumSample = {
  timestamp: number;
  reactionRate: number; // reactions per 10 seconds
  apllausePower: number; // 0-100
  hypeLevel: number; // 0-100
  momentum: number; // composite 0-100
};

export type CrowdMomentumState = {
  venueSlug: string;
  current: number; // 0-100
  peak: number;
  trend: "rising" | "falling" | "steady";
  samples: MomentumSample[];
  heatEvents: string[]; // significant crowd moments
};

const momentumRegistry = new Map<string, CrowdMomentumState>();

export function getCrowdMomentum(venueSlug: string): CrowdMomentumState {
  if (!momentumRegistry.has(venueSlug)) {
    momentumRegistry.set(venueSlug, {
      venueSlug,
      current: 0,
      peak: 0,
      trend: "steady",
      samples: [],
      heatEvents: [],
    });
  }
  return momentumRegistry.get(venueSlug)!;
}

export function recordMomentumSample(
  venueSlug: string,
  reactionRate: number,
  appLausePower: number,
  hypeLevel: number,
): MomentumSample {
  const state = getCrowdMomentum(venueSlug);
  const lobbySignal = lobbyBehaviorEngine.getLobbySignals(30).find((signal) => signal.lobbyId === venueSlug);
  const requestedPacing = reactionRate + Math.round((lobbySignal?.retentionScore ?? 0) / 40);
  const pacingMutation = applySafeLearningMutation({
    engine: 'CrowdMomentumEngine',
    targetId: venueSlug,
    metric: 'reaction-pacing',
    beforeValue: reactionRate,
    requestedValue: requestedPacing,
    minValue: 0,
    maxValue: 140,
    confidence: lobbySignal ? 0.69 : 0.5,
    reason: 'crowd reaction pacing adapts from lobby retention signals',
  });

  const momentum = Math.min(
    100,
    Math.round(pacingMutation.appliedValue * 0.4 + appLausePower * 0.35 + hypeLevel * 0.25),
  );

  const sample: MomentumSample = {
    timestamp: Date.now(),
    reactionRate: pacingMutation.appliedValue,
    apllausePower: appLausePower,
    hypeLevel,
    momentum,
  };

  state.samples.push(sample);
  // Keep last 120 samples
  if (state.samples.length > 120) state.samples.splice(0, state.samples.length - 120);

  // Trend detection from last 5 samples
  if (state.samples.length >= 5) {
    const recent = state.samples.slice(-5);
    const first = recent[0].momentum;
    const last = recent[recent.length - 1].momentum;
    const delta = last - first;
    state.trend = delta > 5 ? "rising" : delta < -5 ? "falling" : "steady";
  }

  state.current = momentum;
  if (momentum > state.peak) state.peak = momentum;

  // Heat events
  if (momentum >= 85 && (state.heatEvents.length === 0 || Date.now() - state.samples[state.samples.length - 2]?.timestamp > 30000)) {
    state.heatEvents.push(`[${new Date().toISOString()}] HEAT EVENT — momentum ${momentum}`);
  }

  return sample;
}

export function getMomentumSnapshot(venueSlug: string) {
  const state = getCrowdMomentum(venueSlug);
  return {
    venueSlug: state.venueSlug,
    current: state.current,
    peak: state.peak,
    trend: state.trend,
    recentSamples: state.samples.slice(-10),
    heatEvents: state.heatEvents.slice(-5),
  };
}

export function resetMomentum(venueSlug: string): void {
  momentumRegistry.set(venueSlug, {
    venueSlug,
    current: 0,
    peak: 0,
    trend: "steady",
    samples: [],
    heatEvents: [],
  });
}

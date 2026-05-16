/**
 * AudienceEnergyEngine
 * Aggregates crowd signals into a normalized energy score that drives
 * Julius mood, lighting presets, and host escalation triggers.
 */

import { getCrowdSnapshot, type CrowdMood } from "@/lib/personality/CrowdReactionEngine";

export type EnergyTier = "flat" | "low" | "building" | "peak" | "overflow";

export interface AudienceEnergyState {
  roomId: string;
  tier: EnergyTier;
  normalizedScore: number;    // 0.0 – 1.0
  crowdMood: CrowdMood | null;
  momentum: number;           // positive = rising, negative = falling
  consecutivePeakTicks: number;
  lastTierChangeAt: number;
  updatedAt: number;
}

export type EnergyListener = (state: AudienceEnergyState) => void;

const TIER_THRESHOLDS: Array<[EnergyTier, number]> = [
  ["overflow", 0.92],
  ["peak",     0.72],
  ["building", 0.45],
  ["low",      0.20],
  ["flat",     0],
];

const energyStates = new Map<string, AudienceEnergyState>();
const energyListeners = new Map<string, Set<EnergyListener>>();
const prevScores = new Map<string, number>();

function deriveTier(score: number): EnergyTier {
  for (const [tier, threshold] of TIER_THRESHOLDS) {
    if (score >= threshold) return tier;
  }
  return "flat";
}

function notify(roomId: string, state: AudienceEnergyState): void {
  energyListeners.get(roomId)?.forEach(l => l(state));
}

export function syncEnergyFromCrowd(roomId: string): AudienceEnergyState {
  const crowd = getCrowdSnapshot(roomId);
  const rawScore = crowd ? crowd.energyScore / 100 : 0;
  const crowdMood = crowd?.mood ?? null;

  const prev = prevScores.get(roomId) ?? rawScore;
  const momentum = rawScore - prev;
  prevScores.set(roomId, rawScore);

  const tier = deriveTier(rawScore);
  const existing = energyStates.get(roomId);
  const tierChanged = existing?.tier !== tier;
  const consecutivePeakTicks = tier === "peak" || tier === "overflow"
    ? (existing?.consecutivePeakTicks ?? 0) + 1
    : 0;

  const state: AudienceEnergyState = {
    roomId,
    tier,
    normalizedScore: rawScore,
    crowdMood,
    momentum,
    consecutivePeakTicks,
    lastTierChangeAt: tierChanged ? Date.now() : (existing?.lastTierChangeAt ?? Date.now()),
    updatedAt: Date.now(),
  };

  energyStates.set(roomId, state);
  notify(roomId, state);
  return state;
}

export function overrideEnergyScore(roomId: string, score: number): AudienceEnergyState {
  const clamped = Math.max(0, Math.min(1, score));
  const existing = energyStates.get(roomId);
  const tier = deriveTier(clamped);
  const prev = prevScores.get(roomId) ?? clamped;
  prevScores.set(roomId, clamped);

  const state: AudienceEnergyState = {
    roomId,
    tier,
    normalizedScore: clamped,
    crowdMood: existing?.crowdMood ?? null,
    momentum: clamped - prev,
    consecutivePeakTicks: tier === "peak" || tier === "overflow"
      ? (existing?.consecutivePeakTicks ?? 0) + 1 : 0,
    lastTierChangeAt: existing?.tier !== tier ? Date.now() : (existing?.lastTierChangeAt ?? Date.now()),
    updatedAt: Date.now(),
  };

  energyStates.set(roomId, state);
  notify(roomId, state);
  return state;
}

export function getEnergyState(roomId: string): AudienceEnergyState | null {
  return energyStates.get(roomId) ?? null;
}

export function subscribeToEnergy(roomId: string, listener: EnergyListener): () => void {
  if (!energyListeners.has(roomId)) energyListeners.set(roomId, new Set());
  energyListeners.get(roomId)!.add(listener);
  const current = energyStates.get(roomId);
  if (current) listener(current);
  return () => energyListeners.get(roomId)?.delete(listener);
}

export function isAtPeak(roomId: string): boolean {
  const state = energyStates.get(roomId);
  return state ? state.tier === "peak" || state.tier === "overflow" : false;
}

export function isBuilding(roomId: string): boolean {
  const state = energyStates.get(roomId);
  return state ? state.momentum > 0.02 : false;
}

export function getAllEnergyStates(): AudienceEnergyState[] {
  return [...energyStates.values()];
}

/**
 * RoomEnergyEngine
 * Tracks and broadcasts live room energy — combines occupancy,
 * real vs bot ratio, tips, reactions, and time-in-room signals.
 *
 * Energy score (0–100) drives:
 *   - Billboard pulse intensity
 *   - Stage lighting intensity (future)
 *   - Crowd reaction animation speed
 *   - Push notification trigger ("room is heating up!")
 *
 * Tier 1B integration: Auto-drives StageDirectorEngine lighting based on energy.
 * Energy levels: 0-20 (Quiet) → 21-40 (Warm) → 41-60 (Active) → 61-80 (Electric) → 81-100 (Explosive)
 */

import { lobbyBehaviorEngine } from '@/lib/learning/LobbyBehaviorEngine';
import { rewardResponseEngine } from '@/lib/learning/RewardResponseEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';
import { subscribeToCrowdRoom, type CrowdSnapshot } from '@/lib/personality/CrowdReactionEngine';
import { setLightingPreset, triggerEffect } from '@/lib/live/StageDirectorEngine';

export interface RoomEnergyState {
  roomId: string;
  energyScore: number;       // 0–100
  energyLabel: EnergyLabel;
  lightingIntensity: number; // 0-100
  excitementCurve: number;   // 0-100
  trend: "rising" | "falling" | "stable";
  peakEnergy: number;
  peakAt?: number;
  signalCounts: {
    tips: number;
    reactions: number;
    joins: number;
    votes: number;
    gifts: number;
  };
  lastUpdated: number;
}

type EnergyLabel = "COLD" | "WARMING" | "HOT" | "ON FIRE" | "LEGENDARY";

const ENERGY_THRESHOLDS: Array<{ min: number; label: EnergyLabel }> = [
  { min: 80, label: "LEGENDARY" },
  { min: 60, label: "ON FIRE" },
  { min: 40, label: "HOT" },
  { min: 20, label: "WARMING" },
  { min: 0,  label: "COLD" },
];

function labelFor(score: number): EnergyLabel {
  return ENERGY_THRESHOLDS.find((t) => score >= t.min)?.label ?? "COLD";
}

function lightingPresetForEnergy(score: number): string {
  if (score <= 20) return 'blackout';
  if (score <= 40) return 'purple-wash';
  if (score <= 60) return 'blue-arena';
  if (score <= 80) return 'concert-red';
  return 'rainbow';
}

function effectForEnergy(score: number): string | null {
  if (score > 80) return 'laser';
  if (score > 60) return 'strobe';
  return null;
}

class RoomEnergyEngine {
  private states = new Map<string, RoomEnergyState>();
  private crowdUnsubscribes = new Map<string, () => void>();
  private lastLightingUpdate = new Map<string, number>();

  initRoom(roomId: string): RoomEnergyState {
    const state: RoomEnergyState = {
      roomId,
      energyScore: 5,
      energyLabel: "COLD",
      lightingIntensity: 8,
      excitementCurve: 10,
      trend: "stable",
      peakEnergy: 5,
      signalCounts: { tips: 0, reactions: 0, joins: 0, votes: 0, gifts: 0 },
      lastUpdated: Date.now(),
    };
    this.states.set(roomId, state);

    // Subscribe to crowd energy and auto-drive lighting
    const unsubscribe = subscribeToCrowdRoom(roomId, (crowd: CrowdSnapshot) => {
      this.updateFromCrowd(roomId, crowd);
    });
    this.crowdUnsubscribes.set(roomId, unsubscribe);

    return state;
  }

  private updateFromCrowd(roomId: string, crowd: CrowdSnapshot): void {
    const state = this.states.get(roomId);
    if (!state) return;

    const now = Date.now();
    const lastUpdate = this.lastLightingUpdate.get(roomId) ?? 0;

    // Only update lighting every 500ms to avoid thrashing
    if (now - lastUpdate < 500) return;

    const newPreset = lightingPresetForEnergy(crowd.energyScore);
    const oldPreset = lightingPresetForEnergy(state.energyScore);

    // Auto-drive lighting when energy changes
    if (newPreset !== oldPreset) {
      setLightingPreset(newPreset);
      this.lastLightingUpdate.set(roomId, now);
    }

    // Trigger effect at energy thresholds
    const newEffect = effectForEnergy(crowd.energyScore);
    const oldEffect = effectForEnergy(state.energyScore);
    if (newEffect && newEffect !== oldEffect) {
      triggerEffect(newEffect as any);
    }
  }

  private bump(roomId: string, delta: number): RoomEnergyState | null {
    const s = this.states.get(roomId);
    if (!s) return null;
    const lobbySignal = lobbyBehaviorEngine.getLobbySignals(40).find((item) => item.lobbyId === roomId);
    const rewardSignal = rewardResponseEngine.getRewardResponse(40)[0];
    const requestedDelta = delta + Math.round((lobbySignal?.retentionScore ?? 0) / 100) + Math.round((rewardSignal?.upliftScore ?? 0) / 30);
    const deltaMutation = applySafeLearningMutation({
      engine: 'RoomEnergyEngine',
      targetId: roomId,
      metric: 'energy-delta',
      beforeValue: delta,
      requestedValue: requestedDelta,
      minValue: -8,
      maxValue: 15,
      confidence: lobbySignal || rewardSignal ? 0.7 : 0.5,
      reason: 'event pacing and excitement adapt from retention and reward response',
    });

    const prev = s.energyScore;
    s.energyScore = Math.min(100, Math.max(0, s.energyScore + deltaMutation.appliedValue));
    s.energyLabel = labelFor(s.energyScore);
    s.lightingIntensity = Math.min(100, Math.max(0, Math.round(s.energyScore * 0.95)));
    s.excitementCurve = Math.min(100, Math.max(0, Math.round((s.energyScore + s.signalCounts.reactions) / 2)));
    s.trend = s.energyScore > prev ? "rising" : s.energyScore < prev ? "falling" : "stable";
    if (s.energyScore > s.peakEnergy) {
      s.peakEnergy = s.energyScore;
      s.peakAt = Date.now();
    }
    s.lastUpdated = Date.now();
    return s;
  }

  recordJoin(roomId: string): void {
    const s = this.states.get(roomId);
    if (s) s.signalCounts.joins++;
    this.bump(roomId, 3);
  }

  recordLeave(roomId: string): void {
    this.bump(roomId, -1);
  }

  recordReaction(roomId: string): void {
    const s = this.states.get(roomId);
    if (s) s.signalCounts.reactions++;
    this.bump(roomId, 1);
  }

  recordTip(roomId: string, amountUsd: number): void {
    const s = this.states.get(roomId);
    if (s) s.signalCounts.tips++;
    this.bump(roomId, Math.min(10, Math.ceil(amountUsd / 2)));
  }

  recordVote(roomId: string): void {
    const s = this.states.get(roomId);
    if (s) s.signalCounts.votes++;
    this.bump(roomId, 2);
  }

  recordGift(roomId: string): void {
    const s = this.states.get(roomId);
    if (s) s.signalCounts.gifts++;
    this.bump(roomId, 5);
  }

  /** Natural decay — call on a tick (e.g. every 30s) */
  decay(roomId: string, amount = 2): void {
    this.bump(roomId, -amount);
  }

  getState(roomId: string): RoomEnergyState | undefined {
    return this.states.get(roomId);
  }

  getTopRooms(n = 5): RoomEnergyState[] {
    return [...this.states.values()]
      .sort((a, b) => b.energyScore - a.energyScore)
      .slice(0, n);
  }

  destroyRoom(roomId: string): void {
    const unsubscribe = this.crowdUnsubscribes.get(roomId);
    if (unsubscribe) unsubscribe();
    this.crowdUnsubscribes.delete(roomId);
    this.states.delete(roomId);
    this.lastLightingUpdate.delete(roomId);
  }
}

export const roomEnergyEngine = new RoomEnergyEngine();


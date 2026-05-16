/**
 * AvatarBehaviorTuningEngine
 * Applies safe, bounded behavior updates based on learning signals.
 * Reads from AvatarLearningEngine and AvatarSkillGrowthEngine.
 * Never autonomous — all tuning is observable and reversible.
 */

import type { AvatarBehaviorMode } from "@/lib/avatar/AvatarBehaviorEngine";
import type { AvatarSkill } from "@/lib/avatar/AvatarSkillGrowthEngine";
import type { MotionDirectiveType } from "@/lib/avatar/AvatarDailyMotionEngine";

export interface BehaviorTuningProfile {
  avatarId: string;
  preferredMode: AvatarBehaviorMode;
  preferredMotion: MotionDirectiveType;
  idleVarianceEnabled: boolean;
  reactionSpeed: "slow" | "normal" | "fast";
  crowdEngagementLevel: "passive" | "reactive" | "active";
  emoteFrequency: "low" | "medium" | "high";
  lipSyncAccuracy: "rough" | "moderate" | "precise";
  lastTuned: number;
  tuningSource: "learning" | "manual" | "default";
}

export interface TuningUpdate {
  field: keyof BehaviorTuningProfile;
  previousValue: unknown;
  newValue: unknown;
  reason: string;
  timestamp: number;
}

const DEFAULT_PROFILE: Omit<BehaviorTuningProfile, "avatarId"> = {
  preferredMode: "idle",
  preferredMotion: "idle",
  idleVarianceEnabled: true,
  reactionSpeed: "normal",
  crowdEngagementLevel: "reactive",
  emoteFrequency: "medium",
  lipSyncAccuracy: "moderate",
  lastTuned: 0,
  tuningSource: "default",
};

const tuningStore = new Map<string, BehaviorTuningProfile>();
const tuningHistory = new Map<string, TuningUpdate[]>();

const MAX_HISTORY = 50;

export function getTuningProfile(avatarId: string): BehaviorTuningProfile {
  const existing = tuningStore.get(avatarId);
  if (existing) return existing;
  const fresh: BehaviorTuningProfile = { avatarId, ...DEFAULT_PROFILE };
  tuningStore.set(avatarId, fresh);
  return fresh;
}

export function applyTuningFromSkills(
  avatarId: string,
  skills: Partial<Record<AvatarSkill, number>>
): BehaviorTuningProfile {
  const profile = getTuningProfile(avatarId);
  const updates: TuningUpdate[] = [];

  function update<K extends keyof BehaviorTuningProfile>(
    field: K,
    newValue: BehaviorTuningProfile[K],
    reason: string
  ): void {
    if (profile[field] !== newValue) {
      updates.push({ field, previousValue: profile[field], newValue, reason, timestamp: Date.now() });
      (profile as unknown as Record<string, unknown>)[field] = newValue;
    }
  }

  const danceLevel = skills["dancing"] ?? 1;
  const socialLevel = skills["social_response_timing"] ?? 1;
  const cameraLevel = skills["camera_awareness"] ?? 1;
  const lipSyncLevel = skills["lip_sync"] ?? 1;
  const emoteLevel = skills["emotes"] ?? 1;

  if (danceLevel >= 7) update("preferredMotion", "dancing", "dance skill level 7+");
  if (danceLevel >= 9) update("preferredMode", "stage", "dance skill level 9+");
  if (socialLevel >= 5) update("reactionSpeed", "fast", "social timing skill 5+");
  if (cameraLevel >= 6) update("crowdEngagementLevel", "active", "camera awareness 6+");
  if (lipSyncLevel >= 7) update("lipSyncAccuracy", "precise", "lip sync skill 7+");
  if (emoteLevel >= 4) update("emoteFrequency", "high", "emote skill 4+");
  if (emoteLevel <= 2) update("emoteFrequency", "low", "emote skill 2 or below");
  if (danceLevel >= 3) update("idleVarianceEnabled", true, "dance skill 3+ unlocks idle variance");

  if (updates.length > 0) {
    profile.lastTuned = Date.now();
    profile.tuningSource = "learning";
    const history = tuningHistory.get(avatarId) ?? [];
    tuningHistory.set(avatarId, [...updates, ...history].slice(0, MAX_HISTORY));
    tuningStore.set(avatarId, profile);
  }

  return profile;
}

export function getTuningHistory(avatarId: string): TuningUpdate[] {
  return tuningHistory.get(avatarId) ?? [];
}

export function resetTuningToDefault(avatarId: string): BehaviorTuningProfile {
  const reset: BehaviorTuningProfile = { avatarId, ...DEFAULT_PROFILE, lastTuned: Date.now(), tuningSource: "manual" };
  tuningStore.set(avatarId, reset);
  return reset;
}

export function getAllTuningProfiles(): BehaviorTuningProfile[] {
  return [...tuningStore.values()];
}

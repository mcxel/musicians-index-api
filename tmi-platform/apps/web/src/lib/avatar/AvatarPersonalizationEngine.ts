/**
 * AvatarPersonalizationEngine
 * Synthesizes all learning signals into a single personalization profile per avatar.
 * This is the read layer — consumers query here for the final recommended behavior.
 */

import { getAvatarLearningState } from "@/lib/avatar/AvatarLearningEngine";
import { getAvatarMemory } from "@/lib/avatar/AvatarInteractionMemoryEngine";
import { getSkillSheet } from "@/lib/avatar/AvatarSkillGrowthEngine";
import { getVisualEvolutionState } from "@/lib/avatar/AvatarVisualEvolutionEngine";
import { getTuningProfile } from "@/lib/avatar/AvatarBehaviorTuningEngine";
import type { AvatarBehaviorMode } from "@/lib/avatar/AvatarBehaviorEngine";
import type { MotionDirectiveType } from "@/lib/avatar/AvatarDailyMotionEngine";

export interface AvatarPersonalizationProfile {
  avatarId: string;
  recommendedMode: AvatarBehaviorMode;
  recommendedMotion: MotionDirectiveType;
  confidenceLevel: number;
  tier: string;
  totalXP: number;
  glowMultiplier: number;
  expressionRange: number;
  motionFluidity: number;
  auraColor: string | null;
  crownEligible: boolean;
  dominantInteraction: string | null;
  currentBehaviorSuggestion: string;
  emoteFrequency: string;
  lipSyncAccuracy: string;
  reactionSpeed: string;
  snapshotAt: number;
}

export function getPersonalizationProfile(avatarId: string): AvatarPersonalizationProfile {
  const learning = getAvatarLearningState(avatarId);
  const memory = getAvatarMemory(avatarId);
  const skills = getSkillSheet(avatarId);
  const visual = getVisualEvolutionState(avatarId);
  const tuning = getTuningProfile(avatarId);

  return {
    avatarId,
    recommendedMode: tuning.preferredMode,
    recommendedMotion: tuning.preferredMotion,
    confidenceLevel: learning.confidenceLevel,
    tier: visual.tier,
    totalXP: skills.totalXP,
    glowMultiplier: visual.glowIntensityMultiplier,
    expressionRange: visual.expressionRange,
    motionFluidity: visual.motionFluidity,
    auraColor: visual.auraColor,
    crownEligible: visual.crownEligible,
    dominantInteraction: memory.dominantInteractionType,
    currentBehaviorSuggestion: learning.currentBehaviorSuggestion,
    emoteFrequency: tuning.emoteFrequency,
    lipSyncAccuracy: tuning.lipSyncAccuracy,
    reactionSpeed: tuning.reactionSpeed,
    snapshotAt: Date.now(),
  };
}

export function getBulkProfiles(avatarIds: string[]): AvatarPersonalizationProfile[] {
  return avatarIds.map(id => getPersonalizationProfile(id));
}

export function getPersonalizationSummary(avatarId: string): string {
  const p = getPersonalizationProfile(avatarId);
  return `${avatarId} · tier:${p.tier} · xp:${p.totalXP} · confidence:${(p.confidenceLevel * 100).toFixed(0)}% · ${p.currentBehaviorSuggestion}`;
}

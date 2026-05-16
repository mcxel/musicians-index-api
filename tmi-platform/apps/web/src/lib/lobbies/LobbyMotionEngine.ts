/**
 * LobbyMotionEngine.ts
 *
 * Orchestrates ambient motion and animation in lobbies.
 * Purpose: Make lobbies feel alive with movement, reactions, and ambient activity.
 */

export interface AmbientMotionLoop {
  loopId: string;
  lobbyId: string;
  animationType:
    | 'idle-sway'
    | 'head-nod'
    | 'hand-gesture'
    | 'dance-loop'
    | 'crowd-pulse'
    | 'walk-path';
  targetPlacementId?: string;
  targetAvatarCount?: number; // null = all avatars
  duration: number; // ms
  intensity: number; // 0-1
  startedAt: number;
  isActive: boolean;
  loop: number; // iteration count
}

export interface AvatarReaction {
  reactionId: string;
  placementId: string;
  reactionType: 'clap' | 'cheer' | 'gasp' | 'laugh' | 'point' | 'wave' | 'thumbs-up' | 'confusion';
  triggeredBy?: string; // event ID that triggered reaction
  duration: number;
  startedAt: number;
  isComplete: boolean;
}

export interface LobbyMotionConfig {
  lobbyId: string;
  ambientMotionEnabled: boolean;
  reactivityLevel: number; // 0-1
  crowdPulseFrequency: number; // pulses per minute
  movementPathsEnabled: boolean;
  syncMotionToAudio: boolean;
  audioTrackId?: string;
}

// In-memory motion registries
const ambientMotionLoops = new Map<string, AmbientMotionLoop>();
const avatarReactions = new Map<string, AvatarReaction>();
const motionConfigs = new Map<string, LobbyMotionConfig>();
let loopCounter = 0;
let reactionCounter = 0;

/**
 * Initializes motion config for lobby.
 */
export function configureLobbyMotion(input: {
  lobbyId: string;
  ambientMotionEnabled?: boolean;
  reactivityLevel?: number;
  crowdPulseFrequency?: number;
  movementPathsEnabled?: boolean;
  syncMotionToAudio?: boolean;
  audioTrackId?: string;
}): void {
  const config: LobbyMotionConfig = {
    lobbyId: input.lobbyId,
    ambientMotionEnabled: input.ambientMotionEnabled ?? true,
    reactivityLevel: Math.min(1, Math.max(0, input.reactivityLevel ?? 0.6)),
    crowdPulseFrequency: input.crowdPulseFrequency ?? 40,
    movementPathsEnabled: input.movementPathsEnabled ?? true,
    syncMotionToAudio: input.syncMotionToAudio ?? false,
    audioTrackId: input.audioTrackId,
  };

  motionConfigs.set(input.lobbyId, config);
}

/**
 * Starts ambient motion loop in lobby.
 */
export function startAmbientMotion(input: {
  lobbyId: string;
  animationType:
    | 'idle-sway'
    | 'head-nod'
    | 'hand-gesture'
    | 'dance-loop'
    | 'crowd-pulse'
    | 'walk-path';
  targetPlacementId?: string;
  targetAvatarCount?: number;
  duration: number;
  intensity?: number;
}): string {
  const loopId = `motion-loop-${loopCounter++}-${input.lobbyId}`;

  const loop: AmbientMotionLoop = {
    loopId,
    lobbyId: input.lobbyId,
    animationType: input.animationType,
    targetPlacementId: input.targetPlacementId,
    targetAvatarCount: input.targetAvatarCount,
    duration: input.duration,
    intensity: Math.min(1, Math.max(0, input.intensity ?? 0.7)),
    startedAt: Date.now(),
    isActive: true,
    loop: 0,
  };

  ambientMotionLoops.set(loopId, loop);
  return loopId;
}

/**
 * Stops ambient motion loop.
 */
export function stopAmbientMotion(loopId: string): void {
  const loop = ambientMotionLoops.get(loopId);
  if (loop) {
    loop.isActive = false;
  }
}

/**
 * Increments motion loop iteration.
 */
export function advanceMotionLoop(loopId: string): void {
  const loop = ambientMotionLoops.get(loopId);
  if (loop) {
    loop.loop += 1;
  }
}

/**
 * Triggers avatar reaction.
 */
export function triggerAvatarReaction(input: {
  placementId: string;
  reactionType: 'clap' | 'cheer' | 'gasp' | 'laugh' | 'point' | 'wave' | 'thumbs-up' | 'confusion';
  triggeredBy?: string;
  duration?: number;
}): string {
  const reactionId = `reaction-${reactionCounter++}`;

  const reaction: AvatarReaction = {
    reactionId,
    placementId: input.placementId,
    reactionType: input.reactionType,
    triggeredBy: input.triggeredBy,
    duration: input.duration ?? 1500,
    startedAt: Date.now(),
    isComplete: false,
  };

  avatarReactions.set(reactionId, reaction);
  return reactionId;
}

/**
 * Marks reaction as complete.
 */
export function completeReaction(reactionId: string): void {
  const reaction = avatarReactions.get(reactionId);
  if (reaction) {
    reaction.isComplete = true;
  }
}

/**
 * Lists active motion loops in lobby (non-mutating).
 */
export function listActiveMotionLoops(lobbyId: string): AmbientMotionLoop[] {
  return Array.from(ambientMotionLoops.values()).filter(
    (loop) => loop.lobbyId === lobbyId && loop.isActive
  );
}

/**
 * Lists active reactions for placement (non-mutating).
 */
export function listActiveReactionsForPlacement(placementId: string): AvatarReaction[] {
  return Array.from(avatarReactions.values()).filter(
    (reaction) => reaction.placementId === placementId && !reaction.isComplete
  );
}

/**
 * Gets motion config (non-mutating).
 */
export function getMotionConfig(lobbyId: string): LobbyMotionConfig | null {
  return motionConfigs.get(lobbyId) ?? null;
}

/**
 * Updates motion intensity for lobby.
 */
export function updateMotionIntensity(lobbyId: string, intensity: number): void {
  const config = motionConfigs.get(lobbyId);
  if (config) {
    config.reactivityLevel = Math.min(1, Math.max(0, intensity));
  }
}

/**
 * Enables/disables ambient motion.
 */
export function setAmbientMotionEnabled(lobbyId: string, enabled: boolean): void {
  const config = motionConfigs.get(lobbyId);
  if (config) {
    config.ambientMotionEnabled = enabled;
  }
}

/**
 * Gets motion report (non-mutating).
 */
export function getMotionReport(): {
  activeLoops: number;
  activeReactions: number;
  configuredLobbies: number;
  averageIntensity: number;
} {
  const activeLoops = Array.from(ambientMotionLoops.values()).filter((l) => l.isActive).length;
  const activeReactions = Array.from(avatarReactions.values()).filter((r) => !r.isComplete).length;
  const configuredLobbies = motionConfigs.size;

  const configs = Array.from(motionConfigs.values());
  const averageIntensity =
    configs.length > 0
      ? configs.reduce((sum, c) => sum + c.reactivityLevel, 0) / configs.length
      : 0;

  return {
    activeLoops,
    activeReactions,
    configuredLobbies,
    averageIntensity,
  };
}

/**
 * Gets reaction breakdown (admin stats).
 */
export function getReactionBreakdown(): Record<string, number> {
  const breakdown: Record<string, number> = {};

  Array.from(avatarReactions.values()).forEach((reaction) => {
    breakdown[reaction.reactionType] = (breakdown[reaction.reactionType] ?? 0) + 1;
  });

  return breakdown;
}

/**
 * Clears completed reactions (maintenance).
 */
export function clearCompletedReactions(): number {
  let clearedCount = 0;

  for (const [id, reaction] of avatarReactions.entries()) {
    if (reaction.isComplete && Date.now() - reaction.startedAt > reaction.duration + 5000) {
      avatarReactions.delete(id);
      clearedCount += 1;
    }
  }

  return clearedCount;
}

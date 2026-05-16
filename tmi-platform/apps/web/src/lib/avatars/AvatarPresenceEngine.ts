/**
 * AvatarPresenceEngine.ts
 *
 * Manages avatar states and presence across the platform.
 * Supports: standing, walking, sitting, reacting, idle, dancing.
 * Used in: personal lobbies, venue lobbies, battle rooms, fan hubs, artist hubs.
 * Purpose: Create realistic avatar behavior and social spaces.
 */

export interface AvatarState {
  avatarId: string;
  displayName: string;
  currentState: 'standing' | 'walking' | 'sitting' | 'reacting' | 'idle' | 'dancing';
  previousState?: 'standing' | 'walking' | 'sitting' | 'reacting' | 'idle' | 'dancing';
  position: { x: number; y: number; z: number };
  facing: number; // degrees 0-360
  stateStartedAt: number;
  stateDurationMs: number;
  animationProgress: number; // 0-1
  isEmoting: boolean;
  emotionType?: 'happy' | 'surprised' | 'confused' | 'excited' | 'sad' | 'neutral';
}

export interface AvatarTransition {
  transitionId: string;
  avatarId: string;
  fromState: string;
  toState: string;
  durationMs: number;
  transitionStartedAt: number;
  isComplete: boolean;
}

export interface AvatarBehaviorPattern {
  patternId: string;
  avatarId: string;
  behaviors: Array<{
    state: 'standing' | 'walking' | 'sitting' | 'reacting' | 'idle' | 'dancing';
    durationMs: number;
    probability: number; // 0-1
  }>;
  isActive: boolean;
  createdAt: number;
}

export interface PresenceSnapshot {
  avatarId: string;
  displayName: string;
  currentState: string;
  location?: string; // lobby ID or venue ID
  lastActiveAt: number;
  isAfk: boolean;
  afkDurationMs: number;
}

// In-memory registries
const avatarStates = new Map<string, AvatarState>();
const avatarTransitions = new Map<string, AvatarTransition>();
const behaviorPatterns = new Map<string, AvatarBehaviorPattern>();
const presenceSnapshots = new Map<string, PresenceSnapshot>();

/**
 * Creates or updates avatar state.
 */
export function updateAvatarState(input: {
  avatarId: string;
  displayName: string;
  currentState: 'standing' | 'walking' | 'sitting' | 'reacting' | 'idle' | 'dancing';
  position: { x: number; y: number; z: number };
  facing?: number;
  emotionType?: 'happy' | 'surprised' | 'confused' | 'excited' | 'sad' | 'neutral';
}): void {
  const existing = avatarStates.get(input.avatarId);

  const state: AvatarState = {
    avatarId: input.avatarId,
    displayName: input.displayName,
    currentState: input.currentState,
    previousState: existing?.currentState,
    position: input.position,
    facing: input.facing ?? 0,
    stateStartedAt: Date.now(),
    stateDurationMs: 0,
    animationProgress: 0,
    isEmoting: input.emotionType !== undefined,
    emotionType: input.emotionType,
  };

  avatarStates.set(input.avatarId, state);
}

/**
 * Transitions avatar between states.
 */
export function transitionAvatarState(input: {
  avatarId: string;
  fromState: string;
  toState: string;
  durationMs: number;
}): string {
  const transitionId = `transition-${Date.now()}-${Math.random()}`;

  const transition: AvatarTransition = {
    transitionId,
    avatarId: input.avatarId,
    fromState: input.fromState,
    toState: input.toState,
    durationMs: input.durationMs,
    transitionStartedAt: Date.now(),
    isComplete: false,
  };

  avatarTransitions.set(transitionId, transition);
  return transitionId;
}

/**
 * Completes transition.
 */
export function completeTransition(transitionId: string): void {
  const transition = avatarTransitions.get(transitionId);
  if (transition) {
    transition.isComplete = true;
  }
}

/**
 * Updates animation progress during transition.
 */
export function updateTransitionProgress(transitionId: string, progress: number): void {
  const transition = avatarTransitions.get(transitionId);
  if (transition) {
    const avatar = avatarStates.get(transition.avatarId);
    if (avatar) {
      avatar.animationProgress = Math.min(1, Math.max(0, progress));
    }
  }
}

/**
 * Sets or updates behavior pattern for avatar.
 */
export function setAvatarBehaviorPattern(input: {
  avatarId: string;
  behaviors: Array<{
    state: 'standing' | 'walking' | 'sitting' | 'reacting' | 'idle' | 'dancing';
    durationMs: number;
    probability: number;
  }>;
}): string {
  const patternId = `pattern-${input.avatarId}-${Date.now()}`;

  const pattern: AvatarBehaviorPattern = {
    patternId,
    avatarId: input.avatarId,
    behaviors: input.behaviors,
    isActive: true,
    createdAt: Date.now(),
  };

  behaviorPatterns.set(patternId, pattern);
  return patternId;
}

/**
 * Disables behavior pattern.
 */
export function disableBehaviorPattern(patternId: string): void {
  const pattern = behaviorPatterns.get(patternId);
  if (pattern) {
    pattern.isActive = false;
  }
}

/**
 * Gets next behavior from pattern (probabilistic).
 */
export function getNextBehaviorFromPattern(patternId: string): string | null {
  const pattern = behaviorPatterns.get(patternId);
  if (!pattern || !pattern.isActive) return null;

  const rand = Math.random();
  let accumulated = 0;

  for (const behavior of pattern.behaviors) {
    accumulated += behavior.probability;
    if (rand <= accumulated) {
      return behavior.state;
    }
  }

  return pattern.behaviors[0]?.state ?? null;
}

/**
 * Gets avatar state (non-mutating).
 */
export function getAvatarState(avatarId: string): AvatarState | null {
  return avatarStates.get(avatarId) ?? null;
}

/**
 * Records presence snapshot for avatar.
 */
export function recordPresenceSnapshot(input: {
  avatarId: string;
  displayName: string;
  currentState: string;
  location?: string;
}): void {
  const snapshot: PresenceSnapshot = {
    avatarId: input.avatarId,
    displayName: input.displayName,
    currentState: input.currentState,
    location: input.location,
    lastActiveAt: Date.now(),
    isAfk: false,
    afkDurationMs: 0,
  };

  presenceSnapshots.set(input.avatarId, snapshot);
}

/**
 * Marks avatar as AFK.
 */
export function markAvatarAFK(avatarId: string, afkDurationMs: number): void {
  const snapshot = presenceSnapshots.get(avatarId);
  if (snapshot) {
    snapshot.isAfk = true;
    snapshot.afkDurationMs = afkDurationMs;
  }
}

/**
 * Marks avatar as active.
 */
export function markAvatarActive(avatarId: string): void {
  const snapshot = presenceSnapshots.get(avatarId);
  if (snapshot) {
    snapshot.isAfk = false;
    snapshot.afkDurationMs = 0;
    snapshot.lastActiveAt = Date.now();
  }
}

/**
 * Lists all avatar states (non-mutating).
 */
export function listAllAvatarStates(): AvatarState[] {
  return Array.from(avatarStates.values());
}

/**
 * Lists avatars by state.
 */
export function listAvatarsByState(state: string): AvatarState[] {
  return Array.from(avatarStates.values()).filter((a) => a.currentState === state);
}

/**
 * Lists active transitions (non-mutating).
 */
export function listActiveTransitions(): AvatarTransition[] {
  return Array.from(avatarTransitions.values()).filter((t) => !t.isComplete);
}

/**
 * Gets presence snapshots (non-mutating).
 */
export function listPresenceSnapshots(): PresenceSnapshot[] {
  return Array.from(presenceSnapshots.values());
}

/**
 * Gets avatar presence report (admin stats).
 */
export function getPresenceReport(): {
  totalAvatars: number;
  byState: Record<string, number>;
  activeTransitions: number;
  afkAvatars: number;
  lastUpdateTime: number;
} {
  const states = listAllAvatarStates();
  const byState: Record<string, number> = {};

  states.forEach((state) => {
    byState[state.currentState] = (byState[state.currentState] ?? 0) + 1;
  });

  const snapshots = listPresenceSnapshots();
  const afkCount = snapshots.filter((s) => s.isAfk).length;

  return {
    totalAvatars: states.length,
    byState,
    activeTransitions: listActiveTransitions().length,
    afkAvatars: afkCount,
    lastUpdateTime: Date.now(),
  };
}

/**
 * Removes avatar state (cleanup on logout).
 */
export function removeAvatarState(avatarId: string): void {
  avatarStates.delete(avatarId);
  presenceSnapshots.delete(avatarId);
}

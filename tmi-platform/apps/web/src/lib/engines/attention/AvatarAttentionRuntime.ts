'use client';

/**
 * AvatarAttentionRuntime
 *
 * Consumes AttentionVector[] from CrowdAttentionEngine
 * Outputs smooth, interpolated head/eye rotations for rendering
 *
 * Implements:
 * - Eye movement (instant)
 * - Head delay (100-250ms after eyes)
 * - Body cascade (neck→shoulders→torso follow head)
 * - Smooth easing on all transitions
 * - No snapping (Rule 9: Attention Always Has Momentum)
 */

import type { AttentionVector } from '@/lib/engines/runtime/CrowdAttentionEngine';

export interface AvatarAttentionState {
  avatarId: string;

  // Current targets
  currentTarget: string;          // e.g. "stage", "performer:id", "avatar:id"
  previousTarget: string;         // for smooth transitions

  // Eye movement (immediate)
  eyeYaw: number;                 // -1 to 1
  eyePitch: number;               // -1 to 1

  // Head movement (delayed from eyes)
  headYaw: number;                // -1 to 1
  headPitch: number;              // -1 to 1
  headDelay: number;              // ms until head begins moving

  // Body cascade (slight offset from head)
  neckRotation: number;           // inherits head with ~50ms lag
  shoulderRotation: number;       // inherits neck with ~50ms lag

  // Blend state
  transitionProgress: number;     // 0-1, interpolating between targets
  blendDuration: number;          // ms to blend this transition
  blendStartedAt: number;         // timestamp

  // Debug
  sourceLabel: string;            // what caused this attention
  lastUpdatedAt: number;
}

export interface AttentionRuntimeConfig {
  // Easing
  eyeResponseTimeMs?: number;     // default 50ms (instant)
  headDelayMs?: number;           // default 150ms after eyes
  blendDurationMs?: number;       // default 400ms smooth blend
  neckLagMs?: number;             // default 50ms behind head
  shoulderLagMs?: number;         // default 100ms behind head

  // Decay
  attentionDecayPerFrame?: number; // how fast unused attention fades (default 0.98)
}

class AvatarAttentionRuntime {
  private states = new Map<string, AvatarAttentionState>();
  private config: Required<AttentionRuntimeConfig>;

  constructor(config: AttentionRuntimeConfig = {}) {
    this.config = {
      eyeResponseTimeMs: config.eyeResponseTimeMs ?? 50,
      headDelayMs: config.headDelayMs ?? 150,
      blendDurationMs: config.blendDurationMs ?? 400,
      neckLagMs: config.neckLagMs ?? 50,
      shoulderLagMs: config.shoulderLagMs ?? 100,
      attentionDecayPerFrame: config.attentionDecayPerFrame ?? 0.98,
    };
  }

  /**
   * Update avatar attention from incoming AttentionVector[]
   * Called when CrowdAttentionEngine emits new attention data
   */
  updateFromAttentionVectors(avatarIds: string[], vectors: AttentionVector[]): void {
    const now = Date.now();
    const vectorMap = new Map(vectors.map(v => [v.avatarId, v]));

    for (const avatarId of avatarIds) {
      const vector = vectorMap.get(avatarId);
      if (!vector) continue;

      const existing = this.states.get(avatarId);
      const state = existing ?? {
        avatarId,
        currentTarget: vector.targetLabel,
        previousTarget: vector.targetLabel,
        eyeYaw: vector.yaw,
        eyePitch: vector.pitch,
        headYaw: vector.yaw,
        headPitch: vector.pitch,
        headDelay: 0,
        neckRotation: 0,
        shoulderRotation: 0,
        transitionProgress: 1,
        blendDuration: 0,
        blendStartedAt: now,
        sourceLabel: 'init',
        lastUpdatedAt: now,
      };

      // If target changed, start blend
      if (vector.targetLabel !== state.currentTarget) {
        state.previousTarget = state.currentTarget;
        state.currentTarget = vector.targetLabel;
        state.transitionProgress = 0;
        state.blendStartedAt = now;
        state.blendDuration = Math.max(
          this.config.blendDurationMs * (1 - vector.intensity),
          150 // minimum 150ms blend
        );
      }

      // Update eye position immediately
      state.eyeYaw = this.lerp(state.eyeYaw, vector.yaw, 0.3);    // smooth but responsive
      state.eyePitch = this.lerp(state.eyePitch, vector.pitch, 0.3);

      // Head follows eyes with delay (simulated via headDelay countdown)
      if (state.headDelay <= 0) {
        state.headYaw = this.lerp(state.headYaw, vector.yaw, 0.2);
        state.headPitch = this.lerp(state.headPitch, vector.pitch, 0.2);
      } else {
        state.headDelay -= 16; // approximate frame time
      }

      // Neck and shoulders follow head with cascading lag
      const neckTargetYaw = this.lerp(state.headYaw, vector.yaw, 0.8);
      state.neckRotation = this.lerp(state.neckRotation, neckTargetYaw, 0.15);

      const shoulderTargetYaw = this.lerp(state.neckRotation, state.headYaw, 0.5);
      state.shoulderRotation = this.lerp(state.shoulderRotation, shoulderTargetYaw, 0.1);

      state.sourceLabel = vector.targetLabel;
      state.lastUpdatedAt = now;

      this.states.set(avatarId, state);
    }
  }

  /**
   * Get current visual output for an avatar
   * Returns interpolated, eased values ready for rendering
   */
  getVisualOutput(avatarId: string): {
    headYaw: number;
    headPitch: number;
    eyeYaw: number;
    eyePitch: number;
    neckRotation: number;
    shoulderRotation: number;
    blendProgress: number;
  } | null {
    const state = this.states.get(avatarId);
    if (!state) return null;

    const now = Date.now();
    const age = now - state.blendStartedAt;
    const blendProgress = Math.min(1, age / state.blendDuration);

    return {
      headYaw: state.headYaw,
      headPitch: state.headPitch,
      eyeYaw: state.eyeYaw,
      eyePitch: state.eyePitch,
      neckRotation: state.neckRotation,
      shoulderRotation: state.shoulderRotation,
      blendProgress,
    };
  }

  /**
   * Get full internal state for debug overlay
   */
  getDebugState(avatarId: string): AvatarAttentionState | null {
    return this.states.get(avatarId) ?? null;
  }

  /**
   * Get stats across all avatars for debug overlay
   */
  getStats(avatarIds: string[]): {
    avgHeadYaw: number;
    avgHeadPitch: number;
    avgIntensity: number;
    transitioningCount: number;
  } {
    const states = avatarIds
      .map(id => this.states.get(id))
      .filter(Boolean) as AvatarAttentionState[];

    if (states.length === 0) {
      return { avgHeadYaw: 0, avgHeadPitch: 0, avgIntensity: 0, transitioningCount: 0 };
    }

    const avgHeadYaw = states.reduce((sum, s) => sum + s.headYaw, 0) / states.length;
    const avgHeadPitch = states.reduce((sum, s) => sum + s.headPitch, 0) / states.length;
    const transitioningCount = states.filter(s => s.transitionProgress < 1).length;

    return {
      avgHeadYaw,
      avgHeadPitch,
      avgIntensity: states.reduce((sum, s) => {
        // Estimate intensity from how far head is from stage (0)
        return sum + Math.abs(s.headYaw) + Math.abs(s.headPitch);
      }, 0) / states.length / 2,
      transitioningCount,
    };
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}

export const avatarAttentionRuntime = new AvatarAttentionRuntime();

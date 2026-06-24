/**
 * ExpressionEngine — 9-state facial expression system for AvatarEntity.
 *
 * Maps user-facing expression names (Happy, Laughing, Excited…) to:
 *   - AvatarEmotion values that drive AudienceScene canvas drawHead
 *   - AvatarAnimationState companions
 *   - Auto-revert timers back to 'neutral'
 *   - Room energy boosts and XP awards
 *
 * Integration:
 *   triggerExpression('userId', 'laughing', roomId)
 *   → updateEntityState(entityId, { emotion, animState })
 *   → AudienceScene reads entity.emotion → draws correct mouth shape
 *   → setTimeout(durationMs) → revert to neutral
 *
 * Established Phase C2 (2026-06-24). No fake data — expressions only update
 * entities that are already registered in UnifiedAvatarRuntime.
 */

import type { AvatarEmotion } from '@/lib/avatars/AvatarRendererContract';
import type { AvatarAnimationState } from '@/lib/avatars/UnifiedAvatarRuntime';
import { updateEntityState, getEntity } from '@/lib/avatars/UnifiedAvatarRuntime';
import { roomEnergyEngine } from '@/lib/live/RoomEnergyEngine';

// ─── Expression type (user-facing label set) ──────────────────────────────────

export type AvatarExpression =
  | 'neutral'
  | 'happy'
  | 'laughing'
  | 'excited'
  | 'surprised'
  | 'focused'
  | 'silly'
  | 'encore'
  | 'emotional';

// ─── Expression spec ─────────────────────────────────────────────────────────

export interface ExpressionSpec {
  expression:        AvatarExpression;
  label:             string;
  emoji:             string;
  /** Maps to AudienceScene drawHead emotion param */
  emotion:           AvatarEmotion;
  /** Animation to play while expressing */
  animState:         AvatarAnimationState;
  /** How long before auto-revert to neutral (ms) */
  defaultDurationMs: number;
  /** Room energy signal added when this expression is triggered */
  energyBoost:       number;
  /** XP awarded to the entity's owner */
  xpAward:           number;
}

export const EXPRESSION_SPECS: Record<AvatarExpression, ExpressionSpec> = {
  neutral: {
    expression: 'neutral', label: 'Neutral', emoji: '😐',
    emotion: 'neutral', animState: 'idle',
    defaultDurationMs: 0, energyBoost: 0, xpAward: 0,
  },
  happy: {
    expression: 'happy', label: 'Happy', emoji: '😄',
    emotion: 'celebrate', animState: 'clapping',
    defaultDurationMs: 4000, energyBoost: 2, xpAward: 5,
  },
  laughing: {
    expression: 'laughing', label: 'Laughing', emoji: '😂',
    emotion: 'laugh', animState: 'laughing',
    defaultDurationMs: 3500, energyBoost: 4, xpAward: 8,
  },
  excited: {
    expression: 'excited', label: 'Excited', emoji: '🤩',
    emotion: 'celebrate', animState: 'cheering',
    defaultDurationMs: 4500, energyBoost: 5, xpAward: 10,
  },
  surprised: {
    expression: 'surprised', label: 'Surprised', emoji: '😮',
    emotion: 'shock', animState: 'reacting',
    defaultDurationMs: 2500, energyBoost: 3, xpAward: 5,
  },
  focused: {
    expression: 'focused', label: 'Focused', emoji: '😤',
    emotion: 'serious', animState: 'standing',
    defaultDurationMs: 5000, energyBoost: 1, xpAward: 3,
  },
  silly: {
    expression: 'silly', label: 'Silly', emoji: '🤪',
    emotion: 'smirk', animState: 'waving',
    defaultDurationMs: 4000, energyBoost: 3, xpAward: 6,
  },
  encore: {
    expression: 'encore', label: 'Encore!', emoji: '🙌',
    emotion: 'celebrate', animState: 'cheering',
    defaultDurationMs: 5000, energyBoost: 8, xpAward: 15,
  },
  emotional: {
    expression: 'emotional', label: 'Emotional', emoji: '🥹',
    emotion: 'disappointed', animState: 'gesturing',
    defaultDurationMs: 4000, energyBoost: 2, xpAward: 5,
  },
};

// ─── Module-level active state ────────────────────────────────────────────────

interface ActiveExpression {
  expression: AvatarExpression;
  revertTimer: ReturnType<typeof setTimeout> | null;
}

const _active = new Map<string, ActiveExpression>();
const _listeners = new Set<(entityId: string, expression: AvatarExpression) => void>();

function _emit(entityId: string, expression: AvatarExpression): void {
  _listeners.forEach(fn => fn(entityId, expression));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Trigger an expression on an entity.
 * Reverts to neutral after durationMs (or spec.defaultDurationMs).
 * No-op if entity is not registered in UnifiedAvatarRuntime.
 */
export function triggerExpression(
  entityId: string,
  expression: AvatarExpression,
  roomId?: string,
  durationMs?: number,
): void {
  if (!getEntity(entityId)) return; // entity must exist — no fake triggers

  const spec    = EXPRESSION_SPECS[expression];
  const duration = durationMs ?? spec.defaultDurationMs;

  // Cancel any pending revert
  const prev = _active.get(entityId);
  if (prev?.revertTimer) clearTimeout(prev.revertTimer);

  // Apply to entity
  updateEntityState(entityId, {
    emotion:   spec.emotion,
    animState: spec.animState,
  });

  // Room energy signal
  if (roomId && spec.energyBoost > 0) {
    for (let i = 0; i < spec.energyBoost; i++) {
      roomEnergyEngine.recordReaction(roomId);
    }
  }

  // XP event
  if (spec.xpAward > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tmi-xp-reward', {
      detail: { amount: spec.xpAward, action: `Expression: ${spec.label}` },
    }));
  }

  // Schedule revert
  const revertTimer = duration > 0
    ? setTimeout(() => revertExpression(entityId), duration)
    : null;

  _active.set(entityId, { expression, revertTimer });
  _emit(entityId, expression);
}

/** Immediately revert entity to neutral expression. */
export function revertExpression(entityId: string): void {
  const prev = _active.get(entityId);
  if (prev?.revertTimer) clearTimeout(prev.revertTimer);
  _active.delete(entityId);

  if (!getEntity(entityId)) return;
  updateEntityState(entityId, { emotion: 'neutral', animState: 'idle' });
  _emit(entityId, 'neutral');
}

/** Current expression for an entity (undefined = neutral). */
export function getActiveExpression(entityId: string): AvatarExpression {
  return _active.get(entityId)?.expression ?? 'neutral';
}

/** Subscribe to expression changes for any entity. Returns unsubscribe fn. */
export function onExpressionChange(
  callback: (entityId: string, expression: AvatarExpression) => void,
): () => void {
  _listeners.add(callback);
  return () => { _listeners.delete(callback); };
}

/** All expression specs in display order for the AvatarActionWheel. */
export function getExpressionSpecList(): ExpressionSpec[] {
  return (
    ['neutral', 'happy', 'laughing', 'excited', 'surprised', 'focused', 'silly', 'encore', 'emotional'] as AvatarExpression[]
  ).map(e => EXPRESSION_SPECS[e]);
}

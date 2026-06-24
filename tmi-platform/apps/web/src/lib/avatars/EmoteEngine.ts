/**
 * EmoteEngine — 8-emote animation trigger system for AvatarEntity.
 *
 * Emotes drive animation state (wave, clap, dance…) with:
 *   - Auto-revert to idle after duration
 *   - Room energy boosts
 *   - XP awards
 *   - Optional sound effect keys (wired to SoundManifest when assets exist)
 *
 * Usage:
 *   triggerEmote('userId', 'wave', roomId)
 *   → updateEntityState(entityId, { animState, activeEmote })
 *   → AudienceScene reads animState for future animation mode rendering (Phase C3+)
 *   → setTimeout → revert to idle
 *
 * Established Phase C2 (2026-06-24).
 */

import type { AvatarAnimationState } from '@/lib/avatars/UnifiedAvatarRuntime';
import { updateEntityState, getEntity } from '@/lib/avatars/UnifiedAvatarRuntime';
import { roomEnergyEngine } from '@/lib/live/RoomEnergyEngine';

// ─── Emote type ───────────────────────────────────────────────────────────────

export type AvatarEmote =
  | 'wave'
  | 'clap'
  | 'dance'
  | 'jump'
  | 'point'
  | 'heart'
  | 'rose'
  | 'encore';

// ─── Emote spec ───────────────────────────────────────────────────────────────

export interface EmoteSpec {
  emote:             AvatarEmote;
  label:             string;
  emoji:             string;
  animState:         AvatarAnimationState;
  defaultDurationMs: number;
  energyBoost:       number;
  xpAward:           number;
  /** Key into SoundManifest — plays when emote triggers (when asset exists) */
  soundKey?:         string;
}

export const EMOTE_SPECS: Record<AvatarEmote, EmoteSpec> = {
  wave: {
    emote: 'wave', label: 'Wave', emoji: '👋',
    animState: 'waving',
    defaultDurationMs: 3000, energyBoost: 2, xpAward: 5,
    soundKey: 'crowd_cheer_small',
  },
  clap: {
    emote: 'clap', label: 'Clap', emoji: '👏',
    animState: 'clapping',
    defaultDurationMs: 3500, energyBoost: 3, xpAward: 6,
    soundKey: 'crowd_clap',
  },
  dance: {
    emote: 'dance', label: 'Dance', emoji: '💃',
    animState: 'dancing',
    defaultDurationMs: 6000, energyBoost: 6, xpAward: 12,
    soundKey: undefined,
  },
  jump: {
    emote: 'jump', label: 'Jump', emoji: '🦘',
    animState: 'jumping',
    defaultDurationMs: 2000, energyBoost: 4, xpAward: 8,
    soundKey: undefined,
  },
  point: {
    emote: 'point', label: 'Point', emoji: '☝️',
    animState: 'pointing',
    defaultDurationMs: 2500, energyBoost: 2, xpAward: 4,
    soundKey: undefined,
  },
  heart: {
    emote: 'heart', label: 'Heart', emoji: '❤️',
    animState: 'gesturing',
    defaultDurationMs: 3000, energyBoost: 3, xpAward: 8,
    soundKey: undefined,
  },
  rose: {
    emote: 'rose', label: 'Rose', emoji: '🌹',
    animState: 'gesturing',
    defaultDurationMs: 3000, energyBoost: 3, xpAward: 10,
    soundKey: 'tip_received',
  },
  encore: {
    emote: 'encore', label: 'Encore!', emoji: '🙌',
    animState: 'cheering',
    defaultDurationMs: 5000, energyBoost: 8, xpAward: 15,
    soundKey: 'crowd_cheer_big',
  },
};

// ─── Module-level active state ────────────────────────────────────────────────

interface ActiveEmote {
  emote:       AvatarEmote;
  revertTimer: ReturnType<typeof setTimeout> | null;
}

const _active    = new Map<string, ActiveEmote>();
const _listeners = new Set<(entityId: string, emote: AvatarEmote | null) => void>();

function _emit(entityId: string, emote: AvatarEmote | null): void {
  _listeners.forEach(fn => fn(entityId, emote));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Trigger an emote on an entity.
 * Reverts to idle after durationMs (or spec.defaultDurationMs).
 * No-op if entity is not registered in UnifiedAvatarRuntime.
 */
export function triggerEmote(
  entityId: string,
  emote: AvatarEmote,
  roomId?: string,
  durationMs?: number,
): void {
  if (!getEntity(entityId)) return;

  const spec     = EMOTE_SPECS[emote];
  const duration = durationMs ?? spec.defaultDurationMs;

  // Cancel pending revert
  const prev = _active.get(entityId);
  if (prev?.revertTimer) clearTimeout(prev.revertTimer);

  // Apply to entity
  updateEntityState(entityId, {
    animState:   spec.animState,
    activeEmote: emote,
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
      detail: { amount: spec.xpAward, action: `Emote: ${spec.label}` },
    }));
  }

  // Sound effect
  if (spec.soundKey && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tmi-play-sound', {
      detail: { key: spec.soundKey },
    }));
  }

  // Schedule revert
  const revertTimer = duration > 0
    ? setTimeout(() => revertEmote(entityId), duration)
    : null;

  _active.set(entityId, { emote, revertTimer });
  _emit(entityId, emote);
}

/** Immediately revert entity to idle animation. */
export function revertEmote(entityId: string): void {
  const prev = _active.get(entityId);
  if (prev?.revertTimer) clearTimeout(prev.revertTimer);
  _active.delete(entityId);

  if (!getEntity(entityId)) return;
  updateEntityState(entityId, { animState: 'idle', activeEmote: null });
  _emit(entityId, null);
}

/** Current emote for an entity (null = idle). */
export function getActiveEmote(entityId: string): AvatarEmote | null {
  return _active.get(entityId)?.emote ?? null;
}

/** Subscribe to emote changes for any entity. Returns unsubscribe fn. */
export function onEmoteChange(
  callback: (entityId: string, emote: AvatarEmote | null) => void,
): () => void {
  _listeners.add(callback);
  return () => { _listeners.delete(callback); };
}

/** All emote specs in display order for the AvatarActionWheel. */
export function getEmoteSpecList(): EmoteSpec[] {
  return (
    ['wave', 'clap', 'dance', 'jump', 'point', 'heart', 'rose', 'encore'] as AvatarEmote[]
  ).map(e => EMOTE_SPECS[e]);
}

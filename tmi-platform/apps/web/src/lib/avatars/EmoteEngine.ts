/**
 * EmoteEngine — Dance / Gesture / Action emote triggers for AvatarEntity.
 *
 * Permanent distinction:
 *   - Dance Emotes  = body animation on AvatarRig (animState dancing + animationId)
 *   - Gesture Emotes = short hand/face animations
 *   - Action Emotes = button-launched VFX (hearts/flames/confetti…) with
 *       duration, cooldown, rarity, entitlement, visibilityRadius, performanceCost
 *       — throttled so mass fire does not kill FPS
 *
 * Catalog SKUs live in FanCosmeticCatalog; this engine runs the runtime triggers.
 */

import type { AvatarAnimationState } from '@/lib/avatars/UnifiedAvatarRuntime';
import { updateEntityState, getEntity } from '@/lib/avatars/UnifiedAvatarRuntime';
import { roomEnergyEngine } from '@/lib/live/RoomEnergyEngine';
import {
  getFanCosmetic,
  listActionEmotes,
  listDanceEmotes,
  listGestureEmotes,
  type FanCosmeticDef,
} from '@/lib/avatars/FanCosmeticCatalog';

// ─── Emote type ───────────────────────────────────────────────────────────────

export type AvatarEmote =
  | 'wave'
  | 'clap'
  | 'dance'
  | 'dance_hiphop'
  | 'dance_wave'
  | 'dance_robot'
  | 'dance_shuffle'
  | 'dance_spin'
  | 'dance_bounce'
  | 'dance_hype'
  | 'dance_salsa'
  | 'dance_country'
  | 'dance_disco'
  | 'dance_slow'
  | 'jump'
  | 'point'
  | 'peace'
  | 'thumbs'
  | 'flex'
  | 'heart_hands'
  | 'heart'
  | 'rose'
  | 'encore'
  | 'lighter'
  | 'glowstick'
  | 'headbang'
  | 'cheer';

export type ActionEmoteId =
  | 'flame_cannon'
  | 'heart_shower'
  | 'gold_coin_toss'
  | 'lightning_strike'
  | 'neon_glow_burst'
  | 'smoke_haze'
  | 'mic_drop'
  | 'confetti_cannon'
  | 'sparkle_burst'
  | 'music_notes'
  | 'flame_mini'
  | 'heart_mini'
  | 'lightning_mini';

// ─── Emote spec ───────────────────────────────────────────────────────────────

export interface EmoteSpec {
  emote:             AvatarEmote;
  label:             string;
  emoji:             string;
  animState:         AvatarAnimationState;
  defaultDurationMs: number;
  energyBoost:       number;
  xpAward:           number;
  kind:              'dance' | 'gesture';
  animationId?:      string;
  /** Key into SoundManifest — plays when emote triggers (when asset exists) */
  soundKey?:         string;
}

export interface ActionEmoteSpec {
  actionId:          ActionEmoteId;
  catalogId:         string;
  label:             string;
  emoji:             string;
  effectId:          string;
  defaultDurationMs: number;
  cooldownMs:        number;
  visibilityRadius:  number;
  performanceCost:   number;
  energyBoost:       number;
  xpAward:           number;
}

export const EMOTE_SPECS: Record<AvatarEmote, EmoteSpec> = {
  wave: {
    emote: 'wave', label: 'Wave', emoji: '👋',
    animState: 'waving', kind: 'gesture', animationId: 'anim_wave',
    defaultDurationMs: 3000, energyBoost: 2, xpAward: 5,
    soundKey: 'crowd_cheer_small',
  },
  clap: {
    emote: 'clap', label: 'Clap', emoji: '👏',
    animState: 'clapping', kind: 'gesture', animationId: 'anim_clap',
    defaultDurationMs: 3500, energyBoost: 3, xpAward: 6,
    soundKey: 'crowd_clap',
  },
  dance: {
    emote: 'dance', label: 'Two-Step / Vibe', emoji: '💃',
    animState: 'dancing', kind: 'dance', animationId: 'dance_twostep',
    defaultDurationMs: 6000, energyBoost: 6, xpAward: 12,
  },
  dance_hiphop: {
    emote: 'dance_hiphop', label: 'Groove / Hip-Hop', emoji: '🕺',
    animState: 'dancing', kind: 'dance', animationId: 'dance_hiphop',
    defaultDurationMs: 7000, energyBoost: 7, xpAward: 14,
  },
  dance_wave: {
    emote: 'dance_wave', label: 'Wave Dance', emoji: '🌊',
    animState: 'dancing', kind: 'dance', animationId: 'dance_wave',
    defaultDurationMs: 6500, energyBoost: 6, xpAward: 13,
  },
  dance_robot: {
    emote: 'dance_robot', label: 'Robot', emoji: '🤖',
    animState: 'dancing', kind: 'dance', animationId: 'dance_robot',
    defaultDurationMs: 6500, energyBoost: 7, xpAward: 14,
  },
  dance_shuffle: {
    emote: 'dance_shuffle', label: 'Shuffle', emoji: '👟',
    animState: 'dancing', kind: 'dance', animationId: 'dance_shuffle',
    defaultDurationMs: 6500, energyBoost: 7, xpAward: 14,
  },
  dance_spin: {
    emote: 'dance_spin', label: 'Spin Out', emoji: '🌀',
    animState: 'dancing', kind: 'dance', animationId: 'dance_spin',
    defaultDurationMs: 5500, energyBoost: 8, xpAward: 15,
  },
  dance_bounce: {
    emote: 'dance_bounce', label: 'Bounce', emoji: '🏀',
    animState: 'dancing', kind: 'dance', animationId: 'dance_bounce',
    defaultDurationMs: 6000, energyBoost: 6, xpAward: 12,
  },
  dance_hype: {
    emote: 'dance_hype', label: 'Hype-Man', emoji: '📢',
    animState: 'dancing', kind: 'dance', animationId: 'dance_hype',
    defaultDurationMs: 7000, energyBoost: 8, xpAward: 15,
  },
  dance_salsa: {
    emote: 'dance_salsa', label: 'Salsa', emoji: '🌶️',
    animState: 'dancing', kind: 'dance', animationId: 'dance_salsa',
    defaultDurationMs: 7000, energyBoost: 7, xpAward: 14,
  },
  dance_country: {
    emote: 'dance_country', label: 'Country Line', emoji: '🤠',
    animState: 'dancing', kind: 'dance', animationId: 'dance_country',
    defaultDurationMs: 7000, energyBoost: 6, xpAward: 13,
  },
  dance_disco: {
    emote: 'dance_disco', label: 'Disco', emoji: '🪩',
    animState: 'dancing', kind: 'dance', animationId: 'dance_disco',
    defaultDurationMs: 7000, energyBoost: 7, xpAward: 14,
  },
  dance_slow: {
    emote: 'dance_slow', label: 'Slow Groove', emoji: '🌙',
    animState: 'dancing', kind: 'dance', animationId: 'dance_slow',
    defaultDurationMs: 8000, energyBoost: 5, xpAward: 12,
  },
  jump: {
    emote: 'jump', label: 'Jump', emoji: '🦘',
    animState: 'jumping', kind: 'gesture', animationId: 'anim_jump',
    defaultDurationMs: 2000, energyBoost: 4, xpAward: 8,
  },
  point: {
    emote: 'point', label: 'Point', emoji: '☝️',
    animState: 'pointing', kind: 'gesture', animationId: 'anim_point',
    defaultDurationMs: 2500, energyBoost: 2, xpAward: 4,
  },
  peace: {
    emote: 'peace', label: 'Peace', emoji: '✌️',
    animState: 'gesturing', kind: 'gesture', animationId: 'anim_peace',
    defaultDurationMs: 2500, energyBoost: 2, xpAward: 5,
  },
  thumbs: {
    emote: 'thumbs', label: 'Thumbs Up', emoji: '👍',
    animState: 'gesturing', kind: 'gesture', animationId: 'anim_thumbs',
    defaultDurationMs: 2200, energyBoost: 2, xpAward: 4,
  },
  flex: {
    emote: 'flex', label: 'Flex', emoji: '💪',
    animState: 'gesturing', kind: 'gesture', animationId: 'anim_flex',
    defaultDurationMs: 3000, energyBoost: 3, xpAward: 6,
  },
  heart_hands: {
    emote: 'heart_hands', label: 'Heart Hands', emoji: '🫶',
    animState: 'gesturing', kind: 'gesture', animationId: 'anim_heart_hands',
    defaultDurationMs: 3000, energyBoost: 3, xpAward: 7,
  },
  heart: {
    emote: 'heart', label: 'Heart', emoji: '❤️',
    animState: 'gesturing', kind: 'gesture', animationId: 'anim_heart',
    defaultDurationMs: 3000, energyBoost: 3, xpAward: 8,
  },
  rose: {
    emote: 'rose', label: 'Rose', emoji: '🌹',
    animState: 'gesturing', kind: 'gesture',
    defaultDurationMs: 3000, energyBoost: 3, xpAward: 10,
    soundKey: 'tip_received',
  },
  encore: {
    emote: 'encore', label: 'Encore!', emoji: '🙌',
    animState: 'cheering', kind: 'gesture', animationId: 'anim_encore',
    defaultDurationMs: 5000, energyBoost: 8, xpAward: 15,
    soundKey: 'crowd_cheer_big',
  },
  lighter: {
    emote: 'lighter', label: 'Lighter', emoji: '🔥',
    animState: 'gesturing', kind: 'gesture',
    defaultDurationMs: 4000, energyBoost: 5, xpAward: 10,
    soundKey: 'crowd_cheer_small',
  },
  glowstick: {
    emote: 'glowstick', label: 'Glow Stick', emoji: '💡',
    animState: 'dancing', kind: 'dance',
    defaultDurationMs: 5000, energyBoost: 6, xpAward: 12,
  },
  headbang: {
    emote: 'headbang', label: 'Headbang', emoji: '🤘',
    animState: 'dancing', kind: 'dance', animationId: 'dance_headbang',
    defaultDurationMs: 5000, energyBoost: 7, xpAward: 12,
  },
  cheer: {
    emote: 'cheer', label: 'Cheer', emoji: '📣',
    animState: 'cheering', kind: 'gesture', animationId: 'anim_cheer',
    defaultDurationMs: 4000, energyBoost: 6, xpAward: 10,
    soundKey: 'crowd_cheer_small',
  },
};

const ACTION_FROM_CATALOG: Record<ActionEmoteId, string> = {
  flame_cannon: 'action_flame_cannon',
  heart_shower: 'action_heart_shower',
  gold_coin_toss: 'action_gold_coin_toss',
  lightning_strike: 'action_lightning_strike',
  neon_glow_burst: 'action_neon_glow_burst',
  smoke_haze: 'action_smoke_haze',
  mic_drop: 'action_mic_drop',
  confetti_cannon: 'action_confetti_cannon',
  sparkle_burst: 'action_sparkle_burst',
  music_notes: 'action_music_notes',
  flame_mini: 'action_flame_mini',
  heart_mini: 'action_heart_mini',
  lightning_mini: 'action_lightning_mini',
};

function actionSpecFromCatalog(actionId: ActionEmoteId, def: FanCosmeticDef): ActionEmoteSpec {
  return {
    actionId,
    catalogId: def.id,
    label: def.label,
    emoji: def.icon,
    effectId: def.effectId ?? `fx_${actionId}`,
    defaultDurationMs: def.durationMs ?? 2500,
    cooldownMs: def.cooldownMs ?? 6000,
    visibilityRadius: def.visibilityRadius ?? 12,
    performanceCost: def.performanceCost ?? 5,
    energyBoost: Math.max(2, Math.round((def.performanceCost ?? 5) / 2)),
    xpAward: 8 + (def.rarity === 'legendary' ? 10 : def.rarity === 'epic' ? 6 : 2),
  };
}

export function getActionEmoteSpec(actionId: ActionEmoteId): ActionEmoteSpec | null {
  const catalogId = ACTION_FROM_CATALOG[actionId];
  const def = catalogId ? getFanCosmetic(catalogId) : undefined;
  if (!def) return null;
  return actionSpecFromCatalog(actionId, def);
}

export function getActionEmoteSpecList(): ActionEmoteSpec[] {
  return (Object.keys(ACTION_FROM_CATALOG) as ActionEmoteId[])
    .map((id) => getActionEmoteSpec(id))
    .filter((s): s is ActionEmoteSpec => Boolean(s));
}

// ─── Module-level active state ────────────────────────────────────────────────

interface ActiveEmote {
  emote:       AvatarEmote;
  revertTimer: ReturnType<typeof setTimeout> | null;
}

interface ActiveAction {
  actionId: ActionEmoteId;
  endsAt: number;
  cost: number;
}

const _active    = new Map<string, ActiveEmote>();
const _listeners = new Set<(entityId: string, emote: AvatarEmote | null) => void>();
const _actionCooldownUntil = new Map<string, number>(); // key = `${entityId}:${actionId}`
const _roomActionBudget = new Map<string, { cost: number; until: number }>();
const _activeActions = new Map<string, ActiveAction>();
const _actionListeners = new Set<(entityId: string, action: ActionEmoteSpec | null) => void>();

/** Soft room-wide FPS guard — sum of performanceCost of concurrent Action Emotes. */
export const ACTION_ROOM_PERF_BUDGET = 18;

function _emit(entityId: string, emote: AvatarEmote | null): void {
  _listeners.forEach(fn => fn(entityId, emote));
}

function _emitAction(entityId: string, action: ActionEmoteSpec | null): void {
  _actionListeners.forEach(fn => fn(entityId, action));
}

function roomBudgetKey(roomId: string): string {
  return roomId;
}

function currentRoomCost(roomId: string): number {
  const row = _roomActionBudget.get(roomBudgetKey(roomId));
  if (!row) return 0;
  if (Date.now() > row.until) {
    _roomActionBudget.delete(roomBudgetKey(roomId));
    return 0;
  }
  return row.cost;
}

function addRoomCost(roomId: string, cost: number, durationMs: number): void {
  const key = roomBudgetKey(roomId);
  const now = Date.now();
  const prev = _roomActionBudget.get(key);
  const base = prev && prev.until > now ? prev.cost : 0;
  const until = Math.max(prev?.until ?? 0, now + durationMs);
  _roomActionBudget.set(key, { cost: base + cost, until });
  setTimeout(() => {
    const cur = _roomActionBudget.get(key);
    if (!cur) return;
    const next = Math.max(0, cur.cost - cost);
    if (next <= 0 || Date.now() > cur.until) _roomActionBudget.delete(key);
    else _roomActionBudget.set(key, { ...cur, cost: next });
  }, durationMs);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Trigger a Dance or Gesture emote on an entity (AvatarRig body animation).
 * Reverts to idle after durationMs (or spec.defaultDurationMs).
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

  const prev = _active.get(entityId);
  if (prev?.revertTimer) clearTimeout(prev.revertTimer);

  updateEntityState(entityId, {
    animState:   spec.animState,
    activeEmote: emote,
  });

  if (roomId && spec.energyBoost > 0) {
    for (let i = 0; i < spec.energyBoost; i++) {
      roomEnergyEngine.recordReaction(roomId);
    }
  }

  if (spec.xpAward > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tmi-xp-reward', {
      detail: { amount: spec.xpAward, action: `Emote: ${spec.label}` },
    }));
  }

  if (spec.soundKey && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tmi-play-sound', {
      detail: { key: spec.soundKey },
    }));
  }

  if (typeof window !== 'undefined' && spec.animationId) {
    window.dispatchEvent(new CustomEvent('tmi-avatar-animation', {
      detail: { entityId, animationId: spec.animationId, kind: spec.kind },
    }));
  }

  const revertTimer = duration > 0
    ? setTimeout(() => revertEmote(entityId), duration)
    : null;

  _active.set(entityId, { emote, revertTimer });
  _emit(entityId, emote);
}

/**
 * Trigger an Action Emote (VFX reaction) — not a body dance.
 * Enforces per-user cooldown + room performanceCost budget.
 */
export function triggerActionEmote(
  entityId: string,
  actionId: ActionEmoteId,
  roomId?: string,
): { ok: boolean; reason?: string; spec?: ActionEmoteSpec; cooldownRemainingMs?: number } {
  const spec = getActionEmoteSpec(actionId);
  if (!spec) return { ok: false, reason: 'unknown_action' };
  if (!getEntity(entityId)) return { ok: false, reason: 'entity_missing', spec };

  const cdKey = `${entityId}:${actionId}`;
  const until = _actionCooldownUntil.get(cdKey) ?? 0;
  const now = Date.now();
  if (now < until) {
    return { ok: false, reason: 'cooldown', spec, cooldownRemainingMs: until - now };
  }

  if (roomId) {
    const used = currentRoomCost(roomId);
    if (used + spec.performanceCost > ACTION_ROOM_PERF_BUDGET) {
      return { ok: false, reason: 'room_perf_budget', spec };
    }
    addRoomCost(roomId, spec.performanceCost, spec.defaultDurationMs);
  }

  _actionCooldownUntil.set(cdKey, now + spec.cooldownMs);
  _activeActions.set(entityId, {
    actionId,
    endsAt: now + spec.defaultDurationMs,
    cost: spec.performanceCost,
  });

  updateEntityState(entityId, {
    animState: 'reacting',
    activeEmote: null,
  });

  if (roomId && spec.energyBoost > 0) {
    for (let i = 0; i < spec.energyBoost; i++) {
      roomEnergyEngine.recordReaction(roomId);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tmi-xp-reward', {
      detail: { amount: spec.xpAward, action: `Action Emote: ${spec.label}` },
    }));
    window.dispatchEvent(new CustomEvent('tmi-action-emote', {
      detail: {
        entityId,
        roomId,
        actionId,
        effectId: spec.effectId,
        durationMs: spec.defaultDurationMs,
        visibilityRadius: spec.visibilityRadius,
        performanceCost: spec.performanceCost,
      },
    }));
  }

  setTimeout(() => {
    const cur = _activeActions.get(entityId);
    if (cur?.actionId === actionId) {
      _activeActions.delete(entityId);
      _emitAction(entityId, null);
    }
  }, spec.defaultDurationMs);

  _emitAction(entityId, spec);
  return { ok: true, spec };
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

export function getActiveActionEmote(entityId: string): ActionEmoteId | null {
  const row = _activeActions.get(entityId);
  if (!row || Date.now() > row.endsAt) return null;
  return row.actionId;
}

/** Subscribe to emote changes for any entity. Returns unsubscribe fn. */
export function onEmoteChange(
  callback: (entityId: string, emote: AvatarEmote | null) => void,
): () => void {
  _listeners.add(callback);
  return () => { _listeners.delete(callback); };
}

export function onActionEmoteChange(
  callback: (entityId: string, action: ActionEmoteSpec | null) => void,
): () => void {
  _actionListeners.add(callback);
  return () => { _actionListeners.delete(callback); };
}

/** Dance + gesture specs for AvatarActionWheel (body animations only). */
export function getEmoteSpecList(): EmoteSpec[] {
  return (
    [
      'wave', 'clap', 'point', 'peace', 'thumbs', 'flex', 'heart_hands',
      'dance', 'dance_bounce', 'dance_wave', 'dance_shuffle', 'dance_hype',
      'dance_hiphop', 'dance_robot', 'dance_salsa', 'dance_country', 'dance_disco',
      'dance_slow', 'dance_spin', 'jump', 'heart', 'encore', 'headbang', 'cheer',
    ] as AvatarEmote[]
  ).map(e => EMOTE_SPECS[e]);
}

export function getDanceEmoteSpecList(): EmoteSpec[] {
  return getEmoteSpecList().filter((s) => s.kind === 'dance');
}

export function getGestureEmoteSpecList(): EmoteSpec[] {
  return getEmoteSpecList().filter((s) => s.kind === 'gesture');
}

/** Catalog-backed helpers for Creation Center / store honesty. */
export function listCatalogDanceEmotes(): FanCosmeticDef[] {
  return listDanceEmotes();
}

export function listCatalogActionEmotes(): FanCosmeticDef[] {
  return listActionEmotes();
}

export function listCatalogGestureEmotes(): FanCosmeticDef[] {
  return listGestureEmotes();
}

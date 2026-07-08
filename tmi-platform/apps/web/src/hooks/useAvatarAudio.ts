'use client';

/**
 * useAvatarAudio — Avatar Audio Runtime v1
 *
 * Plays subtle, optional sound effects tied to avatar events.
 * Rules:
 *   - Silent by default during live performance (SoundPriorityManager gate).
 *   - Never throws; missing files fail gracefully via playSound().
 *   - All settings are per-user, stored in localStorage.
 *   - Volume kept intentionally low (0.35 default) — avatar sfx are background texture.
 *
 * Usage:
 *   const { play, settings, updateSettings } = useAvatarAudio('bigace');
 *   play('host.entrance');
 *   play('movement.sit');
 *
 * Wire SoundPriorityManager.setContext() from GoLiveStudio / AudienceScene:
 *   import { SoundPriorityManager } from '@/lib/sound/SoundPriorityManager';
 *   SoundPriorityManager.setContext('live_performance'); // mutes avatar sfx
 *   SoundPriorityManager.setContext('lobby');           // enables avatar sfx
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { playSound } from '@/lib/sound/playSound';
import {
  getSoundIdForEvent,
  type AvatarSoundEvent,
} from '@/lib/sound/AvatarSoundProfile';
import {
  SoundPriorityManager,
  type SoundContext,
} from '@/lib/sound/SoundPriorityManager';

// ── Settings ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tmi_avatar_audio_v1';

export interface AvatarAudioSettings {
  /** Master enable/disable for all avatar sounds */
  enabled: boolean;
  /** 0–1, advisory volume multiplier (v1: on/off semantics, v2: per-gain) */
  volume: number;
  movementSounds: boolean;
  clothingSounds: boolean;
  emoteSounds: boolean;
  gestureSounds: boolean;
  uiSounds: boolean;
  hostSounds: boolean;
}

const DEFAULTS: AvatarAudioSettings = {
  enabled: true,
  volume: 0.35,
  movementSounds: true,
  clothingSounds: true,
  emoteSounds: true,
  gestureSounds: true,
  uiSounds: true,
  hostSounds: true,
};

// Map event prefix → settings key gate
const EVENT_GATE: Array<[prefix: string, key: keyof AvatarAudioSettings]> = [
  ['movement.', 'movementSounds'],
  ['clothing.',  'clothingSounds'],
  ['emote.',     'emoteSounds'],
  ['gesture.',   'gestureSounds'],
  ['ui.',        'uiSounds'],
  ['host.',      'hostSounds'],
];

function loadSettings(): AvatarAudioSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AvatarAudioSettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function persistSettings(s: AvatarAudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable — no crash
  }
}

// ── Cooldown registry ────────────────────────────────────────────────────────
// Prevents the same sound firing multiple times within a short window
// (e.g., rapid sit/stand during seat-claim animation).
const COOLDOWN_MS = 350;
const lastPlayedAt = new Map<string, number>();

function isOnCooldown(soundId: string): boolean {
  const last = lastPlayedAt.get(soundId) ?? 0;
  return Date.now() - last < COOLDOWN_MS;
}

function markPlayed(soundId: string): void {
  lastPlayedAt.set(soundId, Date.now());
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface UseAvatarAudioReturn {
  play: (event: AvatarSoundEvent) => void;
  settings: AvatarAudioSettings;
  updateSettings: (patch: Partial<AvatarAudioSettings>) => void;
  /** Current platform sound context — updates reactively */
  context: SoundContext;
  /**
   * Wire this into GoLiveStudio / AudienceScene to mute/restore avatar sounds.
   * Calling SoundPriorityManager.setContext() directly also works.
   */
  setContext: typeof SoundPriorityManager.setContext;
}

export function useAvatarAudio(profileId = 'default'): UseAvatarAudioReturn {
  const [settings, setSettings] = useState<AvatarAudioSettings>(DEFAULTS);
  const [context, setContextState] = useState<SoundContext>(
    SoundPriorityManager.getContext(),
  );
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;

  useEffect(() => {
    setSettings(loadSettings());
    return SoundPriorityManager.subscribe(setContextState);
  }, []);

  const play = useCallback((event: AvatarSoundEvent) => {
    const s = settings;
    if (!s.enabled) return;
    if (s.volume <= 0) return;

    // Gate 1: platform context (live_performance blocks avatar layer)
    if (!SoundPriorityManager.canPlay('avatar')) return;

    // Gate 2: per-category setting
    const gate = EVENT_GATE.find(([prefix]) => event.startsWith(prefix));
    if (gate) {
      const key = gate[1];
      if (!s[key]) return;
    }

    // Resolve manifest ID from profile
    const soundId = getSoundIdForEvent(profileIdRef.current, event);
    if (!soundId) return; // no mapping for this event in this profile — silent

    // Gate 3: cooldown
    if (isOnCooldown(soundId)) return;
    markPlayed(soundId);

    // Delegate to canonical playSound — fails gracefully if file missing
    playSound(soundId);
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<AvatarAudioSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persistSettings(next);
      return next;
    });
  }, []);

  return {
    play,
    settings,
    updateSettings,
    context,
    setContext: SoundPriorityManager.setContext.bind(SoundPriorityManager),
  };
}

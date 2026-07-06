'use client';

/**
 * VisualSettingsStore — user preferences for ambient/motion effects.
 *
 * Persisted to localStorage. Read by any component that renders
 * ambient orbs, particle effects, or beat-reactive visuals.
 * Falls back to sensible defaults when localStorage is unavailable (SSR).
 */

export type PerformanceQuality = 'auto' | 'high' | 'balanced' | 'performance';

export interface VisualSettings {
  ambientOrbs:        boolean;
  beatReactive:       boolean;
  motionBackground:   boolean;
  particleEffects:    boolean;
  lowMotionMode:      boolean;
  /** Manual performance override — 'auto' lets the device tier detection decide */
  qualityOverride:    PerformanceQuality;
}

const DEFAULTS: VisualSettings = {
  ambientOrbs:      true,
  beatReactive:     true,
  motionBackground: true,
  particleEffects:  true,
  lowMotionMode:    false,
  qualityOverride:  'auto',
};

const STORAGE_KEY = 'tmi.visual.settings.v1';

function load(): VisualSettings {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<VisualSettings>) };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(s: VisualSettings): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* unavailable */ }
}

// ── Reactive store (subscribe pattern — no React dependency) ──────────────────

let _settings: VisualSettings = load();
const _listeners = new Set<(s: VisualSettings) => void>();

function emit(): void {
  for (const l of _listeners) try { l(_settings); } catch { /* ignore */ }
}

export const VisualSettingsStore = {
  get(): VisualSettings {
    return { ..._settings };
  },

  set(partial: Partial<VisualSettings>): void {
    _settings = { ..._settings, ...partial };
    // lowMotionMode overrides everything when enabled
    if (_settings.lowMotionMode) {
      _settings.ambientOrbs      = false;
      _settings.beatReactive     = false;
      _settings.motionBackground = false;
      _settings.particleEffects  = false;
    }
    save(_settings);
    emit();
  },

  toggle(key: keyof VisualSettings): void {
    VisualSettingsStore.set({ [key]: !_settings[key] });
  },

  subscribe(listener: (s: VisualSettings) => void): () => void {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },

  reset(): void {
    _settings = { ...DEFAULTS };
    save(_settings);
    emit();
  },
};

// ── React hook ────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useVisualSettings(): [VisualSettings, (partial: Partial<VisualSettings>) => void] {
  const [settings, setSettings] = useState<VisualSettings>(VisualSettingsStore.get);

  useEffect(() => {
    setSettings(VisualSettingsStore.get());
    return VisualSettingsStore.subscribe(setSettings);
  }, []);

  return [settings, VisualSettingsStore.set];
}

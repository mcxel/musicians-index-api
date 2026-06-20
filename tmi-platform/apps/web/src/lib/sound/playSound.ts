'use client';

import { getSoundById } from './SoundManifest';

/**
 * playSound — the one place anything on TMI should trigger a sound effect.
 * Looks the id up in SOUND_MANIFEST so call sites never hardcode a file path.
 * Silently no-ops (never throws) if the id is unknown, the file 404s, or the
 * browser blocks autoplay — a missing sound should never break a feature.
 */
export function playSound(id: string): void {
  if (typeof window === 'undefined') return;
  const entry = getSoundById(id);
  if (!entry) {
    console.warn(`[playSound] unknown sound id: ${id}`);
    return;
  }
  try {
    const audio = new Audio(entry.file);
    audio.volume = entry.volume;
    audio.loop = entry.loop;
    void audio.play().catch(() => { /* missing file or autoplay block — silent */ });
  } catch {
    /* silent — never let a sound effect break the feature it's attached to */
  }
}

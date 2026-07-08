'use client';

import { useEffect } from 'react';
import { TMI_SOUND_MAP } from '@/lib/sound/AudioDirector';
import { playSound } from '@/lib/sound/playSound';

/**
 * AudioDirectorProvider — mounts once in root layout.
 * Listens to every tmi:* event in TMI_SOUND_MAP and plays the mapped sound.
 * Renders nothing. Zero idle cost.
 *
 * Runtime engines call dispatchSoundEvent('tmi:battle_round_start') — done.
 * This provider handles the rest.
 */
export default function AudioDirectorProvider() {
  useEffect(() => {
    const handlers: Array<{ event: string; handler: EventListener }> = [];

    for (const [eventName, soundId] of Object.entries(TMI_SOUND_MAP)) {
      const handler: EventListener = () => playSound(soundId);
      window.addEventListener(eventName, handler);
      handlers.push({ event: eventName, handler });
    }

    return () => {
      for (const { event, handler } of handlers) {
        window.removeEventListener(event, handler);
      }
    };
  }, []);

  return null;
}

'use client';

/**
 * AudioConductor.ts
 *
 * Subscriber/connector layer between RuntimeEventBus and all audio subsystems.
 * Replaces manual SoundPriorityManager.setContext() calls scattered across
 * GoLiveStudio, AudienceScene, etc.
 *
 * One event fires → every audio subsystem responds automatically:
 *   VENUE_PERFORMER_ENTERS  → context = live_performance  (mutes avatar sfx)
 *   VENUE_APPLAUSE          → playSound('crowd_clap_cheer')
 *   VENUE_ENCORE            → playSound('crowd_cheering_stadium')
 *   VENUE_CURTAIN_OPEN      → playSound('venue_curtains')
 *   VENUE_CLOSING           → context = lobby (restores avatar sfx)
 *   CHARACTER_SPEAK         → context = host_speaking (partial mute)
 *
 * Mount once in the root layout:
 *   // In a client component or AudioProvider:
 *   useAudioConductor();
 *
 * Or call imperatively:
 *   const teardown = mountAudioConductor();
 *   // later:
 *   teardown();
 */

import { runtimeEventBus as RuntimeEventBus, CHANNELS } from '@/lib/runtime/RuntimeEventBus';
import { SoundPriorityManager, type SoundContext } from '@/lib/sound/SoundPriorityManager';
import { playSound } from '@/lib/sound/playSound';

// ── Context routing ─────────────────────────────────────────────────────────
// Channel → the SoundContext to switch to when that event fires.

const CONTEXT_ROUTES: ReadonlyArray<{ channel: string; context: SoundContext }> = [
  { channel: CHANNELS.VENUE_PERFORMER_ENTERS, context: 'live_performance' },
  { channel: CHANNELS.VENUE_OPEN,             context: 'live_performance' },
  { channel: CHANNELS.VENUE_CLOSING,          context: 'lobby' },
  { channel: CHANNELS.VENUE_CURTAIN_CLOSE,    context: 'lobby' },
  { channel: CHANNELS.VENUE_INTERMISSION,     context: 'lobby' },
  { channel: CHANNELS.VENUE_RECONNECT,        context: 'lobby' },
  { channel: CHANNELS.VENUE_EMERGENCY_PAUSE,  context: 'lobby' },
  { channel: CHANNELS.VENUE_COUNTDOWN,        context: 'live_performance' },
];

// ── Event → sound routing ────────────────────────────────────────────────────
// Channel → manifest soundId to play when that event fires.

const EVENT_SOUNDS: ReadonlyArray<{ channel: string; soundId: string }> = [
  { channel: CHANNELS.VENUE_CURTAIN_OPEN, soundId: 'venue_curtains' },
  { channel: CHANNELS.VENUE_CURTAIN_CLOSE, soundId: 'venue_curtains' },
  { channel: CHANNELS.VENUE_APPLAUSE,     soundId: 'crowd_clap_cheer' },
  { channel: CHANNELS.VENUE_ENCORE,       soundId: 'crowd_cheering_stadium' },
];

// ── Character / host routing ─────────────────────────────────────────────────
// CHARACTER_SPEAK with detail.active=true → host_speaking
// CHARACTER_SPEAK with detail.active=false → lobby (host done speaking)

function handleCharacterSpeak(event: { detail?: { active?: boolean } }): void {
  const active = event.detail?.active !== false; // default true if not specified
  SoundPriorityManager.setContext(active ? 'host_speaking' : 'lobby');
}

// ── Mount / teardown ─────────────────────────────────────────────────────────

/**
 * Mounts all AudioConductor subscriptions.
 * Returns a teardown function to unsubscribe all.
 * Safe to call multiple times (each call creates an isolated subscription set).
 */
export function mountAudioConductor(): () => void {
  const unsubs: Array<() => void> = [];

  // Context routes
  for (const { channel, context } of CONTEXT_ROUTES) {
    unsubs.push(
      RuntimeEventBus.subscribe(channel, () => {
        SoundPriorityManager.setContext(context);
      }),
    );
  }

  // Event sounds
  for (const { channel, soundId } of EVENT_SOUNDS) {
    unsubs.push(
      RuntimeEventBus.subscribe(channel, () => {
        if (SoundPriorityManager.canPlay('crowd') || SoundPriorityManager.canPlay('ambient')) {
          playSound(soundId);
        }
      }),
    );
  }

  // Character speak → partial mute during host speech
  unsubs.push(
    RuntimeEventBus.subscribe(
      CHANNELS.CHARACTER_SPEAK,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: any) => handleCharacterSpeak(event),
    ),
  );

  return () => unsubs.forEach((unsub) => unsub());
}

// ── React hook ───────────────────────────────────────────────────────────────
// Import this in any client component (root layout, AudioProvider, etc.)
// to mount once for the full session.

import { useEffect } from 'react';

/**
 * Mount all AudioConductor subscriptions for the React component lifecycle.
 * Call once in a client component near the root (layout, AudioProvider, etc.).
 *
 * @example
 *   // In AudioProvider.tsx or the root layout:
 *   'use client';
 *   import { useAudioConductor } from '@/lib/audio/AudioConductor';
 *   export function AudioProvider({ children }) {
 *     useAudioConductor();
 *     return <>{children}</>;
 *   }
 */
export function useAudioConductor(): void {
  useEffect(() => {
    const teardown = mountAudioConductor();
    return teardown;
  }, []);
}

/**
 * SoundPriorityManager.ts
 * Process-local singleton that controls which sound layers may play
 * based on current platform context.
 *
 * Rule: avatar sounds must never compete with live performance audio.
 * This manager is the single enforcement point for that rule.
 *
 * Usage:
 *   // In GoLiveStudio when performer goes live:
 *   SoundPriorityManager.setContext('live_performance');
 *
 *   // In AudienceScene when entering lobby:
 *   SoundPriorityManager.setContext('lobby');
 *
 *   // In AvatarWorkspace / dressing room:
 *   SoundPriorityManager.setContext('dressing_room');
 *
 *   // In useAvatarAudio hook:
 *   if (!SoundPriorityManager.canPlay('avatar')) return;
 */

export type SoundContext =
  | 'live_performance'  // performer is live — avatar sfx fully blocked
  | 'host_speaking'     // host is actively speaking — avatar sfx blocked
  | 'lobby'             // audience lobby — all layers allowed
  | 'dressing_room'     // avatar customization — all layers allowed, emotes encouraged
  | 'ui'                // general UI navigation — ui layer only
  | 'idle';             // default startup state — all layers allowed

export type SoundLayer = 'avatar' | 'ui' | 'crowd' | 'host' | 'ambient';

const ALLOW_MAP: Record<SoundContext, ReadonlySet<SoundLayer>> = {
  live_performance: new Set<SoundLayer>(['host', 'crowd']),
  host_speaking:    new Set<SoundLayer>(['host', 'crowd', 'ui']),
  lobby:            new Set<SoundLayer>(['avatar', 'ui', 'crowd', 'host', 'ambient']),
  dressing_room:    new Set<SoundLayer>(['avatar', 'ui', 'ambient']),
  ui:               new Set<SoundLayer>(['ui']),
  idle:             new Set<SoundLayer>(['avatar', 'ui', 'crowd', 'host', 'ambient']),
};

class SoundPriorityManagerClass {
  private context: SoundContext = 'idle';
  private listeners: Array<(ctx: SoundContext) => void> = [];

  /** Set the current platform context. Notifies all subscribers. */
  setContext(ctx: SoundContext): void {
    if (this.context === ctx) return;
    this.context = ctx;
    this.listeners.forEach((fn) => fn(ctx));
  }

  getContext(): SoundContext {
    return this.context;
  }

  /** Returns true if the given sound layer is permitted in the current context. */
  canPlay(layer: SoundLayer): boolean {
    return (ALLOW_MAP[this.context] as Set<SoundLayer>).has(layer);
  }

  /**
   * Subscribe to context changes.
   * Returns an unsubscribe function.
   */
  subscribe(fn: (ctx: SoundContext) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const SoundPriorityManager = new SoundPriorityManagerClass();

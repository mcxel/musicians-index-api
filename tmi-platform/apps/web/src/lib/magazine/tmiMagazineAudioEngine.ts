const STORAGE_KEY = "tmi_magazine_sound_enabled";

type TmiMagazineSoundKey = "pageTurn" | "pageOpen" | "pageClose" | "softSwipe" | "pagesTurning";

type TmiMagazineAudioMap = Record<TmiMagazineSoundKey, string | null>;

const DEFAULT_SOUNDS: TmiMagazineAudioMap = {
  pageTurn: null,
  pageOpen: null,
  pageClose: null,
  softSwipe: null,
  pagesTurning: null,
};

/** Single-page turn plays at this gain — at least 50% quieter than the prior 0.3 default. */
const PAGE_TURN_VOLUME = 0.14;
/** Multi-page section-jump flip is allowed to sit slightly above the single-turn floor. */
const PAGES_TURNING_VOLUME = 0.16;
/** Hard cap so a long "rapid flipping" source clip never outlasts a bounded jump animation. */
const PAGES_TURNING_MAX_MS = 1400;

function canUseDom(): boolean {
  return typeof window !== "undefined";
}

export class TmiMagazineAudioEngine {
  private enabled: boolean;
  private sounds: TmiMagazineAudioMap;
  private elements: Partial<Record<TmiMagazineSoundKey, HTMLAudioElement>> = {};
  private activeAudioContexts = new Set<AudioContext>();
  private pagesTurningStopTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(soundMap?: Partial<TmiMagazineAudioMap>) {
    this.sounds = { ...DEFAULT_SOUNDS, ...(soundMap ?? {}) };
    this.enabled = this.readEnabledFromStorage();
    this.preload();
  }

  get soundEnabled(): boolean {
    return this.enabled;
  }

  setSoundEnabled(value: boolean): void {
    this.enabled = value;
    if (!canUseDom()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // safe fallback
    }
  }

  toggleMute(): boolean {
    this.setSoundEnabled(!this.enabled);
    return this.enabled;
  }

  /** Preload/cache every configured source now so the first real page turn has no fetch lag. */
  private preload(): void {
    if (!canUseDom()) return;
    (Object.keys(this.sounds) as TmiMagazineSoundKey[]).forEach((key) => {
      const src = this.sounds[key];
      if (!src) return;
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      this.elements[key] = audio;
    });
  }

  /** One ordinary page turn — used for both swipe and Next/Previous. Plays once, no overlap. */
  async playPageTurn(): Promise<void> {
    await this.play("pageTurn", PAGE_TURN_VOLUME);
  }

  async playPageOpen(): Promise<void> {
    await this.play("pageOpen", 0.3);
  }

  async playPageClose(): Promise<void> {
    await this.play("pageClose", 0.3);
  }

  async playSoftSwipe(): Promise<void> {
    await this.play("softSwipe", PAGE_TURN_VOLUME);
  }

  /**
   * Multi-page section jump. `jumpDistance` (number of pages skipped) lets the
   * caller scale animation duration; the sound itself is always cut at
   * PAGES_TURNING_MAX_MS so a long source clip never makes users wait.
   */
  async playPagesTurning(): Promise<void> {
    if (this.pagesTurningStopTimer) {
      clearTimeout(this.pagesTurningStopTimer);
      this.pagesTurningStopTimer = null;
    }
    const el = await this.play("pagesTurning", PAGES_TURNING_VOLUME);
    if (!el) return;
    this.pagesTurningStopTimer = setTimeout(() => {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        // safe fallback
      }
      this.pagesTurningStopTimer = null;
    }, PAGES_TURNING_MAX_MS);
  }

  private async play(key: TmiMagazineSoundKey, volume: number): Promise<HTMLAudioElement | null> {
    if (!this.enabled) return null;
    if (!canUseDom()) return null;

    const src = this.sounds[key];
    if (src) {
      try {
        // Reuse the preloaded element and reset it, rather than constructing a
        // fresh Audio() per call — this is both what makes preloading actually
        // avoid first-turn lag, and what prevents the same sound stacking on
        // top of itself during fast navigation (reset+replay, never pile up).
        const audio = this.elements[key] ?? new Audio(src);
        this.elements[key] = audio;
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;
        await audio.play();
        return audio;
      } catch {
        // Fall back to Web Audio synthesis
      }
    }

    // Non-blocking Web Audio API synthesized paper swish
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      this.activeAudioContexts.add(ctx);
      noise.start();
      setTimeout(() => {
        this.activeAudioContexts.delete(ctx);
        ctx.close().catch(() => {});
      }, 200);
    } catch {
      // Safe fallback
    }
    return null;
  }

  /**
   * Pause every preloaded element and clear pending timers — call this on
   * unmount so a page-turn sound in flight doesn't keep playing as an
   * orphaned <audio> after the reader closes (Rule 37).
   */
  dispose(): void {
    if (this.pagesTurningStopTimer) {
      clearTimeout(this.pagesTurningStopTimer);
      this.pagesTurningStopTimer = null;
    }
    (Object.values(this.elements) as HTMLAudioElement[]).forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // safe fallback
      }
    });
    this.elements = {};
    for (const context of this.activeAudioContexts) {
      context.close().catch(() => {});
    }
    this.activeAudioContexts.clear();
  }

  private readEnabledFromStorage(): boolean {
    if (!canUseDom()) return true;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "0") return false;
      if (stored === "1") return true;
      return true;
    } catch {
      return true;
    }
  }
}

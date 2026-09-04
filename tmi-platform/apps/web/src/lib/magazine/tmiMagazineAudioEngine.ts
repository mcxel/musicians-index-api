const STORAGE_KEY = "tmi_magazine_sound_enabled";

type TmiMagazineSoundKey = "pageTurn" | "pageOpen" | "pageClose" | "softSwipe";

type TmiMagazineAudioMap = Record<TmiMagazineSoundKey, string | null>;

const DEFAULT_SOUNDS: TmiMagazineAudioMap = {
  pageTurn: null,
  pageOpen: null,
  pageClose: null,
  softSwipe: null,
};

function canUseDom(): boolean {
  return typeof window !== "undefined";
}

export class TmiMagazineAudioEngine {
  private enabled: boolean;
  private sounds: TmiMagazineAudioMap;

  constructor(soundMap?: Partial<TmiMagazineAudioMap>) {
    this.sounds = { ...DEFAULT_SOUNDS, ...(soundMap ?? {}) };
    this.enabled = this.readEnabledFromStorage();
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

  async playPageTurn(): Promise<void> {
    await this.play("pageTurn");
  }

  async playPageOpen(): Promise<void> {
    await this.play("pageOpen");
  }

  async playPageClose(): Promise<void> {
    await this.play("pageClose");
  }

  async playSoftSwipe(): Promise<void> {
    await this.play("softSwipe");
  }

  private async play(key: TmiMagazineSoundKey): Promise<void> {
    if (!this.enabled) return;
    if (!canUseDom()) return;

    const src = this.sounds[key];
    if (src) {
      try {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 0.3;
        await audio.play();
        return;
      } catch {
        // Fall back to Web Audio synthesis
      }
    }

    // Non-blocking Web Audio API synthesized paper swish
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      setTimeout(() => { ctx.close().catch(() => {}); }, 200);
    } catch {
      // Safe fallback
    }
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

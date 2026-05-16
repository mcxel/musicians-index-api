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
    if (!src) return;

    try {
      const audio = new Audio(src);
      audio.preload = "auto";
      await audio.play();
    } catch {
      // safe fallback when files are missing or blocked
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

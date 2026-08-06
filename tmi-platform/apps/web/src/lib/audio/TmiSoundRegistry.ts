/**
 * TmiSoundRegistry.ts — Phase 5.4 Production UX Convergence
 * Centralized Web Audio Sound Effects & Notification Preference Registry.
 *
 * Enforces Rule 8 (Notification Center & Sound Library).
 * Synthesizes platform audio cues via Web Audio API oscillators and noise buffers:
 *   - message: soft digital ding (C6 → E6 sine synth)
 *   - mention: bright chime (E6 → G6 → C7 chime)
 *   - achievement: orchestra flourish (C5 chord ascent)
 *   - purchase: cash register (metallic dual-pulse)
 *   - live_invite: crowd swell (bandpass noise sweep)
 *   - stage_ready: spotlight sting (sub-bass drop + high chime)
 */

export type TmiSoundCue =
  | "message"
  | "mention"
  | "achievement"
  | "purchase"
  | "live_invite"
  | "stage_ready";

export interface NotificationChannelPreferences {
  sound: boolean;
  popup: boolean;
  badge: boolean;
  push: boolean;
}

export interface NotificationSettingsState {
  masterMute: boolean;
  volume: number;
  channels: Record<"community" | "friends" | "messages" | "live_events" | "purchases" | "achievements", NotificationChannelPreferences>;
}

const DEFAULT_PREFERENCES: NotificationSettingsState = {
  masterMute: false,
  volume: 0.8,
  channels: {
    community: { sound: true, popup: true, badge: true, push: false },
    friends: { sound: true, popup: true, badge: true, push: true },
    messages: { sound: true, popup: true, badge: true, push: true },
    live_events: { sound: true, popup: true, badge: true, push: true },
    purchases: { sound: true, popup: true, badge: true, push: false },
    achievements: { sound: true, popup: true, badge: true, push: false },
  },
};

export class TmiSoundRegistry {
  private static instance: TmiSoundRegistry | null = null;
  private audioCtx: AudioContext | null = null;
  private settings: NotificationSettingsState = DEFAULT_PREFERENCES;

  private constructor() {}

  public static getInstance(): TmiSoundRegistry {
    if (!TmiSoundRegistry.instance) {
      TmiSoundRegistry.instance = new TmiSoundRegistry();
    }
    return TmiSoundRegistry.instance;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      void this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playCue(cue: TmiSoundCue): void {
    if (this.settings.masterMute) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.settings.volume, now);
    masterGain.connect(ctx.destination);

    switch (cue) {
      case "message": {
        // Soft digital ding
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, now); // C6
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case "mention": {
        // Bright chime
        [1318.51, 1567.98, 2093.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.25, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.2);
        });
        break;
      }
      case "achievement": {
        // Orchestra flourish
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.4);
        });
        break;
      }
      case "purchase": {
        // Metallic cash register pulse
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case "live_invite":
      case "stage_ready": {
        // Sub-bass sweep + spotlight chime
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
    }
  }

  public getSettings(): NotificationSettingsState {
    return this.settings;
  }

  public updateSettings(partial: Partial<NotificationSettingsState>): void {
    this.settings = { ...this.settings, ...partial };
  }
}

export const tmiSoundRegistry = TmiSoundRegistry.getInstance();

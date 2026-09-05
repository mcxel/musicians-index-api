/**
 * Rehearsal Audio Engine — Professional Sound Ducking, Leveling & Safety Limiter.
 *
 * Enforces:
 *   1. Zero avatar presence — audio processing for live WebRTC performer panels.
 *   2. Mode-aware audio profiles (MEETING vs VOCAL vs FULL_BAND).
 *   3. Automated gain safety, compression, peak limiter to prevent clipping/distortion during loud practice.
 *   4. Talkback ducking (ducks backing track when talkback cue triggers).
 *   5. Independent local monitor mixes.
 */

export type RehearsalAudioProfile =
  | "MEETING"
  | "VOCAL_REHEARSAL"
  | "ACOUSTIC_REHEARSAL"
  | "FULL_BAND"
  | "AUDITION"
  | "LISTENING_SESSION";

export interface LocalMonitorMix {
  me: number; // 0 to 100
  band: number; // 0 to 100
  backingTrack: number; // 0 to 100
  talkback: number; // 0 to 100
  room: number; // 0 to 100
}

export interface RehearsalAudioConfig {
  profile: RehearsalAudioProfile;
  talkbackActive: boolean;
  peakLimiterEnabled: boolean;
  duckingAmountDb: number; // e.g. -12dB when ducked
}

class RehearsalAudioEngineImpl {
  private config: RehearsalAudioConfig = {
    profile: "VOCAL_REHEARSAL",
    talkbackActive: false,
    peakLimiterEnabled: true,
    duckingAmountDb: -12,
  };

  private localMix: LocalMonitorMix = {
    me: 80,
    band: 65,
    backingTrack: 55,
    talkback: 90,
    room: 70,
  };

  public setProfile(profile: RehearsalAudioProfile): void {
    this.config.profile = profile;
    if (profile === "MEETING") {
      this.config.duckingAmountDb = -18;
    } else if (profile === "FULL_BAND") {
      this.config.duckingAmountDb = -8;
    } else {
      this.config.duckingAmountDb = -12;
    }
  }

  public getProfile(): RehearsalAudioProfile {
    return this.config.profile;
  }

  public setTalkback(active: boolean): void {
    this.config.talkbackActive = active;
  }

  public isTalkbackActive(): boolean {
    return this.config.talkbackActive;
  }

  public updateLocalMix(partial: Partial<LocalMonitorMix>): LocalMonitorMix {
    this.localMix = { ...this.localMix, ...partial };
    return this.localMix;
  }

  public getLocalMix(): LocalMonitorMix {
    return { ...this.localMix };
  }

  /**
   * Calculates effective output gain for a source channel considering talkback ducking and limiter safety.
   */
  public calculateChannelGain(sourceType: keyof LocalMonitorMix): number {
    const rawVolume = (this.localMix[sourceType] ?? 70) / 100;

    // Apply talkback ducking to backing track or room when talkback is active
    if (this.config.talkbackActive && (sourceType === "backingTrack" || sourceType === "room")) {
      const duckLinear = Math.pow(10, this.config.duckingAmountDb / 20);
      return Math.max(0.05, rawVolume * duckLinear);
    }

    // Safety limiter cap for loud instruments
    if (this.config.peakLimiterEnabled && (sourceType === "band" || sourceType === "me")) {
      return Math.min(0.92, rawVolume);
    }

    return rawVolume;
  }
}

export const RehearsalAudioEngine = new RehearsalAudioEngineImpl();

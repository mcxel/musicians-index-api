/**
 * EventAudioDuckingCoordinator.ts
 *
 * TMI Post-Round Audio Ducking & Fanfare Mixing Authority (Step 2B.1)
 *
 * Implements the locked Winner Stinger → Showcase transition:
 *   ROUND AUDIO (100%)
 *     ↓
 *   WIN EVENT TRIGGERED
 *     ↓
 *   CONTROLLED DUCK (to 20% over 120ms)
 *     ↓
 *   WINNER FANFARE / STINGER PLAYS
 *     ↓
 *   CONTROLLED RESTORE (to 100% over 300ms)
 *     ↓
 *   ~60-SECOND SHOWCASE AT FULL VOLUME
 *
 * SCOPE HONESTY (updated 2026-09-24, Step 2B.1 final runtime closure):
 * this class sequences duck/restore timing and exposes a state snapshot, and
 * now ALSO forwards each transition to the real canonical mixer authority —
 * ChannelMixerDirector's "music" channel (PROGRAM bus, system-authorized) —
 * which in turn calls TMIAudioSafetyMixer.setMusicGain() on a real, connected
 * GainNode. Values are imported from TMIAudioSafetyMixer directly (never
 * redeclared) so they can't drift.
 *
 * GAP CLOSED (2026-09-24, Step 2B.1 closure repair): CompetitionBeatDock now
 * mounts CompetitionBeatAudioPlayer, which plays the authorized
 * event-stream beat URL and calls TMIAudioSafetyMixer.attachMusicSource()
 * via LiveRoomMixerBind.attachMusicElement(). ChannelMixerDirector.setGain()
 * for the "music" channel now reaches a real, connected, source-bearing
 * GainNode whenever a competition room has an attached beat — not merely a
 * silent DEFAULT_ONLY node. No second AudioContext/mixer authority was
 * introduced.
 */

import { DUCK_LEVEL, DUCK_SPEED_MS, RECOVER_SPEED_MS } from "./TMIAudioSafetyMixer";
import { ChannelMixerDirector, MIXER_VIRTUAL_CHANNEL_IDS } from "./mixer/ChannelMixerDirector";

const SYSTEM_AUTH = { userId: "system:winner-stays-lifecycle", role: "system" as const, isRoomOwner: false };

export const DUCK_GAIN_LEVEL = DUCK_LEVEL;             // Auto-duck beat to 20% volume
export const DUCK_ATTACK_MS = DUCK_SPEED_MS;           // 120ms ramp down (no abrupt cuts)
export const RESTORE_RELEASE_MS = RECOVER_SPEED_MS;    // 300ms ramp up (smooth return to pocket)
export const DEFAULT_FANFARE_DURATION_MS = 2800; // Standard winner celebration fanfare length

export interface DuckingStateSnapshot {
  isDucked: boolean;
  beatGain: number;       // 0.0 to 1.0
  fanfareActive: boolean;
  timestamp: number;
}

export class EventAudioDuckingCoordinator {
  private isDucked = false;
  private currentGain = 1.0;
  private fanfareActive = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onRestoreCallback: (() => void) | null = null;

  public getState(): DuckingStateSnapshot {
    return {
      isDucked: this.isDucked,
      beatGain: this.currentGain,
      fanfareActive: this.fanfareActive,
      timestamp: Date.now(),
    };
  }

  /**
   * Initiates a controlled duck of the background beat and triggers winner fanfare.
   * Restores beat volume smoothly once fanfare completes.
   */
  public triggerWinnerCelebration(
    fanfareDurationMs = DEFAULT_FANFARE_DURATION_MS,
    onRestored?: () => void
  ): DuckingStateSnapshot {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.isDucked = true;
    this.currentGain = DUCK_GAIN_LEVEL;
    this.fanfareActive = true;
    this.onRestoreCallback = onRestored || null;

    // Reach the real canonical mixer authority — safe no-op (MIX-001/MIX-003)
    // when no room is bound yet or no real music source is attached (see
    // header comment). Not a second/shadow mixer call: this is the same
    // ChannelMixerDirector every other live-audio surface uses.
    ChannelMixerDirector.setGain({
      channelId: MIXER_VIRTUAL_CHANNEL_IDS.music,
      bus: "PROGRAM",
      gain: DUCK_GAIN_LEVEL,
      auth: SYSTEM_AUTH,
    });

    // Schedule automatic smooth restore after fanfare completes
    this.timer = setTimeout(() => {
      this.restoreBeatVolume();
    }, fanfareDurationMs);

    return this.getState();
  }

  /**
   * Restores the background beat to full volume for the ~60-second showcase window.
   */
  public restoreBeatVolume(): DuckingStateSnapshot {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.isDucked = false;
    this.currentGain = 1.0;
    this.fanfareActive = false;

    ChannelMixerDirector.setGain({
      channelId: MIXER_VIRTUAL_CHANNEL_IDS.music,
      bus: "PROGRAM",
      gain: 1.0,
      auth: SYSTEM_AUTH,
    });

    if (this.onRestoreCallback) {
      const cb = this.onRestoreCallback;
      this.onRestoreCallback = null;
      cb();
    }

    return this.getState();
  }

  /**
   * Cleanly destroys any pending timers.
   */
  public destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.onRestoreCallback = null;
  }
}

export const eventAudioDuckingCoordinator = new EventAudioDuckingCoordinator();

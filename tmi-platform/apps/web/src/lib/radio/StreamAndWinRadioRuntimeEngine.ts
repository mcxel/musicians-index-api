/**
 * StreamAndWinRadioRuntimeEngine — Stream & Win Radio Runtime.
 * Manages live radio station rotations, listener counts, trivia/polls, DJ takeovers,
 * and gamified listener reward points.
 */

export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  durationSeconds: number;
}

export class StreamAndWinRadioRuntimeEngine {
  private stationId: string;
  private stationName: string;
  private listenerCount: number = 0;
  private queue: RadioTrack[] = [];

  constructor(id: string, name: string) {
    this.stationId = id;
    this.stationName = name;
  }

  public setQueue(tracks: RadioTrack[]) {
    this.queue = [...tracks];
  }

  public tuneIn(userId: string) {
    this.listenerCount++;
    this.emitEvent("RadioTuneIn", { userId, listenerCount: this.listenerCount });
  }

  public tuneOut(userId: string) {
    this.listenerCount = Math.max(0, this.listenerCount - 1);
    this.emitEvent("RadioTuneOut", { userId, listenerCount: this.listenerCount });
  }

  public playNextTrack() {
    const track = this.queue.shift();
    if (track) {
      this.emitEvent("RadioTrackStarted", { track, stationName: this.stationName });
    }
  }

  public triggerRewardDrop(points: number = 50) {
    this.emitEvent("RadioRewardDrop", { points, timestamp: Date.now() });
  }

  private emitEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, stationId: this.stationId } },
        })
      );
    } catch (e) {}
  }
}

export default StreamAndWinRadioRuntimeEngine;

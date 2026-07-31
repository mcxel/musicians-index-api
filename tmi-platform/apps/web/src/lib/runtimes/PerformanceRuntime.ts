/**
 * PerformanceRuntime — Unified Performance & Show Base Runtime.
 * Powers Concerts, Listening Parties, World Releases, and Live Broadcasts:
 *  - Setlists & playlist queues
 *  - Stage flow & song transitions
 *  - Encore triggers & finales
 * Emits semantic events (ConcertStarted, SongStarted, EncoreTriggered).
 */

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  durationSeconds: number;
}

export class PerformanceRuntime {
  private performanceId: string;
  private headlinerName: string;
  private playlist: TrackItem[] = [];
  private currentTrackIndex: number = -1;

  constructor(id: string, headlinerName: string) {
    this.performanceId = id;
    this.headlinerName = headlinerName;
  }

  public setPlaylist(tracks: TrackItem[]) {
    this.playlist = [...tracks];
  }

  public startPerformance() {
    this.currentTrackIndex = 0;
    this.emitEvent("ConcertStarted", {
      headlinerName: this.headlinerName,
      firstTrack: this.playlist[0],
    });
  }

  public nextTrack() {
    if (this.currentTrackIndex < this.playlist.length - 1) {
      this.currentTrackIndex++;
      const track = this.playlist[this.currentTrackIndex];
      this.emitEvent("SongStarted", {
        songTitle: track.title,
        index: this.currentTrackIndex,
      });
    } else {
      this.triggerFinale();
    }
  }

  public triggerEncore() {
    this.emitEvent("EncoreTriggered", { timestamp: Date.now() });
  }

  public triggerFinale() {
    this.emitEvent("MonthlyIdolCrown", { performanceId: this.performanceId });
  }

  private emitEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, performanceId: this.performanceId } },
        })
      );
    } catch (e) {}
  }
}

export default PerformanceRuntime;

/**
 * VideoShuffleRuntimeEngine — Video Shuffle Runtime.
 * Powers music video rotations, randomized video discovery feeds, genre channels,
 * and spatial monitor casting across venue screens.
 */

export interface VideoShuffleItem {
  id: string;
  title: string;
  artist: string;
  videoUrl: string;
  genre: string;
}

export class VideoShuffleRuntimeEngine {
  private channelId: string;
  private currentGenre: string;
  private pool: VideoShuffleItem[] = [];

  constructor(channelId: string, genre: string = "ALL") {
    this.channelId = channelId;
    this.currentGenre = genre;
  }

  public setVideoPool(videos: VideoShuffleItem[]) {
    this.pool = [...videos];
  }

  public shuffleNext(): VideoShuffleItem | null {
    if (this.pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.pool.length);
    const video = this.pool[randomIndex];

    this.emitEvent("VideoShuffleTriggered", {
      video,
      channelId: this.channelId,
    });

    return video;
  }

  public castToMonitor(video: VideoShuffleItem, targetMonitorId: string) {
    this.emitEvent("VideoCastToMonitor", {
      video,
      targetMonitorId,
    });
  }

  private emitEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, channelId: this.channelId } },
        })
      );
    } catch (e) {}
  }
}

export default VideoShuffleRuntimeEngine;

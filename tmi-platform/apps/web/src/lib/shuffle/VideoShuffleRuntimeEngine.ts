/**
 * VideoShuffleRuntimeEngine.ts — Phase 5.2 Priority 8 Video Shuffle Engine.
 * Manages continuous 24/7 video stream switching, video attribution overlays, queue visualization,
 * autoplay transitions, and monitor casting.
 * Emits pure semantic events ONLY — zero presentation math inside the engine.
 */

import { BaseCompetitionRuntime } from "@/lib/competition/CompetitionRuntime";

export type ShuffleState =
  | "SHUFFLE_ACTIVE"
  | "VIDEO_PLAYING"
  | "AUTOPLAY_TRANSITION"
  | "QUEUE_UPDATED"
  | "CASTING_ACTIVE"
  | "SHUFFLE_COOLDOWN";

export interface VideoShuffleItem {
  videoId: string;
  title: string;
  performerName: string;
  videoUrl: string;
  posterFrameUrl?: string;
  durationSeconds: number;
}

export class VideoShuffleRuntimeEngine extends BaseCompetitionRuntime {
  private shuffleState: ShuffleState = "SHUFFLE_ACTIVE";
  private videoQueue: VideoShuffleItem[] = [];
  private currentVideoIndex: number = 0;

  constructor(shuffleId: string) {
    super(shuffleId, "SHUFFLE");
  }

  public startShuffle(queue: VideoShuffleItem[]) {
    this.videoQueue = queue;
    this.shuffleState = "SHUFFLE_ACTIVE";
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("ShuffleStarted", {
      shuffleId: this.competitionId,
      queueLength: queue.length,
    });
  }

  public playVideo(videoIndex: number = 0) {
    this.currentVideoIndex = videoIndex;
    this.shuffleState = "VIDEO_PLAYING";
    const video = this.videoQueue[videoIndex] ?? this.videoQueue[0];
    this.emitSemanticEvent("VideoPlaying", {
      shuffleId: this.competitionId,
      videoIndex,
      video,
    });
  }

  public triggerAutoplayNext() {
    this.currentVideoIndex = (this.currentVideoIndex + 1) % Math.max(1, this.videoQueue.length);
    this.shuffleState = "AUTOPLAY_TRANSITION";
    const nextVideo = this.videoQueue[this.currentVideoIndex];
    this.emitSemanticEvent("AutoplayTransition", {
      shuffleId: this.competitionId,
      nextVideoIndex: this.currentVideoIndex,
      nextVideo,
    });
  }

  public castVideo(surfaceId: string = "main-stage-screen") {
    this.shuffleState = "CASTING_ACTIVE";
    this.emitSemanticEvent("CastingActive", {
      shuffleId: this.competitionId,
      surfaceId,
      currentVideo: this.videoQueue[this.currentVideoIndex],
    });
  }

  public cooldown() {
    this.shuffleState = "SHUFFLE_COOLDOWN";
    this.status = "IDLE";
    this.emitSemanticEvent("ShuffleCooldown", {
      shuffleId: this.competitionId,
    });
  }
}

export default VideoShuffleRuntimeEngine;

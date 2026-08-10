/**
 * VideoShuffleRuntimeEngine.ts — Phase 5.2 Priority 8 Video Shuffle Engine.
 * Manages continuous 24/7 video stream switching, video attribution overlays, queue visualization,
 * autoplay transitions, and monitor casting.
 * Emits pure semantic events ONLY — zero presentation math inside the engine.
 *
 * Architecture invariant (locked):
 *   Video Shuffle is a 24/7 VIDEO NETWORK with four independent channels:
 *   MUSIC | DANCE | COMEDY | TV
 *   Each channel has its own clock, queue, history, ad schedule, and analytics.
 *   Radio queue ≠ Video queue. Personal playlists ≠ either.
 */

import { BaseCompetitionRuntime } from "@/lib/competition/CompetitionRuntime";

// ── Four-channel constants — do not add more; genres are programming attributes ──
export const VIDEO_SHUFFLE_CHANNELS = ['MUSIC', 'DANCE', 'COMEDY', 'TV'] as const;
export type VideoShuffleChannel = typeof VIDEO_SHUFFLE_CHANNELS[number];

/** Programming block tags — attributes applied to items within a channel, not new channels */
export type VideoShuffleProgramTag =
  | 'HIP_HOP' | 'R_AND_B' | 'ROCK' | 'GOSPEL' | 'COUNTRY' | 'JAZZ' | 'POP' | 'ELECTRONIC'
  | 'DISCOVERY' | 'RISING' | 'NEW_ARTIST' | 'FEATURED' | 'EDITORIAL' | 'BOOSTED'
  | 'NEW_RELEASES' | 'THROWBACK' | 'GENRE_BLOCK' | 'PREMIERE';

/** Rotation scoring inputs — Rotation Governor reads these; no single signal dominates */
export interface VideoShuffleRotationScore {
  eligibility: boolean;
  freshness: number;          // 0-1 — newer = higher
  audienceResponse: number;   // 0-1 — reactions/completes
  completionRate: number;     // 0-1 — watch-through
  discoveryNeed: number;      // 0-1 — unknown artists get lift
  categoryBalance: number;    // 0-1 — prevent one genre monopoly
  creatorFrequencyCap: boolean; // false = creator is over frequency limit this window
  boostMultiplier: number;    // 1.0 baseline; max 2.5 — boost = more opportunity, not fake views
  repetitionPenalty: number;  // 0-1 — reduces score if aired recently
  rightsHealth: boolean;      // false = rights issue, must not air
}

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
  channel?: VideoShuffleChannel;
  programTags?: VideoShuffleProgramTag[];
  rotationScore?: Partial<VideoShuffleRotationScore>;
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

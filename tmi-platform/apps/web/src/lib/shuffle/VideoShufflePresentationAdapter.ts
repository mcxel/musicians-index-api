/**
 * VideoShufflePresentationAdapter.ts — Phase 5.2 Video Shuffle Presentation Adapter.
 * Connects VideoShuffleRuntimeEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Orchestrates continuous video stream switching, video attribution overlays, queue visualization, autoplay transitions, and casting status.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";
import type { VideoShuffleItem } from "./VideoShuffleRuntimeEngine";

export class VideoShufflePresentationAdapter {
  private active: boolean = false;
  private runtimeId: string;
  private venueId: string;

  constructor(runtimeId: string, venueId: string = "video-shuffle-wall") {
    this.runtimeId = runtimeId;
    this.venueId = venueId;
  }

  public initialize() {
    if (this.active) return;
    this.active = true;

    if (typeof window === "undefined") return;

    window.addEventListener("tmi:system:event", (e: Event) => {
      const customEvent = e as CustomEvent<{
        eventName: string;
        payload?: Record<string, unknown>;
      }>;
      const { eventName, payload } = customEvent.detail || {};
      if (payload?.shuffleId === this.runtimeId || !payload?.shuffleId) {
        void this.handleShuffleLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleShuffleLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["video-wall-center", "queue-rail-anchor"],
      registeredMonitorSurfaces: ["main-stage-screen", "queue-monitor", "side-rail-chat", "bottom-dock-status"],
    };

    switch (eventName) {
      case "ShuffleStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_SHUFFLE_LIGHTING", { preset: "ARENA" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "queue-monitor", anchorId: "RIGHT_PANEL", intent: "QUEUE_BEAT_INFO", stackHint: "SECONDARY" },
            ],
          }),
          context,
        );
        break;
      }

      case "VideoPlaying": {
        const video = payload?.video as VideoShuffleItem | undefined;
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_VIDEO_ATTRIBUTION_CARD", {
            title: video?.title,
            performerName: video?.performerName,
            durationSeconds: video?.durationSeconds,
          }),
          context,
        );
        break;
      }

      case "AutoplayTransition": {
        await DirectorRegistry.dispatch(
          this.buildCommand("MOTION", "WIPE_AUTOPLAY_TRANSITION", { transitionType: "SLIDE" }),
          context,
        );
        break;
      }

      case "CastingActive": {
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "CAST_VIDEO_TO_SURFACE", {
            surfaceId: payload?.surfaceId ?? "main-stage-screen",
            intent: "PROGRAM",
          }),
          context,
        );
        break;
      }

      case "ShuffleCooldown": {
        await DirectorRegistry.resetRuntime(this.runtimeId);
        break;
      }
    }
  }

  private buildCommand(
    director: PresentationCommand["director"],
    action: string,
    payload: Record<string, unknown>,
    priority: PresentationCommand["priority"] = "NORMAL",
  ): PresentationCommand {
    return {
      commandId: `cmd-shuffle-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      correlationId: `corr-${this.runtimeId}-${Date.now()}`,
      director,
      action,
      payload,
      priority,
      requestedAt: new Date().toISOString(),
    };
  }
}

export default VideoShufflePresentationAdapter;

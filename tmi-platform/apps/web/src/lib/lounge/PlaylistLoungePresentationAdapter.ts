/**
 * PlaylistLoungePresentationAdapter.ts — Phase 5.2 Playlist Lounge Presentation Adapter.
 * Connects PlaylistLoungeRuntimeEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Orchestrates ambient lighting, floating 3D album art, equalizers, listening circles, synchronized lyrics, and monitor casting.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";

export class PlaylistLoungePresentationAdapter {
  private active: boolean = false;
  private runtimeId: string;
  private venueId: string;

  constructor(runtimeId: string, venueId: string = "playlist-lounge-vip") {
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
      if (payload?.loungeId === this.runtimeId || !payload?.loungeId) {
        void this.handleLoungeLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleLoungeLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["album-art-floating-anchor", "listening-circle-center", "equalizer-wall-anchor"],
      registeredMonitorSurfaces: ["main-stage-screen", "lounge-wall-monitor", "side-rail-chat", "bottom-dock-status"],
    };

    switch (eventName) {
      case "LoungeOpened":
      case "AmbientWarmup": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_AMBIENT_LOUNGE_PRESET", { preset: "ARENA" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "lounge-wall-monitor", anchorId: "RIGHT_PANEL", intent: "LOUNGE_MONITOR", stackHint: "SECONDARY" },
            ],
          }),
          context,
        );
        break;
      }

      case "LoungeTrackStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_FLOATING_ALBUM_ART", {
            title: (payload?.track as { title?: string })?.title,
            artist: (payload?.track as { artistName?: string })?.artistName,
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "START_3D_EQUALIZER_RING", { underlayType: "BEAT_REACTIVE_FLOOR_RING" }),
          context,
        );
        break;
      }

      case "ListeningCircleStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "ENTER_LISTENING_CIRCLE", { behavior: "SIT", intensity: 0.5 }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "FRAME_LISTENING_CIRCLE", { targetAnchorId: "listening-circle-center", mode: "ORBIT" }),
          context,
        );
        break;
      }

      case "LyricsSynced": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_LYRICS_OVERLAY", { currentLine: payload?.currentLine }),
          context,
        );
        break;
      }

      case "MonitorCastTriggered": {
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "CAST_TRACK_TO_SCREEN", {
            surfaceId: payload?.surfaceId ?? "main-stage-screen",
            intent: "PROGRAM",
          }),
          context,
        );
        break;
      }

      case "LoungeCooldown": {
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
      commandId: `cmd-lounge-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

export default PlaylistLoungePresentationAdapter;

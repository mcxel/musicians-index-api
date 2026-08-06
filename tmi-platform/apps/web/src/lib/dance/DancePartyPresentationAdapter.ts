/**
 * DancePartyPresentationAdapter.ts — Phase 5.2 Dance Party Presentation Adapter.
 * Connects WorldDancePartyRuntimeEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Orchestrates beat-reactive visual drops, 8-camera DJ rotations, crowd heat surges,
 * spatial audio mixes, and platform-wide Global Dance Waves.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";
import PresentationTelemetryDirector from "@/lib/presentation/directors/PresentationTelemetryDirector";

export class DancePartyPresentationAdapter {
  private active: boolean = false;
  private runtimeId: string;
  private venueId: string;

  constructor(runtimeId: string, venueId: string = "dance-floor-arena") {
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
      if (payload?.roomId === this.runtimeId || !payload?.roomId) {
        void this.handleDanceLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleDanceLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["dj-booth-anchor", "main-floor-anchor", "vip-lounge-anchor", "laser-grid-center"],
      registeredMonitorSurfaces: ["dj-backdrop-screen", "lounge-wall-monitor", "side-rail-chat", "bottom-dock-status"],
    };

    switch (eventName) {
      case "RoomStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_EDM_LIGHTING", { preset: "ARENA" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "dj-backdrop-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "lounge-wall-monitor", anchorId: "RIGHT_PANEL", intent: "LOUNGE_MONITOR", stackHint: "SECONDARY" },
              { surfaceId: "side-rail-chat", anchorId: "SIDE_RAIL", intent: "CHAT_SPONSORS", stackHint: "HUD" },
              { surfaceId: "bottom-dock-status", anchorId: "BOTTOM_DOCK", intent: "TIMERS_STATUS", stackHint: "HUD" },
            ],
          }),
          context,
        );
        break;
      }

      case "DjTransition": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_DJ_BADGE", {
            djName: (payload?.incomingDj as { name?: string })?.name,
            transitionMessage: payload?.transitionMessage,
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "FRAME_DJ_BOOTH", { targetAnchorId: "dj-booth-anchor", mode: "FOCUS" }),
          context,
        );
        break;
      }

      case "BeatDropTriggered": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "STROBE_BEAT_DROP", { preset: "BEAT_DROP_FLASH" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_LASER_GRID", { fxType: "LASERS" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "HIGH_SPEED_PULSE_RINGS", { underlayType: "BEAT_REACTIVE_FLOOR_RING" }),
          context,
        );
        break;
      }

      case "HighBassPulse": {
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "RIPPLE_FLOOR_PULSE", { intensity: payload?.intensity }),
          context,
        );
        break;
      }

      case "CrowdHeatSurge": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "HYPER_CHEER_EMOJI_RAIN", { behavior: "CHEER_HYPER", intensity: 0.95 }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "HEAT_STROBE_SURGE", { preset: "GOLD_CELEBRATION" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "FLAME_HEAT_CIRCLE", { underlayType: "FLAME_HEAT_RING" }),
          context,
        );
        break;
      }

      case "GlobalDanceWaveSync": {
        await DirectorRegistry.dispatch(
          this.buildCommand("BROADCAST", "GLOBAL_DANCE_WAVE_SYNC", { waveColor: payload?.waveColor }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "GOLD_CYAN_SWEEP", { preset: "GOLD_CELEBRATION" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "GLOBAL_WAVE_CONFETTI", { fxType: "CONFETTI", palette: ["#FFD700", "#00FFFF"] }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_STADIUM_ROAR", { cueType: "VICTORY_STINGER" }),
          context,
        );
        break;
      }

      case "DancePartyCooldown": {
        await DirectorRegistry.resetRuntime(this.runtimeId);
        break;
      }
    }

    // Publish live telemetry snapshot to Observatory / Live Discovery
    PresentationTelemetryDirector.getTelemetry(this.runtimeId);
  }

  private buildCommand(
    director: PresentationCommand["director"],
    action: string,
    payload: Record<string, unknown>,
    priority: PresentationCommand["priority"] = "NORMAL",
  ): PresentationCommand {
    return {
      commandId: `cmd-dance-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

export default DancePartyPresentationAdapter;

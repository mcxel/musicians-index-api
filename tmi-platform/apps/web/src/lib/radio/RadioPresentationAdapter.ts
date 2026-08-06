/**
 * RadioPresentationAdapter.ts — Phase 5.2 Radio Presentation Adapter.
 * Connects RadioRuntimeEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Orchestrates automated lower-third track attributions, listener count updates, live polls, sponsor rails, and instant radio prize drops.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";
import { reserveAndAwardPrize } from "@/lib/commerce/AudienceGiveawayEngine";

export class RadioPresentationAdapter {
  private active: boolean = false;
  private runtimeId: string;
  private venueId: string;

  constructor(runtimeId: string, venueId: string = "radio-broadcast-studio") {
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
      if (payload?.radioId === this.runtimeId || !payload?.radioId) {
        void this.handleRadioLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleRadioLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["radio-booth-anchor", "sponsor-rail-anchor", "listener-counter-anchor"],
      registeredMonitorSurfaces: ["main-stage-screen", "sponsor-rail-monitor", "side-rail-chat", "bottom-dock-status"],
    };

    switch (eventName) {
      case "RadioBroadcastStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_RADIO_STUDIO_LIGHTING", { preset: "ARENA" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "sponsor-rail-monitor", anchorId: "RIGHT_PANEL", intent: "SPONSOR_RAIL", stackHint: "SECONDARY" },
            ],
          }),
          context,
        );
        break;
      }

      case "RadioTrackStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_RADIO_LOWER_THIRD", {
            title: (payload?.track as { title?: string })?.title,
            artistName: (payload?.track as { artistName?: string })?.artistName,
            stationName: (payload?.track as { stationName?: string })?.stationName,
          }),
          context,
        );
        break;
      }

      case "ListenerCountUpdated": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "UPDATE_LISTENER_COUNTER_BUG", {
            count: payload?.activeListenersCount,
          }),
          context,
        );
        break;
      }

      case "LivePollTriggered": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_LIVE_POLL_HUD", {
            question: payload?.question,
            options: payload?.options,
          }),
          context,
        );
        break;
      }

      case "RadioPrizeDropped": {
        const winnerId = (payload?.winnerId as string) || "radio-winner-1";
        const prizeTitle = (payload?.prizeTitle as string) || "Amazon $50 Gift Card";

        reserveAndAwardPrize(this.runtimeId, winnerId, "Radio Listener", "prize-radio-01");

        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_RADIO_PRIZE_DROP_BANNER", { prizeTitle }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "RADIO_PRIZE_FLASH", { preset: "GOLD_CELEBRATION" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_PRIZE_DROP_STINGER", { cueType: "VICTORY_STINGER" }),
          context,
        );
        break;
      }

      case "RadioCooldown": {
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
      commandId: `cmd-radio-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

export default RadioPresentationAdapter;

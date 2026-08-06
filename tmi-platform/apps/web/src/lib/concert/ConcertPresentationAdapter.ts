/**
 * ConcertPresentationAdapter.ts — Phase 5.2 Concert Presentation Adapter.
 * Connects ConcertRuntimeEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Orchestrates arena stage entrance fly-ins, blackout spot sweeps, pyro/CO2 jets,
 * audience wave mode participation, sponsor moments, and auditable PrizeVault celebrations.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";
import { reserveAndAwardPrize } from "@/lib/commerce/AudienceGiveawayEngine";

export class ConcertPresentationAdapter {
  private active: boolean = false;
  private runtimeId: string;
  private venueId: string;

  constructor(runtimeId: string, venueId: string = "arena-main-stage") {
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
      if (payload?.concertId === this.runtimeId || !payload?.concertId) {
        void this.handleConcertLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleConcertLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["stage-center-anchor", "hero-entrance-anchor", "audience-crane-anchor", "winner-spotlight-anchor"],
      registeredMonitorSurfaces: ["main-stage-screen", "setlist-rail-monitor", "side-rail-chat", "bottom-dock-status"],
    };

    switch (eventName) {
      case "VenuePrep":
      case "HouseLightsActivated": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_WARM_HOUSE_LIGHTS", { preset: "ARENA" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "setlist-rail-monitor", anchorId: "RIGHT_PANEL", intent: "SETLIST_RAIL", stackHint: "SECONDARY" },
              { surfaceId: "side-rail-chat", anchorId: "SIDE_RAIL", intent: "CHAT_SPONSORS", stackHint: "HUD" },
              { surfaceId: "bottom-dock-status", anchorId: "BOTTOM_DOCK", intent: "TIMERS_STATUS", stackHint: "HUD" },
            ],
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "ENTER_SEATING_STATE", { behavior: "SIT", intensity: 0.3 }),
          context,
        );
        break;
      }

      case "SponsorRollStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_SPONSOR_BILLBOARD", { sponsorName: payload?.sponsorName ?? "Nike" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("BROADCAST", "SHOW_SPONSOR_LOWER_THIRD", { sponsorName: payload?.sponsorName }),
          context,
        );
        break;
      }

      case "StageEntrance": {
        // 1. Blackout to spot sweep
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "BLACKOUT_SPOTLIGHT_SWEEP", { preset: "ARENA" }, "CRITICAL"),
          context,
        );
        // 2. Audience fly-through crane shot to hero entrance
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "CRANE_FLYTHROUGH_ORBIT", { targetAnchorId: "hero-entrance-anchor", mode: "CINEMATIC_FLY_IN" }, "CRITICAL"),
          context,
        );
        // 3. Holographic floor runway
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "START_HOLOGRAPHIC_RUNWAY", { underlayType: "BEAT_REACTIVE_FLOOR_RING" }),
          context,
        );
        // 4. Pyrotechnics & CO2 Jets
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_PYRO_CO2_JETS", { fxType: "FIRE" }),
          context,
        );
        // 5. Stadium crowd roar
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_STADIUM_CROWD_ROAR", { cueType: "ROUND_START" }),
          context,
        );
        break;
      }

      case "OpeningSongStarted":
      case "EncoreStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "FRAME_HEADLINER", { targetAnchorId: "stage-center-anchor", mode: "FOLLOW" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_NOW_PLAYING_CARD", { title: (payload?.track as { title?: string })?.title }),
          context,
        );
        break;
      }

      case "AudienceWaveTriggered": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "TRIGGER_AUDIENCE_WAVE", { behavior: "CHEER_HYPER", mode: payload?.mode ?? "WAVE", intensity: 0.95 }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "AUDIENCE_PHONE_LIGHTS", { preset: "BEAT_DROP_FLASH" }),
          context,
        );
        break;
      }

      case "SponsorMomentStarted": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_SPONSOR_MOMENT_BUG", { sponsorName: payload?.sponsorName, message: payload?.sponsorMessage }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "BRAND_COLOR_ILLUMINATION", { preset: "GOLD_CELEBRATION" }),
          context,
        );
        break;
      }

      case "PrizeAwarded": {
        const winnerId = (payload?.winnerId as string) || "winner-1";
        const winnerName = (payload?.winnerName as string) || "Lucky Audience Member";
        const prizeTitle = (payload?.prizeTitle as string) || "Nike Air Zoom Sneakers";

        // Reserve & award prize in Vault
        reserveAndAwardPrize(this.runtimeId, winnerId, winnerName, "prize-nike-01");

        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "WINNER_SPOTLIGHT_FOCUS", { targetAnchorId: "winner-spotlight-anchor", mode: "FOCUS" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_PRIZE_WINNER_BANNER", { winnerName, prizeTitle }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "GOLD_CELEBRATION", { preset: "GOLD_CELEBRATION" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_CONFETTI_FIREWORKS", { fxType: "CONFETTI", palette: ["#FFD700", "#00E5FF"] }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_VICTORY_STINGER", { cueType: "VICTORY_STINGER" }),
          context,
        );
        break;
      }

      case "ConcertEnded":
      case "AfterPartyStarted": {
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
      commandId: `cmd-concert-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

export default ConcertPresentationAdapter;

/**
 * BattlePresentationAdapter.ts — Phase 5.2 Battle Presentation Adapter.
 * Connects BattleRuntimeEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Zero presentation math inside the battle engine — 100% delegated to presentation directors.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";

export class BattlePresentationAdapter {
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
      if (payload?.competitionId === this.runtimeId || !payload?.competitionId) {
        void this.handleBattleLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleBattleLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["performer-primary", "performer-secondary", "judge-anchor", "battle-score-top", "winner-focus-center"],
      registeredMonitorSurfaces: ["main-stage-screen", "hud-overlay-surface", "judge-monitor", "score-board"],
    };

    switch (eventName) {
      case "BattleStarted": {
        // 1. Lighting preset
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_ARENA_PRESET", { preset: "ARENA" }),
          context,
        );
        // 2. Dual monitor split
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "score-board", anchorId: "LEFT_PANEL", intent: "SCORES", stackHint: "SECONDARY" },
            ],
          }),
          context,
        );
        // 3. Crowd attentive
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "ENTER_ATTENTIVE_STATE", { behavior: "SIT", intensity: 0.4 }),
          context,
        );
        break;
      }

      case "RoundStarted": {
        // 1. Versus overlay
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_VERSUS_CARD", {
            overlayType: "BATTLE_VERSUS_BADGE",
            roundNumber: payload?.roundNumber ?? 1,
          }),
          context,
        );
        // 2. Camera focus
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "FRAME_PERFORMER_PRIMARY", { targetAnchorId: "performer-primary", mode: "FOLLOW" }),
          context,
        );
        // 3. Sound horn
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_ROUND_START", { cueType: "ROUND_START" }),
          context,
        );
        break;
      }

      case "PerformerJoinedStage": {
        // 1. Underlay beat ring
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "START_BEAT_RING", { underlayType: "BEAT_REACTIVE_FLOOR_RING" }),
          context,
        );
        // 2. Camera follow performer
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "TRACK_PERFORMER", {
            targetAnchorId: "performer-primary",
            performerId: payload?.performerId,
          }),
          context,
        );
        break;
      }

      case "VotingOpened": {
        // 1. Scoreboard HUD overlay
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_SCOREBOARD_HUD", { overlayType: "SCOREBOARD_HUD" }),
          context,
        );
        // 2. Monitor layout for judges
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "judge-monitor", anchorId: "LEFT_PANEL", intent: "JUDGES", stackHint: "SECONDARY" },
            ],
          }),
          context,
        );
        break;
      }

      case "WinnerDeclared": {
        const winnerName = (payload?.winnerName as string) || "Champion";
        // 1. Winner flyin camera
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "WINNER_FLYIN", { targetAnchorId: "winner-focus-center", mode: "CINEMATIC_FLY_IN" }, "CRITICAL"),
          context,
        );
        // 2. Winner crown banner
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_WINNER_CROWN", { overlayType: "WINNER_CROWN_BANNER", winnerName }, "CRITICAL"),
          context,
        );
        // 3. Lighting gold celebration
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_GOLD_CELEBRATION", { preset: "GOLD_CELEBRATION" }, "CRITICAL"),
          context,
        );
        // 4. Gold Confetti FX
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_GOLD_CONFETTI", { fxType: "CONFETTI", palette: ["#FFD700", "#00FFFF"] }),
          context,
        );
        // 5. Victory sound stinger
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_VICTORY_FANFARE", { cueType: "VICTORY_STINGER" }),
          context,
        );
        // 6. Crowd standing ovation
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "STANDING_OVATION", { behavior: "STAND", durationMs: 8000 }),
          context,
        );
        break;
      }

      case "BattleCooldown": {
        // Reset all directors for this battle runtime
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
      commandId: `cmd-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

export default BattlePresentationAdapter;

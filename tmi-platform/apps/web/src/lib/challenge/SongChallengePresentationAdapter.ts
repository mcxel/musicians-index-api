/**
 * SongChallengePresentationAdapter.ts — Phase 5.2 Song Challenge Presentation Adapter.
 * Connects SongChallengeMatchEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Delegates 100% of presentation, crowd-head migration, flame FX, lighting, and monitor layout to presentation directors.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";
import { setHumanRankPoints } from "@/lib/rankings/UniversalRankingSnapshot";
import type { MediaLockerSong } from "@/lib/medialocker/MediaLockerChallengeAdapter";

export class SongChallengePresentationAdapter {
  private active: boolean = false;
  private runtimeId: string;
  private venueId: string;

  constructor(runtimeId: string, venueId: string = "challenge-arena-main") {
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
      if (payload?.matchId === this.runtimeId || !payload?.matchId) {
        void this.handleChallengeLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleChallengeLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["challenger-a-anchor", "challenger-b-anchor", "center-stage-anchor", "crowd-migration-floor", "winner-focus-anchor"],
      registeredMonitorSurfaces: ["main-stage-screen", "loadout-rail-monitor", "side-rail-chat", "bottom-dock-status"],
    };

    switch (eventName) {
      case "LoadoutLocked": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_CHALLENGE_PRESET", { preset: "ARENA" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "loadout-rail-monitor", anchorId: "RIGHT_PANEL", intent: "LOADOUT_RAIL", stackHint: "SECONDARY" },
              { surfaceId: "side-rail-chat", anchorId: "SIDE_RAIL", intent: "CHAT_SPONSORS", stackHint: "HUD" },
              { surfaceId: "bottom-dock-status", anchorId: "BOTTOM_DOCK", intent: "TIMERS_STATUS", stackHint: "HUD" },
            ],
          }),
          context,
        );
        break;
      }

      case "SongStarted": {
        const song = payload?.song as MediaLockerSong | undefined;
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_SONG_ATTRIBUTION_CARD", {
            title: song?.title ?? "Challenge Track",
            album: song?.album,
            genre: song?.genre,
            durationSeconds: song?.durationSeconds,
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "FRAME_PERFORMER_CHALLENGE", {
            targetAnchorId: payload?.side === "A" ? "challenger-a-anchor" : "challenger-b-anchor",
            mode: "FOCUS",
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "START_GENRE_FLOOR_RING", { underlayType: "BEAT_REACTIVE_FLOOR_RING" }),
          context,
        );
        break;
      }

      case "VoteMomentumChanged": {
        const split = (payload?.crowdSupportSplit as number) ?? 0.5;
        // CrowdDirector updates avatar migration support percentage
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "UPDATE_MIGRATION_SPLIT", { supportSplit: split }),
          context,
        );
        // UnderlayDirector shifts momentum color gradient
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "UPDATE_MOMENTUM_PULSE", { supportSplit: split }),
          context,
        );
        break;
      }

      case "PerformerOnFire": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "FLAME_HEAT_PULSE", { preset: "BEAT_DROP_FLASH" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "TRIGGER_FLAME_FLOOR_RING", { underlayType: "FLAME_HEAT_RING" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_FIRE_PARTICLES", { fxType: "FIRE" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "HYPER_CHEER_LOOP", { behavior: "CHEER_HYPER", intensity: 0.95 }),
          context,
        );
        break;
      }

      case "RoundWon": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_ROUND_WIN_BANNER", {
            roundNumber: payload?.roundNumber,
            winnerSide: payload?.winnerSide,
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_ROUND_WIN_STINGER", { cueType: "ROUND_START" }),
          context,
        );
        break;
      }

      case "WinnerDeclared": {
        const winnerId = (payload?.winnerId as string) || "winner-1";
        const winnerName = (payload?.winnerName as string) || "Challenge Winner";

        // Award canonical XP to winner profile
        setHumanRankPoints(winnerId, 2000, Date.now());

        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "WINNER_FLYIN", { targetAnchorId: "winner-focus-anchor", mode: "CINEMATIC_FLY_IN" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_WINNER_BANNER", { overlayType: "WINNER_CROWN_BANNER", winnerName }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_GOLD_CELEBRATION", { preset: "GOLD_CELEBRATION" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_GOLD_CONFETTI", { fxType: "CONFETTI", palette: ["#FFD700", "#00FFFF"] }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_VICTORY_ANTHEM", { cueType: "VICTORY_STINGER" }),
          context,
        );
        break;
      }

      case "ChallengeCooldown": {
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
      commandId: `cmd-challenge-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

export default SongChallengePresentationAdapter;

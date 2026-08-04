/**
 * CypherPresentationAdapter.ts — Phase 5.2 Cypher Presentation Adapter.
 * Connects CypherRuntimeEngine lifecycle events directly to DirectorRegistry command dispatches.
 * Delegates 100% of presentation, camera framing, lighting, beat loading, and monitor layout to presentation directors.
 */

import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { PresentationCommand, PresentationContext } from "@/lib/presentation/directors/types";
import { setHumanRankPoints } from "@/lib/rankings/UniversalRankingSnapshot";
import type { CypherBeatInfo } from "./CypherRuntimeEngine";

export class CypherPresentationAdapter {
  private active: boolean = false;
  private runtimeId: string;
  private venueId: string;

  constructor(runtimeId: string, venueId: string = "cypher-pit-arena") {
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
        void this.handleCypherLifecycleEvent(eventName, payload);
      }
    });
  }

  public async handleCypherLifecycleEvent(eventName: string, payload?: Record<string, unknown>): Promise<void> {
    const context: PresentationContext = {
      runtimeId: this.runtimeId,
      venueId: this.venueId,
      registeredAnchors: ["mic-stand-center", "performer-cypher-circle", "host-podium", "beat-producer-booth", "spotlight-winner-anchor"],
      registeredMonitorSurfaces: ["main-stage-screen", "queue-monitor", "side-rail-chat", "bottom-dock-status"],
    };

    switch (eventName) {
      case "InitializeCypher": {
        // 1. Lighting preset
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "APPLY_CYPHER_PRESET", { preset: "CYPHER_ARENA" }),
          context,
        );
        // 2. 4-Monitor layout allocation
        await DirectorRegistry.dispatch(
          this.buildCommand("MONITOR", "ALLOCATE_SURFACES", {
            allocations: [
              { surfaceId: "main-stage-screen", anchorId: "CENTER_STAGE", intent: "PROGRAM", stackHint: "PRIMARY" },
              { surfaceId: "queue-monitor", anchorId: "RIGHT_PANEL", intent: "QUEUE_BEAT_INFO", stackHint: "SECONDARY" },
              { surfaceId: "side-rail-chat", anchorId: "SIDE_RAIL", intent: "CHAT_SPONSORS", stackHint: "HUD" },
              { surfaceId: "bottom-dock-status", anchorId: "BOTTOM_DOCK", intent: "TIMERS_STATUS", stackHint: "HUD" },
            ],
          }),
          context,
        );
        break;
      }

      case "HostIntroduction": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "FRAME_HOST", { targetAnchorId: "host-podium", mode: "FOCUS" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_HOST_LOWER_THIRD", { hostName: payload?.hostName ?? "Big Ace" }),
          context,
        );
        break;
      }

      case "BeatSelection": {
        const beat = payload?.beat as CypherBeatInfo | undefined;
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "LOAD_BEAT_LOCKER_TRACK", {
            beatId: beat?.beatId ?? "beat-01",
            title: beat?.title ?? "Cypher Heat Vol 1",
            producer: beat?.producer ?? "Producer X",
            audioUrl: beat?.audioUrl,
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_BEAT_INFO_BANNER", {
            title: beat?.title,
            producer: beat?.producer,
            bpm: beat?.bpm,
          }),
          context,
        );
        break;
      }

      case "BeatCountdown": {
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_BEAT_COUNTDOWN", { cueType: "COUNTDOWN" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_COUNTDOWN_TIMER", { durationSeconds: payload?.durationSeconds ?? 5 }),
          context,
        );
        break;
      }

      case "CypherStart": {
        await DirectorRegistry.dispatch(
          this.buildCommand("UNDERLAY", "START_CYPHER_FLOOR_RING", { underlayType: "BEAT_REACTIVE_FLOOR_RING" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "ENTER_CYPHER_CIRCLE", { behavior: "CIRCLE_HYPER", intensity: 0.7 }),
          context,
        );
        break;
      }

      case "MicPass": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "MIC_HANDOFF_FOLLOW", {
            fromAnchorId: "performer-cypher-circle",
            toAnchorId: "mic-stand-center",
            toPerformerId: payload?.toPerformerId,
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_MIC_PASS_STINGER", { cueType: "MIC_PASS" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_MIC_OWNER_BADGE", { performerName: payload?.toPerformerName }),
          context,
        );
        break;
      }

      case "PerformerTurnStart": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "TRACK_CYPHER_PERFORMER", {
            targetAnchorId: "mic-stand-center",
            performerId: payload?.performerId,
          }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_PERFORMER_BADGE", {
            performerId: payload?.performerId,
            performerName: payload?.performerName,
          }),
          context,
        );
        break;
      }

      case "BeatDrop": {
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "STROBE_BEAT_DROP", { preset: "BEAT_DROP_FLASH" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_LASER_GRID", { fxType: "LASERS" }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "HANDS_UP_PHONE_LIGHTS", { behavior: "HANDS_UP", intensity: 0.95 }),
          context,
        );
        break;
      }

      case "CrowdReaction": {
        await DirectorRegistry.dispatch(
          this.buildCommand("CROWD", "HYPER_REACTION_LOOP", { behavior: "CHEER_HYPER", intensity: payload?.intensity ?? 0.8 }),
          context,
        );
        break;
      }

      case "VotingOpen": {
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_VOTE_STATUS_HUD", { overlayType: "VOTE_STATUS" }),
          context,
        );
        break;
      }

      case "WinnerDeclared": {
        const winnerId = payload?.winnerId as string | undefined;
        const winnerName = payload?.winnerName as string | undefined;
        // Rule 20 — never invent a winner identity.
        if (!winnerId || !winnerName) break;

        // Award canonical XP to winner profile
        setHumanRankPoints(winnerId, 1500, Date.now());

        await DirectorRegistry.dispatch(
          this.buildCommand("CAMERA", "SPOTLIGHT_REVEAL_FOCUS", { targetAnchorId: "spotlight-winner-anchor", mode: "FOCUS" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("OVERLAY", "MOUNT_WINNER_BANNER", { overlayType: "WINNER_CROWN_BANNER", winnerName }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("LIGHTING", "SPOTLIGHT_REVEAL", { preset: "SPOTLIGHT_REVEAL" }, "CRITICAL"),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("FX", "TRIGGER_CYPHER_CONFETTI", { fxType: "CONFETTI", palette: ["#00FFFF", "#AA2DFF"] }),
          context,
        );
        await DirectorRegistry.dispatch(
          this.buildCommand("SOUND", "PLAY_WINNER_STINGER", { cueType: "VICTORY_STINGER" }),
          context,
        );
        break;
      }

      case "CypherCooldown": {
        await DirectorRegistry.resetRuntime(this.runtimeId);
        break;
      }

      /**
       * CipherPresentationStateMachine → tmi:system:event bridge.
       * Maps presentation states onto existing director commands.
       * Do NOT invent Experience Timeline / Experience Director modules here.
       */
      case "CipherPresentationStateChanged": {
        const state = payload?.state as string | undefined;
        switch (state) {
          case "LOBBY_OPEN":
          case "PARTICIPANTS_READY":
            await this.handleCypherLifecycleEvent("InitializeCypher", payload);
            break;
          case "INTRO":
            await this.handleCypherLifecycleEvent("HostIntroduction", payload);
            break;
          case "PERFORMER_ENTRY":
          case "VERSE_ACTIVE":
          case "TIME_WARNING":
            await this.handleCypherLifecycleEvent("PerformerTurnStart", {
              ...payload,
              performerId: payload?.activePerformerId,
            });
            break;
          case "MIC_PASS":
          case "NEXT_PERFORMER":
            await this.handleCypherLifecycleEvent("MicPass", {
              ...payload,
              toPerformerId: payload?.activePerformerId,
            });
            break;
          case "VOTING_OPEN":
          case "VOTING_LOCKING":
            await this.handleCypherLifecycleEvent("VotingOpen", payload);
            break;
          case "WINNER_DECLARED":
          case "CEREMONY":
            if (payload?.winnerId) {
              await this.handleCypherLifecycleEvent("WinnerDeclared", payload);
            }
            break;
          case "EXIT":
            await this.handleCypherLifecycleEvent("CypherCooldown", payload);
            break;
          default:
            break;
        }
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
      commandId: `cmd-cypher-${director.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

export default CypherPresentationAdapter;

/**
 * RadioRuntimeEngine.ts — Phase 5.2 Priority 7 Stream & Win Radio Engine.
 * Manages 24/7 informational broadcast radio states: track attribution lower-thirds,
 * listener counts, live polls/trivia, sponsor rails, and instant radio prize drops.
 * Emits pure semantic events ONLY — zero presentation math inside the engine.
 */

import { BaseCompetitionRuntime } from "@/lib/competition/CompetitionRuntime";

export type RadioState =
  | "RADIO_BROADCAST_ON"
  | "NOW_PLAYING"
  | "LISTENER_COUNT_UPDATE"
  | "LIVE_POLL_ACTIVE"
  | "TRIVIA_ACTIVE"
  | "RADIO_PRIZE_DROP"
  | "SPONSOR_RAIL_ACTIVE"
  | "RADIO_OFF_AIR";

export interface RadioTrackInfo {
  trackId: string;
  title: string;
  artistName: string;
  stationName: string;
  audioUrl?: string;
  sponsorName?: string;
}

export class RadioRuntimeEngine extends BaseCompetitionRuntime {
  private radioState: RadioState = "RADIO_BROADCAST_ON";
  private currentTrack?: RadioTrackInfo;
  private activeListenersCount: number = 1420;

  constructor(radioId: string) {
    super(radioId, "RADIO");
  }

  public startBroadcast(stationName: string = "TMI Stream & Win FM") {
    this.radioState = "RADIO_BROADCAST_ON";
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("RadioBroadcastStarted", {
      radioId: this.competitionId,
      stationName,
    });
  }

  public playTrack(track: RadioTrackInfo) {
    this.currentTrack = track;
    this.radioState = "NOW_PLAYING";
    this.emitSemanticEvent("RadioTrackStarted", {
      radioId: this.competitionId,
      track,
    });
  }

  public updateListenerCount(count: number = 1850) {
    this.activeListenersCount = count;
    this.radioState = "LISTENER_COUNT_UPDATE";
    this.emitSemanticEvent("ListenerCountUpdated", {
      radioId: this.competitionId,
      activeListenersCount: count,
    });
  }

  public triggerLivePoll(question: string, options: string[]) {
    this.radioState = "LIVE_POLL_ACTIVE";
    this.emitSemanticEvent("LivePollTriggered", {
      radioId: this.competitionId,
      question,
      options,
    });
  }

  public triggerRadioPrizeDrop(winnerId: string, prizeTitle: string) {
    this.radioState = "RADIO_PRIZE_DROP";
    this.emitSemanticEvent("RadioPrizeDropped", {
      radioId: this.competitionId,
      winnerId,
      prizeTitle,
    });
  }

  public cooldown() {
    this.radioState = "RADIO_OFF_AIR";
    this.status = "IDLE";
    this.emitSemanticEvent("RadioCooldown", {
      radioId: this.competitionId,
    });
  }
}

export default RadioRuntimeEngine;

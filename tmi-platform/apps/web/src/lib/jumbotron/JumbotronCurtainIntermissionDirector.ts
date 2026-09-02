/**
 * JumbotronCurtainIntermissionDirector.ts — Curtain Intermission, Sponsor Race-Car Wrap & Audio Ducking
 *
 * Laws:
 * 1. Sequential lifecycle: Performer Break -> Curtain Close -> Audio Duck -> Intermission ->
 *    Sponsor Rotation -> Audience Giveaway -> Return Countdown -> Sponsor Wrap -> Performer Return -> Curtain Open -> Program.
 * 2. Sponsor vs Google AdSense separation.
 * 3. Never obstruct performers, controls, or critical safety info.
 */

import {
  applyVenueCurtainCue,
  resolveCommercialInventory,
  type VenueCurtainCueRequest,
  type CommercialInventoryResolution,
} from "../venue/VenueCurtainDirector";
import {
  type JumbotronEvent,
  JumbotronPriority,
} from "./JumbotronContracts";

export type CurtainIntermissionPhase =
  | "SHOW_ACTIVE"
  | "CURTAIN_CLOSING"
  | "INTERMISSION_ACTIVE"
  | "SPONSOR_ROTATION"
  | "AUDIENCE_GIVEAWAY"
  | "RETURN_COUNTDOWN"
  | "SPONSOR_RACE_CAR_WRAP"
  | "PERFORMER_RETURN_CUE"
  | "CURTAIN_OPENING";

export interface CurtainIntermissionState {
  phase: CurtainIntermissionPhase;
  sessionId: string;
  venueId: string;
  isAudioDucked: boolean;
  duckedVolumeMultiplier: number;
  activeSponsor?: CommercialInventoryResolution;
  countdownSecondsRemaining: number;
  performerReturnNotified: boolean;
}

export class JumbotronCurtainIntermissionDirector {
  private state: CurtainIntermissionState;

  constructor(public readonly sessionId: string, public readonly venueId: string) {
    this.state = {
      phase: "SHOW_ACTIVE",
      sessionId,
      venueId,
      isAudioDucked: false,
      duckedVolumeMultiplier: 1.0,
      countdownSecondsRemaining: 0,
      performerReturnNotified: false,
    };
  }

  public getState(): Readonly<CurtainIntermissionState> {
    return { ...this.state };
  }

  /**
   * Phase 1 & 2: Performer requests break -> Curtain Closes -> Program Audio Ducks.
   */
  public triggerPerformerBreak(performerId: string, breakDurationSeconds = 120): {
    curtainResult: boolean;
    audioDucked: boolean;
    events: JumbotronEvent[];
  } {
    // 1. Cue venue curtain
    const cue = applyVenueCurtainCue({
      venueId: this.venueId,
      sessionId: this.sessionId,
      performerId,
      action: "INTERMISSION",
      countdownSeconds: breakDurationSeconds,
    });

    this.state.phase = "INTERMISSION_ACTIVE";
    this.state.isAudioDucked = true;
    this.state.duckedVolumeMultiplier = 0.2; // 80% attenuation for program audio
    this.state.countdownSecondsRemaining = breakDurationSeconds;
    this.state.performerReturnNotified = false;

    // 2. Resolve Commercial Inventory (Direct Sponsor vs Google vs House)
    const inventory = resolveCommercialInventory("curtain-ad-rail");
    this.state.activeSponsor = inventory;

    // 3. Generate Jumbotron Intermission Program Event
    const intermissionEvent: JumbotronEvent = {
      id: `jumbo-intermission-${Date.now()}`,
      traceId: `tr-intermission-${this.sessionId}`,
      priority: JumbotronPriority.P4_CONTRACTED_DIRECT_SPONSOR,
      eventType: "CURTAIN_INTERMISSION_START",
      experienceType: "REGULAR_LIVE",
      targetClass: "JUMBOTRON",
      sourceEventId: `curtain-${this.sessionId}`,
      title: "INTERMISSION",
      headline: `SHOW WILL RESUME IN ${Math.ceil(breakDurationSeconds / 60)} MINUTES`,
      subline: inventory.advertiserName ? `Presented by ${inventory.advertiserName}` : undefined,
      sponsorCampaignId: inventory.campaignId,
      advertiserName: inventory.advertiserName,
      creativeUrl: inventory.creativeUrl,
      durationMs: breakDurationSeconds * 1000,
      createdAtMs: Date.now(),
      accentColor: "#FFD700",
    };

    const curtainRailEvent: JumbotronEvent = {
      id: `jumbo-curtain-rail-${Date.now()}`,
      traceId: `tr-curtain-rail-${this.sessionId}`,
      priority: JumbotronPriority.P4_CONTRACTED_DIRECT_SPONSOR,
      eventType: "CURTAIN_SPONSOR_WRAP",
      experienceType: "REGULAR_LIVE",
      targetClass: "CURTAIN_RAIL",
      sourceEventId: `curtain-rail-${this.sessionId}`,
      title: inventory.advertiserName || "TMI PLATFORM",
      durationMs: breakDurationSeconds * 1000,
      createdAtMs: Date.now(),
      accentColor: "#00FFFF",
    };

    return {
      curtainResult: cue.ok,
      audioDucked: true,
      events: [intermissionEvent, curtainRailEvent],
    };
  }

  /**
   * Phase 3: Return Countdown & Sponsor Race-Car Wrap (30 seconds before resumption).
   */
  public enterReturnCountdown(sponsorWrapName: string, remainingSeconds = 30): JumbotronEvent {
    this.state.phase = "RETURN_COUNTDOWN";
    this.state.countdownSecondsRemaining = remainingSeconds;

    return {
      id: `jumbo-countdown-${Date.now()}`,
      traceId: `tr-countdown-${this.sessionId}`,
      priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL, // Countdown preempts ads!
      eventType: "CURTAIN_COUNTDOWN_RETURN",
      experienceType: "REGULAR_LIVE",
      targetClass: "JUMBOTRON",
      sourceEventId: `countdown-${this.sessionId}`,
      title: "LIVE PROGRAM RESUMING",
      headline: `RETURNING IN ${remainingSeconds} SECONDS`,
      subline: `POWERED BY ${sponsorWrapName.toUpperCase()}`,
      roundTimerSeconds: remainingSeconds,
      durationMs: remainingSeconds * 1000,
      createdAtMs: Date.now(),
      accentColor: "#FF2DAA",
    };
  }

  /**
   * Phase 4: Performer Returns -> Curtain Opens -> Program Resumes -> Audio Un-ducks.
   */
  public resumeShow(performerId: string): {
    curtainResult: boolean;
    audioRestored: boolean;
    event: JumbotronEvent;
  } {
    const cue = applyVenueCurtainCue({
      venueId: this.venueId,
      sessionId: this.sessionId,
      performerId,
      action: "RESUME_SHOW",
    });

    this.state.phase = "SHOW_ACTIVE";
    this.state.isAudioDucked = false;
    this.state.duckedVolumeMultiplier = 1.0;
    this.state.countdownSecondsRemaining = 0;
    this.state.performerReturnNotified = true;

    const resumeEvent: JumbotronEvent = {
      id: `jumbo-resume-${Date.now()}`,
      traceId: `tr-resume-${this.sessionId}`,
      priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
      eventType: "CURTAIN_INTERMISSION_END",
      experienceType: "REGULAR_LIVE",
      targetClass: "JUMBOTRON",
      sourceEventId: `resume-${this.sessionId}`,
      title: "WE ARE LIVE",
      durationMs: 5000,
      createdAtMs: Date.now(),
      accentColor: "#00FFFF",
    };

    return {
      curtainResult: cue.ok,
      audioRestored: true,
      event: resumeEvent,
    };
  }
}

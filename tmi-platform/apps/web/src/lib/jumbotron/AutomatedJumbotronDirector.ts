/**
 * AutomatedJumbotronDirector.ts — The Canonical Automated Jumbotron Director System
 *
 * Laws:
 * 1. ONE AutomatedJumbotronDirector + ONE canonical event/priority pipeline.
 * 2. Strict Priority: P1 Safety > P2 Live Critical > P3 Gift/Reward > P4 Direct Sponsor > P5 Ads/House > P6 Ambient.
 * 3. Style may vary; TRUTH may never vary.
 * 4. Grounded in server-authoritative inputs: LiveSession, Experience state, Gifting, Rewards, Audience, Sponsors.
 * 5. Cypher Law: Strictly NO winner or elimination framing for normal Cyphers.
 * 6. World Dance Party Law: Dedicated procedural Disco Orb.
 * 7. Zero fake users, fake gifts, fake winners, fake seats, or fake audience excitement.
 */

import {
  JumbotronPriority,
  type JumbotronEvent,
  type JumbotronExperienceType,
  type DisplayTargetClass,
  type JumbotronPresentationPack,
  type ImmutableRewardTruth,
  type ImmutableGiftTruth,
  type AudienceSpotlightIdentity,
  type AwardVisualTreatment,
} from "./JumbotronContracts";
import { JumbotronPriorityScheduler } from "./JumbotronPriorityScheduler";
import { ExperiencePresentationPacks } from "./ExperiencePresentationPacks";
import { JumbotronVariationEngine } from "./JumbotronVariationEngine";
import { ProceduralVenueVariationEngine, type ProceduralDisplayTargetDescriptor } from "./ProceduralVenueVariationEngine";
import { JumbotronCurtainIntermissionDirector } from "./JumbotronCurtainIntermissionDirector";
import { JumbotronObservatory } from "./JumbotronObservatory";
import { DisplayTargetDirector } from "../monitors/DisplayTargetDirector";
import { VenueJumbotronPlacementResolver } from "./VenueJumbotronPlacementResolver";
import { JumbotronSightlineCertifier } from "./JumbotronSightlineCertifier";
import {
  type VenueSpatialDimensions,
  type PhysicalJumbotronDescriptor,
  type PhysicalSightlineAuditReport,
  type VenuePhysicalEnvironmentType,
} from "./JumbotronContracts";

export interface RoomDirectorState {
  roomId: string;
  sessionId: string;
  experienceType: JumbotronExperienceType;
  venueId: string;
  venueClass: string;
  venueSkin: string;
  isCurtainClosed: boolean;
  participantCount: number;
  crowdActivityScore: number; // 0.0 to 1.0 from real participant actions
  activePerformerId?: string;
  activeRoundTimerSeconds?: number;
  venueEnvironment?: VenuePhysicalEnvironmentType;
  spatialDimensions?: VenueSpatialDimensions;
}

export class AutomatedJumbotronDirector {
  private scheduler: JumbotronPriorityScheduler;
  private pack: JumbotronPresentationPack;
  private curtainDirector: JumbotronCurtainIntermissionDirector;
  private jumbotronDisplayDescriptor: ProceduralDisplayTargetDescriptor;
  private physicalDescriptor: PhysicalJumbotronDescriptor;
  private spatialDimensions: VenueSpatialDimensions;
  private activeEvent: JumbotronEvent | null = null;
  private isRunning24_7Loop = false;
  private loopIntervalTimer: NodeJS.Timeout | null = null;

  constructor(public readonly roomState: RoomDirectorState) {
    this.scheduler = new JumbotronPriorityScheduler(roomState.sessionId);
    this.curtainDirector = new JumbotronCurtainIntermissionDirector(
      roomState.sessionId,
      roomState.venueId
    );

    // Resolve presentation pack
    this.pack = ExperiencePresentationPacks.resolveExperiencePresentationPack({
      experienceType: roomState.experienceType,
      venueClass: roomState.venueClass,
      venueSkin: roomState.venueSkin,
    });

    // Resolve real world-space spatial dimensions
    const envType: VenuePhysicalEnvironmentType =
      roomState.venueEnvironment ??
      (roomState.experienceType === "BATTLE_ARENA"
        ? "INDOOR_ARENA"
        : roomState.experienceType === "WORLD_CONCERT"
        ? "OUTDOOR_STADIUM"
        : roomState.experienceType === "WORLD_DANCE_PARTY"
        ? "WORLD_DANCE_PARTY"
        : "INDOOR_ARENA");

    // Footprint defaults are venue-class profiles (not FOV hardcodes). FOV resolves from runtime config.
    const footprint =
      envType === "OUTDOOR_STADIUM"
        ? { widthFeet: 250, depthFeet: 350, heightFeet: 120 }
        : envType === "WORLD_DANCE_PARTY"
          ? { widthFeet: 120, depthFeet: 120, heightFeet: 55 }
          : envType === "CLUB_SMALL_ROOM" || envType === "PROSCENIUM_THEATER"
            ? { widthFeet: 80, depthFeet: 100, heightFeet: 40 }
            : { widthFeet: 185, depthFeet: 220, heightFeet: 90 };

    this.spatialDimensions =
      roomState.spatialDimensions ??
      VenueJumbotronPlacementResolver.createVenueDimensions({
        venueId: roomState.venueId,
        venueEnvironment: envType,
        widthFeet: footprint.widthFeet,
        depthFeet: footprint.depthFeet,
        heightFeet: footprint.heightFeet,
        // FOV omitted → VenueJumbotronPlacementResolver.resolveVenueCameraSphereFovDegrees()
      });

    // Resolve physical world-space Jumbotron placement
    this.physicalDescriptor = VenueJumbotronPlacementResolver.resolvePlacement(
      this.spatialDimensions
    );

    // Legacy procedural descriptor fallback
    if (roomState.experienceType === "WORLD_DANCE_PARTY") {
      this.jumbotronDisplayDescriptor = ProceduralVenueVariationEngine.generateDiscoOrbTarget(
        roomState.venueId
      );
    } else {
      this.jumbotronDisplayDescriptor = ProceduralVenueVariationEngine.resolveOrGenerateJumbotronTarget(
        roomState.venueId,
        roomState.venueClass
      );
    }
  }

  public getSpatialDimensions(): Readonly<VenueSpatialDimensions> {
    return this.spatialDimensions;
  }

  public getPhysicalJumbotronDescriptor(): Readonly<PhysicalJumbotronDescriptor> {
    return this.physicalDescriptor;
  }

  public certifySightlines(): PhysicalSightlineAuditReport {
    const tiers = VenueJumbotronPlacementResolver.resolveSeatingTiers(this.spatialDimensions);
    return JumbotronSightlineCertifier.certifyVenueSightlines(
      this.spatialDimensions,
      this.physicalDescriptor,
      tiers
    );
  }

  public getBestVisibleFace(userPosition: [number, number, number]) {
    return JumbotronSightlineCertifier.findBestVisibleFace(
      userPosition,
      this.physicalDescriptor,
      this.spatialDimensions.ceilingElevationMeters
    );
  }

  /**
   * Jumbotron Source Mirroring Law:
   * Exposes the rendered Jumbotron output as a canonical visual source (JUMBOTRON_FEED)
   * that can be consumed by any of the 16 Universal Media Player slots without recursion.
   */
  public createJumbotronFeedSource() {
    return {
      sourceId: `source-jumbotron-feed-${this.roomState.sessionId}`,
      sessionId: this.roomState.sessionId,
      sourceType: "JUMBOTRON_FEED" as const,
      title: "Arena Jumbotron Feed",
      decoderInstanceId: `dec-jumbo-${this.roomState.sessionId}`,
      audioAuthority: "MUTED" as const, // Main program carries audio; jumbotron mirrors visual
      is3DRendered: true,
    };
  }

  public getActiveEvent(): JumbotronEvent | null {
    return this.activeEvent;
  }

  public getPresentationPack(): Readonly<JumbotronPresentationPack> {
    return this.pack;
  }

  public getDisplayDescriptor(): Readonly<ProceduralDisplayTargetDescriptor> {
    return this.jumbotronDisplayDescriptor;
  }

  public getCurtainDirector(): JumbotronCurtainIntermissionDirector {
    return this.curtainDirector;
  }

  public getScheduler(): JumbotronPriorityScheduler {
    return this.scheduler;
  }

  /**
   * P1 — Safety & Emergency Broadcast: Overrides all active programming immediately.
   */
  public triggerSafetyAlert(headline: string, subline: string): JumbotronEvent {
    const event: JumbotronEvent = {
      id: `jumbo-safety-${Date.now()}`,
      traceId: `tr-safety-${this.roomState.sessionId}`,
      priority: JumbotronPriority.P1_SAFETY_MODERATION_EMERGENCY,
      eventType: "SAFETY_ALERT",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: `safety-${Date.now()}`,
      title: "SAFETY ALERT",
      headline,
      subline,
      durationMs: 15000,
      createdAtMs: Date.now(),
      accentColor: "#FF0055",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P2 — Live Experience Critical: Round timers, battle scores, winner flashes.
   */
  public postRoundTimerUpdate(secondsRemaining: number, isCritical = false): JumbotronEvent {
    const priority = isCritical
      ? JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL
      : JumbotronPriority.P6_AMBIENT;

    const event: JumbotronEvent = {
      id: `jumbo-timer-${Date.now()}`,
      traceId: `tr-timer-${this.roomState.sessionId}`,
      priority,
      eventType: isCritical ? "ROUND_TIMER_CRITICAL" : "ROUND_TIMER_TICK",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: `timer-${secondsRemaining}`,
      title: isCritical ? "FINAL SECONDS" : "ROUND CLOCK",
      headline: `${secondsRemaining}s`,
      roundTimerSeconds: secondsRemaining,
      durationMs: isCritical ? 5000 : 1000,
      createdAtMs: Date.now(),
      accentColor: isCritical ? "#FF2DAA" : "#00FFFF",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P2 — Battle Scoreboard Update.
   */
  public postBattleScoreboard(scores: {
    participantA: string;
    scoreA: number;
    participantB: string;
    scoreB: number;
  }): JumbotronEvent {
    const event: JumbotronEvent = {
      id: `jumbo-scoreboard-${Date.now()}`,
      traceId: `tr-scoreboard-${this.roomState.sessionId}`,
      priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
      eventType: "BATTLE_SCOREBOARD_UPDATE",
      experienceType: "BATTLE_ARENA",
      targetClass: "JUMBOTRON",
      sourceEventId: `battle-${scores.participantA}-vs-${scores.participantB}`,
      title: "BATTLE SCOREBOARD",
      headline: `${scores.participantA} [${scores.scoreA}] vs [${scores.scoreB}] ${scores.participantB}`,
      battleScores: scores,
      durationMs: 8000,
      createdAtMs: Date.now(),
      accentColor: "#FFD700",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P2 — Winner Announcement.
   * STRICT LAW: Throws an error or rejects if invoked in Cyphers, where winning is forbidden.
   */
  public postWinnerAnnouncement(winnerName: string, pointsAwarded: number): JumbotronEvent {
    if (!this.pack.proceduralFeatures.allowWinnerPresentation) {
      throw new Error(
        `[AutomatedJumbotronDirector] STRICT CYPHER LAW VIOLATION: Winner presentation attempted in ${this.pack.experienceType}`
      );
    }

    const event: JumbotronEvent = {
      id: `jumbo-winner-${Date.now()}`,
      traceId: `tr-winner-${this.roomState.sessionId}`,
      priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
      eventType: "ROUND_WINNER",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: `winner-${winnerName}`,
      title: "WINNER",
      headline: `${winnerName.toUpperCase()} TAKES THE ROUND!`,
      subline: `+${pointsAwarded} XP AWARDED`,
      durationMs: 10000,
      createdAtMs: Date.now(),
      accentColor: "#FFD700",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P2 — Cypher Collaborative Rotation (NO WINNER UI).
   */
  public postCypherNextUp(currentArtist: string, nextArtist: string): JumbotronEvent {
    const event: JumbotronEvent = {
      id: `jumbo-cypher-${Date.now()}`,
      traceId: `tr-cypher-${this.roomState.sessionId}`,
      priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
      eventType: "CYPHER_ROTATION_NEXT",
      experienceType: "CYPHER",
      targetClass: "JUMBOTRON",
      sourceEventId: `cypher-${nextArtist}`,
      title: "CYPHER IN ROTATION",
      headline: `ON MIC: ${currentArtist.toUpperCase()}`,
      subline: `NEXT UP: ${nextArtist.toUpperCase()}`,
      durationMs: 8000,
      createdAtMs: Date.now(),
      accentColor: "#AA2DFF",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P3 — Verified Gifting Event: Server-authoritative settlement check before queuing.
   */
  public postSettledGift(giftTruth: ImmutableGiftTruth): JumbotronEvent | null {
    if (!giftTruth.settledTransactionId || giftTruth.amountCents <= 0) {
      JumbotronObservatory.recordPresentation({
        traceId: `tr-gift-rejected-${Date.now()}`,
        sessionId: this.roomState.sessionId,
        experienceType: this.roomState.experienceType,
        target: "JUMBOTRON",
        priority: JumbotronPriority.P3_TRANSACTION_REWARD_GIFT,
        eventType: "GIFT_ALERT",
        sourceEventId: "unsettled-gift",
        templateId: "rejected",
        startedAtMs: Date.now(),
        endedAtMs: Date.now(),
        result: "SETTLEMENT_REJECTED",
        latencyMs: 0,
      });
      return null;
    }

    const treatment: AwardVisualTreatment = JumbotronVariationEngine.selectAwardTreatment(
      giftTruth.settledTransactionId
    );

    const event: JumbotronEvent = {
      id: `jumbo-gift-${giftTruth.settledTransactionId}`,
      traceId: `tr-gift-${giftTruth.settledTransactionId}`,
      priority: JumbotronPriority.P3_TRANSACTION_REWARD_GIFT,
      eventType: "GIFT_ALERT",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: giftTruth.settledTransactionId,
      title: "GIFT CELEBRATION",
      headline: `${giftTruth.senderDisplayName} sent ${giftTruth.giftItemName}!`,
      subline: `To ${giftTruth.recipientDisplayName} ($${(giftTruth.amountCents / 100).toFixed(2)})`,
      durationMs: 6000,
      createdAtMs: Date.now(),
      giftTruth,
      templateId: treatment,
      accentColor: "#FF2DAA",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P3 — Authorized Reward Award: Verified user and ledger references before queuing.
   */
  public postAuthorizedReward(rewardTruth: ImmutableRewardTruth): JumbotronEvent | null {
    if (!rewardTruth.sourceTransactionId || !rewardTruth.rewardLedgerReference) {
      return null;
    }

    const treatment: AwardVisualTreatment = JumbotronVariationEngine.selectAwardTreatment(
      rewardTruth.sourceTransactionId
    );

    const event: JumbotronEvent = {
      id: `jumbo-reward-${rewardTruth.sourceTransactionId}`,
      traceId: `tr-reward-${rewardTruth.sourceTransactionId}`,
      priority: JumbotronPriority.P3_TRANSACTION_REWARD_GIFT,
      eventType: "REWARD_AWARDED",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: rewardTruth.sourceTransactionId,
      title: "AUDIENCE REWARD",
      headline: `+${rewardTruth.amountPoints} PTS TO ${rewardTruth.recipientDisplayName.toUpperCase()}!`,
      subline: rewardTruth.eventName,
      durationMs: 6000,
      createdAtMs: Date.now(),
      rewardTruth,
      templateId: treatment,
      accentColor: "#FFD700",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P3 — Audience Spotlight with strict safety & consent checks.
   */
  public postAudienceSpotlight(identity: AudienceSpotlightIdentity): JumbotronEvent | null {
    if (!identity.isAgeVerifiedSafe || !identity.publicProfilePermitted) {
      return null;
    }

    const event: JumbotronEvent = {
      id: `jumbo-spotlight-${identity.userId}`,
      traceId: `tr-spotlight-${identity.userId}`,
      priority: JumbotronPriority.P3_TRANSACTION_REWARD_GIFT,
      eventType: "SEAT_SPOTLIGHT",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: `seat-${identity.seatId ?? identity.userId}`,
      title: "FAN OF THE MOMENT",
      headline: identity.displayName,
      subline: identity.seatId ? `Seat: ${identity.seatId}` : "Front Row Audience",
      durationMs: 7000,
      createdAtMs: Date.now(),
      spotlightIdentity: identity,
      accentColor: "#00FFFF",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P4 — Direct TMI Sponsor Campaign.
   */
  public postDirectSponsor(campaign: {
    campaignId: string;
    advertiserName: string;
    tagline: string;
    accentColor?: string;
  }): JumbotronEvent {
    const event: JumbotronEvent = {
      id: `jumbo-sponsor-${campaign.campaignId}-${Date.now()}`,
      traceId: `tr-sponsor-${campaign.campaignId}`,
      priority: JumbotronPriority.P4_CONTRACTED_DIRECT_SPONSOR,
      eventType: "DIRECT_SPONSOR_CAMPAIGN",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: campaign.campaignId,
      title: "PRESENTED BY",
      headline: campaign.advertiserName,
      subline: campaign.tagline,
      sponsorCampaignId: campaign.campaignId,
      advertiserName: campaign.advertiserName,
      durationMs: 12000,
      createdAtMs: Date.now(),
      accentColor: campaign.accentColor ?? "#FFD700",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * P5 — House Promos & Certified Ads.
   */
  public postHousePromotion(promo: {
    headline: string;
    subline: string;
    accentColor?: string;
  }): JumbotronEvent {
    const event: JumbotronEvent = {
      id: `jumbo-house-${Date.now()}`,
      traceId: `tr-house-${Date.now()}`,
      priority: JumbotronPriority.P5_ADS_HOUSE_PROMOS,
      eventType: "HOUSE_PROMOTION",
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: `house-${Date.now()}`,
      title: "FEATURED",
      headline: promo.headline,
      subline: promo.subline,
      durationMs: 10000,
      createdAtMs: Date.now(),
      accentColor: promo.accentColor ?? "#00FFFF",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return event;
  }

  /**
   * CAST to Jumbotron Integration:
   * Translates incoming cast actions into authorized Jumbotron presentations.
   */
  public routeCastToJumbotron(
    contentType: "SPONSOR" | "PLAYLIST" | "MEMORY" | "YOPHO",
    payload: { title: string; headline: string; subline?: string; accentColor?: string }
  ): { ok: boolean; event?: JumbotronEvent; reason: string } {
    const active = this.scheduler.getActivePresentation();
    const isSafety = active?.event.priority === JumbotronPriority.P1_SAFETY_MODERATION_EMERGENCY;
    const isTimer = active?.event.priority === JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL;
    const isReward = active?.event.priority === JumbotronPriority.P3_TRANSACTION_REWARD_GIFT;
    const isContractedSponsor = active?.event.priority === JumbotronPriority.P4_CONTRACTED_DIRECT_SPONSOR;

    const check = DisplayTargetDirector.resolveCastToJumbotron(contentType, {
      isSafetyEmergency: isSafety,
      isActiveRoundTimer: isTimer,
      isRewardOrWinnerMoment: isReward,
      isContractualSponsorActive: isContractedSponsor,
    });

    if (!check.canTakeJumbotron) {
      return { ok: false, reason: check.reason };
    }

    let eventType: any = "CAST_PLAYLIST_ARTWORK";
    if (contentType === "MEMORY") eventType = "CAST_MEMORY_MOMENT";
    if (contentType === "YOPHO") eventType = "CAST_YOPHO_CARD";
    if (contentType === "SPONSOR") eventType = "DIRECT_SPONSOR_CAMPAIGN";

    const event: JumbotronEvent = {
      id: `jumbo-cast-${Date.now()}`,
      traceId: `tr-cast-${Date.now()}`,
      priority: JumbotronPriority.P4_CONTRACTED_DIRECT_SPONSOR,
      eventType,
      experienceType: this.roomState.experienceType,
      targetClass: "JUMBOTRON",
      sourceEventId: `cast-${contentType}`,
      title: payload.title,
      headline: payload.headline,
      subline: payload.subline,
      durationMs: 15000,
      createdAtMs: Date.now(),
      accentColor: payload.accentColor ?? "#00FFFF",
    };

    this.scheduler.enqueue(event);
    this.evaluateNextToAir();
    return { ok: true, event, reason: "Cast assigned to Jumbotron" };
  }

  /**
   * Evaluates the next event to air from the priority queue.
   */
  public evaluateNextToAir(nowMs = Date.now()): JumbotronEvent | null {
    const next = this.scheduler.takeNext(nowMs);
    if (next) {
      this.activeEvent = next;
    }
    return next;
  }

  /**
   * Releases the active event upon duration completion.
   */
  public releaseActiveEvent(nowMs = Date.now()): void {
    this.scheduler.releaseActive(nowMs);
    this.activeEvent = null;
    this.evaluateNextToAir(nowMs);
  }

  /**
   * Automated 24/7 Programming Loop:
   * READ ROOM STATE -> READ EXPERIENCE -> READ EVENT QUEUE -> READ SPONSORS ->
   * PRIORITIZE -> SELECT PACK -> SELECT TARGET -> SELECT TEMPLATE -> TAKE -> TELEMETRY.
   */
  public startAutomatedProgrammingLoop(tickIntervalMs = 5000): void {
    if (this.isRunning24_7Loop) return;
    this.isRunning24_7Loop = true;

    this.loopIntervalTimer = setInterval(() => {
      const now = Date.now();
      const active = this.scheduler.getActivePresentation();

      // If active presentation has reached its expiration, release it
      if (active && now >= active.expectedEndMs) {
        this.releaseActiveEvent(now);
      }

      // If nothing is currently airing, schedule appropriate filler
      if (!this.activeEvent) {
        if (this.roomState.isCurtainClosed) {
          // Intermission program
          this.postHousePromotion({
            headline: "INTERMISSION IN PROGRESS",
            subline: "GRAB MERCH • VIP LOUNGE OPEN",
            accentColor: "#FFD700",
          });
        } else if (this.roomState.participantCount < 5) {
          // Quiet room: more ambient upcoming & house promos
          this.postHousePromotion({
            headline: "JOIN THE NEXT CYPHER",
            subline: "SIGN UP IN LOBBY • CASH PRIZES",
            accentColor: "#AA2DFF",
          });
        } else {
          // Busy room: live crowd meter telemetry
          const crowdEvent: JumbotronEvent = {
            id: `jumbo-crowd-${now}`,
            traceId: `tr-crowd-${now}`,
            priority: JumbotronPriority.P6_AMBIENT,
            eventType: "AUDIENCE_CROWD_METER",
            experienceType: this.roomState.experienceType,
            targetClass: "JUMBOTRON",
            sourceEventId: `crowd-${now}`,
            title: "CROWD ENERGY",
            headline: `${Math.round(this.roomState.crowdActivityScore * 100)}% HYPE`,
            subline: `${this.roomState.participantCount} IN ATTENDANCE`,
            crowdActivityScore: this.roomState.crowdActivityScore,
            durationMs: 4000,
            createdAtMs: now,
            accentColor: "#FF2DAA",
          };
          this.scheduler.enqueue(crowdEvent);
          this.evaluateNextToAir(now);
        }
      }
    }, tickIntervalMs);
  }

  public stopAutomatedProgrammingLoop(): void {
    if (this.loopIntervalTimer) {
      clearInterval(this.loopIntervalTimer);
      this.loopIntervalTimer = null;
    }
    this.isRunning24_7Loop = false;
  }

  public teardown(): void {
    this.stopAutomatedProgrammingLoop();
    this.scheduler.clear();
    this.activeEvent = null;
  }
}

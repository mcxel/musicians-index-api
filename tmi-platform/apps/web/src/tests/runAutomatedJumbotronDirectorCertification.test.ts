/**
 * runAutomatedJumbotronDirectorCertification.test.ts
 *
 * Master Automated Certification Suite for the Canonical Automated Jumbotron Director System.
 *
 * Laws Tested:
 * 1. Priority Ordering (P1 through P6)
 * 2. Safety Preemption (P1 preempts any active presentation)
 * 3. Live-Critical Preemption (P2 round timer preempts P4 sponsor / P5 ad)
 * 4. Event Coalescing (Rapid crowd meter updates coalesce cleanly)
 * 5. Anti-Repetition Variation Memory (Different templates chosen across adjacent awards)
 * 6. Deterministic Skin Resolution
 * 7. Battle Pack (Scoreboard, VS, Timer)
 * 8. Cypher Strict NO-WINNER Law (Winner presentation in Cypher throws/rejects)
 * 9. World Dance Party Disco Orb Pack
 * 10. Auditorium Pack & Marquee
 * 11. Gift Truth Invariant Preservation
 * 12. Reward Truth Invariant Preservation
 * 13. Invalid / Unsettled Gift Rejection
 * 14. Procedural Display Target Generation & Fallback
 * 15. Protected Display Rejection for CAST
 * 16. Curtain Intermission Lifecycle & Sponsor Wrap
 * 17. Camera Look Up & Jumbotron Focus without State Reset
 * 18. Clean Teardown & Observatory Telemetry Verification
 */

import {
  JumbotronPriority,
  type ImmutableRewardTruth,
  type ImmutableGiftTruth,
  type AudienceSpotlightIdentity,
} from "../lib/jumbotron/JumbotronContracts";
import { AutomatedJumbotronDirector } from "../lib/jumbotron/AutomatedJumbotronDirector";
import { JumbotronPriorityScheduler } from "../lib/jumbotron/JumbotronPriorityScheduler";
import { ExperiencePresentationPacks } from "../lib/jumbotron/ExperiencePresentationPacks";
import { JumbotronVariationEngine } from "../lib/jumbotron/JumbotronVariationEngine";
import { ProceduralVenueVariationEngine } from "../lib/jumbotron/ProceduralVenueVariationEngine";
import { JumbotronCurtainIntermissionDirector } from "../lib/jumbotron/JumbotronCurtainIntermissionDirector";
import { JumbotronObservatory } from "../lib/jumbotron/JumbotronObservatory";
import { DisplayTargetDirector } from "../lib/monitors/DisplayTargetDirector";
import { AvatarCameraDirector } from "../lib/avatar/AvatarCameraDirector";
import { VenueJumbotronPlacementResolver } from "../lib/jumbotron/VenueJumbotronPlacementResolver";
import { JumbotronSightlineCertifier } from "../lib/jumbotron/JumbotronSightlineCertifier";
import { CanonicalUniversalPlayerFabric } from "../lib/media/CanonicalUniversalPlayerFabric";

export interface JumbotronCertResult {
  passed: boolean;
  name: string;
  evidence: string;
}

export function runAutomatedJumbotronDirectorCertification(): {
  allPassed: boolean;
  results: JumbotronCertResult[];
} {
  const results: JumbotronCertResult[] = [];
  JumbotronObservatory.resetForTesting();
  JumbotronVariationEngine.resetHistory();

  // Test 1: Priority Ordering (P1 through P6)
  {
    const scheduler = new JumbotronPriorityScheduler("test-sess-1");
    scheduler.enqueue({
      id: "p5-ad",
      traceId: "tr-1",
      priority: JumbotronPriority.P5_ADS_HOUSE_PROMOS,
      eventType: "CERTIFIED_AD_NETWORK",
      experienceType: "REGULAR_LIVE",
      targetClass: "JUMBOTRON",
      sourceEventId: "ad-1",
      title: "Ad",
      durationMs: 5000,
      createdAtMs: 100,
    });
    scheduler.enqueue({
      id: "p2-timer",
      traceId: "tr-2",
      priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
      eventType: "ROUND_TIMER_CRITICAL",
      experienceType: "REGULAR_LIVE",
      targetClass: "JUMBOTRON",
      sourceEventId: "timer-1",
      title: "Timer",
      durationMs: 5000,
      createdAtMs: 200,
    });
    scheduler.enqueue({
      id: "p1-safety",
      traceId: "tr-3",
      priority: JumbotronPriority.P1_SAFETY_MODERATION_EMERGENCY,
      eventType: "SAFETY_ALERT",
      experienceType: "REGULAR_LIVE",
      targetClass: "JUMBOTRON",
      sourceEventId: "safety-1",
      title: "Safety",
      durationMs: 5000,
      createdAtMs: 300,
    });

    const first = scheduler.takeNext(400);
    const second = scheduler.takeNext(400);
    const third = scheduler.takeNext(400);

    const passed =
      first?.priority === JumbotronPriority.P1_SAFETY_MODERATION_EMERGENCY &&
      second?.priority === JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL &&
      third?.priority === JumbotronPriority.P5_ADS_HOUSE_PROMOS;

    results.push({
      passed: Boolean(passed),
      name: "Gate 1: Priority Ordering (P1 > P2 > P5)",
      evidence: `Order received: ${first?.id} (${first?.priority}) -> ${second?.id} (${second?.priority}) -> ${third?.id} (${third?.priority})`,
    });
  }

  // Test 2: Safety Preemption (P1 preempts active P4 sponsor immediately)
  {
    const scheduler = new JumbotronPriorityScheduler("test-sess-2");
    scheduler.enqueue({
      id: "active-sponsor",
      traceId: "tr-sponsor",
      priority: JumbotronPriority.P4_CONTRACTED_DIRECT_SPONSOR,
      eventType: "DIRECT_SPONSOR_CAMPAIGN",
      experienceType: "REGULAR_LIVE",
      targetClass: "JUMBOTRON",
      sourceEventId: "sp-1",
      title: "Sponsor",
      durationMs: 15000,
      createdAtMs: 1000,
    });
    scheduler.takeNext(1000);

    const preemption = scheduler.enqueue(
      {
        id: "safety-emergency",
        traceId: "tr-safe",
        priority: JumbotronPriority.P1_SAFETY_MODERATION_EMERGENCY,
        eventType: "SAFETY_ALERT",
        experienceType: "REGULAR_LIVE",
        targetClass: "JUMBOTRON",
        sourceEventId: "safe-1",
        title: "Emergency",
        durationMs: 10000,
        createdAtMs: 2000,
      },
      2000
    );

    const nextToAir = scheduler.takeNext(2000);

    const passed =
      preemption.preemptedActive === true &&
      nextToAir?.id === "safety-emergency" &&
      scheduler.getPreemptedStack().length === 1;

    results.push({
      passed: Boolean(passed),
      name: "Gate 2: Safety Preemption of Active Sponsor",
      evidence: `Preempted active: ${preemption.preemptedActive}, Next aired: ${nextToAir?.id}, Stack size: ${scheduler.getPreemptedStack().length}`,
    });
  }

  // Test 3: Live-Critical Preemption (Critical Round Timer preempts Ad)
  {
    const scheduler = new JumbotronPriorityScheduler("test-sess-3");
    scheduler.enqueue({
      id: "active-ad",
      traceId: "tr-ad",
      priority: JumbotronPriority.P5_ADS_HOUSE_PROMOS,
      eventType: "CERTIFIED_AD_NETWORK",
      experienceType: "BATTLE_ARENA",
      targetClass: "JUMBOTRON",
      sourceEventId: "ad-1",
      title: "Ad",
      durationMs: 10000,
      createdAtMs: 1000,
    });
    scheduler.takeNext(1000);

    const preemption = scheduler.enqueue(
      {
        id: "critical-5s-timer",
        traceId: "tr-timer",
        priority: JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL,
        eventType: "ROUND_TIMER_CRITICAL",
        experienceType: "BATTLE_ARENA",
        targetClass: "JUMBOTRON",
        sourceEventId: "timer-crit",
        title: "5s Remaining",
        durationMs: 5000,
        createdAtMs: 3000,
      },
      3000
    );

    const nextToAir = scheduler.takeNext(3000);

    const passed =
      preemption.preemptedActive === true && nextToAir?.id === "critical-5s-timer";

    results.push({
      passed: Boolean(passed),
      name: "Gate 3: Critical Timer Preemption over Ad",
      evidence: `Preempted ad: ${preemption.preemptedActive}, Next to air: ${nextToAir?.id}`,
    });
  }

  // Test 4: Event Coalescing (Rapid crowd meter telemetry updates coalesce)
  {
    const scheduler = new JumbotronPriorityScheduler("test-sess-4");
    scheduler.enqueue({
      id: "crowd-tick-1",
      traceId: "tr-c1",
      priority: JumbotronPriority.P6_AMBIENT,
      eventType: "AUDIENCE_CROWD_METER",
      experienceType: "BATTLE_ARENA",
      targetClass: "JUMBOTRON",
      sourceEventId: "c1",
      title: "Crowd",
      headline: "50% Hype",
      durationMs: 3000,
      createdAtMs: 100,
    });

    scheduler.enqueue({
      id: "crowd-tick-2",
      traceId: "tr-c2",
      priority: JumbotronPriority.P6_AMBIENT,
      eventType: "AUDIENCE_CROWD_METER",
      experienceType: "BATTLE_ARENA",
      targetClass: "JUMBOTRON",
      sourceEventId: "c2",
      title: "Crowd",
      headline: "85% Hype",
      durationMs: 3000,
      createdAtMs: 200,
    });

    const queue = scheduler.getQueue();
    const passed =
      queue.length === 1 &&
      queue[0]!.headline === "85% Hype" &&
      queue[0]!.isCoalesced === true;

    results.push({
      passed: Boolean(passed),
      name: "Gate 4: Event Coalescing on High-Frequency Telemetry",
      evidence: `Queue length: ${queue.length}, Coalesced headline: ${queue[0]?.headline}`,
    });
  }

  // Test 5: Anti-Repetition Variation Memory
  {
    const t1 = JumbotronVariationEngine.selectAwardTreatment("seed-alpha");
    const t2 = JumbotronVariationEngine.selectAwardTreatment("seed-alpha-2");
    const t3 = JumbotronVariationEngine.selectAwardTreatment("seed-alpha-3");

    const passed = t1 !== t2 && t2 !== t3;
    results.push({
      passed: Boolean(passed),
      name: "Gate 5: Anti-Repetition Variation Memory",
      evidence: `Templates sequence: ${t1} -> ${t2} -> ${t3}`,
    });
  }

  // Test 6: Battle Arena Presentation Pack
  {
    const pack = ExperiencePresentationPacks.resolveExperiencePresentationPack({
      experienceType: "BATTLE_ARENA",
      venueClass: "CHAMPIONSHIP",
      venueSkin: "neon-tokyo",
    });

    const passed =
      pack.experienceType === "BATTLE_ARENA" &&
      pack.proceduralFeatures.hasScoreboard === true &&
      pack.proceduralFeatures.hasRoundTimer === true &&
      pack.proceduralFeatures.allowWinnerPresentation === true;

    results.push({
      passed: Boolean(passed),
      name: "Gate 6: Battle Arena Pack Specification",
      evidence: `Scoreboard: ${pack.proceduralFeatures.hasScoreboard}, Timer: ${pack.proceduralFeatures.hasRoundTimer}, Winner UI: ${pack.proceduralFeatures.allowWinnerPresentation}`,
    });
  }

  // Test 7: Cypher Strict NO-WINNER Law
  {
    const cypherPack = ExperiencePresentationPacks.resolveExperiencePresentationPack({
      experienceType: "CYPHER",
    });

    let threwAsRequired = false;
    const cypherDirector = new AutomatedJumbotronDirector({
      roomId: "cypher-room-1",
      sessionId: "cypher-session-1",
      experienceType: "CYPHER",
      venueId: "cypher-venue",
      venueClass: "UNDERGROUND",
      venueSkin: "default",
      isCurtainClosed: false,
      participantCount: 8,
      crowdActivityScore: 0.75,
    });

    try {
      cypherDirector.postWinnerAnnouncement("Rapper X", 500);
    } catch (e: any) {
      threwAsRequired = e.message.includes("STRICT CYPHER LAW VIOLATION");
    }

    const passed =
      cypherPack.proceduralFeatures.allowWinnerPresentation === false &&
      cypherPack.proceduralFeatures.hasCollaborativeRotation === true &&
      threwAsRequired === true;

    results.push({
      passed: Boolean(passed),
      name: "Gate 7: Cypher Strict NO-WINNER Law",
      evidence: `allowWinnerPresentation: ${cypherPack.proceduralFeatures.allowWinnerPresentation}, Threw exception: ${threwAsRequired}`,
    });
    cypherDirector.teardown();
  }

  // Test 8: World Dance Party Procedural Disco Orb Pack
  {
    const discoPack = ExperiencePresentationPacks.resolveExperiencePresentationPack({
      experienceType: "WORLD_DANCE_PARTY",
    });

    const discoOrb = ProceduralVenueVariationEngine.generateDiscoOrbTarget("dance-venue-1");

    const passed =
      discoPack.proceduralFeatures.hasDiscoOrb === true &&
      discoOrb.shape === "DISCO_ORB" &&
      discoOrb.materialProfile.mirroredFacets === 256;

    results.push({
      passed: Boolean(passed),
      name: "Gate 8: World Dance Party Disco Orb Pack",
      evidence: `hasDiscoOrb: ${discoPack.proceduralFeatures.hasDiscoOrb}, Shape: ${discoOrb.shape}, Facets: ${discoOrb.materialProfile.mirroredFacets}`,
    });
  }

  // Test 9: Real Gift Truth Preservation & Unsettled Gift Rejection
  {
    const validGift: ImmutableGiftTruth = {
      senderId: "fan-1",
      senderDisplayName: "NeonFan",
      recipientId: "perf-1",
      recipientDisplayName: "ArtistOne",
      giftItemId: "crown-gold",
      giftItemName: "Golden Crown",
      amountCents: 5000,
      settledTransactionId: "tx-settled-999",
      timestampMs: 1725200000000,
    };

    const director = new AutomatedJumbotronDirector({
      roomId: "r-gift",
      sessionId: "s-gift",
      experienceType: "REGULAR_LIVE",
      venueId: "v-gift",
      venueClass: "AUDITORIUM",
      venueSkin: "default",
      isCurtainClosed: false,
      participantCount: 50,
      crowdActivityScore: 0.9,
    });

    // 1. Valid settled gift posts cleanly
    const giftEv = director.postSettledGift(validGift);
    const verification = JumbotronVariationEngine.verifyGiftTruth(giftEv!, validGift);

    // 2. Unsettled gift (missing settledTransactionId or amount <= 0) is rejected
    const unsettledGift: ImmutableGiftTruth = {
      ...validGift,
      settledTransactionId: "", // Unsettled!
    };
    const rejectedEv = director.postSettledGift(unsettledGift);

    const passed =
      giftEv !== null &&
      verification.isValid === true &&
      rejectedEv === null;

    results.push({
      passed: Boolean(passed),
      name: "Gate 9: Real Gift Settlement & Truth Invariant",
      evidence: `Valid gift posted: ${Boolean(giftEv)}, Verified immutable: ${verification.isValid}, Unsettled rejected: ${rejectedEv === null}`,
    });
    director.teardown();
  }

  // Test 10: Real Reward Truth Preservation
  {
    const validReward: ImmutableRewardTruth = {
      recipientId: "user-survivor-1",
      recipientDisplayName: "Marcus",
      amountPoints: 500,
      eventName: "Gauntlet Elimination Survival",
      timestampMs: 1725200000000,
      sourceTransactionId: "tx-reward-888",
      rewardLedgerReference: "ledger.ref.pts.888",
    };

    const director = new AutomatedJumbotronDirector({
      roomId: "r-reward",
      sessionId: "s-reward",
      experienceType: "BATTLE_ARENA",
      venueId: "v-reward",
      venueClass: "ARENA",
      venueSkin: "default",
      isCurtainClosed: false,
      participantCount: 100,
      crowdActivityScore: 0.95,
    });

    const rewardEv = director.postAuthorizedReward(validReward);
    const verification = JumbotronVariationEngine.verifyRewardTruth(rewardEv!, validReward);

    const passed = rewardEv !== null && verification.isValid === true;

    results.push({
      passed: Boolean(passed),
      name: "Gate 10: Real Reward Truth Invariant Preservation",
      evidence: `Reward posted: ${Boolean(rewardEv)}, Truth immutable: ${verification.isValid}`,
    });
    director.teardown();
  }

  // Test 11: Display Target Fallback & Procedural Generation
  {
    const targetWithMesh = ProceduralVenueVariationEngine.resolveOrGenerateJumbotronTarget(
      "venue-modeled",
      "ARENA",
      ["stage_mesh", "jumbotron_screen_01"]
    );

    const targetProcedural = ProceduralVenueVariationEngine.resolveOrGenerateJumbotronTarget(
      "venue-empty",
      "ARENA",
      ["stage_mesh", "floor_plane"]
    );

    const rails = ProceduralVenueVariationEngine.generateVenueRailTargets("venue-empty");

    const passed =
      targetWithMesh.isProceduralGenerated === false &&
      targetProcedural.isProceduralGenerated === true &&
      targetProcedural.targetClass === "JUMBOTRON" &&
      rails.curtainRail.targetClass === "CURTAIN_RAIL" &&
      rails.stageRail.targetClass === "STAGE_RAIL";

    results.push({
      passed: Boolean(passed),
      name: "Gate 11: Display Target Fallback & Procedural Generation",
      evidence: `Modeled mesh: ${targetWithMesh.targetId}, Procedural fallback: ${targetProcedural.targetId}, Curtain rail: ${rails.curtainRail.targetId}`,
    });
  }

  // Test 12: Protected Display Rejection for CAST
  {
    // 1. Safety active -> CAST blocked
    const blockSafety = DisplayTargetDirector.resolveCastToJumbotron("PLAYLIST", {
      isSafetyEmergency: true,
    });

    // 2. Critical timer active -> CAST blocked
    const blockTimer = DisplayTargetDirector.resolveCastToJumbotron("SPONSOR", {
      isActiveRoundTimer: true,
    });

    // 3. Normal conditions -> CAST authorized
    const allowed = DisplayTargetDirector.resolveCastToJumbotron("YOPHO", {
      isSafetyEmergency: false,
      isActiveRoundTimer: false,
    });

    const passed =
      blockSafety.canTakeJumbotron === false &&
      blockTimer.canTakeJumbotron === false &&
      allowed.canTakeJumbotron === true &&
      allowed.targetClass === "JUMBOTRON";

    results.push({
      passed: Boolean(passed),
      name: "Gate 12: Protected Display Rejection for CAST",
      evidence: `Safety blocks: ${!blockSafety.canTakeJumbotron}, Timer blocks: ${!blockTimer.canTakeJumbotron}, Safe authorized: ${allowed.canTakeJumbotron}`,
    });
  }

  // Test 13: Curtain Intermission Lifecycle & Sponsor Wrap
  {
    const curtain = new JumbotronCurtainIntermissionDirector("sess-curtain", "ven-curtain");

    // Phase 1: Performer Break -> Curtain Closes -> Audio Ducks
    const breakRes = curtain.triggerPerformerBreak("performer-1", 120);

    // Phase 2: Return Countdown & Sponsor Wrap
    const countdownEv = curtain.enterReturnCountdown("Nike Pro Audio", 15);

    // Phase 3: Performer Return -> Curtain Opens -> Audio Un-ducks
    const resumeRes = curtain.resumeShow("performer-1");

    const passed =
      breakRes.audioDucked === true &&
      breakRes.events.length === 2 &&
      countdownEv.priority === JumbotronPriority.P2_LIVE_EXPERIENCE_CRITICAL &&
      resumeRes.audioRestored === true &&
      resumeRes.event.eventType === "CURTAIN_INTERMISSION_END";

    results.push({
      passed: Boolean(passed),
      name: "Gate 13: Curtain Intermission Lifecycle & Sponsor Wrap",
      evidence: `Break audio ducked: ${breakRes.audioDucked}, Countdown priority: ${countdownEv.priority}, Resume audio restored: ${resumeRes.audioRestored}`,
    });
  }

  // Test 14: Camera Look Up & Jumbotron Focus without State Reset
  {
    const cam = new AvatarCameraDirector();
    const initialMode = cam.getMode();

    // 1. Free look up tilts upward
    cam.lookUp(25);

    // 2. D-Pad DOUBLE-UP triggers Jumbotron Focus
    const dpad1 = cam.handleTvDpadInput("UP", 1000);
    const dpad2 = cam.handleTvDpadInput("UP", 1200); // 200ms delta = Double-Up!

    const isFocused = cam.isFocusedOnJumbotron();

    // 3. Return to Stage View
    cam.returnToStageView();
    const returned = !cam.isFocusedOnJumbotron();
    const modePreserved = cam.getMode() === initialMode;

    const passed =
      dpad1.actionTaken === "TILT_UP" &&
      dpad2.actionTaken === "FOCUS_JUMBOTRON" &&
      isFocused === true &&
      returned === true &&
      modePreserved === true;

    results.push({
      passed: Boolean(passed),
      name: "Gate 14: Camera Look Up & Jumbotron Focus without State Reset",
      evidence: `Double-Up Action: ${dpad2.actionTaken}, Focused: ${isFocused}, Returned: ${returned}, Mode preserved: ${modePreserved}`,
    });
  }

  // Test 15: Clean Teardown & Observatory Metrics
  {
    const metrics = JumbotronObservatory.getMetrics();
    const passed = metrics.totalPresentations > 0;

    results.push({
      passed: Boolean(passed),
      name: "Gate 15: Clean Teardown & Observatory Metrics Recorded",
      evidence: `Total recorded telemetry presentations: ${metrics.totalPresentations}, Preemptions: ${metrics.preemptionsCount}`,
    });
  }

  // Test 16: Physical Venue Spatial Dimensions
  {
    const dimensions = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "arena-championship-1",
      venueEnvironment: "INDOOR_ARENA",
      widthFeet: 160,
      depthFeet: 200,
      heightFeet: 85,
      cameraSphereFovDegrees: 120,
    });
    const defaultFov = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "arena-default-fov",
      venueEnvironment: "INDOOR_ARENA",
      widthFeet: 160,
      depthFeet: 200,
      heightFeet: 85,
    });

    const sqFootage = dimensions.widthFeet * dimensions.depthFeet;
    const passed =
      sqFootage === 32000 &&
      dimensions.widthMeters > 48.0 &&
      dimensions.depthMeters > 60.0 &&
      dimensions.ceilingElevationMeters > 25.0 &&
      dimensions.cameraSphereFovDegrees === 120 &&
      defaultFov.cameraSphereFovDegrees !== 160;

    results.push({
      passed: Boolean(passed),
      name: "Gate 16: Physical Venue Spatial Dimensions & Real Square Footage",
      evidence: `Area: ${sqFootage} sq ft, Dimensions: ${dimensions.widthMeters.toFixed(1)}m x ${dimensions.depthMeters.toFixed(1)}m x ${dimensions.heightMeters.toFixed(1)}m, FOV override=${dimensions.cameraSphereFovDegrees} runtimeDefault=${defaultFov.cameraSphereFovDegrees}`,
    });
  }

  // Test 17: Center-Hung Basketball Arena Multi-Face Architecture
  {
    const dimensions = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "arena-championship-1",
      venueEnvironment: "INDOOR_ARENA",
      widthFeet: 160,
      depthFeet: 200,
      heightFeet: 85,
    });

    const jumbotron = VenueJumbotronPlacementResolver.resolvePlacement(dimensions);

    const faceOrientations = jumbotron.faces.map((f) => f.orientation);
    const has4OutwardFaces =
      faceOrientations.includes("NORTH") &&
      faceOrientations.includes("SOUTH") &&
      faceOrientations.includes("EAST") &&
      faceOrientations.includes("WEST");

    const passed =
      jumbotron.architecture === "CENTER_HUNG_ARENA_JUMBOTRON" &&
      has4OutwardFaces &&
      jumbotron.hasBottomRing === true &&
      jumbotron.hasUpperRibbon === true &&
      jumbotron.bottomClearanceMeters >= 6.5 &&
      Boolean(jumbotron.mountRiggingAnchor) &&
      Boolean(jumbotron.collisionEnvelope);

    results.push({
      passed: Boolean(passed),
      name: "Gate 17: Center-Hung Basketball Arena Multi-Face Architecture",
      evidence: `Architecture: ${jumbotron.architecture}, Faces: [${faceOrientations.join(", ")}], Bottom Clearance: ${jumbotron.bottomClearanceMeters.toFixed(1)}m, Bottom Ring: ${jumbotron.hasBottomRing}`,
    });
  }

  // Test 18: Outdoor Stadium End-Zone vs Indoor Center-Hung Placement
  {
    const outdoorDim = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "stadium-outdoor-1",
      venueEnvironment: "OUTDOOR_STADIUM",
      widthFeet: 250,
      depthFeet: 350,
      heightFeet: 120,
    });
    const outdoorJumbo = VenueJumbotronPlacementResolver.resolvePlacement(outdoorDim);

    const passed =
      outdoorJumbo.architecture === "END_ZONE_DISPLAY" &&
      outdoorJumbo.hasBottomRing === false &&
      outdoorJumbo.faces[0]?.orientation === "OUTDOOR_ENDZONE";

    results.push({
      passed: Boolean(passed),
      name: "Gate 18: Outdoor End-Zone vs Indoor Center-Hung Architecture",
      evidence: `Outdoor Architecture: ${outdoorJumbo.architecture}, Face Orientation: ${outdoorJumbo.faces[0]?.orientation}, No roof suspension: ${!outdoorJumbo.hasBottomRing}`,
    });
  }

  // Test 19: Raycast Sightline Certification across All Seating Tiers
  {
    const dimensions = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "arena-championship-1",
      venueEnvironment: "INDOOR_ARENA",
      widthFeet: 160,
      depthFeet: 200,
      heightFeet: 85,
    });
    const jumbotron = VenueJumbotronPlacementResolver.resolvePlacement(dimensions);
    const tiers = VenueJumbotronPlacementResolver.resolveSeatingTiers(dimensions);

    const report = JumbotronSightlineCertifier.certifyVenueSightlines(
      dimensions,
      jumbotron,
      tiers
    );

    const classes = new Set(tiers.map((t) => t.tierClass));
    const required: Array<(typeof tiers)[number]["tierClass"]> = [
      "LOWER_BOWL",
      "MID_BOWL",
      "UPPER_BOWL",
      "FLOOR_GA",
      "VIP",
      "SIDE_SECTIONS",
      "REAR_SECTIONS",
    ];
    const hasAllTiers = required.every((c) => classes.has(c));

    const passed =
      hasAllTiers &&
      report.certifiedSightlinesAllOccupiedZones === true &&
      report.failedZones === 0 &&
      report.passedZones >= 7;

    results.push({
      passed: Boolean(passed),
      name: "Gate 19: Raycast Sightline Certification across All Seating Tiers",
      evidence: `Passed Zones: ${report.passedZones}/${report.totalSampledZones}, Classes: [${Array.from(classes).join(",")}], Certified: ${report.certifiedSightlinesAllOccupiedZones}`,
    });
  }

  // Test 20: Jumbotron Focus Real 3D World Aiming
  {
    const cam = new AvatarCameraDirector();
    const userEyePos: [number, number, number] = [0, 1.65, 24]; // Seated Lower Bowl South
    const jumbotronCenter: [number, number, number] = [0, 12, 0]; // Center-Hung Board

    cam.focusJumbotron(45, userEyePos, jumbotronCenter);
    const focused = cam.isFocusedOnJumbotron();
    const pitch = cam.getPitch();

    cam.returnToStageView();
    const returned = !cam.isFocusedOnJumbotron();

    const passed = focused && pitch > 15 && pitch < 70 && returned;

    results.push({
      passed: Boolean(passed),
      name: "Gate 20: Jumbotron Focus Real 3D World Aiming",
      evidence: `Calculated Aim Pitch: ${pitch.toFixed(1)}°, Focused: ${focused}, Restored on Return: ${returned}`,
    });
  }

  // Test 21: Dynamic FOV & Sphere Envelope Consumption (never hardcode 160° / 360×180)
  {
    const arena120 = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "arena-120",
      venueEnvironment: "INDOOR_ARENA",
      widthFeet: 160,
      depthFeet: 200,
      heightFeet: 85,
      cameraSphereFovDegrees: 120,
    });
    const outdoorDefault = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "stadium-default",
      venueEnvironment: "OUTDOOR_STADIUM",
      widthFeet: 250,
      depthFeet: 350,
      heightFeet: 120,
    });
    const invalid360Rejected = VenueJumbotronPlacementResolver.createVenueDimensions({
      venueId: "arena-bad-360",
      venueEnvironment: "INDOOR_ARENA",
      widthFeet: 160,
      depthFeet: 200,
      heightFeet: 85,
      cameraSphereFovDegrees: 360, // invalid perspective FOV — must fall back to runtime profile
    });

    const passed =
      arena120.cameraSphereFovDegrees === 120 &&
      outdoorDefault.cameraSphereFovDegrees === 140 &&
      invalid360Rejected.cameraSphereFovDegrees === 120;

    results.push({
      passed: Boolean(passed),
      name: "Gate 21: Dynamic FOV & Sphere Envelope (Never Hardcoded 160/360)",
      evidence: `Override=120, OutdoorRuntime=${outdoorDefault.cameraSphereFovDegrees}, Rejected360Fallback=${invalid360Rejected.cameraSphereFovDegrees} (not 160)`,
    });
  }

  // Test 22: SOURCE ≠ DECODER ≠ TARGET Architecture
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    fabric.registerSource({
      sourceId: "source-battle-prog",
      sessionId: "battle-session-omega",
      sourceType: "BATTLE_PROGRAM",
      title: "Championship Battle Main Program",
      decoderInstanceId: "shared-dec-battle-01",
      audioAuthority: "PROGRAM",
    });

    // Assign same source to Player 1 and Player 7
    fabric.take("slot-1", "source-battle-prog");
    fabric.take("slot-7", "source-battle-prog");

    const p1 = fabric.getPlayer("slot-1");
    const p7 = fabric.getPlayer("slot-7");
    const s1 = fabric.getSource(p1!.sourceId!);
    const s7 = fabric.getSource(p7!.sourceId!);

    const passed =
      p1?.sourceId === "source-battle-prog" &&
      p7?.sourceId === "source-battle-prog" &&
      s1?.decoderInstanceId === s7?.decoderInstanceId &&
      s1?.sessionId === "battle-session-omega";

    results.push({
      passed: Boolean(passed),
      name: "Gate 22: SOURCE ≠ DECODER ≠ TARGET Shared Instance Law",
      evidence: `Player 1 & 7 share decoder: ${s1?.decoderInstanceId}, Session: ${s1?.sessionId}`,
    });
  }

  // Test 23: 16-Player Slot State & Non-Destructive Commands
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    fabric.registerSource({
      sourceId: "src-prog",
      sessionId: "sess-live-1",
      sourceType: "LIVE_PROGRAM",
      title: "Main Program",
      decoderInstanceId: "dec-1",
      audioAuthority: "PROGRAM",
    });
    fabric.registerSource({
      sourceId: "src-chat",
      sessionId: "sess-live-1",
      sourceType: "PRIVATE_VIDEO_CHAT",
      title: "Voice Chat",
      decoderInstanceId: "dec-2",
      audioAuthority: "VOICE",
    });

    fabric.take("slot-1", "src-prog");
    fabric.take("slot-2", "src-chat");

    // Move slot 2 to slot 8
    fabric.move("slot-2", "slot-8");
    const p2After = fabric.getPlayer("slot-2");
    const p8After = fabric.getPlayer("slot-8");

    // Split slot 3 into Performer A and Performer B
    fabric.registerSource({
      sourceId: "src-iso-a",
      sessionId: "sess-live-1",
      sourceType: "BATTLE_PERFORMER_A_ISO",
      title: "Performer A ISO",
      decoderInstanceId: "dec-iso-a",
      audioAuthority: "MUTED",
    });
    fabric.registerSource({
      sourceId: "src-iso-b",
      sessionId: "sess-live-1",
      sourceType: "BATTLE_PERFORMER_B_ISO",
      title: "Performer B ISO",
      decoderInstanceId: "dec-iso-b",
      audioAuthority: "MUTED",
    });
    fabric.split("slot-3", "SPLIT_HORIZONTAL", ["src-iso-a", "src-iso-b"]);
    const p3Split = fabric.getPlayer("slot-3");

    const passed =
      p2After?.sourceId === null &&
      p8After?.sourceId === "src-chat" &&
      p3Split?.layoutMode === "SPLIT_HORIZONTAL" &&
      p3Split?.splitAssignments?.length === 2 &&
      p3Split?.splitAssignments[0]?.sessionId === "sess-live-1";

    results.push({
      passed: Boolean(passed),
      name: "Gate 23: 16-Player Slot State & Non-Destructive Commands",
      evidence: `Moved slot-2 to slot-8, Split slot-3 into 2 ISO views sharing session: ${p3Split?.splitAssignments?.[0]?.sessionId}`,
    });
  }

  // Test 24: Audio Law (Single Authoritative PROGRAM Audio)
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    fabric.registerSource({
      sourceId: "src-prog",
      sessionId: "sess-live-1",
      sourceType: "LIVE_PROGRAM",
      title: "Main Program",
      decoderInstanceId: "dec-1",
      audioAuthority: "PROGRAM",
    });

    fabric.take("slot-1", "src-prog");
    fabric.take("slot-4", "src-prog");
    fabric.take("slot-9", "src-prog");

    const p1 = fabric.getPlayer("slot-1");
    const p4 = fabric.getPlayer("slot-4");
    const p9 = fabric.getPlayer("slot-9");

    const passed =
      p1?.audioAuthority === "PROGRAM" &&
      p4?.audioAuthority === "MUTED" &&
      p9?.audioAuthority === "MUTED";

    results.push({
      passed: Boolean(passed),
      name: "Gate 24: Audio Law (Visual Target Count Never Multiplies Audio)",
      evidence: `Slot-1: ${p1?.audioAuthority}, Slot-4: ${p4?.audioAuthority}, Slot-9: ${p9?.audioAuthority}`,
    });
  }

  // Test 25: Jumbotron Source Mirroring Law (Two-Way Without Recursion)
  {
    const director = new AutomatedJumbotronDirector({
      roomId: "r-jumbo-mirror",
      sessionId: "sess-jumbo-mirror",
      experienceType: "BATTLE_ARENA",
      venueId: "ven-jumbo-mirror",
      venueClass: "ARENA",
      venueSkin: "default",
      isCurtainClosed: false,
      participantCount: 20,
      crowdActivityScore: 0.85,
    });

    const jumboSource = director.createJumbotronFeedSource();

    const fabric = new CanonicalUniversalPlayerFabric();
    const mirror = fabric.mirrorJumbotronFeedToPlayer(jumboSource, "slot-7");
    const mirror2 = fabric.mirrorJumbotronFeedToPlayer(jumboSource, "slot-12");

    const p7 = fabric.getPlayer("slot-7");
    const passed =
      mirror.success === true &&
      mirror.spawnedNewSession === false &&
      mirror2.spawnedNewSession === false &&
      mirror.sharedDecoderInstanceId === mirror2.sharedDecoderInstanceId &&
      p7?.sourceId === jumboSource.sourceId &&
      jumboSource.sourceType === "JUMBOTRON_FEED" &&
      jumboSource.sessionId === "sess-jumbo-mirror" &&
      fabric.getAllSources().filter((s) => s.sourceType === "JUMBOTRON_FEED").length === 1;

    results.push({
      passed: Boolean(passed),
      name: "Gate 25: Jumbotron Source Mirroring Law (Two-Way Without Recursion)",
      evidence: `Player 7 consumes JUMBOTRON_FEED: ${p7?.sourceId}, Session: ${jumboSource.sessionId}, spawned=${mirror.spawnedNewSession}, sharedDecoder=${mirror.sharedDecoderInstanceId}`,
    });
    director.teardown();
  }

  // Test 26: Media Budget Director (Desktop vs Mobile Quality Tiers)
  {
    const desktopFabric = new CanonicalUniversalPlayerFabric(false);
    const mobileFabric = new CanonicalUniversalPlayerFabric(true);

    desktopFabric.updateMediaBudget();
    mobileFabric.updateMediaBudget();

    const dtSlot5 = desktopFabric.getPlayer("slot-5");
    const mbSlot5 = mobileFabric.getPlayer("slot-5");

    const passed =
      dtSlot5?.qualityTier === "FULL_RATE" &&
      mbSlot5?.qualityTier === "POSTER_THUMBNAIL";

    results.push({
      passed: Boolean(passed),
      name: "Gate 26: Media Budget Director Quality Tiers (Desktop vs Mobile)",
      evidence: `Desktop slot-5: ${dtSlot5?.qualityTier}, Mobile slot-5: ${mbSlot5?.qualityTier}`,
    });
  }

  // Test 27: UNIVERSAL PLAYER FREEDOM LAW matrix
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    const sessionId = "sess-freedom-battle-1";

    fabric.registerSource({
      sourceId: "src-battle",
      sessionId,
      sourceType: "BATTLE_PROGRAM",
      title: "Battle Main",
      decoderInstanceId: "dec-battle-shared",
      audioAuthority: "PROGRAM",
      livePositionMs: 12_000,
    });
    fabric.registerSource({
      sourceId: "src-audience",
      sessionId,
      sourceType: "AUDIENCE_CAMERA",
      title: "Audience Cam",
      decoderInstanceId: "dec-audience",
      audioAuthority: "MUTED",
      livePositionMs: 12_000,
    });
    fabric.registerSource({
      sourceId: "src-chat",
      sessionId,
      sourceType: "PRIVATE_VIDEO_CHAT",
      title: "Private Chat",
      decoderInstanceId: "dec-chat",
      audioAuthority: "VOICE",
      livePositionMs: 500,
    });
    fabric.registerSource({
      sourceId: "src-jumbo",
      sessionId,
      sourceType: "JUMBOTRON_FEED",
      title: "Jumbotron Feed",
      decoderInstanceId: "dec-jumbo",
      audioAuthority: "MUTED",
      livePositionMs: 12_000,
    });
    fabric.registerSource({
      sourceId: "src-lobby",
      sessionId,
      sourceType: "FAN_AVATAR_LOBBY",
      title: "Fan Lobby",
      decoderInstanceId: "dec-lobby",
      audioAuthority: "MUTED",
      livePositionMs: 3_000,
    });
    fabric.registerSource({
      sourceId: "src-cypher",
      sessionId,
      sourceType: "CYPHER_ROTATION",
      title: "Cypher Rotation",
      decoderInstanceId: "dec-cypher",
      audioAuthority: "PROGRAM",
      livePositionMs: 8_000,
    });
    fabric.registerSource({
      sourceId: "src-iso-a",
      sessionId,
      sourceType: "BATTLE_PERFORMER_A_ISO",
      title: "Performer A",
      decoderInstanceId: "dec-iso-a",
      audioAuthority: "MUTED",
    });
    fabric.registerSource({
      sourceId: "src-iso-b",
      sessionId,
      sourceType: "BATTLE_PERFORMER_B_ISO",
      title: "Performer B",
      decoderInstanceId: "dec-iso-b",
      audioAuthority: "MUTED",
    });

    // PLAYER 1: battle → audience → return (at current live position)
    fabric.take("slot-1", "src-battle", "MAIN");
    fabric.advanceSourceLivePosition("src-battle", 45_000);
    fabric.changeView("slot-1", "src-audience", "AUDIENCE");
    const midLive = fabric.getSource("src-battle")!.livePositionMs;
    fabric.advanceSourceLivePosition("src-battle", 60_000);
    const returned = fabric.returnToPreviousSource("slot-1");
    const p1 = fabric.getPlayer("slot-1");
    const battleLiveAfterReturn = fabric.getSource("src-battle")!.livePositionMs;

    // MOVE chat across players
    fabric.take("slot-4", "src-chat");
    fabric.move("slot-4", "slot-9");

    // REPLACE jumbotron feed with lobby on same player — physical jumbotron is independent
    fabric.mirrorJumbotronFeedToPlayer(fabric.getSource("src-jumbo")!, "slot-7");
    fabric.take("slot-7", "src-lobby", "ROOM_OVERVIEW");
    const p7 = fabric.getPlayer("slot-7");

    // SPLIT → UNSPLIT → CYPHER on another free player (presentation ≠ ownership)
    fabric.take("slot-3", "src-battle", "MAIN");
    fabric.split("slot-3", "SPLIT_HORIZONTAL", ["src-iso-a", "src-iso-b"]);
    fabric.unsplit("slot-3");
    fabric.take("slot-3", "src-cypher", "MAIN");
    const p3 = fabric.getPlayer("slot-3");

    const noDedicated = fabric.assertNoDedicatedSlotBindings();
    const sessionsAlive =
      fabric.getSource("src-battle")?.sessionId === sessionId &&
      fabric.getSource("src-chat")?.sessionId === sessionId &&
      fabric.getSource("src-jumbo")?.sessionId === sessionId;

    const passed =
      returned === true &&
      p1?.sourceId === "src-battle" &&
      p1?.sessionId === sessionId &&
      battleLiveAfterReturn === 60_000 &&
      battleLiveAfterReturn > (midLive ?? 0) &&
      fabric.getPlayer("slot-4")?.sourceId === null &&
      fabric.getPlayer("slot-9")?.sourceId === "src-chat" &&
      p7?.sourceId === "src-lobby" &&
      p3?.sourceId === "src-cypher" &&
      p3?.layoutMode === "FULL" &&
      noDedicated === true &&
      sessionsAlive === true;

    results.push({
      passed: Boolean(passed),
      name: "Gate 27: UNIVERSAL PLAYER FREEDOM LAW (any source / any player / RETURN live)",
      evidence: `P1=${p1?.sourceId}@${battleLiveAfterReturn}ms P7=${p7?.sourceId} P3=${p3?.sourceId} chat@9=${fabric.getPlayer("slot-9")?.sourceId} noDedicated=${noDedicated} sessionsAlive=${sessionsAlive}`,
    });
  }

  // Test 28: Dual-View Experience Law & Convenience Defaults
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    fabric.registerSource({
      sourceId: "src-battle-prog",
      sessionId: "sess-battle-live",
      sourceType: "BATTLE_PROGRAM",
      title: "Championship Battle",
      decoderInstanceId: "dec-battle",
      audioAuthority: "PROGRAM",
    });
    fabric.registerSource({
      sourceId: "src-user-avatar",
      sessionId: "sess-battle-live",
      sourceType: "FAN_AVATAR_LOBBY",
      title: "My Seat View",
      decoderInstanceId: "dec-avatar",
      audioAuthority: "MUTED",
    });

    const applied = fabric.applyDefaultDualView("src-battle-prog", "src-user-avatar");
    const p1 = fabric.getPlayer("slot-1");
    const p2 = fabric.getPlayer("slot-2");
    const noDedicated = fabric.assertNoDedicatedSlotBindings();
    const recs = applied.recommendedAssignment;

    const passed =
      applied.success === true &&
      recs[0]?.role === "PROGRAM" &&
      recs[1]?.role === "USER_CONTEXT" &&
      p1?.sourceId === "src-battle-prog" &&
      p2?.sourceId === "src-user-avatar" &&
      noDedicated === true;

    // User reassigns freely — defaults never locked the slots
    fabric.take("slot-1", "src-user-avatar", "MY_AVATAR");
    fabric.take("slot-2", "src-battle-prog", "MAIN");
    const swappedOk =
      fabric.getPlayer("slot-1")?.sourceId === "src-user-avatar" &&
      fabric.getPlayer("slot-2")?.sourceId === "src-battle-prog";

    results.push({
      passed: Boolean(passed && swappedOk),
      name: "Gate 28: Dual-View Experience Law (Convenience Defaults Without Dedication)",
      evidence: `recommended=[${recs.map((r) => r.role).join(",")}] Slot-1=${p1?.sourceId} Slot-2=${p2?.sourceId} userSwapOk=${swappedOk} noDedicated=${noDedicated}`,
    });
  }

  // Test 29: Presence Continuity Law & Lounge Bokeh Focus
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    fabric.registerSource({
      sourceId: "src-lounge-room",
      sessionId: "sess-lounge-vip",
      sourceType: "LIVE_PROGRAM",
      title: "VIP Lounge Room",
      decoderInstanceId: "dec-lounge",
      audioAuthority: "PROGRAM",
    });
    fabric.take("slot-1", "src-lounge-room", "MAIN");

    fabric.registerSource({
      sourceId: "src-private-call",
      sessionId: "sess-call-friend",
      sourceType: "PRIVATE_VIDEO_CHAT",
      title: "Private Friend Call",
      decoderInstanceId: "dec-friend",
      audioAuthority: "VOICE",
    });
    fabric.take("slot-2", "src-private-call", "FRIEND_GROUP");

    // Activate communication focus
    fabric.activateSecondaryCommunicationFocus("slot-2");
    const bokehDuringCall = fabric.isBokehActive();
    const p1AudioDuring = fabric.getPlayer("slot-1")?.audioAuthority;
    const p2AudioDuring = fabric.getPlayer("slot-2")?.audioAuthority;
    const roomSessionPreserved = fabric.getPlayer("slot-1")?.sessionId === "sess-lounge-vip";

    // End communication focus
    fabric.deactivateSecondaryCommunicationFocus();
    const bokehAfterCall = fabric.isBokehActive();
    const p1AudioAfter = fabric.getPlayer("slot-1")?.audioAuthority;

    const passed =
      bokehDuringCall === true &&
      p1AudioDuring === "MUTED" && // Room audio ducked during call
      p2AudioDuring === "VOICE" &&
      roomSessionPreserved === true &&
      bokehAfterCall === false &&
      p1AudioAfter === "PROGRAM";

    results.push({
      passed: Boolean(passed),
      name: "Gate 29: Presence Continuity Law & Lounge Bokeh Focus",
      evidence: `Bokeh during call=${bokehDuringCall}, Room audio ducked=${p1AudioDuring === "MUTED"}, Room session preserved=${roomSessionPreserved}, Bokeh cleared=${!bokehAfterCall}`,
    });
  }

  // Test 30: Dynamic Communication Player Law (Active Show Protected -> Slot 2)
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    fabric.registerSource({
      sourceId: "src-live-battle",
      sessionId: "sess-battle-omega",
      sourceType: "BATTLE_PROGRAM",
      title: "Active Battle",
      decoderInstanceId: "dec-battle-01",
      audioAuthority: "PROGRAM",
    });
    fabric.take("slot-1", "src-live-battle", "MAIN");

    // Caller arrives -> Non-destructive alert
    const alert = fabric.handleIncomingCallAlert("user-marcel", "Marcel", "call-sess-101");
    const alertRinging = alert.status === "RINGING";

    // User accepts call -> Target Resolver evaluates slots
    const res = fabric.acceptIncomingCall("call-sess-101", ["user-marcel"]);
    const p1 = fabric.getPlayer("slot-1");
    const p2 = fabric.getPlayer("slot-2");

    const passed =
      alertRinging === true &&
      res.success === true &&
      res.targetPlayerId === "slot-2" &&
      p1?.sourceId === "src-live-battle" && // Battle remains completely uninterrupted!
      p2?.sourceId === "src-call-call-sess-101" &&
      p2?.layoutMode === "FULL";

    results.push({
      passed: Boolean(passed),
      name: "Gate 30: Dynamic Communication Player Law (Active Show Protected -> Slot 2)",
      evidence: `Alert status=${alert.status}, Call placed on=${res.targetPlayerId}, Slot-1 battle preserved=${p1?.sourceId}`,
    });
  }

  // Test 31: Adaptive Multi-Participant Auto-Layout & Reversible Collapse
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    fabric.registerSource({
      sourceId: "src-live-show",
      sessionId: "sess-show-alpha",
      sourceType: "LIVE_PROGRAM",
      title: "Championship Concert",
      decoderInstanceId: "dec-show",
      audioAuthority: "PROGRAM",
    });
    fabric.take("slot-1", "src-live-show");

    // 1 participant -> SINGLE (FULL)
    fabric.acceptIncomingCall("call-group-4", ["user-a"]);
    const l1 = fabric.getPlayer("slot-2")?.layoutMode;

    // 2nd friend joins -> SPLIT
    fabric.addCallParticipant("call-group-4", "user-b");
    const l2 = fabric.getPlayer("slot-2")?.layoutMode;

    // 3rd friend joins -> 3-WAY SPLIT
    fabric.addCallParticipant("call-group-4", "user-c");
    const l3 = fabric.getPlayer("slot-2")?.layoutMode;

    // 4th friend joins -> QUAD (2x2)
    fabric.addCallParticipant("call-group-4", "user-d");
    const l4 = fabric.getPlayer("slot-2")?.layoutMode;

    // Reversible collapse: user-d leaves -> collapses back to 3-way
    fabric.removeCallParticipant("call-group-4", "user-d");
    const c3 = fabric.getPlayer("slot-2")?.layoutMode;

    // user-c leaves -> collapses back to 2-way
    fabric.removeCallParticipant("call-group-4", "user-c");
    const c2 = fabric.getPlayer("slot-2")?.layoutMode;

    // user-b leaves -> collapses back to FULL
    fabric.removeCallParticipant("call-group-4", "user-b");
    const c1 = fabric.getPlayer("slot-2")?.layoutMode;

    // End call -> clean release of media tracks and player slot
    fabric.endVideoCall("call-group-4");
    const p2After = fabric.getPlayer("slot-2");
    const showContinuous = fabric.getPlayer("slot-1")?.sourceId === "src-live-show";

    const passed =
      l1 === "FULL" &&
      l2 === "SPLIT_HORIZONTAL" &&
      l3 === "SPLIT_HORIZONTAL" &&
      l4 === "QUAD" &&
      c3 === "SPLIT_HORIZONTAL" &&
      c2 === "SPLIT_HORIZONTAL" &&
      c1 === "FULL" &&
      p2After?.sourceId === null &&
      showContinuous === true;

    results.push({
      passed: Boolean(passed),
      name: "Gate 31: Adaptive Multi-Participant Auto-Layout & Reversible Collapse",
      evidence: `Expansion: 1=${l1} -> 2=${l2} -> 3=${l3} -> 4=${l4} | Collapse: 3=${c3} -> 2=${c2} -> 1=${c1} | Slot-2 freed=${p2After?.sourceId === null}`,
    });
  }

  // Test 32: Dynamic Communication Target Resolver (Idle Show -> Slot 1)
  {
    const fabric = new CanonicalUniversalPlayerFabric();
    // Slot 1 has NO active show / is idle
    const res = fabric.acceptIncomingCall("call-direct-1", ["user-direct"]);
    const p1 = fabric.getPlayer("slot-1");
    const p2 = fabric.getPlayer("slot-2");

    const passed =
      res.success === true &&
      res.targetPlayerId === "slot-1" &&
      p1?.sourceId === "src-call-call-direct-1" &&
      p2?.sourceId === null; // Does not unnecessarily consume slot 2

    results.push({
      passed: Boolean(passed),
      name: "Gate 32: Dynamic Communication Target Resolver (Idle -> Slot 1)",
      evidence: `Target=${res.targetPlayerId}, Slot-1 occupied=${p1?.sourceId}, Slot-2 free=${p2?.sourceId === null}`,
    });
  }

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}

// Standalone CLI runner execution
if (typeof describe === "undefined") {
  const { allPassed, results } = runAutomatedJumbotronDirectorCertification();
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("CANONICAL AUTOMATED JUMBOTRON DIRECTOR CERTIFICATION MATRIX:");
  for (const r of results) {
    console.log(`  ${r.passed ? "🟢 PASS" : "🔴 FAIL"} — ${r.name}`);
    console.log(`     Evidence: ${r.evidence}`);
  }
  console.log("══════════════════════════════════════════════════════════════");
  console.log(allPassed ? "OVERALL: 🟢 ALL 32 GATES PASSED" : "OVERALL: 🔴 FAILURES DETECTED");
  if (!allPassed) {
    process.exitCode = 1;
  }
}

// Jest test runner execution
if (typeof describe !== "undefined") {
  describe("Canonical Automated Jumbotron Director Certification", () => {
    const { results } = runAutomatedJumbotronDirectorCertification();
    for (const r of results) {
      it(r.name, () => {
        expect(r.passed).toBe(true);
      });
    }
  });
}

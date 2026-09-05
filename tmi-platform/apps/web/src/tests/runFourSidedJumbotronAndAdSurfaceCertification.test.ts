/**
 * runFourSidedJumbotronAndAdSurfaceCertification.test.ts
 *
 * Canonical Four-Sided Jumbotron, Independent Display Faces,
 * Venue Ad Surface Inventory, People Spotlight, & Show Director Certification
 */

import {
  JumbotronFaceTargetRegistry,
  CardinalFaceDirection,
} from '../lib/jumbotron/JumbotronFaceTargetRegistry';
import {
  VenueAdSurfaceRegistry,
  VenueContentPriority,
} from '../lib/ads/VenueAdSurfaceRegistry';
import {
  JumbotronSpotlightDirector,
  SpotlightCandidate,
} from '../lib/jumbotron/JumbotronSpotlightDirector';
import { JumbotronShowDirector } from '../lib/jumbotron/JumbotronShowDirector';

export function runFourSidedJumbotronAndAdSurfaceCertification(): {
  allPassed: boolean;
  totalGates: number;
  gates: Record<string, boolean>;
} {
  const gates: Record<string, boolean> = {};

  // --- GATE 1: Four Independently Addressable Faces ---
  const faceRegistry = new JumbotronFaceTargetRegistry('venue:thunder-dome:jumbotron');

  // Assign 4 simultaneous different campaigns
  faceRegistry.assignFaceContent('NORTH', 'src-merch-tour', 'camp-merch-01');
  faceRegistry.assignFaceContent('EAST', 'src-local-bistro', 'camp-bistro-02');
  faceRegistry.assignFaceContent('SOUTH', 'src-mic-sponsor', 'camp-gear-03');
  faceRegistry.assignFaceContent('WEST', 'src-tmi-promo', 'camp-tmi-04');

  const allFaces = faceRegistry.getAllFaces();
  const north = faceRegistry.getFace('NORTH');
  const east = faceRegistry.getFace('EAST');
  const south = faceRegistry.getFace('SOUTH');
  const west = faceRegistry.getFace('WEST');

  gates['Gate 1: Four Independently Addressable Faces (Simultaneous Campaigns)'] =
    allFaces.length === 4 &&
    north?.currentCampaign === 'camp-merch-01' &&
    east?.currentCampaign === 'camp-bistro-02' &&
    south?.currentCampaign === 'camp-gear-03' &&
    west?.currentCampaign === 'camp-tmi-04' &&
    south?.isStageFacing === true;

  // --- GATE 2: Performer Viewpoint & Stage-Facing Resolution ---
  // Performer standing on stage at [0, 1.5, -15], looking up toward jumbotron at [0, 8.5, 0]
  const performerPos: [number, number, number] = [0, 1.5, -15];
  const performerGaze: [number, number, number] = [0, 0.42, 0.9]; // looking up and toward +Z
  const performerVisible = faceRegistry.resolveVisibleFaces(performerPos, performerGaze);

  const southVisibleToPerformer = performerVisible.find((f) => f.direction === 'SOUTH')?.isVisible === true;
  const northHiddenFromPerformer = performerVisible.find((f) => f.direction === 'NORTH')?.isVisible === false;

  // Fan sitting in North upper bowl at [0, 12, 20], looking down/forward toward jumbotron at [0, 8.5, 0]
  const fanPos: [number, number, number] = [0, 12, 20];
  const fanGaze: [number, number, number] = [0, -0.2, -0.98]; // looking down and toward -Z
  const fanVisible = faceRegistry.resolveVisibleFaces(fanPos, fanGaze);

  const northVisibleToFan = fanVisible.find((f) => f.direction === 'NORTH')?.isVisible === true;
  const southHiddenFromFan = fanVisible.find((f) => f.direction === 'SOUTH')?.isVisible === false;

  gates['Gate 2: Real Viewpoint Determination (Performer sees South, Fan sees North)'] =
    southVisibleToPerformer &&
    northHiddenFromPerformer &&
    northVisibleToFan &&
    southHiddenFromFan;

  // --- GATE 3: GPU Frustum & Distance Culling ---
  const farViewerPos: [number, number, number] = [0, 0, 500]; // 500m away (beyond max distance)
  const farVisible = faceRegistry.resolveVisibleFaces(farViewerPos, [0, 0, -1]);
  gates['Gate 3: GPU Frustum & Distance Culling (Conservation of GPU)'] =
    farVisible.every((f) => f.shouldRenderGpu === false) &&
    performerVisible.find((f) => f.direction === 'SOUTH')?.shouldRenderGpu === true;

  // --- GATE 4: Canonical VenueAdSurfaceRegistry Inventory ---
  const adRegistry = new VenueAdSurfaceRegistry('thunder-dome');
  const jumbotronSurfaces = adRegistry.getSurfacesByCategory('JUMBOTRON');
  const stageSurfaces = adRegistry.getSurfacesByCategory('STAGE');
  const arenaSurfaces = adRegistry.getSurfacesByCategory('ARENA');
  const concourseSurfaces = adRegistry.getSurfacesByCategory('CONCOURSE');

  gates['Gate 4: Canonical VenueAdSurfaceRegistry Inventory IDs'] =
    jumbotronSurfaces.length === 4 &&
    stageSurfaces.length >= 1 &&
    arenaSurfaces.length >= 1 &&
    concourseSurfaces.length >= 1 &&
    jumbotronSurfaces[0].inventoryId.startsWith('venue:thunder-dome:jumbotron:');

  // --- GATE 5: Hard Priority Hierarchy (P0 to P6) ---
  // Attempt to override Stage Backdrop (P1) with a standard Ad (P4) -> must be rejected
  const overrideRejected = !adRegistry.requestSurfaceTakeover(
    'stage:backdrop',
    VenueContentPriority.P4_DIRECT_AD_CAMPAIGN,
    'camp-sneakers',
    'creat-sneakers'
  );
  // Preempt with P0 Emergency -> must succeed
  const emergencySuccess = adRegistry.preemptSurface(
    'jumbotron:north',
    VenueContentPriority.P0_EMERGENCY_SAFETY
  );
  const northStatus = adRegistry.getSurface('jumbotron:north')?.status;

  gates['Gate 5: Hard Priority Hierarchy & Ad Safety Law (Emergency > Show > Ads)'] =
    overrideRejected &&
    emergencySuccess &&
    northStatus === 'EMERGENCY_OVERRIDE';

  // --- GATE 6: People Spotlight Layer (3 Presence Modes & Consent Law) ---
  const spotlightDirector = new JumbotronSpotlightDirector();

  // Mode A: Fan Avatar
  const avatarFan: SpotlightCandidate = {
    participantId: 'fan-maya-01',
    displayName: 'MAYA',
    presenceType: 'FAN_AVATAR',
    groupId: 'squad-cyber-rebels',
    seatId: '14',
    sectionId: '112',
    worldPosition: [4, 5, 12],
    avatarMeshUrl: 'https://cdn.tmi.live/avatars/maya.glb',
    publicVideoFeed: false,
    jumbotronParticipationConsent: true,
    cameraActive: false,
    moderationEligible: true,
  };
  spotlightDirector.registerParticipant(avatarFan);

  const avatarFan2: SpotlightCandidate = {
    participantId: 'fan-leo-02',
    displayName: 'LEO',
    presenceType: 'FAN_AVATAR',
    groupId: 'squad-cyber-rebels',
    seatId: '15',
    sectionId: '112',
    worldPosition: [5, 5, 12],
    avatarMeshUrl: 'https://cdn.tmi.live/avatars/leo.glb',
    publicVideoFeed: false,
    jumbotronParticipationConsent: true,
    cameraActive: false,
    moderationEligible: true,
  };
  spotlightDirector.registerParticipant(avatarFan2);

  const groupSpotlight = spotlightDirector.triggerFriendGroupSpotlight('squad-cyber-rebels');

  // Mode B: Live Video with Consent
  const videoFan: SpotlightCandidate = {
    participantId: 'fan-dave-live',
    displayName: 'DAVE',
    presenceType: 'LIVE_VIDEO',
    worldPosition: [0, 2, 8],
    publicVideoFeed: true,
    jumbotronParticipationConsent: true,
    cameraActive: true,
    moderationEligible: true,
    liveVideoSourceId: 'src-webrtc-dave',
  };
  spotlightDirector.registerParticipant(videoFan);
  const liveVideoSpotlight = spotlightDirector.triggerLiveVideoSpotlight('fan-dave-live');

  // Mode B Fallback: Unconsented live video rejected from live face
  const unconsentedFan: SpotlightCandidate = {
    participantId: 'fan-shy-user',
    displayName: 'SHY',
    presenceType: 'LIVE_VIDEO',
    worldPosition: [0, 2, 8],
    publicVideoFeed: false, // NO public video consent!
    jumbotronParticipationConsent: false,
    cameraActive: true,
    moderationEligible: true,
  };
  spotlightDirector.registerParticipant(unconsentedFan);
  const unconsentedRejected = spotlightDirector.triggerLiveVideoSpotlight('fan-shy-user') === null;

  gates['Gate 6: People Spotlight Layer (Avatar, Squads, Live Video Consent)'] =
    groupSpotlight !== null &&
    groupSpotlight.participants.length === 2 &&
    liveVideoSpotlight !== null &&
    liveVideoSpotlight.presenceType === 'LIVE_VIDEO' &&
    unconsentedRejected;

  // --- GATE 7: 14 Vibrant Presentation Templates & "Look Up" HUD Dispatch ---
  const prizeSpotlight = spotlightDirector.triggerPrizeWinnerSpotlight({
    winnerId: 'fan-maya-01',
    winnerDisplayName: 'MAYA',
    prizeName: '2 VIP PASSES',
    sponsorName: 'SPONSOR X',
    seatId: 'SEC 112 · SEAT 14',
  });
  gates['Gate 7: Vibrant Presentation Templates & Look Up HUD Dispatch'] =
    prizeSpotlight?.template === 'CONFETTI' &&
    (prizeSpotlight?.lookUpNoticeText?.includes("BIG SCREEN") ?? false) &&
    (prizeSpotlight?.subline?.includes('MAYA WON 2 VIP PASSES') ?? false);

  // --- GATE 8: Jumbotron Show Director & PiP Dynamic Re-composition ---
  const showDirector = new JumbotronShowDirector('thunder-dome', 'sess-battle-01');
  // Trigger Prize Winner Event: West face re-composes to PiP with winner, while East keeps sponsor in background
  showDirector.handleLiveEvent('PRIZE_WINNER_CONFIRMED', {
    participantId: 'fan-maya-01',
    displayName: 'MAYA',
    prizeName: 'VIP PASS',
    sponsorName: 'SPONSOR X',
  });
  const westState = showDirector.getFaceState('WEST');
  const eastState = showDirector.getFaceState('EAST');

  gates['Gate 8: Jumbotron Show Director & Dynamic PiP Re-composition'] =
    westState?.currentComposition === 'PIP_TOP_RIGHT' &&
    westState?.overlayText?.includes('PRIZE WINNER: MAYA') === true &&
    eastState?.sponsorCampaignId === 'camp-local-restaurant-01';

  // --- GATE 9: Four-Face Synchronized Takeover & Continuity ---
  showDirector.triggerSynchronizedTakeover('camp-halftime-sponsor', 'MEGA BEATS', 15);
  const allTakeover = showDirector.getAllFaceStates().every(
    (s) => s.sponsorCampaignId === 'camp-halftime-sponsor' && s.overlayText?.includes('MEGA BEATS')
  );
  showDirector.releaseTakeoverToScheduled();
  const allReleased = showDirector.getFaceState('EAST')?.sponsorCampaignId === 'camp-local-restaurant-01';

  gates['Gate 9: Four-Face Synchronized Takeover & Resumption'] =
    allTakeover && allReleased;

  // --- GATE 10: Interactive Commerce Contract & Qualified Impressions ---
  const qualifiedImpression = adRegistry.recordQualifiedImpression({
    campaignId: 'camp-tour-merch-2026',
    creativeId: 'creat-merch-hoodie-01',
    inventoryId: 'venue:thunder-dome:jumbotron:north',
    surfaceId: 'jumbotron:north',
    sessionId: 'sess-live-01',
    viewerSessionId: 'viewer-fan-maya',
    impressionClass: 'AUDIENCE_IMPRESSION',
    visibleDurationSec: 4.5,
    viewabilityPercent: 65,
    deviceTier: 'DESKTOP',
  });

  const rejectedImpression = adRegistry.recordQualifiedImpression({
    campaignId: 'camp-tour-merch-2026',
    creativeId: 'creat-merch-hoodie-01',
    inventoryId: 'venue:thunder-dome:jumbotron:north',
    surfaceId: 'jumbotron:north',
    sessionId: 'sess-live-01',
    viewerSessionId: 'viewer-rapid-tab-switch',
    impressionClass: 'AUDIENCE_IMPRESSION',
    visibleDurationSec: 0.8, // under 3.0s threshold
    viewabilityPercent: 15, // under 30% viewability
    deviceTier: 'MOBILE',
  });

  const northSurface = adRegistry.getSurface('jumbotron:north');

  gates['Gate 10: Interactive Commerce Contract & Qualified Impression Ledger'] =
    northSurface?.commercePayload?.interactionType === 'ADD_TO_CART' &&
    northSurface?.commercePayload?.productId === 'prod-hoodie-tour-2026' &&
    qualifiedImpression?.billingStatus === 'QUALIFIED' &&
    rejectedImpression === null;

  const allPassed = Object.values(gates).every(Boolean);

  console.log('══════════════════════════════════════════════════════════════');
  console.log('FOUR-SIDED JUMBOTRON & VENUE AD SURFACE CERTIFICATION');
  console.log('══════════════════════════════════════════════════════════════');
  for (const [gateName, passed] of Object.entries(gates)) {
    console.log(`  ${passed ? '🟢 PASS' : '🔴 FAIL'}: ${gateName}`);
  }
  console.log('──────────────────────────────────────────────────────────────');
  console.log(`Total Gates Evaluated: ${Object.keys(gates).length}`);
  console.log(`Final Verdict: ${allPassed ? '🟢 ALL GATES PASSED' : '🔴 CERTIFICATION FAILED'}`);
  console.log('══════════════════════════════════════════════════════════════\n');

  return {
    allPassed,
    totalGates: Object.keys(gates).length,
    gates,
  };
}

if (process.argv[1]?.includes('runFourSidedJumbotronAndAdSurfaceCertification.test')) {
  const result = runFourSidedJumbotronAndAdSurfaceCertification();
  if (!result.allPassed) {
    process.exit(1);
  }
}

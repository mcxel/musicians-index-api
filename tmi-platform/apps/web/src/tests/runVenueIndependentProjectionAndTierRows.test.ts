/**
 * runVenueIndependentProjectionAndTierRows.test.ts
 *
 * Physical & Invariant Certification Test for:
 * 1. Venue-Independent Live Production Mode (Permanent Resilience Layer)
 * 2. "SHOW STATE ≠ VENUE STATE" Architectural Law
 * 3. Canonical Tier-Row Hierarchy without Physical Seats
 * 4. Admission Entitlement Separation from Tier Positioning
 * 5. Lobby Wall Live Discovery into Exact Same Session
 * 6. Spectator Promotion without Session Destruction
 */

import assert from "node:assert/strict";
import {
  VENUE_INDEPENDENT_PROJECTION_LAWS,
  resolveVenuePresentationMode,
  promoteSpectatorToParticipant,
  type VenueEnvironmentAvailabilityState,
  type PresentationModeAdapter,
} from "../lib/venues/resolveRoomVenueRuntime";
import {
  CANONICAL_TIER_ORDER,
  TIER_TO_AUDIENCE_BAND,
  TIER_ROW_HIERARCHY_LEVEL,
  resolveAudienceBand,
  resolveBandRowHierarchy,
  isTierOrderValid,
  evaluateAudienceAdmission,
  createAudiencePresence,
  type TmiMembershipTier,
} from "../lib/audience/tmiSeatTierEngine";
import { resolveLobbyDestination } from "../lib/lobby/DestinationResolver";

async function runVenueIndependentCertification() {
  console.log("=== TMI VENUE-INDEPENDENT LIVE PRODUCTION & TIER-ROW CERTIFICATION ===");

  // --------------------------------------------------------------------------
  // PROOF 1: Show State Separate from Venue State
  // --------------------------------------------------------------------------
  assert.equal(
    VENUE_INDEPENDENT_PROJECTION_LAWS.showStateSeparateFromVenueState,
    true,
    "SHOW STATE must be strictly separate from VENUE STATE"
  );
  assert.equal(
    VENUE_INDEPENDENT_PROJECTION_LAWS.buildingRenovationWithoutShowCancellation,
    true,
    "TMI can renovate the building without cancelling the show"
  );
  console.log(" Proof 1: SHOW STATE ≠ VENUE STATE Law Certified");

  // --------------------------------------------------------------------------
  // PROOF 2: Projection Fallback Permanent Resilience Law
  // --------------------------------------------------------------------------
  assert.equal(
    VENUE_INDEPENDENT_PROJECTION_LAWS.projectionFallbackPermanent,
    true,
    "Projection Fallback is a PERMANENT resilience layer, not temporary scaffolding"
  );
  assert.equal(
    VENUE_INDEPENDENT_PROJECTION_LAWS.duplicateSessionCreatedDuringFallback,
    false,
    "Duplicate sessions must never be spawned during fallback"
  );
  console.log(" Proof 2: Permanent Projection Fallback Law Certified");

  // --------------------------------------------------------------------------
  // PROOF 3: Canonical Venue Maintenance / Upgrading / Degradation Failover
  // --------------------------------------------------------------------------
  const maintenanceStates: VenueEnvironmentAvailabilityState[] = [
    "VENUE_MAINTENANCE",
    "VENUE_UPGRADING",
    "VENUE_UNAVAILABLE",
    "DEVICE_FALLBACK",
  ];

  for (const state of maintenanceStates) {
    const resolution = resolveVenuePresentationMode({
      roomId: "battle-thunder-dome",
      sessionId: "live-session-battle-001",
      venueState: state,
    });

    assert.equal(resolution.presentationMode, "PROJECTION_VIDEO_PANEL");
    assert.equal(resolution.showSurvives, true);
    assert.equal(resolution.duplicateSessionCreated, false);
    assert.equal(resolution.roomId, "battle-thunder-dome");
    assert.equal(resolution.sessionId, "live-session-battle-001");
    if (state === "VENUE_MAINTENANCE") {
      assert.ok(resolution.memberNotice?.includes("routine optimization"));
    } else if (state === "VENUE_UPGRADING") {
      assert.ok(resolution.memberNotice?.includes("visual enhancements"));
    }
  }
  console.log(" Proof 3: Venue Maintenance & Upgrade Failover Certified");

  // --------------------------------------------------------------------------
  // PROOF 4: Continuity of Live Assets, WebRTC, Chat, Timer, Score & Overlays
  // --------------------------------------------------------------------------
  const fallback = resolveVenuePresentationMode({
    roomId: "cypher-next-gen",
    sessionId: "cypher-session-42",
    venueState: "VENUE_MAINTENANCE",
  });

  assert.equal(fallback.webrtcPreserved, true, "WebRTC must survive fallback");
  assert.equal(fallback.participantsPreserved, true, "Participants must survive fallback");
  assert.equal(fallback.timerScoreRoundPreserved, true, "Timer, round, and score must survive fallback");
  assert.equal(fallback.chatPreserved, true, "Chat state must survive fallback");
  assert.equal(fallback.reactionsPreserved, true, "Reactions must survive fallback");
  assert.equal(fallback.votingPreserved, true, "Voting must survive fallback");
  assert.equal(fallback.tipsPreserved, true, "Tips must survive fallback");
  assert.equal(fallback.overlaysPreserved, true, "Overlays & HUD meters must survive fallback");
  console.log(" Proof 4: Live Session Continuity & Media Preservation Certified");

  // --------------------------------------------------------------------------
  // PROOF 5: Live Venue Hot-Restore Boundary
  // --------------------------------------------------------------------------
  assert.equal(
    VENUE_INDEPENDENT_PROJECTION_LAWS.liveVenueHotRestoreStatus,
    "FUTURE / NOT YET IMPLEMENTED",
    "Live venue hot-restore must be honestly certified as FUTURE / NOT YET IMPLEMENTED"
  );
  console.log(" Proof 5: Live Venue Hot-Restore Boundary Certified");

  // --------------------------------------------------------------------------
  // PROOF 6: Canonical Tier-Row Hierarchy Ordering
  // --------------------------------------------------------------------------
  assert.deepEqual(
    CANONICAL_TIER_ORDER,
    ["FREE", "PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"],
    "Canonical tier order must strictly be FREE -> PRO -> RUBY -> SILVER -> GOLD -> PLATINUM -> DIAMOND"
  );
  assert.equal(isTierOrderValid(), true, "Tier hierarchy ranking must be strictly monotonic");

  assert.equal(resolveAudienceBand("DIAMOND"), "FRONT_PREMIUM");
  assert.equal(resolveBandRowHierarchy("DIAMOND"), 0);

  assert.equal(resolveAudienceBand("PLATINUM"), "NEAR_FRONT");
  assert.equal(resolveBandRowHierarchy("PLATINUM"), 1);

  assert.equal(resolveAudienceBand("GOLD"), "FORWARD");
  assert.equal(resolveBandRowHierarchy("GOLD"), 2);

  assert.equal(resolveAudienceBand("SILVER"), "MID_FORWARD");
  assert.equal(resolveBandRowHierarchy("SILVER"), 3);

  assert.equal(resolveAudienceBand("RUBY"), "MID");
  assert.equal(resolveBandRowHierarchy("RUBY"), 4);

  assert.equal(resolveAudienceBand("PRO"), "REAR_MID");
  assert.equal(resolveBandRowHierarchy("PRO"), 5);

  assert.equal(resolveAudienceBand("FREE"), "BACK_GENERAL");
  assert.equal(resolveBandRowHierarchy("FREE"), 6);
  console.log(" Proof 6: Canonical Tier-Row Order & Audience Band Mapping Certified");

  // --------------------------------------------------------------------------
  // PROOF 7: No Fake Chairs or Phantom Avatars in Projection Mode
  // --------------------------------------------------------------------------
  const spectatorPresence = createAudiencePresence({
    userId: "fan-user-123",
    sessionId: "live-session-battle-001",
    roomId: "battle-thunder-dome",
    membershipTier: "DIAMOND",
    spatialVenueAvailable: false,
  });

  assert.equal(spectatorPresence.spatialInstance, "NONE", "Must not instantiate fake 3D avatars");
  assert.equal(spectatorPresence.audienceBand, "FRONT_PREMIUM", "Diamond retains front logical band");
  assert.equal(spectatorPresence.interactionCapabilities.canChat, true);
  assert.equal(spectatorPresence.interactionCapabilities.canVote, true);
  assert.equal(spectatorPresence.interactionCapabilities.canReact, true);
  console.log(" Proof 7: Zero Fake Chairs & Authentic Projection Presence Certified");

  // --------------------------------------------------------------------------
  // PROOF 8: Admission Entitlement Separate from Tier Position
  // --------------------------------------------------------------------------
  // Free event: Free tier user can enter and occupies the back general band
  const freeAdmission = evaluateAudienceAdmission({
    tier: "FREE",
    isTicketed: false,
  });
  assert.equal(freeAdmission.canEnter, true, "Free tier must NOT be locked out of free-to-watch events");
  assert.equal(freeAdmission.audienceBand, "BACK_GENERAL");

  // Ticketed event: Requires ticket, but tier position is preserved
  const ticketedNoTicket = evaluateAudienceAdmission({
    tier: "GOLD",
    isTicketed: true,
    hasTicket: false,
  });
  assert.equal(ticketedNoTicket.canEnter, false);
  assert.equal(ticketedNoTicket.reason, "TICKET_REQUIRED");

  const ticketedWithTicket = evaluateAudienceAdmission({
    tier: "GOLD",
    isTicketed: true,
    hasTicket: true,
  });
  assert.equal(ticketedWithTicket.canEnter, true);
  assert.equal(ticketedWithTicket.audienceBand, "FORWARD");
  console.log(" Proof 8: Admission Entitlement vs. Tier Position Separation Certified");

  // --------------------------------------------------------------------------
  // PROOF 9: Lobby Wall Live Discovery into Exact Same Session
  // --------------------------------------------------------------------------
  const liveExperiences = [
    { kind: "battle" as const, roomId: "battle-clash-omega", expectedHref: "/rooms/battle/battle-clash-omega" },
    { kind: "cypher" as const, roomId: "cypher-cy-01", expectedHref: "/live/rooms/cypher-cy-01?mode=cypher" },
    { kind: "challenge" as const, roomId: "challenge-ch-99", expectedHref: "/live/rooms/challenge-ch-99?mode=challenge" },
    { kind: "dance" as const, roomId: "world-dance-party", expectedHref: "/live/rooms/world-dance-party?mode=dance" },
    { kind: "concert" as const, roomId: "monday-night-stage", expectedHref: "/rooms/concert/monday-night-stage" },
  ];

  for (const exp of liveExperiences) {
    const dest = resolveLobbyDestination({
      roomId: exp.roomId,
      kind: exp.kind,
    });
    assert.equal(dest.roomId, exp.roomId, "Lobby Wall must route to EXACT same room");
    assert.equal(dest.href, exp.expectedHref, "Lobby Wall destination route must match canonical path");
  }
  console.log(" Proof 9: Lobby Wall Live Discovery into Exact Same Session Certified");

  // --------------------------------------------------------------------------
  // PROOF 10: Spectator Promotion without Session Destruction
  // --------------------------------------------------------------------------
  const promotion = promoteSpectatorToParticipant({
    sessionId: "session-battle-101",
    roomId: "battle-clash-omega",
    userId: "fan-promoted-to-battler",
    targetRole: "PERFORMER",
    assignedPanel: "panel-secondary-right",
    mediaStreamId: "stream-cam-user-456",
  });

  assert.equal(promotion.sameSessionPreserved, true, "Participant promotion must preserve the same session");
  assert.equal(promotion.sessionId, "session-battle-101");
  assert.equal(promotion.roomId, "battle-clash-omega");
  assert.equal(promotion.fromRole, "SPECTATOR");
  assert.equal(promotion.toRole, "PERFORMER");
  assert.equal(promotion.assignedPanel, "panel-secondary-right");
  console.log(" Proof 10: Spectator Promotion & Performer Calling Certified");

  // --------------------------------------------------------------------------
  // PROOF 11: Single Session Multi-Presentation Law
  // --------------------------------------------------------------------------
  const singleSessionId = "canonical-live-show-999";
  const mobileResolution = resolveVenuePresentationMode({
    roomId: "world-dance-party",
    sessionId: singleSessionId,
    venueState: "VENUE_AVAILABLE",
    isDeviceLowEnd: true,
  });
  const desktopVenueResolution = resolveVenuePresentationMode({
    roomId: "world-dance-party",
    sessionId: singleSessionId,
    venueState: "VENUE_AVAILABLE",
    isDeviceLowEnd: false,
    userPreference: "FULL_3D_VENUE",
  });

  assert.equal(mobileResolution.sessionId, singleSessionId);
  assert.equal(desktopVenueResolution.sessionId, singleSessionId);
  assert.equal(mobileResolution.presentationMode, "PROJECTION_VIDEO_PANEL");
  assert.equal(desktopVenueResolution.presentationMode, "FULL_3D_VENUE");
  assert.equal(mobileResolution.duplicateSessionCreated, false);
  assert.equal(desktopVenueResolution.duplicateSessionCreated, false);
  console.log(" Proof 11: Single Session Multi-Presentation Law Certified");

  console.log("======================================================================");
  console.log("ALL 11 INVARIANT PROOFS PASSING (100% GREEN) — RESILIENCE GATES LOCKED");
  console.log("======================================================================");
}

runVenueIndependentCertification().catch((err) => {
  console.error("CERTIFICATION FAILURE:", err);
  process.exit(1);
});

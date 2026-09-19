/**
 * RoomModerationCapabilityMap — UI/policy lookup for the TMI Room Moderation law.
 *
 * Session removal is served by RoomModerationAuthority + POST /api/rooms/[id]/moderation.
 * Client never authorizes kick alone — server re-checks capability.
 *
 * Existing related authorities (do not duplicate):
 * - REPORT → ModerationEngine.submitReport / POST /api/reports
 * - Chat mute/ban (chat only) → RoomChatEngine (not session kick)
 * - Platform suspend/ban → ModerationEngine.applyAdminAction (not room kick)
 */

export const ROOM_MODERATION_AUTHORITY_BLOCKER = "ROOM-MODERATION-AUTHORITY-01" as const;

export type RoomModerationRoomClass =
  | "AUTOMATED_PUBLIC"
  | "PERSONAL_OWNED"
  | "OFFICIAL_MODERATED";

export type RoomModerationControlAvailability =
  | "AVAILABLE"
  | "UNAUTHORIZED"
  | "AUTHORITY_MISSING";

export type RoomModerationControlSet = {
  kickNow: RoomModerationControlAvailability;
  voteToKick: RoomModerationControlAvailability;
  report: RoomModerationControlAvailability;
  /** Bound re-entry after kick — capability-gated; not auto platform ban. */
  roomLockout: RoomModerationControlAvailability;
  roomBan: RoomModerationControlAvailability;
  blockerId: typeof ROOM_MODERATION_AUTHORITY_BLOCKER | null;
};

/**
 * Resolve which participant-menu controls the UI may offer.
 * Hide UNAUTHORIZED actions rather than showing disabled KICK NOW for ordinary users.
 * AUTHORITY_MISSING retained only for surfaces not yet wired to the API.
 */
export function resolveRoomModerationControls(input: {
  roomClass: RoomModerationRoomClass;
  /** Server-derived host/owner for this room — never trust a client-only claim. */
  isAuthorizedHost: boolean;
  /** Server-derived TMI moderator / official event authority. */
  isOfficialModerator: boolean;
}): RoomModerationControlSet {
  const { roomClass, isAuthorizedHost, isOfficialModerator } = input;

  const report: RoomModerationControlAvailability = "AVAILABLE";

  if (roomClass === "AUTOMATED_PUBLIC") {
    return {
      kickNow: isOfficialModerator ? "AVAILABLE" : "UNAUTHORIZED",
      voteToKick: "AVAILABLE",
      report,
      roomLockout: "UNAUTHORIZED",
      roomBan: "UNAUTHORIZED",
      blockerId: null,
    };
  }

  if (roomClass === "PERSONAL_OWNED") {
    return {
      kickNow: isAuthorizedHost ? "AVAILABLE" : "UNAUTHORIZED",
      voteToKick: "AVAILABLE",
      report,
      roomLockout: isAuthorizedHost ? "AVAILABLE" : "UNAUTHORIZED",
      roomBan: "UNAUTHORIZED",
      blockerId: null,
    };
  }

  // OFFICIAL_MODERATED
  return {
    kickNow: isOfficialModerator || isAuthorizedHost ? "AVAILABLE" : "UNAUTHORIZED",
    voteToKick: "AVAILABLE",
    report,
    roomLockout: isOfficialModerator ? "AVAILABLE" : "UNAUTHORIZED",
    roomBan: "UNAUTHORIZED",
    blockerId: null,
  };
}

/** Surfaces that must host the participant menu. */
export const ROOM_MODERATION_REQUIRED_SURFACES = [
  "VIDEO_PARTICIPANT_TILE",
  "AVATAR_MEMBER_CARD",
  "PEOPLE_PARTICIPANT_LIST",
  "VENUE_HUD",
] as const;

/**
 * ROOM-MODERATION-AUTHORITY-01 — server capability + vote totals + kick transaction.
 * KICK != LOCKOUT != BAN != PLATFORM BAN != DM deletion != room destruction.
 */

import { kickAudienceMember, muteAudienceMember, getVenueOccupancy } from "@/lib/live/audienceRuntimeEngine";
import { forgetAttendeePlacement } from "@/lib/live/ElasticRoomOrchestrator";
import { removeFromQueue } from "@/lib/live/queueEngine";
import { roomChatEngine } from "@/lib/messaging/RoomChatEngine";
import { removeEntity } from "@/lib/avatars/UnifiedAvatarRuntime";
import { clearFanLobbyPresence } from "@/lib/lobby/FanLobbyPresence";

export type RoomModerationAction = "REPORT" | "VOTE_TO_KICK" | "KICK_NOW" | "ROOM_LOCKOUT";

export type RoomModerationCapability = {
  canReport: boolean;
  canVoteToKick: boolean;
  canKickNow: boolean;
  canLockout: boolean;
  reason?: string;
};

export type RoomParticipantKind = "ordinary" | "owner" | "host" | "moderator" | "system";

export type RoomModerationContext = {
  roomId: string;
  actorUserId: string;
  targetUserId: string;
  actorKind: RoomParticipantKind;
  roomKind: "public_automated" | "personal" | "official_event";
  isBotOrPreview: boolean;
  isConnected: boolean;
};

const voteTallies = new Map<string, Map<string, Set<string>>>();

function voteKey(roomId: string, targetUserId: string): string {
  return `${roomId}::${targetUserId}`;
}

export function resolveRoomModerationCapabilities(
  ctx: RoomModerationContext,
): RoomModerationCapability {
  if (ctx.isBotOrPreview || !ctx.isConnected) {
    return {
      canReport: false,
      canVoteToKick: false,
      canKickNow: false,
      canLockout: false,
      reason: "bots_previews_disconnected_cannot_moderate",
    };
  }
  if (ctx.actorUserId === ctx.targetUserId) {
    return {
      canReport: false,
      canVoteToKick: false,
      canKickNow: false,
      canLockout: false,
      reason: "cannot_moderate_self",
    };
  }

  const isAuthorizedImmediate =
    ctx.actorKind === "owner" ||
    ctx.actorKind === "host" ||
    ctx.actorKind === "moderator" ||
    ctx.roomKind === "official_event";

  return {
    canReport: true,
    canVoteToKick: true,
    canKickNow: isAuthorizedImmediate,
    canLockout: isAuthorizedImmediate && ctx.roomKind !== "public_automated",
  };
}

/** Voter must be an active non-bot room member. */
export function isEligibleKickVoter(roomId: string, voterUserId: string): boolean {
  if (!voterUserId || voterUserId.startsWith("bot-")) return false;
  const occ = getVenueOccupancy(roomId);
  const member = occ.members.find((m) => m.userId === voterUserId && m.active);
  return Boolean(member && member.role !== "bot");
}

/** Target must be an active non-bot room member. */
export function isEligibleKickTarget(roomId: string, targetUserId: string): boolean {
  if (!targetUserId || targetUserId.startsWith("bot-")) return false;
  const occ = getVenueOccupancy(roomId);
  const member = occ.members.find((m) => m.userId === targetUserId && m.active);
  return Boolean(member && member.role !== "bot");
}

export function castKickVote(input: {
  roomId: string;
  targetUserId: string;
  voterUserId: string;
  requiredVotes?: number;
}): { ok: boolean; votes: number; required: number; thresholdMet: boolean; error?: string } {
  const required = Math.max(2, input.requiredVotes ?? 3);
  if (!isEligibleKickVoter(input.roomId, input.voterUserId)) {
    return { ok: false, votes: 0, required, thresholdMet: false, error: "ineligible_voter" };
  }
  if (input.voterUserId === input.targetUserId) {
    return { ok: false, votes: 0, required, thresholdMet: false, error: "cannot_vote_self" };
  }
  if (!isEligibleKickTarget(input.roomId, input.targetUserId)) {
    return { ok: false, votes: 0, required, thresholdMet: false, error: "ineligible_target" };
  }
  const key = voteKey(input.roomId, input.targetUserId);
  let roomVotes = voteTallies.get(key);
  if (!roomVotes) {
    roomVotes = new Map();
    voteTallies.set(key, roomVotes);
  }
  let voters = roomVotes.get(input.targetUserId);
  if (!voters) {
    voters = new Set();
    roomVotes.set(input.targetUserId, voters);
  }
  if (voters.has(input.voterUserId)) {
    return {
      ok: false,
      votes: voters.size,
      required,
      thresholdMet: voters.size >= required,
      error: "duplicate_vote",
    };
  }
  voters.add(input.voterUserId);
  const votes = voters.size;
  return { ok: true, votes, required, thresholdMet: votes >= required };
}

export function clearKickVotes(roomId: string, targetUserId: string): void {
  voteTallies.delete(voteKey(roomId, targetUserId));
}

export type KickExecutionResult = {
  removedUserId: string;
  roomId: string;
  effectsApplied: Array<
    "membership" | "presence" | "media" | "avatar" | "seat" | "stage" | "queue" | "room_chat" | "reactions"
  >;
  effectsFailed: string[];
  roomContinuesForOthers: true;
};

export function buildKickExecutionPlan(roomId: string, targetUserId: string): KickExecutionResult {
  return {
    removedUserId: targetUserId,
    roomId,
    effectsApplied: [],
    effectsFailed: [],
    roomContinuesForOthers: true,
  };
}

/**
 * Canonical kick transaction — reconciles through existing authorities only.
 * Does not destroy the room, ban the platform account, or erase DMs.
 */
export function executeKickTransaction(roomId: string, targetUserId: string): KickExecutionResult {
  const result = buildKickExecutionPlan(roomId, targetUserId);
  const applied: KickExecutionResult["effectsApplied"] = [];
  const failed: string[] = [];
  const occBefore = getVenueOccupancy(roomId);
  const seatId = occBefore.members.find((m) => m.userId === targetUserId)?.seatId ?? null;

  const tryEffect = (name: KickExecutionResult["effectsApplied"][number], fn: () => void) => {
    try {
      fn();
      applied.push(name);
    } catch (e) {
      failed.push(`${name}:${e instanceof Error ? e.message : "error"}`);
    }
  };

  tryEffect("membership", () => {
    kickAudienceMember(roomId, targetUserId);
  });
  tryEffect("seat", () => {
    // Seat freed inside kickAudienceMember when seatId was bound; no-op if none.
    if (!seatId) return;
  });
  tryEffect("presence", () => {
    forgetAttendeePlacement(targetUserId);
  });
  tryEffect("media", () => {
    // Existing venue moderation mute — no second WebRTC fabric.
    muteAudienceMember(roomId, targetUserId);
  });
  tryEffect("avatar", () => {
    removeEntity(targetUserId);
    clearFanLobbyPresence(targetUserId);
  });
  tryEffect("queue", () => {
    removeFromQueue(roomId, targetUserId);
  });
  tryEffect("stage", () => {
    // Stage slot is queueEngine on-stage / staging / next-up — same owner as queue.
    removeFromQueue(roomId, targetUserId);
  });
  tryEffect("room_chat", () => {
    // Session mute — terminates room chat participation without platform ban / DM wipe.
    roomChatEngine.muteUser(roomId, targetUserId, 24 * 60 * 60 * 1000);
  });
  tryEffect("reactions", () => {
    // Reaction capability ends with membership removal above.
  });

  clearKickVotes(roomId, targetUserId);
  result.effectsApplied = applied;
  result.effectsFailed = failed;
  return result;
}

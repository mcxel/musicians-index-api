/**
 * HostRoomControlBridge — wires Venue HUD host actions to EXISTING engines only.
 * Missing engines → honest disabled reason (Rule 20). No VenueRuntimeV2.
 */

import {
  advanceQueue,
  clearOnStage,
  getQueueSnapshot,
  rejectNextRequest,
  reorderQueue,
} from "@/lib/live/queueEngine";
import {
  activateStage,
  getStageState,
  removeCurrentFromStage,
  rotateToNextPerformer,
  setParticipantMicAllowed,
} from "@/lib/live/liveStageEngine";
import {
  getVenueModerationPolicy,
  setAudienceAudioEnabled,
  setAudienceMuted,
} from "@/lib/live/audienceRuntimeEngine";
import {
  closeLiveRoom,
  ensureLiveRoom,
  getLiveRoom,
  openLiveRoom,
  updateLiveRoomConfig,
} from "@/lib/live/LiveRoomEngine";
import {
  closeVoting as closeBattleVote,
  getTally,
  openVoting as openBattleVote,
} from "@/lib/competition/BattleVoteClosureEngine";
import {
  closeRubricVoteWindow,
  isRubricVoteOpen,
  openRubricVoteWindow,
} from "@/lib/voting/FanRubricVotingEngine";
import { ArenaCameraEngine } from "@/lib/engine/ArenaCameraEngine";
import type { VenueHudActionId } from "@/lib/live/ParticipationStateMachine";

export type HostControlCapability = {
  available: boolean;
  reason?: string;
};

export type HostControlCapabilityMap = Partial<Record<VenueHudActionId, HostControlCapability>>;

/** Which host HUD actions have a real engine behind them. */
export function resolveHostControlCapabilities(roomId: string): HostControlCapabilityMap {
  const room = getLiveRoom(roomId);
  return {
    approve_next: { available: true },
    reject_participant: { available: true },
    reorder_queue: { available: true },
    bring_on_stage: { available: true },
    remove_from_stage: { available: true },
    broadcast_spotlight: { available: true },
    audience_mute: { available: true },
    audience_audio: { available: true },
    participant_mic: { available: true },
    toggle_qa: {
      available: false,
      reason: "Q&A engine not mounted",
    },
    allow_reactions: { available: true },
    allow_voting: { available: true },
    lock_entry: {
      available: true,
      reason: room ? undefined : "Room register on first lock (LiveRoomEngine)",
    },
  };
}

export type HostControlResult = { ok: boolean; message: string };

export function executeHostControl(
  actionId: VenueHudActionId,
  roomId: string,
  params?: Record<string, unknown>,
): HostControlResult {
  switch (actionId) {
    case "approve_next":
    case "bring_on_stage": {
      activateStage(roomId);
      const next = advanceQueue(roomId);
      if (!next) {
        return { ok: false, message: "No one waiting in queue" };
      }
      rotateToNextPerformer(roomId);
      return { ok: true, message: `${next.performerName} → on stage` };
    }
    case "reject_participant": {
      const rejected = rejectNextRequest(roomId);
      if (!rejected) return { ok: false, message: "No pending request" };
      return { ok: true, message: `Rejected ${rejected.performerName}` };
    }
    case "reorder_queue": {
      const snap = getQueueSnapshot(roomId);
      const targetId =
        (typeof params?.performerId === "string" && params.performerId) ||
        snap.slots.find((s) => s.status === "waiting" || s.status === "next-up")?.performerId;
      if (!targetId) return { ok: false, message: "Queue empty" };
      const direction = params?.direction === "down" ? "down" : "up";
      const slot = reorderQueue(roomId, targetId, direction);
      if (!slot) return { ok: false, message: "Reorder failed" };
      return {
        ok: true,
        message: `Reordered ${slot.performerName} (${direction}) · priority ${slot.priority}`,
      };
    }
    case "remove_from_stage": {
      const cleared = clearOnStage(roomId);
      const stageRemoved = removeCurrentFromStage(roomId);
      if (!cleared && !stageRemoved) {
        return { ok: false, message: "No performer on stage" };
      }
      const name = cleared?.performerName ?? stageRemoved?.name ?? "Performer";
      return { ok: true, message: `${name} removed from stage` };
    }
    case "broadcast_spotlight": {
      const active = params?.active !== false;
      ArenaCameraEngine.setSpotlightFocus(Boolean(active));
      return { ok: true, message: active ? "Spotlight on" : "Spotlight off" };
    }
    case "audience_mute": {
      const mod = getVenueModerationPolicy(roomId);
      const next = !mod.audienceMuted;
      setAudienceMuted(roomId, next);
      return { ok: true, message: next ? "Audience muted" : "Audience unmuted" };
    }
    case "audience_audio": {
      const enable = params?.enabled !== false;
      const n = setAudienceAudioEnabled(roomId, enable);
      return {
        ok: true,
        message: enable ? `Audience audio on (${n} fans)` : `Audience audio off (${n} fans)`,
      };
    }
    case "participant_mic": {
      const allowed = params?.allowed !== false;
      const ok = setParticipantMicAllowed(roomId, allowed);
      if (!ok) {
        const stage = getStageState(roomId);
        if (!stage.currentPerformer) {
          return { ok: false, message: "No on-stage performer for mic permission" };
        }
      }
      return {
        ok: true,
        message: allowed ? "Participant mic allowed" : "Participant mic denied",
      };
    }
    case "toggle_qa":
      return { ok: false, message: "Q&A engine not mounted" };
    case "allow_reactions": {
      ensureLiveRoom({
        roomId,
        roomType: "venue",
        title: roomId,
        hostUserId: "host",
        forceLive: true,
      });
      const room = getLiveRoom(roomId);
      const next = !(room?.config.reactionsEnabled ?? true);
      updateLiveRoomConfig(roomId, { reactionsEnabled: next });
      return { ok: true, message: next ? "Reactions allowed" : "Reactions blocked" };
    }
    case "allow_voting": {
      ensureLiveRoom({
        roomId,
        roomType: "battle",
        title: roomId,
        hostUserId: "host",
        forceLive: true,
      });
      const room = getLiveRoom(roomId);
      const eventId = typeof params?.eventId === "string" ? params.eventId : roomId;
      const currentlyOpen =
        Boolean(room?.config.votingEnabled) ||
        isRubricVoteOpen(roomId, eventId) ||
        Boolean(getTally(roomId) && !getTally(roomId)?.isClosed);

      if (currentlyOpen) {
        updateLiveRoomConfig(roomId, { votingEnabled: false });
        closeRubricVoteWindow(roomId, eventId);
        closeBattleVote(roomId);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("tmi:voting:close", { detail: { roomId, eventId } }),
          );
        }
        return { ok: true, message: "Voting closed" };
      }

      updateLiveRoomConfig(roomId, { votingEnabled: true });
      openBattleVote(roomId);
      const performerIds = Array.isArray(params?.performerIds)
        ? (params.performerIds as string[])
        : [];
      if (performerIds.length > 0) {
        openRubricVoteWindow({ roomId, eventId, performerIds });
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:voting:open", { detail: { roomId, eventId } }),
        );
      }
      return { ok: true, message: "Voting open" };
    }
    case "lock_entry": {
      ensureLiveRoom({
        roomId,
        roomType: "venue",
        title: roomId,
        hostUserId: "host",
        forceLive: true,
      });
      const room = getLiveRoom(roomId);
      if (!room) return { ok: false, message: "Room not registered" };
      if (room.status === "closed" || room.status === "paused") {
        openLiveRoom(roomId);
        return { ok: true, message: "Entry open" };
      }
      closeLiveRoom(roomId);
      return { ok: true, message: "Entry locked" };
    }
    default:
      return { ok: false, message: "Host action not wired" };
  }
}

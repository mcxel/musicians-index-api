/**
 * Backstage Live Video Green Room + Whisper Chat isolation.
 *
 * ONE backstage prep infrastructure for REGULAR LIVE guests and COMPETITION
 * challengers. Public stage A/V stays separate from shared backstage video
 * and private Whisper Chat.
 *
 * Audio listening levels → ChannelMixerDirector PERSONAL bus (existing MIX).
 * Authorization → this module + GuestAdmissionAuthority / LiveChallengerQueuePolicy.
 * LOCAL MIX never grants PROGRAM access (ExperienceLiveAudioConvergencePolicy).
 *
 * NEW_WEBRTC_ENGINE = NO. SFU subscription binding remains BLOCKED until physical cert.
 */

import { ChannelMixerDirector } from "@/lib/audio/mixer/ChannelMixerDirector";
import {
  admitGuestFromBackstage,
  listWaitingBackstage,
  promoteCompetitionChallenger,
  type GuestInviteRecord,
} from "@/lib/live/GuestAdmissionAuthority";
import { emitEntranceCue } from "@/lib/live/EntranceCueAuthority";

export const NEW_WEBRTC_ENGINE = false as const;
export const BACKSTAGE_WHISPER_USES_VOLUME_ONLY_PRIVACY = 0 as const;
export const BACKSTAGE_CAM_AUTO_SHARES_ON_QUEUE_JOIN = 0 as const;
export const WHISPER_LEAKS_TO_PROGRAM = 0 as const;
export const WHISPER_LEAKS_TO_STAGE_PERFORMER = 0 as const;

/** Canonical MIX channel ids (PERSONAL listen) — exposed via existing MIX button. */
export const GREEN_ROOM_MIX_CHANNELS = {
  STAGE_PROGRAM: "greenroom:stage_program",
  BACKSTAGE_WHISPER: "greenroom:backstage_whisper",
  GUEST_FRIEND: "greenroom:guest_friend",
  MY_MIC_MONITOR: "greenroom:my_mic_monitor",
  EFFECTS_MUSIC: "greenroom:effects_music",
  ENTRANCE_DINGS: "greenroom:entrance_dings",
} as const;

export type GreenRoomReadyStatus =
  | "WAITING"
  | "PREPARING"
  | "MIC_CHECK"
  | "READY"
  | "UP_NEXT"
  | "PROMOTED";

export type GreenRoomMember = {
  userId: string;
  displayName: string;
  inviteId: string | null;
  queuePosition: number | null;
  readyStatus: GreenRoomReadyStatus;
  /** Opt-in: share camera tile with other backstage members (not public). */
  shareCameraWithGreenRoom: boolean;
  cameraOn: boolean;
  /** Whisper publish to backstage group only — never PROGRAM. */
  whisperMicOn: boolean;
  /** Private local mic check — publishes to nobody. */
  privateMicCheck: boolean;
  hasRealVideoTrack: boolean;
  sfuSubscriptionStatus: "UNBOUND" | "SUBSCRIBED" | "CAMERA_OFF" | "ERROR";
};

export type GreenRoomSnapshot = {
  roomId: string;
  liveSessionId: string;
  members: GreenRoomMember[];
  programFeedAuthorized: true;
  audienceMaySubscribeWhisper: false;
  stagePerformerMaySubscribeWhisper: false;
  sfuBindingStatus: "POLICY_READY_TRANSPORT_BLOCKED" | "BOUND";
};

type RoomKey = string;
const rooms = new Map<RoomKey, Map<string, GreenRoomMember>>();

function key(roomId: string, liveSessionId: string): RoomKey {
  return `${roomId}::${liveSessionId}`;
}

function ensureRoom(roomId: string, liveSessionId: string): Map<string, GreenRoomMember> {
  const k = key(roomId, liveSessionId);
  let m = rooms.get(k);
  if (!m) {
    m = new Map();
    rooms.set(k, m);
  }
  return m;
}

/** Register MIX strips for Green Room listening — PERSONAL only. */
export function ensureGreenRoomMixChannels(input: {
  roomId: string;
  liveSessionId: string;
}): void {
  ChannelMixerDirector.bindSession({
    roomId: input.roomId,
    liveSessionId: input.liveSessionId,
  });

  const defaults: Array<{ id: string; name: string; gain: number }> = [
    { id: GREEN_ROOM_MIX_CHANNELS.STAGE_PROGRAM, name: "Live Stage / Battle", gain: 0.75 },
    { id: GREEN_ROOM_MIX_CHANNELS.BACKSTAGE_WHISPER, name: "Backstage Conversation", gain: 0.25 },
    { id: GREEN_ROOM_MIX_CHANNELS.GUEST_FRIEND, name: "Guest / Friend Audio", gain: 0.6 },
    { id: GREEN_ROOM_MIX_CHANNELS.MY_MIC_MONITOR, name: "My Microphone Monitor", gain: 0.8 },
    { id: GREEN_ROOM_MIX_CHANNELS.EFFECTS_MUSIC, name: "Effects / Music", gain: 0.2 },
    { id: GREEN_ROOM_MIX_CHANNELS.ENTRANCE_DINGS, name: "Entrance Dings", gain: 0.15 },
  ];

  for (const d of defaults) {
    ChannelMixerDirector.upsertParticipantChannel({
      participantId: d.id.replace(/^greenroom:/, "gr_"),
      displayName: d.name,
      role: "participant",
      hasRealSource: false,
    });
    const channelId = `participant:gr_${d.id.replace(/^greenroom:/, "")}`;
    // Prefer stable ids from GREEN_ROOM_MIX_CHANNELS via mark + setGain on upsertped channels
    void channelId;
    ChannelMixerDirector.setGain({
      channelId: `participant:${d.id.replace(/^greenroom:/, "gr_")}`,
      bus: "PERSONAL",
      gain: d.gain,
    });
  }
}

export function setGreenRoomMixGain(input: {
  channel: keyof typeof GREEN_ROOM_MIX_CHANNELS;
  gain: number;
}): { ok: boolean; message: string; grantsProgramAccess: false } {
  const id = GREEN_ROOM_MIX_CHANNELS[input.channel];
  const channelId = `participant:gr_${id.replace(/^greenroom:/, "")}`;
  const res = ChannelMixerDirector.setGain({
    channelId,
    bus: "PERSONAL",
    gain: Math.max(0, Math.min(1, input.gain)),
  });
  return {
    ok: res.ok,
    message: res.message,
    grantsProgramAccess: false,
  };
}

export function joinGreenRoom(input: {
  roomId: string;
  liveSessionId: string;
  userId: string;
  displayName: string;
  inviteId?: string | null;
  queuePosition?: number | null;
}): GreenRoomMember {
  ensureGreenRoomMixChannels(input);
  const room = ensureRoom(input.roomId, input.liveSessionId);
  const existing = room.get(input.userId);
  if (existing) return { ...existing };

  const member: GreenRoomMember = {
    userId: input.userId,
    displayName: input.displayName,
    inviteId: input.inviteId ?? null,
    queuePosition: input.queuePosition ?? null,
    readyStatus: "WAITING",
    shareCameraWithGreenRoom: false,
    cameraOn: false,
    whisperMicOn: false,
    privateMicCheck: false,
    hasRealVideoTrack: false,
    sfuSubscriptionStatus: "UNBOUND",
  };
  room.set(input.userId, member);
  return { ...member };
}

export function setGreenRoomCameraShare(
  roomId: string,
  liveSessionId: string,
  userId: string,
  share: boolean,
): GreenRoomMember | null {
  const m = ensureRoom(roomId, liveSessionId).get(userId);
  if (!m) return null;
  m.shareCameraWithGreenRoom = share;
  if (!share) m.cameraOn = false;
  return { ...m };
}

export function setGreenRoomReadyStatus(
  roomId: string,
  liveSessionId: string,
  userId: string,
  status: GreenRoomReadyStatus,
): GreenRoomMember | null {
  const m = ensureRoom(roomId, liveSessionId).get(userId);
  if (!m) return null;
  m.readyStatus = status;
  return { ...m };
}

export function setWhisperMic(
  roomId: string,
  liveSessionId: string,
  userId: string,
  on: boolean,
): {
  ok: boolean;
  member: GreenRoomMember | null;
  publishesToProgram: false;
  publishesToStagePerformer: false;
} {
  const m = ensureRoom(roomId, liveSessionId).get(userId);
  if (!m) {
    return {
      ok: false,
      member: null,
      publishesToProgram: false,
      publishesToStagePerformer: false,
    };
  }
  if (m.privateMicCheck) m.privateMicCheck = false;
  m.whisperMicOn = on;
  return {
    ok: true,
    member: { ...m },
    publishesToProgram: false,
    publishesToStagePerformer: false,
  };
}

export function setPrivateMicCheck(
  roomId: string,
  liveSessionId: string,
  userId: string,
  on: boolean,
): {
  ok: boolean;
  member: GreenRoomMember | null;
  publishesToAnyone: false;
} {
  const m = ensureRoom(roomId, liveSessionId).get(userId);
  if (!m) return { ok: false, member: null, publishesToAnyone: false };
  m.privateMicCheck = on;
  if (on) m.whisperMicOn = false;
  return { ok: true, member: { ...m }, publishesToAnyone: false };
}

export function getGreenRoomSnapshot(
  roomId: string,
  liveSessionId: string,
): GreenRoomSnapshot {
  const room = ensureRoom(roomId, liveSessionId);
  return {
    roomId,
    liveSessionId,
    members: [...room.values()].map((m) => ({ ...m })),
    programFeedAuthorized: true,
    audienceMaySubscribeWhisper: false,
    stagePerformerMaySubscribeWhisper: false,
    sfuBindingStatus: "POLICY_READY_TRANSPORT_BLOCKED",
  };
}

/** Tiles other backstage members may see — consent required; never fake streams. */
export function listAuthorizedGreenRoomVideoTiles(
  roomId: string,
  liveSessionId: string,
  viewerUserId: string,
): Array<{
  userId: string;
  displayName: string;
  readyStatus: GreenRoomReadyStatus;
  queuePosition: number | null;
  tileState: "LIVE_CONSENT" | "CAMERA_OFF" | "NO_CONSENT" | "SELF_PREVIEW" | "TRANSPORT_UNBOUND";
}> {
  const room = ensureRoom(roomId, liveSessionId);
  return [...room.values()].map((m) => {
    if (m.userId === viewerUserId) {
      return {
        userId: m.userId,
        displayName: m.displayName,
        readyStatus: m.readyStatus,
        queuePosition: m.queuePosition,
        tileState: m.cameraOn ? "SELF_PREVIEW" : "CAMERA_OFF",
      };
    }
    if (!m.shareCameraWithGreenRoom) {
      return {
        userId: m.userId,
        displayName: m.displayName,
        readyStatus: m.readyStatus,
        queuePosition: m.queuePosition,
        tileState: "NO_CONSENT",
      };
    }
    if (!m.cameraOn || !m.hasRealVideoTrack) {
      return {
        userId: m.userId,
        displayName: m.displayName,
        readyStatus: m.readyStatus,
        queuePosition: m.queuePosition,
        tileState: "CAMERA_OFF",
      };
    }
    if (m.sfuSubscriptionStatus !== "SUBSCRIBED") {
      return {
        userId: m.userId,
        displayName: m.displayName,
        readyStatus: m.readyStatus,
        queuePosition: m.queuePosition,
        tileState: "TRANSPORT_UNBOUND",
      };
    }
    return {
      userId: m.userId,
      displayName: m.displayName,
      readyStatus: m.readyStatus,
      queuePosition: m.queuePosition,
      tileState: "LIVE_CONSENT",
    };
  });
}

/**
 * Who may subscribe to whisper audio.
 * Audience + current stage performer (unless also backstage) → DENY.
 */
export function maySubscribeBackstageWhisper(input: {
  subscriberUserId: string;
  subscriberRole: "audience" | "stage_performer" | "backstage" | "host";
  roomId: string;
  liveSessionId: string;
}): { allowed: boolean; reason: string } {
  if (input.subscriberRole === "audience") {
    return { allowed: false, reason: "AUDIENCE_DENIED_WHISPER" };
  }
  if (input.subscriberRole === "stage_performer") {
    const inRoom = ensureRoom(input.roomId, input.liveSessionId).has(input.subscriberUserId);
    if (!inRoom) return { allowed: false, reason: "STAGE_PERFORMER_DENIED_WHISPER" };
  }
  if (input.subscriberRole === "backstage" || input.subscriberRole === "host") {
    const inRoom = ensureRoom(input.roomId, input.liveSessionId).has(input.subscriberUserId);
    if (!inRoom && input.subscriberRole === "backstage") {
      return { allowed: false, reason: "NOT_IN_GREEN_ROOM" };
    }
    return { allowed: true, reason: "BACKSTAGE_AUTHORIZED" };
  }
  return { allowed: false, reason: "DENIED" };
}

/** Promote: kill whisper publish before stage mic attaches. */
export function promoteFromGreenRoom(input: {
  roomId: string;
  liveSessionId: string;
  userId: string;
  hostPerformerId: string;
  panelSlotId: string;
  competition: boolean;
  mediaReady: boolean;
}): {
  ok: boolean;
  reason: string;
  whisperStopped: true;
  entranceEventId: string | null;
} {
  const room = ensureRoom(input.roomId, input.liveSessionId);
  const m = room.get(input.userId);
  if (m) {
    m.whisperMicOn = false;
    m.privateMicCheck = false;
    m.readyStatus = "PROMOTED";
  }

  const entranceEventId = `entrance:${input.liveSessionId}:${input.userId}:${Date.now()}`;

  if (input.competition) {
    const promoted = promoteCompetitionChallenger({
      roomId: input.roomId,
      liveSessionId: input.liveSessionId,
      hostPerformerId: input.hostPerformerId,
      challengerUserId: input.userId,
      challengerDisplayName: m?.displayName ?? input.userId,
      panelSlotId: input.panelSlotId,
      mediaReady: input.mediaReady,
    });
    if (promoted.ok) {
      emitEntranceCue({
        eventId: entranceEventId,
        kind: "COMPETITION_CHALLENGER",
        experienceKind: "BATTLE",
      });
    }
    return {
      ok: promoted.ok,
      reason: promoted.reason,
      whisperStopped: true,
      entranceEventId: promoted.ok ? entranceEventId : null,
    };
  }

  const waiting = listWaitingBackstage(input.roomId, input.liveSessionId);
  const invite =
    waiting.find((i) => i.guestUserId === input.userId) ??
    (m?.inviteId
      ? ({ inviteId: m.inviteId } as Pick<GuestInviteRecord, "inviteId">)
      : null);

  if (!invite?.inviteId) {
    return {
      ok: false,
      reason: "NO_BACKSTAGE_INVITE",
      whisperStopped: true,
      entranceEventId: null,
    };
  }

  const admitted = admitGuestFromBackstage({
    inviteId: invite.inviteId,
    hostAuthorized: true,
    panelSlotId: input.panelSlotId,
    participationState: input.mediaReady ? "READY" : "QUEUED",
  });

  if (admitted.ok) {
    emitEntranceCue({
      eventId: entranceEventId,
      kind: "REGULAR_GUEST",
      experienceKind: "REGULAR_LIVE",
    });
  }

  return {
    ok: admitted.ok,
    reason: admitted.reason,
    whisperStopped: true,
    entranceEventId: admitted.ok ? entranceEventId : null,
  };
}

export function resetBackstageGreenRoomForTests(): void {
  rooms.clear();
}

// VoicePermissionEngine.ts
// Determines what each role can do with voice in each room state.

import type { VoiceParticipantRole, VoiceRoomState } from "./RoomVoiceEngine";

export interface PerformerVoiceSettings {
  performerId: string;
  allowInstantAudienceTalkback: boolean;
}

export interface VoicePermissions {
  canSpeak: boolean;
  canListen: boolean;
  canRequestTalkback: boolean;
  canOpenCrowd: boolean;
  canFocusPerson: boolean;
  canMutePerson: boolean;
  canModerate: boolean;
  canControlGate: boolean;
}

type PermissionMatrix = Record<VoiceRoomState, Record<VoiceParticipantRole, VoicePermissions>>;

const FULL: VoicePermissions = {
  canSpeak: true,
  canListen: true,
  canRequestTalkback: true,
  canOpenCrowd: true,
  canFocusPerson: true,
  canMutePerson: true,
  canModerate: true,
  canControlGate: true,
};

const LISTEN_ONLY: VoicePermissions = {
  canSpeak: false,
  canListen: true,
  canRequestTalkback: false,
  canOpenCrowd: false,
  canFocusPerson: false,
  canMutePerson: false,
  canModerate: false,
  canControlGate: false,
};

const REQUEST_ONLY: VoicePermissions = {
  canSpeak: false,
  canListen: true,
  canRequestTalkback: true,
  canOpenCrowd: false,
  canFocusPerson: false,
  canMutePerson: false,
  canModerate: false,
  canControlGate: false,
};

const SOCIAL: VoicePermissions = {
  canSpeak: true,
  canListen: true,
  canRequestTalkback: true,
  canOpenCrowd: false,
  canFocusPerson: false,
  canMutePerson: false,
  canModerate: false,
  canControlGate: false,
};

const PERFORMER_LIVE: VoicePermissions = {
  canSpeak: true,
  canListen: true,
  canRequestTalkback: false,
  canOpenCrowd: false,
  canFocusPerson: true,
  canMutePerson: true,
  canModerate: false,
  canControlGate: false,
};

const CONTESTANT_LIVE: VoicePermissions = {
  canSpeak: true,
  canListen: true,
  canRequestTalkback: false,
  canOpenCrowd: false,
  canFocusPerson: false,
  canMutePerson: false,
  canModerate: false,
  canControlGate: false,
};

const PERMISSION_MATRIX: PermissionMatrix = {
  FREE_ROAM: {
    HOST: FULL,
    CONTESTANT: SOCIAL,
    PERFORMER: FULL,
    AUDIENCE: SOCIAL,
    MODERATOR: FULL,
  },
  PRE_SHOW: {
    HOST: FULL,
    CONTESTANT: SOCIAL,
    PERFORMER: FULL,
    AUDIENCE: REQUEST_ONLY,
    MODERATOR: FULL,
  },
  LIVE_SHOW: {
    HOST: FULL,
    CONTESTANT: CONTESTANT_LIVE,
    PERFORMER: PERFORMER_LIVE,
    AUDIENCE: LISTEN_ONLY,
    MODERATOR: FULL,
  },
  POST_SHOW: {
    HOST: FULL,
    CONTESTANT: SOCIAL,
    PERFORMER: FULL,
    AUDIENCE: SOCIAL,
    MODERATOR: FULL,
  },
};

export function getVoicePermissions(
  role: VoiceParticipantRole,
  roomState: VoiceRoomState
): VoicePermissions {
  return PERMISSION_MATRIX[roomState][role];
}

export function canParticipantSpeak(
  role: VoiceParticipantRole,
  roomState: VoiceRoomState,
  overrideSystemFocused = false
): boolean {
  if (overrideSystemFocused) return true; // focus grant overrides matrix
  return PERMISSION_MATRIX[roomState][role].canSpeak;
}

export function resolveEffectivePermissions(
  role: VoiceParticipantRole,
  roomState: VoiceRoomState,
  settings?: Partial<PerformerVoiceSettings>
): VoicePermissions {
  const base = getVoicePermissions(role, roomState);
  // Performers with instant talkback setting get audience-request abilities even in LIVE_SHOW
  if (
    role === "PERFORMER" &&
    roomState === "LIVE_SHOW" &&
    settings?.allowInstantAudienceTalkback
  ) {
    return {
      ...base,
      canRequestTalkback: false, // performer doesn't request, they grant
      canFocusPerson: true,
      canMutePerson: true,
      canControlGate: true,
    };
  }
  return base;
}

/**
 * LiveCapabilityPolicy.ts — Fan vs Performer (and other roles) capability matrix
 */

import type { AccountCapabilityRole, LiveCapabilitySet } from "./contracts/CapabilityContracts";

const MATRIX: Record<AccountCapabilityRole, LiveCapabilitySet> = {
  FAN: {
    role: "FAN",
    canPublishCamera: true,
    canPublishMic: true,
    canScreenShare: false,
    canGoLivePerformer: false,
    canGoLiveFanSocial: true,
    canHostBattle: false,
    canJoinAsGuest: true,
    canCast: true,
    canRecordProgram: false,
    canModerateFeeds: false,
    canDirectPresentation: false,
    canOwnAvatar: true,
  },
  PERFORMER: {
    role: "PERFORMER",
    canPublishCamera: true,
    canPublishMic: true,
    canScreenShare: true,
    canGoLivePerformer: true,
    canGoLiveFanSocial: false,
    canHostBattle: true,
    canJoinAsGuest: false,
    canCast: true,
    canRecordProgram: true,
    canModerateFeeds: true,
    canDirectPresentation: true,
    canOwnAvatar: false,
  },
  BAND: {
    role: "BAND",
    canPublishCamera: true,
    canPublishMic: true,
    canScreenShare: true,
    canGoLivePerformer: true,
    canGoLiveFanSocial: false,
    canHostBattle: true,
    canJoinAsGuest: false,
    canCast: true,
    canRecordProgram: true,
    canModerateFeeds: true,
    canDirectPresentation: true,
    canOwnAvatar: false,
  },
  ADMIN: {
    role: "ADMIN",
    canPublishCamera: true,
    canPublishMic: true,
    canScreenShare: true,
    canGoLivePerformer: true,
    canGoLiveFanSocial: true,
    canHostBattle: true,
    canJoinAsGuest: true,
    canCast: true,
    canRecordProgram: true,
    canModerateFeeds: true,
    canDirectPresentation: true,
    canOwnAvatar: false,
  },
  GUEST: {
    role: "GUEST",
    canPublishCamera: true,
    canPublishMic: true,
    canScreenShare: false,
    canGoLivePerformer: false,
    canGoLiveFanSocial: false,
    canHostBattle: false,
    canJoinAsGuest: true,
    canCast: false,
    canRecordProgram: false,
    canModerateFeeds: false,
    canDirectPresentation: false,
    canOwnAvatar: false,
  },
};

export class LiveCapabilityPolicy {
  public static forRole(role: AccountCapabilityRole): LiveCapabilitySet {
    return { ...MATRIX[role] };
  }

  public static assert(role: AccountCapabilityRole, capability: keyof LiveCapabilitySet): void {
    const set = MATRIX[role];
    if (capability === "role") return;
    if (!set[capability]) {
      throw new Error(`CAPABILITY_DENIED: ${role} cannot ${capability}`);
    }
  }

  public static canPublishSourceKind(
    role: AccountCapabilityRole,
    kind: string
  ): boolean {
    const caps = MATRIX[role];
    if (kind === "CAMERA") return caps.canPublishCamera;
    if (kind === "MIC") return caps.canPublishMic;
    if (kind === "SCREEN_SHARE") return caps.canScreenShare;
    if (kind === "FAN_AVATAR") return caps.canOwnAvatar;
    return caps.canPublishCamera || caps.canJoinAsGuest;
  }
}

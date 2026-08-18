/**
 * Compatibility shim — canonical engine lives in `@/lib/personal-media`.
 * Existing Lounge HUD from the prior HUD commit still imports this path.
 * New code should import from `@/lib/personal-media` directly.
 */

import {
  defaultPersonalMediaRouter,
  DEFAULT_MONITOR_A,
  DEFAULT_MONITOR_B,
  type MonitorTarget,
  type ParticipantMediaIdentity,
} from "@/lib/personal-media";

export type { MonitorTarget, ParticipantMediaIdentity };
export type MonitorId = "MONITOR_A" | "MONITOR_B" | string;
export { DEFAULT_MONITOR_A, DEFAULT_MONITOR_B };

export type AudioResolutionState =
  | "BLOCKED"
  | "LOCAL_MUTE_ACTIVE"
  | "PRIVATE_CHANNEL"
  | "PINNED_FOREGROUND"
  | "PROXIMITY_ATTENUATED";

const router = defaultPersonalMediaRouter;

class PersonalMediaRouterCompat {
  registerParticipant(identity: ParticipantMediaIdentity): void {
    router.registerParticipant(identity);
  }

  getParticipant(participantId: string): ParticipantMediaIdentity | undefined {
    return router.getParticipant(participantId);
  }

  assignToMonitor(
    participantId: string,
    target: MonitorTarget,
  ): { ok: boolean; streamReconnected: false; key: string } {
    const res = router.assignToMonitor(participantId, target);
    return { ok: res.ok, streamReconnected: false, key: res.key };
  }

  removeFromMonitor(target: MonitorTarget): {
    ok: boolean;
    previous: ParticipantMediaIdentity | null;
  } {
    const previous = router.getMonitorAssignment(target);
    const res = router.removeFromMonitor(target);
    return { ok: res.ok, previous };
  }

  swapMonitorAssignments(target1: MonitorTarget, target2: MonitorTarget): boolean {
    return router.swapMonitorAssignments(target1, target2);
  }

  getMonitorAssignment(target: MonitorTarget): ParticipantMediaIdentity | null {
    return router.getMonitorAssignment(target);
  }

  getAssignment(target: MonitorTarget): ParticipantMediaIdentity | null {
    return router.getAssignment(target);
  }

  pinAudio(participantId: string): void {
    router.pinAudio(participantId);
  }

  unpinAudio(participantId: string): void {
    router.unpinAudio(participantId);
  }

  muteLocal(participantId: string): void {
    router.muteLocal(participantId);
  }

  unmuteLocal(participantId: string): void {
    router.unmuteLocal(participantId);
  }

  hideVideoLocal(participantId: string): void {
    router.hideVideoLocal(participantId);
  }

  restoreVideoLocal(participantId: string): void {
    router.restoreVideoLocal(participantId);
  }

  removeFromView(participantId: string): void {
    router.removeFromView(participantId);
  }

  restoreToView(participantId: string): void {
    router.restoreToView(participantId);
  }

  restoreAllPersonalViewSettings(): void {
    router.restoreAll();
  }

  restoreAll(): void {
    router.restoreAll();
  }

  evaluateAudioState(
    participantId: string,
    isBlocked: boolean,
    isPrivate: boolean,
  ): AudioResolutionState {
    const resolved = router.evaluateAudio(participantId, {
      blocked: isBlocked,
      privateChannelRestricted: isPrivate,
    });
    if (resolved.resolvedBy === "blocked_unauthorized") return "BLOCKED";
    if (resolved.resolvedBy === "local_mute") return "LOCAL_MUTE_ACTIVE";
    if (resolved.resolvedBy === "private_channel_policy") return "PRIVATE_CHANNEL";
    if (resolved.resolvedBy === "pinned_audio") return "PINNED_FOREGROUND";
    return "PROXIMITY_ATTENUATED";
  }

  getStateSummary() {
    return router.getStateSummary();
  }
}

export const PersonalMediaRouter = new PersonalMediaRouterCompat();

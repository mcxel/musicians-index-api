/**
 * Personal Media Router — Client-Side Monitor & Local Curation Engine.
 *
 * Laws:
 *   1. Owns my personal presentation of room participants (local monitor assignments, pin audio, local mute, hide, remove).
 *   2. ParticipantMediaIdentity is invariant: assigning to Monitor A/B, pinning audio, or hiding locally NEVER reconnects WebRTC stream.
 *   3. Pin Audio overrides proximity attenuation while roaming, but respects local mute and moderation locks.
 *   4. Local curation never alters global room membership or moderation state.
 *   5. MY VIEW recovery drawer provides individual and RESTORE_ALL controls.
 */

export interface ParticipantMediaIdentity {
  participantId: string;
  roomId: string;
  videoTrackId: string | null;
  audioTrackId: string | null;
  spatialPodId: string;
  canonicalIdentityId: string;
  displayName: string;
}

export type MonitorId = "MONITOR_A" | "MONITOR_B" | string;

export interface MonitorTarget {
  monitorId: MonitorId;
  slotId: string; // e.g. "PRIMARY", "SLOT_1", "SLOT_2"
}

export type AudioResolutionState =
  | "BLOCKED"
  | "LOCAL_MUTE_ACTIVE"
  | "PRIVATE_CHANNEL"
  | "PINNED_FOREGROUND"
  | "PROXIMITY_ATTENUATED";

export interface PersonalMediaState {
  monitorAssignments: Map<string, ParticipantMediaIdentity>; // key: `${monitorId}:${slotId}`
  pinnedAudio: Set<string>; // participantId
  mutedAudio: Set<string>; // participantId
  hiddenVideo: Set<string>; // participantId
  removedFromView: Set<string>; // participantId
}

class PersonalMediaRouterImpl {
  private state: PersonalMediaState = {
    monitorAssignments: new Map(),
    pinnedAudio: new Set(),
    mutedAudio: new Set(),
    hiddenVideo: new Set(),
    removedFromView: new Set(),
  };

  private participants = new Map<string, ParticipantMediaIdentity>();

  registerParticipant(identity: ParticipantMediaIdentity): void {
    this.participants.set(identity.participantId, identity);
  }

  getParticipant(participantId: string): ParticipantMediaIdentity | undefined {
    return this.participants.get(participantId);
  }

  /**
   * Assign participant to addressable monitor target.
   * Guaranteed ZERO WebRTC reconnection.
   */
  assignToMonitor(
    participantId: string,
    target: MonitorTarget,
  ): { ok: boolean; streamReconnected: false; key: string } {
    const identity = this.participants.get(participantId);
    if (!identity) return { ok: false, streamReconnected: false, key: "" };

    const key = `${target.monitorId}:${target.slotId}`;
    this.state.monitorAssignments.set(key, identity);
    return { ok: true, streamReconnected: false, key };
  }

  removeFromMonitor(target: MonitorTarget): { ok: boolean; previous: ParticipantMediaIdentity | null } {
    const key = `${target.monitorId}:${target.slotId}`;
    const previous = this.state.monitorAssignments.get(key) ?? null;
    this.state.monitorAssignments.delete(key);
    return { ok: true, previous };
  }

  swapMonitorAssignments(target1: MonitorTarget, target2: MonitorTarget): boolean {
    const key1 = `${target1.monitorId}:${target1.slotId}`;
    const key2 = `${target2.monitorId}:${target2.slotId}`;
    const p1 = this.state.monitorAssignments.get(key1);
    const p2 = this.state.monitorAssignments.get(key2);

    if (p1) this.state.monitorAssignments.set(key2, p1);
    else this.state.monitorAssignments.delete(key2);

    if (p2) this.state.monitorAssignments.set(key1, p2);
    else this.state.monitorAssignments.delete(key1);

    return true;
  }

  getMonitorAssignment(target: MonitorTarget): ParticipantMediaIdentity | null {
    const key = `${target.monitorId}:${target.slotId}`;
    return this.state.monitorAssignments.get(key) ?? null;
  }

  pinAudio(participantId: string): void {
    this.state.pinnedAudio.add(participantId);
  }

  unpinAudio(participantId: string): void {
    this.state.pinnedAudio.delete(participantId);
  }

  muteLocal(participantId: string): void {
    this.state.mutedAudio.add(participantId);
  }

  unmuteLocal(participantId: string): void {
    this.state.mutedAudio.delete(participantId);
  }

  hideVideoLocal(participantId: string): void {
    this.state.hiddenVideo.add(participantId);
  }

  restoreVideoLocal(participantId: string): void {
    this.state.hiddenVideo.delete(participantId);
  }

  removeFromView(participantId: string): void {
    this.state.removedFromView.add(participantId);
    this.state.mutedAudio.add(participantId);
    this.state.hiddenVideo.add(participantId);

    // Remove from any assigned monitors
    for (const [key, identity] of this.state.monitorAssignments.entries()) {
      if (identity.participantId === participantId) {
        this.state.monitorAssignments.delete(key);
      }
    }
  }

  restoreToView(participantId: string): void {
    this.state.removedFromView.delete(participantId);
    this.state.mutedAudio.delete(participantId);
    this.state.hiddenVideo.delete(participantId);
  }

  restoreAllPersonalViewSettings(): void {
    this.state.monitorAssignments.clear();
    this.state.pinnedAudio.clear();
    this.state.mutedAudio.clear();
    this.state.hiddenVideo.clear();
    this.state.removedFromView.clear();
  }

  /**
   * Audio Evaluation Resolution Hierarchy:
   *   1. BLOCKED
   *   2. LOCAL MUTE
   *   3. PRIVATE CHANNEL
   *   4. PINNED FOREGROUND
   *   5. PROXIMITY ATTENUATED
   */
  evaluateAudioState(participantId: string, isBlocked: boolean, isPrivate: boolean): AudioResolutionState {
    if (isBlocked) return "BLOCKED";
    if (this.state.mutedAudio.has(participantId)) return "LOCAL_MUTE_ACTIVE";
    if (isPrivate) return "PRIVATE_CHANNEL";
    if (this.state.pinnedAudio.has(participantId)) return "PINNED_FOREGROUND";
    return "PROXIMITY_ATTENUATED";
  }

  getStateSummary() {
    return {
      assignmentsCount: this.state.monitorAssignments.size,
      pinnedAudioCount: this.state.pinnedAudio.size,
      mutedAudioCount: this.state.mutedAudio.size,
      hiddenVideoCount: this.state.hiddenVideo.size,
      removedFromViewCount: this.state.removedFromView.size,
    };
  }
}

export const PersonalMediaRouter = new PersonalMediaRouterImpl();

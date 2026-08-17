/**
 * PersonalMediaRouter — client-local curation of existing participant media.
 *
 * Owns: monitor slot assignments, pin audio, local mute, hide video,
 * remove-from-my-view composite, local interaction target.
 *
 * Does not own: WebRTC sessions, room membership, global mute, spatial pod physics.
 * Injected mediaTransport + roomAuthorityPort must stay unused for reconnect / kick.
 */

import {
  DEFAULT_PROXIMITY_RANGE_METERS,
  isWithinProximity,
  resolvePersonalAudio,
  type PersonalAudioResolution,
} from "./audioResolution";
import type { PersonalMediaTransport } from "./mediaTransport";
import {
  assignmentEntriesFromSnapshot,
  clearPersonalMediaSnapshot,
  loadPersonalMediaSnapshot,
  savePersonalMediaSnapshot,
} from "./persistence";
import type { RoomAuthorityPort } from "./roomAuthorityPort";
import {
  DEFAULT_MONITOR_A,
  DEFAULT_MONITOR_B,
  listAddressableMonitorTargets,
  monitorSlotKey,
  PERSONAL_MEDIA_LAW,
  type MonitorTarget,
  type ParticipantMediaIdentity,
} from "./types";

export type PersonalMediaRouterOptions = {
  mediaTransport?: PersonalMediaTransport;
  roomAuthority?: RoomAuthorityPort;
  userId?: string;
  roomId?: string;
  persist?: boolean;
  proximityRangeMeters?: number;
};

export type MonitorAssignmentRow = {
  target: MonitorTarget;
  identity: ParticipantMediaIdentity;
};

export type PersonalMediaViewSnapshot = {
  identities: ParticipantMediaIdentity[];
  assignments: MonitorAssignmentRow[];
  pinnedAudio: ParticipantMediaIdentity[];
  mutedPeople: ParticipantMediaIdentity[];
  hiddenVideo: ParticipantMediaIdentity[];
  removedPeople: ParticipantMediaIdentity[];
  interactionTargetId: string | null;
};

function identityList(
  ids: Iterable<string>,
  participants: Map<string, ParticipantMediaIdentity>,
): ParticipantMediaIdentity[] {
  const out: ParticipantMediaIdentity[] = [];
  for (const id of ids) {
    const identity = participants.get(id);
    if (identity) out.push(identity);
  }
  return out;
}

export class PersonalMediaRouter {
  readonly law = PERSONAL_MEDIA_LAW;

  private readonly mediaTransport?: PersonalMediaTransport;
  private readonly roomAuthority?: RoomAuthorityPort;
  private readonly userId?: string;
  private readonly persistEnabled: boolean;
  private readonly proximityRangeMeters: number;

  private participants = new Map<string, ParticipantMediaIdentity>();
  private assignments = new Map<string, string>();
  private pinnedAudio = new Set<string>();
  private mutedAudio = new Set<string>();
  private hiddenVideo = new Set<string>();
  private removedFromView = new Set<string>();
  private interactionTargetId: string | null = null;
  private distanceMeters = new Map<string, number>();
  private safetyLocks = new Map<string, { blocked?: boolean; unauthorized?: boolean }>();
  private privateChannelRestricted = new Set<string>();
  private roomId: string | null = null;
  private listeners = new Set<() => void>();
  private snapshotCache: PersonalMediaViewSnapshot | null = null;

  constructor(options: PersonalMediaRouterOptions = {}) {
    this.mediaTransport = options.mediaTransport;
    this.roomAuthority = options.roomAuthority;
    // Ports are injected so tests can prove these remain unused for reconnect/kick.
    void this.mediaTransport;
    void this.roomAuthority;
    this.userId = options.userId;
    this.persistEnabled = options.persist === true;
    this.proximityRangeMeters = options.proximityRangeMeters ?? DEFAULT_PROXIMITY_RANGE_METERS;
    this.roomId = options.roomId ?? null;
    if (this.persistEnabled && this.userId && this.roomId) {
      this.hydrate();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): PersonalMediaViewSnapshot {
    if (!this.snapshotCache) this.snapshotCache = this.buildSnapshot();
    return this.snapshotCache;
  }

  registerParticipant(identity: ParticipantMediaIdentity): ParticipantMediaIdentity {
    this.participants.set(identity.participantId, { ...identity });
    if (!this.roomId) this.roomId = identity.roomId;
    this.commit();
    return this.participants.get(identity.participantId)!;
  }

  getParticipant(participantId: string): ParticipantMediaIdentity | undefined {
    return this.participants.get(participantId);
  }

  getDefaultMonitorA(): MonitorTarget {
    return { ...DEFAULT_MONITOR_A };
  }

  getDefaultMonitorB(): MonitorTarget {
    return { ...DEFAULT_MONITOR_B };
  }

  listWatchTargets(): Array<MonitorTarget & { occupiedBy: string | null }> {
    return listAddressableMonitorTargets().map((target) => ({
      ...target,
      occupiedBy: this.assignments.get(monitorSlotKey(target)) ?? null,
    }));
  }

  assignToMonitor(
    participantId: string,
    target: MonitorTarget,
  ): { ok: boolean; key: string } {
    if (!this.participants.has(participantId)) {
      return { ok: false, key: "" };
    }
    const key = monitorSlotKey(target);
    this.assignments.set(key, participantId);
    this.commit();
    return { ok: true, key };
  }

  removeFromMonitor(target: MonitorTarget): { ok: boolean; previousParticipantId: string | null } {
    const key = monitorSlotKey(target);
    const previous = this.assignments.get(key) ?? null;
    this.assignments.delete(key);
    this.commit();
    return { ok: true, previousParticipantId: previous };
  }

  swapMonitorAssignments(a: MonitorTarget, b: MonitorTarget): boolean {
    const keyA = monitorSlotKey(a);
    const keyB = monitorSlotKey(b);
    const idA = this.assignments.get(keyA);
    const idB = this.assignments.get(keyB);
    if (idA) this.assignments.set(keyB, idA);
    else this.assignments.delete(keyB);
    if (idB) this.assignments.set(keyA, idB);
    else this.assignments.delete(keyA);
    this.commit();
    return true;
  }

  getMonitorAssignment(target: MonitorTarget): ParticipantMediaIdentity | null {
    const participantId = this.assignments.get(monitorSlotKey(target));
    if (!participantId) return null;
    return this.participants.get(participantId) ?? null;
  }

  pinAudio(participantId: string): boolean {
    if (!this.participants.has(participantId)) return false;
    this.pinnedAudio.add(participantId);
    this.commit();
    return true;
  }

  unpinAudio(participantId: string): boolean {
    const had = this.pinnedAudio.delete(participantId);
    this.commit();
    return had;
  }

  muteLocal(participantId: string): boolean {
    if (!this.participants.has(participantId)) return false;
    this.mutedAudio.add(participantId);
    this.commit();
    return true;
  }

  unmuteLocal(participantId: string): boolean {
    const had = this.mutedAudio.delete(participantId);
    this.commit();
    return had;
  }

  hideVideoLocal(participantId: string): boolean {
    if (!this.participants.has(participantId)) return false;
    this.hiddenVideo.add(participantId);
    this.commit();
    return true;
  }

  restoreVideoLocal(participantId: string): boolean {
    const had = this.hiddenVideo.delete(participantId);
    this.commit();
    return had;
  }

  setInteractionTarget(participantId: string | null): void {
    this.interactionTargetId = participantId;
    this.commit();
  }

  getInteractionTargetId(): string | null {
    return this.interactionTargetId;
  }

  /**
   * REMOVE FROM MY VIEW — local composite only.
   * Hide visual + mute locally + drop personal monitor assignments + clear
   * interaction target. Never kick/ban/global-mute/remove from room.
   */
  removeFromView(participantId: string): boolean {
    if (!this.participants.has(participantId)) return false;
    this.removedFromView.add(participantId);
    this.mutedAudio.add(participantId);
    this.hiddenVideo.add(participantId);
    for (const [key, id] of this.assignments.entries()) {
      if (id === participantId) this.assignments.delete(key);
    }
    if (this.interactionTargetId === participantId) {
      this.interactionTargetId = null;
    }
    this.commit();
    return true;
  }

  restoreToView(participantId: string): boolean {
    if (!this.participants.has(participantId) && !this.removedFromView.has(participantId)) {
      return false;
    }
    this.removedFromView.delete(participantId);
    this.mutedAudio.delete(participantId);
    this.hiddenVideo.delete(participantId);
    this.commit();
    return true;
  }

  restoreAll(): void {
    this.assignments.clear();
    this.pinnedAudio.clear();
    this.mutedAudio.clear();
    this.hiddenVideo.clear();
    this.removedFromView.clear();
    this.interactionTargetId = null;
    if (this.persistEnabled && this.userId && this.roomId) {
      clearPersonalMediaSnapshot(this.userId, this.roomId);
    }
    this.commit();
  }

  /** Avatar / pod move. Updates proximity only — never reconnects WebRTC. */
  simulateAvatarMove(participantId: string, distanceMeters: number): void {
    this.distanceMeters.set(participantId, distanceMeters);
    this.commit();
  }

  setSafetyLock(participantId: string, lock: { blocked?: boolean; unauthorized?: boolean }): void {
    this.safetyLocks.set(participantId, lock);
    this.commit();
  }

  setPrivateChannelRestricted(participantId: string, restricted: boolean): void {
    if (restricted) this.privateChannelRestricted.add(participantId);
    else this.privateChannelRestricted.delete(participantId);
    this.commit();
  }

  isVideoHidden(participantId: string): boolean {
    return this.hiddenVideo.has(participantId) || this.removedFromView.has(participantId);
  }

  isRemovedFromView(participantId: string): boolean {
    return this.removedFromView.has(participantId);
  }

  evaluateAudio(
    participantId: string,
    input?: {
      blocked?: boolean;
      unauthorized?: boolean;
      privateChannelRestricted?: boolean;
      distanceMeters?: number;
    },
  ): PersonalAudioResolution {
    const lock = this.safetyLocks.get(participantId);
    const distance =
      input?.distanceMeters ?? this.distanceMeters.get(participantId) ?? 0;
    return resolvePersonalAudio({
      blocked: input?.blocked ?? lock?.blocked ?? false,
      unauthorized: input?.unauthorized ?? lock?.unauthorized ?? false,
      localMuted: this.mutedAudio.has(participantId),
      privateChannelRestricted:
        input?.privateChannelRestricted ?? this.privateChannelRestricted.has(participantId),
      pinned: this.pinnedAudio.has(participantId),
      withinProximity: isWithinProximity(distance, this.proximityRangeMeters),
    });
  }

  getStateSummary() {
    return {
      identityCount: this.participants.size,
      assignmentsCount: this.assignments.size,
      pinnedAudioCount: this.pinnedAudio.size,
      mutedAudioCount: this.mutedAudio.size,
      hiddenVideoCount: this.hiddenVideo.size,
      removedFromViewCount: this.removedFromView.size,
      interactionTargetId: this.interactionTargetId,
    };
  }

  private hydrate(): void {
    if (!this.userId || !this.roomId) return;
    const stored = loadPersonalMediaSnapshot(this.userId, this.roomId);
    if (!stored) return;
    for (const row of assignmentEntriesFromSnapshot(stored)) {
      this.assignments.set(monitorSlotKey(row.target), row.participantId);
    }
    this.pinnedAudio = new Set(stored.pinnedAudio ?? []);
    this.mutedAudio = new Set(stored.mutedAudio ?? []);
    this.hiddenVideo = new Set(stored.hiddenVideo ?? []);
    this.removedFromView = new Set(stored.removedFromView ?? []);
    this.interactionTargetId = stored.interactionTargetId ?? null;
  }

  private persist(): void {
    if (!this.persistEnabled || !this.userId || !this.roomId) return;
    savePersonalMediaSnapshot(this.userId, this.roomId, {
      assignments: Array.from(this.assignments.entries()).map(([key, participantId]) => ({
        key,
        participantId,
      })),
      pinnedAudio: Array.from(this.pinnedAudio),
      mutedAudio: Array.from(this.mutedAudio),
      hiddenVideo: Array.from(this.hiddenVideo),
      removedFromView: Array.from(this.removedFromView),
      interactionTargetId: this.interactionTargetId,
    });
  }

  private buildSnapshot(): PersonalMediaViewSnapshot {
    const assignments: MonitorAssignmentRow[] = [];
    for (const [key, participantId] of this.assignments.entries()) {
      const identity = this.participants.get(participantId);
      if (!identity) continue;
      const colon = key.indexOf(":");
      assignments.push({
        target: { monitorId: key.slice(0, colon), slotId: key.slice(colon + 1) },
        identity,
      });
    }
    return {
      identities: Array.from(this.participants.values()),
      assignments,
      pinnedAudio: identityList(this.pinnedAudio, this.participants),
      mutedPeople: identityList(this.mutedAudio, this.participants),
      hiddenVideo: identityList(this.hiddenVideo, this.participants),
      removedPeople: identityList(this.removedFromView, this.participants),
      interactionTargetId: this.interactionTargetId,
    };
  }

  private commit(): void {
    this.snapshotCache = null;
    this.persist();
    for (const listener of this.listeners) listener();
  }
}

export function createPersonalMediaRouter(options?: PersonalMediaRouterOptions): PersonalMediaRouter {
  return new PersonalMediaRouter(options);
}

export const defaultPersonalMediaRouter = createPersonalMediaRouter();

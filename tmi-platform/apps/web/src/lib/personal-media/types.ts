/**
 * Personal Media Router — identity and destination types.
 *
 * LAW: one ParticipantMediaIdentity may appear as a 3D spatial pod + Monitor A
 * feed + pinned audio WITHOUT a new WebRTC session. This module never
 * re-acquires tracks. If no spatial pod runtime exists, spatialPodId stays
 * on the identity and is never faked into a pod.
 */

export type MonitorTarget = {
  monitorId: string;
  slotId: string;
};

export interface ParticipantMediaIdentity {
  participantId: string;
  canonicalIdentityId: string;
  roomId: string;
  videoTrackId: string | null;
  audioTrackId: string | null;
  spatialPodId: string | null;
  /** Optional UI label only. Never required for routing. */
  displayName?: string;
}

export const MONITOR_A_ID = "MONITOR_A";
export const MONITOR_B_ID = "MONITOR_B";

/** Default destinations. Slot ids stay strings so A/B split slots 1–4 need no rewrite. */
export const SLOT_MAIN = "slot-main";
export const SPLIT_SLOT_IDS = ["slot-1", "slot-2", "slot-3", "slot-4"] as const;
export type SplitSlotId = (typeof SPLIT_SLOT_IDS)[number];
export type MonitorSlotId = typeof SLOT_MAIN | SplitSlotId;

export const DEFAULT_MONITOR_A: MonitorTarget = {
  monitorId: MONITOR_A_ID,
  slotId: SLOT_MAIN,
};

export const DEFAULT_MONITOR_B: MonitorTarget = {
  monitorId: MONITOR_B_ID,
  slotId: SLOT_MAIN,
};

export function monitorSlotKey(target: MonitorTarget): string {
  return `${target.monitorId}:${target.slotId}`;
}

export function parseMonitorSlotKey(key: string): MonitorTarget {
  const idx = key.indexOf(":");
  if (idx <= 0) return { monitorId: key, slotId: SLOT_MAIN };
  return { monitorId: key.slice(0, idx), slotId: key.slice(idx + 1) };
}

/** Every addressable A/B slot (main + 1–4) without inventing extra monitors. */
export function listAddressableMonitorTargets(): MonitorTarget[] {
  const monitors = [MONITOR_A_ID, MONITOR_B_ID];
  const slots: MonitorSlotId[] = [SLOT_MAIN, ...SPLIT_SLOT_IDS];
  const targets: MonitorTarget[] = [];
  for (const monitorId of monitors) {
    for (const slotId of slots) {
      targets.push({ monitorId, slotId });
    }
  }
  return targets;
}

export const PERSONAL_MEDIA_LAW = [
  "Client-local curation only. Never mutates global room authority.",
  "Never kick, ban, globally mute, or remove anyone from the room.",
  "Never POST mute/kick to room APIs.",
  "Never subscribe/reconnect WebRTC. Identities already carry track IDs.",
  "One identity may be spatial pod + Monitor A/B + pinned audio with the same tracks.",
  "spatialPodId is stored; pods are not invented when no runtime exists.",
  "REMOVE FROM MY VIEW = hide local visual + mute locally + drop personal monitor assignments + clear local interaction target.",
  "PIN AUDIO never overrides safety, privacy, or explicit local mute.",
].join(" ");

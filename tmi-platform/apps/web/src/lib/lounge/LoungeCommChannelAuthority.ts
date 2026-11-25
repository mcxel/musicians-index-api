/**
 * Lounge communication channel authority.
 * Nearby / Room / Group / Direct — private channels must stop public mic publish.
 * Spatial attenuation uses panel/participant positions (no fan avatars in video lounges).
 */

export type LoungeCommChannel = "nearby" | "room" | "group" | "direct";

export type LoungePanelPosition = {
  participantId: string;
  /** Normalized panel layout X 0..1 */
  x: number;
  /** Normalized panel layout Y 0..1 */
  y: number;
};

export type LoungeMicPublishPlan = {
  channel: LoungeCommChannel;
  publishToProximity: boolean;
  publishToRoomAnnounce: boolean;
  publishToGroup: boolean;
  publishToDirect: boolean;
  reason: string;
};

export const LOUNGE_COMM_LABELS: Record<LoungeCommChannel, string> = {
  nearby: "Nearby — proximity voice",
  room: "Room — shared lounge chat",
  group: "Group — private group channel",
  direct: "Direct — one person",
};

/**
 * Proposed attenuation curve for certification demos (not a locked product constant).
 * distanceMeters at referenceScale ≈ panel euclidean * metersPerUnit.
 */
export function proximityVoiceLevel(
  listener: LoungePanelPosition,
  speaker: LoungePanelPosition,
  metersPerUnit = 8,
  maxMeters = 12,
): number {
  const dx = (listener.x - speaker.x) * metersPerUnit;
  const dy = (listener.y - speaker.y) * metersPerUnit;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const t = Math.min(1, Math.max(0, distance / maxMeters));
  // Smooth inverse falloff: ~84% at ~3m when maxMeters=12
  const level = 1 - t * 0.85;
  return Number(Math.max(0.05, level).toFixed(3));
}

export function planMicPublish(
  channel: LoungeCommChannel,
  opts?: { allowPublicWhilePrivate?: boolean },
): LoungeMicPublishPlan {
  const allowPublic = Boolean(opts?.allowPublicWhilePrivate);
  if (channel === "nearby") {
    return {
      channel,
      publishToProximity: true,
      publishToRoomAnnounce: false,
      publishToGroup: false,
      publishToDirect: false,
      reason: "Public proximity mic active",
    };
  }
  if (channel === "room") {
    return {
      channel,
      publishToProximity: false,
      publishToRoomAnnounce: true,
      publishToGroup: false,
      publishToDirect: false,
      reason: "Authorized room-wide voice only",
    };
  }
  if (channel === "group") {
    return {
      channel,
      publishToProximity: allowPublic,
      publishToRoomAnnounce: false,
      publishToGroup: true,
      publishToDirect: false,
      reason: allowPublic
        ? "Group voice + explicit public mic"
        : "Group voice only — public proximity mic stopped",
    };
  }
  return {
    channel,
    publishToProximity: allowPublic,
    publishToRoomAnnounce: false,
    publishToGroup: false,
    publishToDirect: true,
    reason: allowPublic
      ? "Direct voice + explicit public mic"
      : "Direct voice only — public proximity mic stopped",
  };
}

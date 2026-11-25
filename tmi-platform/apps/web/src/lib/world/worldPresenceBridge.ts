/**
 * World presence bridge — projection overlay on canonical occupancy.
 *
 * Occupancy / human seat assignment stay in audienceRuntimeEngine.
 * Geometry stays in tmiFanAvatarSeatAssignment.seatGeometryFromSeatId.
 * This module does NOT mint seats, viewer counts, or discovery tiles.
 *
 * World presence owns: WHERE this participant is, what world state they
 * are in, and what their avatar is doing. It does not own Daily, profile
 * identity, Foundry assets, or System D ranking.
 */

import {
  assignNextSeat,
  getVenueOccupancy,
  joinAudience,
  type AudienceMember,
} from "@/lib/live/audienceRuntimeEngine";
import { seatGeometryFromSeatId } from "@/lib/audience/tmiFanAvatarSeatAssignment";
import { seatFanAtPosition, setAudiencePresenceState } from "@/lib/audience/tmiAudienceSeatPresenceEngine";

export type WorldPresenceAction =
  | "IDLE"
  | "WALK"
  | "TURN"
  | "SIT_ENTER"
  | "SITTING_IDLE"
  | "SIT_EXIT"
  | "WAVE"
  | "CLAP"
  | "CHEER"
  | "EMOTE"
  | "DANCE";

export type WorldPresencePosture = "seated" | "standing" | "moving";

export type WorldPresenceVec3 = { x: number; y: number; z: number };

export type WorldPresencePublicPersona = {
  displayName: string;
  avatarUrl: string | null;
  appearanceVersion: string | null;
};

export type WorldPresenceSnapshot = {
  participantId: string;
  publicPersona: WorldPresencePublicPersona;
  roomId: string;
  seatId: string | null;
  posture: WorldPresencePosture;
  position: WorldPresenceVec3;
  rotation: WorldPresenceVec3;
  action: WorldPresenceAction;
  appearanceVersion: string | null;
  sequence: number;
  updatedAt: number;
  kind: "human" | "bot";
};

export type WorldPresenceCommand =
  | "SIT"
  | "STAND"
  | "MOVE"
  | "TURN"
  | "WAVE"
  | "CLAP"
  | "CHEER"
  | "EMOTE"
  | "DANCE"
  | "IDLE";

type Overlay = {
  participantId: string;
  roomId: string;
  posture: WorldPresencePosture;
  position?: WorldPresenceVec3;
  rotation?: WorldPresenceVec3;
  action: WorldPresenceAction;
  appearanceVersion: string | null;
  sequence: number;
  updatedAt: number;
};

const overlays = new Map<string, Overlay>();

function overlayKey(roomId: string, participantId: string): string {
  return `${roomId}::${participantId}`;
}

function isBot(member: AudienceMember): boolean {
  return member.role === "bot";
}

function defaultSeatedTransform(seatId: string): { position: WorldPresenceVec3; rotation: WorldPresenceVec3 } {
  const geo = seatGeometryFromSeatId(seatId);
  return {
    position: { x: geo.x, y: geo.y, z: geo.z },
    rotation: { x: geo.rotation.x, y: geo.rotation.y, z: geo.rotation.z },
  };
}

function standingOffset(seatId: string | null): WorldPresenceVec3 {
  if (!seatId) return { x: 0, y: 0, z: 0 };
  const seated = defaultSeatedTransform(seatId).position;
  return { x: seated.x, y: seated.y, z: seated.z - 0.45 };
}

function findActiveMember(roomId: string, participantId: string): AudienceMember | undefined {
  return getVenueOccupancy(roomId).members.find((m) => m.userId === participantId && m.active);
}

export function clearWorldPresence(roomId: string, participantId: string): void {
  overlays.delete(overlayKey(roomId, participantId));
}

export function resetWorldPresenceOverlaysForTests(): void {
  overlays.clear();
}

export function projectWorldPresence(
  member: AudienceMember,
  roomId: string,
): WorldPresenceSnapshot | null {
  if (!member.active) return null;
  const overlay = overlays.get(overlayKey(roomId, member.userId));
  const seatId = member.seatId;
  const posture: WorldPresencePosture =
    overlay?.posture ?? (seatId ? "seated" : "standing");
  const seatedTransform = seatId ? defaultSeatedTransform(seatId) : null;
  const position =
    posture === "seated"
      ? seatedTransform?.position ?? { x: 0, y: 0, z: 0 }
      : overlay?.position ?? (seatId ? standingOffset(seatId) : { x: 0, y: 0, z: 0 });
  const rotation =
    overlay?.rotation ?? seatedTransform?.rotation ?? { x: 0, y: 0, z: 0 };
  const action: WorldPresenceAction =
    overlay?.action ?? (posture === "seated" ? "SITTING_IDLE" : "IDLE");
  const appearanceVersion = overlay?.appearanceVersion ?? null;

  return {
    participantId: member.userId,
    publicPersona: {
      displayName: member.displayName,
      avatarUrl: member.avatarUrl ?? null,
      appearanceVersion,
    },
    roomId,
    seatId,
    posture,
    position,
    rotation,
    action,
    appearanceVersion,
    sequence: overlay?.sequence ?? 0,
    updatedAt: overlay?.updatedAt ?? member.joinedAt,
    kind: isBot(member) ? "bot" : "human",
  };
}

export function projectRoomWorldPresence(roomId: string): WorldPresenceSnapshot[] {
  const occ = getVenueOccupancy(roomId);
  const out: WorldPresenceSnapshot[] = [];
  for (const member of occ.members) {
    const snap = projectWorldPresence(member, roomId);
    if (snap) out.push(snap);
  }
  return out;
}

function writeOverlay(
  roomId: string,
  participantId: string,
  patch: Partial<Omit<Overlay, "participantId" | "roomId" | "sequence" | "updatedAt">> & {
    appearanceVersion?: string | null;
  },
): Overlay {
  const key = overlayKey(roomId, participantId);
  const prev = overlays.get(key);
  const next: Overlay = {
    participantId,
    roomId,
    posture: patch.posture ?? prev?.posture ?? "seated",
    position: patch.position ?? prev?.position,
    rotation: patch.rotation ?? prev?.rotation,
    action: patch.action ?? prev?.action ?? "IDLE",
    appearanceVersion:
      patch.appearanceVersion !== undefined
        ? patch.appearanceVersion
        : (prev?.appearanceVersion ?? null),
    sequence: (prev?.sequence ?? 0) + 1,
    updatedAt: Date.now(),
  };
  overlays.set(key, next);
  return next;
}

function syncPresenceLayer(
  roomId: string,
  participantId: string,
  seatId: string | null,
  command: WorldPresenceCommand,
): void {
  const state =
    command === "CLAP"
      ? "clapping"
      : command === "CHEER"
        ? "cheering"
        : command === "MOVE"
          ? "moving-closer"
          : command === "STAND"
            ? "leaving-seat"
            : "seated-idle";
  if (seatId) {
    const geo = seatGeometryFromSeatId(seatId);
    seatFanAtPosition(participantId, roomId, "free-back-row", geo);
  }
  setAudiencePresenceState(roomId, participantId, state);
}

export function applyWorldPresenceCommand(input: {
  roomId: string;
  participantId: string;
  command: WorldPresenceCommand;
  position?: WorldPresenceVec3;
  rotation?: WorldPresenceVec3;
  appearanceVersion?: string | null;
}): { ok: true; presence: WorldPresenceSnapshot } | { ok: false; error: string } {
  const member = findActiveMember(input.roomId, input.participantId);
  if (!member) {
    return { ok: false, error: "not_a_participant" };
  }

  let seatId = member.seatId;

  if (input.command === "SIT") {
    if (!seatId) {
      seatId = assignNextSeat(input.roomId);
      joinAudience(input.roomId, {
        userId: member.userId,
        displayName: member.displayName,
        role: member.role,
        seatId,
        avatarUrl: member.avatarUrl ?? null,
        groupId: member.groupId ?? null,
      });
    }
    writeOverlay(input.roomId, input.participantId, {
      posture: "seated",
      action: "SIT_ENTER",
      position: defaultSeatedTransform(seatId).position,
      rotation: input.rotation ?? defaultSeatedTransform(seatId).rotation,
      appearanceVersion: input.appearanceVersion,
    });
  } else if (input.command === "STAND") {
    writeOverlay(input.roomId, input.participantId, {
      posture: "standing",
      action: "SIT_EXIT",
      position: standingOffset(seatId),
      rotation: input.rotation,
      appearanceVersion: input.appearanceVersion,
    });
  } else if (input.command === "MOVE") {
    if (!input.position) {
      return { ok: false, error: "position_required" };
    }
    writeOverlay(input.roomId, input.participantId, {
      posture: "moving",
      action: "WALK",
      position: input.position,
      rotation: input.rotation,
      appearanceVersion: input.appearanceVersion,
    });
  } else if (input.command === "TURN") {
    writeOverlay(input.roomId, input.participantId, {
      posture: overlays.get(overlayKey(input.roomId, input.participantId))?.posture ?? (seatId ? "seated" : "standing"),
      action: "TURN",
      rotation: input.rotation,
      appearanceVersion: input.appearanceVersion,
    });
  } else if (input.command === "IDLE") {
    const posture =
      overlays.get(overlayKey(input.roomId, input.participantId))?.posture ?? (seatId ? "seated" : "standing");
    writeOverlay(input.roomId, input.participantId, {
      posture,
      action: posture === "seated" ? "SITTING_IDLE" : "IDLE",
      appearanceVersion: input.appearanceVersion,
    });
  } else {
    writeOverlay(input.roomId, input.participantId, {
      action: input.command,
      appearanceVersion: input.appearanceVersion,
      rotation: input.rotation,
      position: input.position,
    });
  }

  const latest = findActiveMember(input.roomId, input.participantId);
  if (!latest) return { ok: false, error: "not_a_participant" };
  syncPresenceLayer(input.roomId, input.participantId, latest.seatId, input.command);
  const presence = projectWorldPresence(latest, input.roomId);
  if (!presence) return { ok: false, error: "not_a_participant" };
  return { ok: true, presence };
}

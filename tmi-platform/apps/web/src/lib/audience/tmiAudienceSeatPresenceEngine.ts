import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";
import type { TmiFanSeatAssignment, TmiSeatPosition } from "@/lib/audience/tmiFanAvatarSeatAssignment";
import { assignSeatForFan } from "@/lib/audience/tmiFanAvatarSeatAssignment";

export type TmiAudiencePresenceState =
  | "seated-idle"
  | "watching-performer"
  | "cheering"
  | "clapping"
  | "voting"
  | "tipping"
  | "chatting"
  | "answering-trivia"
  | "spinning-reward-wheel"
  | "joining-cypher"
  | "moving-closer"
  | "front-row-upgrade"
  | "leaving-seat";

export type TmiSeatedAudiencePresence = {
  fanId: string;
  roomId: string;
  assignment: TmiFanSeatAssignment;
  state: TmiAudiencePresenceState;
  updatedAt: number;
};

const PRESENCE = new Map<string, TmiSeatedAudiencePresence>();

function key(roomId: string, fanId: string): string {
  return `${roomId}::${fanId}`;
}

export function joinAudienceSeat(
  fanId: string,
  roomId: string,
  tier: TmiSeatTier,
  seats: TmiSeatPosition[],
): TmiSeatedAudiencePresence | undefined {
  const assignment = assignSeatForFan(fanId, roomId, tier, seats);
  if (!assignment) return undefined;

  const presence: TmiSeatedAudiencePresence = {
    fanId,
    roomId,
    assignment,
    state: "seated-idle",
    updatedAt: Date.now(),
  };

  PRESENCE.set(key(roomId, fanId), presence);
  return presence;
}

export function setAudiencePresenceState(
  roomId: string,
  fanId: string,
  state: TmiAudiencePresenceState,
): TmiSeatedAudiencePresence | undefined {
  const current = PRESENCE.get(key(roomId, fanId));
  if (!current) return undefined;

  const next: TmiSeatedAudiencePresence = {
    ...current,
    state,
    updatedAt: Date.now(),
  };

  PRESENCE.set(key(roomId, fanId), next);
  return next;
}

export function getAudiencePresence(roomId: string, fanId: string): TmiSeatedAudiencePresence | undefined {
  return PRESENCE.get(key(roomId, fanId));
}

export function listAudiencePresence(roomId: string): TmiSeatedAudiencePresence[] {
  return [...PRESENCE.values()].filter((entry) => entry.roomId === roomId);
}

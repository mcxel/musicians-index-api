/**
 * Room authority port — PersonalMediaRouter must never call these.
 * REMOVE FROM MY VIEW is a local composite, not a kick/ban.
 */

export interface RoomAuthorityPort {
  kick(participantId: string): void;
  ban(participantId: string): void;
  globalMute(participantId: string): void;
  removeFromRoom(participantId: string): void;
}

export type RoomAuthorityCallCounts = {
  kick: number;
  ban: number;
  globalMute: number;
  removeFromRoom: number;
};

export function createCountingRoomAuthorityPort(): {
  port: RoomAuthorityPort;
  counts: RoomAuthorityCallCounts;
} {
  const counts: RoomAuthorityCallCounts = {
    kick: 0,
    ban: 0,
    globalMute: 0,
    removeFromRoom: 0,
  };
  return {
    counts,
    port: {
      kick() {
        counts.kick += 1;
      },
      ban() {
        counts.ban += 1;
      },
      globalMute() {
        counts.globalMute += 1;
      },
      removeFromRoom() {
        counts.removeFromRoom += 1;
      },
    },
  };
}

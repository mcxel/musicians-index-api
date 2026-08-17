/**
 * Injected media transport. PersonalMediaRouter must never call these for
 * local curation (assign, pin, mute, hide, remove-from-view, avatar move).
 * Tracks are already acquired by room authority.
 */

import type { ParticipantMediaIdentity } from "./types";

export interface PersonalMediaTransport {
  subscribe(identity: ParticipantMediaIdentity): void;
  reconnect(identity: ParticipantMediaIdentity, reason?: string): void;
  unsubscribe?(identity: ParticipantMediaIdentity): void;
}

export type MediaTransportCallCounts = {
  subscribe: number;
  reconnect: number;
  unsubscribe: number;
};

export function createCountingMediaTransport(): {
  transport: PersonalMediaTransport;
  counts: MediaTransportCallCounts;
} {
  const counts: MediaTransportCallCounts = { subscribe: 0, reconnect: 0, unsubscribe: 0 };
  return {
    counts,
    transport: {
      subscribe() {
        counts.subscribe += 1;
      },
      reconnect() {
        counts.reconnect += 1;
      },
      unsubscribe() {
        counts.unsubscribe += 1;
      },
    },
  };
}

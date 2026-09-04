/**
 * ParticipantQueueDirector — contract for mic/battle/challenge/game queues.
 */

export interface QueueParticipant {
  participantId: string;
  displayName: string;
  position: number;
  status: "WAITING" | "ON_DECK" | "ACTIVE" | "DONE" | "REMOVED";
}

export interface ParticipantQueueDirector {
  enqueue(participant: Omit<QueueParticipant, "position" | "status">): QueueParticipant;
  advance(): QueueParticipant | null;
  remove(participantId: string): void;
  list(): QueueParticipant[];
  active(): QueueParticipant | null;
}

export function createParticipantQueueDirector(): ParticipantQueueDirector {
  const items: QueueParticipant[] = [];

  function reindex() {
    items.forEach((p, i) => {
      p.position = i;
    });
  }

  return {
    enqueue(participant) {
      const row: QueueParticipant = {
        ...participant,
        position: items.length,
        status: "WAITING",
      };
      items.push(row);
      return row;
    },
    advance() {
      const current = items.find((p) => p.status === "ACTIVE");
      if (current) current.status = "DONE";
      const next = items.find((p) => p.status === "WAITING" || p.status === "ON_DECK");
      if (!next) return null;
      next.status = "ACTIVE";
      const onDeck = items.find((p) => p.status === "WAITING");
      if (onDeck) onDeck.status = "ON_DECK";
      return next;
    },
    remove(participantId) {
      const idx = items.findIndex((p) => p.participantId === participantId);
      if (idx >= 0) {
        items.splice(idx, 1);
        reindex();
      }
    },
    list() {
      return [...items];
    },
    active() {
      return items.find((p) => p.status === "ACTIVE") ?? null;
    },
  };
}

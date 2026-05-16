import type { QueueSlot } from "@/lib/live/queueEngine";

export type PerformerQueueState = "waiting" | "onDeck" | "live" | "complete";

export type PerformerQueueEntry = {
  slotId: string;
  performerId: string;
  performerName: string;
  state: PerformerQueueState;
  readyTimerEndsAt: number | null;
  lastStateAt: number;
  failedEntryCount: number;
};

export type PerformerQueueStateIndex = Record<string, PerformerQueueEntry>;

const READY_TIMER_MS = 1000 * 25;

function mapState(status: QueueSlot["status"]): PerformerQueueState {
  if (status === "on-stage") return "live";
  if (status === "next-up" || status === "staging") return "onDeck";
  if (status === "done") return "complete";
  return "waiting";
}

export function normalizePerformerQueueState(
  slots: QueueSlot[],
  prevIndex: PerformerQueueStateIndex = {},
  nowMs = Date.now(),
): PerformerQueueEntry[] {
  return slots.map((slot) => {
    const state = mapState(slot.status);
    const prev = prevIndex[slot.performerId];
    const stateChanged = !prev || prev.state !== state;
    const lastStateAt = stateChanged ? nowMs : prev.lastStateAt;
    const readyTimerEndsAt =
      state === "onDeck"
        ? stateChanged
          ? nowMs + READY_TIMER_MS
          : prev.readyTimerEndsAt
        : null;

    return {
      slotId: slot.slotId,
      performerId: slot.performerId,
      performerName: slot.performerName,
      state,
      readyTimerEndsAt,
      lastStateAt,
      failedEntryCount: prev?.failedEntryCount ?? 0,
    };
  });
}

export function toQueueStateIndex(entries: PerformerQueueEntry[]): PerformerQueueStateIndex {
  return entries.reduce<PerformerQueueStateIndex>((acc, entry) => {
    acc[entry.performerId] = entry;
    return acc;
  }, {});
}
